import React, { useState, useCallback, useEffect } from 'react';
import { useLoadScript, GoogleMap, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Location, Restaurant } from '../../types';

interface MapProps {
  center: Location;
  zoom: number;
  restaurants: Restaurant[];
  origin?: Location | null;
  destination?: Location | null;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ['places'] as ('places')[];

const Map: React.FC<MapProps> = ({ center, zoom, restaurants, origin, destination, onRestaurantSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const libRef = React.useRef(libraries);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: libRef.current,
  });

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
      {origin && (
        <Marker
          key="origin-marker"
          position={{ lat: origin.lat, lng: origin.lng }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
          title="Starting Point"
        />
      )}

      {destination && (
        <Marker
          key="destination-marker"
          position={{ lat: destination.lat, lng: destination.lng }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
          title="Destination"
        />
      )}

      {directions && (
        <DirectionsRenderer
          key="directions-renderer"
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

      {restaurants.map((restaurant, index) => (
        <Marker
          key={restaurant.id || `restaurant-${index}`}
          position={{ lat: restaurant.location.lat, lng: restaurant.location.lng }}
          onClick={() => handleMarkerClick(restaurant)}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
        />
      ))}

    {selectedRestaurant && (
      <InfoWindow
        key={`info-${selectedRestaurant.id}`}
        position={{
          lat: selectedRestaurant.location.lat,
          lng: selectedRestaurant.location.lng,
        }}
        onCloseClick={() => setSelectedRestaurant(null)}
      >
        <div className="p-2 max-w-xs">
          <h3 className="font-bold text-lg mb-1">
            {typeof selectedRestaurant.name === 'object' && 'text' in selectedRestaurant.name
              ? selectedRestaurant.name.text
              : selectedRestaurant.name}
          </h3>
          <div className="text-sm text-gray-600 mb-1">
            Rating: {selectedRestaurant.rating} ★
          </div>
          <div className="text-sm">
            {'$'.repeat(selectedRestaurant.priceLevel)}
          </div>
          {selectedRestaurant.location.address && (
            <div className="text-sm text-gray-600 mt-1">
              {typeof selectedRestaurant.location.address === 'object' && 'text' in selectedRestaurant.location.address
                ? selectedRestaurant.location.address.text
                : selectedRestaurant.location.address}
            </div>
          )}
        </div>
      </InfoWindow>
    )}
    </GoogleMap>
  );
};

export default Map;