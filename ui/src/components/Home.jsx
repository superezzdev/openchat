import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Keyboard, Clock, ArrowRight } from 'lucide-react';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg height={size} width={size} aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
  </svg>
);

const Home = ({ onStart }) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('video'); // video, text, spy
  const [userCount, setUserCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket to get real-time user count without joining a queue
    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    
    try {
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'userCount') {
          setUserCount(message.count);
        }
      };
    } catch (err) {
      console.error("Failed to connect for user count:", err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAEFF5] to-[#F1F4F9] flex flex-col font-sans text-[#111111] relative">
      {/* Background glow effects to match the soft gradient in the image */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/40 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 w-full max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="10" r="5" stroke="#111111" strokeWidth="1.5" />
            <circle cx="13" cy="10" r="5" stroke="#111111" strokeWidth="1.5" />
          </svg>
          <span className="font-bold text-xl tracking-tight">randall</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200/60 shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[13px] font-semibold text-[#5C677D]">
            <span className="w-2 h-2 rounded-full bg-[#55D98A]"></span>
            {userCount.toLocaleString()} online
          </div>
          <a href="https://github.com/superezzdev/openchat" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8F9FB] transition-colors rounded-full border border-gray-200/60 shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-[13px] font-semibold text-[#5C677D]">
            <GithubIcon size={16} />
            GitHub
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-20 w-full max-w-[800px] mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-[64px] font-[800] tracking-tight leading-[1.05] mb-5">
            <span className="text-[#0E1528] block">Meet someone</span>
            <span className="text-[#6D7787] block">new, right now</span>
          </h1>
          <p className="text-[17px] md:text-[19px] text-[#5C677D] font-medium mt-6">
            One click. A real person. No accounts, no history.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-[32px] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
          <div className="mb-6">
            <label className="block text-[12px] font-[800] tracking-widest text-[#7B8699] mb-3 uppercase">Your interests (Optional)</label>
            <div className="flex flex-wrap gap-2 items-center bg-[#18181B] rounded-2xl p-2.5 min-h-[64px] focus-within:ring-2 focus-within:ring-[#7B8699]/30 transition-all">
              {tags.map(tag => (
                <span key={tag} className="bg-[#27272A] text-gray-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white transition-colors">&times;</button>
                </span>
              ))}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? "music, gaming, art, coding..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-white px-2 placeholder-[#52525B] text-[15px] font-medium min-w-[120px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <button 
              onClick={() => setMode('video')}
              className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-[20px] border-[1.5px] transition-all ${mode === 'video' ? 'bg-[#374151] border-[#374151] text-white shadow-md' : 'bg-white border-[#F3F4F6] text-[#6B7280] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}
            >
              <Monitor size={22} strokeWidth={mode === 'video' ? 2 : 1.5} />
              <span className="font-semibold text-[14px]">Video + chat</span>
            </button>
            <button 
              onClick={() => setMode('text')}
              className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-[20px] border-[1.5px] transition-all ${mode === 'text' ? 'bg-[#374151] border-[#374151] text-white shadow-md' : 'bg-white border-[#F3F4F6] text-[#6B7280] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}
            >
              <Keyboard size={22} strokeWidth={mode === 'text' ? 2 : 1.5} />
              <span className="font-semibold text-[14px]">Text only</span>
            </button>
            <button 
              onClick={() => setMode('spy')}
              className={`flex flex-col items-center justify-center gap-2.5 py-5 rounded-[20px] border-[1.5px] transition-all ${mode === 'spy' ? 'bg-[#374151] border-[#374151] text-white shadow-md' : 'bg-white border-[#F3F4F6] text-[#6B7280] hover:border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}
            >
              <Clock size={22} strokeWidth={mode === 'spy' ? 2 : 1.5} />
              <span className="font-semibold text-[14px]">Spy mode</span>
            </button>
          </div>

          {mode === 'spy' && (
             <div className="mb-6">
                <input
                  type="text"
                  placeholder="Ask a question for strangers to discuss..."
                  className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#E5E7EB] transition-all text-[#111111] font-medium placeholder-[#9CA3AF]"
                  id="spyQuestionInput"
                />
             </div>
          )}

          <button 
            onClick={() => {
              const q = mode === 'spy' ? document.getElementById('spyQuestionInput')?.value : '';
              onStart(tags, mode, q);
            }}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111111] rounded-2xl font-bold text-[16px] transition-colors"
          >
            Start chatting <ArrowRight size={20} className="text-[#9CA3AF]" />
          </button>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-4 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-full text-[13px] font-semibold border border-transparent">Be kind</span>
            <span className="px-4 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-full text-[13px] font-semibold border border-transparent">18+ only</span>
            <span className="px-4 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-full text-[13px] font-semibold border border-transparent">No nudity</span>
            <span className="px-4 py-1.5 bg-[#F3F4F6] text-[#6B7280] rounded-full text-[13px] font-semibold border border-transparent">No harassment</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] font-medium text-[#9CA3AF] relative z-10 pb-8">
        <div className="flex items-center gap-6">
          <a href="https://github.com/superezzdev" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#4B5563] transition-colors">
            <GithubIcon size={15} /> @superezzdev
          </a>
          <a href="https://www.superezz.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#4B5563] transition-colors">
            <Clock size={15} /> Portfolio
          </a>
        </div>
        <div>
          Built with &hearts; &middot; Open source
        </div>
      </footer>
    </div>
  );
};

export default Home;
