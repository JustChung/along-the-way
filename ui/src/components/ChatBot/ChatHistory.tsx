// src/components/ChatBot/ChatHistory.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase";
import { historyService } from "../../services/historyService";
import { format } from "date-fns";

export function ChatHistory() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const history = await historyService.getChatHistory(user.uid);
        setChatSessions(history);
      } catch (err) {
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2>Please log in to view this page.</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Chat History</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {chatSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No chat history yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-600">
                      {format(session.startTime.toDate(), 'MMM d, yyyy h:mm a')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedSession(
                      expandedSession === session.id ? null : session.id
                    )}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    {expandedSession === session.id ? 'Hide' : 'Show'} Messages
                  </button>
                </div>

                {expandedSession === session.id && (
                  <div className="border-t pt-4 space-y-4">
                    {session.messages.map((message: any, index: number) => (
                      <div
                        key={index}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          <p className={`text-xs mt-1 ${
                            message.isUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(message.timestamp.toDate(), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}