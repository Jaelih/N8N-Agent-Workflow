// Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface VoiceResponse {
  session_id: string;
  transcript: string;
  response_text: string;
  audio_file: string;
}

// Call Types
export type CallState = 'idle' | 'connecting' | 'active' | 'ending';
export type AgentState = 'ready' | 'typing' | 'calling' | 'in-call';

export interface CallSession {
  session_id: string;
  ws_url: string;
  ephemeral_token: string;
}

export interface CallLog {
  id: string;
  session_id: string;
  call_type: string;
  duration_seconds: number;
  transcript_summary: string | null;
  sentiment: string | null;
  resolved: boolean;
  cost_usd: number;
  started_at: string;
  ended_at: string | null;
}

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
}

// Balance Types
export interface Balance {
  account_number: string;
  current_balance: number;
  due_date: string | null;
  last_payment_amount: number | null;
  last_payment_date: string | null;
  plan_name: string | null;
  monthly_fee: number | null;
  data_usage_gb: number;
  data_limit_gb: number | null;
  status: string;
  updated_at: string;
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
}

// Component Props
export interface MessageBubbleProps {
  message: Message;
}

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onVoiceMessage?: (audioBlob: Blob) => void;
  disabled?: boolean;
  voiceEnabled?: boolean;
}

export interface RadialVisualizationProps {
  status: CallState;
  duration: number;
}
