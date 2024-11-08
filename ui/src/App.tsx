// src/App.tsx
import React, { useState } from 'react';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { Location, Restaurant, RoutePreferences } from './types';
import { mapsService } from './services/maps';
import { api } from './services/api';
import RouteForm from './components/RouteForm/RouteForm';
import Map from './components/Map/Map';
import RestaurantList from './components/RestaurantList/RestaurantList';
import ChatBot from './components/ChatBot/ChatBot';
import { StickyNavbar } from './components/StickyNavbar/StickyNavbar';
import { Alert, AlertDescription } from './components/Alert';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";

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
        mapsService.geocodeAddress(origin),
        mapsService.geocodeAddress(destination)
      ]);
  
      setOrigin(originLocation);
      setDestination(destLocation);
  
      // Get route
      const routeData = await mapsService.getDirections(originLocation, destLocation);
  
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
      const foundRestaurants = await api.getRestaurants(routeData, originLocation);
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

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      // Fetch the restaurant details from the API
      const details = await api.getRestaurantDetails(restaurant.id);
  
      // Create a new Restaurant object from the details
      const newRestaurant: Restaurant = {
        id: details.id,
        name: details.name,
        location: {
          lat: 0, // Set default latitude or extract if available
          lng: 0, // Set default longitude or extract if available
          address: details.address, // Using address from details
        },
        rating: details.rating,
        priceLevel: details.priceLevel,
        cuisineType: ['Various'], // Default value for cuisineType
        photos: details.photos || [], // Use provided photos or default to an empty array
        reviews: details.reviews || [], // Use provided reviews or default to an empty array
      };
  
      // Update the selected restaurant with the new Restaurant object
      setSelectedRestaurant(newRestaurant);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
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
      <button className="z-1 w-40 h-40 mt-20 ml-2 absolute top-0 bg-white" onClick={() => setIsPanelOpen(true)}>
        <div><b>Route Planner:</b></div>
        <div>Source Name</div>
        <div>Destination Name</div>
        <div>Resturants list</div>
        <div>Click me
          {/* <ChevronDoubleRightIcon className="h-5 w-5" /> */}
        </div>
      </button>
      {/* Documentation: https://www.npmjs.com/package/react-sliding-pane */}
      <SlidingPane
        isOpen={isPanelOpen}
        overlayClassName="z-[2]"
        title={<h1 className="text-2xl font-bold text-gray-900">Route Planner</h1>}
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
          <RestaurantList 
            restaurants={restaurants} 
            onSelect={handleRestaurantSelect}
          />
          <ChatBot />
        </div>
      </SlidingPane>
    </div>
  );
};

export default App;