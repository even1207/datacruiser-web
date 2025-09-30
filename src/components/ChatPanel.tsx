import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatPanelProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Conversation</h2>
        <div className="status-indicator">
          <div className={`status-dot ${isLoading ? 'loading' : 'active'}`} />
          <span>{isLoading ? 'AI is thinking...' : 'AI is ready'}</span>
        </div>
      </div>
      
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={message.isStreaming}
            />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            className="typing-indicator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="typing-dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <span>AI is analyzing your data...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <style>{`
        .chat-panel {
          background: linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(26, 26, 36, 0.9) 100%);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chat-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-header h2 {
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-tertiary);
        }
        
        .status-dot.loading {
          background: var(--accent-primary);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .messages-container {
          flex: 1;
          padding: 16px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--secondary-bg);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          margin: 16px 0;
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        .typing-dots {
          display: flex;
          gap: 4px;
        }
        
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-primary);
          animation: typing 1.4s ease-in-out infinite;
        }
        
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
