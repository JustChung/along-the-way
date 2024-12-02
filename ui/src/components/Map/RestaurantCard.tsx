import React, { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { getTextContent } from './Map';
import { InfoWindowContent } from './Map';

interface Restaurant {
  name: {
    text: string;
    languageCode: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  photos?: { name: string }[];
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (restaurant.photos?.[0]?.name) {
        setIsLoadingImage(true);
        try {
          const photoReference = restaurant.photos[0].name.split('/').pop();
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
          setImageUrl(photoUrl);
          setImageError(false);
        } catch (error) {
          console.error('Error loading restaurant image:', error);
          setImageError(true);
        } finally {
          setIsLoadingImage(false);
        }
      }
    };

    loadImage();
    setShowReviews(false);
  }, [restaurant]);

  const handleToggleReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReviews(prev => !prev);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getGoogleReviewUrl = () => {
    const placeName = encodeURIComponent(typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name);
    const placeLocation = encodeURIComponent(`${restaurant.location?.lat},${restaurant.location?.lng}`);
    return `https://search.google.com/local/writereview?placeid=${restaurant.id}`;
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm" onClick={handleContainerClick}>
      {isLoadingImage ? (
        <div className="mb-3 w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !imageError && imageUrl ? (
        <div className="mb-3 w-full">
          <img
            src={imageUrl}
            alt={`${restaurant.name} exterior`}
            className="w-full h-80 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>
      ) : null}

      <h3 className="font-bold text-lg mb-1">
        {typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name}
      </h3>
      
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

      <div className="flex items-center gap-2 mb-3 bg-blue-50 p-2 rounded-md">
        <ClockIcon className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700">
          {restaurant.detourMinutes < 1 
            ? 'Less than 1 min detour'
            : `${Math.round(restaurant.detourMinutes)} min detour`}
        </span>
      </div>

      <a
        href={getGoogleReviewUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className="w-full mb-3 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded transition-colors"
      >
        <StarIcon className="w-4 h-4 text-yellow-400" />
        Rate on Google
      </a>

      {restaurant.location.formattedAddress && (
        <div className="text-sm text-gray-600 mb-2">
          {restaurant.location.formattedAddress}
        </div>
      )}

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

      {restaurant.reviews && restaurant.reviews.length > 0 && (
        <button
          onClick={handleToggleReviews}
          className="w-full mb-3 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition-colors"
        >
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
          {showReviews ? 'Hide Reviews' : 'Show Reviews'}
        </button>
      )}

      {showReviews && restaurant.reviews && (
        <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
          {restaurant.reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {review.authorAttribution?.displayName || 'Anonymous'}
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-yellow-600">{review.rating}</span>
                  <span className="text-yellow-400 ml-1">★</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{getTextContent(review.text)}</p>
              <span className="text-xs text-gray-400 block mt-1">
                {review.relativePublishTimeDescription}
              </span>
            </div>
          ))}
        </div>
      )}

      {(restaurant.phoneNumber || restaurant.websiteUri) && (
        <div className="text-sm mt-3">
          {restaurant.phoneNumber && (
            <div className="text-blue-600 mb-1">
              <a 
                href={`tel:${restaurant.phoneNumber}`}
                onClick={handleLinkClick}
              >
                {restaurant.phoneNumber}
              </a>
            </div>
          )}
          {restaurant.websiteUri && (
            <div className="text-blue-600 truncate">
              <a 
                href={restaurant.websiteUri} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                Visit Website
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;