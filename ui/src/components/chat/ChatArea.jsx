import React from 'react';
import { Send, Flag, SkipForward, LogOut } from 'lucide-react';

export const ChatArea = ({
  mode, spyState, status, commonInterests, userCount, messages, chatInput,
  isStrangerTyping, handleChatInputChange, sendMessage, setShowReportModal,
  findStranger, onQuit, messagesEndRef
}) => {
  return (
    <div className={`${(mode === 'video' && !spyState?.isSpy) ? 'w-full md:w-80 lg:w-96 md:border-l md:flex-none' : 'w-full'} bg-[#111] border-t md:border-t-0 border-white/10 flex flex-col flex-1 md:h-full shrink-0 relative ${mode === 'video' ? 'pb-[72px] md:pb-0' : ''}`}>
      <div className="p-4 border-b border-white/10 bg-[#1a1a1a] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            {(mode === 'text' || spyState?.isSpy) ? (
              <h1 className="text-primary text-xl font-black tracking-tighter">openchat.</h1>
            ) : (
              <h2 className="text-white font-bold text-lg">Live Chat</h2>
            )}
            {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && (
              <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-medium">{userCount} people online</span>
              </div>
            )}
          </div>
          {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && status === 'connected' && commonInterests.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-gray-400 text-xs font-medium mr-1">You both like:</span>
              {commonInterests.map((interest, i) => (
                <span key={i} className="bg-white/5 border border-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded-full capitalize shadow-sm">
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
              <p className="text-white text-sm font-medium bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                "{spyState.question}"
              </p>
              {spyState.isSpyStranger && (
                <span className="text-gray-400 text-xs mt-1">You are Stranger {spyState.peerId}</span>
              )}
            </div>
          )}
        </div>
        
        {(mode === 'text' || mode === 'spy' || spyState?.isSpy) && (
          <div className="flex gap-2">
            <button onClick={() => setShowReportModal(true)} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 font-bold px-3 py-1.5 rounded-full flex items-center gap-1 text-xs transition-colors">
              <Flag size={14} /> Report
            </button>
            <button onClick={findStranger} className="bg-primary hover:bg-primary-dark text-black font-bold px-4 py-1.5 rounded-full flex items-center gap-1 text-sm shadow-sm transition-transform hover:scale-105">
              <SkipForward size={16} fill="currentColor" /> Next
            </button>
            <button onClick={onQuit} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-full flex items-center gap-1 text-sm shadow-sm transition-transform hover:scale-105">
              <LogOut size={16} /> Quit
            </button>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
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
      <div className="p-4 bg-[#1a1a1a] border-t border-white/10">
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
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
