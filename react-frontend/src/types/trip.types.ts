export interface TripData {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  images?: Array<{ url: string; alt?: string }>;
  pricing?: {
    currency?: string;
    estimated?: number;
    discountAmount?: number;
    discountPercent?: number;
    priceRange?: string;
  };
  duration?: { days: number; nights: number };
  stats?: { rating: number; reviewCount: number };
  destinations?: Array<{ name: string }>;
  primaryDestination?: { name: string };
  countries?: Array<{ name: string }>;
  category?: { name: string; icon?: string; color?: string };
  suitableFor?: {
    couples?: boolean;
    families?: boolean;
    soloTravelers?: boolean;
    groups?: boolean;
  };
  travelStyle?: string;
  difficulty?: string;
  tags?: string[];
  customizable?: Record<string, boolean>;
  groupSize?: { min: number; max: number; recommended?: number };
  itinerary?: Array<{
    day: number;
    title?: string;
    description?: string;
    activities?: Array<{ title?: string } | string>;
  }>;
  includedServices?: {
    transport?: string[];
    meals?: string[];
    guides?: boolean;
  };
  includes?: string[];
  excludes?: string[];
  travelInfo?: {
    bestTimeToVisit?: {
      months?: string[];
      weather?: string;
      temperature?: { min: number; max: number };
    };
    localCulture?: {
      language?: string[];
      currency?: string;
    };
    safetyInformation?: {
      level?: string;
    };
  };
  physicalRequirements?: {
    fitnessLevel?: string;
    walkingDistance?: number;
    altitude?: number;
  };
  bookingInfo?: {
    instantBook?: boolean;
    advanceBooking?: number;
    depositRequired?: number;
    finalPaymentDue?: number;
    cancellationPolicy?: string;
  };
  availability?: {
    maxBookings?: number;
    seasonal?: boolean;
  };
  featured?: boolean;
}