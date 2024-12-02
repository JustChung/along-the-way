import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase"; // import Firebase auth

export function ChatHistory() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [messages, setMessages] = useState<any[]>([]);

  const getChatHistory = () => {
    const savedConversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
    setMessages(savedConversations);
  };

  useEffect(() => {
    getChatHistory();
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Please log in to view this page.</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl w-full mt-24">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-700 mb-6">Here are your chat histories:</p>
        <div className="overflow-y-auto mb-3">
          {messages.map((conversation, index) => (
            <div key={index} className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Conversation {index + 1}</h2>
              {conversation.messages.map((message: any, msgIndex: number) => (
                <div key={msgIndex} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {message.text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}