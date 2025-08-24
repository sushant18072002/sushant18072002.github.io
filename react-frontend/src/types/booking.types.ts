export interface FlightBooking {
  id: string;
  flightId: string;
  userId: string;
  passengers: Passenger[];
  seatPreferences: string[];
  mealPreferences: string[];
  addOns: AddOn[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  userId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface ItineraryBooking {
  id: string;
  itineraryId: string;
  userId: string;
  travelers: number;
  accommodationPreference: string;
  diningPreferences: string[];
  addOns: AddOn[];
  specialRequests: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  passportNumber?: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}