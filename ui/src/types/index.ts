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
  
export interface BusinessHours {
    openNow: boolean;
    periods: {
      open: {
        day: number;
        hour: number;
        minute: number;
      };
      close: {
        day: number;
        hour: number;
        minute: number;
      };
    }[];
    weekdayDescriptions: string[];
  }
  
export interface Restaurant {
    id: string;
    name: string | LocalizedText;
    location: {
      lat: number;
      lng: number;
      address: string | LocalizedText;
      formattedAddress?: string;
      addressComponents?: {
        longText: string;
        shortText: string;
        types: string[];
      }[];
    };
    rating: number;
    userRatingCount?: number;
    priceLevel: number;
    photos?: {
      name: string;
      widthPx: number;
      heightPx: number;
      authorAttributions: {
        displayName: string;
        uri: string;
        photoUri: string;
      }[];
    }[];
    reviews?: {
      name: string;
      rating: number;
      text: LocalizedText;
      authorAttribution: {
        displayName: string;
        uri: string;
        photoUri: string;
      };
      publishTime: string;
      relativePublishTimeDescription: string;
    }[];
    // Additional useful fields
    phoneNumber?: string;
    websiteUri?: string;
    regularOpeningHours?: BusinessHours;
    facilities?: {
      delivery?: boolean;
      dineIn?: boolean;
      takeout?: boolean;
      reservable?: boolean;
      servesBreakfast?: boolean;
      servesLunch?: boolean;
      servesDinner?: boolean;
      servesBeer?: boolean;
      servesWine?: boolean;
      servesBrunch?: boolean;
      servesVegetarianFood?: boolean;
      outdoorSeating?: boolean;
      restroom?: boolean;
      wheelchairAccessible?: boolean;
    };
    priceRange?: {
      startPrice: {
        currencyCode: string;
        units: string;
      };
      endPrice: {
        currencyCode: string;
        units: string;
      };
    };
    distanceFromStart: number;
}
  
export interface Review {
    id: string;
    source: 'google' | 'yelp' | 'facebook' | 'tripadvisor';
    rating: number;
    text: string;
    date: string;
}
  