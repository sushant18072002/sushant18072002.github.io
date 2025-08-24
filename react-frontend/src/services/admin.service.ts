import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  avgRating: number;
  monthlyGrowth: number;
  conversionRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  publishDate: string;
  tags: string[];
  image: string;
}

export const adminService = {
  // Dashboard Stats
  getStats: (): Promise<ApiResponse<AdminStats>> => {
    return apiClient.get('/admin/stats');
  },

  // User Management
  getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ users: User[]; total: number }>> => {
    return apiClient.get('/admin/users', { params });
  },

  updateUserStatus: (userId: string, status: 'active' | 'suspended'): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  updateUserRole: (userId: string, role: 'user' | 'admin'): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  // Content Management
  getFlights: (): Promise<ApiResponse<{ flights: any[] }>> => {
    return apiClient.get('/admin/flights');
  },

  getHotels: (): Promise<ApiResponse<{ hotels: any[] }>> => {
    return apiClient.get('/admin/hotels');
  },

  getPackages: (): Promise<ApiResponse<{ packages: any[] }>> => {
    return apiClient.get('/admin/packages');
  },

  getItineraries: (): Promise<ApiResponse<{ itineraries: any[] }>> => {
    return apiClient.get('/admin/itineraries');
  },

  // Blog Management
  getBlogPosts: (): Promise<ApiResponse<{ posts: BlogPost[] }>> => {
    return apiClient.get('/admin/blog');
  },

  createBlogPost: (post: Omit<BlogPost, 'id'>): Promise<ApiResponse<{ post: BlogPost }>> => {
    return apiClient.post('/admin/blog', post);
  },

  updateBlogPost: (id: string, updates: Partial<BlogPost>): Promise<ApiResponse<{ post: BlogPost }>> => {
    return apiClient.patch(`/admin/blog/${id}`, updates);
  },

  deleteBlogPost: (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/admin/blog/${id}`);
  },

  // Analytics
  getAnalytics: (period: '7d' | '30d' | '90d' | '1y'): Promise<ApiResponse<{ data: any[] }>> => {
    return apiClient.get(`/admin/analytics?period=${period}`);
  }
};