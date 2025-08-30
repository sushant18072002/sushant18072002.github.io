import { apiService } from './api';

export interface Trip {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  description: string;
  destination?: string;
  primaryDestination?: { _id: string; name: string; country?: string };
  destinations?: string[];
  duration: { days: number; nights: number };
  pricing: {
    currency: string;
    estimated: number;
    breakdown?: {
      flights: number;
      accommodation: number;
      activities: number;
      food: number;
      transport: number;
      other: number;
    };
    priceRange: string;
  };
  category?: { _id: string; name: string; icon: string; color?: string };
  tags: string[];
  travelStyle: string;
  difficulty: string;
  suitableFor: {
    couples: boolean;
    families: boolean;
    soloTravelers: boolean;
    groups: boolean;
  };
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    activities: Array<{
      time: string;
      title: string;
      description: string;
      type: string;
      duration: number;
      included: boolean;
      optional: boolean;
    }>;
  }>;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  customizable?: {
    duration: boolean;
    activities: boolean;
    accommodation: boolean;
    dates: boolean;
    groupSize: boolean;
  };
  stats?: {
    views: number;
    likes: number;
    rating: number;
    reviewCount: number;
  };
  featured: boolean;
  type: string;
}

export interface TripFilters {
  category?: string;
  destination?: string;
  type?: string;
  priceRange?: string;
  duration?: string;
  featured?: boolean;
  search?: string;
}

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
  pricing: {
    economy: number;
    business?: number;
    first?: number;
  };
}

export interface HotelOption {
  id: string;
  name: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  priceRange: { min: number; max: number; currency: string };
  amenities: string[];
  images: string[];
  location: {
    address: string;
    distanceFromCenter: number;
  };
}

export const tripService = {
  // Browse trips
  getTrips: async (filters?: TripFilters): Promise<{ trips: Trip[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await apiService.get(`/trips?${params.toString()}`);
    return response.data;
  },

  // Get featured trips
  getFeaturedTrips: async (): Promise<{ trips: Trip[] }> => {
    const response = await apiService.get('/trips/featured');
    return response.data;
  },

  // Get trip details
  getTripDetails: async (id: string): Promise<{ trip: Trip }> => {
    const response = await apiService.get(`/trips/${id}`);
    return response.data;
  },

  // Search trips
  searchTrips: async (query: string, filters?: TripFilters): Promise<{ trips: Trip[] }> => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const response = await apiService.get(`/trips/search?${params.toString()}`);
    return response.data;
  },

  // Get flight options for trip
  getTripFlights: async (
    tripId: string, 
    options: { departureDate: string; returnDate: string; passengers: number }
  ): Promise<{ flightOptions: Array<{ route: string; flights: FlightOption[] }> }> => {
    const params = new URLSearchParams({
      departureDate: options.departureDate,
      returnDate: options.returnDate,
      passengers: options.passengers.toString()
    });
    
    const response = await apiService.get(`/trips/${tripId}/flights?${params.toString()}`);
    return response.data;
  },

  // Get hotel options for trip
  getTripHotels: async (
    tripId: string,
    options: { checkIn: string; checkOut: string; guests: number; priceRange?: string }
  ): Promise<{ hotelOptions: Array<{ destination: string; hotels: HotelOption[] }> }> => {
    const params = new URLSearchParams({
      checkIn: options.checkIn,
      checkOut: options.checkOut,
      guests: options.guests.toString()
    });
    if (options.priceRange) params.append('priceRange', options.priceRange);
    
    const response = await apiService.get(`/trips/${tripId}/hotels?${params.toString()}`);
    return response.data;
  },

  // Customize trip
  customizeTrip: async (
    tripId: string,
    customizations: {
      selectedFlights?: string[];
      selectedHotels?: Array<{ hotelId: string; nights: number; rooms: number }>;
      selectedActivities?: string[];
      travelers?: { adults: number; children: number };
      specialRequests?: string;
    }
  ) => {
    const response = await apiService.post(`/trips/${tripId}/customize`, customizations);
    return response.data;
  },

  // Get trip quote
  getTripQuote: async (quoteData: {
    tripId: string;
    selectedFlights?: Array<{ flightId: string; class: string }>;
    selectedHotels?: Array<{ hotelId: string; nights: number; rooms: number }>;
    travelers: { adults: number; children: number };
    departureDate: string;
  }) => {
    const response = await apiService.post('/trips/quote', quoteData);
    return response.data;
  }
};