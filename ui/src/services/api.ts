// src/services/api.ts
import axios from 'axios';
import { Location, RoutePreferences } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const api = {

  // https://developers.google.com/maps/documentation/places/web-service/search-along-route
  async getRestaurants(routeData: google.maps.DirectionsResult, origin: Location) {
    console.log(routeData.routes[0].overview_polyline)
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText', 
      {
        "textQuery" : "resturants",
        "searchAlongRouteParameters": {
          "polyline": {
            "encodedPolyline": routeData.routes[0].overview_polyline
          }
        }
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': '*',
        },
      }
    );
    console.log(response);
    return response.data.places.map((place: any) => ({
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
      reviews: place.reviews, // You can fetch reviews separately if needed
    }));
  },
  
  // https://developers.google.com/maps/documentation/directions/get-directions#maps_http_directions_brooklyn_queens_transit-txt
  async getRoute(origin: Location, destination: Location, preferences: RoutePreferences) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: API_KEY,
        alternatives: false,
        // Add any additional parameters based on preferences, like mode of transport
      },
    });
    return response.data;
  },

  async getRestaurantDetails(restaurantId: string) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: restaurantId,
        key: API_KEY,
      },
    });
    const place = response.data.result;
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      photos: place.photos ? place.photos.map((photo: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`) : [],
      reviews: place.reviews || [], // Fetch reviews along with details
    };
  },
};
