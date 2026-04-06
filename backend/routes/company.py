"""
Company Routes
DEPRECATED: Company management is now handled through chat creation.
Companies are created automatically when admins create chats.
"""

from fastapi import APIRouter

# Create APIRouter for company endpoints (currently empty)
router = APIRouter(prefix="/companies", tags=["companies"])
