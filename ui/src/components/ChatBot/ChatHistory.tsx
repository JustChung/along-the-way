// ChatHistory.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../database/firebase';
import { historyService } from '../../services/historyService';
import { format } from 'date-fns';

const MessageGroup = ({ messages, isExpanded }) => {
  if (!isExpanded) return null;

  return (
    <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
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
              {format(message.timestamp.toDate(), 'h:mm a')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const RouteConversation = ({ conversation, isExpanded, onToggle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{conversation.route}</h3>
          <p className="text-sm text-gray-600">
            {format(conversation[0].startTime.toDate(), 'MMM d, yyyy h:mm a')}
          </p>
          <p className="text-sm text-gray-500">
            {conversation[0].messages.length} messages
          </p>
        </div>
        <button
          onClick={onToggle}
          className="text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Hide' : 'Show'} Messages
        </button>
      </div>
      <MessageGroup messages={conversation[0].messages} isExpanded={isExpanded} />
    </div>
  );
};

export function ChatHistory() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRoutes, setExpandedRoutes] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const history = await historyService.getChatHistory(user.uid);
        
        // Group conversations by route
        const groupedHistory = history.reduce((acc, session) => {
          const route = session.route;
          if (!acc[route]) {
            acc[route] = [];
          }
          acc[route].push(session);
          return acc;
        }, {});

        // Sort conversations within each route by date
        Object.keys(groupedHistory).forEach(route => {
          groupedHistory[route].sort((a, b) => 
            b.startTime.toDate().getTime() - a.startTime.toDate().getTime()
          );
        });

        setChatSessions(Object.entries(groupedHistory));
      } catch (err) {
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  const toggleRoute = (route) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(route)) {
        next.delete(route);
      } else {
        next.add(route);
      }
      return next;
    });
  };

  const filteredSessions = chatSessions.filter(([route]) =>
    route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please log in to view your chat history</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Chat History</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No conversations match your search' : 'No chat history yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(([route, conversations]) => (
              <RouteConversation
                key={route}
                conversation={conversations}
                isExpanded={expandedRoutes.has(route)}
                onToggle={() => toggleRoute(route)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHistory;