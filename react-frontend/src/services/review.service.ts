import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  itemId: string;
  itemType: 'flight' | 'hotel' | 'package' | 'itinerary';
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
  verified: boolean;
}

export const reviewService = {
  getItemReviews: (itemId: string, itemType: string): Promise<ApiResponse<{ reviews: Review[]; stats: any }>> => {
    return apiClient.get(`/reviews/${itemType}/${itemId}`);
  },

  createReview: (review: {
    itemId: string;
    itemType: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<ApiResponse<{ review: Review }>> => {
    return apiClient.post('/reviews', review);
  },

  updateReview: (id: string, updates: Partial<Review>): Promise<ApiResponse<{ review: Review }>> => {
    return apiClient.patch(`/reviews/${id}`, updates);
  },

  markHelpful: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post(`/reviews/${id}/helpful`);
  },

  getUserReviews: (): Promise<ApiResponse<{ reviews: Review[] }>> => {
    return apiClient.get('/reviews/user');
  }
};