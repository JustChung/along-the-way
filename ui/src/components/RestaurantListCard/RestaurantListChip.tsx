// src/components/RouteChip/RouteChip.tsx

import React from 'react';
import { Restaurant } from '../../types';

interface RestaurantListCardProps {
  restaurants: Restaurant[];
  onSelect: (restaurant: Restaurant) => void;
}

const RestaurantListCard: React.FC<RestaurantListCardProps> = ({ restaurants, onSelect }) => {
  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
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

export default RestaurantListCard;
