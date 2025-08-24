import { create } from 'zustand';
import { Booking } from '@/types/api.types';
import { CreateBookingData } from '@/services/booking.service';

interface BookingState {
  // Current booking in progress
  currentBooking: Partial<CreateBookingData> | null;
  currentStep: number;
  totalSteps: number;
  
  // User bookings
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Booking flow state
  selectedFlight: any | null;
  selectedHotel: any | null;
  selectedPackage: any | null;
  selectedItinerary: any | null;
  
  // Actions
  initializeBooking: (type: 'flight' | 'hotel' | 'package' | 'itinerary', item: any) => void;
  updateBookingData: (data: Partial<CreateBookingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Booking flow helpers
  saveProgress: () => void;
  loadProgress: () => void;
  clearProgress: () => void;
  resetBooking: () => void;
  
  // Selection helpers
  selectFlight: (flight: any) => void;
  selectHotel: (hotel: any) => void;
  selectPackage: (pkg: any) => void;
  selectItinerary: (itinerary: any) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  currentBooking: null,
  currentStep: 1,
  totalSteps: 4,
  
  bookings: [],
  upcomingBookings: [],
  pastBookings: [],
  
  isLoading: false,
  error: null,
  
  selectedFlight: null,
  selectedHotel: null,
  selectedPackage: null,
  selectedItinerary: null,

  // Actions
  initializeBooking: (type: 'flight' | 'hotel' | 'package' | 'itinerary', item: any) => {
    const bookingData: Partial<CreateBookingData> = {
      type: type === 'itinerary' ? 'package' : type, // Map itinerary to package
    };

    // Set type-specific data
    switch (type) {
      case 'flight':
        bookingData.flight = {
          flightId: item.id,
          passengers: [],
          class: 'economy',
        };
        set({ selectedFlight: item });
        break;
      case 'hotel':
        bookingData.hotel = {
          hotelId: item.id,
          checkIn: '',
          checkOut: '',
          rooms: [],
        };
        set({ selectedHotel: item });
        break;
      case 'package':
        bookingData.package = {
          packageId: item.id,
          startDate: '',
          travelers: 1,
        };
        set({ selectedPackage: item });
        break;
      case 'itinerary':
        bookingData.package = {
          packageId: item.id,
          startDate: item.startDate || '',
          travelers: item.travelers || 1,
        };
        set({ selectedItinerary: item });
        break;
    }

    set({
      currentBooking: bookingData,
      currentStep: 1,
      error: null,
    });
  },

  updateBookingData: (data: Partial<CreateBookingData>) => {
    const current = get().currentBooking;
    set({
      currentBooking: current ? { ...current, ...data } : data,
    });
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },

  setStep: (step: number) => {
    const { totalSteps } = get();
    if (step >= 1 && step <= totalSteps) {
      set({ currentStep: step });
    }
  },

  setBookings: (bookings: Booking[]) => {
    const now = new Date();
    const upcoming = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.createdAt) > now
    );
    const past = bookings.filter(b => 
      b.status === 'completed' || new Date(b.createdAt) <= now
    );

    set({
      bookings,
      upcomingBookings: upcoming,
      pastBookings: past,
    });
  },

  addBooking: (booking: Booking) => {
    const bookings = [...get().bookings, booking];
    get().setBookings(bookings);
  },

  updateBooking: (id: string, updates: Partial<Booking>) => {
    const bookings = get().bookings.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    get().setBookings(bookings);
  },

  removeBooking: (id: string) => {
    const bookings = get().bookings.filter(b => b.id !== id);
    get().setBookings(bookings);
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

  // Booking flow helpers
  saveProgress: () => {
    const { currentBooking, currentStep } = get();
    if (currentBooking) {
      localStorage.setItem('booking_progress', JSON.stringify({
        booking: currentBooking,
        step: currentStep,
        timestamp: new Date().toISOString(),
      }));
    }
  },

  loadProgress: () => {
    const saved = localStorage.getItem('booking_progress');
    if (saved) {
      try {
        const { booking, step } = JSON.parse(saved);
        set({
          currentBooking: booking,
          currentStep: step,
        });
      } catch (error) {
        console.error('Failed to load booking progress:', error);
      }
    }
  },

  clearProgress: () => {
    localStorage.removeItem('booking_progress');
  },

  resetBooking: () => {
    set({
      currentBooking: null,
      currentStep: 1,
      selectedFlight: null,
      selectedHotel: null,
      selectedPackage: null,
      selectedItinerary: null,
      error: null,
    });
    get().clearProgress();
  },

  // Selection helpers
  selectFlight: (flight: any) => {
    set({ selectedFlight: flight });
    get().initializeBooking('flight', flight);
  },

  selectHotel: (hotel: any) => {
    set({ selectedHotel: hotel });
    get().initializeBooking('hotel', hotel);
  },

  selectPackage: (pkg: any) => {
    set({ selectedPackage: pkg });
    get().initializeBooking('package', pkg);
  },

  selectItinerary: (itinerary: any) => {
    set({ selectedItinerary: itinerary });
    get().initializeBooking('itinerary', itinerary);
  },
}));