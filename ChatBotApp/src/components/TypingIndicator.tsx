import pldtIcon from '../../img/PLDT-Icon.png'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      {/* Bot avatar — PLDT icon */}
      <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center flex-shrink-0 shadow-md p-1.5">
        <img src={pldtIcon} alt="Stelle AI" className="w-full h-full object-contain" />
      </div>
      {/* Dots bubble */}
      <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white shadow-md border border-gray-100">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  )
}
