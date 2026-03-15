import requests
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

load_dotenv()

BILLING_WEBHOOK = os.getenv("N8N_BILLING_WEBHOOK")
CUSTOMER_WEBHOOK = os.getenv("N8N_CUSTOMER_WEBHOOK")
TICKET_WEBHOOK = os.getenv("N8N_TICKET_WEBHOOK")
NETWORK_WEBHOOK = os.getenv("N8N_NETWORK_WEBHOOK")
KNOWLEDGE_WEBHOOK = os.getenv("N8N_KNOWLEDGE_WEBHOOK")
POSTPAIDBALANCE_WEBHOOK = os.getenv("N8N_POSTPAIDBALANCE_WEBHOOK")
CALENDAR_WEBHOOK = os.getenv("N8N_CALENDAR_WEBHOOK")
N8N_API_KEY = os.getenv("N8N_API_KEY")
X_PLDT_AUTH_TOKEN = os.getenv("X_PLDT_AUTH_TOKEN", "")

HEADERS = {
    "Content-Type": "application/json",
    "X-N8N-API-KEY": N8N_API_KEY,
    "Accept": "application/json",
    "X-Pldt-Auth-Token": X_PLDT_AUTH_TOKEN
}


def call_webhook(url: str, data: dict, headers: dict = HEADERS) -> dict:
    try:
        response = requests.post(url, json=data, headers=headers, timeout=30)
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

def get_customer_info(user_request: str) -> dict:
    r = call_webhook(POSTPAIDBALANCE_WEBHOOK, {
        "User_Request": user_request
    })
    print(f"get_customer_info: {r}")
    return r

# def get_billing(account_number: str) -> dict:
#     return call_webhook(BILLING_WEBHOOK, {
#         "User_Request": f"Get billing info for account number {account_number}"
#     })

# def get_customer(customer_id: str) -> dict:
#     return call_webhook(CUSTOMER_WEBHOOK, {
#         "User_Request": f"Get customer info for ID {customer_id}"
#     })

def submit_ticket(account_number: str, concern: str, contact_number: str) -> dict:
    return call_webhook(TICKET_WEBHOOK, {
        "User_Request": f"Submit a support ticket for account {account_number}. Concern: {concern}. Contact number: {contact_number}"
    })

def check_network_status(area: str) -> dict:
    r = call_webhook(NETWORK_WEBHOOK, {
        "User_Request": f"Check network status in {area}"
    })
    print(f"check_network_status: {r}")
    return r

def get_knowledge_base(question: str) -> dict:
    r = call_webhook(KNOWLEDGE_WEBHOOK, {
        "User_Request": question
    })
    print(f"get_knowledge_base: {r}")
    return r

def set_meeting_date(meeting_date: str) -> dict:
    r = call_webhook(CALENDAR_WEBHOOK, {
        "User_Request": f"Set meeting date to {meeting_date}"
    })
    print(f"set_meeting_date: {r}")
    return r

def get_current_time() -> dict:
    now = datetime.now(ZoneInfo("Asia/Manila"))
    return {
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%B %d, %Y"),
        "datetime": now.strftime("%A, %B %d, %Y %I:%M %p"),
        "timezone": "Asia/Manila"
    }

