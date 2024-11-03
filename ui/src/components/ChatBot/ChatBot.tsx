// src/components/ChatBot/ChatBot.tsx
import React, { useState } from 'react';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    // Add message handling logic here
    setMessages([...messages, { text: input, isUser: true }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[400px] border rounded">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded ${
              message.isUser ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ask about restaurants..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
      </div>
    </div>
  );
};

export default ChatBot;
