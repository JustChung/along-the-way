import React, { useState } from 'react';
import { MapIcon, MapPinIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

interface RouteCardProps {
  onSubmit: (data: {
    origin: string;
    destination: string;
    stops: number;
    rating: number;
  }) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ onSubmit }) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [stops, setStops] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleSubmit = () => {
    onSubmit({
      origin,
      destination,
      stops,
      rating
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 opacity-95">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <MapIcon className="w-8 p-1"/>
            <span className="text-xl font-semibold text-gray-800">Route</span>
          </div>
          
          {/* Origin Input */}
          <div className="relative">
            <MapPinIcon className="absolute left-2 top-2.5 w-5 text-green-600"/>
            <input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter starting point"
              className="w-full pl-9 p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination Input */}
          <div className="relative">
            <MapPinIcon className="absolute left-2 top-2.5 w-5 text-red-600"/>
            <input
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
              {/* Number of Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of stops
                </label>
                <input
                  type="number"
                  min="0"
                  value={stops}
                  onChange={(e) => setStops(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
};

export default RouteCard;