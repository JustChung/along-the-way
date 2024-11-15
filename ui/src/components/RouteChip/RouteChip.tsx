// src/components/RouteChip/RouteChip.tsx

import { Input } from "@material-tailwind/react";
import React from 'react';
import { Restaurant } from '../../types';

interface RouteChipProps {
    source: String;
    destination: String;
    stops: Restaurant[];
    onSelect: (restaurant: Restaurant) => void;
}

const RouteChip: React.FC<RouteChipProps> = ({ source, destination, stops, onSelect }) => {
  return (
    <div className="space-y-4">
      {stops.map((stop) => (
        <div
          key={restaurant.id}
          className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(restaurant)}
        >
          <h3 className="font-bold">{restaurant.name}</h3>
          <div className="text-sm text-gray-600">
            Rating: {restaurant.rating} • Price Level: {'$'.repeat(restaurant.priceLevel)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteChip;
