from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pandas as pd

from app.config import settings
from app.database import engine, get_db
from app.models import TransactionDB, Transaction, TransactionResponse, transactions_db
from app.models.transaction import Base

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG
)

# ==================== CORS Configuration ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Startup Event ====================
@app.on_event("startup")
async def startup():
    if os.getenv("TESTING") == "true":
        print("⏭️  Skipping database initialization (testing mode)")
        return
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("⏭️  Continuing without database")

# ==================== Health Check ====================
@app.get("/")
def home():
    return {
        "message": "AI Fraud Detection API is running 🚀",
        "version": settings.VERSION,
        "docs": "/docs"
    }

# ==================== Analyze Transaction (Testing) ====================
@app.post("/api/analyze")
async def analyze(tx: Transaction):
    """Analyze transaction without saving to database"""
    df = pd.DataFrame([tx.dict()])
    
    # Dummy risk score calculation
    risk_score = 0.95 if df['amount'].iloc[0] > 50000 else 0.05
    
    return {
        "transaction_id": tx.transaction_id,
        "risk_score": risk_score,
        "flagged": risk_score > 0.8
    }

# ==================== Get All Transactions ====================
@app.get("/api/transactions", response_model=list[TransactionResponse])
async def get_transactions(db: AsyncSession = Depends(get_db)):
    """Get all transactions from database"""
    result = await db.execute(select(TransactionDB))
    transactions = result.scalars().all()
    return transactions

# ==================== Create Transaction ====================
@app.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(tx: Transaction, db: AsyncSession = Depends(get_db)):
    """Save new transaction to database"""
    
    # Calculate risk score
    df = pd.DataFrame([tx.dict()])
    risk_score = 0.95 if df['amount'].iloc[0] > 50000 else 0.05
    is_fraud = risk_score > settings.FRAUD_THRESHOLD
    
    # Save to database
    db_transaction = TransactionDB(
        transaction_id=tx.transaction_id,
        amount=tx.amount,
        merchant=tx.merchant,
        card_type=tx.card_type,
        is_fraud=is_fraud,
        risk_score=risk_score,
    )
    
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    
    return db_transaction

# ==================== Get Transaction by ID ====================
@app.get("/api/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: str, db: AsyncSession = Depends(get_db)):
    """Get specific transaction by ID"""
    result = await db.execute(
        select(TransactionDB).where(TransactionDB.transaction_id == transaction_id)
    )
    transaction = result.scalar_one_or_none()
    
    if not transaction:
        return {"error": "Transaction not found"}
    
    return transaction

def start():
    """Start the application"""
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)