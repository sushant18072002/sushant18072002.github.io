import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'reminder' | 'deal';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export const notificationService = {
  getUserNotifications: (): Promise<ApiResponse<{ notifications: Notification[] }>> => {
    return apiClient.get('/notifications');
  },

  markAsRead: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch('/notifications/read-all');
  },

  sendBookingConfirmation: (bookingId: string, email: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post('/notifications/booking-confirmation', { bookingId, email });
  },

  subscribeToDeals: (email: string, preferences: string[]): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post('/notifications/subscribe-deals', { email, preferences });
  }
};