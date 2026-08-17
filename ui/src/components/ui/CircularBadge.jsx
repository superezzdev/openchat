export const CircularBadge = ({ onClick }) => (
  <div onClick={onClick} className="relative w-20 h-20 md:w-[120px] md:h-[120px] bg-[#d8ff00] rounded-full flex items-center justify-center rotate-12 cursor-pointer border-[3px] border-black/5 transition-transform duration-200 hover:scale-108 hover:rotate-12 group shadow-lg">
    {/* Spinning text ring */}
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path id="cp" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none"/>
        <text className="text-[8.5px] font-black tracking-[0.15em] font-['Inter',system-ui,sans-serif]" fill="#0a0908">
          <textPath href="#cp" startOffset="0%">
            START CHATTING • MEET STRANGERS • 
          </textPath>
        </text>
      </svg>
    </div>
    {/* Center icon */}
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none"
      stroke="#0a0908" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </div>
);
