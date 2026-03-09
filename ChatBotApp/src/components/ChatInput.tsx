import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import VoiceRecorder, { type VoiceStatus } from './VoiceRecorder'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  onVoiceMessage?: (audioBlob: Blob) => void
  onVoiceRecordingStart?: () => void
  onVoiceRecordingError?: (error: Error) => void
  voiceStatus?: VoiceStatus
  disabled?: boolean
  voiceEnabled?: boolean
}

export default function ChatInput({
  onSendMessage,
  onVoiceMessage,
  onVoiceRecordingStart,
  onVoiceRecordingError,
  voiceStatus = 'idle',
  disabled,
  voiceEnabled = true,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim())
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <div className="border-t-2 border-gray-100 bg-gradient-to-b from-white to-gray-50/50 px-4 py-4 sm:px-6 shadow-2xl">
      <div className="max-w-4xl mx-auto">

        {/* ── Voice status banner — floats above the row, never shifts layout ── */}
        <div className={`overflow-hidden transition-all duration-300 ${
          voiceStatus !== 'idle' && voiceStatus !== 'recording' ? 'max-h-12 mb-3' : 'max-h-0 mb-0'
        }`}>
          {voiceStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200 shadow-lg">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-blue-700">Processing voice message…</span>
            </div>
          )}
          {voiceStatus === 'sending' && (
            <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border-2 border-gray-200 shadow-lg">
              <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
              <span className="text-xs font-semibold text-gray-600">Sending message…</span>
            </div>
          )}
          {voiceStatus === 'success' && (
            <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl border-2 border-green-200 shadow-lg animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Message sent!</span>
            </div>
          )}
          {voiceStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl border-2 border-red-200 shadow-lg animate-fade-in">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700">Voice message failed. Please try again.</span>
            </div>
          )}
        </div>

        {/* ── Input row — modern rounded design ────────────────────────────── */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            {/* Subtle glow effect behind input */}
            <div className="absolute inset-0 bg-gradient-to-r from-pldt-red/5 to-pldt-red-dark/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              rows={1}
              className="relative w-full resize-none rounded-2xl px-5 py-4 text-sm
                bg-white
                border-2 border-gray-200
                text-pldt-gray
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-pldt-red/30 focus:border-pldt-red focus:bg-white
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                max-h-32 overflow-y-auto shadow-lg hover:shadow-xl hover:border-gray-300"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="relative flex items-center justify-center h-12 w-12 rounded-full
              bg-gradient-to-br from-pldt-red via-[#C8002A] to-pldt-red-dark text-white
              hover:from-pldt-red-dark hover:via-pldt-red hover:to-pldt-red-dark
              disabled:bg-gray-200 disabled:text-gray-400 disabled:from-gray-200 disabled:to-gray-200
              disabled:cursor-not-allowed
              transition-all duration-200
              hover:scale-110 active:scale-95
              shadow-xl hover:shadow-2xl hover:shadow-pldt-red/40 flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-pldt-red/50 border-2 border-pldt-red/20"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full pointer-events-none" />
          </button>
          {voiceEnabled && onVoiceMessage && (
            <VoiceRecorder
              onRecordingComplete={onVoiceMessage}
              onRecordingStart={onVoiceRecordingStart}
              onRecordingError={onVoiceRecordingError}
              voiceStatus={voiceStatus}
              disabled={disabled}
            />
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400 text-center font-medium">
          Press <kbd className="px-2 py-1 rounded-lg bg-gray-100 border-2 border-gray-200 font-mono text-[10px] shadow-sm">Enter</kbd> to send
          {' '}•{' '}
          <kbd className="px-2 py-1 rounded-lg bg-gray-100 border-2 border-gray-200 font-mono text-[10px] shadow-sm">Shift+Enter</kbd> for new line
          {voiceEnabled ? ' • Hold mic to speak' : ''}
        </p>
      </div>
    </div>
  )
}
