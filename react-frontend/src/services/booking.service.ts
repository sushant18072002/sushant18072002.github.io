import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'package' | 'itinerary';
  title: string;
  subtitle: string;
  status: 'confirmed' | 'upcoming' | 'completed' | 'cancelled';
  price: number;
  bookingDate: string;
  travelDate: string;
  details: any;
}

export const bookingService = {
  getUserBookings: (): Promise<ApiResponse<{ bookings: Booking[] }>> => {
    return apiClient.get('/bookings');
  },

  getBookingDetails: (id: string): Promise<ApiResponse<{ booking: Booking }>> => {
    return apiClient.get(`/bookings/${id}`);
  },

  cancelBooking: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post(`/bookings/${id}/cancel`);
  },

  createBooking: (bookingData: {
    type: string;
    itemId: string;
    travelers: number;
    personalInfo: any;
    paymentInfo: any;
  }): Promise<ApiResponse<{ booking: Booking }>> => {
    return apiClient.post('/bookings', bookingData);
  }
};