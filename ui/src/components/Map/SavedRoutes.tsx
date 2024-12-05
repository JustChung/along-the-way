import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase";
import { historyService } from "../../services/historyService";
import { format } from "date-fns";

// Route card component for better organization
const RouteCard = ({ route, onLoadRoute }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2 line-clamp-1">
            {route.origin.address} → {route.destination.address}
          </h2>
          <p className="text-gray-600 text-sm">
            {format(route.timestamp.toDate(), 'MMM d, yyyy h:mm a')}
          </p>
          <p className="text-gray-600 text-sm">
            {route.stops.length} stops • Min rating: {route.preferences.minRating}★
            {route.preferences.maxDetourMinutes && 
              ` • Max detour: ${route.preferences.maxDetourMinutes}min`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </button>
          <button
            onClick={() => onLoadRoute(route)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Load Route
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Stops ({route.stops.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {route.stops.map((stop, index) => (
              <div key={index} className="flex items-start space-x-2 bg-gray-50 p-3 rounded">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium line-clamp-1">
                    {typeof stop.name === 'object' ? stop.name.text : stop.name}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {typeof stop.location.address === 'object' 
                      ? stop.location.address.text 
                      : stop.location.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-yellow-600">{stop.rating}★</span>
                    {stop.detourMinutes > 0 && (
                      <span className="text-sm text-blue-600">
                        {Math.round(stop.detourMinutes)}min detour
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Loading skeleton for better UX
const RouteSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-3/4">
        <div className="h-6 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="h-10 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

export function SavedRoutes() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadRoutes = async () => {
      if (!user) return;
      
      try {
        const userRoutes = await historyService.getUserRoutes(user.uid);
        setRoutes(userRoutes);
        setFilteredRoutes(userRoutes);
      } catch (err) {
        setError("Failed to load saved routes");
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = routes.filter(route => 
        route.origin.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.stops.some(stop => 
          (typeof stop.name === 'object' 
            ? stop.name.text 
            : stop.name
          ).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchTerm, routes]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Please log in to view your saved routes</h2>
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
          <h1 className="text-3xl font-bold text-blue-600">Saved Routes</h1>
          <div className="relative">
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
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <RouteSkeleton key={i} />)}
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              {searchTerm ? 'No routes match your search' : 'No saved routes yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onLoadRoute={(route) => navigate('/', { state: { routeData: route } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedRoutes;