// src/services/api.ts
import axios from 'axios';
import { Location, RoutePreferences } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const api = {
  async getRestaurants(routeData: google.maps.DirectionsResult, origin: Location) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
      params: {
        location: `${origin.lat},${origin.lng}`,
        radius: 1500, // Adjust radius as needed
        type: 'restaurant',
        key: API_KEY,
      },
    });
    return response.data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.vicinity,
      },
      rating: place.rating || 0,
      priceLevel: place.price_level || 0,
      photos: place.photos ? place.photos.map((photo: any) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`) : [],
      reviews: [], // You can fetch reviews separately if needed
    }));
  },

  async getRoute(origin: Location, destination: Location, preferences: RoutePreferences) {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: API_KEY,
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
