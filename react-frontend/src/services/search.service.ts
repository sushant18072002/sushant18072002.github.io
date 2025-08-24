import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface SearchResult {
  id: string;
  type: 'flight' | 'hotel' | 'package' | 'itinerary';
  title: string;
  description: string;
  price: number;
  rating?: number;
  image: string;
  location?: string;
  duration?: number;
}

export const searchService = {
  globalSearch: (query: string, filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): Promise<ApiResponse<{ results: SearchResult[] }>> => {
    return apiClient.get('/search', { 
      params: { q: query, ...filters } 
    });
  },

  getSearchSuggestions: (query: string): Promise<ApiResponse<{ suggestions: string[] }>> => {
    return apiClient.get('/search/suggestions', { 
      params: { q: query } 
    });
  },

  getPopularSearches: (): Promise<ApiResponse<{ searches: string[] }>> => {
    return apiClient.get('/search/popular');
  }
};