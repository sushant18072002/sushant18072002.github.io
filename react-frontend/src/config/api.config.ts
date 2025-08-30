// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Home
  HOME_FEATURED: '/home/featured',
  HOME_STATS: '/home/stats',
  
  // Locations
  LOCATIONS_SEARCH: '/locations/search',
  
  // Airports
  AIRPORTS_SEARCH: '/airports/search',
  
  // Master Data
  MASTER_COUNTRIES: '/master/admin/countries',
  MASTER_CITIES: '/master/admin/cities',
  MASTER_CATEGORIES: '/master/categories',
  
  // Trips
  TRIPS: '/trips',
  TRIPS_FEATURED: '/trips/featured',
  
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
} as const;

export default API_CONFIG;