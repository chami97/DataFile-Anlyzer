import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DatasetsGrid from './components/DatasetsGrid';
import FileUploader from './components/FileUploader';
import DataSummary from './components/DataSummary';
import DataPreview from './components/DataPreview';
import Insights from './components/Insights';
import AutoCharts from './components/AutoCharts';
import MLDashboard from './components/MLDashboard';
import ChatInterface from './components/ChatInterface';
import AssistantHistory from './components/AssistantHistory';
import { 
  saveDataset, 
  getAllDatasets, 
  deleteDataset, 
  clearLocalStorageQuota,
  saveChatMessage,
  getChatHistory,
  clearChatHistory
} from './utils/storage';
import { parseFile, getSummary, getSmartInsights, getChartData } from './utils/dataProcessor';
import { exportToPDF } from './utils/pdfGenerator';
import { Sparkles, Trash2, Download, Share2, Loader2, MessageSquare, Send, Plus, BarChart3, Brain } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fileName, setFileName] = useState('');
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentDatasetId, setCurrentDatasetId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    // Clear old problematic localStorage and load from IndexedDB
    clearLocalStorageQuota();
    
    const loadDatasets = async () => {
      try {
        const [dsResult, chResult] = await Promise.all([
          getAllDatasets(),
          getChatHistory()
        ]);
        setDatasets(dsResult);
        setChatHistory(chResult);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    loadDatasets();
  }, []);

  const handleFileUpload = async (file, sheetName) => {
    try {
      const parsedData = await parseFile(file, sheetName);
      const dataSummary = getSummary(parsedData);
      const smartInsights = getSmartInsights(parsedData);
      const autoChartData = getChartData(parsedData);
      
      const finalFileName = sheetName ? `${file.name} - ${sheetName}` : file.name;

      const newDataset = {
        id: Date.now().toString(),
        name: finalFileName,
        date: new Date().toLocaleDateString(),
        rowCount: dataSummary.rowCount,
        colCount: dataSummary.colCount,
        data: parsedData,
        summary: dataSummary,
        insights: smartInsights,
        chartData: autoChartData
      };

      await saveDataset(newDataset);
      setDatasets(prev => [...prev, newDataset]);

      setData(parsedData);
      setSummary(dataSummary);
      setInsights(smartInsights);
      setChartData(autoChartData);
      setFileName(finalFileName);
      setCurrentDatasetId(newDataset.id);
      setChatMessages([]); // Fresh chat session for new file
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    }
  };

  const handleSelectDataset = (dataset) => {
    if (dataset.id === 'new') {
      handleReset();
      setCurrentDatasetId(null);
      setChatMessages([]);
    } else {
      setData(dataset.data);
      setSummary(dataset.summary);
      setFileName(dataset.name);
      setCurrentDatasetId(dataset.id);
      
      // Load this dataset's specific chat history
      const savedMessages = chatHistory
        .filter(msg => msg.datasetId === dataset.id)
        .map(msg => ([
          { role: 'user', content: msg.query },
          { role: 'assistant', content: msg.response }
        ]))
        .flat();
      
      setChatMessages(savedMessages);
      setInsights(getSmartInsights(dataset.data));
      setChartData(getChartData(dataset.data));
    }
    setCurrentView('dashboard');
  };

  const handleDeleteDataset = async (id) => {
    try {
      await deleteDataset(id);
      setDatasets(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Failed to delete dataset:", error);
    }
  };

  const handleReset = () => {
    setData(null);
    setSummary(null);
    setFileName('');
    setInsights(null);
    setChartData(null);
    setChatQuery('');
    setChatResponse('');
  };

  const handlePDFExport = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await exportToPDF('report-content', 'DataAI_Analysis_Report.pdf');
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAIChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatQuery.trim() || !summary) return;

    setIsChatting(true);
    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatQuery, summary: summary })
      });
      const result = await response.json();
      setChatResponse(result.response);
    } catch (error) {
      setChatResponse("Sorry, I couldn't connect to the analysis engine.");
    } finally {
      setIsChatting(false);
    }
  };

  const handleSendMessage = async (content) => {
    const newUserMessage = { role: 'user', content };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatting(true);

    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content, summary: summary || {} })
      });
      const result = await response.json();
      
      const assistantMessage = { role: 'assistant', content: result.response };
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Persist to Global History with Dataset Reference
      const interaction = {
        query: content,
        response: result.response,
        datasetName: fileName || 'General',
        datasetId: currentDatasetId
      };
      await saveChatMessage(interaction);
      setChatHistory(prev => [...prev, { ...interaction, id: Date.now() }]);
      
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my analysis brain." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire chat history?")) {
      await clearChatHistory();
      setChatHistory([]);
      setChatMessages([]);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
      />
      
      <main style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
        {currentView === 'dashboard' ? (
          <>
            <header style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '3rem' 
            }}>
              <div>
                <h1 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>
                  Welcome back, Data Analyst
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {data ? 'Your automated dataset report is ready for export.' : 'Upload your data to get started with AI-driven insights.'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                {data && (
                  <>
                    <button 
                      onClick={handleReset} 
                      className="btn" 
                      disabled={isExporting}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', opacity: isExporting ? 0.5 : 1 }}
                    >
                      <Trash2 size={18} /> Clear Data
                    </button>
                    <button 
                      onClick={handleReset} 
                      className="btn" 
                      disabled={isExporting}
                      style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', opacity: isExporting ? 0.5 : 1 }}
                    >
                      <Plus size={18} /> New Analysis
                    </button>
                    <button 
                      onClick={handlePDFExport}
                      className="btn" 
                      disabled={isExporting}
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid var(--card-border)', opacity: isExporting ? 0.5 : 1 }}
                    >
                      {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                    <button 
                      onClick={() => setCurrentView('insights')}
                      className="btn btn-primary"
                    >
                      <Sparkles size={18} /> View Insights
                    </button>
                    <button 
                      onClick={() => setCurrentView('charts')}
                      className="btn"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', border: '1px solid var(--card-border)' }}
                    >
                      <BarChart3 size={18} /> View Charts
                    </button>
                  </>
                )}
                <button className="btn btn-primary">
                  <Share2 size={18} /> Share Report
                </button>
              </div>
            </header>

            {!data ? (
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <FileUploader onFileUpload={handleFileUpload} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--accent)' }}>
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>Automated Summaries</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Instantly view row counts, missing values, and data type distributions across your sheets.
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)' }}>
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>AI Chat Interaction</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Ask questions about your data in plain English and get visual answers and formulas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade" id="report-content">
                <div style={{ padding: '20px', margin: '-20px' }}> {/* Extra padding for the export capture */}
                  <DataSummary summary={summary} />
                  
                <div style={{ marginTop: '2.5rem' }}>
                  <DataPreview data={data} columns={summary.columns} />
                </div>
                </div>
              </div>
            )}
          </>
        ) : currentView === 'insights' ? (
          <Insights data={data} insights={insights} />
        ) : currentView === 'charts' ? (
          <AutoCharts 
            chartData={chartData} 
            fileName={fileName} 
            rowCount={summary?.rowCount} 
            colCount={summary?.colCount} 
          />
        ) : currentView === 'ml' ? (
          <MLDashboard 
            datasetSummary={summary}
            onDataProcessed={(raw, processed, name) => {
              // ML logs processing
            }} 
          />
        ) : currentView === 'assistant' ? (
          <AssistantHistory history={chatHistory} onClear={handleClearHistory} />
        ) : (
          <DatasetsGrid 
            datasets={datasets} 
            onSelect={handleSelectDataset} 
            onDelete={handleDeleteDataset} 
          />
        )}
      </main>

      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isTyping={isChatting}
        fileName={fileName}
      />
    </div>
  );
}

export default App;
