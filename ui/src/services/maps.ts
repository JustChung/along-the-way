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
    if (!routeData.routes?.[0]?.overview_path) {
      throw new Error('Invalid route data');
    }
  
    try {
      const route = routeData.routes[0];
      const path = route.overview_path;
      
      // Calculate total route distance in meters
      let totalDistance = 0;
      for (let i = 1; i < path.length; i++) {
        totalDistance += google.maps.geometry.spherical.computeDistanceBetween(path[i-1], path[i]);
      }

      // Dynamic segmentation based on route length
      let numberOfSegments: number;
      if (totalDistance <= 10000) { // Under 10km
        numberOfSegments = 2;
      } else if (totalDistance <= 50000) { // 10-50km
        numberOfSegments = 5;
      } else if (totalDistance <= 100000) { // 50-100km
        numberOfSegments = 8;
      } else if (totalDistance <= 200000) { // 100-200km
        numberOfSegments = 12;
      } else { // Over 200km
        numberOfSegments = 15;
      }

      const segmentLength = totalDistance / numberOfSegments;
      
      console.log(`Route distance: ${(totalDistance/1000).toFixed(1)}km`);
      console.log(`Number of segments: ${numberOfSegments}`);
      console.log(`Segment length: ${(segmentLength/1000).toFixed(1)}km`);
      
      let allRestaurants: Restaurant[] = [];
      let segmentStats: { start: number; end: number; count: number }[] = [];
      
      // Process route in segments
      for (let segmentIndex = 0; segmentIndex < numberOfSegments; segmentIndex++) {
        // Use linear segmentation without overlap
        const segmentStartDistance = segmentIndex * segmentLength;
        const segmentEndDistance = Math.min((segmentIndex + 1) * segmentLength, totalDistance);
        
        let currentDistance = 0;
        let segmentPath: google.maps.LatLng[] = [];
        let startPointFound = false;
  
        // Build segment path
        for (let i = 1; i < path.length; i++) {
          const pointDistance = google.maps.geometry.spherical.computeDistanceBetween(path[i-1], path[i]);
          const newDistance = currentDistance + pointDistance;
  
          if (currentDistance <= segmentEndDistance) {
            if (currentDistance >= segmentStartDistance && !startPointFound) {
              const ratio = (segmentStartDistance - currentDistance) / pointDistance;
              const startPoint = google.maps.geometry.spherical.interpolate(path[i-1], path[i], ratio);
              segmentPath.push(startPoint);
              startPointFound = true;
            }
  
            if (startPointFound) {
              segmentPath.push(path[i]);
            }
          }
  
          if (newDistance > segmentEndDistance) {
            const ratio = (segmentEndDistance - currentDistance) / pointDistance;
            const endPoint = google.maps.geometry.spherical.interpolate(path[i-1], path[i], ratio);
            segmentPath.push(endPoint);
            break;
          }
  
          currentDistance = newDistance;
        }
  
        if (segmentPath.length < 2) continue;

        const encodedPath = google.maps.geometry.encoding.encodePath(segmentPath);
        
        // Request equal number of results per segment
        const segmentMaxResults = Math.min(30, Math.ceil(50 / numberOfSegments));

        console.log(`Segment ${segmentIndex + 1}: ${(segmentStartDistance/1000).toFixed(1)}km to ${(segmentEndDistance/1000).toFixed(1)}km`);
  
        const response = await axios.post(
          `${this.placesApiBaseUrl}:searchText`,
          {
            textQuery: "restaurants",
            searchAlongRouteParameters: {
              polyline: {
                encodedPolyline: encodedPath
              }
            },
            maxResultCount: segmentMaxResults,
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
  
        if (response.data.places) {
          const segmentRestaurants = response.data.places.map((place: any) => ({
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
  
          allRestaurants = allRestaurants.concat(segmentRestaurants);
          
          segmentStats.push({
            start: segmentStartDistance,
            end: segmentEndDistance,
            count: segmentRestaurants.length
          });
          
          console.log(`Found ${segmentRestaurants.length} restaurants in segment ${segmentIndex + 1}`);
        }
      }

      // Log segment statistics
      console.log('Segment Statistics:');
      segmentStats.forEach((stat, index) => {
        console.log(`Segment ${index + 1}: ${stat.count} restaurants (${(stat.start/1000).toFixed(1)}km - ${(stat.end/1000).toFixed(1)}km)`);
      });
  
      // Remove duplicates
      const beforeDedup = allRestaurants.length;
      allRestaurants = Array.from(new Map(allRestaurants.map(r => [r.id, r])).values());
      console.log(`Removed ${beforeDedup - allRestaurants.length} duplicate restaurants`);

      // Calculate accurate distances from route start for all restaurants
      for (const restaurant of allRestaurants) {
        let minDistance = Infinity;
        let distanceFromStart = 0;
        let accumulatedDistance = 0;

        // Find closest point on route and calculate distance from start
        for (let i = 1; i < path.length; i++) {
          const pointDistance = google.maps.geometry.spherical.computeDistanceBetween(path[i-1], path[i]);
          const restaurantPoint = new google.maps.LatLng(restaurant.location.lat, restaurant.location.lng);
          
          // Check distance to current segment
          const distance = google.maps.geometry.spherical.computeDistanceBetween(path[i], restaurantPoint);
          if (distance < minDistance) {
            minDistance = distance;
            distanceFromStart = accumulatedDistance + 
              google.maps.geometry.spherical.computeDistanceBetween(path[i-1], restaurantPoint);
          }
          
          accumulatedDistance += pointDistance;
        }

        restaurant.distanceFromStart = distanceFromStart;
      }

      if (options.considerDetour) {
        const distanceMatrixService = new google.maps.DistanceMatrixService();
        const BATCH_SIZE = 5; // Reduced batch size
        
        for (let i = 0; i < allRestaurants.length; i += BATCH_SIZE) {
          const batch = allRestaurants.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (restaurant) => {
              try {
                const { point } = await this.findNearestPointOnRoute(route, restaurant);
                const detourTime = await this.calculateDetourTime(
                  point,
                  restaurant,
                  distanceMatrixService
                );
                restaurant.detourMinutes = detourTime;
              } catch (error) {
                console.error(`Error calculating detour for restaurant ${restaurant.id}:`, error);
                restaurant.detourMinutes = Infinity;
              }
            })
          );
        }

        allRestaurants = allRestaurants.filter(restaurant => 
          restaurant.rating >= options.minRating &&
          restaurant.detourMinutes <= (options.maxDetourMinutes || Infinity)
        );
      } else {
        allRestaurants = allRestaurants.filter(restaurant => 
          restaurant.rating >= options.minRating
        );
      }

      // Replace the final distribution section with:

      // When selecting final restaurants, ensure even distribution based on requested stops
      if (allRestaurants.length > 30) {
        // Use maxStops if specified, otherwise default to 6 sections
        const finalSections = options.maxStops || 6;
        const sectionLength = totalDistance / finalSections;
        const selectedRestaurants: Restaurant[] = [];
        
        for (let i = 0; i < finalSections; i++) {
          const sectionStart = i * sectionLength;
          const sectionEnd = (i + 1) * sectionLength;
          
          // Get restaurants in this section THAT STILL MEET CRITERIA
          const sectionRestaurants = allRestaurants.filter(r => 
            r.distanceFromStart >= sectionStart && 
            r.distanceFromStart < sectionEnd &&
            r.rating >= options.minRating && 
            (!options.considerDetour || r.detourMinutes <= options.maxDetourMinutes)
          );
          
          // Sort by rating and take only top restaurant from each section if maxStops is specified
          sectionRestaurants.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.userRatingCount - a.userRatingCount;
          });
          
          // If maxStops is specified, only take the best restaurant per section
          // Otherwise, take up to 5 restaurants per section
          const restaurantsToTake = options.maxStops ? 1 : 5;
          selectedRestaurants.push(...sectionRestaurants.slice(0, restaurantsToTake));
        }
        
        // If maxStops is specified, limit to that number, otherwise limit to 30
        const limit = options.maxStops || 30;
        allRestaurants = selectedRestaurants.slice(0, limit);

        // Log distribution for debugging
        console.log('Final restaurant distribution:');
        for (let i = 0; i < finalSections; i++) {
          const sectionStart = i * sectionLength;
          const sectionEnd = (i + 1) * sectionLength;
          const count = allRestaurants.filter(r => 
            r.distanceFromStart >= sectionStart && 
            r.distanceFromStart < sectionEnd
          ).length;
          console.log(`Section ${i + 1}: ${count} restaurants (${(sectionStart/1000).toFixed(1)}km - ${(sectionEnd/1000).toFixed(1)}km)`);
        }
      }

      // Final sort by distance
      allRestaurants.sort((a, b) => a.distanceFromStart - b.distanceFromStart);

      // Update message to be more accurate
      const message = `Found ${allRestaurants.length} restaurants${
        options.minRating > 0 ? ` rated ${options.minRating}+ stars` : ''
      }${
        options.considerDetour ? ` within ${options.maxDetourMinutes} minutes of` : ' along'
      } your route${
        options.maxStops ? `, limited to ${options.maxStops} stops` : ''
      }.`;

      return {
        restaurants: allRestaurants,
        message: message
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