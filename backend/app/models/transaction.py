from pydantic import BaseModel

class Transaction(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    location: str = None
    device: str = None
    timestamp: str = None

# Sample in-memory transaction list
transactions_db = [
    {"transaction_id": "T1", "user_id": "U1", "amount": 90000, "location": "Colombo", "device": "mobile", "timestamp": "2025-12-11T10:00:00Z"},
    {"transaction_id": "T2", "user_id": "U2", "amount": 2000, "location": "Kandy", "device": "web", "timestamp": "2025-12-11T11:00:00Z"},
    {"transaction_id": "T3", "user_id": "U3", "amount": 15000, "location": "Galle", "device": "mobile", "timestamp": "2025-12-11T12:00:00Z"},
]
