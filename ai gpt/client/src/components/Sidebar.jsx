import React from 'react';
import { MessageSquarePlus, Trash2 } from 'lucide-react';

const Sidebar = ({ sessions = [], currentSessionId, onSelectSession, onNewSession, onDeleteSession }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="AI LEXER Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <span>AI LEXER</span>
      </div>
      
      <button className="new-chat-btn" onClick={onNewSession}>
        <MessageSquarePlus size={18} />
        New Chat
      </button>

      <div className="history-list">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
          >
            <span 
              className="history-title"
              onClick={() => onSelectSession(session.id)}
            >
              {session.title || 'New Chat'}
            </span>
            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete Chat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
