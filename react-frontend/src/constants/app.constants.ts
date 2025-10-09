// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'TurnTapTravel',
  APP_DESCRIPTION: 'Turn your travel dreams into reality with just a tap',
  LOGO_PATH: '/assets/logo.png',
  LOGO_TEXT_PATH: '/assets/text.png',
  
  // Default Values
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_COUNTRY: 'US',
  
  // Currency Symbols
  CURRENCY_SYMBOLS: {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  } as const,
  
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
  
  // Images
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE_MB: 5,
  FALLBACK_IMAGES: {
    AIRLINE: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=80&h=60&fit=crop&auto=format',
    FLIGHT_HERO: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop&auto=format',
    AIRCRAFT: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop&auto=format'
  },
  
  // Pricing
  ADDON_PRICES: {
    SEAT_UPGRADE: 49,
    TRAVEL_INSURANCE: 29,
    HOTEL_PACKAGE: 300
  }
} as const;

// Trip Constants
export const TRIP_CONSTANTS = {
  TYPES: ['featured', 'ai-generated', 'custom', 'user-created'] as const,
  CATEGORIES: ['adventure', 'cultural', 'relaxation', 'city', 'nature', 'food', 'luxury'] as const,
  BUDGET_RANGES: ['budget', 'mid-range', 'luxury'] as const,
  TRAVELER_TYPES: ['solo', 'couple', 'family', 'group'] as const,
  DIFFICULTY_LEVELS: ['easy', 'moderate', 'challenging'] as const,
} as const;

// Flight Constants
export const FLIGHT_CONSTANTS = {
  CLASSES: ['economy', 'premiumEconomy', 'business', 'first'] as const,
  TRIP_TYPES: ['roundtrip', 'oneway', 'multi'] as const,
  STOPS: ['any', '0', '1', '2+'] as const,
  SORT_OPTIONS: ['price', 'duration', 'departure', 'arrival'] as const,
  MAX_PASSENGERS: 9,
  MIN_PASSENGERS: 1
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

// Helper function to get currency symbol
export const getCurrencySymbol = (currency: string): string => {
  return APP_CONSTANTS.CURRENCY_SYMBOLS[currency as keyof typeof APP_CONSTANTS.CURRENCY_SYMBOLS] || currency;
};

export default APP_CONSTANTS;