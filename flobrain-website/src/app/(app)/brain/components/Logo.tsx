export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L8 8V14C8 19.5 11.5 24.5 16 26C20.5 24.5 24 19.5 24 14V8L16 4Z" fill="url(#gradient)" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14L15 17L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient" x1="8" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        FLOBRAIN
      </span>
    </div>
  );
}
