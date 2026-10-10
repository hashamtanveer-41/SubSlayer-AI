from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    createdAt: str
    provider: Optional[str] = "password"


class SignUpRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class AuthResponse(BaseModel):
    authenticated: bool
    user: Optional[UserProfile] = None
    sessionId: Optional[str] = None
    message: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    name: str = Field(min_length=1, max_length=128)


class ChangePasswordRequest(BaseModel):
    currentPassword: Optional[str] = None
    newPassword: str = Field(min_length=6, max_length=128)


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    code: Optional[str] = None


class GoogleConfigResponse(BaseModel):
    configured: bool
    clientId: Optional[str] = None
    authUrl: Optional[str] = None
