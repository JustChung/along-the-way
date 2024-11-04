// src/types/index.ts
export interface Location {
    lat: number;
    lng: number;
    address: string;
}
  
export interface RoutePreferences {
    maxDetourTime: number;
    numberOfStops: number;
    cuisineTypes?: string[]; // Change to optional array
    establishmentType?: string[]; // Change to optional array
    minRating?: number; // Optional field
    priceLevel?: number[]; // Optional field
    searchRadius?: number; // Optional field
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
  