import React, { useState } from "react";
import { useGoogleMaps } from "./hooks/useGoogleMaps";
import { Location, Restaurant } from "./types";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./components/Accounts/Login";
import { Signup } from "./components/Accounts/Signup";
import { mapService } from "./services/maps";
import Map from "./components/Map/Map";
import ChatBot from "./components/ChatBot/ChatBot";
import { StickyNavbar } from "./components/StickyNavbar/StickyNavbar";
import { Alert, AlertDescription } from "./components/Alert";
import RouteCard from "./components/RouteCard/RouteCard";
import { AccountPage } from "./components/Accounts/AccountPage";
import { SavedRoutes } from "./components/Map/SavedRoutes";
import { ChatHistory } from "./components/ChatBot/ChatHistory";

interface RouteSubmitData {
  origin: string;
  destination: string;
  stops: number | null;
  rating: number;
  maxDetourMinutes: number | null;
  considerDetour: boolean;
}

const App: React.FC = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({
    lat: 34.0522,
    lng: -118.2437,
    address: "Los Angeles, CA",
  });

  const routeCardRef = React.useRef<HTMLDivElement>(null);

  const saveRouteToLocalStorage = (route) => {
    const savedRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
    savedRoutes.push(route);
    localStorage.setItem('routes', JSON.stringify(savedRoutes));
  };
  
  const getRoutesFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('routes') || '[]');
  };

  const handleRouteSubmit = async (data: RouteSubmitData) => {
    setIsLoading(true);
    setError(null);
    setRestaurants([]);

    try {
      // Geocode addresses
      const [originLocation, destLocation] = await Promise.all([
        mapService.geocodeAddress(data.origin),
        mapService.geocodeAddress(data.destination),
      ]);

      setOrigin(originLocation);
      setDestination(destLocation);

      const routeData = await mapService.getDirectionsJS(
        originLocation,
        destLocation
      );

      if (routeData.routes[0]?.bounds) {
        const bounds = routeData.routes[0].bounds;
        setMapCenter({
          lat: bounds.getCenter().lat(),
          lng: bounds.getCenter().lng(),
          address: "",
        });
      }

      const result = await mapService.getRestaurantsAlongRoute(
        routeData,
        originLocation,
        {
          maxStops: data.stops,
          minRating: data.rating,
          maxDetourMinutes: data.maxDetourMinutes || 10,
          considerDetour: data.considerDetour
        }
      );

      setRestaurants(result.restaurants);``

    // Save route data to local storage
    const route = {
      origin: data.origin,
      destination: data.destination,
      stops: data.stops,
      rating: data.rating,
      maxDetourMinutes: data.maxDetourMinutes,
      considerDetour: data.considerDetour,
      restaurants: restaurants,
      timestamp: new Date(),
    };
    saveRouteToLocalStorage(route);

      if (result.restaurants.length === 0) {
        setError(
          "No restaurants found matching your criteria. Try adjusting your preferences."
        );
      } else if (result.message) {
        // Show informative message instead of error
        setError(result.message);
      }
    } catch (error) {
      console.error("Error processing route:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleChatBotRouteRequest = (request: {
    origin?: string;
    destination?: string;
    stops?: number;
    rating?: number;
    maxDetourMinutes?: number;
    considerDetour?: boolean;
  }) => {
    // Validate required fields
    if (!request.origin || !request.destination) {
      setError("Origin and destination are required.");
      return;
    }

    // Create route submit data with defaults for missing values
    const routeData: RouteSubmitData = {
      origin: request.origin,
      destination: request.destination,
      stops: request.stops ?? null,
      rating: request.rating ?? 0,
      maxDetourMinutes: request.maxDetourMinutes ?? 10,
      considerDetour: request.considerDetour ?? true
    };

    // Update RouteCard fields using the ref
    if (routeCardRef.current) {
      routeCardRef.current.updateFields({
        origin: request.origin,
        destination: request.destination,
        stops: request.stops,
        rating: request.rating,
        maxDetourMinutes: request.maxDetourMinutes,
        considerDetour: request.considerDetour
      });
    }

    // Submit the route request
    handleRouteSubmit(routeData);
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading Google Maps. Please check your API key and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-lg">Loading maps...</div>
      </div>
    );
  }

  return (
    <Router>
      {/* Navbar is outside Routes to appear on all pages */}
      <div className="absolute w-full z-10">
        <StickyNavbar />
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50 relative">
              {/* Map and other components on the main page */}
              <div className="h-screen w-screen">
                <Map
                  center={mapCenter}
                  zoom={12}
                  restaurants={restaurants}
                  origin={origin}
                  destination={destination}
                  onRestaurantSelect={handleRestaurantSelect}
                  selectedRestaurant={selectedRestaurant}
                />
              </div>

              {/* Route Card and Status Messages */}
              <div className="absolute top-20 left-4 z-20 space-y-4">
                <RouteCard ref={routeCardRef} onSubmit={handleRouteSubmit} />

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="bg-white rounded-lg shadow-lg p-4 opacity-95">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">
                        Searching for restaurants...
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* ChatBot */}
              <div className="fixed bottom-4 right-4 z-20">
                <ChatBot
                  restaurants={restaurants}
                  origin={origin?.address}
                  destination={destination?.address}
                  onRouteRequest={handleChatBotRouteRequest}
                />
              </div>
            </div>
          }
        />
        {/* Routes to other pages in the nav bar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/savedroutes" element={<SavedRoutes />} />
        <Route path="/chathistory" element={<ChatHistory />} />
      </Routes>
    </Router>
  );
};

export default App;