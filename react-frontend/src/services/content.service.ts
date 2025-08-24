import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface ContentItem {
  id: string;
  type: 'flight' | 'hotel' | 'package' | 'itinerary';
  title: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export const contentService = {
  // Flights Management
  getFlights: (): Promise<ApiResponse<{ flights: ContentItem[] }>> => {
    return apiClient.get('/admin/content/flights');
  },

  createFlight: (data: any): Promise<ApiResponse<{ flight: ContentItem }>> => {
    return apiClient.post('/admin/content/flights', data);
  },

  updateFlight: (id: string, data: any): Promise<ApiResponse<{ flight: ContentItem }>> => {
    return apiClient.patch(`/admin/content/flights/${id}`, data);
  },

  deleteFlight: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/admin/content/flights/${id}`);
  },

  // Hotels Management
  getHotels: (): Promise<ApiResponse<{ hotels: ContentItem[] }>> => {
    return apiClient.get('/admin/content/hotels');
  },

  createHotel: (data: any): Promise<ApiResponse<{ hotel: ContentItem }>> => {
    return apiClient.post('/admin/content/hotels', data);
  },

  updateHotel: (id: string, data: any): Promise<ApiResponse<{ hotel: ContentItem }>> => {
    return apiClient.patch(`/admin/content/hotels/${id}`, data);
  },

  deleteHotel: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/admin/content/hotels/${id}`);
  },

  // Packages Management
  getPackages: (): Promise<ApiResponse<{ packages: ContentItem[] }>> => {
    return apiClient.get('/admin/content/packages');
  },

  createPackage: (data: any): Promise<ApiResponse<{ package: ContentItem }>> => {
    return apiClient.post('/admin/content/packages', data);
  },

  updatePackage: (id: string, data: any): Promise<ApiResponse<{ package: ContentItem }>> => {
    return apiClient.patch(`/admin/content/packages/${id}`, data);
  },

  deletePackage: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/admin/content/packages/${id}`);
  },

  // Itineraries Management
  getItineraries: (): Promise<ApiResponse<{ itineraries: ContentItem[] }>> => {
    return apiClient.get('/admin/content/itineraries');
  },

  createItinerary: (data: any): Promise<ApiResponse<{ itinerary: ContentItem }>> => {
    return apiClient.post('/admin/content/itineraries', data);
  },

  updateItinerary: (id: string, data: any): Promise<ApiResponse<{ itinerary: ContentItem }>> => {
    return apiClient.patch(`/admin/content/itineraries/${id}`, data);
  },

  deleteItinerary: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/admin/content/itineraries/${id}`);
  }
};