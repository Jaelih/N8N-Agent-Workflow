from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.stt import transcribe_audio
from app.tts import speak, get_remaining_credits
from app.agent import run_agent
from app.database import init_db, save_message, get_history, clear_history

# Import new route modules
from app.routes_auth import router as auth_router
from app.routes_tickets import router as tickets_router
from app.routes_balance import router as balance_router
from app.routes_calls import router as calls_router

import shutil
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()
init_db()

app = FastAPI(
    title="PLDT Gabby Voice Agent API",
    description="AI-powered customer service with voice, chat, and call center features",
    version="2.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",    # React Frontend (Dev)
    "http://127.0.0.1:5173",    # Alternative Localhost
    "http://localhost:3000",    # Production Frontend (Docker)
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include new API routers
app.include_router(auth_router)
app.include_router(tickets_router)
app.include_router(balance_router)
app.include_router(calls_router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "features": ["auth", "tickets", "balance", "calls", "voice", "chat"]
    }

@app.post("/voice-chat")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: str = Form(default="default")
):
    temp_path = f"temp_{session_id}.wav"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    # Step 1: STT
    user_text = transcribe_audio(temp_path)
    os.remove(temp_path)
    print(f"Customer [{session_id}]: {user_text}")

    # Step 2: Get chat history
    history = get_history(session_id)

    # Step 3: Run LangChain Agent
    agent_response = run_agent(user_text, history)
    print(f"Gabby [{session_id}]: {agent_response}")

    # Step 4: Save conversation
    save_message(session_id, "user", user_text)
    save_message(session_id, "assistant", agent_response)

    # Step 5: TTS
    audio_path = f"response_{session_id}.mp3"
    await speak(agent_response, output_path=audio_path)

    return {
        "session_id": session_id,
        "transcript": user_text,
        "response_text": agent_response,
        "audio_file": audio_path
    }


@app.post("/text-chat")
async def text_chat(body: dict):
    user_input = body.get("message", "")
    session_id = body.get("session_id", "default")

    history = get_history(session_id)

    response = run_agent(user_input, history)

    save_message(session_id, "user", user_input)
    save_message(session_id, "assistant", response)

    return {
        "session_id": session_id,
        "response": response
    }


@app.get("/audio/{filename}")
async def get_audio(filename: str):
    if os.path.exists(filename):
        return FileResponse(filename, media_type="audio/mpeg")
    return {"error": "Audio file not found"}


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    clear_history(session_id)
    return {"message": f"Session {session_id} cleared."}


@app.get("/credits")
async def check_credits():
    return {"remaining_credits": get_remaining_credits()}


@app.get("/health")
async def health_check():
    """API health check with feature status"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "service": "PLDT Gabby Voice Agent",
        "features": ["auth", "tickets", "balance", "calls", "voice", "chat"]
    }