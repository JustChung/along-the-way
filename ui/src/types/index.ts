// src/types/index.ts
export interface Location {
    lat: number;
    lng: number;
    address: string;
}
  
export interface RoutePreferences {
    maxDetourTime: number;
    numberOfStops: number;
    cuisineTypes: string[];
    establishmentType: string[];
}
  
export interface Restaurant {
    id: string;
    name: string;
    location: Location;
    rating: number;
    priceLevel: number;
    cuisineType: string[];
    photos: string[];
    reviews: Review[];
}
  
export interface Review {
    id: string;
    source: 'google' | 'yelp' | 'facebook' | 'tripadvisor';
    rating: number;
    text: string;
    date: string;
}
  