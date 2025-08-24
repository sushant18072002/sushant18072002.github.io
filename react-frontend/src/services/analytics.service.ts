import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  avgOrderValue: number;
  customerLTV: number;
  bounceRate: number;
  sessionDuration: number;
}

export interface RevenueData {
  date: string;
  flights: number;
  hotels: number;
  packages: number;
  total: number;
}

export interface TopDestination {
  name: string;
  bookings: number;
  revenue: number;
  growth: number;
}

export const analyticsService = {
  getDashboardStats: (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<AnalyticsData>> => {
    return apiClient.get(`/analytics/dashboard?period=${period}`);
  },

  getRevenueData: (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<{ data: RevenueData[] }>> => {
    return apiClient.get(`/analytics/revenue?period=${period}`);
  },

  getTopDestinations: (limit: number = 10): Promise<ApiResponse<{ destinations: TopDestination[] }>> => {
    return apiClient.get(`/analytics/destinations?limit=${limit}`);
  },

  getUserBehavior: (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<any>> => {
    return apiClient.get(`/analytics/behavior?period=${period}`);
  },

  getConversionFunnel: (): Promise<ApiResponse<any>> => {
    return apiClient.get('/analytics/funnel');
  }
};