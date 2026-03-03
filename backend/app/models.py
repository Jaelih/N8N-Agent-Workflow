"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ========== ENUMS ==========

class TicketStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketCategory(str, Enum):
    BILLING = "billing"
    TECHNICAL = "technical"
    ACCOUNT = "account"
    GENERAL = "general"


class CallType(str, Enum):
    WEBRTC = "webrtc"
    VOICE_MESSAGE = "voice_message"


# ========== AUTH MODELS ==========

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    customer_id: Optional[str] = None
    account_number: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    customer_id: Optional[str]
    account_number: Optional[str]
    role: str
    created_at: datetime


# ========== TICKET MODELS ==========

class TicketCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: TicketCategory
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    contact_number: str = Field(..., pattern=r"^[\d\+\-\(\) ]+$")


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[TicketCategory] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    contact_number: Optional[str] = None


class TicketResponse(BaseModel):
    id: str
    user_id: int
    account_number: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    contact_number: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]


class TicketListResponse(BaseModel):
    tickets: List[TicketResponse]
    total: int
    page: int
    page_size: int


# ========== BALANCE MODELS ==========

class PostpaidBalance(BaseModel):
    account_number: str
    current_balance: float
    due_date: Optional[str]
    last_payment_amount: Optional[float]
    last_payment_date: Optional[datetime]
    plan_name: Optional[str]
    monthly_fee: Optional[float]
    data_usage_gb: float
    data_limit_gb: Optional[float]
    status: str
    updated_at: datetime


class PaymentHistoryItem(BaseModel):
    payment_date: datetime
    amount: float
    payment_method: str
    reference_number: str


# ========== CALL MODELS ==========

class CallInitiate(BaseModel):
    session_id: Optional[str] = None


class CallInitiateResponse(BaseModel):
    session_id: str
    ws_url: str
    ephemeral_token: str  # For OpenAI Realtime API


class CallEnd(BaseModel):
    session_id: str


class CallSummary(BaseModel):
    session_id: str
    duration_seconds: int
    transcript_summary: str
    sentiment: str
    resolved: bool
    cost_usd: float
    started_at: datetime
    ended_at: datetime


class CallLogResponse(BaseModel):
    id: str
    session_id: str
    call_type: str
    duration_seconds: int
    transcript_summary: Optional[str]
    sentiment: Optional[str]
    resolved: bool
    cost_usd: float
    started_at: datetime
    ended_at: Optional[datetime]
