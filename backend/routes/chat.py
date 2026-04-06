"""
Chat Routes
Endpoints for chat operations: create, list, retrieve.
Admin-only endpoint for creating chats with company details and document upload.
"""

import jwt
from fastapi import APIRouter, status, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    from jwt import ExpiredSignatureError, InvalidTokenError
except ModuleNotFoundError:
    ExpiredSignatureError = jwt.ExpiredSignatureError
    InvalidTokenError = jwt.InvalidTokenError

try:
    from backend.models.chat_schema import (
        ChatAdminResponse,
        ChatResponse,
        ChatAccessRequestCreate,
        ChatAccessDecision,
        ChatAccessRequestResponse,
        ChatTokenResponse,
        ChatAccessCodeVerifyCreate,
        ChatAccessCodeVerifyResponse,
        ChatAskRequest,
        ChatAskResponse,
        ChatDeleteResponse,
    )
    from backend.controller.chat_controller import (
        create_chat_logic,
        list_chats_for_user_logic,
        get_chat_by_id,
        get_chat_by_admin_id,
        can_user_access_chat_logic,
        get_chat_token_by_admin_id,
        create_chat_access_verification_logic,
        validate_chat_access_verification_logic,
        request_chat_access_logic,
        list_access_requests_for_admin_logic,
        review_access_request_logic,
        ask_chat_logic,
        delete_chat_logic,
    )
    from backend.config import JWT_SECRET_KEY, JWT_ALGORITHM
except ModuleNotFoundError:
    from models.chat_schema import (
        ChatAdminResponse,
        ChatResponse,
        ChatAccessRequestCreate,
        ChatAccessDecision,
        ChatAccessRequestResponse,
        ChatTokenResponse,
        ChatAccessCodeVerifyCreate,
        ChatAccessCodeVerifyResponse,
        ChatAskRequest,
        ChatAskResponse,
        ChatDeleteResponse,
    )
    from controller.chat_controller import (
        create_chat_logic,
        list_chats_for_user_logic,
        get_chat_by_id,
        get_chat_by_admin_id,
        can_user_access_chat_logic,
        get_chat_token_by_admin_id,
        create_chat_access_verification_logic,
        validate_chat_access_verification_logic,
        request_chat_access_logic,
        list_access_requests_for_admin_logic,
        review_access_request_logic,
        ask_chat_logic,
        delete_chat_logic,
    )
    from config import JWT_SECRET_KEY, JWT_ALGORITHM

# Create APIRouter for chat endpoints
router = APIRouter(prefix="/chats", tags=["chats"])
bearer_scheme = HTTPBearer(auto_error=True)


def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Decode bearer token and return JWT claims.
    Validates token signature, expiry, and has required claims.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return payload


@router.post("/create", response_model=ChatAdminResponse, status_code=status.HTTP_201_CREATED)
def create_chat_endpoint(
    company_name: str = Form(...),
    document_name: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Create a new chat for an admin with company details and document upload.
    Admin can only create ONE chat in the system.
    
    Args:
        company_name: Name of the company for this chat
        document_name: Name of the document to upload
        file: Document file to upload (PDF, DOCX, XLSX, PPTX, TXT, etc.)
        current_user: JWT token payload from Authorization header
        
    Returns:
        Created chat with admin_id, company_id, document_id, and timestamps
        
    Raises:
        401: Missing/invalid/expired authentication token
        403: User is not an admin
        409: Admin already has a chat (only one per admin allowed)
        404: Admin user not found
        400: Invalid admin ID or file format
        500: Upload failed
    """
    # Verify user is an admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create chats")
    
    admin_id = current_user.get("sub")
    
    return create_chat_logic(admin_id, company_name, document_name, file)


@router.get("/", response_model=list[ChatResponse])
def list_chats(current_user: dict = Depends(get_current_user_from_token)):
    """
    Fetch chats accessible to the authenticated user.
    
    Returns:
        Admin: own chat
        Employee: approved chats
    """
    return list_chats_for_user_logic(current_user.get("sub"), current_user.get("role"))


@router.get("/admin/me", response_model=ChatAdminResponse)
def get_my_chat(current_user: dict = Depends(get_current_user_from_token)):
    """
    Fetch the authenticated admin's chat.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    admin_id = current_user.get("sub")
    return get_chat_by_admin_id(admin_id)


@router.get("/admin/access-code", response_model=ChatTokenResponse)
def get_my_chat_token(current_user: dict = Depends(get_current_user_from_token)):
    """
    Get chat sharing access code for the authenticated admin.
    Admin shares this code with employees.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    return get_chat_token_by_admin_id(current_user.get("sub"))


@router.post("/access/verify-code", response_model=ChatAccessCodeVerifyResponse)
def verify_chat_access_code(
    payload: ChatAccessCodeVerifyCreate,
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Employee verifies an admin-shared access code before requesting access.
    Returns a short-lived verification token tied to employee + chat.
    """
    if current_user.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Only employees can verify access code")

    return create_chat_access_verification_logic(
        employee_id=current_user.get("sub"),
        access_code=payload.access_code,
    )


@router.post("/access/request", response_model=ChatAccessRequestResponse, status_code=status.HTTP_201_CREATED)
def request_chat_access(
    payload: ChatAccessRequestCreate,
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Employee requests chat access after verifying an admin-shared access code.
    """
    if current_user.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request chat access")

    validate_chat_access_verification_logic(
        employee_id=current_user.get("sub"),
        chat_id=payload.chat_id,
        verification_token=payload.verification_token,
    )

    return request_chat_access_logic(current_user.get("sub"), payload.chat_id)


@router.get("/access/requests", response_model=list[ChatAccessRequestResponse])
def list_access_requests(
    status_filter: str = Query("pending", alias="status"),
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Admin lists employee access requests for their chat.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    return list_access_requests_for_admin_logic(current_user.get("sub"), status_filter)


@router.post("/access/requests/{request_id}/decision", response_model=ChatAccessRequestResponse)
def review_access_request(
    request_id: str,
    payload: ChatAccessDecision,
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Admin approves or denies an employee access request.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    return review_access_request_logic(current_user.get("sub"), request_id, payload.action.value)


@router.get("/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: str, current_user: dict = Depends(get_current_user_from_token)):
    """
    Fetch a specific chat by ID.
    
    Args:
        chat_id: Chat ObjectId as string
        
    Returns:
        Chat details
        
    Raises:
        404: Chat not found
        400: Invalid chat ID format
    """
    role = current_user.get("role")
    user_id = current_user.get("sub")
    if not can_user_access_chat_logic(chat_id, user_id, role):
        raise HTTPException(status_code=403, detail="You do not have access to this chat")

    chat = get_chat_by_id(chat_id)
    if role == "employee":
        chat.pop("chat_token", None)
        chat.pop("chat_access_code", None)
    return chat


@router.post("/{chat_id}/ask", response_model=ChatAskResponse)
def ask_chat(
    chat_id: str,
    payload: ChatAskRequest,
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Ask the chat bot a question about the linked policy document.
    """
    return ask_chat_logic(
        chat_id=chat_id,
        user_id=current_user.get("sub"),
        role=current_user.get("role"),
        question=payload.question,
        top_k=payload.top_k,
    )


@router.delete("/{chat_id}", response_model=ChatDeleteResponse)
def delete_chat(
    chat_id: str,
    current_user: dict = Depends(get_current_user_from_token),
):
    """
    Delete an admin's chat and all related resources.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete chats")

    return delete_chat_logic(current_user.get("sub"), chat_id)
