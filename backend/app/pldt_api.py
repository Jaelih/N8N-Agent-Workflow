import requests
import os
from dotenv import load_dotenv

load_dotenv()

PLDT_BASE_URL = os.getenv("PLDT_BASE_URL")
PLDT_AUTH_TOKEN = os.getenv("PLDT_AUTH_TOKEN")

HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-Pldt-Auth-Token": PLDT_AUTH_TOKEN
}


def check_balance(account_number: str) -> dict:
    """
    GET /mobility/amdocs/api/autocheckbalance/{account_number}
    Checks the balance of a PLDT account.
    """
    try:
        url = f"{PLDT_BASE_URL}/mobility/amdocs/api/autocheckbalance/{account_number}"
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        if status_code == 404:
            return {"error": f"Account {account_number} not found."}
        elif status_code == 401:
            return {"error": "Unauthorized. Invalid or expired token."}
        else:
            return {"error": f"API error: {str(e)}"}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out. Please try again."}
    except Exception as e:
        return {"error": str(e)}


def create_ticket(account_number: str, concern: str, contact_number: str) -> dict:
    """
    POST /mobility/amdocs/api/createticket (or whatever the POST endpoint is)
    Creates a support ticket for a PLDT account.
    """
    try:
        url = f"{PLDT_BASE_URL}/mobility/amdocs/api/createticket"
        payload = {
            "accountNumber": account_number,
            "concern": concern,
            "contactNumber": contact_number
        }
        response = requests.post(url, headers=HEADERS, json=payload, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        if status_code == 400:
            return {"error": "Invalid request. Please check the details."}
        elif status_code == 401:
            return {"error": "Unauthorized. Invalid or expired token."}
        else:
            return {"error": f"API error: {str(e)}"}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out. Please try again."}
    except Exception as e:
        return {"error": str(e)}