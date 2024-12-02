import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase"; // import Firebase auth
import RestaurantCard from "./RestaurantCard";

const getRoutesFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem('routes') || '[]');
};

export const SavedRoutes = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  interface Route {
    origin: string;
    destination: string;
    stops: string[];
    rating: number;
    maxDetourMinutes: number;
    considerDetour: boolean;
    restaurants: {
      name: {
        test: string;
        languageCode: string;
      };
      location?: {
        lat: number;
        lng: number;
      };
      text?: string;
      languageCode?: string;
    }[];
  }
  
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const savedRoutes = getRoutesFromLocalStorage();
    setRoutes(savedRoutes);
  }, []);

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
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
    <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full mt-20">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Welcome, {user.displayName || user.email}!
      </h1>
      <p className="text-gray-700 mb-6">Here are your saved routes:</p>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Saved Routes</h2>
        {routes.map((route, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Route {index + 1}</h3>
            <p><strong>Origin:</strong> {route.origin}</p>
            <p><strong>Destination:</strong> {route.destination}</p>
            <p><strong>Stops:</strong> {route.stops}</p>
            <p><strong>Rating:</strong> {route.rating}</p>
            <p><strong>Max Detour Minutes:</strong> {route.maxDetourMinutes}</p>
            <p><strong>Consider Detour:</strong> {route.considerDetour ? "Yes" : "No"}</p>
            <h4 className="text-lg font-semibold mt-4">Restaurants:</h4>
            <ul>
              {route.restaurants.map((restaurant, idx) => (
                  <li key={idx} className="ml-4 mb-4">
                    <RestaurantCard restaurant={restaurant} />
                  </li>
                ))}
            </ul>
            {index < routes.length - 1 && <hr className="my-6 border-t-2 border-gray-300" />}
          </div>
        ))}
      </div>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};