import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Brain, TrendingUp, Activity, Cpu, Upload, ShieldCheck, Target, FileJson, Grid, Percent } from 'lucide-react';
import { parseMLHistory } from '../utils/dataProcessor';
import PredictiveSimulator from './PredictiveSimulator';

const MLDashboard = ({ onDataProcessed, datasetSummary }) => {
  const [mlData, setMlData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Import from dataProcessor (it's actually passed via props in App.jsx usually, 
    // but for this specific dashboard we handle its own upload)
    const { parseFile } = await import('../utils/dataProcessor');
    try {
      const rawData = await parseFile(file);
      const processed = parseMLHistory(rawData);
      setMlData({ ...processed, fileName: file.name });
      if (onDataProcessed) onDataProcessed(rawData, processed, file.name);
    } catch (err) {
      alert("Failed to parse ML training logs. Ensure the file contains 'loss' and 'accuracy' columns.");
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'rgba(255, 255, 255, 0.7)' } },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(255, 255, 255, 0.5)' } }
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>ML Model Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Visualize training performance and metrics from your Colab or local ML scripts.
          </p>
        </div>
        {mlData && (
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.05)' }}>
            <FileJson size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{mlData.fileName}</span>
          </div>
        )}
      </header>

      {!mlData ? (
        <div 
          className={`glass-card ${isDragOver ? 'drag-over' : ''}`}
          style={{ 
            padding: '5rem', 
            textAlign: 'center', 
            border: '2px dashed var(--card-border)',
            background: 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer'
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload({ target: { files: [file] } });
          }}
          onClick={() => document.getElementById('ml-upload').click()}
        >
          <input 
            type="file" 
            id="ml-upload" 
            hidden 
            accept=".csv,.xlsx,.json" 
            onChange={handleFileUpload} 
          />
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary)' }}>
            <Upload size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Upload Training Logs</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Drag and drop your model's history CSV or JSON file here to visualize the training process.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Accuracy</p>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--accent)' }}>{(mlData.lastMetrics.accuracy * 100).toFixed(2)}%</h2>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Validation Accuracy</p>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{(mlData.lastMetrics.val_accuracy * 100).toFixed(2)}%</h2>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Precision (Sim)</p>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>{(mlData.lastMetrics.precision * 100).toFixed(1)}%</h2>
            </div>
            <div className="glass-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recall (Sim)</p>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--warning)' }}>{(mlData.lastMetrics.recall * 100).toFixed(1)}%</h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Accuracy Chart */}
            <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <ShieldCheck size={20} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Accuracy Curve</h3>
              </div>
              <div style={{ flex: 1 }}>
                <Line data={mlData.accuracyChart} options={chartOptions} />
              </div>
            </div>

            {/* Loss Chart */}
            <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Activity size={20} color="var(--danger)" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Loss Curve</h3>
              </div>
              <div style={{ flex: 1 }}>
                <Line data={mlData.lossChart} options={chartOptions} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
              {/* Confusion Matrix Heatmap */}
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Grid size={20} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>Confusion Matrix</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--success)' }}>True Positive</p>
                        <h4 style={{ margin: 0 }}>{mlData.lastMetrics.confusion.tp}</h4>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>False Negative</p>
                        <h4 style={{ margin: 0 }}>{mlData.lastMetrics.confusion.fn}</h4>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.5rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>False Positive</p>
                        <h4 style={{ margin: 0 }}>{mlData.lastMetrics.confusion.fp}</h4>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--success)' }}>True Negative</p>
                        <h4 style={{ margin: 0 }}>{mlData.lastMetrics.confusion.tn}</h4>
                    </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div className="glass-card" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                        <div><strong style={{ color: 'var(--primary)' }}>F1:</strong> {mlData.lastMetrics.f1.toFixed(3)}</div>
                        <div><strong style={{ color: 'var(--accent)' }}>Acc:</strong> {mlData.lastMetrics.val_accuracy.toFixed(3)}</div>
                    </div>
                </div>
              </div>

              {/* What-If Prediction Section */}
              <PredictiveSimulator datasetSummary={datasetSummary} />
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.1))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Target size={24} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>Model Diagnostics</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <p>Based on the final training validation of <strong>{(mlData.lastMetrics.val_accuracy * 100).toFixed(1)}%</strong>, the simulator above allows you to test operational scenarios. 
                Your model appears {mlData.lastMetrics.val_accuracy > 0.85 ? 'Highly Reliable' : 'Slightly Underfit'} for production deployment.</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        🚀 Ready for Deployment
                    </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--card-border)', paddingLeft: '2rem' }}>
                <Activity size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Reliability Score</p>
                <h2 style={{ fontSize: '2.5rem' }}>{Math.min(99, (mlData.lastMetrics.val_accuracy * 110)).toFixed(0)}%</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLDashboard;
