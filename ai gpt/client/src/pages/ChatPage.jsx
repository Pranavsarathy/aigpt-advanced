import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';
import { Bot, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// We override the default Message text rendering to use ReactMarkdown inside ChatPage for AI messages
const MarkdownMessage = ({ text, sender }) => (
  <div className={`message-container ${sender}`}>
    <div className="avatar">
      {sender === 'ai' ? <Bot size={20} color="#fff" /> : 'U'}
    </div>
    <div className="message-bubble">
      {sender === 'ai' ? (
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {text}
        </ReactMarkdown>
      ) : (
        <p>{text}</p>
      )}
    </div>
  </div>
);

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Session Management
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now());

  // Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_lexer_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages || []);
        }
      } catch (e) {
        console.error("Error loading sessions", e);
      }
    }
  }, []);

  // Save to LocalStorage on Messages Update
  useEffect(() => {
    if (messages.length === 0) return; // Don't save empty sessions

    setSessions(prev => {
      let updated = [...prev];
      const idx = updated.findIndex(s => s.id === currentSessionId);
      
      const firstUserMsg = messages.find(m => m.sender === 'user');
      const title = firstUserMsg 
        ? firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '') 
        : 'New Chat';

      if (idx >= 0) {
        updated[idx] = { ...updated[idx], messages, title };
      } else {
        updated.unshift({ id: currentSessionId, messages, title });
      }
      localStorage.setItem('ai_lexer_sessions', JSON.stringify(updated));
      return updated;
    });
  }, [messages, currentSessionId]);

  const handleNewSession = () => {
    setCurrentSessionId(Date.now());
    setMessages([]);
    setFileContext(null);
  };

  const handleSelectSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setMessages(session.messages || []);
      setFileContext(null);
    }
  };

  const handleDeleteSession = (id) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('ai_lexer_sessions', JSON.stringify(updated));
      
      if (id === currentSessionId) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          setCurrentSessionId(Date.now());
          setMessages([]);
        }
      }
      return updated;
    });
  };
  
  // Hidden state for Advanced PDF Q&A and Vision
  const [fileContext, setFileContext] = useState(null);

  const handleFileUpload = (extractedText, filename, base64, mimeType) => {
    setFileContext({ text: extractedText, filename, base64, mimeType });
    // Add a system notification to the UI without sending to the backend
    setMessages((prev) => [...prev, {
      id: Date.now(),
      text: `File "${filename}" has been securely uploaded to the AI's memory context. You can now ask questions about it!`,
      sender: 'system' // Custom sender just to notify the user
    }]);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    // Build History array for Context Memory
    // Filter out system messages so we don't confuse the AI
    const history = messages
      .filter(m => m.sender !== 'system')
      .map(m => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

    // The backend now handles injecting fileContext into the current message payload.
    // We just need to send fileContext along with the request.

    try {
      const userId = localStorage.getItem('userId');
      
      // Initialize an empty AI message to stream into
      const aiResponseId = Date.now() + 1;
      setMessages((prev) => [...prev, { id: aiResponseId, text: '', sender: 'ai' }]);
      
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text, 
          history: history, // Send full memory
          fileContext: fileContext, // Send attached file
          userId: userId || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error("Server response was not ok");
      }

      // Clear the attached file after it's been sent
      setFileContext(null);

      // Handle streaming SSE response
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // The server sends `data: {"text":"..."}\n\n`
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              fullText += data.text;
              
              // Update the specific message in state with the new chunk
              setMessages((prev) => 
                prev.map(msg => 
                  msg.id === aiResponseId ? { ...msg, text: fullText } : msg
                )
              );
            } catch (e) {
              console.error("Error parsing stream chunk:", e);
            }
          }
        }
      }

      // --- Voice Output ---
      const plainText = fullText.replace(/[#*`_]/g, ''); 
      const speech = new SpeechSynthesisUtterance(plainText);
      speech.rate = 1.0;
      speech.pitch = 1.0;
      window.speechSynthesis.speak(speech);

    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: "Error connecting to the server. Is the backend running?", 
        sender: 'ai' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
      <div className="chat-page">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Bot size={64} color="#6366f1" />
              <h1>How can I help you today?</h1>
              <p>Ask me anything, upload a document, or share an image. I'm here to assist you with your tasks.</p>
            </div>
          ) : (
            messages.map((msg) => (
              msg.sender === 'system' ? (
                <div key={msg.id} className="system-message">
                  <FileText size={16} style={{marginRight: '8px'}} />
                  {msg.text}
                </div>
              ) : (
                <MarkdownMessage key={msg.id} text={msg.text} sender={msg.sender} />
              )
            ))
          )}
          
          {isTyping && (
            <div className="message-container ai">
              <div className="avatar">
                <Bot size={20} color="#fff" />
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="input-area-wrapper">
          {fileContext && fileContext.base64 && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img 
                  src={`data:${fileContext.mimeType};base64,${fileContext.base64}`} 
                  alt="Preview" 
                />
                <button 
                  className="remove-image-btn" 
                  onClick={() => setFileContext(null)}
                  title="Remove Image"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
