import requests

url = "http://127.0.0.1:8000/api/analyze"

data = {
    "transaction_id": "T1",
    "user_id": "U1",
    "amount": 90000
}

response = requests.post(url, json=data)
print(response.json())
