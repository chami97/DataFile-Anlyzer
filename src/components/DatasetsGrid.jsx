import React, { useState } from 'react';
import { Database, Calendar, FileText, Trash2, ArrowRight, Plus, AlertCircle } from 'lucide-react';

const DatasetsGrid = ({ datasets, onSelect, onDelete }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };
  return (
    <div className="animate-fade">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3rem' 
      }}>
        <div>
          <h1 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>
            Your Datasets
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Manage and view analysis for your previously uploaded data.
          </p>
        </div>
        <button 
          onClick={() => onSelect({ id: 'new' })} // This will be handled in App.jsx
          className="btn"
          style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--accent)', 
            border: '1px solid rgba(16, 185, 129, 0.2)' 
          }}
        >
          <Plus size={18} /> Add New
        </button>
      </header>

      {datasets.length === 0 ? (
        <div className="glass-card" style={{ 
          padding: '4rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1.5rem',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '50%', 
            color: 'var(--primary)' 
          }}>
            <Database size={48} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No datasets found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Upload a CSV or Excel file in the Dashboard to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {datasets.map((dataset) => (
            <div key={dataset.id} className="glass-card dataset-card" style={{
              padding: '1.5rem',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem', 
                  color: 'var(--primary)' 
                }}>
                  <FileText size={24} />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(dataset.id);
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'rgba(239, 68, 68, 0.6)', 
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(239, 68, 68, 0.6)'}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dataset.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  <span>Uploaded on {dataset.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {dataset.rowCount} Rows
                  </div>
                  <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {dataset.colCount} Columns
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onSelect(dataset)}
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              >
                View Analysis <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="modal-content animate-fade" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                padding: '1rem', 
                borderRadius: '50%', 
                color: 'var(--danger)' 
              }}>
                <AlertCircle size={32} />
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Confirm Deletion</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Are you sure you want to delete this dataset? This action cannot be undone.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    color: 'white',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    background: 'var(--danger)', 
                    color: 'white' 
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetsGrid;
