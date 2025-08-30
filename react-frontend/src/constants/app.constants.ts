// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'TravelAI',
  APP_DESCRIPTION: 'AI-powered travel platform that creates perfect trips from your dreams',
  
  // Default Values
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_COUNTRY: 'US',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Search
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
  
  // Cache
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  // UI
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 4000,
} as const;

// Trip Constants
export const TRIP_CONSTANTS = {
  TYPES: ['featured', 'ai-generated', 'custom', 'user-created'] as const,
  CATEGORIES: ['adventure', 'cultural', 'relaxation', 'city', 'nature', 'food', 'luxury'] as const,
  BUDGET_RANGES: ['budget', 'mid-range', 'luxury'] as const,
  TRAVELER_TYPES: ['solo', 'couple', 'family', 'group'] as const,
  DIFFICULTY_LEVELS: ['easy', 'moderate', 'challenging'] as const,
} as const;

// Form Constants
export const FORM_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_DURATION_DAYS: 1,
  MAX_DURATION_DAYS: 365,
  MIN_PRICE: 0,
  MAX_PRICE: 100000,
} as const;

export default APP_CONSTANTS;