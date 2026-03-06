import pldtIcon from '../../img/PLDT-Icon.png'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      {/* Bot avatar — PLDT icon */}
      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm p-1">
        <img src={pldtIcon} alt="Gabby" className="w-full h-full object-contain" />
      </div>
      {/* Dots bubble */}
      <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white shadow-sm border border-gray-100">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  )
}
