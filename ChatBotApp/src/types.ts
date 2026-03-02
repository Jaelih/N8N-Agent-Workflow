export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VoiceResponse {
  session_id: string;
  transcript: string;
  response_text: string;
  audio_file: string; // The filename returned by FastAPI
}