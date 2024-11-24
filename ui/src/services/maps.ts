// src/services/maps.ts
import axios from 'axios';
import { Location, Restaurant, RoutePreferences } from '../types';

interface SearchOptions {
  maxStops: number | null;
  minRating: number;
}

interface RestaurantSearchResult {
  restaurants: Restaurant[];
  message?: string;
}

class MapService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  // Google Maps JavaScript API methods
  async geocodeAddress(address: string): Promise<Location> {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: result.results[0].formatted_address,
        };
      }
      throw new Error('No results found');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error}`);
    }
  }

  async getDirectionsJS(origin: Location, destination: Location): Promise<google.maps.DirectionsResult> {
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      return result;
    } catch (error) {
      throw new Error(`Directions request failed: ${error}`);
    }
  }

  // Google Maps HTTP API methods
  async getRestaurantsAlongRoute(
    routeData: google.maps.DirectionsResult, 
    origin: Location,
    options: SearchOptions
  ): Promise<RestaurantSearchResult> {
    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchText', 
        {
          "textQuery": "restaurants",
          "searchAlongRouteParameters": {
            "polyline": {
              "encodedPolyline": routeData.routes[0].overview_polyline
            }
          }
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': '*',
          },
        }
      );
  
      let restaurants = response.data.places.map((place: any) => ({
        id: place.place_id,
        name: place.displayName,
        location: {
          lat: place.location.latitude,
          lng: place.location.longitude,
          address: place.adrFormatAddress,
        },
        rating: place.rating || 0,
        priceLevel: place.priceLevel || 0,
        photos: place.photos ? place.photos : [],
        reviews: place.reviews,
        distanceFromStart: place.distanceMeters || 0
      }));
  
      // Sort restaurants by distance from start of route
      restaurants = restaurants.sort((a, b) => 
        a.distanceFromStart - b.distanceFromStart
      );
  
      // Filter by rating if specified
      if (options.minRating > 0) {
        restaurants = restaurants.filter(restaurant => 
          restaurant.rating >= options.minRating
        );
      }
  
      let message: string | undefined;
      let selectedRestaurants: typeof restaurants = [];
  
      if (options.maxStops && options.maxStops > 0) {
        const totalAvailable = restaurants.length;
        
        if (totalAvailable === 0) {
          message = "No restaurants found along your route.";
          return { restaurants: [], message };
        }
  
        if (totalAvailable < options.maxStops) {
          message = `You requested ${options.maxStops} stops, but only ${totalAvailable} restaurants were found along your route.`;
          return { restaurants, message };
        }
  
        // Get total route distance
        const totalDistance = restaurants[restaurants.length - 1].distanceFromStart;
        
        // Calculate ideal segment size
        const segmentSize = totalDistance / options.maxStops;
        
        // Create segments and select one restaurant from each
        for (let i = 0; i < options.maxStops; i++) {
          const segmentStart = i * segmentSize;
          const segmentEnd = (i + 1) * segmentSize;
          
          // Find restaurants in this segment
          const segmentRestaurants = restaurants.filter(r => 
            r.distanceFromStart >= segmentStart && 
            r.distanceFromStart < segmentEnd
          );
          
          if (segmentRestaurants.length > 0) {
            // Select the highest-rated restaurant in the segment
            const bestRestaurant = segmentRestaurants.reduce((prev, current) => 
              (current.rating > prev.rating) ? current : prev
            );
            selectedRestaurants.push(bestRestaurant);
          }
        }
  
        // If we couldn't find restaurants in some segments, fill in with remaining restaurants
        if (selectedRestaurants.length < options.maxStops) {
          const remainingNeeded = options.maxStops - selectedRestaurants.length;
          const selectedIds = new Set(selectedRestaurants.map(r => r.id));
          const remainingRestaurants = restaurants
            .filter(r => !selectedIds.has(r.id))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, remainingNeeded);
          
          selectedRestaurants = [...selectedRestaurants, ...remainingRestaurants]
            .sort((a, b) => a.distanceFromStart - b.distanceFromStart);
        }
  
        message = `Showing ${selectedRestaurants.length} restaurants distributed along your route.`;
        return {
          restaurants: selectedRestaurants,
          message
        };
      }
  
      return {
        restaurants,
        message
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch restaurants: ${errorMessage}`);
    }
  }

  async getDirectionsHTTP(origin: Location, destination: Location, preferences: RoutePreferences) {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
          alternatives: false,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch directions: ${error}`);
    }
  }

  async getRestaurantDetails(placeId: string) {
    try {
      const service = new google.maps.places.PlacesService(
        // We need a map instance or HTML element to create the service
        new google.maps.Map(document.createElement('div'))
      );
  
      return new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ['place_id', 'name', 'formatted_address', 'rating', 'price_level', 'photos', 'reviews']
          },
          (result, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
              resolve({
                id: result.place_id,
                name: result.name,
                address: result.formatted_address,
                rating: result.rating || 0,
                priceLevel: result.price_level || 0,
                photos: result.photos 
                  ? result.photos.map(photo => photo.getUrl({ maxWidth: 400 }))
                  : [],
                reviews: result.reviews?.map(review => ({
                  author_name: review.author_name,
                  rating: review.rating,
                  text: review.text,
                  time: review.time
                })) || []
              });
            } else {
              reject(new Error(`Place details request failed: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Failed to fetch restaurant details: ${error}`);
    }
  }
}

export const mapService = new MapService();