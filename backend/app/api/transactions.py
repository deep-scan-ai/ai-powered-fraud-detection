from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from datetime import datetime
import uuid

from app.database import get_db
from app.models.transaction import TransactionDB, TransactionResponse
from app.models.fraud_alert import FraudAlertDB

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# ---------- Request Schema ----------
class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    location: str
    device: str


# ---------- Response Schema ----------
class TransactionCreateResponse(BaseModel):
    message: str
    transaction_id: str
    risk_score: float
    is_fraud: bool


# ---------- Risk scoring (inline until fraud_detector is ready) ----------
def _calculate_risk(amount: float) -> float:
    """
    Temporary rule-based risk score.
    Replace the body with: return detect_fraud(amount)
    once the fraud_detector service is done.
    """
    return 0.95 if amount > 50000 else 0.05


# GET /api/transactions          → list all (with pagination)

@router.get("/", response_model=list[TransactionResponse])
async def get_transactions(
    skip: int = Query(default=0, ge=0, description="Records to skip"),
    limit: int = Query(default=10, ge=1, le=100, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TransactionDB)
        .order_by(TransactionDB.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()



# GET /api/transactions/stats    → fraud statistics

@router.get("/stats")
async def get_transaction_stats(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(
        select(func.count()).select_from(TransactionDB)
    )

    fraud = await db.scalar(
        select(func.count()).select_from(TransactionDB).where(
            TransactionDB.is_fraud == True
        )
    )

    fraud_rate = round(fraud / total, 4) if total else 0.0

    return {
        "total_transactions": total,
        "fraud_transactions": fraud,
        "legitimate_transactions": total - fraud,
        "fraud_rate": fraud_rate,
    }



# GET /api/transactions/{transaction_id}  → single transaction

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction_by_id(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TransactionDB).where(
            TransactionDB.transaction_id == transaction_id
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction



# POST /api/transactions         → create + fraud check

@router.post("/", response_model=TransactionCreateResponse)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    # 1. Build the row
    transaction = TransactionDB(
        transaction_id=str(uuid.uuid4()),
        user_id=data.user_id,
        amount=data.amount,
        location=data.location,
        device=data.device,
        timestamp=datetime.utcnow(),
    )

    # 2. Score it
    risk_score = _calculate_risk(data.amount)
    transaction.risk_score = risk_score
    transaction.is_fraud = risk_score > 0.8

    # 3. Save transaction first, get its PK
    db.add(transaction)
    await db.flush()

    # 4. If fraud, create alert in the SAME db transaction
    if transaction.is_fraud:
        alert = FraudAlertDB(
            transaction_id=transaction.id,
            reason="High risk transaction detected",
            severity="HIGH",
        )
        db.add(alert)

    # 5. Commit both together
    await db.commit()
    await db.refresh(transaction)

    return {
        "message": "Transaction created",
        "transaction_id": transaction.transaction_id,
        "risk_score": risk_score,
        "is_fraud": transaction.is_fraud,
    }