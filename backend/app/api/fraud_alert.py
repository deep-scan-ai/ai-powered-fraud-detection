from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.fraud_alert import FraudAlertDB
from app.models.transaction import TransactionDB

router = APIRouter(prefix="/fraud-alerts", tags=["Fraud Alerts"])


# ---------- GET all fraud alerts ----------
@router.get("/")
async def get_all_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FraudAlertDB))
    return result.scalars().all()


# ---------- GET fraud alerts by user ----------
@router.get("/user/{user_id}")
async def get_alerts_by_user(user_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(FraudAlertDB)
        .join(TransactionDB)
        .where(TransactionDB.user_id == user_id)
    )

    result = await db.execute(stmt)
    return result.scalars().all()
