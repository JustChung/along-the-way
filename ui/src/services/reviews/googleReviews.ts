// src/services/reviews/googleReviews.ts
import { Review, Restaurant } from "../../types";

export class GoogleReviewService {
  isEnabled(): boolean {
    return true;
  }

  async getReviews(restaurant: Restaurant): Promise<Review[]> {
    if (!restaurant.reviews) return [];

    return restaurant.reviews.map(review => ({
      id: review.name,
      source: 'Google' as const,
      rating: review.rating,
      text: typeof review.text === 'object' ? review.text.text : review.text,
      date: review.publishTime,
      authorName: review.authorAttribution?.displayName || 'Anonymous',
      relativeTime: review.relativePublishTimeDescription
    }));
  }
}