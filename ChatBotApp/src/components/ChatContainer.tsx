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
import pldtLogo from '../../img/PLDT-Logo.png'
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
      <header className="bg-gradient-to-r from-[#B8002A] to-[#D50032] px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: hamburger (mobile) + bot avatar + name + logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={onMenuClick}
              className="lg:hidden flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            {/* Desktop re-open button — only when sidebar is closed */}
            {!sidebarOpen && (
              <button
                onClick={onMenuClick}
                className="hidden lg:flex flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-white" />
              </button>
            )}
            {/* Bot avatar using PLDT icon */}
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center
              flex-shrink-0 shadow-md p-1.5 border border-white/20">
              <img src={pldtIcon} alt="Gabby" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {/* PLDT logo in header */}
                <img src={pldtLogo} alt="PLDT" className="h-4 object-contain brightness-0 invert" />
                <span className="text-white font-semibold text-sm leading-none">Gabby</span>
                <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5
                  rounded-full tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-white/70 text-[11px] mt-0.5">Customer Support Assistant</p>
            </div>
          </div>

          {/* Right: online status */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="text-white/90 font-semibold text-xs">Online</span>
          </div>
        </div>

        {/* Speed + trust bar */}
        <div className="mt-3 bg-white/10 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-white/70 flex-shrink-0" />
            <span className="text-white/80 text-[11px]">Replies in under <strong className="text-white">30 seconds</strong> · No hold time</span>
          </div>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide flex-shrink-0">Free</span>
        </div>
      </header>

      {/* ── Messages Area ───────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
      >
        {messages.length === 0 ? (
          /* Empty / onboarding state */
          <div className="px-4 py-5">
            <WelcomeCard onSuggestionClick={handleSendMessage} />
          </div>
        ) : (
          /* Active conversation */
          <div className="px-4 py-4 space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
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
    <div className="animate-fade-in space-y-3">

      {/* ── Onboarding / intro bubble ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200
            flex items-center justify-center flex-shrink-0 shadow-sm p-1.5">
            <img src={pldtIcon} alt="Gabby" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">Gabby · PLDT AI Assistant</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="text-[11px] text-green-600 font-medium">Online · Replies instantly</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            Hi! I'm <strong>Gabby</strong>, your personal PLDT assistant.
            I can help you <strong>instantly</strong> with:
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {[
              'Billing questions and payment inquiries',
              'Internet connection and technical issues',
              'Service outages in your area',
              'Finding the best PLDT plan for you',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-pldt-red flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3">
            No waiting. No hold music. Just ask below. ↓
          </p>
        </div>
      </div>

      {/* ── Quick action grid ────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-0.5">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map(({ Icon, label }) => {
            const isFiber = label.toLowerCase().includes('fiber')
            return (
              <button
                key={label}
                onClick={() => onSuggestionClick(label)}
                className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-left
                  active:scale-[0.97] transition-all duration-150 group
                  ${isFiber
                    ? 'bg-gradient-to-r from-[#C8002A] to-[#9A0020] border-0 hover:opacity-90'
                    : 'border border-gray-200 bg-white hover:border-pldt-red hover:bg-red-50'
                  }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                  ${isFiber ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-red-100'}`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors
                    ${isFiber ? 'text-white' : 'text-gray-500 group-hover:text-pldt-red'}`} />
                </div>
                <span className={`text-xs font-semibold leading-snug transition-colors
                  ${isFiber ? 'text-white font-bold' : 'text-gray-700 group-hover:text-pldt-red'}`}>
                  {label}
                </span>
                {isFiber && <span className="ml-auto text-white/60 text-xs self-center">→</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}