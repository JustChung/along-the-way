import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Restaurant } from '../../types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  restaurants?: Restaurant[];
  origin?: string;
  destination?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ restaurants = [], origin, destination }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    text: "Hello! I'm your restaurant assistant. I can help you find restaurants along your route and answer questions about them. What would you like to know?",
    isUser: false,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatModel = genAI.getGenerativeModel({ model: "gemini-pro" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContext = () => {
    const restaurantInfo = restaurants.map(restaurant => ({
      name: typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name,
      address: typeof restaurant.location.address === 'object' ? restaurant.location.address.text : restaurant.location.address,
      rating: restaurant.rating,
      priceLevel: restaurant.priceLevel
    }));

    return `
      Context: You are a restaurant assistant helping users find restaurants along their route from ${origin || 'their starting point'} to ${destination || 'their destination'}.
      
      Available restaurants along the route:
      ${JSON.stringify(restaurantInfo, null, 2)}

      When answering questions:
      1. Use the actual restaurant data provided above
      2. If asked about restaurants not in the list, mention you can only provide information about restaurants along their specific route
      3. You can provide ratings, price levels, and addresses for the restaurants in the list
      4. Price levels are represented as numbers 1-4 ($ to $$$$)
    `;
  };

  const generateResponse = async (userInput: string) => {
    try {
      const chat = chatModel.startChat();
      const context = generateContext();
      
      const result = await chat.sendMessage(`${context}\n\nUser question: ${userInput}`);
      const response = await result.response.text();
      
      if (!response) {
        throw new Error('Empty response received');
      }
      
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(input);
      
      const aiMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage: Message = {
        text: "I apologize, but I'm having technical difficulties. Please try asking your question again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="relative flex flex-col items-center justify-center w-auto h-auto"
      >
        <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out p-4">
          <div className="flex flex-col items-center gap-1">
            {/* Chat icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            
            {/* Restaurant count */}
            {restaurants.length > 0 && (
              <span className="text-sm font-medium">
                {restaurants.length} Found
              </span>
            )}
          </div>
        </div>

        {/* Message count badge */}
        {messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-sm flex items-center justify-center">
            {messages.length - 1}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col h-[400px] w-[350px] border rounded-lg bg-white shadow-lg">
      <div className="bg-blue-600 p-3 rounded-t-lg flex justify-between items-center">
        <div>
          <h2 className="text-white font-semibold">Restaurant Assistant</h2>
          {restaurants.length > 0 && (
            <p className="text-blue-100 text-sm">
              {restaurants.length} restaurants found along your route
            </p>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white hover:text-blue-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm">{message.text}</div>
              <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(new Date(message.timestamp))}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask about restaurants..."
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;