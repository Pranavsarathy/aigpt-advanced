import React from 'react';
import { User, Bot } from 'lucide-react';

const Message = ({ text, sender }) => {
  const isUser = sender === 'user';

  return (
    <div className={`message-container ${isUser ? 'user' : 'ai'}`}>
      <div className="avatar">
        {isUser ? <User size={20} color="#fff" /> : <Bot size={20} color="#fff" />}
      </div>
      <div className="message-bubble">
        {text}
      </div>
    </div>
  );
};

export default Message;
