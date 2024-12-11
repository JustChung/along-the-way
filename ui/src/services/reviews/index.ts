// src/services/reviews/index.ts
import { Review, Restaurant } from '../../types';
import { GoogleReviewService } from './googleReviews';
import { YelpReviewService } from './yelpReviews';
import { TripAdvisorReviewService } from './tripadvisorReviews';

class ReviewAggregator {
  private services: ReviewSource[];

  constructor() {
    this.services = [
      new GoogleReviewService(),
      new YelpReviewService(),
      new TripAdvisorReviewService()
    ];
  }

  async getAggregatedReviews(restaurant: Restaurant): Promise<Review[]> {
    const enabledServices = this.services.filter(service => service.isEnabled());
    
    const reviewPromises = enabledServices.map(service => 
      service.getReviews(restaurant)
        .catch(error => {
          console.error(`Error fetching reviews from service:`, error);
          return [];
        })
    );

    const reviewArrays = await Promise.all(reviewPromises);
    const allReviews = reviewArrays.flat();

    return allReviews.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getEnabledSources(): string[] {
    return this.services
      .filter(service => service.isEnabled())
      .map(service => service.constructor.name.replace('ReviewService', ''));
  }
}

export const reviewAggregator = new ReviewAggregator();