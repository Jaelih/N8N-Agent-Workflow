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
      <div className="flex items-end justify-end gap-2 animate-slide-up">
        {/* Bubble */}
        <div className="flex flex-col items-end max-w-[78%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-pldt-red text-white shadow-md">
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 pr-0.5">
            {formatTime(message.timestamp)}
          </span>
        </div>
        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mb-5 shadow-sm">
          <User className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    )
  }

  // Bot message
  return (
    <div className="flex items-end gap-2 animate-slide-up">
      {/* Bot avatar — PLDT icon */}
      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mb-5 shadow-sm p-1">
        <img src={pldtIcon} alt="Gabby" className="w-full h-full object-contain" />
      </div>
      {/* Bubble */}
      <div className="flex flex-col items-start max-w-[78%]">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white text-gray-800 shadow-sm border border-gray-100">
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {message.audioUrl && (
            <div className="mt-2">
              <AudioPlayer audioUrl={message.audioUrl} autoPlay />
            </div>
          )}
        </div>
        <span className="text-[11px] text-gray-400 mt-1 pl-0.5">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
