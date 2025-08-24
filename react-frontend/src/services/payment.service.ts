import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export const paymentService = {
  createPaymentIntent: (amount: number, currency = 'usd'): Promise<ApiResponse<{ paymentIntent: PaymentIntent }>> => {
    return apiClient.post('/payments/create-intent', { amount, currency });
  },

  confirmPayment: (paymentIntentId: string, paymentMethodId: string): Promise<ApiResponse<{ success: boolean; transactionId: string }>> => {
    return apiClient.post('/payments/confirm', { paymentIntentId, paymentMethodId });
  },

  savePaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>): Promise<ApiResponse<{ paymentMethod: PaymentMethod }>> => {
    return apiClient.post('/payments/methods', paymentMethod);
  },

  getUserPaymentMethods: (): Promise<ApiResponse<{ paymentMethods: PaymentMethod[] }>> => {
    return apiClient.get('/payments/methods');
  }
};