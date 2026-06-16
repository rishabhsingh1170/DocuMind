"""
User Controller
Handles all user-related business logic: create, list, validation operations.
"""

from bson import ObjectId
from fastapi import HTTPException, status, UploadFile

try:
    from backend.database.mongo import (
        users_collection,
        companies_collection,
        chats_collection,
        documents_collection,
        chat_access_requests_collection,
        chat_access_collection,
    )
    from backend.models.user_schema import UserCreate, UserResponse
    from backend.controller.cloudinary_utils import upload_profile_image, delete_profile_image_by_url, delete_document_by_url
    from backend.rag_services.chroma_rag_service import delete_document_chunks
except ModuleNotFoundError:
    from database.mongo import (
        users_collection,
        companies_collection,
        chats_collection,
        documents_collection,
        chat_access_requests_collection,
        chat_access_collection,
    )
    from models.user_schema import UserCreate, UserResponse
    from controller.cloudinary_utils import upload_profile_image, delete_profile_image_by_url, delete_document_by_url
    from rag_services.chroma_rag_service import delete_document_chunks

from .utils import serialize_id, hash_password


def create_user_logic(payload: UserCreate) -> dict:
    """
    Create a new user in database with password hashing.
    Validates email uniqueness. Company assignment is done by admin later.
    
    Args:
        payload: User creation data (company_id is optional)
        
    Returns:
        Created user with generated _id (password_hash included, password excluded)
        
    Raises:
        HTTPException: If email exists (409)
    """
    # Check email uniqueness
    existing_user = users_collection.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # mode="json" converts HttpUrl/EmailStr/Enum to plain serializable values (BSON-safe).
    created = payload.model_dump(mode="json", exclude={"password"})
    created["password_hash"] = hash_password(payload.password)

    result = users_collection.insert_one(created)
    created["_id"] = str(result.inserted_id)
    return created


def list_users_logic() -> list[dict]:
    """
    Fetch all users from database (excluding password_hash).
    
    Returns:
        List of all users with serialized _id
    """
    users = users_collection.find()
    response = []
    for user in users:
        user["_id"] = str(user["_id"])
        response.append(
            {
                "_id": user["_id"],
                "name": user["name"],
                "role": user["role"],
                "profile_url": user.get("profile_url"),
                "email": user["email"],
                "company_id": user.get("company_id"),  # May be None
            }
        )
    return response


def get_user_by_id(user_id: str) -> dict:
    """
    Fetch single user by ObjectId (excluding password_hash).
    
    Args:
        user_id: User ObjectId as string
        
    Returns:
        User document or raises 404
    """
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["_id"] = str(user["_id"])
    return {
        "_id": user["_id"],
        "name": user["name"],
        "role": user["role"],
        "profile_url": user.get("profile_url"),
        "email": user["email"],
        "company_id": user.get("company_id"),  # May be None
    }


def upload_user_profile_image(user_id: str, file: UploadFile) -> dict:
    """
    Upload profile image for a user to Cloudinary and update user record.
    
    Args:
        user_id: User ObjectId as string
        file: Image file from upload
        
    Returns:
        Updated user document with profile_url
        
    Raises:
        HTTPException: If user not found or upload fails
    """
    try:
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Upload image to Cloudinary
    profile_url = upload_profile_image(file)
    
    # Update user with new profile URL
    users_collection.update_one(
        {"_id": user_obj_id},
        {"$set": {"profile_url": profile_url}}
    )
    
    # Return updated user
    user["profile_url"] = profile_url
    user["_id"] = str(user["_id"])
    return {
        "_id": user["_id"],
        "name": user["name"],
        "role": user["role"],
        "profile_url": user["profile_url"],
        "email": user["email"],
        "company_id": user.get("company_id"),  # May be None
    }


def assign_user_to_company(user_id: str, company_id: str) -> dict:
    """
    Admin function to assign a user to a company after signup.
    This grants the user access to the chatbot for that company.
    
    Args:
        user_id: User ObjectId as string
        company_id: Company ObjectId as string
        
    Returns:
        Updated user document
        
    Raises:
        HTTPException: If user/company not found or invalid ID format
    """
    # Validate user exists
    try:
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate company exists
    try:
        company_obj_id = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
    
    company = companies_collection.find_one({"_id": company_obj_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Assign company to user
    users_collection.update_one(
        {"_id": user_obj_id},
        {"$set": {"company_id": str(company_obj_id)}}
    )
    
    # Return updated user
    updated_user = users_collection.find_one({"_id": user_obj_id})
    updated_user["_id"] = str(updated_user["_id"])
    return {
        "_id": updated_user["_id"],
        "name": updated_user["name"],
        "role": updated_user["role"],
        "email": updated_user["email"],
        "profile_url": updated_user.get("profile_url"),
        "company_id": updated_user.get("company_id"),
    }


def _delete_company_documents(company_id: str) -> dict:
    deleted_documents = 0
    deleted_document_urls = 0
    deleted_chunks = 0

    documents = list(documents_collection.find({"company_id": company_id}))
    for document in documents:
        document_id = str(document["_id"])
        delete_document_chunks(document_id)
        deleted_chunks += 1

        document_url = document.get("document_url")
        if document_url and delete_document_by_url(document_url):
            deleted_document_urls += 1

        documents_collection.delete_one({"_id": document["_id"]})
        deleted_documents += 1

    return {
        "deleted_documents": deleted_documents,
        "deleted_document_urls": deleted_document_urls,
        "deleted_chunks": deleted_chunks,
    }


def delete_current_user_account_logic(user_id: str) -> dict:
    """
    Delete the authenticated user's account and related records.

    Admin accounts also remove their chat, company documents, access records,
    and company association data.
    """
    try:
        user_obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = users_collection.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    removed_profile_image = False
    profile_url = user.get("profile_url")
    if profile_url:
        removed_profile_image = delete_profile_image_by_url(profile_url)

    deleted_access_requests = chat_access_requests_collection.delete_many({"employee_id": user_id}).deleted_count
    deleted_chat_access = chat_access_collection.delete_many({"employee_id": user_id}).deleted_count

    deleted_chats = 0
    deleted_documents = 0
    deleted_document_urls = 0
    deleted_chunks = 0
    deleted_company_records = 0

    company_id = user.get("company_id")

    if user.get("role") == "admin":
        admin_chats = list(chats_collection.find({"admin_id": user_id}))
        for chat in admin_chats:
            chat_id = str(chat["_id"])
            document_id = chat.get("document_id")

            chat_access_requests_collection.delete_many({"chat_id": chat_id})
            chat_access_collection.delete_many({"chat_id": chat_id})

            if document_id:
                delete_document_chunks(document_id)
                deleted_chunks += 1
                document = documents_collection.find_one({"_id": ObjectId(document_id)})
                if document:
                    document_url = document.get("document_url")
                    if document_url and delete_document_by_url(document_url):
                        deleted_document_urls += 1
                    documents_collection.delete_one({"_id": document["_id"]})
                    deleted_documents += 1

            chats_collection.delete_one({"_id": chat["_id"]})
            deleted_chats += 1

        if company_id:
            company_cleanup = _delete_company_documents(company_id)
            deleted_documents += company_cleanup["deleted_documents"]
            deleted_document_urls += company_cleanup["deleted_document_urls"]
            deleted_chunks += company_cleanup["deleted_chunks"]

            try:
                company_object_id = ObjectId(company_id)
                companies_collection.delete_one({"_id": company_object_id})
                deleted_company_records = 1
            except Exception:
                pass

            users_collection.update_many(
                {"company_id": company_id, "_id": {"$ne": user_obj_id}},
                {"$unset": {"company_id": ""}},
            )

    users_collection.delete_one({"_id": user_obj_id})

    return {
        "user_id": user_id,
        "message": "Account deleted successfully",
        "deleted_chats": deleted_chats,
        "deleted_documents": deleted_documents,
        "deleted_document_urls": deleted_document_urls,
        "deleted_chunks": deleted_chunks,
        "deleted_access_requests": deleted_access_requests,
        "deleted_chat_access": deleted_chat_access,
        "deleted_company_records": deleted_company_records,
        "removed_profile_image": removed_profile_image,
    }
