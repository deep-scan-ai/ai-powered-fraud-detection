from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os

from app.config import settings
from app.database import engine, get_db
from app.models import TransactionDB, TransactionResponse, transactions_db
from app.models.transaction import Base

from app.api.fraud_alert import router as fraud_alert_router
from app.api.transactions import router as transactions_router


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

app.include_router(
    fraud_alert_router,
    prefix="/api",
    tags=["Fraud Alerts"]
)

app.include_router(
    transactions_router,
    prefix="/api",
    tags=["Transactions"]
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup Event - Initialize Database
@app.on_event("startup")
async def startup():
    if os.getenv("TESTING") == "true":
        print("⏭️  Skipping database initialization (testing mode)")
        return

    try:
        async with engine.begin() as conn:
            # await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")

        # Insert dummy data
        async with AsyncSession(engine) as session:
            result = await session.execute(select(TransactionDB))
            existing = result.scalars().all()
            if not existing:
                for tx_data in transactions_db:
                    tx = TransactionDB(
                        transaction_id=tx_data["transaction_id"],
                        user_id=tx_data["user_id"],
                        amount=tx_data["amount"],
                        location=tx_data["location"],
                        device=tx_data["device"],
                        timestamp=tx_data["timestamp"],
                        is_fraud=tx_data["is_fraud"],
                        risk_score=0.0 if not tx_data["is_fraud"] else 0.95
                    )
                    session.add(tx)
                await session.commit()
                print(" Dummy data inserted successfully")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("⏭️  Continuing without database")


# Health Check Endpoint
@app.get("/")
def home():
    return {
        "message": "AI Fraud Detection API is running 🚀",
        "version": settings.VERSION,
        "docs": "/docs"
    }


# Analyze Transaction Endpoint
@app.post("/api/analyze")
async def analyze_transaction(data: dict):
    """Analyze a transaction for fraud"""
    amount = data.get("amount", 0)
    risk_score = 0.95 if amount > 50000 else 0.05
    flagged = risk_score > settings.FRAUD_THRESHOLD

    return {
        "transaction_id": data.get("transaction_id"),
        "risk_score": risk_score,
        "flagged": flagged
    }


def start():
    """Start the application"""
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)