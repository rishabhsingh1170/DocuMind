from enum import Enum
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional

try:
    from backend.models.common import ObjectIdStr
except ModuleNotFoundError:
    from models.common import ObjectIdStr


class UserRole(str, Enum):
    admin = "admin"
    employee = "employee"


class UserBase(BaseModel):
    name: str
    role: UserRole
    profile_url: Optional[str] = None

    @field_validator("profile_url", mode="before")
    @classmethod
    def normalize_profile_url(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(min_length=8)
    company_id: Optional[ObjectIdStr] = None

    @field_validator("company_id", mode="before")
    @classmethod
    def normalize_company_id(cls, value):
        if isinstance(value, str) and not value.strip():
            return None
        return value


class UserInDB(UserBase):
    id: ObjectIdStr = Field(alias="_id")
    email: EmailStr
    company_id: Optional[ObjectIdStr] = None
    password_hash: str

    model_config = ConfigDict(populate_by_name=True)


class UserResponse(UserBase):
    id: ObjectIdStr = Field(alias="_id")
    email: EmailStr
    company_id: Optional[ObjectIdStr] = None

    model_config = ConfigDict(populate_by_name=True)
