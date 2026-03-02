import requests
import os
from dotenv import load_dotenv

load_dotenv()

BILLING_WEBHOOK = os.getenv("N8N_BILLING_WEBHOOK")
CUSTOMER_WEBHOOK = os.getenv("N8N_CUSTOMER_WEBHOOK")
TICKET_WEBHOOK = os.getenv("N8N_TICKET_WEBHOOK")
NETWORK_WEBHOOK = os.getenv("N8N_NETWORK_WEBHOOK")
KNOWLEDGE_WEBHOOK = os.getenv("N8N_KNOWLEDGE_WEBHOOK")
N8N_API_KEY = os.getenv("N8N_API_KEY")

HEADERS = {
    "Content-Type": "application/json",
    "X-N8N-API-KEY": N8N_API_KEY
}


def call_webhook(url: str, data: dict) -> dict:
    try:
        response = requests.post(url, json=data, headers=HEADERS, timeout=30)
        response.raise_for_status()
        if not response.text:
            return {"error": "Empty response from n8n"}
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "Request timed out. Please try again."}
    except requests.exceptions.HTTPError as e:
        return {"error": f"Webhook error: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}


def get_billing(account_number: str) -> dict:
    return call_webhook(BILLING_WEBHOOK, {
        "User_Request": f"Get billing info for account number {account_number}"
    })

def get_customer(customer_id: str) -> dict:
    return call_webhook(CUSTOMER_WEBHOOK, {
        "User_Request": f"Get customer info for ID {customer_id}"
    })

def submit_ticket(account_number: str, concern: str, contact_number: str) -> dict:
    return call_webhook(TICKET_WEBHOOK, {
        "User_Request": f"Submit a support ticket for account {account_number}. Concern: {concern}. Contact number: {contact_number}"
    })

def check_network(area: str) -> dict:
    return call_webhook(NETWORK_WEBHOOK, {
        "User_Request": f"Check network status in {area}"
    })

def get_knowledge(question: str) -> dict:
    return call_webhook(KNOWLEDGE_WEBHOOK, {
        "User_Request": question
    })