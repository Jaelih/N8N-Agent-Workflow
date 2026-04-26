import requests
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

load_dotenv()

TICKET_WEBHOOK = os.getenv("N8N_TICKET_WEBHOOK")
NETWORK_WEBHOOK = os.getenv("N8N_NETWORK_WEBHOOK")
KNOWLEDGE_WEBHOOK = os.getenv("N8N_KNOWLEDGE_WEBHOOK")
CUSTOMER_INFO_WEBHOOK = os.getenv("N8N_CUSTOMER_INFO_WEBHOOK")
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

def customer_info_agent(user_request: str) -> dict:
    print(f"customer_info_agent called with: {user_request}")
    r = call_webhook(CUSTOMER_INFO_WEBHOOK, {
        "User_Request": user_request
    })
    return r

def ticket_agent(user_request: str) -> dict:
    print(f"ticket_agent called with: {user_request}")
    return call_webhook(TICKET_WEBHOOK, {
        "User_Request": user_request
    })

def network_agent(area: str) -> dict:
    print(f"network_agent called with: {area}")
    r = call_webhook(NETWORK_WEBHOOK, {
        "User_Request": f"Check network status in {area}"
    })
    print(f"network_agent: {r}")
    return r

def knowledge_agent(question: str) -> dict:
    print(f"knowledge_agent called with: {question}")
    r = call_webhook(KNOWLEDGE_WEBHOOK, {
        "User_Request": question
    })
    print(f"knowledge_agent: {r}")
    return r

def calendar_agent(month: str, day:str, time:str, reason: str) -> dict:
    print(f"calendar_agent called with: {month}, {day}, {time}, {reason}")
    r = call_webhook(CALENDAR_WEBHOOK, {
        "User_Request": f"Set meeting date for {month} {day} at {time}\n reason: {reason}"
    })
    print(f"calendar_agent: {r}")
    return r

def get_current_time() -> dict:
    now = datetime.now(ZoneInfo("Asia/Manila"))
    return {
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%B %d, %Y"),
        "datetime": now.strftime("%A, %B %d, %Y %I:%M %p"),
        "timezone": "Asia/Manila"
    }

