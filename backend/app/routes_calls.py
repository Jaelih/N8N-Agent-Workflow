"""
AI Call Center routes: WebRTC call initiation, WebSocket handling, call logs
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from app.models import CallInitiate, CallInitiateResponse, CallEnd, CallSummary, CallLogResponse
from app.auth import get_current_user
from app.database import create_call_log, update_call_log, get_call_logs
import os
import json
import asyncio
import secrets
from datetime import datetime
from typing import Dict
import httpx

router = APIRouter(prefix="/api/call", tags=["AI Call Center"])

# Store active call sessions
active_calls: Dict[str, dict] = {}


def generate_session_id() -> str:
    """Generate unique session ID for call"""
    return f"session_{int(datetime.utcnow().timestamp())}_{secrets.token_hex(4)}"


async def get_openai_ephemeral_token() -> str:
    """
    Get ephemeral token from OpenAI Realtime API.
    This token is session-specific and expires quickly.
    Docs: https://platform.openai.com/docs/guides/realtime
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/realtime/sessions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-realtime-preview-2024-12-17",
                    "voice": "alloy"  # or "echo", "fable", "onyx", "nova", "shimmer"
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("client_secret", {}).get("value", "")
            else:
                print(f"OpenAI API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to get OpenAI session token"
                )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="OpenAI API timeout")
    except Exception as e:
        print(f"Error getting ephemeral token: {e}")
        raise HTTPException(status_code=500, detail=f"Token generation failed: {str(e)}")


@router.post("/initiate", response_model=CallInitiateResponse)
async def initiate_call(
    call_data: CallInitiate,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate a new WebRTC call session.
    Returns WebSocket URL and OpenAI ephemeral token for client-side connection.
    """
    session_id = call_data.session_id or generate_session_id()
    
    # Get ephemeral token from OpenAI
    try:
        ephemeral_token = await get_openai_ephemeral_token()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize call: {str(e)}")
    
    # Create call log entry
    call_id = create_call_log(
        user_id=current_user["user_id"],
        session_id=session_id,
        call_type="webrtc"
    )
    
    # Store active call info
    active_calls[session_id] = {
        "call_id": call_id,
        "user_id": current_user["user_id"],
        "started_at": datetime.utcnow(),
        "transcript": []
    }
    
    # Return connection details
    return CallInitiateResponse(
        session_id=session_id,
        ws_url=f"/ws/call/{session_id}",  # Client connects here
        ephemeral_token=ephemeral_token
    )


@router.websocket("/ws/call/{session_id}")
async def websocket_call_handler(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time call audio streaming.
    
    Flow:
    1. Client connects with session_id
    2. Server forwards audio to OpenAI Realtime API
    3. Server streams AI responses back to client
    4. Logs transcript and metrics
    """
    await websocket.accept()
    
    if session_id not in active_calls:
        await websocket.send_json({
            "type": "error",
            "message": "Invalid session ID"
        })
        await websocket.close()
        return
    
    call_info = active_calls[session_id]
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "Call connected"
        })
        
        # Handle bidirectional audio streaming
        # Note: This is a simplified version. Full implementation requires
        # proper WebRTC signaling and OpenAI Realtime WebSocket connection
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "audio":
                # In production, forward this to OpenAI Realtime API
                # and stream response back to client
                # For now, echo back a status
                call_info["transcript"].append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "type": "user_audio",
                    "duration_ms": message.get("duration", 0)
                })
                
            elif message.get("type") == "transcript":
                # Store user transcript
                call_info["transcript"].append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "speaker": "user",
                    "text": message.get("text", "")
                })
                
            elif message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        print(f"Client disconnected from call {session_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        await websocket.close()


@router.post("/end", response_model=CallSummary)
async def end_call(
    call_data: CallEnd,
    current_user: dict = Depends(get_current_user)
):
    """
    End a call session and generate summary.
    """
    session_id = call_data.session_id
    
    if session_id not in active_calls:
        raise HTTPException(status_code=404, detail="Call session not found")
    
    call_info = active_calls[session_id]
    
    # Verify ownership
    if call_info["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Calculate duration
    started_at = call_info["started_at"]
    ended_at = datetime.utcnow()
    duration_seconds = int((ended_at - started_at).total_seconds())
    
    # Generate transcript summary
    transcript_texts = [
        t.get("text", "") for t in call_info["transcript"] 
        if t.get("speaker") and t.get("text")
    ]
    transcript_summary = " | ".join(transcript_texts[:10])  # First 10 messages
    
    # Estimate cost (OpenAI Realtime API pricing: ~$0.06/minute for audio)
    cost_usd = round((duration_seconds / 60) * 0.06, 4)
    
    # Determine sentiment (simplified - could use AI for this)
    sentiment = "neutral"
    
    # Check if resolved (simplified logic)
    resolved = any("thank" in t.lower() or "solved" in t.lower() for t in transcript_texts)
    
    # Update call log
    update_call_log(call_info["call_id"], {
        "duration_seconds": duration_seconds,
        "transcript_summary": transcript_summary or "No transcript available",
        "sentiment": sentiment,
        "resolved": 1 if resolved else 0,
        "cost_usd": cost_usd,
        "ended_at": ended_at
    })
    
    # Remove from active calls
    del active_calls[session_id]
    
    return CallSummary(
        session_id=session_id,
        duration_seconds=duration_seconds,
        transcript_summary=transcript_summary or "No transcript available",
        sentiment=sentiment,
        resolved=resolved,
        cost_usd=cost_usd,
        started_at=started_at,
        ended_at=ended_at
    )


@router.get("/logs", response_model=list[CallLogResponse])
async def get_call_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's call history"""
    logs = get_call_logs(current_user["user_id"], limit)
    return [CallLogResponse(**log) for log in logs]
