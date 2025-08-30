import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
    economy: { totalPrice: number; availability: number };
    business?: { totalPrice: number; availability: number };
    first?: { totalPrice: number; availability: number };
  };
  aircraft: { type: string; model: string };
  services: {
    wifi?: { available: boolean; price?: number };
    meals?: any[];
    entertainment?: any[];
    powerOutlets?: { available: boolean };
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
  const [selectedClass, setSelectedClass] = useState('economy');
  const [bookingOption, setBookingOption] = useState('flight');
  const [addOns, setAddOns] = useState({ seatUpgrade: false, insurance: false });
  const searchParams = location.state?.searchParams;

  useEffect(() => {
    if (id) {
      loadFlightDetails();
    }
  }, [id]);

  const loadFlightDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/flights/${id}`);
      const data = await response.json();
      if (data.success) {
        setFlight(data.data.flight);
      }
    } catch (error) {
      console.error('Failed to load flight details:', error);
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Flight Not Found</h2>
          <Button onClick={() => navigate('/flights')}>Search Flights</Button>
        </Card>
      </div>
    );
  }

  const calculateTotal = () => {
    let total = flight?.pricing[selectedClass as keyof typeof flight.pricing]?.totalPrice || 0;
    if (bookingOption === 'package') total += 300; // Hotel package
    if (addOns.seatUpgrade) total += 49;
    if (addOns.insurance) total += 29;
    return total;
  };

  return (
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/flights')}>
            ← Back to Search
          </Button>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Flight Info */}
            <div className="lg:col-span-2">
              {/* Flight Route */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                      {formatTime(flight.route.departure.scheduledTime)}
                    </div>
                    <div className="text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                      {flight.route.departure.airport.code}
                    </div>
                    <div className="text-sm text-primary-600 font-['Poppins']">
                      {flight.route.departure.airport.name}
                    </div>
                  </div>

                  <div className="flex-1 text-center mx-4 sm:mx-8">
                    <div className="text-base sm:text-lg font-semibold text-primary-600 mb-3 font-['DM_Sans']">
                      {formatDuration(flight.duration.scheduled)}
                    </div>
                    <div className="relative">
                      <div className="border-t-2 border-primary-300"></div>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2">
                        <span className="text-2xl text-primary-400">✈️</span>
                      </div>
                    </div>
                    <div className="text-sm text-primary-500 mt-3 font-['Poppins']">
                      Nonstop
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-900 mb-1 font-['DM_Sans']">
                      {formatTime(flight.route.arrival.scheduledTime)}
                    </div>
                    <div className="text-lg font-bold text-primary-700 mb-1 font-['DM_Sans']">
                      {flight.route.arrival.airport.code}
                    </div>
                    <div className="text-sm text-primary-600 font-['Poppins']">
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
                    className={`px-6 py-3 font-semibold font-['DM_Sans'] transition-colors ${
                      activeTab === 'outbound'
                        ? 'text-blue-ocean border-b-2 border-blue-ocean'
                        : 'text-primary-600 hover:text-blue-ocean'
                    }`}
                  >
                    Outbound Flight
                  </button>
                  <button
                    onClick={() => setActiveTab('return')}
                    className={`px-6 py-3 font-semibold font-['DM_Sans'] transition-colors ${
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
                {/* Airline Info */}
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
                    <p className="text-primary-600 font-['Poppins']">{flight.flightNumber} • {flight.aircraft.type} {flight.aircraft.model}</p>
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {flight.services.wifi?.available && (
                    <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins']">
                      <span>📶</span>
                      <span>Free WiFi</span>
                    </div>
                  )}
                  {flight.services.meals && flight.services.meals.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins']">
                      <span>🍽️</span>
                      <span>Meal Included</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-primary-700 font-['Poppins']">
                    <span>🧳</span>
                    <span>1 Checked Bag</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-ocean font-['Poppins'] cursor-pointer hover:text-emerald">
                    <span>💺</span>
                    <span>Choose Your Seat</span>
                  </div>
                </div>
                
                {/* Policies */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-600 font-['Poppins']">
                    <span>✅</span>
                    <span>Free cancellation within 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-600 font-['Poppins']">
                    <span>🔄</span>
                    <span>Date changes: $150 + fare difference</span>
                  </div>
                </div>
                
                {/* Baggage Info */}
                <div>
                  <h4 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">Baggage & Fees</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-primary-700 font-['Poppins']">Carry-on (22")</span>
                      <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">Included</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-primary-700 font-['Poppins']">Checked bag (50lbs)</span>
                      <span className="text-sm font-semibold text-green-600 font-['DM_Sans']">Included</span>
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
              </Card>
            </div>

            {/* Aircraft & Services */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Aircraft & Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Aircraft</h4>
                  <p className="text-primary-600">{flight.aircraft.type} {flight.aircraft.model}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Services</h4>
                  <div className="space-y-1 text-sm">
                    {flight.services.wifi?.available && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>WiFi Available {flight.services.wifi.price && `($${flight.services.wifi.price})`}</span>
                      </div>
                    )}
                    {flight.services.powerOutlets?.available && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Power Outlets</span>
                      </div>
                    )}
                    {flight.services.meals && flight.services.meals.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Meals Included</span>
                      </div>
                    )}
                    {flight.services.entertainment && flight.services.entertainment.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Entertainment System</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                {/* Price Display */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                  <div className="text-sm text-primary-500 line-through font-['Poppins']">$699</div>
                  <div className="text-3xl font-bold text-emerald-600 font-['DM_Sans']">${flight.pricing[selectedClass as keyof typeof flight.pricing]?.totalPrice || 0}</div>
                  <div className="text-sm text-emerald-600 font-semibold font-['Poppins']">Save $100</div>
                </div>
                
                {/* Booking Options */}
                <div className="space-y-4 mb-6">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      bookingOption === 'flight' ? 'border-blue-ocean bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setBookingOption('flight')}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={bookingOption === 'flight'} 
                        onChange={() => setBookingOption('flight')}
                        className="text-blue-ocean focus:ring-blue-ocean"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-primary-900 font-['DM_Sans']">Flight Only - ${flight.pricing[selectedClass as keyof typeof flight.pricing]?.totalPrice || 0}</div>
                        <div className="text-sm text-primary-600 font-['Poppins']">Round-trip flight with standard amenities</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                      bookingOption === 'package' ? 'border-blue-ocean bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setBookingOption('package')}
                  >
                    <div className="absolute -top-2 left-4 bg-amber-premium text-white text-xs px-2 py-1 rounded font-bold font-['DM_Sans']">Popular</div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        checked={bookingOption === 'package'} 
                        onChange={() => setBookingOption('package')}
                        className="text-blue-ocean focus:ring-blue-ocean"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-primary-900 font-['DM_Sans']">Flight + Hotel - ${(flight.pricing[selectedClass as keyof typeof flight.pricing]?.totalPrice || 0) + 300}</div>
                        <div className="text-sm text-primary-600 font-['Poppins']">Save $127 • 4-star hotel, 5 nights</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Book Button */}
                <button className="w-full bg-blue-ocean text-white py-4 px-6 rounded-xl font-bold text-lg font-['DM_Sans'] hover:bg-emerald transition-all duration-300 mb-6">
                  <div>Book Flight - ${calculateTotal()}</div>
                  <div className="text-sm font-normal opacity-90 font-['Poppins']">Secure checkout in 2 minutes</div>
                </button>
                
                {/* Add-ons */}
                <div className="mb-6">
                  <h4 className="font-bold text-primary-900 mb-4 font-['DM_Sans']">Add to your trip</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={addOns.seatUpgrade}
                        onChange={(e) => setAddOns(prev => ({ ...prev, seatUpgrade: e.target.checked }))}
                        className="mt-1 text-blue-ocean focus:ring-blue-ocean"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-primary-900 font-['DM_Sans']">Premium seat (+$49)</div>
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
                        <div className="font-semibold text-primary-900 font-['DM_Sans']">Travel insurance (+$29)</div>
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
      </section>
      
      {/* Mobile Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-primary-900 font-['DM_Sans']">
              {flight.route.departure.airport.code} → {flight.route.arrival.airport.code}
            </div>
            <div className="text-sm text-primary-600 font-['Poppins']">
              {formatDate(flight.route.departure.scheduledTime).split(',')[0]} • 1 Adult
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-600 font-['DM_Sans']">${calculateTotal()}</div>
            </div>
            <button className="bg-blue-ocean text-white px-6 py-3 rounded-lg font-bold font-['DM_Sans'] hover:bg-emerald transition-colors">
              Book Now
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsPage;