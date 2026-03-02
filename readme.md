# PLDT Voice AI Chatbot - Complete System

An integrated AI customer service system with voice and text chat capabilities, built for PLDT telecom support.

## 🌟 Features

- **🎤 Voice Chat**: Record voice messages in Filipino, English, or Taglish
- **💬 Text Chat**: Traditional text-based chat interface
- **🤖 AI Agent**: LangChain-powered agent with tools for:
  - Billing status queries
  - Customer information lookup
  - Support ticket submission
  - Network outage checking
  - Knowledge base search
- **🎧 Natural TTS**: Google Cloud Text-to-Speech responses
- **🔄 N8N Integration**: Workflow automation for backend operations

## 📁 Project Structure

```
N8N-Agent-Workflow/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── agent.py        # LangChain AI agent with tools
│   │   ├── stt.py          # Whisper speech-to-text
│   │   ├── tts.py          # Google Cloud TTS
│   │   ├── database.py     # SQLite conversation storage
│   │   ├── n8n_api.py      # N8N webhook integration
│   │   └── mock_api.py     # Mock data for testing
│   ├── main.py             # FastAPI server
│   └── requirements.txt
├── ChatBotApp/             # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── VoiceRecorder.tsx    # 🎤 Voice recording
│   │   │   ├── AudioPlayer.tsx      # 🎧 Audio playback
│   │   │   └── ...
│   │   └── lib/
│   │       └── api.ts      # API client for backend
│   └── ...
├── data/                   # CSV data files
├── docker-compose.yml      # Multi-service Docker setup
└── My workflow.json        # N8N workflow configuration
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenRouter API key (free tier available)
- Google Cloud TTS API key
- Microphone access (for voice chat)

### 1. Clone and Setup

```bash
cd N8N-Agent-Workflow
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start All Services

```bash
docker compose up -d
```

This starts:
- **N8N**: http://localhost:6789
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000

### 3. Configure N8N Workflows

1. Open N8N at http://localhost:6789
2. Import `My workflow.json`
3. Configure webhook URLs in N8N
4. Copy webhook URLs to your `.env` file

### 4. Access the Chatbot

Open http://localhost:3000 and start chatting!

- **Text**: Type your message
- **Voice**: Click the microphone button to record

## 🔧 Development Setup (Without Docker)

### Backend

```bash
cd backend
pip install -r requirements.txt

# Download Whisper model (first run)
python -c "import whisper; whisper.load_model('turbo')"

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd ChatBotApp
npm install
npm run dev
```

## 🎯 Usage Examples

### Voice Chat (Filipino)
🎤 *"Gusto ko mag-report ng issue sa internet ko"*

🤖 *"Naku, sorry po sa abala. Para ma-check ko po yung account niyo, paki-bigay po ng account number?"*

### Text Chat (English)
💬 "What's my current bill?"

🤖 "I'd be happy to help you check your bill, Sir. May I have your account number please?"

### Mixed (Taglish)
🎤 *"May problem po yung connection namin, intermittent yung signal"*

🤖 *"I understand po, Sir. Taga-saan po kayo banda? Para ma-check ko if may outage sa area niyo."*

## 🛠️ API Endpoints

### POST /voice-chat
Send audio file, receive transcription + AI response + audio response

### POST /text-chat  
Send text message, receive AI response

### GET /audio/{filename}
Retrieve generated audio files

### DELETE /session/{session_id}
Clear conversation history

## 🔐 Environment Variables

See `.env.example` for all required configuration:

- `OPENAI_API_KEY` - OpenRouter API key
- `GOOGLE_TTS_API_KEY` - Google Cloud TTS API key
- `N8N_*_WEBHOOK` - N8N webhook URLs for data operations
- `NGROK_URL` - For external webhook access

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│  - Voice Input  │
│  - Text Input   │
│  - Audio Player │
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│  FastAPI Backend│ (Port 8000)
│  - Whisper STT  │
│  - LangChain AI │
│  - Google TTS   │
└────────┬────────┘
         │ Webhooks
┌────────▼────────┐
│      N8N        │ (Port 6789)
│  - Workflows    │
│  - Data Access  │
└─────────────────┘
```

## 🧪 Testing

```bash
# Test backend health
curl http://localhost:8000/credits

# Test text chat
curl -X POST http://localhost:8000/text-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'
```

## 🐛 Troubleshooting

### Voice recording not working
- Check browser microphone permissions
- Use HTTPS in production (required for microphone access)

### Backend connection errors
- Verify `.env` configuration
- Check if all services are running: `docker compose ps`
- View logs: `docker compose logs backend`

### Audio playback issues
- Ensure Google TTS API key is valid
- Check browser console for errors
- Verify audio file is generated: http://localhost:8000/audio/

## 📝 License

MIT

## 👥 Credits

Built for PLDT customer support automation

---

**Need help?** Check the logs with `docker compose logs -f`