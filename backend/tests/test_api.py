# # tests/test_api.py
# import requests

# def test_transaction_analysis():
#     url = "http://127.0.0.1:8000/api/analyze"

#     data = {
#         "transaction_id": "T1",
#         "user_id": "U1",
#         "amount": 90000
#     }

#     response = requests.post(url, json=data)

#     # Pytest assertion
#     assert response.status_code == 200
#     assert "risk_score" in response.json()
#     assert "flagged" in response.json()
