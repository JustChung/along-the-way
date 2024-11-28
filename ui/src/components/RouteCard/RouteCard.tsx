import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { usePlacesAutocomplete } from '../../hooks/usePlacesAutocomplete';

interface RouteCardProps {
  onSubmit: (data: {
    origin: string;
    destination: string;
    stops: number | null;
    rating: number;
    maxDetourMinutes: number | null;
    considerDetour: boolean;
  }) => void;
}

export interface RouteCardRef {
  updateFields: (data: {
    origin?: string;
    destination?: string;
    stops?: number;
    rating?: number;
    maxDetourMinutes?: number;
    considerDetour?: boolean;
  }) => void;
}

const RouteCard = forwardRef<RouteCardRef, RouteCardProps>(({ onSubmit }, ref) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [stops, setStops] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [maxDetourMinutes, setMaxDetourMinutes] = useState<number>(10);
  const [considerDetour, setConsiderDetour] = useState(true);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const originAutocomplete = usePlacesAutocomplete("origin-input", {
    types: ['address'],
    componentRestrictions: { country: 'us' }
  });

  const destinationAutocomplete = usePlacesAutocomplete("destination-input", {
    types: ['address'],
    componentRestrictions: { country: 'us' }
  });

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    updateFields: (data) => {
      if (data.origin !== undefined) setOrigin(data.origin);
      if (data.destination !== undefined) setDestination(data.destination);
      if (data.stops !== undefined) setStops(data.stops);
      if (data.rating !== undefined) {
        setRating(data.rating);
        setHoverRating(0);
      }
      if (data.maxDetourMinutes !== undefined) setMaxDetourMinutes(data.maxDetourMinutes);
      if (data.considerDetour !== undefined) setConsiderDetour(data.considerDetour);
      
      if (data.stops !== undefined || data.rating !== undefined || data.maxDetourMinutes !== undefined) {
        setShowOptions(true);
      }
    }
  }));

  useEffect(() => {
    if (originAutocomplete) {
      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.formatted_address) {
          setOrigin(place.formatted_address);
        }
      });
    }

    if (destinationAutocomplete) {
      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
        }
      });
    }
  }, [originAutocomplete, destinationAutocomplete]);

  const handleSubmit = () => {
    onSubmit({
      origin,
      destination,
      stops,
      rating,
      maxDetourMinutes: considerDetour ? maxDetourMinutes : null,
      considerDetour
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 opacity-95">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <MapIcon className="w-8 h-8 p-1"/>
            <span className="text-xl font-semibold text-gray-800">Route</span>
          </div>
          
          {/* Origin Input */}
          <div className="relative">
            <MapPinIcon className="absolute left-2 top-2.5 w-5 h-5 text-green-600"/>
            <input
              id="origin-input"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter starting point"
              className="w-full pl-9 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination Input */}
          <div className="relative">
            <MapPinIcon className="absolute left-2 top-2.5 w-5 h-5 text-red-600"/>
            <input
              id="destination-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="w-full pl-9 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* More Options Button */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center justify-between w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>More Options</span>
            {showOptions ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>

          {/* Expanded Options */}
          {showOptions && (
            <div className="space-y-4 pt-2">
              {/* Consider Detour Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consider-detour"
                  checked={considerDetour}
                  onChange={(e) => setConsiderDetour(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consider-detour" className="text-sm font-medium text-gray-700">
                  Consider detour time
                </label>
              </div>

              {/* Maximum Detour Time (only shown if considerDetour is true) */}
              {considerDetour && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum detour time (minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={maxDetourMinutes}
                      onChange={(e) => setMaxDetourMinutes(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 min-w-[3rem]">
                      {maxDetourMinutes} min
                    </span>
                  </div>
                </div>
              )}

              {/* Number of Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of stops (0 for no limit)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stops === null ? "" : stops}
                  onChange={(e) => {
                    const value = e.target.value === "" ? null : parseInt(e.target.value);
                    setStops(value);
                  }}
                  className="w-full p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="No limit"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!origin || !destination}
            className={`w-full p-2 rounded-md text-white transition-colors ${
              !origin || !destination 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Find Route
          </button>
        </div>
      </div>
    </div>
  );
});

export default RouteCard;