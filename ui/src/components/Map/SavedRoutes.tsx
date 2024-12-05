// src/components/Map/SavedRoutes.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase";
import { historyService } from "../../services/historyService";
import { format } from "date-fns";

export function SavedRoutes() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      if (!user) return;
      
      try {
        const userRoutes = await historyService.getUserRoutes(user.uid);
        setRoutes(userRoutes);
      } catch (err) {
        setError("Failed to load saved routes");
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
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
        <h1 className="text-3xl font-bold text-blue-600 mb-8">Saved Routes</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No saved routes yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {route.origin.address} → {route.destination.address}
                    </h2>
                    <p className="text-gray-600">
                      {format(route.timestamp.toDate(), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/', {
                      state: { routeData: route }
                    })}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Load Route
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Stops ({route.stops.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {route.stops.map((stop: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{stop.name.text || stop.name}</p>
                          <p className="text-sm text-gray-600">{stop.location.address.text || stop.location.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}