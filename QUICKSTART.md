# 🚀 Quick Start Guide

## Overview

This guide will help you get the enhanced PLDT Voice Agent system up and running with the three new features:
1. **Enhanced Ticket Management** - Full CRUD operations
2. **Postpaid Balance** - Real-time balance checking
3. **AI Call Center** - WebRTC-based live calls with AI

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- OpenAI API key (for LLM and Realtime API)
- N8N instance (with webhooks configured)
- Google TTS API key (optional, for text-to-speech)

---

## 📦 Installation

### Step 1: Clone and Setup Backend

```bash
cd N8N-Agent-Workflow/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

```bash
# Copy example environment file
cp ../.env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor
```

**Required configuration:**
```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct:free

# JWT (CRITICAL: Change this!)
JWT_SECRET_KEY=your-very-long-random-secret-key-change-this

# N8N Webhooks (adjust to your N8N instance)
N8N_BILLING_WEBHOOK=https://your-n8n.com/webhook/billing
N8N_CUSTOMER_WEBHOOK=https://your-n8n.com/webhook/customer
N8N_TICKET_WEBHOOK=https://your-n8n.com/webhook/ticket
N8N_NETWORK_WEBHOOK=https://your-n8n.com/webhook/network
N8N_KNOWLEDGE_WEBHOOK=https://your-n8n.com/webhook/knowledge
N8N_API_KEY=your_n8n_api_key
```

### Step 3: Initialize Database

```bash
# The database tables will be created automatically on first run
# Or manually initialize:
python -c "from app.database import init_db; init_db()"
```

### Step 4: Start Backend Server

```bash
# Development mode (with auto-reload)
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Server will be running at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Step 5: Setup Frontend

```bash
cd ../ChatBotApp

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: http://localhost:5173

---

## 🧪 Testing the New Features

### 1. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "customer_id": "CUST001",
    "account_number": "1234567890"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

**Save the `access_token` from the response!**

### 2. Test Ticket Management

```bash
# Set your token
TOKEN="your_access_token_here"

# Create a ticket
curl -X POST http://localhost:8000/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Slow internet connection",
    "description": "My internet has been very slow for the past 3 days. Please help.",
    "category": "technical",
    "priority": "high",
    "contact_number": "09171234567"
  }'

# Get all tickets
curl -X GET http://localhost:8000/api/tickets \
  -H "Authorization: Bearer $TOKEN"

# Update ticket status
curl -X PATCH http://localhost:8000/api/tickets/TKT-1234567890-ABC123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### 3. Test Postpaid Balance

```bash
# Get balance (cached)
curl -X GET http://localhost:8000/api/balance \
  -H "Authorization: Bearer $TOKEN"

# Force refresh from billing system
curl -X POST http://localhost:8000/api/balance/refresh \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test AI Call Center

**Via Frontend:**
1. Open http://localhost:5173
2. Login with your credentials
3. Navigate to "AI Call Center" section
4. Click "Start Call"
5. Use your microphone to speak with the AI agent
6. Click "End Call" when finished

**Via API:**
```bash
# Initiate call
curl -X POST http://localhost:8000/api/call/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Get call logs
curl -X GET http://localhost:8000/api/call/logs \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🖥️ Using the Frontend

### 1. Login/Register

Open http://localhost:5173 and you'll see:
- **New User?** Click "Register" to create an account
- **Existing User?** Enter username and password to login

### 2. Dashboard

After login, you'll have access to:
- **Chat Interface** (existing feature)
- **Ticket Manager** (new!)
- **Balance Display** (new!)
- **AI Call Center** (new!)

### 3. Creating a Ticket

1. Click "Create New Ticket"
2. Fill in the form:
   - Title (min 5 characters)
   - Description (min 10 characters)
   - Category (technical, billing, account, general)
   - Priority (low, medium, high, urgent)
   - Contact number
3. Click "Submit Ticket"
4. Your ticket will appear in the list with a unique ID

### 4. Managing Tickets

- **View:** All your tickets are listed with status badges
- **Update Status:** Use the dropdown to change status
- **Delete:** Click the red "Delete" button
- **Filter:** (Coming soon) Filter by status, category, or date

### 5. Checking Balance

1. Navigate to "Balance" section
2. View your:
   - Current balance
   - Due date with countdown
   - Last payment details
   - Data usage with progress bar
3. Click "Refresh" to get latest data from billing system

### 6. AI Call Center

1. Click on "AI Call Center"
2. Click "Start Call" button
3. Allow microphone access when prompted
4. Speak naturally with the AI agent
5. The agent will respond with voice
6. Click "End Call" when done
7. View call summary with duration and cost
8. Check "Call History" to see past calls

---

## 📁 Project Structure (Updated)

```
N8N-Agent-Workflow/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── agent.py              # LangChain agent (existing)
│   │   ├── auth.py               # ✨ NEW: JWT authentication
│   │   ├── database.py           # ✨ ENHANCED: New tables & functions
│   │   ├── models.py             # ✨ NEW: Pydantic schemas
│   │   ├── n8n_api.py            # N8N integration (existing)
│   │   ├── routes_auth.py        # ✨ NEW: Auth endpoints
│   │   ├── routes_balance.py     # ✨ NEW: Balance endpoints
│   │   ├── routes_calls.py       # ✨ NEW: Call center endpoints
│   │   ├── routes_tickets.py     # ✨ NEW: Ticket CRUD endpoints
│   │   ├── stt.py                # Speech-to-text (existing)
│   │   └── tts.py                # Text-to-speech (existing)
│   ├── main.py                   # ✨ UPDATED: Added new routes
│   └── requirements.txt          # ✨ UPDATED: New dependencies
├── ChatBotApp/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AICallCenter.tsx  # ✨ NEW: Call UI
│   │   │   ├── AuthForm.tsx      # ✨ NEW: Login/Register
│   │   │   ├── BalanceDisplay.tsx# ✨ NEW: Balance UI
│   │   │   ├── TicketManager.tsx # ✨ NEW: Ticket CRUD UI
│   │   │   └── ...               # Existing components
│   │   └── lib/
│   │       └── api.ts            # ✨ UPDATED: New API clients
│   └── ...
├── .env.example                  # ✨ NEW: Example configuration
├── NEW_FEATURES.md               # ✨ NEW: Feature documentation
├── PRODUCTION_GUIDE.md           # ✨ NEW: Production hardening
└── QUICKSTART.md                 # ✨ NEW: This file
```

---

## 🔧 Troubleshooting

### Backend won't start

**Problem:** `Import errors` or `Module not found`
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

**Problem:** `JWT_SECRET_KEY not configured`
```bash
# Solution: Set JWT secret in .env
echo "JWT_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_urlsafe(32))')" >> .env
```

### Authentication fails

**Problem:** `401 Unauthorized`
```bash
# Check if token is expired (60 min expiration)
# Login again to get a fresh token
```

**Problem:** `Invalid password`
```bash
# Ensure you're using the correct credentials
# Password must be at least 8 characters
```

### Tickets not showing

**Problem:** Empty ticket list
```bash
# Check if you're logged in with the correct user
# Tickets are user-scoped (you can only see your own)
```

### Balance returns 404

**Problem:** `Account not found`
```bash
# Ensure your user has an account_number set
# Update your profile or set during registration
```

### Call center connection fails

**Problem:** WebSocket connection error
```bash
# Check if backend is running on port 8000
# Ensure OPENAI_API_KEY is set in .env
# Check browser console for detailed errors
```

**Problem:** Microphone not working
```bash
# Browser: Allow microphone access when prompted
# System: Check system microphone permissions
```

---

## 🚀 Next Steps

### For Development

1. **Add Rate Limiting:**
   ```bash
   pip install slowapi
   ```
   See [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md) for implementation

2. **Enable HTTPS:**
   - Use nginx as reverse proxy
   - Get SSL certificate (Let's Encrypt)

3. **Set up logging:**
   - Configure structured logging
   - Add log rotation

4. **Add tests:**
   ```bash
   pip install pytest pytest-asyncio httpx
   # Create tests/ directory
   ```

### For Production

1. **Security:**
   - Change `JWT_SECRET_KEY` to a strong random value
   - Enable HTTPS/TLS
   - Set `ENVIRONMENT=production` in .env
   - Review [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)

2. **Database:**
   - Migrate from SQLite to PostgreSQL
   - Set up automated backups
   - Add database indexes

3. **Monitoring:**
   - Set up error tracking (Sentry)
   - Add health check monitoring
   - Configure alerting

4. **Scaling:**
   - Use gunicorn with multiple workers
   - Add Redis for caching
   - Implement load balancing

---

## 📚 Documentation

- **API Documentation:** http://localhost:8000/docs
- **Feature Guide:** [NEW_FEATURES.md](NEW_FEATURES.md)
- **Production Guide:** [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)
- **Original README:** [readme.md](readme.md)

---

## 💡 Tips

1. **Use API Documentation:** Visit `/docs` for interactive API testing
2. **Check Logs:** Backend logs appear in console - useful for debugging
3. **Database Location:** SQLite database is at `backend/db/chat_history.db`
4. **Reset Database:** Delete the database file to start fresh (loses all data!)
5. **Test with Postman:** Import API endpoints from `/docs` OpenAPI spec

---

## ❓ Getting Help

If you encounter issues:
1. Check the console/terminal for error messages
2. Review the logs in `backend/app.log` (if configured)
3. Verify environment variables are set correctly
4. Ensure all services (N8N, backend, frontend) are running
5. Check API documentation at `/docs`

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can access API docs at http://localhost:8000/docs
- [ ] Successfully registered a user
- [ ] Successfully logged in
- [ ] Created at least one ticket
- [ ] Viewed postpaid balance
- [ ] Initiated an AI call (if OpenAI Realtime API is configured)

Congratulations! 🎉 Your enhanced PLDT Voice Agent is now ready to use!
