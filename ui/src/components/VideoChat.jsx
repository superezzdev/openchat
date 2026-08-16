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

  // Draggable PiP
  const localContainerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const pipWidth = isMobile ? 100 : 160;
      const pipHeight = isMobile ? 150 : 120; // Portrait for mobile, landscape for desktop
      
      const initialX = window.innerWidth - pipWidth - (isMobile ? 16 : 24);
      const initialY = window.innerHeight - pipHeight - (isMobile ? 80 : 100);
      posRef.current = { x: initialX, y: initialY };
      if (localContainerRef.current) {
        localContainerRef.current.style.transform = `translate(${initialX}px, ${initialY}px)`;
      }
    }

    const onMouseMove = (e) => {
      // Touch and mouse movement
      if (!draggingRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const newX = clientX - offsetRef.current.x;
      const newY = clientY - offsetRef.current.y;
      posRef.current = { x: newX, y: newY };
      if (localContainerRef.current) {
        localContainerRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };
    const onMouseUp = () => {
      draggingRef.current = false;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  const onMouseDown = (e) => {
    // Handle both touch and mouse
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    draggingRef.current = true;
    offsetRef.current = {
      x: clientX - posRef.current.x,
      y: clientY - posRef.current.y
    };
  };

  const isConnected = status === 'connected';
  const isWaiting = status === 'idle' || status === 'searching' || status === 'waiting';
  const isDisconnected = status === 'disconnected';

  return (
    <div className="videochat-container" style={{
      width: '100%',
      height: '100dvh',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--white)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--gray-900)'
    }}>
      {/* Background Gradient Layer */}
      <div className="bg-gradient-1"></div>
      <div className="bg-gradient-2"></div>

      {/* Toast Message */}
      {toastMessage && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}

      {/* Remote Video */}
      {mode === 'video' && (
        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          muted={false}
          className="remote-video"
          style={{
            filter: isConnected ? 'saturate(0.95)' : 'none',
            opacity: isConnected ? 1 : 0,
            backgroundColor: 'transparent'
          }}
        />
      )}

      {/* Top Bar Glass Card */}
      <div className="top-bar glass-panel">
        {/* Left: Logo */}
        <div className="logo-container" onClick={onQuit}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="7" cy="10" r="5" stroke="var(--gray-900)" strokeWidth="1.5" />
            <circle cx="13" cy="10" r="5" stroke="var(--gray-900)" strokeWidth="1.5" />
          </svg>
          <span className="logo-text">randall</span>
        </div>

        {/* Center: Status Badge */}
        <div className="status-badge">
          {isWaiting && (
            <span className="status-text">
              <span className="status-dot waiting"></span>
              <span className="status-label">Looking for strangers...</span>
            </span>
          )}
          {isConnected && (
            <span className="status-text">
              <span className="status-dot connected"></span>
              <span className="status-label">You're chatting</span>
            </span>
          )}
          {isDisconnected && (
            <span className="status-text">
              <span className="status-dot disconnected"></span>
              <span className="status-label">Stranger disconnected</span>
            </span>
          )}
        </div>

        {/* Right: Online Counter */}
        <div className="online-counter">
          {userCount} <span className="online-label">online</span>
        </div>
      </div>

      {/* Waiting Loader Overlay */}
      {isWaiting && (
        <div className="waiting-loader-overlay">
          <div className="loader-spinner"></div>
          <p className="loader-text">Looking for a match...</p>
        </div>
      )}

      {/* Common Interests */}
      {commonInterests && commonInterests.length > 0 && (
        <div className="common-interests-badge">
          You both like: {commonInterests.join(', ')}
        </div>
      )}

      {/* Local Video PiP */}
      {mode === 'video' && (
        <div 
          ref={localContainerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          className="pip-container"
          style={{
            cursor: draggingRef.current ? 'grabbing' : 'grab'
          }}
        >
          <video
            ref={localVideoRef}
            playsInline
            autoPlay
            muted={true}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror local video
            }}
          />
        </div>
      )}

      {/* "Stranger is typing..." indicator */}
      <div className="typing-indicator" style={{
        opacity: isStrangerTyping && !isChatOpen ? 1 : 0,
        bottom: '88px',
        right: '24px',
        left: 'auto'
      }}>
        Stranger is typing...
      </div>

      {/* Control Bar (Glass Card) */}
      <div className="control-bar glass-panel-bottom">
        <div className="control-group-left">
          <button 
            title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
            onClick={toggleAudio}
            className={`icon-btn ${!isAudioEnabled ? 'danger-btn' : 'glass-btn'}`}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          {mode === 'video' && (
            <button 
              title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              onClick={toggleVideo}
              className={`icon-btn ${!isVideoEnabled ? 'danger-btn' : 'glass-btn'}`}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          )}
        </div>

        <div style={{ flex: 1 }}></div>

        <div className="control-group-right">
          <button 
            title="Report User"
            onClick={() => setShowReportModal(true)}
            className="icon-btn glass-btn"
          >
            <Flag size={18} />
          </button>
          
          <button 
            title="Next Stranger"
            onClick={findStranger}
            className="action-btn primary-action-btn"
          >
            <SkipForward size={20} />
            <span className="action-btn-text">Next</span>
          </button>

          <button 
            title="Quit Chat"
            onClick={onQuit}
            className="icon-btn outline-danger-btn"
          >
            <LogOut size={20} />
          </button>

          <button 
            title="Toggle Chat Panel"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`icon-btn ${isChatOpen ? 'active-glass-btn' : 'glass-btn'} chat-toggle-btn`}
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </div>

      {/* Side Chat Panel (Glass Card) */}
      <div className={`chat-panel ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Chat</span>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="chat-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'me' ? 'flex-end' : (msg.sender === 'system' ? 'center' : 'flex-start')
            }}>
              {msg.sender === 'system' ? (
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', margin: '8px 0', textAlign: 'center' }}>{msg.text}</div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.sender === 'me' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.sender === 'stranger' ? '4px' : '16px',
                  background: msg.sender === 'me' ? 'var(--gray-900)' : 'rgba(255, 255, 255, 0.95)',
                  color: msg.sender === 'me' ? 'var(--white)' : 'var(--gray-900)',
                  boxShadow: msg.sender === 'stranger' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                  fontSize: '14px',
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          
          {isStrangerTyping && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <div className="typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            style={{ display: 'flex', gap: '8px', width: '100%' }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="chat-input-field"
            />
            <button
              type="submit"
              disabled={!isConnected || !chatInput.trim()}
              className="chat-send-btn"
            >
              <Send size={16} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Report User</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--gray-600)' }}>
              Please describe why you are reporting this user.
            </p>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="report-textarea"
              placeholder="Inappropriate behavior..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowReportModal(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={() => { submitReport(reportText); setReportText(''); }}
                className="modal-submit-btn"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for VideoChat */}
      <style>{`
        .bg-gradient-1 {
          position: absolute; top: -10%; left: -10%; width: 400px; height: 400px; background-color: rgba(26, 86, 219, 0.1); border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0;
        }
        .bg-gradient-2 {
          position: absolute; bottom: -10%; right: -10%; width: 400px; height: 400px; background-color: rgba(22, 163, 74, 0.1); border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0;
        }
        .toast-message {
          position: absolute; top: 24px; left: 50%; transform: translateX(-50%); z-index: 100; padding: 12px 24px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px); border-radius: var(--radius-pill); box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 14px; font-weight: 500; color: var(--gray-900); border: 1px solid rgba(255,255,255,0.6);
        }
        .remote-video {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; transition: opacity 300ms;
        }
        .top-bar {
          position: absolute; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; z-index: 10;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.4); box-shadow: 0 4px 16px rgba(0,0,0,0.02);
        }
        .glass-panel-bottom {
          background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.4); box-shadow: 0 -4px 16px rgba(0,0,0,0.02);
        }
        .logo-container {
          display: flex; align-items: center; gap: 8px; cursor: pointer;
        }
        .logo-text {
          font-size: 15px; font-weight: 500; letter-spacing: -0.01em;
        }
        .status-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 16px; background: rgba(255, 255, 255, 0.7); border-radius: var(--radius-pill); box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-size: 13px; font-weight: 500; border: 1px solid rgba(255,255,255,0.6);
        }
        .status-text {
          display: flex; align-items: center; gap: 8px;
        }
        .status-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .status-dot.waiting {
          background-color: var(--gray-400); animation: pulse 1.5s infinite;
        }
        .status-dot.connected { background-color: var(--success); }
        .status-dot.disconnected { background-color: var(--danger); }
        .online-counter {
          padding: 6px 12px; background: rgba(255, 255, 255, 0.7); border-radius: var(--radius-pill); font-size: 12px; font-weight: 500; color: var(--gray-600); border: 1px solid rgba(255,255,255,0.6);
        }
        .common-interests-badge {
          position: absolute; top: 80px; left: 50%; transform: translateX(-50%); z-index: 10; padding: 8px 20px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: var(--radius-pill); font-size: 13px; font-weight: 500; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 4px 12px rgba(0,0,0,0.05); color: var(--gray-900);
        }
        .pip-container {
          position: absolute; top: 0; left: 0; width: 160px; height: 120px; z-index: 20; border-radius: 12px; border: 2px solid rgba(255,255,255,0.6); box-shadow: 0 4px 20px rgba(0,0,0,0.2); overflow: hidden; background-color: var(--gray-900);
        }
        .typing-indicator {
          position: absolute; bottom: 88px; left: 24px; z-index: 10; padding: 6px 12px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border-radius: var(--radius-pill); font-size: 12px; color: var(--gray-600); transition: opacity 300ms ease-in-out; pointer-events: none; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .control-bar {
          position: absolute; bottom: 0; left: 0; width: 100%; padding: 16px 24px; display: flex; align-items: center; z-index: 10;
        }
        .control-group-left, .control-group-right {
          display: flex; gap: 12px; align-items: center;
        }
        .icon-btn {
          width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.6); cursor: pointer; transition: all 150ms;
        }
        .glass-btn {
          background: rgba(255,255,255,0.8); color: var(--gray-600);
        }
        .glass-btn:hover { background: rgba(255,255,255,1); }
        .danger-btn {
          background: var(--danger); color: var(--white); border-color: var(--danger);
        }
        .outline-danger-btn {
          background: rgba(255,255,255,0.8); color: var(--danger);
        }
        .outline-danger-btn:hover { background: rgba(255,255,255,1); }
        .active-glass-btn {
          background: var(--gray-900); color: var(--white);
        }
        .action-btn {
          height: 48px; padding: 0 24px; border-radius: var(--radius-pill); display: flex; align-items: center; gap: 8px; border: none; cursor: pointer; font-weight: 500; font-size: 15px; transition: opacity 150ms;
        }
        .primary-action-btn {
          background: var(--gray-900); color: var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .primary-action-btn:hover { opacity: 0.88; }
        .chat-panel {
          position: absolute; top: 0; right: 0; width: 100%; max-width: 340px; height: 100%; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); border-left: 1px solid rgba(255,255,255,0.5); box-shadow: -8px 0 32px rgba(0,0,0,0.05); transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1); z-index: 30; display: flex; flex-direction: column; transform: translateX(100%);
        }
        .chat-panel.open { transform: translateX(0); }
        .chat-header {
          padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.3);
        }
        .chat-close-btn { background: none; border: none; cursor: pointer; color: var(--gray-600); }
        .chat-messages {
          flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
        }
        .typing-bubble {
          padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px; background: rgba(255, 255, 255, 0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; gap: 4px; align-items: center; width: fit-content;
        }
        .typing-dot {
          width: 5px; height: 5px; background: #9CA3AF; border-radius: 50%; animation: typing-bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .chat-input-area {
          padding: 16px; border-top: 1px solid rgba(0,0,0,0.05); background: rgba(255,255,255,0.4);
        }
        .chat-input-field {
          flex: 1; padding: 12px 16px; border-radius: var(--radius-pill); border: 1px solid rgba(255,255,255,0.8); background: rgba(255,255,255,0.6); outline: none; font-size: 14px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.02); font-family: var(--font-sans); color: var(--gray-900); width: 100%;
        }
        .chat-send-btn {
          width: 42px; height: 42px; border-radius: 50%; background: var(--gray-900); color: var(--white); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 150ms; flex-shrink: 0;
        }
        .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .modal-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 50; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
        }
        .modal-content {
          background: var(--white); padding: 24px; border-radius: var(--radius-lg); width: 90%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .report-textarea {
          width: 100%; height: 100px; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--gray-200); outline: none; margin-bottom: 16px; font-family: var(--font-sans); resize: none; box-sizing: border-box;
        }
        .modal-cancel-btn {
          padding: 8px 16px; border-radius: var(--radius-md); border: 1px solid var(--gray-200); background: var(--white); cursor: pointer; font-weight: 500;
        }
        .modal-submit-btn {
          padding: 8px 16px; border-radius: var(--radius-md); border: none; background: var(--danger); color: var(--white); cursor: pointer; font-weight: 500;
        }

        .waiting-loader-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: rgba(255, 255, 255, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 5;
        }
        .loader-spinner {
          width: 50px; height: 50px; border: 4px solid rgba(0, 0, 0, 0.1); border-top: 4px solid var(--gray-900); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;
        }
        .loader-text {
          font-size: 18px; font-weight: 600; color: var(--gray-900); letter-spacing: -0.01em; animation: pulse-text 2s infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-text {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 168, 168, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(168, 168, 168, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(168, 168, 168, 0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .status-text { animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        /* Media Queries for Mobile/Tablet Responsiveness */
        @media (max-width: 768px) {
          .top-bar { padding: 12px 16px; }
          .logo-text { display: none; } /* Hide "randall" text to save space */
          .status-badge { padding: 4px 10px; font-size: 11px; }
          .status-label { display: none; } /* Hide "You're chatting" text */
          .online-counter { font-size: 11px; padding: 4px 10px; }
          .online-label { display: none; } /* Show only number online */
          
          .control-bar { padding: 12px 16px; justify-content: space-between; }
          .control-group-left, .control-group-right { gap: 8px; }
          .icon-btn { width: 44px; height: 44px; }
          
          .action-btn-text { display: none; } /* Hide "Next" text */
          .action-btn { padding: 0; width: 44px; height: 44px; justify-content: center; }
          
          .pip-container { width: 100px; height: 150px; }
          
          .chat-panel {
            max-width: 100% !important;
            height: 60dvh !important;
            top: auto !important;
            bottom: 0 !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.5) !important;
            transform: translateY(100%) !important;
            border-top-left-radius: 24px;
            border-top-right-radius: 24px;
            z-index: 40; /* Make sure it overlaps controls if needed */
          }
          .chat-panel.open { transform: translateY(0) !important; }
          .typing-indicator { bottom: 80px; left: 16px; font-size: 11px; padding: 4px 10px; }
        }
        
        @media (max-width: 400px) {
           .control-bar { padding: 8px 12px; }
           .icon-btn { width: 40px; height: 40px; }
           .action-btn { width: 40px; height: 40px; }
           .pip-container { width: 80px; height: 120px; border-width: 1px; }
        }
      `}</style>
    </div>
  );
};

export default VideoChat;
