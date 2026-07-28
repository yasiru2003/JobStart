from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    employer = "employer"
    recruiter = "recruiter"
    candidate = "candidate"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.candidate


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
