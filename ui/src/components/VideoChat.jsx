import React, { useState, useRef, useEffect } from 'react';
import { useVideoChat } from '../hooks/useVideoChat.js';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Flag, MessageCircle, X, Send } from 'lucide-react';
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
    <div style={{ position: 'fixed', inset: 0, background: '#0f172a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(196,149,106,0.4); }
            70% { box-shadow: 0 0 0 20px rgba(196,149,106,0); }
            100% { box-shadow: 0 0 0 0 rgba(196,149,106,0); }
          }
          .stop-btn {
            background: transparent;
            border: 1.5px solid #334155;
            color: #94a3b8;
            border-radius: 24px;
            padding: 10px 28px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 32px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .stop-btn:hover {
            border-color: #c4956a;
            color: #c4956a;
          }
          .report-btn {
            margin-left: auto; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: white; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
          }
          .report-btn:hover {
            background: #c4956a;
          }
          .control-btn {
            width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.1); color: white; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
          }
          .control-btn:hover {
            background: rgba(255,255,255,0.2);
          }
          .chat-input {
            flex: 1; background: #1e293b; border: 1.5px solid transparent; border-radius: 24px; padding: 10px 16px; color: #f1f5f9; font-size: 15px; outline: none; transition: border-color 0.2s;
          }
          .chat-input:focus {
            border-color: #c4956a !important;
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
          style={{ position: 'absolute', top: 12, right: 12, width: 96, height: 128, borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)', zIndex: 10, cursor: 'grab', overflow: 'hidden' }}
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
            background: '#c4956a', color: 'white', padding: '8px 16px', borderRadius: 24,
            boxShadow: '0 4px 12px rgba(196,149,106,0.4)', zIndex: 100,
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
            animation: 'slide-down 0.3s ease-out forwards'
          }}>
            {toastMessage}
            {commonInterests.length > 0 && commonInterests.map((interest, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                {interest}
              </span>
            ))}
          </div>
        )}

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '12px 16px', background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#c4956a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>S</div>
          <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 500, fontFamily: "'Inter', system-ui, sans-serif" }}>Stranger</div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginLeft: 4 }}></div>
          <button onClick={() => setShowReportModal(true)} className="report-btn">
            <Flag size={18} />
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '8px 16px max(16px, env(safe-area-inset-bottom))', background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)', display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
          <button onClick={toggleAudio} className="control-btn">
            {!isAudioEnabled ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} className="control-btn">
            {!isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={onQuit} style={{ width: 52, height: 52, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}>
            <LogOut size={24} />
          </button>
          <button onClick={findStranger} style={{ width: 52, height: 52, borderRadius: '50%', background: '#c4956a', border: 'none', color: '#0a0f1e', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(196,149,106,0.4)' }}>
            <SkipForward size={24} />
          </button>
        </div>

        {isDisconnected && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ background: '#1e293b', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600 }}>Stranger disconnected</div>
              <button onClick={findStranger} style={{ height: 48, borderRadius: 24, background: '#c4956a', border: 'none', color: '#ffffff', padding: '0 32px', cursor: 'pointer', fontSize: 16, fontWeight: 600, boxShadow: '0 4px 14px rgba(196,149,106,0.4)' }}>Find new stranger</button>
              <button onClick={onQuit} style={{ height: 48, borderRadius: 24, background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '0 32px', cursor: 'pointer', fontSize: 16, fontWeight: 500 }}>Go home</button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CHAT PANEL */}
      <div style={{ height: 280, flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
        <div style={{ height: 48, background: '#141210', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: '3px solid #c4956a' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#c4956a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>S</div>
          <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 500 }}>Stranger</div>
          <div style={{ marginLeft: 'auto', color: '#c4956a', fontSize: 13 }}>
            {isStrangerTyping ? 'typing…' : (isConnected ? 'connected' : '')}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((msg, idx) => {
            if (msg.sender === 'system') {
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#475569' }}>
                    {msg.text}
                  </div>
                  <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
                </div>
              );
            }
            const isMe = msg.sender === 'me';
            return (
              <div key={idx} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                background: isMe ? 'linear-gradient(135deg, #c4956a, #a87a52)' : '#1e293b',
                color: isMe ? '#ffffff' : '#e2e8f0',
                padding: '8px 12px',
                borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: isMe ? '0 2px 8px rgba(196,149,106,0.3)' : 'none',
                maxWidth: '75%',
                fontSize: 14,
                lineHeight: 1.4
              }}>
                <div>{msg.text}</div>
                <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right', marginTop: 4 }}>
                  {getTimestamp(msg)}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{ height: 56, background: '#0d1117', borderTop: '1px solid #1e293b', paddingBottom: 'env(safe-area-inset-bottom)', display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) sendMessage(); }} style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Type a message…"
              disabled={!isConnected}
              className="chat-input"
            />
            <button type="submit" disabled={!isConnected || !chatInput.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: (!isConnected || !chatInput.trim()) ? '#1e293b' : '#c4956a', border: 'none', color: (!isConnected || !chatInput.trim()) ? '#475569' : '#ffffff', fontSize: 18, cursor: 'pointer', flexShrink: 0, boxShadow: (!isConnected || !chatInput.trim()) ? 'none' : '0 2px 8px rgba(196,149,106,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {isWaiting && (
        <div style={{ position: 'absolute', inset: 0, background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 64, height: 64, background: '#c4956a', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif", fontSize: 20, marginTop: 24 }}>Looking for a stranger…</div>
          <div style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Searching for {waitSeconds}s…</div>
          <button onClick={onQuit} className="stop-btn">Stop</button>
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
