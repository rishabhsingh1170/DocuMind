"""
Document Routes
Endpoints for document viewing: list documents.
Document creation and upload now only happen via /chats/create endpoint.
"""

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    from jwt import ExpiredSignatureError, InvalidTokenError
except ModuleNotFoundError:
    ExpiredSignatureError = jwt.ExpiredSignatureError
    InvalidTokenError = jwt.InvalidTokenError

try:
    from backend.models.document_schema import DocumentResponse
    from backend.controller.document_controller import list_documents_logic
    from backend.config import JWT_SECRET_KEY, JWT_ALGORITHM
except ModuleNotFoundError:
    from models.document_schema import DocumentResponse
    from controller.document_controller import list_documents_logic
    from config import JWT_SECRET_KEY, JWT_ALGORITHM

# Create APIRouter for document endpoints
router = APIRouter(prefix="/documents", tags=["documents"])
bearer_scheme = HTTPBearer(auto_error=True)


def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
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


@router.get("/", response_model=list[DocumentResponse])
def list_documents(current_user: dict = Depends(get_current_user_from_token)):
    """
    Fetch all documents.
    
    Returns:
        List of all documents
    """
    company_id = current_user.get("company_id")
    user_id = current_user.get("sub")
    return list_documents_logic(company_id=company_id, uploaded_by=user_id)
