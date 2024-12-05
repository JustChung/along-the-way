// src/services/historyService.ts
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../database/firebase';
import { Location, Restaurant } from '../types';

interface SavedRoute {
  id?: string;
  userId: string;
  origin: Location;
  destination: Location;
  stops: Restaurant[];
  timestamp: Timestamp;
  preferences: {
    maxDetourMinutes: number | null;
    numberOfStops: number | null;
    minRating: number;
  };
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Timestamp;
}

interface ChatSession {
  id?: string;
  userId: string;
  routeId?: string;
  messages: ChatMessage[];
  startTime: Timestamp;
  endTime: Timestamp;
}

class HistoryService {
  // Save a route
  // In historyService.ts
// In historyService.ts
async saveRoute(userId: string, routeData: {
    origin: Location;
    destination: Location;
    restaurants: Restaurant[];
    preferences: {
      maxDetourMinutes: number | null;
      stops: number | null;
      rating: number;
    };
  }): Promise<string> {
    try {
      // Helper function to clean restaurant data
      const cleanRestaurant = (restaurant: Restaurant) => {
        // Extract text from LocalizedText objects
        const getName = (name: string | { text: string }) => 
          typeof name === 'object' ? name.text : name;
  
        const getAddress = (address: string | { text: string }) =>
          typeof address === 'object' ? address.text : address;
  
        // Clean and flatten the restaurant structure
        return {
          id: restaurant.id,
          name: getName(restaurant.name),
          location: {
            lat: restaurant.location.lat,
            lng: restaurant.location.lng,
            address: getAddress(restaurant.location.address)
          },
          rating: restaurant.rating || 0,
          userRatingCount: restaurant.userRatingCount || 0,
          priceLevel: restaurant.priceLevel || 0,
          // Only include essential photo data
          photos: restaurant.photos?.map(photo => ({
            name: photo.name,
            width: photo.widthPx,
            height: photo.heightPx
          })) || [],
          // Clean reviews to only include essential data
          reviews: restaurant.reviews?.map(review => ({
            rating: review.rating,
            text: typeof review.text === 'object' ? review.text.text : review.text,
            authorName: review.authorAttribution?.displayName || 'Anonymous',
            publishTime: review.publishTime || '',
            relativeTime: review.relativePublishTimeDescription || ''
          })) || [],
          phoneNumber: restaurant.phoneNumber || '',
          websiteUri: restaurant.websiteUri || '',
          // Simplify opening hours
          isOpenNow: restaurant.regularOpeningHours?.openNow || false,
          // Simplify facilities to boolean values only
          facilities: {
            outdoorSeating: restaurant.facilities?.outdoorSeating || false,
            reservable: restaurant.facilities?.reservable || false,
            wheelchairAccessible: restaurant.facilities?.wheelchairAccessible || false,
            delivery: restaurant.facilities?.delivery || false,
            dineIn: restaurant.facilities?.dineIn || false,
            takeout: restaurant.facilities?.takeout || false
          },
          distanceFromStart: restaurant.distanceFromStart || 0,
          detourMinutes: restaurant.detourMinutes || 0
        };
      };
  
      const cleanedData = {
        userId,
        origin: {
          lat: routeData.origin.lat,
          lng: routeData.origin.lng,
          address: routeData.origin.address
        },
        destination: {
          lat: routeData.destination.lat,
          lng: routeData.destination.lng,
          address: routeData.destination.address
        },
        stops: routeData.restaurants.map(cleanRestaurant),
        timestamp: Timestamp.now(),
        preferences: {
          maxDetourMinutes: routeData.preferences.maxDetourMinutes || null,
          numberOfStops: routeData.preferences.stops || null,
          minRating: routeData.preferences.rating || 0
        }
      };
  
      const routeRef = await addDoc(collection(db, 'routes'), cleanedData);
      return routeRef.id;
    } catch (error) {
      console.error('Error saving route:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to save route');
    }
  }

  // Get user's saved routes
  async getUserRoutes(userId: string): Promise<SavedRoute[]> {
    try {
      const routesQuery = query(
        collection(db, 'routes'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(routesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SavedRoute));
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw new Error('Failed to fetch routes');
    }
  }

  // Save a chat session
  async saveChatSession(userId: string, messages: ChatMessage[], routeId?: string): Promise<string> {
    try {
      const chatRef = await addDoc(collection(db, 'chatSessions'), {
        userId,
        routeId,
        messages,
        startTime: messages[0]?.timestamp || Timestamp.now(),
        endTime: Timestamp.now()
      });
      return chatRef.id;
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw new Error('Failed to save chat session');
    }
  }

  // Get user's chat history
  async getChatHistory(userId: string): Promise<ChatSession[]> {
    try {
      const chatQuery = query(
        collection(db, 'chatSessions'),
        where('userId', '==', userId),
        orderBy('endTime', 'desc')
      );
      
      const querySnapshot = await getDocs(chatQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatSession));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Failed to fetch chat history');
    }
  }
}

export const historyService = new HistoryService();

