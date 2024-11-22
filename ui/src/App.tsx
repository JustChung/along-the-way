// src/App.tsx
import React, { useState } from 'react';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { Location, Restaurant} from './types';
import { mapService } from './services/maps';
import {RouteForm, RouteFormData} from './components/RouteForm/RouteForm';
import Map from './components/Map/Map';
import ChatBot from './components/ChatBot/ChatBot';
import { StickyNavbar } from './components/StickyNavbar/StickyNavbar';
import { Alert, AlertDescription } from './components/Alert';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import RouteCard from './components/RouteCard/RouteCard';

const App: React.FC = () => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({
    lat: 34.0522,
    lng: -118.2437,
    address: 'Los Angeles, CA'
  });

  // Sidebar open state
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const handleRouteSubmit = async (data: RouteFormData) => {
    const { origin, destination, preferences } = data;
    setIsLoading(true);
    setError(null);
    setRestaurants([]);
  
    try {
      // Geocode addresses
      const [originLocation, destLocation] = await Promise.all([
        mapService.geocodeAddress(origin),
        mapService.geocodeAddress(destination)
      ]);
  
      setOrigin(originLocation);
      setDestination(destLocation);
  
      // Get route
      const routeData = await await mapService.getDirectionsJS(originLocation, destLocation);;
  
      // Update map center to show the entire route
      if (routeData.routes[0]?.bounds) {
        const bounds = routeData.routes[0].bounds;
        setMapCenter({
          lat: bounds.getCenter().lat(),
          lng: bounds.getCenter().lng(),
          address: ''
        });
      }
  
      // Search for restaurants along the route
      const foundRestaurants = await mapService.getRestaurantsAlongRoute(routeData, originLocation);
      setRestaurants(foundRestaurants);
  
      if (foundRestaurants.length === 0) {
        setError('No restaurants found matching your criteria. Try adjusting your preferences.');
      }
    } catch (error) {
      console.error('Error processing route:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };  

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
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
    <div className="min-h-screen bg-gray-50 static">
      <div className="absolute w-full">
        <StickyNavbar/>
      </div>
      <div className="h-screen w-screen">
          <Map
            center={mapCenter}
            zoom={12}
            restaurants={restaurants}
            origin={origin}
            destination={destination}
            onRestaurantSelect={handleRestaurantSelect}
          />
      </div>
      <div className="z-1 mt-16 ml-4 absolute top-0">
        <RouteCard source={origin?.address} destination={destination?.address} onSelect={() => setIsPanelOpen(true)}/>
        {/* List */}
      </div>
      {/* Documentation: https://www.npmjs.com/package/react-sliding-pane */}
      <SlidingPane
        isOpen={isPanelOpen}
        overlayClassName="z-[2]"
        title={<span className="text-2xl font-bold text-gray-900">Route Planner</span>}
        from="left"
        width="30%"
        onRequestClose={() => setIsPanelOpen(false)}
      >
        <div className="lg:col-span-1 space-y-6">
          <RouteForm onSubmit={handleRouteSubmit} />
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching for restaurants...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {/* <RestaurantList 
            restaurants={restaurants} 
            onSelect={handleRestaurantSelect}
          /> */}
          <ChatBot />
        </div>
      </SlidingPane>
    </div>
  );
};

export default App;