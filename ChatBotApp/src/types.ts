export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string; // Optional audio URL for voice responses
}

export interface VoiceResponse {
  session_id: string;
  transcript: string;
  response_text: string;
  audio_file: string; // The filename returned by FastAPI
}