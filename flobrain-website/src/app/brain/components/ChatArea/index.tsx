import type { Message } from '../App';

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="w-10 h-10 flex-shrink-0">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4L8 8V14C8 19.5 11.5 24.5 16 26C20.5 24.5 24 19.5 24 14V8L16 4Z" fill="url(#gradient2)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14L15 17L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="gradient2" x1="8" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8B5CF6"/>
                      <stop offset="1" stopColor="#6366F1"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-5 py-4 ${
                message.type === 'user'
                  ? 'bg-[#7c5dbd]/30 text-white/90'
                  : 'bg-[#3d2b5f]/40 text-white/80'
              }`}
            >
              {message.image && (
                <div className="mb-3">
                  <img
                    src={message.image}
                    alt="User upload"
                    className="max-w-full h-auto rounded-lg border border-white/10"
                  />
                </div>
              )}
              {message.text && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{message.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}