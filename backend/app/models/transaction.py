from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime

Base = declarative_base()

# SQLAlchemy Model (Database)
class TransactionDB(Base):
    """Database model - represents table in PostgreSQL"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    user_id = Column(String)
    amount = Column(Float)
    location = Column(String)
    device = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_fraud = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Model (API Request/Response)
class Transaction(BaseModel):
    """API model - for request/response validation"""
    transaction_id: str
    user_id: str
    amount: float
    location: str = "Colombo"
    device: str = "mobile"
    
    class Config:
        from_attributes = True  # Convert DB objects to Pydantic

class TransactionResponse(BaseModel):
    """API response model"""
    id: int
    transaction_id: str
    user_id: str
    amount: float
    location: str
    device: str
    timestamp: datetime
    is_fraud: bool
    risk_score: float
    
    class Config:
        from_attributes = True

# Dummy data (for testing without database)
transactions_db = [
    {"id": 1, "transaction_id": "TXN001", "user_id": "U123", "amount": 100, "location": "Colombo", "device": "mobile", "timestamp": datetime.utcnow(), "is_fraud": False},
    {"id": 2, "transaction_id": "TXN002", "user_id": "U456", "amount": 5000, "location": "Unknown", "device": "desktop", "timestamp": datetime.utcnow(), "is_fraud": True},
]