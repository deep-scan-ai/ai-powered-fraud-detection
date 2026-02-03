from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum as PyEnum
from app.models.base import Base

# Role Enum
class UserRole(str, PyEnum):
    """User role enumeration"""
    ADMIN = "admin"
    ANALYST = "analyst"
    USER = "user"
    PENDING = "pending"

#  SQLAlchemy Model (Database) 
class UserDB(Base):
    """Database model - represents users table in PostgreSQL"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True)
    display_name = Column(String, nullable=True)
    role = Column(String, default="pending")  # pending, user, analyst, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#  Pydantic Models (API) 
class UserCreate(BaseModel):
    """Request model - create user"""
    firebase_uid: str
    email: str
    username: str = None
    display_name: str = None
    id_token: str = None  # Optional for email/password signup, required for verification

class UserUpdate(BaseModel):
    """Request model - update user role"""
    role: str
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """Response model - user data"""
    id: int
    firebase_uid: str
    email: str
    username: str = None
    display_name: str = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str  # Firebase UID
    email: str
    role: str
    iat: int
    exp: int