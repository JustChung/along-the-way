// src/services/reviews/yelpReviews.ts
import axios from 'axios';
import { Review, Restaurant } from "../../types";

export class YelpReviewService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_YELP_API_KEY || '';
  }

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async getReviews(restaurant: Restaurant): Promise<Review[]> {
    if (!this.isEnabled()) return [];

    try {
      const businessResponse = await axios.get(
        `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          params: {
            latitude: restaurant.location.lat,
            longitude: restaurant.location.lng,
            term: typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name,
            radius: 100,
            limit: 1
          }
        }
      );

      if (!businessResponse.data.businesses?.[0]) {
        return [];
      }

      const businessId = businessResponse.data.businesses[0].id;

      // Then get reviews for that business
      const reviewsResponse = await axios.get(
        `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${businessId}/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!reviewsResponse.data.reviews) {
        return [];
      }

      return reviewsResponse.data.reviews.map(review => ({
        id: review.id,
        source: 'Yelp' as const,
        rating: review.rating,
        text: review.text,
        date: review.time_created,
        authorName: 'Yelp User',
        relativeTime: new Date(review.time_created).toLocaleDateString()
      }));
    } catch (error) {
      console.warn('Error fetching Yelp reviews:', error);
      return [];
    }
  }
}