import React, { useState } from 'react';
import { Video, Shield, Users, Zap, MessageSquare, Search } from 'lucide-react';

const Home = ({ onStart }) => {
  const [tagsInput, setTagsInput] = useState('');
  const [mode, setMode] = useState('video');
  const [question, setQuestion] = useState('');

  const handleStart = () => {
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    onStart(tags, mode, question);
  };

  return (
    <div className="min-h-screen bg-xblack text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 flex flex-col items-center text-center">
        
        {/* Logo / Header */}
        <div className="inline-block mb-6 px-6 py-2 border-2 border-primary rounded-full bg-primary/10">
          <span className="text-primary font-bold tracking-widest uppercase text-sm">Welcome to</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 md:mb-8 drop-shadow-xl">
          open<span className="text-primary">chat.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mb-8 leading-relaxed px-2 md:px-0">
          The fastest way to meet new people. No login, no database, completely anonymous peer-to-peer video chat.
        </p>

        {/* Interests or Question Input */}
        <div className="w-full max-w-md mb-8">
          {mode === 'spy' ? (
            <>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider text-left">
                Ask a question
              </label>
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is the meaning of life?"
                className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600 mb-8"
              />
            </>
          ) : (
            <>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider text-left">
                Add your interests (optional)
              </label>
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. gaming, music, python"
                className="w-full bg-black border-2 border-white/20 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600 mb-8"
              />
            </>
          )}
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 sm:gap-4 mb-10 md:mb-16 w-full max-w-md px-2 md:px-0">
          <button 
            onClick={() => setMode('video')}
            className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 ${mode === 'video' ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-white/10 text-gray-400 hover:border-white/30'}`}
          >
            <Video size={24} className="sm:w-[28px] sm:h-[28px]" />
            <span className="font-bold text-sm sm:text-base">Video Chat</span>
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 ${mode === 'text' ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-white/10 text-gray-400 hover:border-white/30'}`}
          >
            <MessageSquare size={24} className="sm:w-[28px] sm:h-[28px]" />
            <span className="font-bold text-sm sm:text-base">Text Only</span>
          </button>
          <button 
            onClick={() => setMode('spy')}
            className={`flex-1 py-3 sm:py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 sm:gap-2 ${mode === 'spy' ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-white/10 text-gray-400 hover:border-white/30'}`}
          >
            <Search size={24} className="sm:w-[28px] sm:h-[28px]" />
            <span className="font-bold text-sm sm:text-base">Spy Mode</span>
          </button>
        </div>

        {/* Start Button */}
        <div className="w-full px-2 md:px-0 flex justify-center">
          <button 
            onClick={handleStart}
            className="group relative px-6 py-4 md:px-8 md:py-5 bg-primary text-black font-black text-xl md:text-2xl rounded-full uppercase tracking-wider overflow-hidden transition-transform hover:scale-105 shadow-[0_6px_0_0_#111] md:shadow-[0_8px_0_0_#111] hover:shadow-[0_3px_0_0_#111] md:hover:shadow-[0_4px_0_0_#111] hover:translate-y-1 mb-12 md:mb-16 flex items-center gap-3 md:gap-4 w-full max-w-md justify-center"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            {mode === 'video' ? <Video size={28} className="md:w-[32px] md:h-[32px]" /> : mode === 'text' ? <MessageSquare size={28} className="md:w-[32px] md:h-[32px]" /> : <Search size={28} className="md:w-[32px] md:h-[32px]" />}
            <span className="relative z-10">Start {mode === 'video' ? 'Video' : mode === 'text' ? 'Chat' : 'Spying'}</span>
          </button>
        </div>

        {/* Features / Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl text-left border-t border-white/10 pt-16">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-gray-400">Powered by WebRTC, video streams directly between you and your partner for zero lag.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold">Anonymous</h3>
            <p className="text-gray-400">No accounts or tracking. When you click next, your connection is gone forever.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold">Community Rules</h3>
            <p className="text-gray-400">Please be respectful and kind to others. Inappropriate behavior is not tolerated.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
