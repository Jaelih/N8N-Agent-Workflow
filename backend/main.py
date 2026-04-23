from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from app.stt import transcribe_audio
from app.tts import speak, get_remaining_credits
from app.agent import run_agent
from app.database import init_db, save_message, get_history, clear_history
from fastapi.middleware.cors import CORSMiddleware

import shutil
import os

load_dotenv()
init_db()

app = FastAPI(title="PLDT Gabby Voice Agent")
# 👇 UPDATED CORS SECTION 👇
origins = [
    "http://localhost:5173",    # Local dev frontend
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # Docker frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Explicitly allow your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],        # Allows the ngrok-skip header
)

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

    # Step 2: Run LangChain Agent
    agent_response = run_agent(user_text, session_id)
    print(f"Gabby [{session_id}]: {agent_response}")

    # Step 3: Save conversation
    save_message(session_id, "user", user_text)
    save_message(session_id, "assistant", agent_response)

    # Step 4: TTS
    filename = f"response_{session_id}.mp3"
    audio_path = f"/app/audio/{filename}"
    await speak(agent_response, output_path=audio_path)

    return {
        "session_id": session_id,
        "transcript": user_text,
        "response_text": agent_response,
        "audio_file": filename    # ← change from audio_path to filename
    }

@app.post("/text-chat")
async def text_chat(body: dict):
    user_input = body.get("message", "")
    session_id = body.get("session_id", "default")

    response = run_agent(user_input, session_id)

    save_message(session_id, "user", user_input)
    save_message(session_id, "assistant", response)

    return {
        "session_id": session_id,
        "response": response
    }

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    path = f"/app/audio/{filename}"
    if os.path.exists(path):
        return FileResponse(path, media_type="audio/mpeg")
    return {"error": "Audio file not found"}


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    clear_history(session_id)
    return {"message": f"Session {session_id} cleared."}


@app.get("/credits")
async def check_credits():
    return {"remaining_credits": get_remaining_credits()}


@app.get("/health")
async def health():
    return {"status": "Gabby is running!"}