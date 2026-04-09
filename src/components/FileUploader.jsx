import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2, Link as LinkIcon, Globe } from 'lucide-react';
import * as XLSX from 'xlsx';

const FileUploader = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState('');

  const processFile = async (file, sheetName = null) => {
    setLoading(true);
    try {
      await onFileUpload(file, sheetName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error processing file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files) => {
    if (files && files[0]) {
      const file = files[0];
      const validExtensions = ['csv', 'xlsx', 'xls'];
      const extension = file.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(extension)) {
        setError('Please upload a valid CSV or Excel file.');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('File is too large. Max size is 50MB.');
        return;
      }

      setError(null);
      if (['xlsx', 'xls'].includes(extension)) {
        setLoading(true);
        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              setSheetNames(workbook.SheetNames);
              setPendingFile(file);
              setSelectedSheet(workbook.SheetNames[0]);
              setShowSheetModal(true);
              setLoading(false);
            } catch (err) {
              setError('Failed to extract sheets: ' + err.message);
              setLoading(false);
            }
          };
          reader.onerror = () => {
            setError('Failed to read Excel file.');
            setLoading(false);
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          setError('Error reading file: ' + err.message);
          setLoading(false);
        }
      } else {
        processFile(file);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleUrlImport = async (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8001/fetch-external-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkUrl })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Fetch failed');
      
      // Convert B64 to File
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.content_type });
      const file = new File([blob], result.filename, { type: result.content_type });
      
      const extension = file.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls'].includes(extension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            setSheetNames(workbook.SheetNames);
            setPendingFile(file);
            setSelectedSheet(workbook.SheetNames[0]);
            setShowSheetModal(true);
            setLoading(false);
          } catch (err) {
            setError('Failed to extract sheets from URL: ' + err.message);
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to read Excel file from URL.');
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        await processFile(file);
      }
      setLinkUrl('');
    } catch (err) {
      setError('Fetch error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {showSheetModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card animate-scale-up" style={{
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: 'var(--card-bg)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Select Sheet</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              This Excel file contains multiple sheets. Select the one you want to analyze.
            </p>
            
            <select 
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--card-border)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                color: 'white',
                outline: 'none',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              {sheetNames.map(name => (
                <option key={name} value={name} style={{ background: '#1e293b' }}>
                  {name}
                </option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => {
                  setShowSheetModal(false);
                  setPendingFile(null);
                }}
                className="btn"
                style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)' }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowSheetModal(false);
                  processFile(pendingFile, selectedSheet);
                  setPendingFile(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`glass-card ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed var(--primary)' : '2px dashed rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(30, 41, 59, 0.4)',
          borderRadius: '1.5rem',
        }}
      >
        <input
          type="file"
          id="file-upload"
          hidden
          accept=".csv,.xlsx,.xls"
          onChange={(e) => { handleFileChange(e); e.target.value = ''; }}
        />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%' }}>
          <div style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>
            {loading ? (
              <Loader2 className="animate-spin" size={64} />
            ) : success ? (
              <CheckCircle size={64} style={{ color: 'var(--accent)' }} />
            ) : (
              <UploadCloud size={64} style={{ opacity: dragActive ? 1 : 0.6 }} />
            )}
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', letterSpacing: '-0.2px' }}>
            {loading ? 'Analyzing your data...' : success ? 'Successfully Uploaded!' : 'Upload your dataset'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
            Drag and drop your CSV or Excel file here, or click to browse. Max size 50MB.
          </p>

          <div style={{
            marginTop: '2rem',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileType size={16} /> CSV
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileType size={16} /> Excel
            </span>
          </div>
        </label>

        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.75rem',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        {!showUrlInput ? (
          <button 
            onClick={() => setShowUrlInput(true)}
            className="btn"
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LinkIcon size={16} /> Import from OneDrive / URL
          </button>
        ) : (
          <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Globe size={18} color="var(--primary)" />
              <h4 style={{ margin: 0 }}>Onedrive / Cloud Excel Link</h4>
            </div>
            <form onSubmit={handleUrlImport} style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="url" 
                placeholder="Paste OneDrive or direct Excel link here..." 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                disabled={loading || !linkUrl}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem' }}
              >
                {loading ? 'Fetching...' : 'Import'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowUrlInput(false)}
                className="btn"
                style={{ background: 'transparent', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
              💡 Supported: OneDrive, SharePoint, and Direct CSV/Excel links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
