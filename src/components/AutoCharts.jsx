import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { BarChart3, TrendingUp, PieChart, Info, FileText, Database, Columns } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AutoCharts = ({ chartData, fileName, rowCount, colCount }) => {
  if (!chartData || Object.keys(chartData).length === 0) {
    return (
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
        <BarChart3 size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.5 }} />
        <h3>No Visualization Data</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Upload a dataset with categorical or time-series data to view charts.</p>
      </div>
    );
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: { family: 'Inter, sans-serif', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  const pieOptions = {
    ...commonOptions,
    scales: undefined, // Pie charts don't have scales
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>Data Visualizations</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Interactive charts generated automatically from your dataset.
          </p>
        </div>
        <div className="glass-card" style={{ 
          padding: '0.75rem 1.25rem', 
          display: 'flex', 
          gap: '1.5rem', 
          fontSize: '0.85rem', 
          background: 'rgba(255, 255, 255, 0.02)',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ color: 'white', fontWeight: 600 }}>{fileName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} color="var(--accent)" />
            <span style={{ color: 'var(--text-secondary)' }}>{rowCount} Rows</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Columns size={16} color="var(--primary)" />
            <span style={{ color: 'var(--text-secondary)' }}>{colCount} Columns</span>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        {/* Bar Chart */}
        {chartData.bar && (
          <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>{chartData.bar.datasets[0].label}</h3>
            </div>
            <div style={{ flex: 1 }}>
              <Bar data={chartData.bar} options={commonOptions} />
            </div>
          </div>
        )}

        {/* Line Chart */}
        {chartData.line && (
          <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <TrendingUp size={20} color="var(--accent)" />
              <h3 style={{ margin: 0 }}>Trends Over Time</h3>
            </div>
            <div style={{ flex: 1 }}>
              <Line data={chartData.line} options={commonOptions} />
            </div>
          </div>
        )}

        {/* Pie Chart */}
        {chartData.pie && (
          <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <PieChart size={20} color="var(--primary)" />
              <h3 style={{ margin: 0 }}>{chartData.pie.datasets[0].label}</h3>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '80%' }}>
                <Pie data={chartData.pie} options={pieOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="glass-card" style={{ height: '400px', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Info size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Auto-Chart Intelligence</h3>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '1rem' }}>
              Our engine identifies the most statistically significant columns in your data to generate these views:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><strong>Bar Charts</strong> are created for columns with high category relevance.</li>
              <li><strong>Line Charts</strong> appear automatically when date-formatted columns are detected.</li>
              <li><strong>Pie Charts</strong> represent smaller categorical split for easy distribution viewing.</li>
            </ul>
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
              💡 Hover over data points to see detailed tooltips and exact values.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoCharts;
