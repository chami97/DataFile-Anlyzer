import React from 'react';
import { LayoutDashboard, MessageSquare, PlusCircle, Settings, HelpCircle, BarChart3, Database, PieChart, Brain } from 'lucide-react';

const Sidebar = ({ currentView, onViewChange, onChatToggle }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'datasets', icon: <Database size={20} />, label: 'Datasets' },
    { id: 'insights', icon: <BarChart3 size={20} />, label: 'Insights' },
    { id: 'charts', icon: <PieChart size={20} />, label: 'Charts' },
    { id: 'ml', icon: <Brain size={20} />, label: 'ML Analytics' },
    { id: 'assistant', icon: <MessageSquare size={20} />, label: 'AI Assistant' },
  ];

  return (
    <div className="sidebar animate-fade" style={{ 
      background: 'rgba(15, 23, 42, 0.4)',
      borderRight: '1px solid var(--card-border)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <Database size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>DataAI</h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onViewChange(item.id)}
            className="nav-item" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              color: currentView === item.id ? 'white' : 'var(--text-secondary)',
              background: currentView === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: currentView === item.id ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent'
            }}
          >
            {item.icon}
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '1rem',
        border: '1px solid var(--card-border)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6366f1, #10b981)'
          }} />
          <div style={{ fontSize: '0.85rem' }}>
            <p style={{ fontWeight: 700 }}>AI Assistant</p>
            <p style={{ color: 'var(--text-secondary)' }}>Ready to help</p>
          </div>
        </div>
        <button 
          onClick={onChatToggle}
          className="btn btn-primary" 
          style={{ width: '100%', fontSize: '0.8rem' }}
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
