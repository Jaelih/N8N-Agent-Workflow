import requests
import os
from dotenv import load_dotenv

load_dotenv()

def test_webhook(name: str, url: str, payload: dict):
    print(f"\n{'='*40}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"Payload: {payload}")
    try:
        res = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {res.status_code}")
        print(f"Raw Response: {res.text}")
        if res.text:
            print(f"JSON: {res.json()}")
        else:
            print("⚠️ Empty response — check if workflow is Published and active in n8n")
    except Exception as e:
        print(f"Error: {str(e)}")

# Test each webhook
test_webhook("Billing", os.getenv("N8N_BILLING_WEBHOOK"), {"User_Request": "Get billing info for account number 1001"})
test_webhook("Customer", os.getenv("N8N_CUSTOMER_WEBHOOK"), {"User_Request": "Get customer info for ID 1001"})
test_webhook("Network", os.getenv("N8N_NETWORK_WEBHOOK"), {"User_Request": "Check network status in Quezon City"})
test_webhook("Knowledge", os.getenv("N8N_KNOWLEDGE_WEBHOOK"), {"User_Request": "What are PLDT fiber plans?"})