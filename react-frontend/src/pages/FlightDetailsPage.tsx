import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { APP_CONSTANTS } from '@/constants/app.constants';


interface Flight {
  _id: string;
  flightNumber: string;
  airline: { name: string; code: string; logo?: string };
  route: {
    departure: { airport: { name: string; code: string; city: string }; scheduledTime: string };
    arrival: { airport: { name: string; code: string; city: string }; scheduledTime: string };
  };
  duration: { scheduled: number };
  distance: number;
  pricing: {
    economy: { 
      totalPrice: number; 
      availability: number;
      basePrice?: number;
      taxes?: number;
      fees?: number;
      baggage?: { included: number };
      restrictions?: { refundable: boolean; changeable: boolean; changeFee?: number };
    };
    premiumEconomy?: { 
      totalPrice: number; 
      availability: number;
      basePrice?: number;
      taxes?: number;
      fees?: number;
      baggage?: { included: number };
      restrictions?: { refundable: boolean; changeable: boolean; changeFee?: number };
    };
    business?: { 
      totalPrice: number; 
      availability: number;
      basePrice?: number;
      taxes?: number;
      fees?: number;
      baggage?: { included: number };
      restrictions?: { refundable: boolean; changeable: boolean; changeFee?: number };
    };
    first?: { 
      totalPrice: number; 
      availability: number;
      basePrice?: number;
      taxes?: number;
      fees?: number;
      baggage?: { included: number };
      restrictions?: { refundable: boolean; changeable: boolean; changeFee?: number };
    };
  };
  aircraft: { type: string; model: string; registration?: string };
  services: {
    wifi?: { available: boolean; price?: number };
    meals?: any[];
    entertainment?: any[];
    powerOutlets?: { available: boolean };
    baggage?: { carryOn?: { included: boolean } };
  };
  status: string;
}

const FlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outbound');
  const [selectedClass, setSelectedClass] = useState<'economy' | 'premiumEconomy' | 'business' | 'first'>('economy');
  const [bookingOption, setBookingOption] = useState<'flight' | 'package'>('flight');
  const [addOns, setAddOns] = useState({ seatUpgrade: false, insurance: false });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = location.state?.searchParams;

  useEffect(() => {
    if (id) {
      loadFlightDetails();
    }
  }, [id]);

  const loadFlightDetails = async () => {
    try {
      const { API_CONFIG, API_ENDPOINTS } = await import('@/config/api.config');
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FLIGHT_DETAILS(id!)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.data?.flight) {
        setFlight(data.data.flight);
        setError(null);
      } else {
        throw new Error('Flight data not found');
      }
    } catch (error) {
      console.error('Failed to load flight details:', error);
      setError('Unable to load flight details. Please try again.');
      setFlight(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 border-4 border-blue-ocean border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-primary-900 mb-3 font-['DM_Sans']">Loading Flight Details</h2>
          <p className="text-base text-primary-600 font-['Poppins'] leading-relaxed">Please wait while we fetch your flight information...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-lg w-full">
          <div className="text-8xl mb-6">✈️</div>
          <h2 className="text-3xl font-bold text-primary-900 mb-4 font-['DM_Sans']">Flight Not Found</h2>
          <p className="text-lg text-primary-600 mb-8 font-['Poppins'] leading-relaxed">The flight you're looking for doesn't exist or has been removed.</p>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium font-['Poppins']">{error}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/flights')} className="flex-1 sm:flex-none px-6 py-3">
              Search Flights
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1 sm:flex-none px-6 py-3">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const calculateTotal = () => {
    const classData = flight?.pricing[selectedClass];
    let total = classData?.totalPrice || 0;
    if (bookingOption === 'package') total += APP_CONSTANTS.ADDON_PRICES.HOTEL_PACKAGE;
    if (addOns.seatUpgrade) total += APP_CONSTANTS.ADDON_PRICES.SEAT_UPGRADE;
    if (addOns.insurance) total += APP_CONSTANTS.ADDON_PRICES.TRAVEL_INSURANCE;
    return total;
  };

  // Get current pricing data for selected class
  const currentPricing = flight?.pricing[selectedClass] || flight?.pricing.economy;
  const currentPrice = calculateTotal();

  const handleBooking = async () => {
    setBookingLoading(true);
    setError(null);
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to booking page
      navigate('/booking', {
        state: {
          type: 'flight',
          flight,
          selectedClass,
          bookingOption,
          addOns,
          total: calculateTotal(),
          searchParams
        }
      });
    } catch (error) {
      setError('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-white">
      {/* Flight Details Header */}
      <section className="bg-gray-50 py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
            <button 
              onClick={() => navigate('/flights')}
              className="flex items-center gap-1 hover:text-blue-ocean transition-colors font-['Poppins']"
            >
              ← Back to Results
            </button>
            <span>•</span>
            <span className="font-['Poppins']">Flight Details</span>
          </div>
          
          <div className="flight-title">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-2 font-['DM_Sans']">
              {flight.route.departure.airport.city} → {flight.route.arrival.airport.city}
            </h1>
            <p className="text-primary-600 font-['Poppins']">
              {flight.airline.name} • {flight.flightNumber} • {formatDate(flight.route.departure.scheduledTime)}
            </p>
          </div>
        </div>
      </section>

      {/* Flight Details Main */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Flight Info */}
            <div className="lg:col-span-2">
              {/* Flight Route */}
              <Card className="p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div className="text-center flex-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                      {formatTime(flight.route.departure.scheduledTime)}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                      {flight.route.departure.airport.code}
                    </div>
                    <div className="text-xs sm:text-sm text-primary-600 font-['Poppins'] leading-tight">
                      {flight.route.departure.airport.name}
                    </div>
                  </div>

                  <div className="flex-1 text-center mx-2 sm:mx-4 lg:mx-8">
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-primary-600 mb-2 sm:mb-3 font-['DM_Sans']">
                      {formatDuration(flight.duration.scheduled)}
                    </div>
                    <div className="relative">
                      <div className="border-t-2 border-primary-300"></div>
                      <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-white px-1 sm:px-2">
                        <span className="text-lg sm:text-2xl text-primary-400">✈️</span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-primary-500 mt-2 sm:mt-3 font-['Poppins']">
                      Nonstop
                    </div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                      {formatTime(flight.route.arrival.scheduledTime)}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                      {flight.route.arrival.airport.code}
                    </div>
                    <div className="text-xs sm:text-sm text-primary-600 font-['Poppins'] leading-tight">
                      {flight.route.arrival.airport.name}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Flight Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('outbound')}
                    className={`flex-1 px-4 sm:px-6 py-4 font-semibold font-['DM_Sans'] transition-colors text-sm sm:text-base min-h-[48px] ${
                      activeTab === 'outbound'
                        ? 'text-blue-ocean border-b-2 border-blue-ocean'
                        : 'text-primary-600 hover:text-blue-ocean'
                    }`}
                  >
                    Outbound Flight
                  </button>
                  <button
                    onClick={() => setActiveTab('return')}
                    className={`flex-1 px-4 sm:px-6 py-4 font-semibold font-['DM_Sans'] transition-colors text-sm sm:text-base min-h-[48px] ${
                      activeTab === 'return'
                        ? 'text-blue-ocean border-b-2 border-blue-ocean'
                        : 'text-primary-600 hover:text-blue-ocean'
                    }`}
                  >
                    Return Flight
                  </button>
                </div>
              </div>
              
              {/* Flight Details */}
              <Card className="p-6">
                {activeTab === 'outbound' ? (
                  <div>
                    {/* Airline Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={flight.airline.logo || APP_CONSTANTS.FALLBACK_IMAGES.AIRLINE}
                        alt={flight.airline.name}
                        className="w-16 h-16 rounded-lg object-contain border shadow-sm bg-white"
                        onError={(e) => {
                          e.currentTarget.src = APP_CONSTANTS.FALLBACK_IMAGES.AIRLINE;
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-primary-900 font-['DM_Sans']">{flight.airline.name}</h3>
                        <p className="text-base text-primary-600 font-['Poppins']">{flight.flightNumber} • {flight.aircraft.type} {flight.aircraft.model}</p>
                        <p className="text-sm text-primary-500 font-['Poppins']">Registration: {flight.aircraft?.registration || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {/* Amenities */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      {flight.services.wifi?.available && (
                        <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">📶</span>
                          <span className="truncate">WiFi {flight.services.wifi.price ? `$${flight.services.wifi.price}` : 'Free'}</span>
                        </div>
                      )}
                      {flight.services.meals && flight.services.meals.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">🍽️</span>
                          <span className="truncate">Meal Included</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-primary-500 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">🍽️</span>
                          <span className="truncate">No Meal</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                        <span className="text-base flex-shrink-0">🧳</span>
                        <span className="truncate">{flight.pricing[selectedClass]?.baggage?.included || 0} Checked Bags</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-ocean font-['Poppins'] cursor-pointer hover:text-emerald p-2 bg-blue-50 rounded-lg transition-colors">
                        <span className="text-base flex-shrink-0">💺</span>
                        <span className="truncate">Choose Your Seat</span>
                      </div>
                    </div>
                    
                    {/* Policies */}
                    <div className="space-y-2 mb-6">
                      <div className={`flex items-center gap-2 text-sm font-['Poppins'] ${
                        currentPricing?.restrictions?.refundable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{currentPricing?.restrictions?.refundable ? '✅' : '❌'}</span>
                        <span>{currentPricing?.restrictions?.refundable ? 'Refundable' : 'Non-refundable'}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-['Poppins'] ${
                        currentPricing?.restrictions?.changeable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{currentPricing?.restrictions?.changeable ? '✅' : '❌'}</span>
                        <span>
                          {currentPricing?.restrictions?.changeable 
                            ? `Changes allowed ${currentPricing?.restrictions?.changeFee ? `($${currentPricing.restrictions.changeFee} fee)` : '(Free)'}` 
                            : 'No changes allowed'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Baggage Info */}
                    <div>
                      <h4 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">Baggage & Fees</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Carry-on</span>
                          <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">{flight.services.baggage?.carryOn?.included ? 'Included' : 'Not Included'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Checked bag</span>
                          <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">
                            {flight.pricing[selectedClass as keyof typeof flight.pricing]?.baggage?.included || 0} included
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Extra bag</span>
                          <span className="text-sm font-semibold text-primary-900 font-['DM_Sans']">$75</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Overweight (51-70lbs)</span>
                          <span className="text-sm font-semibold text-primary-900 font-['DM_Sans']">$100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Return Flight Route */}
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                        <div className="text-center flex-1">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                            {(() => {
                              const returnTime = new Date(flight.route.departure.scheduledTime);
                              returnTime.setDate(returnTime.getDate() + 7); // Simulate return flight
                              returnTime.setHours(15, 15); // 3:15 PM
                              return returnTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                            })()}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                            {flight.route.arrival.airport.code}
                          </div>
                          <div className="text-xs sm:text-sm text-primary-600 font-['Poppins'] leading-tight">
                            {flight.route.arrival.airport.name}
                          </div>
                        </div>

                        <div className="flex-1 text-center mx-2 sm:mx-4 lg:mx-8">
                          <div className="text-sm sm:text-base lg:text-lg font-semibold text-primary-600 mb-2 sm:mb-3 font-['DM_Sans']">
                            {formatDuration(flight.duration.scheduled + 45)} {/* Slightly longer return */}
                          </div>
                          <div className="relative">
                            <div className="border-t-2 border-primary-300"></div>
                            <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-white px-1 sm:px-2">
                              <span className="text-lg sm:text-2xl text-primary-400">✈️</span>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-primary-500 mt-2 sm:mt-3 font-['Poppins']">
                            Nonstop
                          </div>
                        </div>

                        <div className="text-center flex-1">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                            {(() => {
                              const returnTime = new Date(flight.route.departure.scheduledTime);
                              returnTime.setDate(returnTime.getDate() + 7);
                              returnTime.setHours(19, 0); // 7:00 PM
                              return returnTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                            })()}
                          </div>
                          <div className="text-base sm:text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                            {flight.route.departure.airport.code}
                          </div>
                          <div className="text-xs sm:text-sm text-primary-600 font-['Poppins'] leading-tight">
                            {flight.route.departure.airport.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Return Flight Airline Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={flight.airline.logo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=50&h=50&fit=crop'}
                        alt={flight.airline.name}
                        className="w-12 h-12 rounded-lg object-contain border shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=50&h=50&fit=crop';
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-bold text-primary-900 font-['DM_Sans']">{flight.airline.name}</h3>
                        <p className="text-primary-600 font-['Poppins']">{flight.flightNumber.replace(/\d+$/, (match) => String(parseInt(match) + 1))} • {flight.aircraft.type} {flight.aircraft.model}</p>
                      </div>
                    </div>
                    
                    {/* Return Amenities */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                      {flight.services.wifi?.available && (
                        <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">📶</span>
                          <span className="truncate">WiFi {flight.services.wifi.price ? `$${flight.services.wifi.price}` : 'Free'}</span>
                        </div>
                      )}
                      {flight.services.meals && flight.services.meals.length > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">🍽️</span>
                          <span className="truncate">Meal Included</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-primary-500 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                          <span className="text-base flex-shrink-0">🍽️</span>
                          <span className="truncate">No Meal</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins'] p-2 bg-gray-50 rounded-lg">
                        <span className="text-base flex-shrink-0">🧳</span>
                        <span className="truncate">{flight.pricing[selectedClass]?.baggage?.included || 0} Checked Bags</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-ocean font-['Poppins'] cursor-pointer hover:text-emerald p-2 bg-blue-50 rounded-lg transition-colors">
                        <span className="text-base flex-shrink-0">💺</span>
                        <span className="truncate">Choose Return Seat</span>
                      </div>
                    </div>
                    
                    {/* Return Policies */}
                    <div className="space-y-2 mb-6">
                      <div className={`flex items-center gap-2 text-sm font-['Poppins'] ${
                        flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.refundable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.refundable ? '✅' : '❌'}</span>
                        <span>{flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.refundable ? 'Refundable' : 'Non-refundable'}</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-['Poppins'] ${
                        flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.changeable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span>{flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.changeable ? '✅' : '❌'}</span>
                        <span>
                          {flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.changeable 
                            ? `Changes allowed ${flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.changeFee ? `($${flight.pricing[selectedClass as keyof typeof flight.pricing]?.restrictions?.changeFee} fee)` : '(Free)'}` 
                            : 'No changes allowed'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Return Baggage Info */}
                    <div>
                      <h4 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">Baggage & Fees</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Carry-on</span>
                          <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">{flight.services.baggage?.carryOn?.included ? 'Included' : 'Not Included'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Checked bag</span>
                          <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">
                            {flight.pricing[selectedClass as keyof typeof flight.pricing]?.baggage?.included || 0} included
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Extra bag</span>
                          <span className="text-sm font-semibold text-primary-900 font-['DM_Sans']">$75</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-primary-700 font-['Poppins']">Overweight (51-70lbs)</span>
                          <span className="text-sm font-semibold text-primary-900 font-['DM_Sans']">$100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <Card className="p-4 sm:p-6 shadow-lg border-2 border-gray-100 mb-20 lg:mb-0">
                  {/* Flight Summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-primary-900 font-['DM_Sans']">
                          {flight.route.departure.airport.code} → {flight.route.arrival.airport.code}
                        </div>
                        <div className="text-sm text-primary-600 font-['Poppins']">
                          {formatDuration(flight.duration.scheduled)} • {flight.airline.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600 font-['DM_Sans']">
                          ${currentPrice}
                        </div>
                        <div className="text-sm text-primary-500 font-['Poppins']">per person</div>
                      </div>
                    </div>
                  </div>
                {/* Class Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-primary-900 mb-3 font-['DM_Sans']">Select Class</h4>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value as any)}
                    className="w-full p-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_1rem]"
                  >
                    <option value="economy">Economy - ${flight.pricing.economy.totalPrice}</option>
                    {flight.pricing.premiumEconomy && (
                      <option value="premiumEconomy">Premium Economy - ${flight.pricing.premiumEconomy.totalPrice}</option>
                    )}
                    {flight.pricing.business && (
                      <option value="business">Business - ${flight.pricing.business.totalPrice}</option>
                    )}
                    {flight.pricing.first && (
                      <option value="first">First Class - ${flight.pricing.first.totalPrice}</option>
                    )}
                  </select>
                </div>
                
                {/* Price Display */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                  {currentPricing?.basePrice && currentPricing.basePrice > currentPricing.totalPrice && (
                    <div className="text-sm text-primary-500 line-through font-['Poppins'] mb-1">
                      ${currentPricing.basePrice}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-emerald-600 font-['DM_Sans']">
                    ${currentPricing?.totalPrice || 0}
                  </div>
                  {currentPricing?.basePrice && currentPricing.basePrice > currentPricing.totalPrice && (
                    <div className="text-sm text-emerald-600 font-semibold font-['Poppins']">
                      Save ${currentPricing.basePrice - currentPricing.totalPrice}
                    </div>
                  )}
                </div>
                

                
                {/* Booking Options */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="bookingOption"
                        checked={bookingOption === 'flight'} 
                        onChange={() => setBookingOption('flight')}
                        className="text-blue-ocean focus:ring-blue-ocean"
                      />
                      <span className="font-medium text-primary-900 font-['DM_Sans']">Flight Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="bookingOption"
                        checked={bookingOption === 'package'} 
                        onChange={() => setBookingOption('package')}
                        className="text-blue-ocean focus:ring-blue-ocean"
                      />
                      <span className="font-medium text-primary-900 font-['DM_Sans']">+ Hotel</span>
                      <span className="text-xs bg-amber-premium text-white px-2 py-1 rounded font-bold">Save $127</span>
                    </label>
                  </div>
                </div>
                
                {/* Book Button */}
                <button 
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full bg-blue-ocean text-white py-4 px-6 rounded-xl font-bold text-base sm:text-lg font-['DM_Sans'] hover:bg-emerald transition-all duration-300 mb-6 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <div>Book Flight - ${currentPrice}</div>
                      <div className="text-xs sm:text-sm font-normal opacity-90 font-['Poppins']">Secure checkout in 2 minutes</div>
                    </>
                  )}
                </button>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <span className="text-sm flex-shrink-0">⚠️</span>
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                )}
                
                {/* Add-ons */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">Add to your trip</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={addOns.seatUpgrade}
                        onChange={(e) => setAddOns(prev => ({ ...prev, seatUpgrade: e.target.checked }))}
                        className="mt-1 text-blue-ocean focus:ring-blue-ocean"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-primary-900 font-['DM_Sans']">Premium seat (+${APP_CONSTANTS.ADDON_PRICES.SEAT_UPGRADE})</div>
                        <div className="text-sm text-primary-600 font-['Poppins']">Extra legroom & priority boarding</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={addOns.insurance}
                        onChange={(e) => setAddOns(prev => ({ ...prev, insurance: e.target.checked }))}
                        className="mt-1 text-blue-ocean focus:ring-blue-ocean"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-primary-900 font-['DM_Sans']">Travel insurance (+${APP_CONSTANTS.ADDON_PRICES.TRAVEL_INSURANCE})</div>
                        <div className="text-sm text-primary-600 font-['Poppins']">Trip cancellation & medical coverage</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Trust Info */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-primary-600 font-['Poppins']">
                  <div className="flex flex-col items-center gap-1">
                    <span>🛡️</span>
                    <span>Secure booking</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span>⭐</span>
                    <span>4.8/5 rating</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span>📞</span>
                    <span>24/7 support</span>
                  </div>
                </div>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Mobile Summary Bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-primary-900 font-['DM_Sans'] text-base truncate">
                  {flight.route.departure.airport.code} → {flight.route.arrival.airport.code}
                </div>
                <div className="text-sm text-primary-600 font-['Poppins'] truncate">
                  {formatDate(flight.route.departure.scheduledTime).split(',')[0]} • 1 Adult
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-600 font-['DM_Sans']">${currentPrice}</div>
                  <div className="text-xs text-primary-500 font-['Poppins']">per person</div>
                </div>
                <button 
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="bg-blue-ocean text-white px-6 py-3 rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-all duration-300 text-base min-h-[52px] min-w-[120px] touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Booking...</span>
                    </div>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </ErrorBoundary>
  );
};

export default FlightDetailsPage;
