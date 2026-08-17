        <div className="absolute inset-0 bg-[#003cff] flex flex-col items-center justify-center z-[60]">
          <div className="w-20 h-20 bg-[#d8ff00] rounded-full animate-[pulse-g_1.5s_infinite_ease-in-out] flex items-center justify-center shadow-[0_0_0_0_rgba(216,255,0,0.5)]">
            <Search size={32} color="#003cff" />
          </div>
          <div className="text-white font-['Inter',system-ui,sans-serif] text-2xl font-extrabold mt-8">Looking for a stranger…</div>
          <div className="text-white/70 text-[15px] font-semibold mt-2">Searching for {waitSeconds}s…</div>
          <button onClick={onQuit} className="bg-transparent border border-white/30 text-white hover:border-[#d8ff00] hover:text-[#d8ff00] hover:bg-[#d8ff00]/10 rounded-full px-8 py-2.5 text-[15px] font-bold mt-8 cursor-pointer transition-all duration-200">Stop Search</button>
        </div>
