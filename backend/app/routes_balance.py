"""
Postpaid balance routes: Check balance, refresh from billing system
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models import PostpaidBalance
from app.auth import get_current_user
from app.database import get_postpaid_balance, upsert_postpaid_balance
from app.n8n_api import get_billing
import re

router = APIRouter(prefix="/api/balance", tags=["Balance"])


def parse_billing_data(billing_response: dict, account_number: str) -> dict:
    """
    Parse billing data from N8N webhook response.
    Adapt this based on your actual N8N billing webhook response format.
    """
    # Handle error responses
    if "error" in billing_response:
        return None
    
    # Example parsing - adjust based on your actual response structure
    try:
        return {
            "current_balance": float(billing_response.get("amount_due", 0.0)),
            "due_date": billing_response.get("due_date"),
            "last_payment_amount": float(billing_response.get("last_payment_amount", 0.0)),
            "last_payment_date": billing_response.get("last_payment_date"),
            "plan_name": billing_response.get("plan_name", "Unknown"),
            "monthly_fee": float(billing_response.get("monthly_fee", 0.0)),
            "data_usage_gb": float(billing_response.get("data_usage_gb", 0.0)),
            "data_limit_gb": float(billing_response.get("data_limit_gb", 100.0)),
            "status": billing_response.get("status", "active")
        }
    except Exception as e:
        print(f"Error parsing billing data: {e}")
        return None


@router.get("", response_model=PostpaidBalance)
async def get_balance(current_user: dict = Depends(get_current_user)):
    """
    Get current postpaid balance for authenticated user.
    Returns cached data from database if recent, otherwise fetches fresh data.
    """
    account_number = current_user.get("account_number")
    if not account_number:
        raise HTTPException(
            status_code=400,
            detail="No account number associated with your profile"
        )
    
    # Try to get from database first
    balance = get_postpaid_balance(current_user["user_id"], account_number)
    
    if balance:
        return PostpaidBalance(**balance)
    
    # If not in database, fetch from billing system
    billing_data = get_billing(account_number)
    
    parsed_data = parse_billing_data(billing_data, account_number)
    if not parsed_data:
        raise HTTPException(
            status_code=404,
            detail="Account not found or billing data unavailable"
        )
    
    # Save to database for caching
    upsert_postpaid_balance(current_user["user_id"], account_number, parsed_data)
    
    # Return fresh data
    balance = get_postpaid_balance(current_user["user_id"], account_number)
    return PostpaidBalance(**balance)


@router.post("/refresh", response_model=PostpaidBalance)
async def refresh_balance(current_user: dict = Depends(get_current_user)):
    """
    Force refresh balance from billing system (ignores cache).
    Use this when user explicitly wants latest data.
    """
    account_number = current_user.get("account_number")
    if not account_number:
        raise HTTPException(
            status_code=400,
            detail="No account number associated with your profile"
        )
    
    # Fetch fresh data from billing system
    billing_data = get_billing(account_number)
    
    parsed_data = parse_billing_data(billing_data, account_number)
    if not parsed_data:
        raise HTTPException(
            status_code=404,
            detail="Account not found or billing data unavailable"
        )
    
    # Update database
    upsert_postpaid_balance(current_user["user_id"], account_number, parsed_data)
    
    # Return updated data
    balance = get_postpaid_balance(current_user["user_id"], account_number)
    return PostpaidBalance(**balance)


@router.get("/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """
    Get payment history for user's account.
    This would integrate with your billing system's payment history endpoint.
    """
    # TODO: Implement payment history retrieval from N8N or billing system
    # For now, return a placeholder response
    return {
        "message": "Payment history feature coming soon",
        "account_number": current_user.get("account_number"),
        "payments": []
    }
