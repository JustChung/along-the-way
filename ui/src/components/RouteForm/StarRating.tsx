
// src/components/StarRating.tsx
import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid'; // Updated import path

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-6 w-6 cursor-pointer ${
            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        />
      ))}
    </div>
  );
};

export default StarRating;