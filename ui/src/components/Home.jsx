import React, { useState } from 'react';

const ChatBubbleIcon = ({ size = 48, color = "#22c55e" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
  </svg>
);

const Home = ({ onStart }) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('video'); // video, text
  const [showRules, setShowRules] = useState(false);
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
    <div style={{ 
      minHeight: '100dvh', 
      width: '100%', 
      background: '#0a0f1e', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px 20px', 
      boxSizing: 'border-box',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%', 
        maxWidth: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px'
      }}>
        
        {/* Logo + Title Block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <ChatBubbleIcon size={48} color="#22c55e" />
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#f9fafb', margin: 0 }}>
            ChatRoulette
          </h1>
          <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0, textAlign: 'center' }}>
            Talk to strangers. Make connections.
          </p>
        </div>

        {/* Interests Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: '#6b7280' }}>
            Add your interests (optional)
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. gaming, music…"
            style={{
              width: '100%', 
              background: '#1f2937', 
              border: '1px solid #374151', 
              borderRadius: '12px', 
              padding: '10px 14px', 
              color: '#f9fafb', 
              fontSize: '16px', 
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {tags.map(tag => (
              <div key={tag} style={{
                background: 'rgba(34,197,94,0.15)', 
                border: '1px solid #22c55e', 
                borderRadius: '20px', 
                padding: '4px 10px', 
                color: '#22c55e', 
                fontSize: '13px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px'
              }}>
                <span>{tag}</span>
                <button 
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none', 
                    border: 'none', 
                    color: '#22c55e', 
                    cursor: 'pointer', 
                    fontSize: '16px', 
                    lineHeight: 1, 
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => setMode('video')}
            style={{
              height: '48px', 
              borderRadius: '12px', 
              border: '2px solid', 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: 500, 
              transition: 'all 0.2s',
              background: mode === 'video' ? '#22c55e1a' : '#1f2937',
              borderColor: mode === 'video' ? '#22c55e' : '#374151',
              color: mode === 'video' ? '#22c55e' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '16px' }}>📹</span> Video + Chat
          </button>
          <button
            onClick={() => setMode('text')}
            style={{
              height: '48px', 
              borderRadius: '12px', 
              border: '2px solid', 
              cursor: 'pointer', 
              fontSize: '14px', 
              fontWeight: 500, 
              transition: 'all 0.2s',
              background: mode === 'text' ? '#22c55e1a' : '#1f2937',
              borderColor: mode === 'text' ? '#22c55e' : '#374151',
              color: mode === 'text' ? '#22c55e' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '16px' }}>💬</span> Chat only
          </button>
        </div>

        {/* Start Button */}
        <button
          onMouseDown={() => setIsStartPressed(true)}
          onMouseUp={() => setIsStartPressed(false)}
          onMouseLeave={() => setIsStartPressed(false)}
          onTouchStart={() => setIsStartPressed(true)}
          onTouchEnd={() => setIsStartPressed(false)}
          onClick={() => onStart(tags, mode, '')}
          style={{
            width: '100%', 
            height: '56px', 
            background: '#22c55e', 
            color: '#0a0f1e', 
            border: 'none', 
            borderRadius: '28px', 
            fontSize: '18px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            letterSpacing: '0.3px',
            transform: isStartPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            boxSizing: 'border-box'
          }}
        >
          Start
        </button>

        {/* Rules Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {['18+', 'No accounts', 'Anonymous'].map(badge => (
            <div key={badge} style={{
              background: '#1f2937', 
              border: '1px solid #374151', 
              borderRadius: '20px', 
              padding: '4px 10px', 
              color: '#6b7280', 
              fontSize: '11px'
            }}>
              {badge}
            </div>
          ))}
        </div>

        {/* Rules Link */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setShowRules(!showRules)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px', 
              color: '#4b5563', 
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            By continuing you agree to our rules
          </button>
          {showRules && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#9ca3af',
              textAlign: 'center',
              lineHeight: 1.5,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              Be kind and respectful.<br />
              No harassment or bullying.<br />
              No nudity or explicit content.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
