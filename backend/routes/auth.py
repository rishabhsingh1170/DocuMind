"""
Auth Routes
Endpoints for authentication: signup, login.
"""

from fastapi import APIRouter, status
from pydantic import BaseModel, EmailStr, Field, field_validator

try:
    from backend.controller.auth_controller import (
        login_logic,
        send_otp_logic,
        verify_otp_and_signup_logic,
        send_forgot_password_otp_logic,
        reset_password_with_otp_logic,
    )
    from backend.models.user_schema import UserCreate
    from backend.models.otp_schema import OTPCreate
except ModuleNotFoundError:
    from controller.auth_controller import (
        login_logic,
        send_otp_logic,
        verify_otp_and_signup_logic,
        send_forgot_password_otp_logic,
        reset_password_with_otp_logic,
    )
    from models.user_schema import UserCreate
    from models.otp_schema import OTPCreate

# Create APIRouter for auth endpoints
router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    """Request body for login endpoint."""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Request body for signup endpoint with mandatory OTP verification."""
    email: EmailStr
    otp: str
    name: str
    password: str
    role: str
    profile_url: str = None
    company_id: str = None


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    """
    Register a new user only after OTP verification.

    Args:
        payload: Signup payload including OTP

    Returns:
        Auth response with access token and user details
    """
    user_create = UserCreate(
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role,
        profile_url=payload.profile_url,
        company_id=payload.company_id,
    )
    return verify_otp_and_signup_logic(payload.email, payload.otp, user_create)


@router.post("/login")
def login(payload: LoginRequest):
    """
    Authenticate user with email and password.
    Verifies credentials against stored bcrypt hash.
    
    Args:
        payload: Login credentials (email, password)
        
    Returns:
        Auth response with access token and user details
        
    Raises:
        401: Invalid email or password
    """
    return login_logic(payload.email, payload.password)


@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(payload: OTPCreate):
    """
    Send OTP to email address for signup verification.
    
    Args:
        payload: Email address to send OTP to
        
    Returns:
        Response with message and OTP expiration time
        
    Raises:
        409: Email already registered
        500: Failed to send email
    """
    return send_otp_logic(payload.email)


class VerifyOTPAndSignupRequest(BaseModel):
    """Request body for OTP verification and signup."""
    email: EmailStr
    otp: str
    name: str
    password: str
    role: str
    profile_url: str = None
    company_id: str = None


class ForgotPasswordResetRequest(BaseModel):
    """Request body for verifying OTP and resetting password."""
    email: EmailStr
    otp: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password", mode="before")
    @classmethod
    def validate_new_password_no_spaces(cls, value):
        if isinstance(value, str) and any(character.isspace() for character in value):
            raise ValueError("Password must not contain spaces")
        return value


@router.post("/verify-otp-and-signup", status_code=status.HTTP_201_CREATED)
def verify_otp_and_signup(payload: VerifyOTPAndSignupRequest):
    """
    Verify OTP and complete user signup.
    
    Args:
        payload: Email, OTP, and user signup details (name, password, role)
        
    Returns:
        Auth response with JWT access token and user details
        
    Raises:
        400: Invalid or expired OTP
        409: Email already registered
    """
    # Convert request to UserCreate
    user_create = UserCreate(
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role,
        profile_url=payload.profile_url,
        company_id=payload.company_id
    )
    
    return verify_otp_and_signup_logic(payload.email, payload.otp, user_create)


@router.post("/forgot-password/send-otp", status_code=status.HTTP_200_OK)
def send_forgot_password_otp(payload: OTPCreate):
    """
    Send OTP for forgot-password flow.

    Args:
        payload: Email to receive reset OTP

    Returns:
        Response with message and OTP expiration time
    """
    return send_forgot_password_otp_logic(payload.email)


@router.post("/forgot-password/reset", status_code=status.HTTP_200_OK)
def reset_password_with_otp(payload: ForgotPasswordResetRequest):
    """
    Verify OTP and reset password.

    Args:
        payload: Email, OTP and new password

    Returns:
        Password reset success response
    """
    return reset_password_with_otp_logic(
        email=payload.email,
        otp=payload.otp,
        new_password=payload.new_password,
    )
