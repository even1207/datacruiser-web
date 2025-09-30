import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart3, MessageSquare, Trash2, Maximize2 } from 'lucide-react';
import ParticleBackground from './components/ParticleBackground';
import NeonInput from './components/NeonInput';
import ChatPanel from './components/ChatPanel';
import VisualizationCanvas from './components/VisualizationCanvas';
import { useChat } from './hooks/useChat';

function App() {
  const {
    messages,
    isLoading,
    uploadedFiles,
    currentVisualizations,
    handleSendMessage,
    handleFileUpload,
    clearChat
  } = useChat();

  const [layout, setLayout] = useState<'split' | 'chat' | 'visualization'>('split');

  const toggleLayout = (newLayout: 'split' | 'chat' | 'visualization') => {
    setLayout(newLayout);
  };

  return (
    <div className="app">
      <ParticleBackground particleCount={30} />
      
      {/* Header */}
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Sparkles size={24} />
            </div>
            <h1>DataCruiser AI</h1>
          </div>
          
          <div className="header-actions">
            <div className="layout-controls">
              <button
                className={`layout-btn ${layout === 'split' ? 'active' : ''}`}
                onClick={() => toggleLayout('split')}
                title="Split View"
              >
                <Maximize2 size={16} />
              </button>
              <button
                className={`layout-btn ${layout === 'chat' ? 'active' : ''}`}
                onClick={() => toggleLayout('chat')}
                title="Chat Only"
              >
                <MessageSquare size={16} />
              </button>
              <button
                className={`layout-btn ${layout === 'visualization' ? 'active' : ''}`}
                onClick={() => toggleLayout('visualization')}
                title="Visualization Only"
              >
                <BarChart3 size={16} />
              </button>
            </div>
            
            {messages.length > 0 && (
              <button
                className="clear-btn"
                onClick={clearChat}
                title="Clear Conversation"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="app-main">
        <div className={`main-grid ${layout}`}>
          {/* Chat Panel */}
          <AnimatePresence>
            {(layout === 'split' || layout === 'chat') && (
              <motion.div
                className="chat-section"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatPanel messages={messages} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visualization Canvas */}
          <AnimatePresence>
            {(layout === 'split' || layout === 'visualization') && (
              <motion.div
                className="visualization-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <VisualizationCanvas 
                  visualizations={currentVisualizations} 
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <motion.footer
        className="app-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="footer-content">
          <NeonInput
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            placeholder={uploadedFiles.length > 0 
              ? `Ask me to analyze your ${uploadedFiles.length} uploaded dataset${uploadedFiles.length > 1 ? 's' : ''}...`
              : "Upload a CSV file or ask me anything about data analysis..."
            }
          />
          
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <span>Uploaded files: </span>
              {uploadedFiles.map((file, index) => (
                <span key={file.id} className="file-tag">
                  {file.name}
                  {index < uploadedFiles.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.footer>

      <style>{`
        .app {
          width: 100vw;
          height: 100vh;
          background: var(--primary-bg);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(17, 17, 24, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-primary);
          padding: 0 24px;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          background: var(--gradient-primary);
          border-radius: 8px;
          padding: 8px;
          color: white;
        }
        
        .logo h1 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .layout-controls {
          display: flex;
          gap: 4px;
          background: var(--secondary-bg);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid var(--border-primary);
        }
        
        .layout-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .layout-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .layout-btn.active {
          background: var(--gradient-primary);
          color: white;
        }
        
        .clear-btn {
          background: transparent;
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .clear-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        
        .app-main {
          flex: 1;
          margin-top: 64px;
          margin-bottom: 120px;
          padding: 24px;
          overflow: hidden;
        }
        
        .main-grid {
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        
        .main-grid.split {
          grid-template-columns: 1fr 1fr;
        }
        
        .main-grid.chat {
          grid-template-columns: 1fr;
        }
        
        .main-grid.visualization {
          grid-template-columns: 1fr;
        }
        
        .chat-section,
        .visualization-section {
          height: 100%;
          min-height: 0;
        }
        
        .app-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(17, 17, 24, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-primary);
          padding: 24px;
        }
        
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .uploaded-files {
          margin-top: 12px;
          font-size: 14px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .file-tag {
          color: var(--accent-primary);
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .main-grid.split {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;
          }
          
          .header-content {
            padding: 0 16px;
          }
          
          .app-main {
            padding: 16px;
          }
          
          .app-footer {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
