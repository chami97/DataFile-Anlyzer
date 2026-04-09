import React, { useState, useEffect } from 'react';
import { Sliders, Zap, Target, AlertCircle } from 'lucide-react';

const PredictiveSimulator = ({ datasetSummary }) => {
  const [features, setFeatures] = useState({});
  const [prediction, setPrediction] = useState(0);

  useEffect(() => {
    if (datasetSummary && datasetSummary.columnStats) {
      const numericFeatures = Object.entries(datasetSummary.columnStats)
        .filter(([_, stats]) => stats.isNumeric)
        .slice(0, 4);
      
      const initialFeatures = {};
      numericFeatures.forEach(([name, stats]) => {
        initialFeatures[name] = stats.avg;
      });
      setFeatures(initialFeatures);
    }
  }, [datasetSummary]);

  useEffect(() => {
    // Basic "Mock" Prediction Model logic (Simple Weighted Sum)
    if (Object.keys(features).length > 0) {
      let score = 0;
      Object.entries(features).forEach(([name, val], index) => {
        const stats = datasetSummary.columnStats[name];
        const normalized = (val - stats.min) / (stats.max - stats.min || 1);
        // Alternate weights for variety
        const weight = index % 2 === 0 ? 0.4 : 0.2;
        score += normalized * weight;
      });
      
      // Base bias + normalize to 0-100
      const finalScore = Math.min(99.9, Math.max(1, (score * 150) + 10));
      setPrediction(finalScore);
    }
  }, [features]);

  if (!datasetSummary || !datasetSummary.columnStats) return null;

  return (
    <div className="glass-card animate-fade" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Sliders size={20} color="var(--primary)" />
        <h3 style={{ margin: 0 }}>Predictive "What-If" Simulator</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
        {/* Sliders Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(features).map(([name, val]) => {
            const stats = datasetSummary.columnStats[name];
            return (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</label>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{val.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min={stats.min}
                  max={stats.max}
                  step={0.1}
                  value={val}
                  onChange={(e) => setFeatures(prev => ({ ...prev, [name]: parseFloat(e.target.value) }))}
                  style={{ 
                    width: '100%', 
                    accentColor: 'var(--primary)',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.1)'
                  }}
                />
              </div>
            );
          })}
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'rgba(16, 185, 129, 0.05)', 
            borderRadius: '0.75rem',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            display: 'flex',
            gap: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--success)'
          }}>
            <Zap size={16} /> <span>Adjust sliders to see real-time inference predictions.</span>
          </div>
        </div>

        {/* Prediction Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Circular Gauge MOCK */}
          <div style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            border: '12px solid rgba(255,255,255,0.05)',
            borderTopColor: prediction > 70 ? 'var(--success)' : (prediction > 40 ? 'var(--primary)' : 'var(--danger)'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: `rotate(${(prediction * 3.6)-180}deg)`
          }}>
            <div style={{ transform: `rotate(${-( (prediction * 3.6)-180 )}deg)`, textAlign: 'center' }}>
              <h2 style={{ fontSize: '3rem', margin: 0, fontWeight: 900 }}>{prediction.toFixed(0)}%</h2>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                Probability
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <h4 style={{ marginBottom: '0.25rem' }}>Prediction Outcome</h4>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '2rem', 
              background: prediction > 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: prediction > 50 ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {prediction > 75 ? 'HIGH CONFIDENCE' : (prediction > 50 ? 'MODERATE' : 'UNLIKELY')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveSimulator;
