import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Sparkles } from 'lucide-react';
import TypewriterText from './TypewriterText';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';

  return (
    <motion.div
      className={`message-bubble ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-header">
        <div className="avatar">
          {isUser ? (
            <User size={16} />
          ) : (
            <div className="bot-avatar">
              <Sparkles size={16} />
            </div>
          )}
        </div>
        <span className="message-type">
          {isUser ? 'You' : 'DataCruiser AI'}
        </span>
        <span className="timestamp">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      <div className="message-content">
        {isStreaming && isAssistant ? (
          <TypewriterText text={message.content} />
        ) : (
          <div className="message-text">{message.content}</div>
        )}
      </div>
      
      <style>{`
        .message-bubble {
          margin: 16px 0;
          max-width: 80%;
          position: relative;
        }
        
        .message-bubble.user {
          margin-left: auto;
        }
        
        .message-bubble.assistant {
          margin-right: auto;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--secondary-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        
        .bot-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .message-content {
          background: var(--secondary-bg);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 16px;
          position: relative;
          backdrop-filter: blur(10px);
        }
        
        .message-bubble.user .message-content {
          background: var(--gradient-primary);
          color: white;
          border-color: var(--accent-primary);
        }
        
        .message-bubble.assistant .message-content {
          border-left: 3px solid var(--accent-primary);
        }
        
        .message-text {
          color: var(--text-primary);
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }
        
        .message-bubble.user .message-text {
          color: white;
        }
        
        .message-bubble.assistant .message-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: var(--gradient-primary);
          border-radius: 12px;
          z-index: -1;
          opacity: 0.1;
        }
        
        .typewriter-text {
          color: var(--text-primary);
        }
      `}</style>
    </motion.div>
  );
};

export default MessageBubble;
