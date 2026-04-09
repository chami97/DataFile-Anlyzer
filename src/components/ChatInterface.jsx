import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Loader2, Sparkles } from 'lucide-react';

const ChatInterface = ({ isOpen, onClose, messages, onSendMessage, isTyping, fileName }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isTyping) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(30, 41, 59, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            color: 'white'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>AI Assistant</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>
              {fileName ? `Analyzing: ${fileName}` : 'Ready to help'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {messages.length === 0 && (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            padding: '2rem'
          }}>
            <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.9rem' }}>
              Ask me anything about your data!<br />
              e.g., "What are the key trends?" or "Summarize this file."
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
          >
            {msg.content}
          </div>
        ))}
        
        {isTyping && (
          <div className="message-bubble message-assistant" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Loader2 size={16} className="animate-spin" />
            Assistant is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid var(--card-border)',
        background: 'rgba(30, 41, 59, 0.4)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a question..."
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--card-border)',
              borderRadius: '0.75rem',
              padding: '0.875rem 1.25rem',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="btn btn-primary"
            style={{
              padding: '0',
              width: '45px',
              height: '45px',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (!inputValue.trim() || isTyping) ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
