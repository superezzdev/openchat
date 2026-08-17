import React, { useState, useRef, useEffect } from 'react';
import { useVideoChat } from '../hooks/useVideoChat.js';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Flag, MessageCircle, X, Send, Search } from 'lucide-react';
import { useDraggable } from '../hooks/useDraggable.js';
const VideoChat = ({ onQuit, interests = [], mode = 'video', question = '' }) => {
  const {
    localVideoRef, remoteVideoRef, messagesEndRef,
    status, isVideoEnabled, isAudioEnabled, messages, chatInput,
    isStrangerTyping, commonInterests, userCount, showReportModal, setShowReportModal,
    spyState, remoteVideoEnabled, remoteAudioEnabled, toastMessage,
    toggleVideo, toggleAudio, handleChatInputChange, sendMessage, submitReport, findStranger
  } = useVideoChat(interests, mode, question);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);

  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    } else if (messages.length > prevMessagesLength.current) {
      const newMessages = messages.slice(prevMessagesLength.current);
      const newReceived = newMessages.filter(m => m.sender !== 'me' && m.sender !== 'system').length;
      if (newReceived > 0) {
         setUnreadCount(prev => prev + newReceived);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isChatOpen]);

  const messageTimestamps = useRef(new WeakMap());
  const getTimestamp = (msg) => {
    if (!messageTimestamps.current.has(msg)) {
      messageTimestamps.current.set(msg, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    return messageTimestamps.current.get(msg);
  };

  // Draggable PiP
  const { containerRef: localContainerRef, onMouseDown } = useDraggable();

  useEffect(() => {
    if (!window.visualViewport) return;
    const onResizeViewport = () => {
      const vh = window.innerHeight;
      const vv = window.visualViewport.height;
      const kbHeight = Math.max(0, vh - vv);
      document.documentElement.style.setProperty('--keyboard-height', `${kbHeight}px`);
    };
    window.visualViewport.addEventListener('resize', onResizeViewport);
    window.visualViewport.addEventListener('scroll', onResizeViewport);
    onResizeViewport();
    return () => {
      window.visualViewport.removeEventListener('resize', onResizeViewport);
      window.visualViewport.removeEventListener('scroll', onResizeViewport);
    };
  }, []);




  const isConnected = status === 'connected';
  const isWaiting = status === 'idle' || status === 'searching' || status === 'waiting';
  const isDisconnected = status === 'disconnected';

  useEffect(() => {
    let interval;
    if (isWaiting) {
      interval = setInterval(() => {
        setWaitSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setWaitSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isWaiting]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#003cff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      <style>
        {`
          @keyframes pulse-yellow {
            0% { box-shadow: 0 0 0 0 rgba(216,255,0,0.5); }
            70% { box-shadow: 0 0 0 24px rgba(216,255,0,0); }
            100% { box-shadow: 0 0 0 0 rgba(216,255,0,0); }
          }
          .stop-btn {
            background: transparent;
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            border-radius: 24px;
            padding: 10px 32px;
            font-size: 15px;
            font-weight: bold;
            margin-top: 32px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .stop-btn:hover {
            border-color: #d8ff00;
            color: #d8ff00;
            background: rgba(216,255,0,0.1);
          }
          .report-btn {
            margin-left: auto; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); border: none; color: white; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s; backdrop-filter: blur(4px);
          }
          .report-btn:hover {
            background: #ef4444;
            transform: scale(1.05);
          }
          .control-btn {
            width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s; backdrop-filter: blur(8px);
          }
          .control-btn:hover {
            background: white;
            color: #003cff;
            transform: scale(1.05);
          }
          .chat-input {
            flex: 1; background: #f4f6f8; border: 2px solid #e2e8f0; border-radius: 24px; padding: 12px 16px; color: #0f172a; font-size: 15px; font-weight: 500; outline: none; transition: border-color 0.2s, background-color 0.2s;
          }
          .chat-input:focus {
            border-color: #003cff !important;
            background: white;
          }
        `}
      </style>

      {/* Top panel */}
      <div style={{ position: 'relative', flex: 1 }}>
        <video
          id="remote-video"
          ref={remoteVideoRef}
          playsInline
          autoPlay
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#111827' }}
        />
        <div
          id="local-video"
          ref={localContainerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          style={{ position: 'absolute', top: 12, right: 12, width: 96, height: 128, borderRadius: 16, border: '3px solid #d8ff00', zIndex: 10, cursor: 'grab', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
        >
          <video
            ref={localVideoRef}
            playsInline
            autoPlay
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', background: '#111827' }}
          />
        </div>

        {toastMessage && (
          <div style={{
            position: 'absolute', top: 72, left: '50%', transform: 'translateX(-50%)',
            background: '#d8ff00', color: '#003cff', padding: '8px 16px', borderRadius: 24,
            boxShadow: '0 4px 16px rgba(216,255,0,0.3)', zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700,
            animation: 'slide-down 0.3s ease-out forwards'
          }}>
            {toastMessage}
            {commonInterests.length > 0 && commonInterests.map((interest, i) => (
              <span key={i} style={{ background: '#003cff', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                {interest}
              </span>
            ))}
          </div>
        )}

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '16px 20px', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#d8ff00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003cff', fontWeight: 800, fontSize: 16 }}>S</div>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Stranger</div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginLeft: 4, boxShadow: '0 0 8px #4ade80' }}></div>
          <button onClick={() => setShowReportModal(true)} className="report-btn">
            <Flag size={18} />
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '16px 16px max(24px, env(safe-area-inset-bottom))', background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)', display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center' }}>
          <button onClick={toggleAudio} className="control-btn">
            {!isAudioEnabled ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className="control-btn">
            {!isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={onQuit} style={{ width: 56, height: 56, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(239,68,68,0.4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <LogOut size={24} />
          </button>
          <button onClick={findStranger} style={{ width: 64, height: 64, borderRadius: '50%', background: '#d8ff00', border: 'none', color: '#003cff', fontSize: 26, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(216,255,0,0.4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <SkipForward size={28} />
          </button>
        </div>

        {isDisconnected && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.2)', padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
              <div style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>Stranger disconnected</div>
              <button onClick={findStranger} style={{ height: 52, borderRadius: 26, background: '#d8ff00', border: 'none', color: '#003cff', padding: '0 36px', cursor: 'pointer', fontSize: 16, fontWeight: 800, boxShadow: '0 8px 20px rgba(216,255,0,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>Find new stranger</button>
              <button onClick={onQuit} style={{ height: 52, borderRadius: 26, background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', color: 'white', padding: '0 36px', cursor: 'pointer', fontSize: 16, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)';}} onMouseLeave={e => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent';}}>Go home</button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CHAT PANEL */}
      <div style={{ height: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -20, zIndex: 30, position: 'relative', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ height: 60, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d8ff00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003cff', fontSize: 14, fontWeight: 800 }}>S</div>
          <div style={{ color: '#0f172a', fontSize: 16, fontWeight: 700 }}>Stranger</div>
          <div style={{ marginLeft: 'auto', color: '#003cff', fontSize: 13, fontWeight: 600 }}>
            {isStrangerTyping ? 'typing…' : (isConnected ? 'connected' : '')}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, idx) => {
            if (msg.sender === 'system') {
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {msg.text}
                  </div>
                  <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                </div>
              );
            }
            const isMe = msg.sender === 'me';
            return (
              <div key={idx} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                background: isMe ? '#d8ff00' : '#f4f6f8',
                color: isMe ? '#003cff' : '#0f172a',
                padding: '10px 16px',
                borderRadius: isMe ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                border: isMe ? 'none' : '1px solid #e2e8f0',
                boxShadow: isMe ? '0 4px 12px rgba(216,255,0,0.3)' : 'none',
                maxWidth: '75%',
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.5
              }}>
                <div>{msg.text}</div>
                <span style={{ display: 'block', fontSize: 11, color: isMe ? 'rgba(0,60,255,0.5)' : '#94a3b8', textAlign: 'right', marginTop: 4, fontWeight: 600 }}>
                  {getTimestamp(msg)}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', paddingBottom: 'env(safe-area-inset-bottom)', display: 'flex', alignItems: 'center', padding: '12px 16px' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) sendMessage(); }} style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Type a message…"
              disabled={!isConnected}
              className="chat-input"
            />
            <button type="submit" disabled={!isConnected || !chatInput.trim()} style={{ width: 48, height: 48, borderRadius: '50%', background: (!isConnected || !chatInput.trim()) ? '#f1f5f9' : '#003cff', border: 'none', color: (!isConnected || !chatInput.trim()) ? '#94a3b8' : 'white', fontSize: 20, cursor: 'pointer', flexShrink: 0, boxShadow: (!isConnected || !chatInput.trim()) ? 'none' : '0 4px 16px rgba(0,60,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {isWaiting && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,60,255,0.95)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 80, height: 80, background: '#d8ff00', borderRadius: '50%', animation: 'pulse-yellow 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={32} color="#003cff" />
          </div>
          <div style={{ color: 'white', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 24, fontWeight: 800, marginTop: 32 }}>Looking for a stranger…</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600, marginTop: 8 }}>Searching for {waitSeconds}s…</div>
          <button onClick={onQuit} className="stop-btn">Stop Search</button>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px 0', fontFamily: 'system-ui, sans-serif' }}>Report User</h3>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 16px 0', fontFamily: 'system-ui, sans-serif' }}>Please describe why you are reporting this user.</p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              style={{ width: '100%', height: 96, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 16, fontSize: 14, color: '#111827', background: '#f9fafb', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif', outline: 'none' }}
              placeholder="Inappropriate behavior..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowReportModal(false)} style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 500, color: '#374151', background: '#f3f4f6', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>Cancel</button>
              <button onClick={() => { submitReport(reportText); setReportText(''); }} style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 500, color: 'white', background: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
