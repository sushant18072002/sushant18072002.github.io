import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';
import { APP_CONSTANTS } from '@/constants/app.constants';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Home API methods
  async getHomeFeatured() {
    return this.get(API_ENDPOINTS.HOME_FEATURED);
  }

  async getHomeStats() {
    return this.get(API_ENDPOINTS.HOME_STATS);
  }

  // Location API methods
  async searchLocations(query: string) {
    return this.get(API_ENDPOINTS.LOCATIONS_SEARCH, { q: query });
  }

  // Airport API methods
  async searchAirports(query: string) {
    return this.get(API_ENDPOINTS.AIRPORTS_SEARCH, { q: query });
  }

  // Trip API methods
  async getFeaturedTrips() {
    return this.get(API_ENDPOINTS.TRIPS_FEATURED);
  }

  async getTrips(params?: Record<string, string>) {
    return this.get(API_ENDPOINTS.TRIPS, params);
  }
}

export const apiService = new ApiService();
export default apiService;