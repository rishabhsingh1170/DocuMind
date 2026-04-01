"""
Auth Controller
Handles authentication logic: signup, login, password verification, JWT generation.
"""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException

try:
    from backend.database.mongo import users_collection
    from backend.models.user_schema import UserCreate
    from backend.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRES_MINUTES
    from backend.controller.email_utils import send_otp_email, verify_otp
except ModuleNotFoundError:
    from database.mongo import users_collection
    from models.user_schema import UserCreate
    from config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRES_MINUTES
    from controller.email_utils import send_otp_email, verify_otp

from .utils import verify_password, hash_password


def _create_access_token(user_id: str, email: str, role: str, company_id: str = None) -> str:
    """
    Build a signed JWT access token for authenticated sessions.
    company_id is optional as it will be assigned by admin after signup.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRES_MINUTES),
    }
    # Add company_id only if provided
    if company_id:
        payload["company_id"] = company_id
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _build_auth_response(user: dict, message: str) -> dict:
    """
    Build a standard auth response with JWT and user profile data.
    """
    user_id = str(user["_id"])
    company_id = user.get("company_id")  # May be None for newly registered users
    access_token = _create_access_token(
        user_id=user_id,
        email=user["email"],
        role=user["role"],
        company_id=company_id,
    )

    return {
        "message": message,
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRES_MINUTES * 60,
        "user": {
            "_id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "company_id": company_id,
            "profile_url": user.get("profile_url"),
        },
    }


def signup_logic(payload: UserCreate) -> dict:
    """
    Register a new user without mandatory company assignment.
    Admin will assign the user to a company after signup.

    Raises:
        HTTPException: 409 if email already registered
    """
    existing_user = users_collection.find_one({"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    created = payload.model_dump(mode="json", exclude={"password"})
    created["password_hash"] = hash_password(payload.password)

    result = users_collection.insert_one(created)
    created["_id"] = str(result.inserted_id)
    return _build_auth_response(created, "Signup successful")


def login_logic(email: str, password: str) -> dict:
    """
    Authenticate user with email and password.
    Verifies credentials against stored bcrypt hash.
    
    Args:
        email: User email
        password: Plain-text password
        
    Returns:
        Login response with user details
        
    Raises:
        HTTPException: 401 if credentials invalid
    """
    # Find user by email
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password against stored hash
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return _build_auth_response(user, "Login successful")


def send_otp_logic(email: str) -> dict:
    """
    Send OTP to email for verification during signup.
    
    Args:`
        email: Email address to send OTP to
        
    Returns:
        Response with message and expiration time
        
    Raises:
        HTTPException: If email already registered or sending fails
    """
    # Check if email already registered
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    try:
        result = send_otp_email(email)
        return {
            "message": result["message"],
            "email": email,
            "expires_in": result["expiration_minutes"] * 60
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")


def verify_otp_and_signup_logic(email: str, otp: str, payload: UserCreate) -> dict:
    """
    Verify OTP and complete user signup.
    
    Args:
        email: Email to verify
        otp: OTP code
        payload: User creation data
        
    Returns:
        Auth response with JWT and user details
        
    Raises:
        HTTPException: If OTP invalid, expired, or signup fails
    """
    # First verify the OTP
    try:
        verify_otp(email, otp)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Email verified, now create user
    # Check if email was already registered in the meantime
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Validate email matches
    if payload.email != email:
        raise HTTPException(status_code=400, detail="Email mismatch")
    
    # Create user
    created = payload.model_dump(mode="json", exclude={"password"})
    created["password_hash"] = hash_password(payload.password)
    
    result = users_collection.insert_one(created)
    created["_id"] = str(result.inserted_id)
    
    return _build_auth_response(created, "Signup successful.")
