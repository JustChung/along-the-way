// src/services/maps.ts
import axios from 'axios';
import { Location, Restaurant } from '../types';

interface SearchOptions {
  maxStops: number | null;
  minRating: number;
  maxDetourMinutes: number;
}

interface RestaurantSearchResult {
  restaurants: Restaurant[];
  message?: string;
}

interface DistanceMatrixResult {
  originAddresses: string[];
  destinationAddresses: string[];
  rows: {
    elements: {
      status: string;
      duration: { value: number; text: string; };
      distance: { value: number; text: string; };
    }[];
  }[];
}

// Helper function to convert price level string to number
const convertPriceLevel = (level: string): number => {
  const priceLevelMap: { [key: string]: number } = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4
  };
  return priceLevelMap[level] || 1;
};

// Helper function to process photos
const processPhotos = (photos: any[]) => {
  return photos?.map(photo => ({
    name: photo.name,
    widthPx: photo.widthPx,
    heightPx: photo.heightPx,
    authorAttributions: photo.authorAttributions,
    uri: photo.name // Store the photo reference for later use
  })) || [];
};

// Helper function to process business hours
const processBusinessHours = (hours: any) => {
  if (!hours) return null;
  
  return {
    openNow: hours.openNow || false,
    periods: hours.periods || [],
    weekdayDescriptions: hours.weekdayDescriptions || [],
  };
};

class MapService {
  private readonly apiKey: string;
  private readonly placesApiBaseUrl = 'https://places.googleapis.com/v1/places';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!this.apiKey) {
      console.error('Google Maps API key is not configured');
    }
  }

  async geocodeAddress(address: string): Promise<Location> {
    if (!address.trim()) {
      throw new Error('Address cannot be empty');
    }

    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      
      if (!result.results || result.results.length === 0) {
        throw new Error('No results found for the given address');
      }

      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        address: result.results[0].formatted_address,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDirectionsJS(origin: Location, destination: Location): Promise<google.maps.DirectionsResult> {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      });

      if (!result.routes || result.routes.length === 0) {
        throw new Error('No route found between the specified locations');
      }

      return result;
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error(`Failed to get directions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async calculateDetourTime(
    routePoint: google.maps.LatLng,
    restaurant: { location: { lat: number; lng: number } },
    service: google.maps.DistanceMatrixService
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [routePoint],
          destinations: [new google.maps.LatLng(restaurant.location.lat, restaurant.location.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            const duration = response.rows[0].elements[0].duration.value;
            resolve(duration / 60); // Convert seconds to minutes
          } else {
            reject(new Error('Failed to calculate detour time'));
          }
        }
      );
    });
  }

  private async findNearestPointOnRoute(
    route: google.maps.DirectionsRoute,
    restaurant: { location: { lat: number; lng: number } }
  ): Promise<{ point: google.maps.LatLng; distance: number }> {
    const path = route.overview_path;
    let minDistance = Infinity;
    let nearestPoint = path[0];
    
    const restaurantLatLng = new google.maps.LatLng(
      restaurant.location.lat,
      restaurant.location.lng
    );

    for (let i = 0; i < path.length; i++) {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        path[i],
        restaurantLatLng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = path[i];
      }
    }

    return { point: nearestPoint, distance: minDistance };
  }

async getRestaurantsAlongRoute(
  routeData: google.maps.DirectionsResult,
  origin: Location,
  options: SearchOptions & { considerDetour?: boolean }
): Promise<RestaurantSearchResult> {
  if (!routeData.routes?.[0]?.overview_polyline) {
    throw new Error('Invalid route data');
  }

  try {
    // Get restaurants along route using the encoded polyline
    const response = await axios.post(
      `${this.placesApiBaseUrl}:searchText`,
      {
        textQuery: "restaurants",
        searchAlongRouteParameters: {
          polyline: {
            encodedPolyline: routeData.routes[0].overview_polyline
          }
        },
        maxResultCount: 50,
        languageCode: "en"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': '*'
        },
      }
    );

    if (!response.data.places) {
      return { restaurants: [], message: 'No restaurants found along the route' };
    }

    // Process restaurant data
    let restaurants = response.data.places.map((place: any) => ({
      id: place.id,
      name: place.displayName,
      location: {
        lat: place.location.latitude,
        lng: place.location.longitude,
        address: place.formattedAddress,
        addressComponents: place.addressComponents,
        plusCode: place.plusCode
      },
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount,
      priceLevel: convertPriceLevel(place.priceLevel),
      photos: processPhotos(place.photos),
      reviews: place.reviews?.map((review: any) => ({
        name: review.name,
        rating: review.rating,
        text: review.text,
        authorAttribution: review.authorAttribution,
        publishTime: review.publishTime,
        relativePublishTimeDescription: review.relativePublishTimeDescription
      })),
      phoneNumber: place.internationalPhoneNumber || place.nationalPhoneNumber,
      websiteUri: place.websiteUri,
      regularOpeningHours: processBusinessHours(place.regularOpeningHours),
      currentOpeningHours: processBusinessHours(place.currentOpeningHours),
      facilities: {
        delivery: place.delivery,
        dineIn: place.dineIn,
        takeout: place.takeout,
        reservable: place.reservable,
        servesBreakfast: place.servesBreakfast,
        servesLunch: place.servesLunch,
        servesDinner: place.servesDinner,
        servesBeer: place.servesBeer,
        servesWine: place.servesWine,
        servesBrunch: place.servesBrunch,
        servesVegetarianFood: place.servesVegetarianFood,
        outdoorSeating: place.outdoorSeating,
        restroom: place.restroom,
        wheelchairAccessible: place.accessibilityOptions?.wheelchairAccessibleEntrance
      },
      priceRange: place.priceRange,
      businessStatus: place.businessStatus,
      types: place.types,
      distanceFromStart: 0,
      detourMinutes: 0
    }));

    // Calculate detour times and distances if needed
    if (options.considerDetour) {
      const distanceMatrixService = new google.maps.DistanceMatrixService();
      const mainRoute = routeData.routes[0];

      const BATCH_SIZE = 10;
      for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
        const batch = restaurants.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (restaurant) => {
            try {
              const { point } = await this.findNearestPointOnRoute(mainRoute, restaurant);
              const detourTime = await this.calculateDetourTime(
                point,
                restaurant,
                distanceMatrixService
              );
              
              restaurant.detourMinutes = detourTime;
              restaurant.distanceFromStart = this.calculateDistanceFromStart(
                origin,
                { lat: restaurant.location.lat, lng: restaurant.location.lng }
              );
            } catch (error) {
              console.error(`Error calculating detour for restaurant ${restaurant.id}:`, error);
              restaurant.detourMinutes = Infinity;
            }
          })
        );
      }

      // Filter by detour time and rating
      restaurants = restaurants.filter(restaurant => 
        restaurant.rating >= options.minRating &&
        restaurant.detourMinutes <= (options.maxDetourMinutes || Infinity)
      );
    } else {
      // Only filter by rating
      restaurants = restaurants.filter(restaurant => 
        restaurant.rating >= options.minRating
      );
    }

    // Calculate distances from route start for all restaurants
    restaurants.forEach(restaurant => {
      restaurant.distanceFromStart = this.calculateDistanceFromStart(
        origin,
        { lat: restaurant.location.lat, lng: restaurant.location.lng }
      );
    });

    // Sort by distance along route
    restaurants.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

    // Handle max stops
    if (options.maxStops && options.maxStops > 0) {
      const { selectedRestaurants, message } = this.selectRestaurantsBySegments(
        restaurants,
        options.maxStops
      );
      return { 
        restaurants: selectedRestaurants,
        message: `${message} ${options.considerDetour ? `All restaurants are within ${options.maxDetourMinutes} minutes of your route.` : ''}`
      };
    }

    return {
      restaurants,
      message: `Found ${restaurants.length} restaurants${options.considerDetour ? ` within ${options.maxDetourMinutes} minutes of your route` : ' along your route'}.`
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw new Error(`Failed to fetch restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

  private calculateDistanceFromStart(start: Location, point: { lat: number; lng: number }): number {
    return google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(start.lat, start.lng),
      new google.maps.LatLng(point.lat, point.lng)
    );
  }

  private selectRestaurantsBySegments(
    restaurants: Restaurant[],
    maxStops: number
  ): { selectedRestaurants: Restaurant[]; message?: string } {
    if (restaurants.length === 0) {
      return {
        selectedRestaurants: [],
        message: "No restaurants found along your route."
      };
    }

    if (restaurants.length <= maxStops) {
      return {
        selectedRestaurants: restaurants,
        message: `Found ${restaurants.length} restaurants, which is less than your requested ${maxStops} stops.`
      };
    }

    const totalDistance = Math.max(...restaurants.map(r => r.distanceFromStart));
    const segmentSize = totalDistance / maxStops;
    const selectedRestaurants: Restaurant[] = [];
    
    // Select best restaurant in each segment
    for (let i = 0; i < maxStops; i++) {
      const segmentStart = i * segmentSize;
      const segmentEnd = (i + 1) * segmentSize;
      
      const segmentRestaurants = restaurants.filter(r => 
        r.distanceFromStart >= segmentStart && 
        r.distanceFromStart < segmentEnd
      );

      if (segmentRestaurants.length > 0) {
        // Select highest-rated restaurant in segment
        const bestRestaurant = segmentRestaurants.reduce((prev, current) => 
          (current.rating > prev.rating || 
           (current.rating === prev.rating && current.userRatingCount > prev.userRatingCount)) 
            ? current : prev
        );
        selectedRestaurants.push(bestRestaurant);
      }
    }

    // Fill remaining slots if needed
    if (selectedRestaurants.length < maxStops) {
      const remainingNeeded = maxStops - selectedRestaurants.length;
      const selectedIds = new Set(selectedRestaurants.map(r => r.id));
      const remainingRestaurants = restaurants
        .filter(r => !selectedIds.has(r.id))
        .sort((a, b) => b.rating - a.rating || b.userRatingCount - a.userRatingCount)
        .slice(0, remainingNeeded);
      
      selectedRestaurants.push(...remainingRestaurants);
    }

    return {
      selectedRestaurants: selectedRestaurants.sort((a, b) => a.distanceFromStart - b.distanceFromStart),
      message: `Selected ${selectedRestaurants.length} well-rated restaurants distributed along your route.`
    };
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.placesApiBaseUrl}/${placeId}`,
        {
          headers: {
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': '*'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      throw new Error(`Failed to fetch place details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPlacePhotos(photoName: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.placesApiBaseUrl}/${photoName}/media`,
        {
          headers: {
            'X-Goog-Api-Key': this.apiKey
          }
        }
      );
      return response.data.photoUri;
    } catch (error) {
      console.error('Error fetching place photo:', error);
      throw new Error(`Failed to fetch place photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const mapService = new MapService();