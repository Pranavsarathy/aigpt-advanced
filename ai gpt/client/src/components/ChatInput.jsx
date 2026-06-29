import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Paperclip } from 'lucide-react';

const ChatInput = ({ onSendMessage, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      
      // Automatically send the message after a brief delay so the user sees what was transcribed
      setTimeout(() => {
        onSendMessage(transcript);
        setMessage('');
      }, 500);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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
          // Tell the parent component to store the context
          if (onFileUpload) {
             onFileUpload(data.extractedText, file.name, data.base64, data.mimeType);
          }
          setMessage(''); // clear the "Uploading..." message
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

  return (
    <div className="input-container">
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
          placeholder="Message AI LEXER..."
          rows="1"
        />

        {message.trim() ? (
          <button className="action-btn send-btn" onClick={handleSend} title="Send Message">
            <Send size={18} />
          </button>
        ) : (
          <button 
            className={`action-btn ${isListening ? 'listening-btn' : ''}`} 
            onClick={handleVoiceInput} 
            title="Use Voice"
          >
            <Mic size={20} color={isListening ? '#ef4444' : undefined} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
