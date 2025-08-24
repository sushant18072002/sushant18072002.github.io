import { create } from 'zustand';
import { Flight, Hotel, Package, FlightSearchParams, HotelSearchParams, PackageSearchParams } from '@/types/api.types';

interface SearchFilters {
  flights: {
    priceRange: [number, number];
    airlines: string[];
    stops: number[];
    departureTime: string[];
    class: string;
  };
  hotels: {
    priceRange: [number, number];
    starRating: number[];
    amenities: string[];
    location: string;
  };
  packages: {
    priceRange: [number, number];
    duration: [number, number];
    categories: string[];
    difficulty: string[];
  };
}

interface SearchState {
  // Search results
  flights: Flight[];
  hotels: Hotel[];
  packages: Package[];
  
  // Search parameters
  flightParams: FlightSearchParams | null;
  hotelParams: HotelSearchParams | null;
  packageParams: PackageSearchParams | null;
  
  // Filters
  filters: SearchFilters;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    flights: { current: number; total: number; pages: number };
    hotels: { current: number; total: number; pages: number };
    packages: { current: number; total: number; pages: number };
  };
  
  // Actions
  setFlights: (flights: Flight[], pagination?: any) => void;
  setHotels: (hotels: Hotel[], pagination?: any) => void;
  setPackages: (packages: Package[], pagination?: any) => void;
  
  setFlightParams: (params: FlightSearchParams) => void;
  setHotelParams: (params: HotelSearchParams) => void;
  setPackageParams: (params: PackageSearchParams) => void;
  
  updateFilters: (type: 'flights' | 'hotels' | 'packages', filters: Partial<SearchFilters[typeof type]>) => void;
  clearFilters: (type?: 'flights' | 'hotels' | 'packages') => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Search history
  addToSearchHistory: (type: 'flight' | 'hotel' | 'package', params: any) => void;
  getSearchHistory: (type: 'flight' | 'hotel' | 'package') => any[];
  clearSearchHistory: () => void;
}

const initialFilters: SearchFilters = {
  flights: {
    priceRange: [0, 5000],
    airlines: [],
    stops: [],
    departureTime: [],
    class: 'economy',
  },
  hotels: {
    priceRange: [0, 1000],
    starRating: [],
    amenities: [],
    location: '',
  },
  packages: {
    priceRange: [0, 10000],
    duration: [1, 30],
    categories: [],
    difficulty: [],
  },
};

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  flights: [],
  hotels: [],
  packages: [],
  
  flightParams: null,
  hotelParams: null,
  packageParams: null,
  
  filters: initialFilters,
  
  isLoading: false,
  error: null,
  
  pagination: {
    flights: { current: 1, total: 0, pages: 0 },
    hotels: { current: 1, total: 0, pages: 0 },
    packages: { current: 1, total: 0, pages: 0 },
  },

  // Actions
  setFlights: (flights: Flight[], pagination?: any) => {
    set({
      flights,
      pagination: pagination ? {
        ...get().pagination,
        flights: pagination,
      } : get().pagination,
    });
  },

  setHotels: (hotels: Hotel[], pagination?: any) => {
    set({
      hotels,
      pagination: pagination ? {
        ...get().pagination,
        hotels: pagination,
      } : get().pagination,
    });
  },

  setPackages: (packages: Package[], pagination?: any) => {
    set({
      packages,
      pagination: pagination ? {
        ...get().pagination,
        packages: pagination,
      } : get().pagination,
    });
  },

  setFlightParams: (params: FlightSearchParams) => {
    set({ flightParams: params });
  },

  setHotelParams: (params: HotelSearchParams) => {
    set({ hotelParams: params });
  },

  setPackageParams: (params: PackageSearchParams) => {
    set({ packageParams: params });
  },

  updateFilters: (type: 'flights' | 'hotels' | 'packages', newFilters: Partial<SearchFilters[typeof type]>) => {
    set({
      filters: {
        ...get().filters,
        [type]: {
          ...get().filters[type],
          ...newFilters,
        },
      },
    });
  },

  clearFilters: (type?: 'flights' | 'hotels' | 'packages') => {
    if (type) {
      set({
        filters: {
          ...get().filters,
          [type]: initialFilters[type],
        },
      });
    } else {
      set({ filters: initialFilters });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  // Search history management
  addToSearchHistory: (type: 'flight' | 'hotel' | 'package', params: any) => {
    const key = `search_history_${type}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    const newEntry = {
      ...params,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    };
    
    const updated = [newEntry, ...existing.slice(0, 9)]; // Keep last 10 searches
    localStorage.setItem(key, JSON.stringify(updated));
  },

  getSearchHistory: (type: 'flight' | 'hotel' | 'package') => {
    const key = `search_history_${type}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  clearSearchHistory: () => {
    localStorage.removeItem('search_history_flight');
    localStorage.removeItem('search_history_hotel');
    localStorage.removeItem('search_history_package');
  },
}));