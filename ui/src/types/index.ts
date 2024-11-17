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

export interface LocalizedText {
    text: string;
    languageCode: string;
}
  
export interface Restaurant {
    id: string;
    name: string | LocalizedText;
    location: {
      lat: number;
      lng: number;
      address: string | LocalizedText;
    };
    rating: number;
    priceLevel: number;
    photos?: string[];
    reviews?: any[];
}
  
export interface Review {
    id: string;
    source: 'google' | 'yelp' | 'facebook' | 'tripadvisor';
    rating: number;
    text: string;
    date: string;
}
  