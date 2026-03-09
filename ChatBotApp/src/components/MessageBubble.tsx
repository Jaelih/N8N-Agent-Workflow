import { User } from 'lucide-react'
import type { Message } from './types'
import AudioPlayer from './AudioPlayer'
import pldtIcon from '../../img/PLDT-Icon.png'

interface MessageBubbleProps {
  message: Message
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-3 animate-slide-up">
        {/* Bubble */}
        <div className="flex flex-col items-end max-w-[75%] sm:max-w-[70%]">
          <div className="relative px-5 py-3.5 rounded-2xl rounded-br-md bg-gradient-to-br from-pldt-red via-[#C8002A] to-pldt-red-dark text-white shadow-xl shadow-pldt-red/25 border border-pldt-red-dark/20">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words relative z-10">
              {message.content}
            </p>
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl rounded-br-md pointer-events-none" />
          </div>
          <span className="text-[11px] text-gray-400 mt-1.5 pr-1 font-medium">
            {formatTime(message.timestamp)}
          </span>
        </div>
        {/* User avatar with modern gradient */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 mb-6 shadow-lg border-2 border-white">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    )
  }

  // Bot message with enhanced friendly design
  return (
    <div className="flex items-end gap-3 animate-slide-up">
      {/* Bot avatar with glow effect */}
      <div className="relative w-9 h-9 mb-6">
        <div className="absolute inset-0 bg-pldt-red/20 rounded-full blur-sm" />
        <div className="relative w-9 h-9 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center flex-shrink-0 shadow-lg p-1.5">
          <img src={pldtIcon} alt="Gabby AI" className="w-full h-full object-contain" />
        </div>
      </div>
      {/* Bubble */}
      <div className="flex flex-col items-start max-w-[75%] sm:max-w-[70%]">
        <div className="relative px-5 py-3.5 rounded-2xl rounded-bl-md bg-white text-gray-800 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {message.audioUrl && (
            <div className="mt-3">
              <AudioPlayer audioUrl={message.audioUrl} autoPlay />
            </div>
          )}
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl rounded-bl-md pointer-events-none" />
        </div>
        <span className="text-[11px] text-gray-400 mt-1.5 pl-1 font-medium">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
