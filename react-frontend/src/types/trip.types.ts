export interface TripData {
  _id: string;
  id?: string;
  title: string;
  slug?: string;
  description?: string;
  images?: Array<{ 
    url: string; 
    alt?: string; 
    isPrimary?: boolean;
    order?: number;
    _id?: string;
  }>;
  pricing?: {
    currency?: string;
    estimated?: number;
    finalPrice?: number;
    basePrice?: number;
    sellPrice?: number;
    discountAmount?: number;
    discountPercent?: number;
    priceRange?: string;
    breakdown?: {
      flights?: number;
      accommodation?: number;
      activities?: number;
      food?: number;
      transport?: number;
      other?: number;
    };
    profitMargin?: number;
    taxIncluded?: boolean;
  };
  duration?: { days: number; nights: number };
  stats?: { 
    rating: number; 
    reviewCount: number;
    views?: number;
    likes?: number;
    copies?: number;
    bookings?: number;
  };
  destinations?: Array<{ _id?: string; name: string }>;
  primaryDestination?: { _id?: string; name: string } | null;
  countries?: Array<{ _id?: string; name: string }>;
  category?: { _id?: string; name: string; icon?: string; color?: string };
  suitableFor?: {
    couples?: boolean;
    families?: boolean;
    soloTravelers?: boolean;
    groups?: boolean;
  };
  travelStyle?: string;
  difficulty?: string;
  tags?: string[];
  highlights?: string[];
  customizable?: {
    duration?: boolean;
    activities?: boolean;
    accommodation?: boolean;
    dates?: boolean;
    groupSize?: boolean;
  };
  groupSize?: { min: number; max: number; recommended?: number };
  itinerary?: Array<{
    _id?: string;
    day: number;
    title?: string;
    description?: string;
    locationName?: string;
    activities?: Array<{
      _id?: string;
      title?: string;
      customTitle?: string;
      description?: string;
      time?: string;
      type?: string;
      duration?: number;
      location?: string;
      estimatedCost?: {
        currency?: string;
        amount?: number;
        perPerson?: boolean;
      };
      included?: boolean;
      optional?: boolean;
    }>;
    tips?: string[];
    estimatedCost?: {
      currency?: string;
      amount?: number;
    };
  }>;
  includedServices?: {
    flights?: string[];
    hotels?: string[];
    activities?: string[];
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
      rainfall?: string;
    };
    visaRequirements?: {
      required?: boolean;
      countries?: string[];
      processingTime?: string;
      cost?: number;
    };
    healthRequirements?: {
      vaccinations?: string[];
      healthInsurance?: boolean;
      medicalFacilities?: string;
    };
    localCulture?: {
      language?: string[];
      currency?: string;
      customs?: string[];
      etiquette?: string[];
    };
    safetyInformation?: {
      level?: string;
      warnings?: string[];
      emergencyContacts?: string[];
    };
    packingList?: {
      essentials?: string[];
      clothing?: string[];
      equipment?: string[];
      optional?: string[];
    };
  };
  physicalRequirements?: {
    fitnessLevel?: string;
    walkingDistance?: number;
    altitude?: number;
    specialNeeds?: string[];
  };
  bookingInfo?: {
    instantBook?: boolean;
    requiresApproval?: boolean;
    advanceBooking?: number;
    depositRequired?: number;
    finalPaymentDue?: number;
    cancellationPolicy?: string;
    paymentTerms?: string;
  };
  availability?: {
    maxBookings?: number;
    seasonal?: boolean;
    startDates?: Date[];
    currentBookings?: Array<{
      date: Date;
      booked: number;
    }>;
    blackoutDates?: Date[];
  };
  sharing?: {
    isPublic?: boolean;
    shareCode?: string;
    allowCopy?: boolean;
    allowComments?: boolean;
  };
  type?: string;
  template?: boolean;
  featured?: boolean;
  quickAccess?: boolean;
  priority?: number;
  status?: string;
  createdBy?: string;
}