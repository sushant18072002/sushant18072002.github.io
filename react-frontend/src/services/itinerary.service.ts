import { apiClient } from './api.client';
import { ApiResponse, Itinerary, ItinerarySearchParams } from '@/types/api.types';

export const itineraryService = {
  // Get featured itineraries for hub page
  getFeaturedItineraries: (): Promise<ApiResponse<{ itineraries: Itinerary[] }>> => {
    return apiClient.get('/v1/itineraries/featured');
  },

  // Search itineraries with filters
  searchItineraries: (params: ItinerarySearchParams): Promise<ApiResponse<{ itineraries: Itinerary[] }>> => {
    return apiClient.get('/v1/itineraries/search', { params });
  },

  // Get specific itinerary details
  getItineraryDetails: (id: string): Promise<ApiResponse<{ itinerary: Itinerary }>> => {
    return apiClient.get(`/v1/itineraries/public/${id}`);
  },

  // Get itinerary reviews
  getItineraryReviews: (id: string, params?: { limit?: number; offset?: number }): Promise<ApiResponse<{ reviews: any[] }>> => {
    return apiClient.get(`/v1/itineraries/${id}/reviews`, { params });
  },

  // Book itinerary
  bookItinerary: (id: string, bookingData: any): Promise<ApiResponse<{ booking: any }>> => {
    return apiClient.post(`/v1/itineraries/${id}/book`, bookingData);
  },

  // Save itinerary to favorites
  saveItinerary: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post(`/v1/itineraries/${id}/save`);
  },

  // Get similar itineraries
  getSimilarItineraries: (id: string): Promise<ApiResponse<{ itineraries: Itinerary[] }>> => {
    return apiClient.get(`/v1/itineraries/${id}/similar`);
  }
};