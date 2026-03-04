import type { VoiceResponse} from "../components/types";

// FastAPI Backend URL (Python-PLDT)
const BASE_URL = "http://localhost:8000";

export const api = {
  // text chat
  sendMessage: async (message: string, sessionId: string) => {
    const res = await fetch(`${BASE_URL}/text-chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // 👇 THIS IS THE MAGIC FIX 👇
        "ngrok-skip-browser-warning": "true" 
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to send message");
    }
    
    return res.json();
  },

  // voice chat
  sendAudio: async (audioBlob: Blob, sessionId: string) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("session_id", sessionId);

    const res = await fetch(`${BASE_URL}/voice-chat`, {
      method: "POST",
      // 👇 ADD THE HEADER HERE TOO 👇
      headers: {
        "ngrok-skip-browser-warning": "true"
      },
      body: formData, 
    });

    if (!res.ok) throw new Error("Voice API failed");
    return res.json() as Promise<VoiceResponse>;
  },

  getAudioUrl: (filename: string) => {
    return `${BASE_URL}/audio/${filename}`;
  }
};