"""
Chat Controller
Handles all chat-related business logic: create, list, and admin-specific operations.
Each admin can only have ONE chat assigned to ONE company.
"""

import secrets
import string
import jwt
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from datetime import datetime, timedelta, timezone

try:
    from jwt import ExpiredSignatureError, InvalidTokenError
except ModuleNotFoundError:
    ExpiredSignatureError = jwt.ExpiredSignatureError
    InvalidTokenError = jwt.InvalidTokenError

try:
    from backend.database.mongo import (
        chats_collection,
        documents_collection,
        companies_collection,
        users_collection,
        chat_access_requests_collection,
        chat_access_collection,
    )
    from backend.controller.cloudinary_utils import upload_document, delete_document_by_url
    from backend.rag_services.chroma_rag_service import (
        attach_document_url_to_chunks,
        delete_document_chunks,
        index_document_chunks,
        run_tenant_rag_workflow,
    )
    from backend.config import JWT_SECRET_KEY, JWT_ALGORITHM
except ModuleNotFoundError:
    from database.mongo import (
        chats_collection,
        documents_collection,
        companies_collection,
        users_collection,
        chat_access_requests_collection,
        chat_access_collection,
    )
    from controller.cloudinary_utils import upload_document, delete_document_by_url
    from rag_services.chroma_rag_service import (
        attach_document_url_to_chunks,
        delete_document_chunks,
        index_document_chunks,
        run_tenant_rag_workflow,
    )
    from config import JWT_SECRET_KEY, JWT_ALGORITHM

from .utils import serialize_id


CHAT_ACCESS_VERIFICATION_TOKEN_TTL_MINUTES = 10


def get_user_or_404(user_id: str) -> dict:
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = users_collection.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def assert_role(user: dict, role: str) -> None:
    if user.get("role") != role:
        raise HTTPException(status_code=403, detail=f"Only {role}s can perform this action")


def get_company_id_for_user(user_id: str) -> str | None:
    user = get_user_or_404(user_id)
    return user.get("company_id")


def get_chat_or_404(chat_id: str) -> dict:
    try:
        chat_object_id = ObjectId(chat_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")

    chat = chats_collection.find_one({"_id": chat_object_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat


def employee_has_approved_access(employee_id: str, chat_id: str) -> bool:
    """
    Verify the employee has an approved request and a granted access record for the chat.
    """
    approved_request = chat_access_requests_collection.find_one(
        {
            "chat_id": chat_id,
            "employee_id": employee_id,
            "status": "approved",
        }
    )
    if not approved_request:
        return False

    granted_access = chat_access_collection.find_one({"chat_id": chat_id, "employee_id": employee_id})
    return granted_access is not None


def generate_chat_access_code() -> str:
    # 6-character code that admins can share with employees.
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


def generate_unique_chat_access_code(max_attempts: int = 10) -> str:
    for _ in range(max_attempts):
        candidate = generate_chat_access_code()
        if not chats_collection.find_one({"chat_access_code": candidate}):
            return candidate

    raise HTTPException(status_code=500, detail="Unable to generate a unique access code")


def normalize_access_code(access_code: str | int) -> str:
    normalized = str(access_code).strip().upper()
    if len(normalized) != 6 or not normalized.isalnum():
        raise HTTPException(status_code=400, detail="Access code must be exactly 6 alphanumeric characters")
    return normalized


def hide_chat_token(chat: dict) -> dict:
    chat_data = serialize_id(chat)
    chat_data.pop("chat_token", None)
    chat_data.pop("chat_access_code", None)
    return chat_data


def ensure_chat_access_code(chat: dict) -> dict:
    """
    Ensure legacy chats always have a 6-character access code.
    """
    if chat.get("chat_access_code"):
        return chat

    generated_code = generate_unique_chat_access_code()
    chats_collection.update_one(
        {"_id": chat["_id"]},
        {"$set": {"chat_access_code": generated_code, "updated_at": datetime.utcnow()}},
    )
    chat["chat_access_code"] = generated_code
    return chat


def create_chat_logic(
    admin_id: str,
    company_name: str,
    document_name: str,
    file: UploadFile
) -> dict:
    """
    Create a chat for an admin with company details and document upload.
    Admin can only have ONE chat in the system.
    
    Args:
        admin_id: Admin user ObjectId as string
        company_name: Name of the company for this chat
        document_name: Name of the document to upload
        file: Document file from upload
        
    Returns:
        Created chat with embedded company and document details
        
    Raises:
        HTTPException: If validation fails or upload fails
    """
    admin_user = get_user_or_404(admin_id)
    assert_role(admin_user, "admin")
    
    # Check if admin already has a chat (one-per-admin constraint)
    existing_chat = chats_collection.find_one({"admin_id": admin_id})
    if existing_chat:
        raise HTTPException(
            status_code=409, 
            detail="Admin already has a chat. Only one chat per admin is allowed."
        )
    
    # Create or get company
    # First check if company with this name already exists
    company = companies_collection.find_one({"company_name": company_name})
    if not company:
        # Create new company
        company_data = {
            "company_name": company_name,
            "created_by": admin_id
        }
        company_result = companies_collection.insert_one(company_data)
        company_id = str(company_result.inserted_id)
    else:
        company_id = str(company["_id"])
    
    # Upload document to Cloudinary
    document_object_id = ObjectId()
    document_id = str(document_object_id)

    try:
        file_bytes = file.file.read()
        file.file.seek(0)

        chunk_count = index_document_chunks(
            document_id=document_id,
            company_id=company_id,
            document_name=document_name,
            uploaded_by=admin_id,
            document_url="",
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
        )

        file.file.seek(0)
        # upload document to Cloudinary and get URL
        document_url = upload_document(file)

        # Create document record in database
        document_record = {
            "_id": document_object_id,
            "document_name": document_name,
            "company_id": company_id,
            "uploaded_by": admin_id,
            "document_url": document_url,
            "rag_indexed": True,
            "rag_chunk_count": chunk_count,
            "created_at": datetime.utcnow(),
        }

        document_result = documents_collection.insert_one(document_record)
        document_id = str(document_result.inserted_id)
        attach_document_url_to_chunks(document_id, document_url)

        try:
            # Create chat record
            now = datetime.utcnow()
            chat_record = {
                "admin_id": admin_id,
                "company_id": company_id,
                "document_id": document_id,
                "chat_access_code": generate_unique_chat_access_code(),
                "created_at": now,
                "updated_at": now
            }

            result = chats_collection.insert_one(chat_record)
            chat_record["_id"] = str(result.inserted_id)

            return chat_record
        except Exception:
            documents_collection.delete_one({"_id": document_object_id})
            delete_document_chunks(document_id)
            raise
    except HTTPException:
        delete_document_chunks(document_id)
        raise
    except Exception as exc:
        delete_document_chunks(document_id)
        raise HTTPException(status_code=500, detail=f"Failed to create chat: {str(exc)}")
    finally:
        try:
            file.file.seek(0)
        except Exception:
            pass


def list_chats_for_user_logic(user_id: str, role: str) -> list[dict]:
    """
    List chats accessible to the current user.
    Admin sees their own chat. Employee sees approved chats.
    """
    if role == "admin":
        chats = chats_collection.find({"admin_id": user_id})
        return [hide_chat_token(chat) for chat in chats]

    if role == "employee":
        company_id = get_company_id_for_user(user_id)
        if not company_id:
            return []

        approved_chat_ids = [
            request.get("chat_id")
            for request in chat_access_requests_collection.find(
                {"employee_id": user_id, "status": "approved"},
                {"chat_id": 1},
            )
        ]
        if not approved_chat_ids:
            return []

        chats = chats_collection.find(
            {
                "$and": [
                    {"_id": {"$in": [ObjectId(chat_id) for chat_id in approved_chat_ids]}},
                    {"company_id": company_id},
                ]
            }
        )
        return [hide_chat_token(chat) for chat in chats]

    raise HTTPException(status_code=403, detail="Unsupported user role")


def get_chat_by_id(chat_id: str) -> dict:
    """
    Fetch single chat by ObjectId.
    
    Args:
        chat_id: Chat ObjectId as string
        
    Returns:
        Chat document or raises 404
    """
    return serialize_id(get_chat_or_404(chat_id))


def can_user_access_chat_logic(chat_id: str, user_id: str, role: str) -> bool:
    """
    Check whether user can access a chat.
    """
    chat = get_chat_or_404(chat_id)

    if role == "admin":
        return chat.get("admin_id") == user_id

    if role == "employee":
        user_company_id = get_company_id_for_user(user_id)
        if not user_company_id or chat.get("company_id") != user_company_id:
            return False

        return employee_has_approved_access(user_id, chat_id)

    return False


def get_chat_by_admin_id(admin_id: str) -> dict:
    """
    Fetch admin's chat (admin can only have one).
    
    Args:
        admin_id: Admin user ObjectId as string
        
    Returns:
        Chat document or raises 404
    """
    chat = chats_collection.find_one({"admin_id": admin_id})
    
    if not chat:
        raise HTTPException(status_code=404, detail="No chat found for this admin")
    
    chat = ensure_chat_access_code(chat)
    return serialize_id(chat)


def get_chat_token_by_admin_id(admin_id: str) -> dict:
    """
    Return access code for the admin's chat.
    """
    chat = chats_collection.find_one({"admin_id": admin_id})
    if not chat:
        raise HTTPException(status_code=404, detail="No chat found for this admin")

    chat = ensure_chat_access_code(chat)
    return {"chat_id": str(chat["_id"]), "access_code": chat["chat_access_code"]}


def verify_chat_access_code_logic(access_code: str | int) -> dict:
    """
    Validate an admin-provided access code and return the target chat id.
    """
    normalized = normalize_access_code(access_code)
    chat = chats_collection.find_one({"chat_access_code": normalized})
    if not chat:
        raise HTTPException(status_code=404, detail="Invalid access code")

    return {"chat_id": str(chat["_id"]), "admin_id": chat["admin_id"]}


def create_chat_access_verification_logic(
    employee_id: str,
    access_code: str | int,
) -> dict:
    """
    Verify access code and issue a short-lived verification token.
    """
    verification_data = verify_chat_access_code_logic(access_code)
    employee_user = get_user_or_404(employee_id)
    assert_role(employee_user, "employee")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=CHAT_ACCESS_VERIFICATION_TOKEN_TTL_MINUTES)
    verification_token_payload = {
        "sub": employee_id,
        "chat_id": verification_data["chat_id"],
        "type": "chat_access_verification",
        "exp": int(expires_at.timestamp()),
    }
    verification_token = jwt.encode(
        verification_token_payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "chat_id": verification_data["chat_id"],
        "verification_token": verification_token,
    }


def validate_chat_access_verification_logic(employee_id: str, chat_id: str, verification_token: str) -> None:
    """
    Validate verification token before creating an access request.
    """
    try:
        verification_payload = jwt.decode(
            verification_token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Verification token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid verification token")

    if verification_payload.get("type") != "chat_access_verification":
        raise HTTPException(status_code=401, detail="Invalid verification token type")

    if verification_payload.get("sub") != employee_id:
        raise HTTPException(status_code=403, detail="Verification token does not belong to current employee")

    if verification_payload.get("chat_id") != chat_id:
        raise HTTPException(status_code=400, detail="Verified chat does not match requested chat")


def request_chat_access_logic(employee_id: str, chat_id: str) -> dict:
    """
    Employee requests access to a specific chat.
    """
    employee_user = get_user_or_404(employee_id)
    assert_role(employee_user, "employee")

    try:
        chat_object_id = ObjectId(chat_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid chat ID format")

    chat = chats_collection.find_one({"_id": chat_object_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat_id = str(chat_object_id)
    admin_id = chat["admin_id"]

    already_granted = chat_access_collection.find_one({"chat_id": chat_id, "employee_id": employee_id})
    if already_granted:
        raise HTTPException(status_code=409, detail="Access already granted for this chat")

    now = datetime.utcnow()
    existing_request = chat_access_requests_collection.find_one(
        {"chat_id": chat_id, "employee_id": employee_id}
    )

    if existing_request and existing_request.get("status") == "pending":
        raise HTTPException(status_code=409, detail="Access request is already pending")

    if existing_request:
        chat_access_requests_collection.update_one(
            {"_id": existing_request["_id"]},
            {
                "$set": {
                    "status": "pending",
                    "requested_at": now,
                    "reviewed_at": None,
                    "reviewed_by": None,
                }
            },
        )
        refreshed = chat_access_requests_collection.find_one({"_id": existing_request["_id"]})
        return serialize_id(refreshed)

    request_doc = {
        "chat_id": chat_id,
        "admin_id": admin_id,
        "employee_id": employee_id,
        "status": "pending",
        "requested_at": now,
        "reviewed_at": None,
        "reviewed_by": None,
    }
    result = chat_access_requests_collection.insert_one(request_doc)
    request_doc["_id"] = str(result.inserted_id)
    return request_doc


def list_access_requests_for_admin_logic(admin_id: str, status_filter: str | None = "pending") -> list[dict]:
    """
    List chat access requests for an admin.
    """
    admin_user = get_user_or_404(admin_id)
    assert_role(admin_user, "admin")

    query = {"admin_id": admin_id}
    if status_filter:
        query["status"] = status_filter

    requests = chat_access_requests_collection.find(query).sort("requested_at", -1)
    return [serialize_id(request) for request in requests]


def review_access_request_logic(admin_id: str, request_id: str, action: str) -> dict:
    """
    Admin approves or denies employee chat access request.
    """
    admin_user = get_user_or_404(admin_id)
    assert_role(admin_user, "admin")

    try:
        request_obj_id = ObjectId(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request ID format")

    access_request = chat_access_requests_collection.find_one({"_id": request_obj_id})
    if not access_request:
        raise HTTPException(status_code=404, detail="Access request not found")

    if access_request.get("admin_id") != admin_id:
        raise HTTPException(status_code=403, detail="You can only review requests for your own chat")

    chat = get_chat_or_404(access_request["chat_id"])
    employee_user = get_user_or_404(access_request["employee_id"])

    if access_request.get("status") != "pending":
        raise HTTPException(status_code=409, detail="Only pending requests can be reviewed")

    now = datetime.utcnow()
    if action == "approve":
        users_collection.update_one(
            {"_id": ObjectId(access_request["employee_id"])},
            {"$set": {"company_id": chat.get("company_id")}},
        )
        chat_access_collection.update_one(
            {"chat_id": access_request["chat_id"], "employee_id": access_request["employee_id"]},
            {
                "$set": {
                    "chat_id": access_request["chat_id"],
                    "employee_id": access_request["employee_id"],
                    "admin_id": admin_id,
                    "granted_at": now,
                }
            },
            upsert=True,
        )
        new_status = "approved"
    elif action == "deny":
        new_status = "denied"
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'deny'")

    chat_access_requests_collection.update_one(
        {"_id": request_obj_id},
        {
            "$set": {
                "status": new_status,
                "reviewed_at": now,
                "reviewed_by": admin_id,
            }
        },
    )

    updated = chat_access_requests_collection.find_one({"_id": request_obj_id})
    return serialize_id(updated)


def ask_chat_logic(chat_id: str, user_id: str, role: str, question: str, top_k: int = 4) -> dict:
    """
    Answer a question using only the current chat's company-scoped policy document.
    """
    chat = get_chat_or_404(chat_id)

    if not can_user_access_chat_logic(chat_id, user_id, role):
        raise HTTPException(status_code=403, detail="You do not have access to this chat")

    company_id = chat.get("company_id")
    document_id = chat.get("document_id")
    if not company_id or not document_id:
        raise HTTPException(status_code=404, detail="Chat does not have a linked policy document")

    rag_result = run_tenant_rag_workflow(
        question=question,
        company_id=company_id,
        document_id=document_id,
        top_k=top_k,
    )
    matches = rag_result["matches"]
    answer = rag_result["answer"]

    sources = [
        {
            "chunk_id": match["chunk_id"],
            "document_id": match["document_id"],
            "document_name": match["document_name"],
            "document_url": match["document_url"],
            "chunk_index": match["chunk_index"],
            "excerpt": match["text"][:500],
            "score": match["score"],
        }
        for match in matches
    ]

    return {
        "chat_id": chat_id,
        "company_id": company_id,
        "document_id": document_id,
        "question": question,
        "answer": answer,
        "sources": sources,
    }


def delete_chat_logic(admin_id: str, chat_id: str) -> dict:
    """
    Delete a chat and all related resources.
    """
    admin_user = get_user_or_404(admin_id)
    assert_role(admin_user, "admin")

    chat = get_chat_or_404(chat_id)
    if chat.get("admin_id") != admin_id:
        raise HTTPException(status_code=403, detail="You can only delete your own chat")

    document_id = chat.get("document_id")
    document = None
    if document_id:
        document = documents_collection.find_one({"_id": ObjectId(document_id)})

    deleted_access_requests = chat_access_requests_collection.delete_many({"chat_id": chat_id})
    deleted_chat_access = chat_access_collection.delete_many({"chat_id": chat_id})

    if document_id:
        delete_document_chunks(document_id)

    document_url_deleted = False
    if document and document.get("document_url"):
        document_url_deleted = delete_document_by_url(document["document_url"])

    if document_id:
        documents_collection.delete_one({"_id": ObjectId(document_id)})

    chats_collection.delete_one({"_id": ObjectId(chat_id)})

    return {
        "chat_id": chat_id,
        "document_id": document_id or "",
        "message": "Chat deleted successfully",
        "deleted_access_requests": deleted_access_requests.deleted_count,
        "deleted_chat_access_links": deleted_chat_access.deleted_count,
        "deleted_document_url": document_url_deleted,
    }
