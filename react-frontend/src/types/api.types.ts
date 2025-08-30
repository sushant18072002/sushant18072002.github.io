// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// User Types
export interface User {
  _id?: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  loyaltyPoints?: number;
  role: 'customer' | 'admin';
  status?: string;
  active?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
}

export interface UserProfile {
  avatar?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  travelPreferences: {
    seatPreference?: string;
    mealPreference?: string;
    roomPreference?: string;
  };
}

// Flight Types
export interface Flight {
  _id: string;
  airline?: {
    _id: string;
    code: string;
    name: string;
    logo?: string;
  };
  flightNumber: string;
  aircraft?: {
    model: string;
    configuration?: {
      economy: number;
      business?: number;
      first?: number;
    };
  };
  route: {
    departure: {
      airport?: Airport;
      scheduledTime: string;
      actualTime?: string;
      terminal?: string;
    };
    arrival: {
      airport?: Airport;
      scheduledTime: string;
      actualTime?: string;
      terminal?: string;
    };
  };
  duration?: {
    scheduled: number;
    actual?: number;
  };
  pricing: {
    economy: {
      basePrice: number;
      taxes: number;
      totalPrice: number;
      availability: number;
    };
    business?: {
      basePrice: number;
      taxes: number;
      totalPrice: number;
      availability: number;
    };
    first?: {
      basePrice: number;
      taxes: number;
      totalPrice: number;
      availability: number;
    };
  };
  stops: number;
  status: string;
  services?: {
    baggage?: {
      carryOn: { weight: number; pieces: number };
      checked: { weight: number; pieces: number; fee: number };
    };
    meals?: Array<{
      type: string;
      name: string;
      price: number;
    }>;
  };
  stats?: {
    views: number;
    bookings: number;
  };
}

export interface Airport {
  _id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
  terminal?: string;
}

// Hotel Types
export interface Hotel {
  _id: string;
  name: string;
  chain?: string;
  category?: string;
  hotelCategory?: string;
  description: string;
  shortDescription?: string;
  starRating: number;
  location: {
    destination?: string;
    city?: any;
    country?: any;
    cityName?: string;
    countryName?: string;
    address: {
      street: string;
      area?: string;
      landmark?: string;
      zipCode?: string;
    };
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    distanceFromCenter?: number;
    nearbyAttractions?: (string | {
      name: string;
      distance?: number;
      type?: string;
    })[];
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    checkIn?: string;
    checkOut?: string;
  };
  rooms: HotelRoom[];
  amenities: {
    general?: (string | {
      name: string;
      category?: string;
      available?: boolean;
      fee?: number;
    })[];
    business?: any[];
    recreation?: any[];
    food?: any[];
    connectivity?: any[];
    services?: any[];
    accessibility?: any[];
  };
  policies?: {
    checkIn?: {
      from?: string;
      to?: string;
      minAge?: number;
    };
    checkOut?: {
      from?: string;
      to?: string;
    };
    cancellation?: string | {
      type?: string;
      description?: string;
    };
    children?: {
      allowed?: boolean;
      freeAge?: number;
      extraBedFee?: number;
    };
    pets?: {
      allowed?: boolean;
      fee?: number;
      restrictions?: string;
    };
    smoking?: {
      allowed?: boolean;
      areas?: string[];
    };
  };
  images: {
    url: string;
    alt?: string;
    category?: string;
    isPrimary?: boolean;
    order?: number;
  }[];
  rating: {
    overall: number;
    breakdown?: {
      cleanliness?: number;
      comfort?: number;
      location?: number;
      service?: number;
      value?: number;
      facilities?: number;
    };
    reviewCount: number;
    totalReviews?: number;
  };
  pricing: {
    priceRange: {
      min: number;
      max: number;
      currency?: string;
    };
    averageNightlyRate?: number;
    ratePlans?: any[];
  };
  tags?: string[];
  featured?: boolean;
  verified?: boolean;
  stats?: {
    views?: number;
    bookings?: number;
    favorites?: number;
  };
  status?: string;
  seo?: {
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  popular?: boolean;
  luxury?: boolean;
  deal?: {
    originalPrice: number;
    dealPrice: number;
    discount: number;
    validUntil: string;
  };
}

export interface HotelRoom {
  id: string;
  name: string;
  type: string;
  size?: number;
  maxOccupancy: number;
  bedConfiguration?: {
    singleBeds?: number;
    doubleBeds?: number;
    queenBeds?: number;
    kingBeds?: number;
  };
  amenities: string[];
  images?: {
    url: string;
    alt?: string;
    isPrimary?: boolean;
    order?: number;
  }[];
  pricing: {
    baseRate: number;
    currency?: string;
    taxes?: number;
    fees?: number;
    totalRate: number;
    cancellationPolicy?: {
      type: string;
      deadline?: number;
      fee?: number;
    };
  };
  availability?: {
    date: Date;
    available: number;
    rate: number;
  }[];
  totalRooms: number;
  description?: string;
  capacity?: {
    adults: number;
    children: number;
  };
}

// Package Types
export interface Package {
  id: string;
  title: string;
  description: string;
  images: string[];
  destination: string;
  duration: number;
  category: string;
  difficulty?: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: PackageDay[];
  pricing: {
    basePrice: number;
    currency: string;
    pricePerPerson: boolean;
  };
  availability: {
    startDates: string[];
    maxGroupSize: number;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface PackageDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

// Itinerary Types
export interface Itinerary {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration: number;
  startDate?: string;
  endDate?: string;
  travelers: number;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  days: ItineraryDay[];
  status: 'draft' | 'published' | 'booked';
  isPublic: boolean;
  shareToken?: string;
  createdBy: string;
  tags: string[];
}

export interface ItineraryDay {
  day: number;
  date?: string;
  title: string;
  description: string;
  activities: Activity[];
  accommodation?: {
    name: string;
    type: string;
    price: number;
  };
  transportation?: {
    type: string;
    details: string;
    price: number;
  };
  meals: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  estimatedCost: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: string;
  price: number;
  location: string;
  timeSlot?: string;
  bookingRequired: boolean;
}

// Booking Types
export interface Booking {
  id: string;
  bookingReference: string;
  user: string;
  type: 'flight' | 'hotel' | 'package' | 'activity' | 'combo';
  status: 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  
  flight?: FlightBooking;
  hotel?: HotelBooking;
  package?: PackageBooking;
  activity?: ActivityBooking;
  
  pricing: BookingPricing;
  payment: PaymentInfo;
  contact: ContactInfo;
  
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface FlightBooking {
  flightId: string;
  passengers: Passenger[];
  class: 'economy' | 'business' | 'first';
  seats: string[];
  baggage: {
    checkedBags: number;
    carryOnBags: number;
    extraWeight: number;
  };
}

export interface HotelBooking {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: BookedRoom[];
  totalGuests: {
    adults: number;
    children: number;
    infants: number;
  };
}

export interface PackageBooking {
  packageId: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  customizations: Customization[];
}

export interface ActivityBooking {
  activityId: string;
  date: string;
  timeSlot: string;
  participants: number;
  participantDetails: ParticipantDetail[];
}

export interface Passenger {
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber?: string;
  nationality?: string;
  seatPreference?: string;
  mealPreference?: string;
}

export interface BookedRoom {
  roomType: string;
  roomId: string;
  guests: number;
  guestNames: string[];
  specialRequests?: string;
}

export interface Customization {
  type: string;
  description: string;
  price: number;
}

export interface ParticipantDetail {
  name: string;
  age: number;
  requirements?: string;
}

export interface BookingPricing {
  baseAmount: number;
  taxes: number;
  fees: number;
  discounts: number;
  totalAmount: number;
  currency: string;
  breakdown: PriceBreakdown[];
}

export interface PriceBreakdown {
  description: string;
  amount: number;
  type: 'base' | 'tax' | 'fee' | 'discount' | 'addon';
}

export interface PaymentInfo {
  method: 'card' | 'paypal' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentIntentId?: string;
  paidAmount: number;
  refundAmount: number;
  paymentDate?: string;
  refundDate?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Search Types
export interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
  maxPrice?: number;
  airlines?: string;
  stops?: string;
  sort?: 'price' | 'duration' | 'departure' | 'arrival';
  page?: number;
  limit?: number;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[];
  amenities?: string[];
  sort?: 'price' | 'rating' | 'distance' | 'popularity';
  page?: number;
  limit?: number;
}

export interface PackageSearchParams {
  destination?: string;
  category?: string;
  duration?: number;
  budget?: number;
  startDate?: string;
  travelers?: number;
  difficulty?: string;
  sort?: 'price' | 'rating' | 'duration' | 'popularity';
  page?: number;
  limit?: number;
}

// AI Types
export interface AITripRequest {
  destination?: string;
  duration: number;
  budget: number;
  travelers: number;
  interests: string[];
  travelStyle: string;
  startDate?: string;
  description?: string;
}

export interface AITripResponse {
  id: string;
  options: AITripOption[];
  conversationId?: string;
}

export interface AITripOption {
  id: string;
  title: string;
  description: string;
  itinerary: Itinerary;
  estimatedCost: number;
  confidence: number;
  highlights: string[];
}

// Review Types
export interface Review {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  entityType: 'hotel' | 'flight' | 'package' | 'activity';
  entityId: string;
  rating: number;
  title: string;
  content: string;
  ratingBreakdown?: {
    cleanliness?: number;
    service?: number;
    location?: number;
    value?: number;
  };
  images?: string[];
  helpful: number;
  verified: boolean;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardData {
  overview: {
    totalBookings: number;
    totalSpent: number;
    loyaltyPoints: number;
    upcomingTrips: number;
  };
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  notifications: Notification[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  type: 'destination' | 'package' | 'deal';
  title: string;
  description: string;
  image: string;
  price?: number;
  actionUrl: string;
  priority: number;
}