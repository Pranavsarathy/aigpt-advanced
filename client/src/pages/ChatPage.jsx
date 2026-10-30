import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import Message from '../components/Message';
import PdfViewerModal from '../components/PdfViewerModal';
import ModelSettingsModal from '../components/ModelSettingsModal';
import { Bot, FileText, Volume2, VolumeX, RefreshCw, Sun, Moon, Menu, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Interactive 3D Card for 4K & 3D Generated Images
const Image3DCard = ({ src, alt }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Tick a timer so user sees elapsed seconds while generating
  useEffect(() => {
    if (imgLoaded || imgError) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(t);
  }, [imgLoaded, imgError, startTime]);

  const is3D = /3d|render|octane|unreal|isometric/i.test(alt || '') || src.includes('style=3d') || src.includes('flux-3d');
  const is4K = /4k|8k|uhd|real|photoreal/i.test(alt || '') || src.includes('style=4k') || src.includes('flux-realism');
  const label = is3D ? 'ðŸŒ 3D Octane Render' : is4K ? 'ðŸ“¸ 4K Photorealistic' : 'ðŸŽ¨ Advanced HD';
  const badgeGrad = is3D
    ? 'linear-gradient(135deg,#06b6d4,#3b82f6)'
    : is4K ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
    : 'linear-gradient(135deg,#8b5cf6,#ec4899)';

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 18,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -18,
    });
  };
  const handleMouseLeave = () => { setIsHovered(false); setCoords({ x: 0, y: 0 }); };

  const handleDownload = async () => {
    try {
      const r = await fetch(src);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `omniai_${Date.now()}.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch { window.open(src, '_blank'); }
  };

  return (
    <span style={{ perspective: '1200px', display: 'block', width: '100%', margin: '12px 0' }}
      onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave}>
      <span style={{
        display: 'block', position: 'relative', borderRadius: '16px', overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 45px rgba(0,0,0,0.55), 0 0 40px rgba(99,102,241,0.4)' : '0 8px 28px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.12)',
        transform: `rotateY(${coords.x}deg) rotateX(${coords.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: isHovered ? 'transform 0.1s ease-out,box-shadow 0.2s' : 'transform 0.5s ease-out,box-shadow 0.5s',
        background: 'rgba(10,15,30,0.9)', minHeight: imgLoaded ? 'auto' : '260px',
      }}>
        <span style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10, background: badgeGrad,
          color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px',
          padding: '4px 12px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          textTransform: 'uppercase', display: imgLoaded ? 'inline-block' : 'none'
        }}>{label}</span>

        {!imgLoaded && !imgError && (
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '260px', gap: '18px',
            background: 'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,20,60,0.95))' }}>
            <span style={{ width: 60, height: 60, borderRadius: '50%', display: 'block',
              border: '3px solid rgba(99,102,241,0.15)', borderTop: '3px solid #818cf8',
              borderRight: '3px solid #6366f1', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ textAlign: 'center', lineHeight: 1.6 }}>
              <span style={{ display: 'block', color: '#c7d2fe', fontSize: '0.92rem', fontWeight: 600 }}>
                ⚡ Generating {is3D ? '3D render' : is4K ? '4K photorealistic image' : 'image'}…
              </span>
              <span style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>
                {elapsed}s · AI crafting details
              </span>
            </span>
            <span style={{ width: '60%', height: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(99,102,241,0.1)' }}>
              <span style={{ display: 'block', height: '100%', width: '40%',
                background: 'linear-gradient(90deg,transparent,#6366f1,transparent)',
                animation: 'shimmer 1.4s ease-in-out infinite', borderRadius: 4 }} />
            </span>
          </span>
        )}

        {imgError && (
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '200px', gap: 10, color: '#f87171', fontSize: '0.88rem' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <span>Generation failed — rephrase your prompt and retry</span>
          </span>
        )}

        <img src={src} alt={alt || 'Generated Image'}
          onLoad={() => setImgLoaded(true)} onError={() => setImgError(true)}
          style={{ width: '100%', maxHeight: '560px', objectFit: 'cover', display: imgLoaded ? 'block' : 'none' }} />

        {imgLoaded && (
          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff',
            background: 'linear-gradient(to top,rgba(0,0,0,0.88),transparent)' }}>
            <span style={{ opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%', fontSize: '0.82rem' }}>{alt}</span>
            <button onClick={handleDownload} style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
              padding: '7px 16px', borderRadius: '10px', color: '#fff',
              border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
              ⬇ Download
            </button>
          </span>
        )}
      </span>
    </span>
  );
};

// Enhanced CodeBlock with Copy button and Language Header
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', margin: '14px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#1e1e1e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', background: '#252526', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600' }}>
        <span>{language ? language.toUpperCase() : 'CODE'}</span>
        <button 
          type="button"
          onClick={handleCopy} 
          style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}
        >
          {copied ? 'âœ“ Copied' : 'Copy Code'}
        </button>
      </div>
      <SyntaxHighlighter
        children={code}
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '0.9rem' }}
      />
    </div>
  );
};

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
            p({node, children}) {
              return <div style={{ margin: '6px 0', lineHeight: '1.7' }}>{children}</div>;
            },
            img({node, ...props}) {
              return <Image3DCard src={props.src} alt={props.alt} />;
            },
            a({node, ...props}) {
              if (props.href && props.href.startsWith('data:')) {
                return <a {...props} download="converted_file" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 'bold' }}>{props.children}</a>;
              }
              return <a {...props}>{props.children}</a>;
            },
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <CodeBlock
                  language={match[1]}
                  code={String(children).replace(/\n$/, '')}
                />
              ) : (
                <code className={className} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }} {...props}>
                  {children}
                </code>
              );
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
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [pdfModal, setPdfModal] = useState({ isOpen: false, base64: null, filename: '' });
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('ai_lexer_theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('ai_lexer_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('ai_lexer_theme', 'dark');
    }
  }, [isLightMode]);
  
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

  // Helper: Detect and extract image generation intent from voice or text
  const extractImagePrompt = (inputText) => {
    const clean = inputText.trim();
    if (clean.toLowerCase().startsWith('/imagine ')) {
      return clean.replace(/^\/imagine\s+/i, '').trim();
    }
    if (clean.toLowerCase().startsWith('/image ')) {
      return clean.replace(/^\/image\s+/i, '').trim();
    }
    const patterns = [
      /^(?:please\s+)?(?:generate|create|draw|paint|render|make)\s+(?:an?\s+)?(?:image|picture|photo|illustration|drawing|portrait)\s+(?:of\s+)?(.+)/i,
      /^(?:please\s+)?(?:draw|paint|render)\s+(?:me\s+)?(?:an?\s+)?(.+)/i,
      /^(?:image|picture|photo)\s+(?:of\s+)?(.+)/i,
      /^(?:can\s+you\s+)?(?:generate|create|make)\s+(?:an?\s+)?(?:image|picture|photo)\s+(?:of\s+)?(.+)/i,
    ];
    for (const pattern of patterns) {
      const match = clean.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        return match[1].trim();
      }
    }
    return null;
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Stop any ongoing speech synthesis immediately
    window.speechSynthesis.cancel();

    // 1. Analyze for Image Generation intent (via voice or text command)
    const detectedImagePrompt = extractImagePrompt(text);
    if (detectedImagePrompt) {
      const is3D = /3d|three\s*dimensional|render|octane|isometric|blender|unreal|cinema\s*4d/i.test(detectedImagePrompt);
      const is4K = /4k|8k|ultra\s*hd|photoreal|realistic|hyperreal|dslr|cinematic/i.test(detectedImagePrompt);
      const styleParam = is3D ? '3d' : (is4K ? '4k' : 'default');
      const badgeTitle = is3D ? 'ðŸ§Š 3D Render (Octane / UE5 Engine)' : (is4K ? 'ðŸŒŸ 4K Ultra-HD Photorealistic' : 'ðŸŽ¨ Advanced Image Generation');

      const newUserMsg = { id: Date.now(), text, sender: 'user' };
      const aiLoadingMsgId = Date.now() + 1;
      
      const encodedPrompt = encodeURIComponent(detectedImagePrompt);
      // Cache-bust with unique timestamp so every request hits the server fresh (no stale browser cache)
      const imageUrl = `http://localhost:5000/api/generate-image?prompt=${encodedPrompt}&style=${styleParam}&ts=${Date.now()}`;

      setMessages((prev) => [
        ...prev, 
        newUserMsg, 
        { 
          id: aiLoadingMsgId, 
          text: `**${badgeTitle}**\n> *Prompt:* **${detectedImagePrompt}**\n\n![${detectedImagePrompt}](${imageUrl})\n\n[ðŸ“¥ Download High-Resolution (${is4K ? '4K' : (is3D ? '3D' : 'HD')})](${imageUrl})`, 
          sender: 'ai' 
        }
      ]);

      if (isVoiceEnabled) {
        const typeSpeech = is3D ? '3D render' : (is4K ? '4K ultra realistic image' : 'image');
        const speech = new SpeechSynthesisUtterance(`Here is your ${typeSpeech} of ${detectedImagePrompt}`);
        speech.rate = 1.1;
        window.speechSynthesis.speak(speech);
      }
      return;
    }

    // 2. Intelligent PDF Creation Studio (/create-pdf or "create a pdf ...")
    if (text.startsWith('/create-pdf') || text.toLowerCase().startsWith('create a pdf') || text.toLowerCase().startsWith('generate a pdf')) {
      const docIdea = text.replace(/^\/create-pdf\s*/i, '').replace(/^(?:create|generate)\s+a\s+pdf\s+(?:for\s+)?/i, '').trim() || 'Executive Summary';
      const newUserMsg = { id: Date.now(), text, sender: 'user' };
      const aiLoadingMsgId = Date.now() + 1;

      setMessages(prev => [...prev, newUserMsg, { id: aiLoadingMsgId, text: `ðŸ“„ Designing and compiling your styled PDF: "${docIdea}"...`, sender: 'ai' }]);
      setIsTyping(true);

      try {
        const payload = { prompt: docIdea };

        const response = await fetch('http://localhost:5000/api/create-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success && data.base64) {
          setPdfModal({ isOpen: true, base64: data.base64, filename: data.filename });
          setMessages(prev => prev.map(msg => msg.id === aiLoadingMsgId ? {
            ...msg,
            text: `âœ… **PDF Generation Complete!**\n\nYour styled document **${data.filename}** is ready.\n\n[ðŸ“¥ Download ${data.filename}](data:application/pdf;base64,${data.base64})\n\n*(Preview modal has been opened)*`,
            sender: 'ai'
          } : msg));
        } else {
          throw new Error(data.error || 'Failed to generate PDF');
        }
      } catch (err) {
        setMessages(prev => prev.map(msg => msg.id === aiLoadingMsgId ? {
          ...msg,
          text: `âŒ PDF generation error: ${err.message}`,
          sender: 'ai'
        } : msg));
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (text.startsWith('/convert to ')) {
      const targetFormat = text.replace('/convert to ', '').trim().toLowerCase();
      if (!targetFormat) return;

      if (!fileContext) {
        setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }, { id: Date.now()+1, text: "Error: Please upload a file to convert.", sender: 'ai' }]);
        return;
      }

      const newUserMsg = { id: Date.now(), text, sender: 'user' };
      const aiLoadingMsgId = Date.now() + 1;
      
      setMessages((prev) => [...prev, newUserMsg, { id: aiLoadingMsgId, text: `Converting ${fileContext.filename} to ${targetFormat.toUpperCase()}...`, sender: 'system' }]);
      setIsTyping(true);

      try {
        const response = await fetch('http://localhost:5000/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileBase64: fileContext.base64, 
            mimeType: fileContext.mimeType,
            format: targetFormat 
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // If it's a PDF, we provide a download link. If it's an image, we can just show it.
          let resultText = `âœ… **Conversion Successful!**\n\n`;
          if (targetFormat === 'pdf' || targetFormat === 'pptx') {
            resultText += `[Download your ${targetFormat.toUpperCase()} here](${data.base64})`;
          } else {
            resultText += `![Converted Image](${data.base64})`;
          }
          
          setMessages((prev) => prev.map(msg => msg.id === aiLoadingMsgId ? { ...msg, text: resultText, sender: 'ai' } : msg));
        } else {
          setMessages((prev) => prev.map(msg => msg.id === aiLoadingMsgId ? { ...msg, text: `Error converting file: ${data.error}`, sender: 'system' } : msg));
        }
      } catch (err) {
        setMessages((prev) => prev.map(msg => msg.id === aiLoadingMsgId ? { ...msg, text: 'Error connecting to conversion server.', sender: 'system' } : msg));
      } finally {
        setIsTyping(false);
      }
      return;
    }

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
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "API Daily Limit Reached");
        }
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
      if (isVoiceEnabled && fullText.trim()) {
        window.speechSynthesis.cancel();
        const plainText = fullText
          .replace(/```[\s\S]*?```/g, 'Here is the code block.')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/[#*_~>]/g, '')
          .trim();
        if (plainText) {
          const speech = new SpeechSynthesisUtterance(plainText);
          speech.rate = 1.05;
          speech.pitch = 1.0;
          window.speechSynthesis.speak(speech);
        }
      }

    } catch (error) {
      console.error("Error communicating with backend:", error);
      let errorText = "Error connecting to the server. Is the backend running?";
      if (error.message.includes("API Daily Limit Reached") || error.message.includes("quota")) {
        errorText = "ðŸš« **API Daily Limit Reached.** The AI has exhausted its free daily quota. Please try again tomorrow, or use the `/convert` command for local file conversions.";
      }
      setMessages((prev) => [...prev, { 
        id: Date.now() + 1, 
        text: errorText, 
        sender: 'ai' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="aurora-bg">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
      </div>

      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
      />
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="chat-page">
        <div className="chat-header-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', background: 'transparent', zIndex: 10 }}>
          <button 
            className="icon-btn mobile-menu-btn" 
            onClick={() => setIsSidebarOpen(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', marginRight: 'auto' }}
          >
            <Menu size={20} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setIsModelModalOpen(true)}
            title="Configure AI Models & Providers"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 12px', borderRadius: '8px', color: '#38bdf8', cursor: 'pointer' }}
          >
            <Cpu size={18} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Models</span>
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setIsLightMode(!isLightMode)}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setMessages([])}
            title="Refresh / Clear Chat"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
          >
            <RefreshCw size={18} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Refresh</span>
          </button>
          <button 
            className="icon-btn" 
            onClick={() => {
              const newState = !isVoiceEnabled;
              setIsVoiceEnabled(newState);
              if (!newState) {
                window.speechSynthesis.cancel();
              }
            }}
            title={isVoiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
          >
            {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{isVoiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Bot size={64} color="#6366f1" />
              <h1>Welcome to OMNIAI Platform</h1>
              <p>Next-generation multimodal intelligence for conversational AI, RAG documents, and 4K photorealistic art.</p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                width: '100%',
                maxWidth: '720px',
                marginTop: '24px',
                textAlign: 'left'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#38bdf8', fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>ðŸŒŸ 4K & 3D Studio</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Type or speak <code>generate a 4k image of...</code> or <code>generate a 3d render of...</code> with interactive parallax tilt.</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#818cf8', fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>ðŸ“„ Universal PDF Engine</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Click <strong>Create PDF</strong> or type <code>/create-pdf invoice for consulting</code> to preview and download styled PDFs.</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>ðŸ§  Hybrid RAG Pipeline</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Upload any PDF or document to chat with it. Answers are grounded in actual pages with <code>[filename p.N]</code> citations.</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '0.88rem', marginBottom: '4px' }}>âš¡ Code & Multimodal</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Instant sub-second streaming, syntax-highlighted code with 1-click copy, and voice recognition.</div>
                </div>
              </div>
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
                  Ã—
                </button>
              </div>
            </div>
          )}
          <ChatInput onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
        </div>
      </div>

      {/* Universal PDF Previewer Modal */}
      <PdfViewerModal
        base64Data={pdfModal.base64}
        filename={pdfModal.filename}
        onClose={() => setPdfModal({ isOpen: false, base64: null, filename: '' })}
      />

      {/* OMNIAI Model Registry & Providers Modal */}
      <ModelSettingsModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />
    </>
  );
};

export default ChatPage;
