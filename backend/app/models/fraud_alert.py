from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel
from datetime import datetime
from app.models.base import Base
from app.models import user, transaction, fraud_alert  # Import ALL models


# SQLAlchemy Model (Database)
class FraudAlertDB(Base):
    """Database model - represents fraud_alerts table in PostgreSQL"""
    __tablename__ = "fraud_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, index=True)
    reason = Column(String)
    severity = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models (API)
class FraudAlertCreate(BaseModel):
    """Request model - create fraud alert"""
    transaction_id: str
    reason: str
    severity: str

class FraudAlertResponse(BaseModel):
    """Response model - fraud alert data"""
    id: int
    transaction_id: str
    reason: str
    severity: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dummy data (for testing without database)
fraud_alerts_db = [
    {
        "id": 1,
        "transaction_id": "TXN002",
        "reason": "Unusual location",
        "severity": "high",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": 2,
        "transaction_id": "TXN003",
        "reason": "Large amount",
        "severity": "medium",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]

async def init_db(conn):
    """Initialize the database - create tables"""
    await conn.run_sync(Base.metadata.create_all)