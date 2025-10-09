import { apiService } from '@/services/api.service';
import type { Trip, SearchParams } from '@/core/types';

class TripsService {
  async getTrips(params?: SearchParams) {
    return apiService.get('/trips', params);
  }

  async getFeaturedTrips() {
    return apiService.getFeaturedTrips();
  }

  async getTripById(id: string) {
    return apiService.get(`/trips/${id}`);
  }

  async searchTrips(query: string, filters?: SearchParams) {
    const params = { q: query, ...filters };
    return apiService.get('/trips', params);
  }
}

export const tripsService = new TripsService();