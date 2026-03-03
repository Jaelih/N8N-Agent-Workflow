'use client'

import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types' 
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import { api } from '../lib/api' // Import the API client

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Generate a random session ID once when the component mounts
  // This ensures the conversation history is tracked correctly on the backend
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll whenever messages change or typing status changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async (content: string) => {
    // 1. Create User Message object
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    // 2. Add to UI immediately (Optimistic update)
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      // 3. Send to Real Backend
      // This calls the FastAPI /text-chat endpoint via your api.ts
      const data = await api.sendMessage(content, sessionId);

      // 4. Create Assistant Message from Backend Response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response, // Python returns: { "response": "..." }
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error("Chat API Error:", error);
      
      // Handle Error gracefully in UI
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the server right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsTyping(true)

    try {
      // Send voice to backend
      const data = await api.sendAudio(audioBlob, sessionId)

      // Add user's transcribed message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: data.transcript,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Add assistant's response with audio
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response_text,
        timestamp: new Date(),
        audioUrl: data.audio_file ? api.getAudioUrl(data.audio_file) : undefined,
      }
      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error("Voice API Error:", error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process your voice message. Please try again or type your message.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* PLDT Support Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pldt-red rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-pldt-gray">
                PLDT Support
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Session: {sessionId}
              </p>
            </div>
          </div>
          
          {/* Right: Connection Status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-pldt-gray">Connected</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onVoiceMessage={handleVoiceMessage}
        disabled={isTyping}
        voiceEnabled={true}
      />
    </div>
  )
}

// --- Helper Component: Empty State ---

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    'Check my bill status',
    'Report internet issue',
    'Check for outages in my area',
    'What are your fiber plans?',
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-pldt-red flex items-center justify-center mb-6 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-white"
        >
          <path
            fillRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-pldt-gray mb-2">
        Kumusta! How can I help you today?
      </h2>
      <p className="text-base text-gray-500 max-w-md mb-8">
        I'm Gabby, your PLDT customer service assistant. Ask me about billing, technical issues, or plans.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-4 py-3 rounded-xl text-sm text-left
              bg-white
              border border-gray-200
              text-pldt-gray
              hover:border-pldt-red
              hover:bg-gray-50
              transition-all duration-200
              shadow-sm hover:shadow-md
              group"
          >
            <span className="group-hover:text-pldt-red transition-colors">
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}