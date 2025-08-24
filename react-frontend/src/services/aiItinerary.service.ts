import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export const aiItineraryService = {
  // Start AI dream building process
  startDreamBuilding: (data: { dream: string }): Promise<ApiResponse<{ sessionId: string; questions: string[] }>> => {
    return apiClient.post('/ai-itinerary/start', data);
  },

  // Send response to AI conversation
  sendConversationResponse: (sessionId: string, response: string): Promise<ApiResponse<{ message: string; questions?: string[] }>> => {
    return apiClient.post(`/ai-itinerary/${sessionId}/respond`, { response });
  },

  // Generate final itineraries
  generateItineraries: (sessionId: string): Promise<ApiResponse<{ itineraries: any[] }>> => {
    return apiClient.post(`/ai-itinerary/${sessionId}/generate`);
  },

  // Get AI-generated showcase itineraries
  getShowcaseItineraries: (): Promise<ApiResponse<{ itineraries: any[] }>> => {
    return apiClient.get('/ai-itinerary/showcase');
  },

  // Create similar itinerary based on existing one
  createSimilar: (itineraryId: string, preferences: any): Promise<ApiResponse<{ itineraries: any[] }>> => {
    return apiClient.post('/ai-itinerary/similar', { itineraryId, preferences });
  }
};