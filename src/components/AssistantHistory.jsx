import React from 'react';
import { MessageSquare, Clock, Database, Trash2, Calendar } from 'lucide-react';

const AssistantHistory = ({ history, onClear }) => {
  if (!history || history.length === 0) {
    return (
      <div className="animate-fade" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        color: 'var(--text-secondary)' 
      }}>
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)', 
          padding: '2rem', 
          borderRadius: '50%', 
          marginBottom: '1.5rem' 
        }}>
          <MessageSquare size={48} color="var(--primary)" />
        </div>
        <h3>No Chat History Yet</h3>
        <p>Your conversations with the AI will appear here.</p>
      </div>
    );
  }

  const groupedHistory = history.reduce((acc, chat) => {
    const key = chat.datasetId || 'General';
    if (!acc[key]) acc[key] = { name: chat.datasetName || 'General', chats: [] };
    acc[key].chats.push(chat);
    return acc;
  }, {});

  return (
    <div className="animate-fade" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2.5rem' 
      }}>
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>AI Assistant History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Browse previous insights organized by dataset.
          </p>
        </div>
        <button 
          onClick={onClear}
          className="btn" 
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        >
          <Trash2 size={18} /> Clear All History
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {Object.entries(groupedHistory).reverse().map(([datasetId, group]) => (
          <section key={datasetId}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '1.5rem',
              color: 'var(--primary)',
              padding: '0.5rem 1rem',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '0.5rem',
              width: 'fit-content',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <Database size={18} />
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>{group.name}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {group.chats.slice().reverse().map((chat) => (
                <div key={chat.id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '1.5rem', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={12} /> {new Date(chat.id).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} /> {new Date(chat.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ background: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: 800 }}>USER</div>
                      <p style={{ fontSize: '0.95rem', color: 'white' }}>{chat.query}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ background: 'var(--accent)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: 800 }}>AI</div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{chat.response}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AssistantHistory;
