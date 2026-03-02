import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  onVoiceMessage?: (audioBlob: Blob) => void
  disabled?: boolean
  voiceEnabled?: boolean
}

export default function ChatInput({ onSendMessage, onVoiceMessage, disabled, voiceEnabled = true }: ChatInputProps) {
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
    <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-base
                bg-gray-50
                border border-gray-200
                text-pldt-gray
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-pldt-red/20 focus:border-pldt-red
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                max-h-32 overflow-y-auto"
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400 pointer-events-none">
              <span className="hidden sm:inline">↵ send</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="flex items-center justify-center h-12 w-12 rounded-full
              bg-pldt-red text-white
              hover:bg-pldt-red-dark
              disabled:bg-gray-300 disabled:text-gray-500
              disabled:cursor-not-allowed
              transition-all duration-200 ease-in-out
              hover:scale-105 active:scale-95
              shadow-md hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-pldt-red/30"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 ml-0.5"
            >
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
          {voiceEnabled && onVoiceMessage && (
            <VoiceRecorder 
              onRecordingComplete={onVoiceMessage} 
              disabled={disabled} 
            />
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          {voiceEnabled ? 'Type or use voice • Press Enter to send, Shift+Enter for new line' : 'Press Enter to send, Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
