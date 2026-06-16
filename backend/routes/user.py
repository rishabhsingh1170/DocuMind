"""
User Routes
Endpoints for user operations: list, profile image upload.
User creation now only happens via /auth/verify-otp-and-signup (OTP-protected).
"""

import jwt
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    from jwt import ExpiredSignatureError, InvalidTokenError
except ModuleNotFoundError:
    ExpiredSignatureError = jwt.ExpiredSignatureError
    InvalidTokenError = jwt.InvalidTokenError

try:
    from backend.models.user_schema import UserResponse
    from backend.controller.user_controller import (
        list_users_logic,
        upload_user_profile_image,
        delete_current_user_account_logic,
    )
    from backend.config import JWT_SECRET_KEY, JWT_ALGORITHM
except ModuleNotFoundError:
    from models.user_schema import UserResponse
    from controller.user_controller import (
        list_users_logic,
        upload_user_profile_image,
        delete_current_user_account_logic,
    )
    from config import JWT_SECRET_KEY, JWT_ALGORITHM

# Create APIRouter for user endpoints
router = APIRouter(prefix="/users", tags=["users"])
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


@router.get("/", response_model=list[UserResponse])
def list_users():
    """
    Fetch all users (password_hash excluded).
    
    Returns:
        List of all users
    """
    return list_users_logic()


@router.post("/{user_id}/profile-image", response_model=UserResponse)
def upload_profile_image_endpoint(user_id: str, file: UploadFile = File(...)):
    """
    Upload and update user profile image.
    Stores image in Cloudinary and updates user record with image URL.
    
    Args:
        user_id: User ObjectId as string
        file: Image file (JPEG, PNG, WebP, GIF)
        
    Returns:
        Updated user with profile_url
        
    Raises:
        404: User not found
        400: Invalid user ID or file format
        500: Upload failed
    """
    return upload_user_profile_image(user_id, file)


@router.delete("/me")
def delete_my_account(current_user: dict = Depends(get_current_user_from_token)):
    """
    Delete the authenticated user's account and related records.
    """
    return delete_current_user_account_logic(current_user.get("sub"))
