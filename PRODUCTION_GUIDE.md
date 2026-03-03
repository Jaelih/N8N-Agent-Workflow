# Production Hardening & Security Guide

## 🔐 Security Checklist

### 1. Authentication & Authorization

**Current Implementation:**
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Token expiration (60 min access, 7 days refresh)
- ✅ User-scoped data access

**Production Improvements:**

```python
# backend/app/auth.py - Add these enhancements

# 1. Add token blacklisting for logout
BLACKLISTED_TOKENS = set()  # Use Redis in production

def blacklist_token(token: str):
    BLACKLISTED_TOKENS.add(token)
    # In production: redis_client.sadd("blacklisted_tokens", token)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    
    # Check if token is blacklisted
    if token in BLACKLISTED_TOKENS:
        raise HTTPException(status_code=401, detail="Token has been revoked")
    
    # ... existing code ...

# 2. Add password strength validation
import re

def validate_password_strength(password: str) -> bool:
    """
    Password must be at least 8 characters and contain:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True

# 3. Add account lockout after failed attempts
from datetime import datetime, timedelta

LOGIN_ATTEMPTS = {}  # Use Redis in production
MAX_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)

def check_login_attempts(username: str) -> bool:
    """Returns True if account is locked"""
    if username in LOGIN_ATTEMPTS:
        attempts, locked_until = LOGIN_ATTEMPTS[username]
        if locked_until and datetime.utcnow() < locked_until:
            return True
        elif datetime.utcnow() >= locked_until:
            # Reset after lockout period
            del LOGIN_ATTEMPTS[username]
    return False

def record_failed_login(username: str):
    """Record failed login attempt"""
    if username not in LOGIN_ATTEMPTS:
        LOGIN_ATTEMPTS[username] = [1, None]
    else:
        attempts, _ = LOGIN_ATTEMPTS[username]
        attempts += 1
        LOGIN_ATTEMPTS[username] = [attempts, None]
        
        if attempts >= MAX_ATTEMPTS:
            locked_until = datetime.utcnow() + LOCKOUT_DURATION
            LOGIN_ATTEMPTS[username] = [attempts, locked_until]

def reset_login_attempts(username: str):
    """Reset after successful login"""
    if username in LOGIN_ATTEMPTS:
        del LOGIN_ATTEMPTS[username]
```

### 2. Rate Limiting

```python
# backend/app/rate_limiter.py

from fastapi import HTTPException, Request
from datetime import datetime, timedelta
from collections import defaultdict

# Simple in-memory rate limiter (use Redis in production)
request_counts = defaultdict(list)

def rate_limit(requests_per_minute: int = 60):
    """
    Rate limiting decorator.
    Usage: Add to routes that need protection
    """
    async def limiter(request: Request):
        client_ip = request.client.host
        now = datetime.utcnow()
        
        # Clean old requests
        request_counts[client_ip] = [
            req_time for req_time in request_counts[client_ip]
            if now - req_time < timedelta(minutes=1)
        ]
        
        # Check limit
        if len(request_counts[client_ip]) >= requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        # Record this request
        request_counts[client_ip].append(now)
    
    return limiter

# Usage in routes:
from fastapi import Depends

@router.post("/api/tickets")
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: dict = Depends(get_current_user),
    _rate_limit: None = Depends(rate_limit(10))  # 10 tickets per minute
):
    # ... route logic ...
```

**Better: Use slowapi library**

```bash
pip install slowapi
```

```python
# backend/main.py

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Then in routes:
@app.post("/api/tickets")
@limiter.limit("10/minute")
async def create_ticket(request: Request):
    # ... logic ...
```

### 3. Input Validation & Sanitization

```python
# backend/app/validators.py

import re
from typing import Optional

def sanitize_string(text: str, max_length: int = 1000) -> str:
    """Remove potentially dangerous characters"""
    # Remove null bytes
    text = text.replace('\x00', '')
    # Limit length
    text = text[:max_length]
    # Remove control characters except newlines and tabs
    text = ''.join(char for char in text if char == '\n' or char == '\t' or not char.isspace() or char == ' ')
    return text.strip()

def validate_phone_number(phone: str) -> bool:
    """Validate Philippine phone number format"""
    pattern = r'^(\+63|0)[0-9]{10}$'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '')))

def validate_account_number(account: str) -> bool:
    """Validate account number format"""
    # Adjust pattern based on your account number format
    pattern = r'^[0-9]{10,12}$'
    return bool(re.match(pattern, account))

# Use in Pydantic models:
from pydantic import validator

class TicketCreate(BaseModel):
    title: str
    description: str
    
    @validator('title', 'description')
    def sanitize_text(cls, v):
        return sanitize_string(v)
    
    @validator('contact_number')
    def validate_phone(cls, v):
        if not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v
```

### 4. SQL Injection Prevention

**✅ Already Protected** - Using parameterized queries throughout

Example of what we're doing correctly:
```python
# ✅ SAFE - Parameterized query
conn.execute(
    "SELECT * FROM tickets WHERE id = ? AND user_id = ?",
    (ticket_id, user_id)
)

# ❌ UNSAFE - String concatenation (NEVER DO THIS)
conn.execute(f"SELECT * FROM tickets WHERE id = '{ticket_id}'")
```

### 5. XSS Protection

```typescript
// Frontend - Use DOMPurify for sanitizing user input before rendering

npm install dompurify @types/dompurify

// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
};

// Usage in components:
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />
```

### 6. HTTPS/TLS Configuration

```python
# backend/main.py - Production SSL configuration

if os.getenv("ENVIRONMENT") == "production":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="/path/to/privkey.pem",
        ssl_certfile="/path/to/fullchain.pem",
        ssl_ca_certs="/path/to/chain.pem"
    )
```

**Or use Nginx as reverse proxy:**

```nginx
# /etc/nginx/sites-available/pldt-api

server {
    listen 443 ssl http2;
    server_name api.pldt-gabby.com;
    
    ssl_certificate /etc/letsencrypt/live/api.pldt-gabby.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pldt-gabby.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 7. Environment Variables Security

```bash
# Never commit .env file to git!
# Add to .gitignore:
.env
.env.local
.env.production
*.pem
*.key

# Use secrets management in production:
# - AWS Secrets Manager
# - Azure Key Vault
# - Google Secret Manager
# - HashiCorp Vault
```

### 8. CORS Configuration

```python
# backend/main.py - Production CORS settings

import os

allowed_origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Explicit origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # Explicit methods
    allow_headers=["Authorization", "Content-Type"],  # Only required headers
    max_age=3600,  # Cache preflight requests for 1 hour
)
```

---

## 🔍 Error Handling

### 1. Global Exception Handler

```python
# backend/app/error_handlers.py

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging
import traceback

logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)}")
    logger.error(traceback.format_exc())
    
    # Don't expose internal errors in production
    if os.getenv("ENVIRONMENT") == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": str(exc),
                "type": type(exc).__name__
            }
        )

# Register handlers in main.py:
from app.error_handlers import validation_exception_handler, general_exception_handler

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
```

### 2. Custom Error Classes

```python
# backend/app/exceptions.py

class APIException(Exception):
    """Base exception for API errors"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class AuthenticationError(APIException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, 401)

class AuthorizationError(APIException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, 403)

class ResourceNotFoundError(APIException):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", 404)

class ValidationError(APIException):
    def __init__(self, message: str):
        super().__init__(message, 422)

# Usage:
from app.exceptions import ResourceNotFoundError

@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    ticket = get_ticket_by_id(ticket_id, current_user["user_id"])
    if not ticket:
        raise ResourceNotFoundError("Ticket")
    return ticket
```

---

## 📊 Logging Strategy

### 1. Structured Logging

```python
# backend/app/logger.py

import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for better parsing"""
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        return json.dumps(log_data)

def setup_logging():
    """Configure logging for the application"""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # File handler for production
    if os.getenv("ENVIRONMENT") == "production":
        file_handler = logging.FileHandler("app.log")
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)
    
    return logger

# In main.py:
from app.logger import setup_logging
logger = setup_logging()
```

### 2. Request Logging Middleware

```python
# backend/app/middleware.py

import time
import uuid
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing"""
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Add request ID to request state
    request.state.request_id = request_id
    
    # Log request
    logger.info(
        f"Request started",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "client_ip": request.client.host
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Log response
    duration = time.time() - start_time
    logger.info(
        f"Request completed",
        extra={
            "request_id": request_id,
            "duration_ms": round(duration * 1000, 2),
            "status_code": response.status_code
        }
    )
    
    # Add request ID to response headers
    response.headers["X-Request-ID"] = request_id
    
    return response
```

### 3. Audit Logging

```python
# backend/app/audit.py

def log_user_action(user_id: int, action: str, resource: str, details: dict = None):
    """Log user actions for audit trail"""
    logger.info(
        f"User action: {action}",
        extra={
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "details": details or {}
        }
    )

# Usage:
@router.post("/api/tickets")
async def create_ticket(ticket_data: TicketCreate, current_user: dict = Depends(get_current_user)):
    ticket_id = create_ticket(...)
    
    # Log the action
    log_user_action(
        user_id=current_user["user_id"],
        action="create_ticket",
        resource="ticket",
        details={"ticket_id": ticket_id, "category": ticket_data.category}
    )
    
    return ticket
```

---

## 🚀 Performance Optimization

### 1. Database Connection Pooling

```python
# For SQLite (current):
# SQLite is file-based and has limited concurrency
# Consider migrating to PostgreSQL for production

# For PostgreSQL:
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,          # Maximum number of connections
    max_overflow=20,       # Allow 20 additional connections under high load
    pool_timeout=30,       # Wait 30 seconds for available connection
    pool_recycle=3600,     # Recycle connections after 1 hour
)
```

### 2. Caching

```python
# Use Redis for caching
import redis
import json

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True
)

def cache_get(key: str):
    """Get from cache"""
    data = redis_client.get(key)
    return json.loads(data) if data else None

def cache_set(key: str, value: dict, expire: int = 300):
    """Set cache with expiration (default 5 minutes)"""
    redis_client.setex(key, expire, json.dumps(value))

# Usage in balance endpoint:
@router.get("/api/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    cache_key = f"balance:{current_user['user_id']}"
    
    # Try cache first
    cached = cache_get(cache_key)
    if cached:
        return cached
    
    # Fetch from database/API
    balance = get_postpaid_balance(...)
    
    # Cache for 5 minutes
    cache_set(cache_key, balance, expire=300)
    
    return balance
```

### 3. Async Database Operations

```python
# Use async database drivers
# For PostgreSQL: asyncpg
# For MySQL: aiomysql

import asyncpg

async def get_tickets_async(user_id: int, page: int, page_size: int):
    """Async database query"""
    pool = await asyncpg.create_pool(DATABASE_URL)
    
    async with pool.acquire() as conn:
        offset = (page - 1) * page_size
        tickets = await conn.fetch(
            """SELECT * FROM tickets 
               WHERE user_id = $1 
               ORDER BY created_at DESC 
               LIMIT $2 OFFSET $3""",
            user_id, page_size, offset
        )
        
        total = await conn.fetchval(
            "SELECT COUNT(*) FROM tickets WHERE user_id = $1",
            user_id
        )
    
    await pool.close()
    return [dict(t) for t in tickets], total
```

---

## 📈 Monitoring & Alerting

### 1. Health Checks

```python
# backend/app/health.py

from datetime import datetime

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }
    
    # Check database
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute("SELECT 1")
        conn.close()
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
        checks["status"] = "degraded"
    
    # Check OpenAI API
    try:
        # Ping OpenAI
        checks["openai"] = "healthy"
    except Exception as e:
        checks["openai"] = f"unhealthy: {str(e)}"
        checks["status"] = "degraded"
    
    return checks

@app.get("/health/liveness")
async def liveness():
    """Kubernetes liveness probe"""
    return {"status": "alive"}

@app.get("/health/readiness")
async def readiness():
    """Kubernetes readiness probe"""
    # Check if app is ready to serve traffic
    return {"status": "ready"}
```

### 2. Metrics Collection

```python
# Use Prometheus for metrics
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Define metrics
request_count = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('api_request_duration_seconds', 'Request duration', ['method', 'endpoint'])

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Record metrics
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

---

This guide provides a comprehensive overview of production hardening, security, error handling, logging, and monitoring strategies for your application.
