import { apiService } from './api';
import { API_CONFIG } from '@/config/api.config';
import { Hotel, HotelSearchParams, Review } from '@/types/api.types';

class HotelService {
  async searchHotels(params: HotelSearchParams) {
    return apiService.getPaginated<Hotel>('/hotels', params);
  }

  async getHotelDetails(id: string) {
    return apiService.get<Hotel>(`/hotels/${id}`);
  }

  async getHotelRooms(id: string, params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) {
    return apiService.get<any[]>(`/hotels/${id}/rooms`, params);
  }

  async checkAvailability(id: string, params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) {
    return apiService.get<any>(`/hotels/${id}/availability`, params);
  }

  async getHotelReviews(id: string, params?: {
    page?: number;
    limit?: number;
  }) {
    return apiService.getPaginated<Review>(`/hotels/${id}/reviews`, params);
  }

  async addHotelReview(id: string, reviewData: {
    rating: number;
    title: string;
    content: string;
    ratingBreakdown?: {
      cleanliness: number;
      service: number;
      location: number;
      value: number;
    };
  }) {
    return apiService.post(`/hotels/${id}/reviews`, reviewData);
  }

  async getHotelAmenities(id: string) {
    return apiService.get<string[]>(`/hotels/${id}/amenities`);
  }

  async getHotelPhotos(id: string) {
    return apiService.get<string[]>(`/hotels/${id}/photos`);
  }

  async getNearbyHotels(lat: number, lng: number, radius?: number) {
    return apiService.get<Hotel[]>(`/hotels/nearby/${lat}/${lng}`, { radius });
  }

  async compareHotels(hotelIds: string[]) {
    return apiService.post<Hotel[]>('/hotels/compare', { hotelIds });
  }

  async getHotelDeals() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/hotels/deals`);
    return response.json();
  }

  async createPriceAlert(alertData: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
    targetPrice: number;
    email: boolean;
    sms: boolean;
  }) {
    return apiService.post('/hotels/price-alerts', alertData);
  }

  async getPriceAlerts() {
    return apiService.get<any[]>('/hotels/price-alerts');
  }

  async deletePriceAlert(id: string) {
    return apiService.delete(`/hotels/price-alerts/${id}`);
  }

  async getPopularDestinations() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/hotels/popular-destinations`);
    return response.json();
  }

  async getHotelFilters(params: {
    location: string;
    checkIn: string;
    checkOut: string;
  }) {
    return apiService.get<any>('/hotels/filters', params);
  }

  async searchLocations(query: string) {
    return apiService.get<any[]>('/locations/search', { q: query });
  }
}

export const hotelService = new HotelService();
