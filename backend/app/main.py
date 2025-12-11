from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from .models.transaction import Transaction, transactions_db # Importing the Transaction model   


app = FastAPI(title="Fraud Detection API")


@app.get("/")
def home():
    return {"message": "AI Fraud Detection API is running 🚀"}

#For Testing
@app.post("/api/analyze")
async def analyze(tx: Transaction):
    df = pd.DataFrame([tx.dict()])
    
    # dummy risk score
    risk_score = 0.95 if df['amount'].iloc[0] > 50000 else 0.05
    return {"transaction_id": tx.transaction_id, "risk_score": risk_score, "flagged": risk_score > 0.8}

#Real integrate with frontend
@app.get("/api/transactions")
async def get_transactions():
    return {"transactions": transactions_db}
   

def start():
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], #frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)