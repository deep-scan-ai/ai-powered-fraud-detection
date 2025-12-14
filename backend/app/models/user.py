from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel, EmailStr
from datetime import datetime

Base = declarative_base()

# ==================== SQLAlchemy Model (Database) ====================
class UserDB(Base):
    """Database model - represents users table in PostgreSQL"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== Pydantic Models (API) ====================
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