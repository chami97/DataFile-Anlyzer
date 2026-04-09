import React from 'react';
import { Database, Columns, AlertTriangle, Type, FileSpreadsheet, Layers } from 'lucide-react';

const DataSummary = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    { label: 'Total Rows', value: summary.rowCount.toLocaleString(), icon: <Layers size={21} />, color: '#6366f1' },
    { label: 'Total Columns', value: summary.colCount.toLocaleString(), icon: <Columns size={21} />, color: '#10b981' },
    { label: 'Missing Values', value: summary.totalMissing.toLocaleString(), icon: <AlertTriangle size={21} />, color: '#f59e0b' },
    { label: 'Total Null Values', value: summary.totalNulls.toLocaleString(), icon: <Database size={21} />, color: '#8b5cf6' },
    { label: 'Unique Data Types', value: new Set(Object.values(summary.dataTypes)).size, icon: <Type size={21} />, color: '#ec4899' },
  ];

  // Group columns by data type for the new visual
  const typeGroups = summary.columns.reduce((acc, col) => {
    const type = summary.dataTypes[col] || 'unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(col);
    return acc;
  }, {});

  return (
    <div className="animate-fade">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              opacity: 0.1,
              color: stat.color,
              transform: 'scale(1.8)'
            }}>
              {stat.icon}
            </div>
            <div style={{
              background: `${stat.color}15`,
              color: stat.color,
              padding: '0.65rem',
              borderRadius: '0.75rem',
              width: 'fit-content'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Detailed Column Type Visual */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
          <FileSpreadsheet size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Dataset Schema Overview</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {Object.entries(typeGroups).map(([type, cols]) => {
            let typeLabel = type.toUpperCase();
            let color = 'var(--text-secondary)';
            let bgColor = 'rgba(255, 255, 255, 0.05)';

            if (type === 'numeric') {
              typeLabel = 'Numeric';
              color = '#6366f1';
              bgColor = 'rgba(99, 102, 241, 0.1)';
            } else if (type === 'text') {
              typeLabel = 'Text';
              color = '#10b981';
              bgColor = 'rgba(16, 185, 129, 0.1)';
            } else if (type === 'date') {
              typeLabel = 'Date';
              color = '#f59e0b';
              bgColor = 'rgba(245, 158, 11, 0.1)';
            } else if (type === 'month') {
              typeLabel = 'Month';
              color = '#ec4899';
              bgColor = 'rgba(236, 72, 153, 0.1)';
            }

            return (
              <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    color: color,
                    background: bgColor,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.4rem'
                  }}>
                    {typeLabel}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ({cols.length} Columns)
                  </span>
                </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {cols.map(col => (
                  <div key={col} style={{ 
                    padding: '0.35rem 0.75rem', 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid var(--card-border)', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.85rem',
                    color: 'white'
                  }}>
                    {col}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
};

export default DataSummary;
