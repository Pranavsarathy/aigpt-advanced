import React, { useState } from 'react';
import { MessageSquarePlus, Trash2, Search, Sparkles, FileText, Image as ImageIcon, Cpu } from 'lucide-react';

const Sidebar = ({ sessions = [], currentSessionId, onSelectSession, onNewSession, onDeleteSession, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    (s.title || 'New Chat').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="OMNIAI Logo" style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
        <div>
          <span style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OMNIAI
          </span>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.4px', fontWeight: '600' }}>
            MULTIMODAL PLATFORM
          </div>
        </div>
      </div>
      
      <button className="new-chat-btn" onClick={onNewSession} style={{ marginTop: '12px' }}>
        <MessageSquarePlus size={18} />
        New Session
      </button>

      {/* Conversation Search Bar */}
      <div style={{ padding: '0 4px', marginTop: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '6px 12px'
        }}>
          <Search size={14} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Sessions History List */}
      <div className="history-list" style={{ marginTop: '12px' }}>
        {filteredSessions.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', padding: '20px 10px' }}>
            {searchTerm ? 'No matching conversations' : 'No previous conversations'}
          </div>
        ) : (
          filteredSessions.map((session) => (
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
          ))
        )}
      </div>

      {/* Quick Status Bar */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          <span>Core Engine Active</span>
        </div>
        <span style={{ fontWeight: '600', color: '#6366f1' }}>v2.4 Pro</span>
      </div>
    </div>
  );
};

export default Sidebar;
