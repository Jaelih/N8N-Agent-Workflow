# New Features Implementation Guide

## 🎉 Overview

This document describes the three major features added to the PLDT Voice Agent system:

1. **Enhanced Ticket Management** - Full CRUD operations for support tickets
2. **Postpaid Balance** - Real-time balance checking and payment tracking
3. **AI Call Center** - WebRTC-based live voice calls with AI agent

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐   │
│  │ Auth UI  │ │ Tickets  │ │ Balance │ AI Calls  │   │
│  └─────┬────┘ └─────┬────┘ └────┬────┴──────┬────┘   │
└────────┼────────────┼───────────┼───────────┼────────┘
         │            │           │           │
    JWT Auth     REST APIs    REST APIs   WebSocket
         │            │           │           │
┌────────▼────────────▼───────────▼───────────▼─────────┐
│              FastAPI Backend (Python)                   │
│  ┌───────────────────────────────────────────────┐    │
│  │  JWT Authentication Middleware                │    │
│  └───────────────────────────────────────────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────────┐  │
│  │ Auth     │ │ Tickets  │ │ Balance │ Calls     │  │
│  │ Routes   │ │ CRUD     │ │ Service │ WebRTC    │  │
│  └──────────┘ └──────────┘ └─────────┴───────────┘  │
│  ┌──────────────────────────────────────────────┐    │
│  │        LangChain Agent (Existing)            │    │
│  └──────────────────────────────────────────────┘    │
└───────────┬────────────────────────────┬─────────────┘
            │                            │
      ┌─────▼─────┐              ┌──────▼───────┐
      │  SQLite   │              │  N8N         │
      │  Database │              │  Workflows   │
      └───────────┘              └──────────────┘
```

---

## 📋 Feature 1: Enhanced Ticket Management

### Backend Implementation

**Files Created:**
- `backend/app/routes_tickets.py` - Ticket CRUD API endpoints
- Enhanced `backend/app/database.py` with ticket functions

**Database Schema:**
```sql
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,              -- Format: TKT-{timestamp}-{random}
    user_id INTEGER NOT NULL,
    account_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,           -- billing, technical, account, general
    priority TEXT DEFAULT 'medium',   -- low, medium, high, urgent
    status TEXT DEFAULT 'open',       -- open, in_progress, resolved, closed
    assigned_to TEXT,
    contact_number TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**API Endpoints:**
```
POST   /api/tickets                - Create new ticket
GET    /api/tickets                - Get all user tickets (paginated)
GET    /api/tickets/{ticket_id}    - Get ticket details
PATCH  /api/tickets/{ticket_id}    - Update ticket
DELETE /api/tickets/{ticket_id}    - Delete ticket
```

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Internet connection is slow",
    "description": "My internet speed has been very slow for the past 3 days",
    "category": "technical",
    "priority": "high",
    "contact_number": "+639171234567"
  }'
```

**Example Response:**
```json
{
  "id": "TKT-1709481600-A3F5B2",
  "user_id": 1,
  "account_number": "1234567890",
  "title": "Internet connection is slow",
  "description": "My internet speed has been very slow for the past 3 days",
  "category": "technical",
  "priority": "high",
  "status": "open",
  "contact_number": "+639171234567",
  "assigned_to": null,
  "created_at": "2026-03-03T10:00:00",
  "updated_at": "2026-03-03T10:00:00",
  "resolved_at": null
}
```

### Frontend Implementation

**Component:** `ChatBotApp/src/components/TicketManager.tsx`

**Features:**
- Create new tickets with form validation
- View all tickets with pagination
- Update ticket status inline
- Delete tickets with confirmation
- Priority and status badges
- Category filtering
- Responsive design

---

## 💰 Feature 2: Get Postpaid Balance

### Backend Implementation

**Files Created:**
- `backend/app/routes_balance.py` - Balance API endpoints

**Database Schema:**
```sql
CREATE TABLE postpaid_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    current_balance REAL DEFAULT 0.0,
    due_date DATE,
    last_payment_amount REAL,
    last_payment_date DATETIME,
    plan_name TEXT,
    monthly_fee REAL,
    data_usage_gb REAL DEFAULT 0.0,
    data_limit_gb REAL,
    status TEXT DEFAULT 'active',     -- active, suspended, disconnected
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**API Endpoints:**
```
GET    /api/balance         - Get current balance (cached)
POST   /api/balance/refresh - Force refresh from billing system
GET    /api/balance/history - Get payment history (TODO)
```

**Example Response:**
```json
{
  "account_number": "1234567890",
  "current_balance": 2500.50,
  "due_date": "2026-03-15",
  "last_payment_amount": 1999.00,
  "last_payment_date": "2026-02-15T14:30:00",
  "plan_name": "Fiber Plan 1699",
  "monthly_fee": 1699.00,
  "data_usage_gb": 45.3,
  "data_limit_gb": 100.0,
  "status": "active",
  "updated_at": "2026-03-03T10:00:00"
}
```

### Frontend Implementation

**Component:** `ChatBotApp/src/components/BalanceDisplay.tsx`

**Features:**
- Current balance display
- Due date countdown
- Data usage progress bar
- Last payment information
- Overdue warnings
- Refresh button (force update from billing system)
- Responsive card design

---

## 📞 Feature 3: AI Call Center (WebRTC)

### Backend Implementation

**Files Created:**
- `backend/app/routes_calls.py` - Call initiation, WebSocket handling, call logs

**Database Schema:**
```sql
CREATE TABLE call_logs (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    call_type TEXT NOT NULL,          -- webrtc, voice_message
    duration_seconds INTEGER DEFAULT 0,
    transcript_summary TEXT,
    sentiment TEXT,                   -- positive, neutral, negative
    resolved INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0.0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**API Endpoints:**
```
POST   /api/call/initiate    - Start WebRTC session
WS     /ws/call/{session_id} - WebSocket for real-time audio
POST   /api/call/end         - End call and get summary
GET    /api/call/logs        - Get user's call history
```

**Call Flow:**

1. **Initiate Call:**
   ```bash
   curl -X POST http://localhost:8000/api/call/initiate \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json"
   ```

   Response:
   ```json
   {
     "session_id": "session_1709481600_a3f5b2",
     "ws_url": "/ws/call/session_1709481600_a3f5b2",
     "ephemeral_token": "eph_token_xyz123"
   }
   ```

2. **Connect WebSocket:**
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/ws/call/session_1709481600_a3f5b2');
   ```

3. **Stream Audio:**
   - Client sends audio chunks via WebSocket
   - Server forwards to OpenAI Realtime API
   - Server streams AI responses back to client

4. **End Call:**
   ```bash
   curl -X POST http://localhost:8000/api/call/end \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"session_id": "session_1709481600_a3f5b2"}'
   ```

   Response:
   ```json
   {
     "session_id": "session_1709481600_a3f5b2",
     "duration_seconds": 245,
     "transcript_summary": "User inquired about plan upgrade. Agent provided information.",
     "sentiment": "positive",
     "resolved": true,
     "cost_usd": 0.245,
     "started_at": "2026-03-03T10:00:00",
     "ended_at": "2026-03-03T10:04:05"
   }
   ```

### Frontend Implementation

**Component:** `ChatBotApp/src/components/AICallCenter.tsx`

**Features:**
- One-click call initiation
- Real-time call duration timer
- WebSocket connection status
- Call history with transcripts
- Cost tracking
- Sentiment analysis display
- Responsive UI with animations

### OpenAI Realtime API Integration

**Configuration:**
- Model: `gpt-4o-realtime-preview-2024-12-17`
- Voice: `alloy` (configurable: echo, fable, onyx, nova, shimmer)
- Pricing: ~$0.06/minute audio

**Required Environment Variables:**
```env
OPENAI_API_KEY=your_api_key
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-12-17
OPENAI_VOICE=alloy
```

---

## 🔐 Authentication System

### JWT Token-based Authentication

**Files:**
- `backend/app/auth.py` - JWT utilities and middleware
- `backend/app/routes_auth.py` - Auth API endpoints
- `backend/app/models.py` - Pydantic schemas

**Endpoints:**
```
POST   /api/auth/register  - Register new user
POST   /api/auth/login     - Login and get JWT tokens
POST   /api/auth/refresh   - Refresh access token
GET    /api/auth/me        - Get current user info
```

**Token Flow:**
1. User registers/logs in → receives `access_token` and `refresh_token`
2. Access token expires in 60 minutes
3. Refresh token lasts 7 days
4. Protected routes require `Authorization: Bearer {access_token}` header

**Example:**
```javascript
// Register
const response = await authApi.register(
  'username', 
  'email@example.com', 
  'password123',
  'CUST123',      // Optional customer_id
  '1234567890'    // Optional account_number
);

// Login
const { access_token, refresh_token } = await authApi.login('username', 'password123');

// Store tokens
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Make authenticated request
const tickets = await fetch('/api/tickets', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

---

## 🛠️ Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Edit .env with your API keys
nano .env

# Run database migrations (tables created automatically)
python -c "from app.database import init_db; init_db()"

# Start server
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd ChatBotApp

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📦 Dependencies Added

### Backend (`requirements.txt`)
```
fastapi
uvicorn[standard]
python-dotenv
pydantic[email]
python-jose[cryptography]    # JWT handling
passlib[bcrypt]               # Password hashing
python-multipart              # Form data
httpx                         # HTTP client
websockets                    # WebSocket support
```

### Frontend
No new dependencies required - uses existing React + shadcn/ui components.

---

## 🔒 Security Considerations

### 1. Authentication
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookies recommended for production
- ⚠️ Change `JWT_SECRET_KEY` in production!

### 2. Authorization
- ✅ User-scoped data access (users can only see their own tickets/balance)
- ✅ Token verification on all protected routes
- ✅ Role-based access control structure in place

### 3. API Security
- ✅ CORS configuration
- ✅ Input validation with Pydantic
- ✅ SQL injection prevention (parameterized queries)
- ⚠️ Add rate limiting in production
- ⚠️ Add request size limits

### 4. Data Privacy
- ✅ User data isolated by user_id
- ✅ Sensitive data not logged
- ⚠️ Add encryption for PII in database
- ⚠️ Implement audit logging

---

## 🚀 Production Deployment Checklist

### Environment
- [ ] Change `JWT_SECRET_KEY` to strong random value
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `CORS_ORIGINS` for production domains
- [ ] Use HTTPS for all endpoints
- [ ] Enable rate limiting

### Database
- [ ] Migrate to PostgreSQL for better concurrency
- [ ] Set up database backups
- [ ] Add database indexes for performance
- [ ] Implement connection pooling

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add application logging
- [ ] Monitor API performance
- [ ] Track WebRTC call quality

### Infrastructure
- [ ] Use load balancer
- [ ] Set up CDN for static assets
- [ ] Configure auto-scaling
- [ ] Implement health checks

### Security
- [ ] Add HTTPS/TLS certificates
- [ ] Enable rate limiting (e.g., 60 req/min per user)
- [ ] Implement IP whitelisting for admin routes
- [ ] Add CSRF protection
- [ ] Regular security audits

---

## 📊 Cost Estimates

### OpenAI Realtime API
- Audio streaming: ~$0.06 per minute
- 100 calls/day × 5 min avg = 500 min/day = **$30/day**
- Monthly: **~$900**

### N8N Workflows
- Self-hosted: Free (server costs only)
- Cloud: Depends on execution count

### Total Estimated Monthly Cost (100 calls/day):
- OpenAI Realtime: $900
- OpenAI LLM (text chat): $50-100
- Google TTS: $20-50
- Infrastructure: $100-200
- **Total: ~$1,070 - $1,250/month**

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Save the access_token from response

# 3. Create a ticket
curl -X POST http://localhost:8000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test ticket",
    "description":"This is a test",
    "category":"technical",
    "priority":"medium",
    "contact_number":"09171234567"
  }'

# 4. Get balance
curl -X GET http://localhost:8000/api/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🤝 Support

For issues or questions:
1. Check the API docs at `/docs`
2. Review error logs in console
3. Verify environment variables are set correctly
4. Ensure database is initialized

---

## 📝 License

This is a proprietary project for PLDT customer service automation.
