import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';
import { APP_CONSTANTS } from '@/constants/app.constants';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface LocationSearchResponse {
  locations: Array<{
    _id: string;
    name: string;
    country: string;
    type: string;
  }>;
}

interface AirportSearchResponse {
  airports: Array<{
    _id: string;
    code: string;
    name: string;
    city: string;
  }>;
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
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          console.error('Unauthorized - token may be invalid or expired');
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
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
  async searchLocations(query: string): Promise<ApiResponse<LocationSearchResponse>> {
    return this.get<LocationSearchResponse>(API_ENDPOINTS.LOCATIONS_SEARCH, { q: query });
  }

  // Airport API methods
  async searchAirports(query: string): Promise<ApiResponse<AirportSearchResponse>> {
    return this.get<AirportSearchResponse>(API_ENDPOINTS.AIRPORTS_SEARCH, { q: query });
  }

  // Trip API methods
  async getFeaturedTrips() {
    return this.get(API_ENDPOINTS.TRIPS_FEATURED);
  }

  async getTrips(params?: Record<string, string>) {
    return this.get(API_ENDPOINTS.TRIPS, params);
  }

  // Destination API methods
  async getFeaturedDestinations() {
    return this.get(API_ENDPOINTS.DESTINATIONS_FEATURED);
  }

  async getDestinationSpotlight() {
    return this.get(API_ENDPOINTS.DESTINATIONS_SPOTLIGHT);
  }

  // Live stats API method
  async getLiveStats() {
    return this.get('/home/live-stats');
  }
}

export const apiService = new ApiService();
export default apiService;