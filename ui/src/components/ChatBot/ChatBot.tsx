import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Restaurant } from '../../types';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  extractedData?: RouteRequest | null;
}

interface RouteRequest {
  origin?: string;
  destination?: string;
  stops?: number;
  rating?: number;
  maxDetourMinutes?: number;
  needsConfirmation?: boolean;
}

interface ChatBotProps {
  restaurants?: Restaurant[];
  origin?: string;
  destination?: string;
  onRouteRequest?: (data: RouteRequest) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ 
  restaurants = [], 
  origin, 
  destination,
  onRouteRequest 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([{
    text: "Hello! I'm your restaurant assistant. You can ask me questions about restaurants along your route or plan a new route. For example:\n\n- 'Find restaurants between LA and San Diego'\n- 'What are the highest-rated restaurants on my route?'\n- 'Which restaurants have outdoor seating?'",
    isUser: false,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  const conversationId = useRef(uuidv4()); // Generate a unique ID for each conversation

  useEffect(() => {
    const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
    const updatedConversations = savedConversations.map((conv: any) => 
      conv.id === conversationId.current ? { ...conv, messages } : conv
    );
    if (!updatedConversations.some((conv: any) => conv.id === conversationId.current)) {
      updatedConversations.push({ id: conversationId.current, messages });
    }
    localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
  }, [messages]);

  // Existing scroll and effect hooks remain the same
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRestaurantContext = () => {
    if (!restaurants.length) return '';
    
    const restaurantInfo = restaurants.map(restaurant => ({
      name: typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name,
      rating: restaurant.rating,
      priceLevel: restaurant.priceLevel,
      detourMinutes: restaurant.detourMinutes,
      facilities: restaurant.facilities,
      regularOpeningHours: restaurant.regularOpeningHours?.openNow,
      address: typeof restaurant.location.address === 'object' ? 
        restaurant.location.address.text : 
        restaurant.location.address
    }));

    return JSON.stringify(restaurantInfo, null, 2);
  };

  // Update these parts of your ChatBot component:

const generateResponse = async (userInput: string) => {
  try {
    const chat = chatModel.startChat();
    const restaurantContext = getRestaurantContext();
    const hasExistingRoute = origin && destination;
    
    const prompt = `
System: You are a restaurant assistant chatbot that can help with two types of requests:

1. Questions about EXISTING restaurants:
   ${hasExistingRoute ? `- Current route: ${origin} to ${destination}` : ''}
   ${restaurants.length ? `- ${restaurants.length} restaurants found` : ''}
   - Use the restaurant data below to answer questions
   - DO NOT generate [ROUTE_REQUEST] for questions about current restaurants

2. Requests for NEW routes:
   - When user wants to find restaurants between NEW locations
   - Must be DIFFERENT from current route
   - Generate [ROUTE_REQUEST] with new origin and destination
   Example: If user asks "find restaurants from San Francisco to Seattle", generate:
   [ROUTE_REQUEST]{"origin":"San Francisco","destination":"Seattle"}[/ROUTE_REQUEST]

Available Restaurant Data:
${restaurantContext || 'No restaurants available'}

User Query: ${userInput}

Response Rules:
- For questions about current restaurants: Answer using available data
- For new route requests: Generate [ROUTE_REQUEST] with new locations
- Be helpful and informative in all responses

Response:`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response.text();
    
    if (!response) {
      throw new Error('Empty response received');
    }
    
    return response; // Return the full response including the [ROUTE_REQUEST] if present
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
    // Check if we're awaiting confirmation
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.extractedData?.needsConfirmation) {
      handleConfirmation(input, lastMessage.extractedData);
      setIsLoading(false);
      return;
    }

    // Generate new response
    const response = await generateResponse(input);
    
    // Extract route request if present
    const routeRequest = extractRouteRequest(response);

    if (routeRequest) {
      // Handle new route request
      handleRouteRequest(routeRequest);
    } else {
      // Handle regular response
      // Remove any potential [ROUTE_REQUEST] tags from the response
      const cleanResponse = response.replace(/\[ROUTE_REQUEST\].*?\[\/ROUTE_REQUEST\]/s, '').trim();
      setMessages(prev => [...prev, {
        text: cleanResponse || "I understand you're asking about restaurants. What would you like to know?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  } catch (error) {
    console.error('Error in chat:', error);
    setMessages(prev => [...prev, {
      text: "I apologize, but I'm having trouble processing your request. Please try asking your question again.",
      isUser: false,
      timestamp: new Date()
    }]);
  } finally {
    setIsLoading(false);
  }
};

const extractRouteRequest = (response: string): RouteRequest | null => {
  const match = response.match(/\[ROUTE_REQUEST\](.*?)\[\/ROUTE_REQUEST\]/s);
  if (match) {
    try {
      const request = JSON.parse(match[1]);
      // Only validate that both origin and destination are present
      if (request.origin && request.destination) {
        // Return the complete route request object
        return {
          origin: request.origin,
          destination: request.destination,
          stops: request.stops || null,
          rating: request.rating || null,
          maxDetourMinutes: request.maxDetourMinutes || null
        };
      }
    } catch (e) {
      console.error('Failed to parse route request:', e);
    }
  }
  return null;
};

  const handleRouteRequest = (request: RouteRequest) => {
    setMessages(prev => [...prev, {
      text: `I'll help you find restaurants between ${request.origin} and ${request.destination}. Here are the details I found:

- Starting point: ${request.origin}
- Destination: ${request.destination}${request.stops ? `\n- Number of stops: ${request.stops}` : ''}${request.rating ? `\n- Minimum rating: ${request.rating} stars` : ''}${request.maxDetourMinutes ? `\n- Maximum detour: ${request.maxDetourMinutes} minutes` : ''}

Would you like me to search with these preferences? (Please respond with yes or no)`,
      isUser: false,
      timestamp: new Date(),
      extractedData: { ...request, needsConfirmation: true }
    }]);
  };

  const handleConfirmation = (userInput: string, lastRequest: RouteRequest) => {
    const isConfirmed = userInput.toLowerCase().includes('yes');
    
    if (isConfirmed && onRouteRequest) {
      onRouteRequest(lastRequest);
      setMessages(prev => [...prev, {
        text: "Great! I'll search for restaurants along your route now. Once the results are in, you can ask me specific questions about the restaurants I find.",
        isUser: false,
        timestamp: new Date()
      }]);
    } else {
      setMessages(prev => [...prev, {
        text: "No problem! Feel free to tell me your route preferences again or ask about something else.",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  };

  // Rest of the component remains the same (UI rendering code)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Collapsed state UI
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="relative flex flex-col items-center justify-center w-auto h-auto"
      >
        <div className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 ease-in-out p-4">
          <div className="flex flex-col items-center gap-1">
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
            
            {restaurants.length > 0 && (
              <span className="text-sm font-medium">
                {restaurants.length} Found
              </span>
            )}
          </div>
        </div>

        {messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-sm flex items-center justify-center">
            {messages.length - 1}
          </div>
        )}
      </button>
    );
  }

  // Expanded state UI
  return (
    <div className="flex flex-col h-[500px] w-[400px] border rounded-lg bg-white shadow-lg">
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
              <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(message.timestamp)}
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
            placeholder="Ask about restaurants or enter your route..."
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