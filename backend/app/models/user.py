from sqlalchemy import Column, Integer, String, DateTime, Boolean
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.base import Base

#  SQLAlchemy Model (Database) 
class UserDB(Base):
    """Database model - represents users table in PostgreSQL"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#  Pydantic Models (API) 
class UserCreate(BaseModel):
    """Request model - create user"""
    email: str
    username: str
    password: str

class UserResponse(BaseModel):
    """Response model - user data"""
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True