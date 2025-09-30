import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeonInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const NeonInput: React.FC<NeonInputProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading = false,
  placeholder = "Ask me to analyze your data..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  return (
    <div className="neon-input-container">
      <motion.form
        onSubmit={handleSubmit}
        className={`neon-input-form ${isFocused ? 'focused' : ''} ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="input-wrapper">
          <div className="input-icon">
            <Sparkles size={20} />
          </div>
          
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="neon-textarea"
            rows={1}
            disabled={isLoading}
          />
          
          <div className="input-actions">
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="upload-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Upload CSV file"
            >
              <Upload size={18} />
            </motion.button>
            
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="loading-spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Send size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {dragOver && (
          <motion.div
            className="drag-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Upload size={48} />
            <p>Drop your CSV file here</p>
          </motion.div>
        )}
      </motion.form>
      
      <style>{`
        .neon-input-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .neon-input-form {
          position: relative;
          background: linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(26, 26, 36, 0.9) 100%);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .neon-input-form.focused {
          border-color: var(--accent-primary);
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }
        
        .neon-input-form.drag-over {
          border-color: var(--accent-tertiary);
          box-shadow: 0 0 30px rgba(6, 255, 165, 0.3);
        }
        
        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }
        
        .input-icon {
          color: var(--accent-primary);
          margin-bottom: 4px;
        }
        
        .neon-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.5;
          resize: none;
          outline: none;
          min-height: 24px;
          max-height: 120px;
        }
        
        .neon-textarea::placeholder {
          color: var(--text-muted);
        }
        
        .input-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .upload-btn,
        .send-btn {
          background: var(--gradient-primary);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .upload-btn {
          background: var(--gradient-secondary);
        }
        
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .send-btn:not(:disabled):hover,
        .upload-btn:hover {
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
        }
        
        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .drag-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 212, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: var(--accent-primary);
          font-weight: 500;
        }
        
        .drag-overlay p {
          margin-top: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default NeonInput;
