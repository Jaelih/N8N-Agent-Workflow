import type { VoiceResponse} from "../components/types";

// FastAPI Backend URL (Python-PLDT)
const BASE_URL = "http://localhost:8000";

// Token management
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Create headers with auth token
const getHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Auth API
export const authApi = {
  register: async (username: string, email: string, password: string, customerID?: string, accountNumber?: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        username,
        email,
        password,
        customer_id: customerID,
        account_number: accountNumber
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Registration failed");
    }
    
    return res.json();
  },

  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Login failed");
    }
    
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  logout: () => {
    clearTokens();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: getHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to get user info");
    }
    
    return res.json();
  }
};

// Tickets API
export const ticketsApi = {
  create: async (title: string, description: string, category: string, priority: string, contactNumber: string) => {
    const res = await fetch(`${BASE_URL}/api/tickets`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        title,
        description,
        category,
        priority,
        contact_number: contactNumber
      }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to create ticket");
    }
    
    return res.json();
  },

  getAll: async (page = 1, pageSize = 20) => {
    const res = await fetch(`${BASE_URL}/api/tickets?page=${page}&page_size=${pageSize}`, {
      headers: getHeaders(true),
    });
    
    if (!res.ok) throw new Error("Failed to fetch tickets");
    return res.json();
  },

  getById: async (ticketId: string) => {
    const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
      headers: getHeaders(true),
    });
    
    if (!res.ok) throw new Error("Failed to fetch ticket");
    return res.json();
  },

  update: async (ticketId: string, updates: any) => {
    const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) throw new Error("Failed to update ticket");
    return res.json();
  },

  delete: async (ticketId: string) => {
    const res = await fetch(`${BASE_URL}/api/tickets/${ticketId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    
    if (!res.ok) throw new Error("Failed to delete ticket");
  }
};

// Balance API
export const balanceApi = {
  get: async () => {
    const res = await fetch(`${BASE_URL}/api/balance`, {
      headers: getHeaders(true),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Failed to fetch balance");
    }
    
    return res.json();
  },

  refresh: async () => {
    const res = await fetch(`${BASE_URL}/api/balance/refresh`, {
      method: "POST",
      headers: getHeaders(true),
    });
    
    if (!res.ok) throw new Error("Failed to refresh balance");
    return res.json();
  }
};

// Call Center API
export const callApi = {
  initiate: async (sessionId?: string) => {
    const res = await fetch(`${BASE_URL}/api/call/initiate`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!res.ok) throw new Error("Failed to initiate call");
    return res.json();
  },

  end: async (sessionId: string) => {
    const res = await fetch(`${BASE_URL}/api/call/end`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!res.ok) throw new Error("Failed to end call");
    return res.json();
  },

  getLogs: async (limit = 20) => {
    const res = await fetch(`${BASE_URL}/api/call/logs?limit=${limit}`, {
      headers: getHeaders(true),
    });
    
    if (!res.ok) throw new Error("Failed to fetch call logs");
    return res.json();
  }
};

// Original chat API (unchanged)
export const api = {
  // text chat
  sendMessage: async (message: string, sessionId: string) => {
    const res = await fetch(`${BASE_URL}/text-chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
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