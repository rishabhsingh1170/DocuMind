from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime

try:
    from backend.models.common import ObjectIdStr
except ModuleNotFoundError:
    from models.common import ObjectIdStr


class ChatBase(BaseModel):
    admin_id: ObjectIdStr
    company_id: ObjectIdStr
    document_id: ObjectIdStr


class ChatCreate(ChatBase):
    pass


class ChatInDB(ChatBase):
    id: ObjectIdStr = Field(alias="_id")
    chat_access_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)


class ChatResponse(ChatInDB):
    chat_access_code: Optional[str] = None


class ChatAdminResponse(ChatResponse):
    chat_access_code: str


class AccessRequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    denied = "denied"


class ChatAccessRequestCreate(BaseModel):
    chat_id: ObjectIdStr
    verification_token: str


class ChatAccessCodeVerifyCreate(BaseModel):
    access_code: str | int

    @field_validator("access_code")
    @classmethod
    def validate_access_code(cls, value: str | int) -> str:
        normalized = str(value).strip().upper()
        if len(normalized) != 6 or not normalized.isalnum():
            raise ValueError("Access code must be exactly 6 alphanumeric characters")
        return normalized


class ChatAccessDecisionAction(str, Enum):
    approve = "approve"
    deny = "deny"


class ChatAccessDecision(BaseModel):
    action: ChatAccessDecisionAction


class ChatAccessRequestResponse(BaseModel):
    id: ObjectIdStr = Field(alias="_id")
    chat_id: ObjectIdStr
    admin_id: ObjectIdStr
    employee_id: ObjectIdStr
    status: AccessRequestStatus
    requested_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[ObjectIdStr] = None

    model_config = ConfigDict(populate_by_name=True)


class ChatTokenResponse(BaseModel):
    chat_id: ObjectIdStr
    access_code: str


class ChatSourceResponse(BaseModel):
    chunk_id: str
    document_id: ObjectIdStr
    document_name: str
    document_url: Optional[str] = None
    chunk_index: int
    excerpt: str
    score: float


class ChatAskRequest(BaseModel):
    question: str = Field(min_length=1)
    top_k: int = Field(default=4, ge=1, le=10)


class ChatAskResponse(BaseModel):
    chat_id: ObjectIdStr
    company_id: ObjectIdStr
    document_id: ObjectIdStr
    question: str
    answer: str
    sources: list[ChatSourceResponse]


class ChatDeleteResponse(BaseModel):
    chat_id: ObjectIdStr
    document_id: ObjectIdStr
    message: str


class ChatAccessCodeVerifyResponse(BaseModel):
    chat_id: ObjectIdStr
    verification_token: str


class ChatSchema(ChatCreate):
    pass
