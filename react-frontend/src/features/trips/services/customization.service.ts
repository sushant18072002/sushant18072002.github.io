import { apiService } from '@/services/api.service';

export interface FlightOption {
  id: string;
  flightNumber: string;
  airline: { name: string; code: string; logo: string };
  departure: {
    airport: { name: string; code: string };
    scheduledTime: string;
    terminal: string;
  };
  arrival: {
    airport: { name: string; code: string };
    scheduledTime: string;
    terminal: string;
  };
  duration: number;
  pricing: { economy: number; business?: number; first?: number };
}

export interface HotelOption {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number; currency: string };
  amenities: string[];
  images: string[];
}

class CustomizationService {
  async getTripFlights(tripId: string, params: {
    departureDate: string;
    returnDate: string;
    passengers: number;
  }) {
    return apiService.get(`/trips/${tripId}/flights`, params);
  }

  async getTripHotels(tripId: string, params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  }) {
    return apiService.get(`/trips/${tripId}/hotels`, params);
  }

  async customizeTrip(tripId: string, customizations: any) {
    return apiService.post(`/trips/${tripId}/customize`, customizations);
  }

  async getTripQuote(quoteData: any) {
    return apiService.post('/trips/quote', quoteData);
  }
}

export const customizationService = new CustomizationService();