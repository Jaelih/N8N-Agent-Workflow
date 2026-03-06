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
    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* ── Voice status banner — floats above the row, never shifts layout ── */}
        <div className={`overflow-hidden transition-all duration-300 ${
          voiceStatus !== 'idle' && voiceStatus !== 'recording' ? 'max-h-10 mb-2' : 'max-h-0 mb-0'
        }`}>
          {voiceStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 py-1.5 bg-blue-50 rounded-lg">
              <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
              <span className="text-xs font-medium text-blue-600">Processing voice message…</span>
            </div>
          )}
          {voiceStatus === 'sending' && (
            <div className="flex items-center justify-center gap-2 py-1.5 bg-gray-50 rounded-lg">
              <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />
              <span className="text-xs font-medium text-gray-500">Sending message…</span>
            </div>
          )}
          {voiceStatus === 'success' && (
            <div className="flex items-center justify-center gap-2 py-1.5 bg-green-50 rounded-lg animate-fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-medium text-green-600">Message sent!</span>
            </div>
          )}
          {voiceStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 py-1.5 bg-red-50 rounded-lg animate-fade-in">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-medium text-red-600">Voice message failed. Please try again.</span>
            </div>
          )}
        </div>

        {/* ── Input row — width never changes ────────────────────────────── */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-xl px-4 py-3 text-base
                bg-gray-50
                border border-gray-200
                text-pldt-gray
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-pldt-red/20 focus:border-pldt-red
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                max-h-32 overflow-y-auto"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="flex items-center justify-center h-10 w-10 rounded-full
              bg-pldt-red text-white
              hover:bg-pldt-red-dark
              disabled:bg-gray-200 disabled:text-gray-400
              disabled:cursor-not-allowed
              transition-all duration-200
              hover:scale-105 active:scale-95
              shadow-sm hover:shadow-md flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-pldt-red/30"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" strokeWidth={2.5} />
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

        <p className="mt-2 text-xs text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-[10px]">Enter</kbd> to send
          {' '}•{' '}
          <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-[10px]">Shift+Enter</kbd> for new line
          {voiceEnabled ? ' • Hold mic to speak' : ''}
        </p>
      </div>
    </div>
  )
}
