import React, { useState, useRef, useEffect } from 'react';
import { useVideoChat } from '../hooks/useVideoChat.js';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Flag, MessageCircle, X, Send } from 'lucide-react';

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
  const localContainerRef = useRef(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!draggingRef.current || !localContainerRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const pipWidth = 96;
      const pipHeight = 128;
      
      const maxX = window.innerWidth - pipWidth - 12;
      const maxY = window.innerHeight - pipHeight - 12; 
      
      let newX = clientX - offsetRef.current.x;
      let newY = clientY - offsetRef.current.y;
      
      newX = Math.max(12, Math.min(maxX, newX));
      newY = Math.max(12, Math.min(maxY, newY));
      
      localContainerRef.current.style.right = 'auto';
      localContainerRef.current.style.bottom = 'auto';
      localContainerRef.current.style.left = `${newX}px`;
      localContainerRef.current.style.top = `${newY}px`;
      localContainerRef.current.style.transform = 'none';
    };
    
    const onMouseUp = () => {
      draggingRef.current = false;
    };
    
    const onResize = () => {
       if (window.innerWidth >= 768 && localContainerRef.current) {
          localContainerRef.current.style.left = '';
          localContainerRef.current.style.top = '';
          localContainerRef.current.style.right = '';
          localContainerRef.current.style.bottom = '';
       }
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
    window.addEventListener('resize', onResize);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

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


  const onMouseDown = (e) => {
    if (window.innerWidth >= 768) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    if (localContainerRef.current) {
      const rect = localContainerRef.current.getBoundingClientRect();
      draggingRef.current = true;
      offsetRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }
  };

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
    <div style={{ position: 'fixed', inset: 0, background: '#0a0f1e', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.3; }
            100% { transform: scale(1); opacity: 1; }
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

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '12px 16px', background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>S</div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Stranger</div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginLeft: 4 }}></div>
          <button onClick={() => setShowReportModal(true)} style={{ marginLeft: 'auto', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flag size={18} />
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '8px 16px max(16px, env(safe-area-inset-bottom))', background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)', display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center' }}>
          <button onClick={toggleAudio} style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isAudioEnabled ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={toggleVideo} style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
          <button onClick={onQuit} style={{ width: 52, height: 52, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={24} />
          </button>
          <button onClick={findStranger} style={{ width: 52, height: 52, borderRadius: '50%', background: '#22c55e', border: 'none', color: '#0a0f1e', fontSize: 22, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SkipForward size={24} />
          </button>
        </div>

        {isDisconnected && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 500 }}>Stranger disconnected</div>
            <button onClick={findStranger} style={{ height: 48, borderRadius: 24, background: '#22c55e', border: 'none', color: '#0a0f1e', padding: '0 32px', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>Find new stranger</button>
            <button onClick={onQuit} style={{ height: 48, borderRadius: 24, background: 'transparent', border: '1px solid white', color: 'white', padding: '0 32px', cursor: 'pointer', fontSize: 16, fontWeight: 500 }}>Go home</button>
          </div>
        )}
      </div>

      {/* BOTTOM CHAT PANEL */}
      <div style={{ height: 280, flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
        <div style={{ height: 48, background: '#075e54', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 600 }}>S</div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Stranger</div>
          <div style={{ marginLeft: 'auto', color: '#4ade80', fontSize: 13 }}>
            {isStrangerTyping ? 'Stranger is typing…' : ''}
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((msg, idx) => {
            if (msg.sender === 'system') {
              return (
                <div key={idx} style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', padding: '4px 0' }}>
                  {msg.text}
                </div>
              );
            }
            const isMe = msg.sender === 'me';
            return (
              <div key={idx} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                background: isMe ? '#075e54' : '#1f2937',
                color: isMe ? 'white' : '#e5e7eb',
                padding: '8px 12px',
                borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                maxWidth: '75%',
                fontSize: 14,
                lineHeight: 1.4
              }}>
                <div>{msg.text}</div>
                <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: 4 }}>
                  {getTimestamp(msg)}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div style={{ height: 56, background: '#111827', paddingBottom: 'env(safe-area-inset-bottom)', display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
          <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) sendMessage(); }} style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Type a message…"
              disabled={!isConnected}
              style={{ flex: 1, background: '#1f2937', border: 'none', borderRadius: 24, padding: '10px 16px', color: '#f9fafb', fontSize: 16, outline: 'none' }}
            />
            <button type="submit" disabled={!isConnected || !chatInput.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: '#22c55e', border: 'none', color: '#0a0f1e', fontSize: 18, cursor: 'pointer', flexShrink: 0, opacity: (!isConnected || !chatInput.trim()) ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {isWaiting && (
        <div style={{ position: 'absolute', inset: 0, background: '#0a0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 64, height: 64, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ color: 'white', fontSize: 20, marginTop: 24 }}>Looking for a stranger…</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 8 }}>Searching for {waitSeconds}s…</div>
          <button onClick={onQuit} style={{ height: 44, borderRadius: 22, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', marginTop: 32, padding: '0 32px', cursor: 'pointer', fontSize: 16 }}>Stop</button>
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
