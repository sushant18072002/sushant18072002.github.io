import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface TravelPackage {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  highlights: string[];
  inclusions: string[];
  category: string;
  difficulty?: string;
  bestTime?: string;
}

export const packageService = {
  getFeaturedPackages: (): Promise<ApiResponse<{ packages: TravelPackage[] }>> => {
    return apiClient.get('/packages/featured');
  },

  searchPackages: (params: {
    destination?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    duration?: string;
    rating?: number;
  }): Promise<ApiResponse<{ packages: TravelPackage[] }>> => {
    return apiClient.get('/packages/search', { params });
  },

  getPackageDetails: (id: string): Promise<ApiResponse<{ package: TravelPackage }>> => {
    return apiClient.get(`/packages/${id}`);
  },

  bookPackage: (id: string, bookingData: any): Promise<ApiResponse<{ booking: any }>> => {
    return apiClient.post(`/packages/${id}/book`, bookingData);
  },

  // Admin functions
  getAllPackages: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/packages');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getPackageCategories: (): Promise<ApiResponse<{ categories: any[] }>> => {
    return apiClient.get('/packages/categories');
  }
};