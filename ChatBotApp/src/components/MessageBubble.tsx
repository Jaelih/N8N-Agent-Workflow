import type { Message } from './types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  }

  return (
    <div
      className={`flex w-full animate-slide-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-5 py-3 rounded-2xl ${
            isUser
              ? 'bg-pldt-red text-white rounded-br-md shadow-md'
              : 'bg-white text-pldt-gray shadow-sm border border-gray-200 rounded-bl-md'
          }`}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className={`text-xs mt-1.5 px-1 ${
          isUser ? 'text-gray-400' : 'text-gray-400'
        }`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
