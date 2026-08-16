import React, { useState } from 'react';

const Home = ({ onStart, onlineCount = 0 }) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('video'); // video, text, spy
  const [showRules, setShowRules] = useState(false);
  const [isStartHovered, setIsStartHovered] = useState(false);
  const [isStartPressed, setIsStartPressed] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = inputValue.trim().replace(/,$/, '');
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags([...tags, val]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
        `}
      </style>
      <div style={{
        minHeight: '100dvh',
        background: '#eef0f5',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased'
      }}>
        {/* TOP NAVBAR */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: '100%'
        }}>
          {/* LEFT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="11" fill="#0f172a"/>
              <circle cx="21" cy="11" r="11" fill="#0f172a" opacity="0.55"/>
            </svg>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
              randall
            </span>
          </div>
          
          {/* RIGHT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20,
              padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                boxShadow: '0 0 0 0 rgba(34,197,94,0.4)',
                animation: 'pulse-ring 2s infinite'
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#16a34a' }}>
                {onlineCount} online
              </span>
            </div>
            
            <a href="https://github.com/superezzdev/openchat" target="_blank" rel="noreferrer" style={{
              background: 'white', border: '1px solid #e2e8f0', borderRadius: 20,
              padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 500, color: '#0f172a', textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* HERO SECTION */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '48px 20px 32px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0 }}>
            <span style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1.5px', lineHeight: 1.1, display: 'block' }}>Meet someone</span>
            <span style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: '#6366f1', letterSpacing: '-1.5px', lineHeight: 1.1, display: 'block' }}>new, right now</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#64748b', marginTop: 16, maxWidth: 420, marginBottom: 0 }}>
            One click. A real person. No accounts, no history.
          </p>

          {/* MAIN CARD */}
          <div style={{
            background: '#ffffff', borderRadius: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08)',
            padding: '32px', width: '100%', maxWidth: 620, marginTop: 32,
            display: 'flex', flexDirection: 'column', gap: 24, boxSizing: 'border-box'
          }}>
            
            {/* A) INTERESTS INPUT */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8 }}>
                YOUR INTERESTS (OPTIONAL)
              </div>
              
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {tags.map(tag => (
                    <div key={tag} style={{
                      background: '#eef2ff', borderRadius: 20,
                      padding: '4px 10px', fontSize: 13, color: '#6366f1', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 5
                    }}>
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none', border: 'none', color: '#6366f1',
                          cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1
                        }}
                      >&times;</button>
                    </div>
                  ))}
                </div>
              )}
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="music, gaming, art, coding…"
                style={{
                  width: '100%', background: '#f1f5f9', border: '1.5px solid transparent',
                  borderRadius: 14, padding: '14px 18px', fontSize: 15, color: '#0f172a',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>

            {/* B) MODE SELECTOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                {
                  id: 'video', label: 'Video + chat', icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                      <polygon points="10 7 15 10 10 13 10 7" fill="currentColor"></polygon>
                    </svg>
                  )
                },
                {
                  id: 'text', label: 'Text only', icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      <line x1="9" y1="10" x2="15" y2="10"></line>
                      <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                  )
                },
                {
                  id: 'spy', label: 'Spy mode', icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )
                }
              ].map(m => (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    background: mode === m.id ? '#0f172a' : '#f8fafc',
                    border: '1.5px solid',
                    borderColor: mode === m.id ? '#0f172a' : '#e2e8f0',
                    color: mode === m.id ? 'white' : '#0f172a',
                    borderRadius: 16, padding: '20px 12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ color: mode === m.id ? 'white' : '#64748b' }}>
                    {m.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* C) START BUTTON */}
            <button
              onClick={() => onStart(tags, mode, '')}
              onMouseEnter={() => setIsStartHovered(true)}
              onMouseLeave={() => { setIsStartHovered(false); setIsStartPressed(false); }}
              onMouseDown={() => setIsStartPressed(true)}
              onMouseUp={() => setIsStartPressed(false)}
              style={{
                width: '100%', height: 56, borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: isStartHovered ? '0 6px 20px rgba(99,102,241,0.5)' : '0 4px 14px rgba(99,102,241,0.4)',
                transform: isStartPressed ? 'scale(0.98)' : (isStartHovered ? 'translateY(-1px)' : 'none'),
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              Start chatting
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            {/* D) RULE PILLS & TOGGLE */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setShowRules(!showRules)}
                style={{
                  background: 'none', border: 'none', fontSize: 12, color: '#64748b', cursor: 'pointer', padding: 0
                }}
              >
                By continuing you agree to our rules {showRules ? '▲' : '▼'}
              </button>
              
              {showRules && (
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
                  {["Be kind", "18+ only", "No nudity", "No harassment"].map(rule => (
                    <div key={rule} style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: 20, padding: '5px 14px', fontSize: 12,
                      fontWeight: 500, color: '#64748b'
                    }}>
                      {rule}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 12,
          borderTop: '1px solid #e2e8f0', marginTop: 'auto',
          fontSize: 13, color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://github.com/superezzdev/" target="_blank" rel="noreferrer" style={{
              color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              @superezzdev
            </a>
            <a href="https://www.superezz.dev/" target="_blank" rel="noreferrer" style={{
              color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
              transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              superezz.dev
            </a>
          </div>
          <div>
            Built with &hearts; &middot; Open source
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
