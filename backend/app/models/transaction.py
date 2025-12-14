from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime

Base = declarative_base()

# ==================== SQLAlchemy Model (Database) ====================
class TransactionDB(Base):
    """Database model - represents table in PostgreSQL"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    amount = Column(Float)
    merchant = Column(String)
    card_type = Column(String, nullable=True)
    is_fraud = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== Pydantic Model (API Request/Response) ====================
class Transaction(BaseModel):
    """API model - for request/response validation"""
    transaction_id: str
    amount: float
    merchant: str
    card_type: str = "credit"
    
    class Config:
        from_attributes = True  # Convert DB objects to Pydantic

class TransactionResponse(BaseModel):
    """API response model"""
    id: int
    transaction_id: str
    amount: float
    merchant: str
    is_fraud: bool
    risk_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dummy data (for testing without database)
transactions_db = [
    {"id": 1, "transaction_id": "TXN001", "amount": 100, "merchant": "Amazon", "is_fraud": False},
    {"id": 2, "transaction_id": "TXN002", "amount": 5000, "merchant": "Unknown", "is_fraud": True},
]