// src/App.tsx
import React, { useState } from 'react';
import RouteForm from './components/RouteForm/RouteForm';
import RestaurantList from './components/RestaurantList/RestaurantList';
import ChatBot from './components/ChatBot/ChatBot';
import { Location, Restaurant, RoutePreferences } from './types';
import { api } from './services/api';
import Map from './components/Map/Map';

const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<Location>({
    lat: 34.0522,
    lng: -118.2437,
    address: 'Los Angeles, CA'
  });
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences | null>(null); // New state for route preferences
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRouteSubmit = async (data: {
    origin: string;
    destination: string;
    preferences: RoutePreferences; // Ensure preferences are received
  }) => {
    try {
      setIsLoading(true);
      setRoutePreferences(data.preferences); // Set route preferences here
      // Get route
      const routeResponse = await api.getRoute(
        { address: data.origin, lat: 0, lng: 0 },
        { address: data.destination, lat: 0, lng: 0 },
        data.preferences
      );
      setRoute(routeResponse.data);
      setOrigin(routeResponse.data.origin);
      setDestination(routeResponse.data.destination);

      // Get restaurants along the route
      const restaurantsResponse = await api.getRestaurants(
        routeResponse.data,
      );
      setRestaurants(restaurantsResponse.data);

      if (routeResponse.data.bounds) {
        setMapCenter({
          lat: routeResponse.data.bounds.getCenter().lat(),
          lng: routeResponse.data.bounds.getCenter().lng(),
          address: ''
        });
      }
    } catch (error) {
      console.error('Error fetching route and restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    try {
      const details = await api.getRestaurantDetails(restaurant.id);
      setSelectedRestaurant({ ...restaurant, ...details });
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Restaurants Along the Way</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Route Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Plan Your Route</h2>
              <RouteForm 
                onSubmit={handleRouteSubmit} 
                preferences={routePreferences} // Pass preferences to RouteForm
              />
            </div>

            {/* Restaurant List */}
            {restaurants.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Found Restaurants ({restaurants.length})
                </h2>
                <RestaurantList
                  restaurants={restaurants}
                  onSelect={handleRestaurantSelect}
                />
              </div>
            )}
          </div>

          {/* Main Content - Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <Map
                center={mapCenter}
                zoom={12}
                restaurants={restaurants}
                origin={origin}
                destination={destination}
                onRestaurantSelect={handleRestaurantSelect}
              />
            </div>

            {/* Selected Restaurant Details */}
            {selectedRestaurant && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedRestaurant.name}</h2>
                    <p className="text-gray-600">
                      Rating: {selectedRestaurant.rating} • Price Level:{' '}
                      {'$'.repeat(selectedRestaurant.priceLevel)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Restaurant Photos */}
                {selectedRestaurant.photos && (
                  <div className="mt-4 flex space-x-4 overflow-x-auto">
                    {selectedRestaurant.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${selectedRestaurant.name} - photo ${index + 1}`}
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Reviews */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Reviews</h3>
                  <div className="space-y-4">
                    {selectedRestaurant.reviews?.map((review, index) => (
                      <div key={index} className="border-b pb-4">
                        <div className="flex items-center">
                          <span className="text-yellow-400">
                            {'★'.repeat(Math.round(review.rating))}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Chat Bot */}
      <div className="fixed bottom-6 right-6">
        {isChatOpen ? (
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Restaurant Assistant</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ChatBot />
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
