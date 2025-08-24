import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  featuresEnabled: {
    aiItinerary: boolean;
    customBuilder: boolean;
    packages: boolean;
    blog: boolean;
    reviews: boolean;
  };
  paymentSettings: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    currency: string;
    taxRate: number;
  };
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    fromEmail: string;
    templatesEnabled: boolean;
  };
}

export const configService = {
  getSystemConfig: (): Promise<ApiResponse<{ config: SystemConfig }>> => {
    return apiClient.get('/admin/config');
  },

  updateSystemConfig: (config: Partial<SystemConfig>): Promise<ApiResponse<{ config: SystemConfig }>> => {
    return apiClient.patch('/admin/config', config);
  },

  toggleMaintenanceMode: (enabled: boolean): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.post('/admin/config/maintenance', { enabled });
  },

  updateFeatureFlags: (features: Partial<SystemConfig['featuresEnabled']>): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch('/admin/config/features', features);
  },

  testEmailSettings: (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post('/admin/config/test-email');
  }
};