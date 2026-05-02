from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    org_name: str
    role: UserRole = UserRole.NGO

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    org_name: Optional[str] = None
    notification_prefs: Optional[Dict[str, Any]] = None
    coverage_area: Optional[Dict[str, Any]] = None

class UserRead(UserBase):
    id: UUID
    notification_prefs: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TokenWithRefresh(Token):
    refresh_token: str
