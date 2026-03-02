# PLDT Voice AI - Setup Guide

## Prerequisites

### Required Software
- **Docker Desktop** (for containerized deployment)
- **Node.js 18+** (for local frontend development)
- **Python 3.11+** (for local backend development)
- **Modern browser** with microphone support (Chrome, Firefox, Safari)

### API Keys Required

1. **OpenRouter API** (Free tier available)
   - Sign up at https://openrouter.ai/
   - Get API key from https://openrouter.ai/keys
   - Free model: `qwen/qwen-2.5-72b-instruct:free`

2. **Google Cloud TTS API**
   - Create project at https://console.cloud.google.com/
   - Enable "Cloud Text-to-Speech API"
   - Create API key (Credentials → Create Credentials → API Key)
   - Free tier: 1 million characters/month

## Installation Steps

### 1. Clone and Configure

```bash
cd N8N-Agent-Workflow
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenRouter (LLM)
OPENAI_API_KEY=sk-or-v1-xxxxx
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL=qwen/qwen-2.5-72b-instruct:free

# Google Cloud TTS
GOOGLE_TTS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX

# N8N Webhooks (configure after N8N setup)
N8N_BILLING_WEBHOOK=http://n8n:5678/webhook/billing
N8N_CUSTOMER_WEBHOOK=http://n8n:5678/webhook/customer
N8N_TICKET_WEBHOOK=http://n8n:5678/webhook/ticket
N8N_NETWORK_WEBHOOK=http://n8n:5678/webhook/network
N8N_KNOWLEDGE_WEBHOOK=http://n8n:5678/webhook/knowledge
```

### 2. Start Services with Docker

```bash
# Option 1: Use the startup script
./start.sh

# Option 2: Manual Docker Compose
docker compose up -d
```

### 3. Configure N8N Workflows

1. Open N8N at http://localhost:6789
2. Complete the initial setup (create account)
3. Import the workflow:
   - Click "..." (top right) → "Import from file"
   - Select `My workflow.json`
4. Activate the workflow
5. Copy webhook URLs and update `.env`
6. Restart backend: `docker compose restart backend`

### 4. Test the System

Open http://localhost:3000 and try:

**Text Chat:**
- "Hello"
- "What's my bill?"

**Voice Chat:**
- Click microphone button
- Say: "Kumusta, gusto ko mag-inquire tungkol sa bill ko"
- Release to send

## N8N Workflow Setup

### Required Webhooks

Your N8N workflow should have these webhook nodes:

1. **Billing Agent** → `/webhook/billing`
   - Accepts: `{ "User_Request": "..." }`
   - Returns billing information

2. **Customer Agent** → `/webhook/customer`
   - Accepts: `{ "User_Request": "..." }`
   - Returns customer details

3. **Ticket Agent** → `/webhook/ticket`
   - Accepts: `{ "User_Request": "..." }`
   - Creates support ticket

4. **Network Status** → `/webhook/network`
   - Accepts: `{ "User_Request": "..." }`
   - Checks network outages

5. **Knowledge Base** → `/webhook/knowledge`
   - Accepts: `{ "User_Request": "..." }`
   - Searches FAQs

### Testing Webhooks

```bash
# Test billing webhook
curl -X POST http://localhost:6789/webhook/billing \
  -H "Content-Type: application/json" \
  -d '{"User_Request": "Get billing for account 123456"}'
```

## Local Development Setup

### Backend Only

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Download Whisper model (one-time, ~1.5GB)
python -c "import whisper; whisper.load_model('turbo')"

# Run server
uvicorn main:app --reload --port 8000
```

### Frontend Only

```bash
cd ChatBotApp

# Install dependencies
npm install

# Start dev server
npm run dev

# Frontend will be at http://localhost:5173
```

**Note:** Update frontend API URL in `ChatBotApp/src/lib/api.ts` if backend is not on port 8000.

## Troubleshooting

### Voice Recording Not Working

**Issue:** Microphone button doesn't work

**Solutions:**
- Check browser permissions (should prompt on first use)
- Use HTTPS in production (HTTP only works on localhost)
- Try a different browser (Chrome recommended)

### Backend Connection Errors

**Issue:** Frontend shows "connection error"

**Check:**
```bash
# Is backend running?
curl http://localhost:8000/credits

# Check logs
docker compose logs backend

# Check .env configuration
cat .env
```

### Whisper Model Download Issues

**Issue:** Backend crashes on first voice request

**Solution:**
```bash
# Pre-download model
docker compose exec backend python -c "import whisper; whisper.load_model('turbo')"

# Or download locally before building
cd backend
python -c "import whisper; whisper.load_model('turbo')"
```

### N8N Webhook Errors

**Issue:** Agent can't fetch data

**Check:**
1. N8N workflow is activated
2. Webhook URLs in `.env` match N8N
3. Test webhooks directly with curl
4. Check N8N logs for errors

### Google TTS Quota Exceeded

**Issue:** Audio responses stop working

**Solutions:**
- Check quota: https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas
- Free tier: 1M chars/month
- Add billing for more quota
- Alternative: Use ElevenLabs (update `tts.py`)

### Docker Build Errors

**Issue:** Container fails to build

**Solutions:**
```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d

# Check disk space
docker system df
docker system prune -a
```

## Performance Optimization

### Reduce Latency

1. **Use faster Whisper model**
   ```python
   # In backend/app/stt.py
   model = whisper.load_model("base")  # Faster, less accurate
   ```

2. **Cache LLM responses**
   - Add Redis for response caching
   - Cache common queries

3. **Run locally without Docker**
   - Faster startup and iteration
   - Better for development

### Cost Optimization

1. **OpenRouter**: Use free models
   - `qwen/qwen-2.5-72b-instruct:free`
   - `google/gemini-flash-1.5-8b:free`

2. **Google TTS**: Stay within free tier
   - Monitor usage daily
   - Implement response caching
   - Use shorter responses

## Security Considerations

### Production Deployment

1. **Environment Variables**
   ```bash
   # Never commit .env file
   echo ".env" >> .gitignore
   ```

2. **API Key Rotation**
   - Rotate keys every 90 days
   - Use separate keys for dev/prod

3. **HTTPS Only**
   ```yaml
   # Add to docker-compose.yml
   services:
     nginx:
       # Configure SSL certificates
   ```

4. **Rate Limiting**
   ```python
   # Add to main.py
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/voice-chat")
   @limiter.limit("10/minute")
   async def voice_chat(...):
   ```

## Next Steps

- ✅ Basic setup complete
- 📊 Configure N8N with real data sources
- 🎨 Customize frontend branding
- 🔐 Add user authentication
- 📱 Deploy to production
- 🧪 Add automated testing

## Support

Need help?
- Check logs: `docker compose logs -f`
- View errors: `docker compose logs backend --tail 50`
- Restart services: `docker compose restart`
- Full reset: `docker compose down -v && docker compose up -d`
