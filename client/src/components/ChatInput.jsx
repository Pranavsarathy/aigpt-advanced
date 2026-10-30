import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Paperclip, Square } from 'lucide-react';

const ChatInput = ({ onSendMessage, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      // User tapped mic to stop and send
      stopVoiceRecognition();
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage('');
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    let fullSpeech = '';

    recognition.onresult = (event) => {
      let interim = '';
      let currentFinal = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      fullSpeech = currentFinal.trim() || interim.trim();
      setMessage(fullSpeech);

      // Reset silence timer on every new speech fragment
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        // Auto-finalize and send after 2 seconds of silence
        if (fullSpeech.trim()) {
          stopVoiceRecognition();
          onSendMessage(fullSpeech.trim());
          setMessage('');
        }
      }, 2000);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const uploadMsg = `Uploading ${file.name}...`;
        setMessage(uploadMsg);

        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          if (onFileUpload) {
             onFileUpload(data.extractedText, file.name, data.base64, data.mimeType);
          }
          setMessage('');
        } else {
          alert(`Upload failed: ${data.error}`);
          setMessage('');
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to connect to the server for upload.");
        setMessage('');
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="input-container">
      {/* Quick AI 4K & 3D Style Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => {
            setMessage('generate a 4k ultra-realistic photo of ');
            textareaRef.current?.focus();
          }}
          style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '20px',
            color: '#fbbf24',
            padding: '4px 12px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Create a 4K Ultra-Real Photo"
        >
          <span>🌟</span> 4K Ultra-Real
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage('generate a 3d render of ');
            textareaRef.current?.focus();
          }}
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '20px',
            color: '#22d3ee',
            padding: '4px 12px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Create an Octane/Blender 3D Render"
        >
          <span>🧊</span> 3D Render
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage('generate a digital concept art of ');
            textareaRef.current?.focus();
          }}
          style={{
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '20px',
            color: '#c084fc',
            padding: '4px 12px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Create Digital Art"
        >
          <span>🎨</span> Digital Art
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage('/create-pdf Commercial Invoice for technical consulting, 3 items');
            textareaRef.current?.focus();
          }}
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '20px',
            color: '#818cf8',
            padding: '4px 12px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Generate styled PDF document"
        >
          <span>📄</span> Create PDF
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage('Write a complete, optimized program in ');
            textareaRef.current?.focus();
          }}
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '20px',
            color: '#34d399',
            padding: '4px 12px',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Generate optimized code"
        >
          <span>⚡</span> Code
        </button>
      </div>

      {isListening && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '20px',
          color: '#f87171',
          fontSize: '0.82rem',
          margin: '0 auto 8px auto',
          width: 'fit-content',
          animation: 'pulse 1.5s infinite'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
          <span>🎙️ Analyzing Voice... (Say your question or "generate an image of...")</span>
        </div>
      )}

      <div className={`input-box ${isListening ? 'listening' : ''}`}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileUpload} 
        />
        <input 
          type="file" 
          ref={imageInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileUpload} 
        />

        <button className="action-btn" title="Upload Document" onClick={() => fileInputRef.current.click()}>
          <Paperclip size={20} />
        </button>
        <button className="action-btn" title="Upload Image" onClick={() => imageInputRef.current.click()}>
          <ImageIcon size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening to your voice..." : "Message AI LEXER (or speak / type 'generate an image of...')..."}
          rows="1"
        />

        {message.trim() && !isListening ? (
          <button className="action-btn send-btn" onClick={handleSend} title="Send Message">
            <Send size={18} />
          </button>
        ) : (
          <button 
            className={`action-btn ${isListening ? 'listening-btn' : ''}`} 
            onClick={handleVoiceInput} 
            title={isListening ? "Stop & Send Voice" : "Speak Voice Command"}
            style={isListening ? { background: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444' } : {}}
          >
            {isListening ? <Square size={16} color="#ef4444" fill="#ef4444" /> : <Mic size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
