"""
User Routes
Endpoints for user operations: list, profile image upload.
User creation now only happens via /auth/verify-otp-and-signup (OTP-protected).
"""

from fastapi import APIRouter, status, UploadFile, File

try:
    from backend.models.user_schema import UserResponse
    from backend.controller.user_controller import list_users_logic, upload_user_profile_image
except ModuleNotFoundError:
    from models.user_schema import UserResponse
    from controller.user_controller import list_users_logic, upload_user_profile_image

# Create APIRouter for user endpoints
router = APIRouter(prefix="/users", tags=["users"])


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
