import os
import requests
from datetime import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

from google.adk.tools import FunctionTool

load_dotenv()

# ─────────────────────────────────────────────
# WEBHOOK CONFIG (UNCHANGED)
# ─────────────────────────────────────────────

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

# ─────────────────────────────────────────────
# CORE WEBHOOK FUNCTION (UNCHANGED)
# ─────────────────────────────────────────────

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

# ─────────────────────────────────────────────
# ADK TOOLS (WRAPPED VERSION)
# ─────────────────────────────────────────────

def customer_info_tool(user_request: str) -> dict:
    """Fetch customer account information."""
    return call_webhook(CUSTOMER_INFO_WEBHOOK, {
        "User_Request": user_request
    })


def ticket_tool(user_request: str) -> dict:
    """Create or retrieve support tickets."""
    return call_webhook(TICKET_WEBHOOK, {
        "User_Request": user_request
    })


def network_tool(area: str) -> dict:
    """Check network outage status in a given area."""
    return call_webhook(NETWORK_WEBHOOK, {
        "User_Request": f"Check network status in {area}"
    })


def knowledge_tool(question: str) -> dict:
    """Search knowledge base for troubleshooting and FAQs."""
    return call_webhook(KNOWLEDGE_WEBHOOK, {
        "User_Request": question
    })


def calendar_tool(month: str, day: str, time: str, reason: str) -> dict:
    """Schedule a customer appointment."""
    return call_webhook(CALENDAR_WEBHOOK, {
        "User_Request": f"Set meeting date for {month} {day} at {time} reason: {reason}"
    })


def current_time_tool() -> dict:
    """Get current time in Asia/Manila."""
    now = datetime.now(ZoneInfo("Asia/Manila"))
    return {
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%B %d, %Y"),
        "datetime": now.strftime("%A, %B %d, %Y %I:%M %p"),
        "timezone": "Asia/Manila"
    }