import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase"; // import Firebase auth

export function SavedRoutes() {
  const navigate = useNavigate();
  const user = auth.currentUser;

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
        <p className="text-gray-700 mb-6">Here are your saved routes:</p>
    </div>
    </div>
  );
}