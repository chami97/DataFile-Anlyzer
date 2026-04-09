import React from 'react';
import { Target, TrendingUp, Activity, BarChart3, PieChart, Calendar, ArrowUpRight } from 'lucide-react';

const Sparkline = ({ data, color = 'var(--primary)' }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    d += ` C ${cp1x} ${points[i].y}, ${cp1x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity: 0.15 }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const Insights = ({ data, insights }) => {
  if (!insights) {
    return (
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <Target size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
        <h3>Waiting for Data</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Upload a dataset to generate smart insights automatically.</p>
      </div>
    );
  }

  const { kpis, categories, trends } = insights;

  const getKPIIcon = (idx, type) => {
    if (type === 'currency') return <ArrowUpRight size={20} color="var(--accent)" />;
    if (type === 'date') return <Calendar size={20} color="var(--primary)" />;
    if (idx === 0) return <Target size={20} color="var(--primary)" />;
    return <Activity size={20} color="var(--primary)" />;
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>Smart Insights</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Automated analysis of your dataset's key performance indicators and practical trends.
        </p>
      </header>

      {/* KPI Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {kpis.slice(0, 5).map((kpi, idx) => (
          <div key={idx} className="glass-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            minHeight: '170px',
            background: 'var(--card-bg)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '40%', pointerEvents: 'none' }}>
              <Sparkline data={kpi.samples} color={idx % 2 === 0 ? 'var(--primary)' : 'var(--accent)'} />
            </div>
            
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {kpi.label}
              </p>
              {getKPIIcon(idx, kpi.type)}
            </header>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <h2 style={{ 
                  fontSize: kpi.value.length > 15 ? '1.5rem' : '2.25rem', 
                  margin: '0', 
                  fontWeight: 800, 
                  color: 'white', 
                  letterSpacing: '-1px',
                  transition: 'font-size 0.2s ease'
                }}>
                  {kpi.value}
                </h2>
                {kpi.unit && <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1rem' }}>{kpi.unit}</span>}
              </div>
              
              {kpi.secondaryValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--accent)', marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                  <TrendingUp size={12} />
                  <span>{kpi.secondaryLabel}: {kpi.secondaryValue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Trends Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Activity Trends</h3>
          </div>
          
          {trends ? (
            <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderBottom: '1px solid var(--card-border)', borderLeft: '1px solid var(--card-border)', opacity: 0.5 }} />
              {trends.data.map((point, idx) => {
                const max = Math.max(...trends.data.map(p => p.count));
                const height = (point.count / max) * 100;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: `${height}%`, 
                      background: 'linear-gradient(to top, var(--primary), var(--accent))',
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.8,
                      transition: 'height 1s ease'
                    }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                      {point.date.split('-')[1]}/{point.date.split('-')[0].slice(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '0 2rem' }}>
              No time-series data detected. Ensure your file has consistent date formats.
            </div>
          )}
        </div>

        {/* Categorical Section */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <BarChart3 size={20} color="var(--accent)" />
            <h3 style={{ margin: 0 }}>Top Categories</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {categories.length > 0 ? categories.map((cat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{cat.label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cat.data.map((item, i) => {
                    const max = cat.data[0].count;
                    const width = (item.count / max) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${width}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px' }}>{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No distinct categories found in this dataset.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
