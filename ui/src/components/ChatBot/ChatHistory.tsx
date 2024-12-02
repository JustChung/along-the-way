import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase"; // import Firebase auth

export function ChatHistory() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [messages, setMessages] = useState<any[]>([]);

  const getChatHistory = () => {
    const savedMessages = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    console.log("savedMessages: ", savedMessages);
    setMessages(savedMessages);
    console.log("messages after setMessages(savedMessages): ", messages);
    setMessages(savedMessages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })));
  };

  useEffect(() => {
    getChatHistory();
  }, []);

  useEffect(() => {
    console.log("messages after setMessages: ", messages);
  }, [messages]);

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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-700 mb-6">Here are your chat histories:</p>
        <div className="h-64 overflow-y-auto mb-3">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {message.text}
              </div>
              <div className="text-xs text-gray-500">
                {message.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}