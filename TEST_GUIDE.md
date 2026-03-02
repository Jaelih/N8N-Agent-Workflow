# Testing Guide - PLDT Voice AI Chatbot

## Quick Test Checklist

- [ ] Backend API is running
- [ ] Frontend is accessible
- [ ] N8N webhooks configured
- [ ] API keys in `.env` are valid
- [ ] Text chat works
- [ ] Voice recording works
- [ ] Audio playback works

## Step-by-Step Testing

### 1. Test Backend API (Without Docker)

```bash
cd backend

# Install dependencies (if not done)
pip install -r requirements.txt

# Download Whisper model (one-time, ~1.5GB)
python -c "import whisper; whisper.load_model('turbo')"

# Start backend server
uvicorn main:app --reload --port 8000
```

**Test health endpoint:**
```bash
curl http://localhost:8000/credits
# Expected: {"message": "Using Google Cloud TTS - 1M characters/month free"}
```

### 2. Test Frontend (Without Docker)

```bash
cd ChatBotApp

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Visit: http://localhost:5173

### 3. Test with Docker (Recommended)

```bash
# From project root
./start.sh

# Or manually
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

## API Testing

### Test 1: Health Check

```bash
curl http://localhost:8000/credits
```

**Expected Output:**
```json
{
  "message": "Using Google Cloud TTS - 1M characters/month free"
}
```

### Test 2: Text Chat

```bash
curl -X POST http://localhost:8000/text-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "session_id": "test123"
  }'
```

**Expected Output:**
```json
{
  "session_id": "test123",
  "response": "Good day! I'm Gabby, your PLDT customer service assistant..."
}
```

### Test 3: Voice Chat (with test audio)

First, create a test audio file or use existing:

```bash
# Using test_audio.wav from backend
curl -X POST http://localhost:8000/voice-chat \
  -F "audio=@backend/test_audio.wav" \
  -F "session_id=voice_test"
```

**Expected Output:**
```json
{
  "session_id": "voice_test",
  "transcript": "transcribed text here",
  "response_text": "Gabby's response here",
  "audio_file": "response_voice_test.mp3"
}
```

### Test 4: Get Audio File

```bash
# Get the generated audio
curl http://localhost:8000/audio/response_voice_test.mp3 \
  --output test_response.mp3

# Play it (Mac)
afplay test_response.mp3

# Or (Linux)
mpg123 test_response.mp3
```

### Test 5: Clear Session

```bash
curl -X DELETE http://localhost:8000/session/test123
```

**Expected Output:**
```json
{
  "message": "Session test123 cleared."
}
```

## Frontend Testing

### Test 1: Text Chat

1. Open http://localhost:3000 (or :5173 for dev)
2. Type: "Hello"
3. Press Enter or click send

**Expected:**
- Message appears in UI
- "Typing..." indicator shows
- Response from Gabby appears
- Timestamp shows

### Test 2: Voice Recording

1. Click microphone button 🎤
2. Browser asks for permission (first time)
3. Timer starts counting
4. Speak: "Hello, I need help"
5. Click stop (square button)

**Expected:**
- Recording indicator pulses red
- Timer shows elapsed time
- Message processes
- Transcription appears as user message
- Gabby responds with text + audio
- Audio player appears and plays automatically

### Test 3: Multiple Messages

Send several messages in sequence:

```
You: "Hello"
Gabby: [responds]
You: "What's my bill?"
Gabby: [asks for account number]
You: "123456"
Gabby: [shows bill info]
```

**Expected:**
- Conversation flows naturally
- Context is maintained
- Messages scroll properly

### Test 4: Error Handling

**Test offline backend:**
1. Stop backend: `docker compose stop backend`
2. Try sending message
3. Error message should appear

**Test invalid session:**
1. Open browser console
2. Send message
3. Check network tab for requests

## N8N Webhook Testing

### Setup N8N First

```bash
# N8N should be running at http://localhost:6789
docker compose ps n8n

# Import workflow
# 1. Visit http://localhost:6789
# 2. Click "..." → "Import from file"
# 3. Select "My workflow.json"
# 4. Activate workflow
```

### Test Webhooks Individually

**Billing Webhook:**
```bash
curl -X POST http://localhost:6789/webhook/billing \
  -H "Content-Type: application/json" \
  -d '{"User_Request": "Get billing info for account 123456"}'
```

**Customer Webhook:**
```bash
curl -X POST http://localhost:6789/webhook/customer \
  -H "Content-Type: application/json" \
  -d '{"User_Request": "Get customer info for ID CUST001"}'
```

**Network Webhook:**
```bash
curl -X POST http://localhost:6789/webhook/network \
  -H "Content-Type: application/json" \
  -d '{"User_Request": "Check network status in Manila"}'
```

**Expected:** Each should return relevant data from CSV files in `/data/`

### Update Backend with Webhook URLs

After getting webhook URLs from N8N, update `.env`:

```env
N8N_BILLING_WEBHOOK=http://n8n:5678/webhook/billing
N8N_CUSTOMER_WEBHOOK=http://n8n:5678/webhook/customer
N8N_TICKET_WEBHOOK=http://n8n:5678/webhook/ticket
N8N_NETWORK_WEBHOOK=http://n8n:5678/webhook/network
N8N_KNOWLEDGE_WEBHOOK=http://n8n:5678/webhook/knowledge
```

Then restart:
```bash
docker compose restart backend
```

## Automated Test Script

Use the provided test script:

```bash
# Make executable (if not already)
chmod +x test-integration.sh

# Run all tests
./test-integration.sh
```

## Common Test Scenarios

### Scenario 1: Billing Inquiry (English)

**User:** "What's my current bill?"  
**Expected:** Agent asks for account number

**User:** "123456"  
**Expected:** Shows billing information from N8N

### Scenario 2: Internet Issue (Filipino)

**User (voice):** 🎤 "Wala pong internet"  
**Expected:** 
- Transcribes to text
- Agent asks what area
- Audio response plays

### Scenario 3: Mixed Language (Taglish)

**User:** "Hello, may problema yung connection"  
**Expected:** Agent responds in Taglish

### Scenario 4: Outage Check

**User:** "Is there an outage in Makati?"  
**Expected:** Agent calls network webhook, returns status

## Performance Testing

### Response Time Test

```bash
time curl -X POST http://localhost:8000/text-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "perf_test"}'
```

**Target:** < 5 seconds for text chat

### Voice Processing Time

Record a 5-second audio clip:
```bash
time curl -X POST http://localhost:8000/voice-chat \
  -F "audio=@test_audio.wav" \
  -F "session_id=perf_test"
```

**Target:** < 15 seconds total (STT + AI + TTS)

### Concurrent Users

```bash
# Install Apache Bench (if needed)
# brew install httpd (Mac)

# Test 10 concurrent requests
ab -n 100 -c 10 -p test_payload.json -T application/json \
  http://localhost:8000/text-chat
```

## Troubleshooting Tests

### Backend Not Starting

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Missing .env file
# 2. Invalid API keys
# 3. Port 8000 already in use

# Fix port conflict
lsof -ti:8000 | xargs kill -9
```

### Voice Recording Not Working

**Browser Console Check:**
```javascript
// Open browser console (F12)
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('❌ Microphone error:', err);
  });
```

**Expected:** Permission prompt, then "✅ Microphone access granted"

### Audio Not Playing

**Browser Console Check:**
```javascript
// Check if audio URL is accessible
fetch('http://localhost:8000/audio/response_default.mp3')
  .then(r => console.log('✅ Audio accessible:', r.status))
  .catch(e => console.error('❌ Audio error:', e));
```

### N8N Webhook Errors

```bash
# Check N8N is running
docker compose ps n8n

# Check N8N logs
docker compose logs n8n

# Test webhook directly in browser
# Visit: http://localhost:6789/webhook/billing
```

## Test Data

The system uses CSV files in `/data/`:

- `customers.csv` - Customer information
- `billing.csv` - Billing records
- `tickets.csv` - Support tickets
- `network_status.csv` - Network outage data
- `knowledge_base.json` - FAQs

You can edit these files to test different scenarios.

## Success Criteria

✅ **Backend is working if:**
- Health endpoint returns 200
- Text chat returns response in < 5s
- Voice chat transcribes audio correctly
- TTS generates audio file
- N8N webhooks respond

✅ **Frontend is working if:**
- UI loads without errors
- Can send text messages
- Can record voice (after permission)
- Audio plays automatically
- Messages display correctly
- Session ID shown in header

✅ **Integration is working if:**
- End-to-end text conversation flows
- Voice message → transcription → response → audio
- AI agent uses tools correctly
- Context maintained across messages
- Error messages handled gracefully

## Debug Mode

Enable verbose logging:

**Backend:**
```bash
# Edit backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```bash
# Open browser console (F12)
# All API calls and errors logged
```

## Next Steps After Testing

Once all tests pass:

1. ✅ Configure production N8N webhooks
2. ✅ Set up proper authentication
3. ✅ Deploy to production server
4. ✅ Set up monitoring
5. ✅ Create user documentation
6. ✅ Train support team

## Support

If tests fail, check:
1. `docker compose logs -f` - All service logs
2. Browser console (F12) - Frontend errors
3. Network tab - API request/response
4. `SETUP.md` - Configuration guide
5. `.env` file - All keys present and valid

---

**Happy Testing! 🚀**
