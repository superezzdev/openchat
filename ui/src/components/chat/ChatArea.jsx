import React from 'react';
import { Send, Flag, SkipForward, LogOut } from 'lucide-react';

export const ChatArea = ({
  mode, spyState, status, commonInterests, userCount, messages, chatInput,
  isStrangerTyping, handleChatInputChange, sendMessage, setShowReportModal,
  findStranger, onQuit, messagesEndRef
}) => {
  return (
    <div className={`${(mode === 'video' && !spyState?.isSpy) ? 'w-full md:w-80 lg:w-96 md:border-l md:flex-none' : 'w-full'} bg-[#111] border-t md:border-t-0 border-white/10 flex flex-col flex-1 md:h-full shrink-0 relative ${mode === 'video' ? 'pb-[72px] md:pb-0' : ''}`}>
      <div className="px-4 py-3 border-b border-white/5 bg-[#141414] flex justify-between items-center shadow-sm shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-primary text-xl md:text-2xl font-black tracking-tighter drop-shadow-md flex items-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="9" cy="12" r="5" />
                <circle cx="15" cy="12" r="5" />
              </svg>
              randall
            </h1>
            {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && (
              <div className="bg-black/50 border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-inner">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-gray-300 text-[10px] md:text-xs font-bold tracking-wider">{userCount} <span className="hidden sm:inline">ONLINE</span></span>
              </div>
            )}
          </div>
          {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && status === 'connected' && commonInterests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mr-1">Shared Interests:</span>
              {commonInterests.map((interest, i) => (
                <span key={i} className="bg-white/10 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-full capitalize shadow-sm">
                  {interest}
                </span>
              ))}
            </div>
          )}
          
          {status === 'connected' && spyState?.question && (
            <div className="mt-2 flex flex-col">
              <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {spyState.isSpy ? 'You asked:' : 'Spy Question:'}
              </span>
              <p className="text-white text-xs md:text-sm font-medium bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                "{spyState.question}"
              </p>
              {spyState.isSpyStranger && (
                <span className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-wider">You are Stranger {spyState.peerId}</span>
              )}
            </div>
          )}
        </div>
        
        {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowReportModal(true)} 
              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 w-[44px] h-[44px] md:w-auto md:h-auto md:px-4 md:py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all"
              title="Report"
            >
              <Flag size={14} className="md:w-[16px] md:h-[16px]" /> 
              <span className="hidden md:inline font-bold text-xs uppercase tracking-wider">Report</span>
            </button>
            <button 
              onClick={findStranger} 
              className="bg-primary hover:bg-primary-dark text-black w-[44px] h-[44px] md:w-auto md:h-auto md:px-4 md:py-1.5 rounded-full flex items-center justify-center gap-1.5 shadow-[0_2px_0_0_rgba(0,0,0,0.3)] md:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              title="Next"
            >
              <SkipForward size={14} className="md:w-[16px] md:h-[16px]" fill="currentColor" /> 
              <span className="hidden md:inline font-black text-xs uppercase tracking-wider">Next</span>
            </button>
            <button 
              onClick={onQuit} 
              className="bg-white/10 hover:bg-white/20 text-white w-[44px] h-[44px] md:w-auto md:h-auto md:px-4 md:py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-all"
              title="Quit"
            >
              <LogOut size={14} className="md:w-[16px] md:h-[16px]" /> 
              <span className="hidden md:inline font-bold text-xs uppercase tracking-wider">Quit</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-none p-4 flex flex-col gap-3">
        {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && status === 'waiting' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium tracking-wide uppercase">Looking for strangers...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            {mode === 'spy' || spyState?.isSpy ? 'Waiting for strangers to chat...' : 'Say hi to your stranger!'}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.isSent ? 'items-end' : 'items-start'}`}>
              {msg.senderId && (
                <span className="text-[10px] text-gray-400 mb-0.5 font-medium ml-1">
                  {msg.senderId}
                </span>
              )}
              <div 
                className={`max-w-[80%] px-4 py-2 min-h-[44px] flex flex-col justify-center rounded-2xl text-sm ${
                  msg.isSent 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-gray-700 text-white rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        
        {isStrangerTyping && (
          <div className="flex gap-1 items-center px-4 py-2 bg-gray-700 text-white self-start rounded-2xl rounded-bl-sm max-w-[80%]">
            <span className="text-xs text-gray-300 italic mr-2">Stranger is typing</span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-[#1a1a1a] border-t border-white/10 pb-[max(12px,env(safe-area-inset-bottom))]">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={handleChatInputChange}
            placeholder={spyState?.isSpy ? "You are spying (read-only)" : status === 'connected' ? "Type a message..." : "Waiting for connection..."}
            disabled={status !== 'connected' || spyState?.isSpy}
            className="flex-1 bg-black border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={status !== 'connected' || !chatInput.trim() || spyState?.isSpy}
            className="w-[44px] h-[44px] rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
