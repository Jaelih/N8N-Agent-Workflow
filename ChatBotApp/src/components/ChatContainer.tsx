'use client'

import { useState, useRef, useEffect } from 'react'
import type { Message } from './types'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'

const MOCK_RESPONSES = [
  "I'm here to help! What would you like to know?",
  "That's an interesting question. Let me think about that...",
  "I understand what you're asking. Here's what I think:",
  "Good point! Based on what you've shared, I'd suggest:",
  "Let me help you with that. Have you considered:",
]

const getRandomResponse = () => {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Mock bot response with realistic delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getRandomResponse(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1200 + Math.random() * 800)
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
                Always here to help
              </p>
            </div>
          </div>
          
          {/* Right: Connection Status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pldt-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pldt-green"></span>
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
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  )
}

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = [
    'Tell me a fun fact',
    'Help me brainstorm ideas',
    'Explain something complex',
    'Give me advice',
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
        Start a conversation
      </h2>
      <p className="text-base text-gray-500 max-w-md mb-8">
        Send a message to begin chatting. We are here to help with whatever you need.
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
