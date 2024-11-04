// src/components/Map/RestaurantInfoCard.tsx
import { Restaurant } from "../../types";

interface RestaurantInfoCardProps {
    restaurant: Restaurant;
  }
  
  const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({ restaurant }) => {
    return (
      <div className="p-2 max-w-xs">
        <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
        <div className="text-sm text-gray-600 mb-1">
          Rating: {restaurant.rating} ★
        </div>
        <div className="text-sm">
          {'$'.repeat(restaurant.priceLevel)}
        </div>
        {restaurant.location.address && (
          <div className="text-sm text-gray-600 mt-1">
            {restaurant.location.address}
          </div>
        )}
      </div>
    );
  };
  