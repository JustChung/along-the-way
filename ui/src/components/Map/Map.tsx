// src/components/Map/Map.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Location, Restaurant } from '../../types';
import { ClockIcon } from '@heroicons/react/24/solid';

// Separate InfoWindow content into its own component
const InfoWindowContent: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => (
  <div className="p-2 max-w-xs">
    <h3 className="font-bold text-lg mb-1">
      {typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name}
    </h3>
    
    {/* Rating, Price, and Detour Time */}
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center">
        <span className="text-sm text-gray-600">{restaurant.rating}</span>
        <span className="text-yellow-400 ml-1">★</span>
      </div>
      {restaurant.userRatingCount && (
        <span className="text-sm text-gray-500">({restaurant.userRatingCount} reviews)</span>
      )}
      <span className="text-sm">{'$'.repeat(restaurant.priceLevel)}</span>
    </div>

    {/* Detour Time Badge */}
    <div className="flex items-center gap-2 mb-3 bg-blue-50 p-2 rounded-md">
      <ClockIcon className="w-4 h-4 text-blue-600" />
      <span className="text-sm text-blue-700">
        {restaurant.detourMinutes < 1 
          ? 'Less than 1 min detour'
          : `${Math.round(restaurant.detourMinutes)} min detour`}
      </span>
    </div>

    {/* Address */}
    {restaurant.location.formattedAddress && (
      <div className="text-sm text-gray-600 mb-2">
        {restaurant.location.formattedAddress}
      </div>
    )}

    {/* Opening Hours */}
    {restaurant.regularOpeningHours && (
      <div className="mb-2">
        <div className="text-sm font-semibold mb-1">
          {restaurant.regularOpeningHours.openNow ? (
            <span className="text-green-600">Open Now</span>
          ) : (
            <span className="text-red-600">Closed</span>
          )}
        </div>
      </div>
    )}

    {/* Facilities */}
    {restaurant.facilities && (
      <div className="flex flex-wrap gap-1 mb-2">
        {restaurant.facilities.outdoorSeating && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Outdoor Seating</span>
        )}
        {restaurant.facilities.reservable && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Reservations</span>
        )}
        {restaurant.facilities.wheelchairAccessible && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Wheelchair Accessible</span>
        )}
      </div>
    )}

    {/* Contact */}
    {(restaurant.phoneNumber || restaurant.websiteUri) && (
      <div className="text-sm">
        {restaurant.phoneNumber && (
          <div className="text-blue-600 mb-1">
            <a href={`tel:${restaurant.phoneNumber}`}>{restaurant.phoneNumber}</a>
          </div>
        )}
        {restaurant.websiteUri && (
          <div className="text-blue-600 truncate">
            <a href={restaurant.websiteUri} target="_blank" rel="noopener noreferrer">
              Visit Website
            </a>
          </div>
        )}
      </div>
    )}
  </div>
);

// Custom marker colors based on detour time
const getMarkerIcon = (detourMinutes: number) => {
  let color;
  if (detourMinutes <= 5) {
    color = 'blue';
  } else if (detourMinutes <= 10) {
    color = 'purple';
  } else if (detourMinutes <= 15) {
    color = 'yellow';
  } else {
    color = 'pink';
  }
  return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
};

interface MapProps {
  center: Location;
  zoom: number;
  restaurants: Restaurant[];
  origin?: Location | null;
  destination?: Location | null;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  selectedRestaurant?: Restaurant | null;
}

const Map: React.FC<MapProps> = ({
  center,
  zoom,
  restaurants,
  origin,
  destination,
  onRestaurantSelect,
  selectedRestaurant: externalSelectedRestaurant
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const libRef = React.useRef(['places'] as const);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libRef.current,
  });

  // Sync external and internal selected restaurant state
  useEffect(() => {
    if (externalSelectedRestaurant) {
      setSelectedRestaurant(externalSelectedRestaurant);
    }
  }, [externalSelectedRestaurant]);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle directions
  useEffect(() => {
    if (!isLoaded || !origin || !destination || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions ${status}`);
        }
      }
    );
  }, [origin, destination, isLoaded]);

  const handleMarkerClick = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
    }
  }, [onRestaurantSelect]);

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div className="p-4">Loading maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Origin Marker */}
      {origin && (
        <Marker
          position={{ lat: origin.lat, lng: origin.lng }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
          title="Starting Point"
        />
      )}

      {/* Destination Marker */}
      {destination && (
        <Marker
          position={{ lat: destination.lat, lng: destination.lng }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
          title="Destination"
        />
      )}

      {/* Directions */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#4A90E2',
              strokeWeight: 6,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {/* Restaurant Markers */}
      {restaurants.map((restaurant, index) => (
        <Marker
          key={restaurant.id || `restaurant-${index}`}
          position={{ lat: restaurant.location.lat, lng: restaurant.location.lng }}
          onClick={() => handleMarkerClick(restaurant)}
          icon={{
            url: getMarkerIcon(restaurant.detourMinutes),
            scaledSize: new window.google.maps.Size(32, 32),
          }}
        />
      ))}

      {/* InfoWindow */}
      {selectedRestaurant && (
        <InfoWindow
          position={{
            lat: selectedRestaurant.location.lat,
            lng: selectedRestaurant.location.lng,
          }}
          onCloseClick={() => setSelectedRestaurant(null)}
        >
          <InfoWindowContent restaurant={selectedRestaurant} />
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map;