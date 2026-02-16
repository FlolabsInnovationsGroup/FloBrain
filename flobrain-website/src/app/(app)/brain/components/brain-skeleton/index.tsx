import { Menu, Edit3, Send } from "lucide-react";

export const BrainSkeleton = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#1a0033] via-[#2a1a4a] to-[#0f0f23] overflow-hidden">
      {/* Left Sidebar - Chat History */}
      <div className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
        {/* Menu Icon */}
        <div className="p-4">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 h-10 bg-transparent border border-white/20 hover:bg-white/5 rounded-lg px-3 transition-colors cursor-pointer">
            <Edit3 className="w-4 h-4 text-white/70" />
            <div className="h-3.5 bg-white/30 rounded w-20 animate-pulse" />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 no-scrollbar">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`chat-${index}`}
              className="rounded-lg py-3 px-3 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="h-3.5 bg-white/20 rounded w-[90%] animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* AI Message with Icon */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 bg-purple-400/50 rounded" />
                </div>
              </div>
              <div className="flex-1 space-y-2.5 text-white/80">
                <div className="h-3.5 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[98%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[95%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[92%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[88%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[85%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[80%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[75%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[70%] animate-pulse" />
              </div>
            </div>

            {/* AI Message with Icon (Paragraph 2) */}
            <div className="flex items-start gap-4">
              <div className="w-8" /> {/* Spacer for alignment */}
              <div className="flex-1 space-y-2.5 text-white/80">
                <div className="h-3.5 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[97%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[93%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[90%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[87%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[83%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[80%] animate-pulse" />
              </div>
            </div>

            {/* AI Message with Icon (Paragraph 3) */}
            <div className="flex items-start gap-4">
              <div className="w-8" /> {/* Spacer for alignment */}
              <div className="flex-1 space-y-2.5 text-white/80">
                <div className="h-3.5 bg-white/10 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[96%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[92%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[88%] animate-pulse" />
                <div className="h-3.5 bg-white/10 rounded w-[60%] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Input Area - Fixed to Bottom */}
        <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-t from-[#0f0f23] via-[#1a0033]/95 to-transparent px-6 py-4 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-[#2a1a4a]/60 rounded-3xl px-5 py-3 border border-white/20">
              <div className="flex-1 min-h-[24px]">
                <div className="h-3 bg-white/10 rounded w-48 animate-pulse" />
              </div>
              <button className="ml-3 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Send className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
