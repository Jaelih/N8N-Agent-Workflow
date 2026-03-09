'use client'

import { useState, useRef, useEffect } from 'react'
import { ReceiptText, Radio, Wrench, Wifi, Clock, Menu, PanelLeftOpen } from 'lucide-react'
import type { Message } from '../components/types'
import type { VoiceStatus } from './VoiceRecorder'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import { api } from '../lib/api'
import { stopCurrentAudio } from '../lib/audioManager'
import pldtIcon from '../../img/PLDT-Icon.png'

interface ChatContainerProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export default function ChatContainer({ onMenuClick, sidebarOpen }: ChatContainerProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
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
    // Stop any playing assistant audio when user sends a message
    stopCurrentAudio()

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

  const handleVoiceRecordingStart = () => {
    setVoiceStatus('recording')
  }

  const handleVoiceRecordingError = (error: Error) => {
    console.error('Microphone error:', error)
    setVoiceStatus('error')
    // Auto-reset after 3 s so the user can try again
    setTimeout(() => setVoiceStatus('idle'), 3000)
  }

  const handleVoiceMessage = async (audioBlob: Blob) => {
    // Phase 1: transcribing
    setVoiceStatus('processing')
    setIsTyping(true)

    try {
      // Phase 2: sending to AI backend
      setVoiceStatus('sending')
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
        audioUrl: data.audio_file ? api.getAudioUrl(data.audio_file) + `?t=${Date.now()}` : undefined,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Phase 3: done
      setVoiceStatus('success')
      setTimeout(() => setVoiceStatus('idle'), 2000)

    } catch (error) {
      console.error("Voice API Error:", error)
      setVoiceStatus('error')
      setTimeout(() => setVoiceStatus('idle'), 3000)

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
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="relative bg-gradient-to-br from-[#B8002A] via-[#C8002A] to-[#D50032] px-6 py-5 flex-shrink-0 shadow-xl overflow-hidden">
        {/* Subtle pattern overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative">
          {/* Main header content */}
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-5">
            {/* Left: hamburger (mobile/desktop toggle) */}
            <div className="flex items-center gap-2 w-16">
              {/* Hamburger — mobile only */}
              <button
                onClick={onMenuClick}
                className="lg:hidden flex-shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              {/* Desktop re-open button — only when sidebar is closed */}
              {!sidebarOpen && (
                <button
                  onClick={onMenuClick}
                  className="hidden lg:flex flex-shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Open sidebar"
                  title="Open sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Center: Bot avatar + name (perfectly centered) */}
            <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
              {/* Premium bot avatar - clean design */}
              <div className="relative flex-shrink-0">
                <div className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center
                  shadow-lg p-2.5">
                  <img src={pldtIcon} alt="PLDT Gabby AI" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-white font-bold text-lg leading-none tracking-tight">Gabby AI</h1>
                  <span className="bg-white/20 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2 py-0.5
                    rounded-md tracking-wide">
                    BETA
                  </span>
                </div>
                <p className="text-white/80 text-sm font-medium leading-none">Customer Support Assistant</p>
              </div>
            </div>

            {/* Right: online status with clean design */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              <span className="text-white font-semibold text-xs hidden sm:inline">Online</span>
            </div>
          </div>

          {/* Clean trust bar with 8px spacing system */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 flex items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-white flex-shrink-0" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Replies in <span className="font-bold">under 30 seconds</span>
                </p>
                <p className="text-white/70 text-xs mt-1 leading-none">No hold time • Instant support</p>
              </div>
            </div>
            <div className="bg-white/15 px-3 py-1.5 rounded-full">
              <span className="text-white font-bold text-xs tracking-wide">FREE 24/7</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Messages Area ───────────────────────────────────────── */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50/50 overflow-hidden flex justify-center">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto max-w-4xl"
        >
          {messages.length === 0 ? (
            /* Empty / onboarding state */
            <div className="px-4 py-6">
              <WelcomeCard onSuggestionClick={handleSendMessage} />
            </div>
          ) : (
            /* Active conversation - centered with max width */
            <div className="px-4 sm:px-6 py-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Input Area ──────────────────────────────────────────── */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onVoiceMessage={handleVoiceMessage}
        onVoiceRecordingStart={handleVoiceRecordingStart}
        onVoiceRecordingError={handleVoiceRecordingError}
        voiceStatus={voiceStatus}
        disabled={isTyping}
        voiceEnabled={true}
      />
    </div>
  )
}

// ── WelcomeCard ─────────────────────────────────────────────────────────────

interface WelcomeCardProps {
  onSuggestionClick: (suggestion: string) => void
}

function WelcomeCard({ onSuggestionClick }: WelcomeCardProps) {
  const suggestions = [
    { Icon: ReceiptText,   label: 'Check my bill status' },
    { Icon: Radio,         label: 'Check outages in my area' },
    { Icon: Wrench,        label: 'Report internet issue' },
    { Icon: Wifi, label: 'What are your fiber plans?' },
  ]

  return (
    <div className="animate-fade-in space-y-5">

      {/* ── Onboarding / intro bubble ────────────────────────── */}
      <div className="relative bg-white rounded-3xl border-2 border-gray-200 shadow-xl p-6 overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pldt-red/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3.5 mb-4">
            {/* Enhanced avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-pldt-red/20 rounded-full blur-lg animate-pulse-subtle" />
              <div className="relative w-12 h-12 rounded-full bg-white border-2 border-gray-100
                flex items-center justify-center flex-shrink-0 shadow-xl p-2.5">
                <img src={pldtIcon} alt="Gabby AI" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <p className="font-extrabold text-base text-gray-900">Gabby AI Assistant</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                </span>
                <span className="text-xs text-green-600 font-bold">Online · Replies instantly</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100/30 rounded-2xl p-5 border-2 border-gray-100 shadow-inner">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Hi! I'm <strong className="text-pldt-red">Gabby</strong>, your personal PLDT assistant.
              I can help you <strong className="text-pldt-red">instantly</strong> with:
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {[
                'Billing questions and payment inquiries',
                'Internet connection and technical issues',
                'Service outages in your area',
                'Finding the best PLDT plan for you',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pldt-red to-pldt-red-dark flex-shrink-0 shadow-sm" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400 mt-4 font-semibold">
              No waiting. No hold music. Just ask below. ↓
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick action grid ────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3.5 px-1">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map(({ Icon, label }) => {
            const isFiber = label.toLowerCase().includes('fiber')
            return (
              <button
                key={label}
                onClick={() => onSuggestionClick(label)}
                className={`relative flex items-start gap-3 px-4 py-4 rounded-2xl text-left
                  active:scale-[0.97] transition-all duration-200 group overflow-hidden
                  ${isFiber
                    ? 'bg-gradient-to-br from-[#C8002A] via-[#B8002A] to-[#9A0020] border-0 hover:opacity-90 shadow-xl hover:shadow-2xl'
                    : 'border-2 border-gray-200 bg-white hover:border-pldt-red hover:bg-gradient-to-br hover:from-red-50 hover:to-white shadow-lg hover:shadow-xl'
                  }`}
              >
                {/* Decorative shine effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isFiber ? 'from-white/10' : 'from-white'} to-transparent pointer-events-none`} />
                
                <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${isFiber ? 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30' : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-red-100 group-hover:to-red-50'}`}>
                  <Icon className={`w-4 h-4 transition-colors
                    ${isFiber ? 'text-white' : 'text-gray-500 group-hover:text-pldt-red'}`} />
                </div>
                <span className={`relative text-xs font-bold leading-snug transition-colors pt-1
                  ${isFiber ? 'text-white' : 'text-gray-700 group-hover:text-pldt-red'}`}>
                  {label}
                </span>
                {isFiber && <span className="ml-auto text-white/70 text-sm self-center font-bold">→</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}