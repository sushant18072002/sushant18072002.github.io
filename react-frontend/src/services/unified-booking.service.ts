import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';
import { FlightBooking, HotelBooking, ItineraryBooking } from '@/types/booking.types';

export interface UnifiedBookingData {
  type: 'flight' | 'hotel' | 'itinerary' | 'package';
  itemId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
  };
  bookingDetails: any;
  addOns: Array<{ id: string; name: string; price: number }>;
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardName: string;
  };
  specialRequests?: string;
  totalPrice: number;
}

export const unifiedBookingService = {
  // Create booking for any type (flight, hotel, itinerary, package)
  createBooking: (bookingData: UnifiedBookingData): Promise<ApiResponse<{ booking: any; confirmationId: string }>> => {
    return apiClient.post('/bookings/create', bookingData);
  },

  // Get booking details by ID and type
  getBookingDetails: (id: string, type: string): Promise<ApiResponse<{ booking: any }>> => {
    return apiClient.get(`/bookings/${type}/${id}`);
  },

  // Update booking
  updateBooking: (id: string, updates: Partial<UnifiedBookingData>): Promise<ApiResponse<{ booking: any }>> => {
    return apiClient.patch(`/bookings/${id}`, updates);
  },

  // Cancel booking
  cancelBooking: (id: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post(`/bookings/${id}/cancel`, { reason });
  },

  // Get user's all bookings
  getUserBookings: (userId: string): Promise<ApiResponse<{ bookings: any[] }>> => {
    return apiClient.get(`/bookings/user/${userId}`);
  },

  // Validate booking data before submission
  validateBooking: (bookingData: UnifiedBookingData): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> => {
    return apiClient.post('/bookings/validate', bookingData);
  },

  // Get booking confirmation
  getConfirmation: (confirmationId: string): Promise<ApiResponse<{ booking: any; receipt: any }>> => {
    return apiClient.get(`/bookings/confirmation/${confirmationId}`);
  }
};