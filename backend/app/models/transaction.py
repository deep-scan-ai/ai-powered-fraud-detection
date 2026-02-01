from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.models.base import Base         



# SQLAlchemy Model  →  maps to the "transactions" table

class TransactionDB(Base):
    __tablename__ = "transactions"

    id              = Column(Integer,  primary_key=True, index=True)
    transaction_id  = Column(String,   unique=True, index=True)
    user_id         = Column(String)
    amount          = Column(Float)
    location        = Column(String)
    device          = Column(String)
    timestamp       = Column(DateTime, default=datetime.utcnow)
    is_fraud        = Column(Boolean,  default=False)
    risk_score      = Column(Float,    default=0.0)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



# Pydantic Models  →  request / response validation

class Transaction(BaseModel):
    """Used when you need to accept a full transaction payload."""
    transaction_id: str
    user_id: str
    amount: float
    location: str = "Colombo"
    device: str = "mobile"

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """Returned by GET endpoints."""
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

# Auto-delete: remove transactions older than 3 months

async def delete_old_transactions(db: AsyncSession) -> int:
    """
    Deletes all transactions where created_at is older than 3 months.
    Returns the number of rows deleted.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=90)

    result = await db.execute(
        delete(TransactionDB).where(
            TransactionDB.created_at < cutoff_date
        )
    )
    await db.commit()

    deleted_count = result.rowcount
    print(f"🗑️  Auto-cleanup: deleted {deleted_count} transactions older than 3 months")
    return deleted_count


# Seed / Dummy Data  →  inserted on startup if table is empty
_now = datetime.utcnow()

transactions_db = [
    # {
    #     "transaction_id": "TXN001",
    #     "user_id": "U123",
    #     "amount": 100,
    #     "location": "Colombo",
    #     "device": "mobile",
    #     "timestamp": _now,
    #     "is_fraud": False,
    # },
    # {
    #     "transaction_id": "TXN002",
    #     "user_id": "U456",
    #     "amount": 5000,
    #     "location": "Unknown",
    #     "device": "desktop",
    #     "timestamp": _now,
    #     "is_fraud": True,
    # },
]