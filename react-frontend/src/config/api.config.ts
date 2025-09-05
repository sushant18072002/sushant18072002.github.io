// API Configuration
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Home
  HOME_FEATURED: '/home/featured',
  HOME_STATS: '/home/stats',
  HOME_DESTINATIONS: '/home/destinations',
  
  // Locations
  LOCATIONS_SEARCH: '/locations/search',
  
  // Airports
  AIRPORTS_SEARCH: '/airports/search',
  
  // Flights
  FLIGHTS: '/flights',
  FLIGHTS_SEARCH: '/flights/search',
  FLIGHTS_POPULAR_ROUTES: '/flights/popular-routes',
  FLIGHTS_DEALS: '/flights/deals',
  FLIGHT_DETAILS: (id: string) => `/flights/${id}`,
  
  // Master Data
  MASTER_COUNTRIES: '/master/admin/countries',
  MASTER_CITIES: '/master/admin/cities',
  MASTER_CATEGORIES: '/master/categories',
  
  // Trips
  TRIPS: '/admin/trips',
  TRIPS_FEATURED: '/trips/featured',
  
  // Destinations
  DESTINATIONS_FEATURED: '/destinations/featured',
  DESTINATIONS_SPOTLIGHT: '/destinations/spotlight',
  
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  
  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_CONFIRMATION: '/bookings/confirmation',
  
  // Upload
  UPLOAD_MULTIPLE: '/upload/multiple',
  UPLOAD_DELETE: (filename: string) => `/upload/${filename}`,
} as const;

export default API_CONFIG;