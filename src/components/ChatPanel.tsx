import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen?: boolean;
  onToggle?: () => void;
  currentData: any[];
  availableTimes: string[];
  layout?: 'overlay' | 'column';
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen = false,
  onToggle,
  currentData: _currentData,
  availableTimes: _availableTimes,
  layout = 'overlay'
}) => {
  const isOverlay = layout === 'overlay';
  const panelIsOpen = isOverlay ? isOpen : true;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "🌬️ Hello! I'm your Sydney Air Quality Data Assistant. I can help you analyze air quality data using natural language queries. Try asking me questions like:\n\n• **What is the PM2.5 level at device 1570?**\n• **Which sensor has the highest NO2 reading?**\n• **Show me air quality trends for OAKDALE station**\n• **Compare PM2.5 levels between different devices**\n\nI can understand specific devices, sensor types, timestamps, and complex queries about the air quality data!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callChatAPI = async (question: string): Promise<string> => {
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.answer) {
        return `💡 ${data.answer}`;
      } else {
        return "❌ I couldn't process your question. Please try rephrasing it or ask something else.";
      }
    } catch (error) {
      console.error('Chat API error:', error);

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return "🔌 **Connection Error:** I can't reach the data service right now. Please make sure the backend server is running on localhost:5080 and restart the development server.";
        }
        if (error.message.includes('HTTP error')) {
          return "⚠️ **Server Error:** The data service encountered an issue. Please try again in a moment.";
        }
      }

      return "❌ **Unexpected Error:** Something went wrong while processing your question. Please try again.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userQuestion = inputValue.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userQuestion,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the API with the user's question
      const apiResponse = await callChatAPI(userQuestion);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: apiResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "❌ **Unexpected Error:** Something went wrong while processing your question. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {isOverlay && (
        <button
          className={`chat-toggle ${panelIsOpen ? 'open' : ''}`}
          onClick={() => onToggle?.()}
          aria-label={panelIsOpen ? 'Close chat' : 'Open chat'}
          disabled={!onToggle}
        >
          {panelIsOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </button>
      )}

      {/* Chat Panel */}
      <div className={`chat-panel ${panelIsOpen ? 'open' : ''} ${isOverlay ? 'overlay' : 'column-layout'}`}>
        <div className="chat-header">
          <div className="chat-title">
            <h3>💬 Data Assistant</h3>
            <span className="status-indicator">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content)
                  }}
                />
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about the footfall data..."
              className="chat-input"
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              className="send-button"
              disabled={!inputValue.trim() || isTyping}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>

          <div className="quick-actions">
            <button
              onClick={() => setInputValue("What is total footfall in 14 Feb 2020 at 11:00 in Park Street?")}
              className="quick-action-btn"
            >
              📍 Park Street Example
            </button>
            <button
              onClick={() => setInputValue("Which location had the highest footfall today?")}
              className="quick-action-btn"
            >
              📊 Highest Footfall
            </button>
            <button
              onClick={() => setInputValue("Show me footfall trends for George Street")}
              className="quick-action-btn"
            >
              📈 Trends
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
