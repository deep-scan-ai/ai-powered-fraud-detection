# tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

# Create test client (no running server needed!)
client = TestClient(app)


def test_home():
    """Test home endpoint"""
    response = client.get("/")
    
    assert response.status_code == 200
    assert "Fraud Detection API" in response.json()["message"]


def test_transaction_analysis():
    """Test transaction analysis endpoint"""
    data = {
        "transaction_id": "TXN001",
        "amount": 100.50,
        "merchant": "Amazon",
        "card_type": "credit"
    }
    
    response = client.post("/api/analyze", json=data)
    
    assert response.status_code == 200
    assert response.json()["transaction_id"] == "TXN001"
    assert "risk_score" in response.json()
    assert "flagged" in response.json()


def test_high_amount_transaction():
    """Test high amount transaction (like your original test)"""
    data = {
        "transaction_id": "T1",
        "amount": 90000,
        "merchant": "Unknown",
        "card_type": "credit"
    }
    
    response = client.post("/api/analyze", json=data)
    
    assert response.status_code == 200
    result = response.json()
    assert "risk_score" in result
    assert "flagged" in result