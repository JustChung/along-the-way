// src/services/reviews/tripadvisorReviews.ts
import axios from 'axios';
import { Review, Restaurant } from '../../types';

export class TripAdvisorReviewService implements ReviewSource {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TRIPADVISOR_API_KEY || '';
  }

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  async getReviews(restaurant: Restaurant): Promise<Review[]> {
    if (!this.isEnabled()) return [];

    try {
      const searchResult = await axios.get('https://cors-anywhere.herokuapp.com/https://travel-advisor.p.rapidapi.com/locations/search', {
        params: {
          query: `${typeof restaurant.name === 'object' ? restaurant.name.text : restaurant.name}`,
          latitude: restaurant.location.lat,
          longitude: restaurant.location.lng
        },
        headers: {
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
          'X-RapidAPI-Key': this.apiKey
        }
      });

      if (!searchResult.data?.data?.[0]?.result_object?.location_id) {
        return [];
      }

      const locationId = searchResult.data.data[0].result_object.location_id;

      const reviewsResponse = await axios.get('https://cors-anywhere.herokuapp.com/https://travel-advisor.p.rapidapi.com/reviews/list', {
        params: {
          location_id: locationId,
          limit: 20
        },
        headers: {
          'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com',
          'X-RapidAPI-Key': this.apiKey
        }
      });

      if (!reviewsResponse.data?.data) {
        return [];
      }

      return reviewsResponse.data.data.map(review => ({
        id: review.review_id || String(review.id),
        source: 'TripAdvisor' as const,
        rating: review.rating || 0,
        text: review.text || '',
        date: review.published_date || review.created,
        authorName: review.user?.username || review.author || 'TripAdvisor User',
        relativeTime: review.relative_time_description || new Date(review.published_date || review.created).toLocaleDateString()
      }));

    } catch (error) {
      console.warn('Error fetching TripAdvisor reviews:', error);
      return [];
    }
  }
}