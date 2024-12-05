// src/services/historyService.ts
import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
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
  route: string;
}

class HistoryService {
  // Helper function to clean any value
  private cleanValue(value: any): any {
    // Handle null
    if (value === null) {
      return null;
    }

    // Handle undefined
    if (value === undefined) {
      return null;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value
        .map(item => this.cleanValue(item))
        .filter(item => item !== null && item !== undefined);
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      const cleaned: { [key: string]: any } = {};
      for (const [key, val] of Object.entries(value)) {
        const cleanedVal = this.cleanValue(val);
        if (cleanedVal !== null && cleanedVal !== undefined) {
          cleaned[key] = cleanedVal;
        }
      }
      return cleaned;
    }

    // Return primitive values as is
    return value;
  }

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
      // Helper function to clean facility data
      const cleanFacilities = (facilities?: {[key: string]: boolean | undefined}) => {
        if (!facilities) return {};
        
        const cleaned: {[key: string]: boolean} = {};
        for (const [key, value] of Object.entries(facilities)) {
          if (typeof value === 'boolean') {
            cleaned[key] = value;
          }
        }
        return cleaned;
      };

      // Helper function to clean restaurant data
      const cleanRestaurant = (restaurant: Restaurant) => {
        const getName = (name: string | { text: string }) => 
          typeof name === 'object' && name !== null ? name.text : name;
  
        const getAddress = (address: string | { text: string }) =>
          typeof address === 'object' && address !== null ? address.text : address;
        
        const cleanedRestaurant = {
          id: restaurant.id || '',
          name: getName(restaurant.name) || '',
          location: {
            lat: restaurant.location?.lat || 0,
            lng: restaurant.location?.lng || 0,
            address: getAddress(restaurant.location?.address) || ''
          },
          rating: restaurant.rating || 0,
          userRatingCount: restaurant.userRatingCount || 0,
          priceLevel: restaurant.priceLevel || 0,
          photos: (restaurant.photos || []).map(photo => ({
            name: photo?.name || '',
            width: photo?.widthPx || 0,
            height: photo?.heightPx || 0
          })),
          reviews: (restaurant.reviews || []).map(review => ({
            rating: review?.rating || 0,
            text: typeof review?.text === 'object' ? review.text.text || '' : review?.text || '',
            authorName: review?.authorAttribution?.displayName || 'Anonymous',
            publishTime: review?.publishTime || '',
            relativeTime: review?.relativePublishTimeDescription || ''
          })),
          phoneNumber: restaurant.phoneNumber || '',
          websiteUri: restaurant.websiteUri || '',
          isOpenNow: restaurant.regularOpeningHours?.openNow || false,
          facilities: cleanFacilities(restaurant.facilities),
          distanceFromStart: restaurant.distanceFromStart || 0,
          detourMinutes: restaurant.detourMinutes || 0
        };

        // Deep clean the entire restaurant object
        return this.cleanValue(cleanedRestaurant);
      };
  
      const cleanedData = {
        userId: userId || '',
        origin: {
          lat: routeData.origin?.lat || 0,
          lng: routeData.origin?.lng || 0,
          address: routeData.origin?.address || ''
        },
        destination: {
          lat: routeData.destination?.lat || 0,
          lng: routeData.destination?.lng || 0,
          address: routeData.destination?.address || ''
        },
        stops: (routeData.restaurants || []).map(cleanRestaurant),
        timestamp: Timestamp.now(),
        preferences: {
          maxDetourMinutes: routeData.preferences?.maxDetourMinutes ?? null,
          numberOfStops: routeData.preferences?.stops ?? null,
          minRating: routeData.preferences?.rating || 0
        }
      };

      // Final deep clean of the entire object
      const finalCleanedData = this.cleanValue(cleanedData);
  
      const routeRef = await addDoc(collection(db, 'routes'), finalCleanedData);
      return routeRef.id;
    } catch (error) {
      console.error('Error saving route:', error);
      throw new Error('Failed to save route');
    }
  }

  async getUserRoutes(userId: string): Promise<SavedRoute[]> {
    try {
      const routesQuery = query(
        collection(db, 'routes'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(routesQuery);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure timestamp is a Firestore Timestamp
          timestamp: data.timestamp instanceof Timestamp ? 
            data.timestamp : 
            Timestamp.fromDate(new Date(data.timestamp))
        } as SavedRoute;
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw new Error('Failed to fetch routes');
    }
  }

  async saveChatSession(userId: string, messages: ChatMessage[], routeDescription: string): Promise<string> {
    try {
      const chatRef = await addDoc(collection(db, 'chatSessions'), {
        userId,
        messages,
        route: routeDescription,
        startTime: messages[0]?.timestamp || Timestamp.now(),
        endTime: Timestamp.now()
      });
      return chatRef.id;
    } catch (error) {
      console.error('Error saving chat session:', error);
      throw new Error('Failed to save chat session');
    }
  }

  async updateChatSession(sessionId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const chatRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(chatRef, {
        messages,
        endTime: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating chat session:', error);
      throw new Error('Failed to update chat session');
    }
  }

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