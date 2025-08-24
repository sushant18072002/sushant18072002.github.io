import { apiService } from './api';
import { Flight, FlightSearchParams, Airport } from '@/types/api.types';

class FlightService {
  async searchFlights(params: FlightSearchParams) {
    return apiService.getPaginated<Flight>('/flights/search', params);
  }

  async getFlightDetails(id: string) {
    return apiService.get<Flight>(`/flights/${id}`);
  }

  async getFlightSeats(id: string) {
    return apiService.get<any>(`/flights/${id}/seats`);
  }

  async compareFlights(flightIds: string[]) {
    return apiService.post<Flight[]>('/flights/compare', { flightIds });
  }

  async createPriceAlert(alertData: {
    route: {
      from: string;
      to: string;
      departDate: string;
    };
    targetPrice: number;
    email: boolean;
    sms: boolean;
  }) {
    return apiService.post('/flights/price-alerts', alertData);
  }

  async getPriceAlerts() {
    return apiService.get<any[]>('/flights/price-alerts');
  }

  async deletePriceAlert(id: string) {
    return apiService.delete(`/flights/price-alerts/${id}`);
  }

  async getFlexibleSearch(params: {
    from: string;
    to: string;
    departMonth: string;
    duration: number;
  }) {
    return apiService.post<Flight[]>('/flights/flexible-search', params);
  }

  async getMultiCitySearch(segments: Array<{
    from: string;
    to: string;
    date: string;
  }>) {
    return apiService.post<Flight[]>('/flights/multi-city', { segments });
  }

  async getCalendarPrices(params: {
    from: string;
    to: string;
    month: number;
    year: number;
  }) {
    return apiService.get<any>('/flights/calendar-prices', params);
  }

  async holdSeat(flightId: string, seatData: {
    seatNumber: string;
    holdDuration: number;
  }) {
    return apiService.post(`/flights/${flightId}/hold-seat`, seatData);
  }

  async getAirlines() {
    return apiService.get<any[]>('/airlines');
  }

  async searchAirports(query: string) {
    return apiService.get<Airport[]>('/airports/search', { q: query });
  }

  async getFlightFilters(params: {
    from: string;
    to: string;
    date: string;
  }) {
    return apiService.get<any>('/flights/filters', params);
  }

  async getPopularRoutes() {
    return apiService.get<any[]>('/flights/popular-routes');
  }

  async getFlightDeals() {
    return apiService.get<any[]>('/flights/deals');
  }

  async getBaggageInfo(flightId: string) {
    return apiService.get<any>(`/flights/${flightId}/baggage-info`);
  }

  async getMealOptions(flightId: string) {
    return apiService.get<any>(`/flights/${flightId}/meal-options`);
  }
}

export const flightService = new FlightService();