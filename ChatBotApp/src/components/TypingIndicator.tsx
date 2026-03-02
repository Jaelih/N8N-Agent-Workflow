export default function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-fade-in">
      <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
        <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white shadow-sm border border-gray-200">
          <div className="flex gap-1.5 items-center h-5">
            <span 
              className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot"
              style={{ animationDelay: '0ms' }}
            />
            <span 
              className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot"
              style={{ animationDelay: '200ms' }}
            />
            <span 
              className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot"
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
