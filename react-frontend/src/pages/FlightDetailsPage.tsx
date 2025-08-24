import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { flightService } from '@/services/flight.service';
import { Flight } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const FlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outbound');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [bookingOption, setBookingOption] = useState('flight');
  const [addOns, setAddOns] = useState({ seatUpgrade: false, insurance: false });

  useEffect(() => {
    if (id) {
      loadFlightDetails();
    }
  }, [id]);

  const loadFlightDetails = async () => {
    try {
      const response = await flightService.getFlightDetails(id!);
      setFlight(response.data.flight);
    } catch (error) {
      console.error('Error loading flight details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateTotal = () => {
    let total = flight?.pricing.economy.totalPrice || 599;
    if (bookingOption === 'package') total = 899;
    if (addOns.seatUpgrade) total += 49;
    if (addOns.insurance) total += 29;
    return total;
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Flight not found</h2>
          <Button onClick={() => navigate('/flights')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/flights')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Results</span>
            </button>
            <span className="text-sm text-primary-500">Flight Details</span>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">
              {flight.route.departure.airport?.city} → {flight.route.arrival.airport?.city}
            </h1>
            <p className="text-primary-600">
              {flight.airline?.name} • {flight.flightNumber} • {new Date(flight.route.departure.scheduledTime).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Flight Info */}
            <div className="lg:col-span-2">
              {/* Flight Route */}
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-900">
                      {flight.route.departure.airport?.code}
                    </div>
                    <div className="text-sm text-primary-600">
                      {flight.route.departure.airport?.name}
                    </div>
                    <div className="text-lg font-semibold text-primary-900 mt-2">
                      {formatTime(flight.route.departure.scheduledTime)}
                    </div>
                  </div>

                  <div className="flex-1 mx-8">
                    <div className="text-center mb-2">
                      <span className="text-sm text-primary-500">
                        {formatDuration(flight.duration?.scheduled || 0)}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="h-0.5 bg-primary-200 relative">
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                          ✈️
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-sm text-primary-500">
                        {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-900">
                      {flight.route.arrival.airport?.code}
                    </div>
                    <div className="text-sm text-primary-600">
                      {flight.route.arrival.airport?.name}
                    </div>
                    <div className="text-lg font-semibold text-primary-900 mt-2">
                      {formatTime(flight.route.arrival.scheduledTime)}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Flight Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab('outbound')}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === 'outbound'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  Outbound Flight
                </button>
                <button
                  onClick={() => setActiveTab('return')}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === 'return'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  Return Flight
                </button>
              </div>

              {/* Flight Details */}
              <Card className="mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={flight.airline?.logo || '/api/placeholder/50/50'}
                    alt={flight.airline?.name}
                    className="w-12 h-12 rounded"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900">
                      {flight.airline?.name}
                    </h3>
                    <p className="text-primary-600">
                      {flight.flightNumber} • {flight.aircraft?.model}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
                    <span>📶</span>
                    <span className="text-sm">Free WiFi</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
                    <span>🍽️</span>
                    <span className="text-sm">Meal Included</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg">
                    <span>🧳</span>
                    <span className="text-sm">1 Checked Bag</span>
                  </div>
                  <button
                    onClick={() => setShowSeatModal(true)}
                    className="flex items-center gap-2 p-3 bg-blue-ocean text-white rounded-lg hover:bg-emerald transition-colors"
                  >
                    <span>💺</span>
                    <span className="text-sm">Choose Seat</span>
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <span>✅</span>
                    <span>Free cancellation within 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <span>🔄</span>
                    <span>Date changes: $150 + fare difference</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-primary-900 mb-3">Baggage & Fees</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded">
                      <span className="text-sm">Carry-on (22")</span>
                      <span className="text-sm font-semibold text-emerald">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded">
                      <span className="text-sm">Checked bag (50lbs)</span>
                      <span className="text-sm font-semibold text-emerald">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded">
                      <span className="text-sm">Extra bag</span>
                      <span className="text-sm font-semibold">$75</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded">
                      <span className="text-sm">Overweight (51-70lbs)</span>
                      <span className="text-sm font-semibold">$100</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Paris Itineraries */}
              <Card>
                <h2 className="text-2xl font-bold text-primary-900 mb-2">
                  Complete your {flight.route.arrival.airport?.city} experience
                </h2>
                <p className="text-primary-600 mb-6">
                  Pre-planned itineraries to make the most of your trip
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'classic', name: 'Classic Paris', duration: '5 Days', price: 299, rating: 4.8, reviews: 1247, image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=180&fit=crop' },
                    { id: 'foodie', name: 'Paris Foodie Experience', duration: '4 Days', price: 399, rating: 4.9, reviews: 892, image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=180&fit=crop', popular: true },
                    { id: 'romantic', name: 'Romantic Paris', duration: '3 Days', price: 449, rating: 4.7, reviews: 634, image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=300&h=180&fit=crop' }
                  ].map((itinerary) => (
                    <div key={itinerary.id} className="relative cursor-pointer group">
                      {itinerary.popular && (
                        <div className="absolute -top-2 left-4 bg-emerald text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                          Most Popular
                        </div>
                      )}
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={itinerary.image}
                          alt={itinerary.name}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-primary-900 text-white px-2 py-1 rounded text-xs font-bold">
                          {itinerary.duration}
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-t-0 rounded-b-lg">
                        <h3 className="font-semibold text-primary-900 mb-2">{itinerary.name}</h3>
                        <div className="text-lg font-bold text-emerald mb-1">From ${itinerary.price}</div>
                        <div className="text-sm text-primary-600">⭐ {itinerary.rating} ({itinerary.reviews.toLocaleString()} reviews)</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="text-center mb-6">
                  <div className="text-sm text-primary-400 line-through">$699</div>
                  <div className="text-3xl font-bold text-primary-900">${flight.pricing.economy.totalPrice}</div>
                  <div className="text-emerald font-semibold">Save $100</div>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-primary-50">
                    <input
                      type="radio"
                      name="booking"
                      value="flight"
                      checked={bookingOption === 'flight'}
                      onChange={(e) => setBookingOption(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-primary-900">Flight Only - ${flight.pricing.economy.totalPrice}</div>
                      <div className="text-sm text-primary-600">Round-trip flight with standard amenities</div>
                    </div>
                  </label>

                  <label className="relative flex items-start gap-3 p-4 border-2 border-emerald rounded-lg cursor-pointer bg-emerald/5">
                    <div className="absolute -top-2 left-4 bg-emerald text-white px-2 py-1 rounded text-xs font-bold">
                      Popular
                    </div>
                    <input
                      type="radio"
                      name="booking"
                      value="package"
                      checked={bookingOption === 'package'}
                      onChange={(e) => setBookingOption(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-primary-900">Flight + Hotel - $899</div>
                      <div className="text-sm text-primary-600">Save $127 • 4-star hotel, 5 nights</div>
                    </div>
                  </label>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-primary-900">Add to your trip</h4>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOns.seatUpgrade}
                      onChange={(e) => setAddOns(prev => ({ ...prev, seatUpgrade: e.target.checked }))}
                      className="accent-blue-ocean"
                    />
                    <div>
                      <div className="text-sm font-semibold">Premium seat (+$49)</div>
                      <div className="text-xs text-primary-600">Extra legroom & priority boarding</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addOns.insurance}
                      onChange={(e) => setAddOns(prev => ({ ...prev, insurance: e.target.checked }))}
                      className="accent-blue-ocean"
                    />
                    <div>
                      <div className="text-sm font-semibold">Travel insurance (+$29)</div>
                      <div className="text-xs text-primary-600">Trip cancellation & medical coverage</div>
                    </div>
                  </label>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate(`/flights/${id}/booking`)}
                  className="mb-4"
                >
                  Book Flight - ${calculateTotal()}
                  <div className="text-xs opacity-90">Secure checkout in 2 minutes</div>
                </Button>

                <div className="space-y-2 text-center text-sm text-primary-600">
                  <div className="flex items-center justify-center gap-2">
                    <span>🛡️</span>
                    <span>Secure booking</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>⭐</span>
                    <span>4.8/5 rating</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span>📞</span>
                    <span>24/7 support</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Seat Selection Modal */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Choose Your Seat</h3>
              <button
                onClick={() => setShowSeatModal(false)}
                className="text-2xl text-primary-400 hover:text-primary-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-4 text-sm text-primary-600 mb-4">
                  <span>NYC → Paris</span>
                  <span>•</span>
                  <span>{flight.flightNumber}</span>
                  <span>•</span>
                  <span>{flight.aircraft?.model}</span>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary-100 border rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary-400 rounded"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-premium rounded"></div>
                    <span>Premium (+$49)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-ocean rounded"></div>
                    <span>Selected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Business Class</h4>
                  <div className="space-y-2">
                    {[1, 2].map(row => (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-sm text-primary-600">{row}</span>
                        <div className="flex gap-1">
                          {['A', 'B'].map(seat => (
                            <button
                              key={`${row}${seat}`}
                              onClick={() => setSelectedSeat(`${row}${seat}`)}
                              className={`w-8 h-8 text-xs rounded ${
                                selectedSeat === `${row}${seat}`
                                  ? 'bg-blue-ocean text-white'
                                  : 'bg-amber-premium text-white hover:bg-amber-premium/80'
                              }`}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                        <div className="w-4"></div>
                        <div className="flex gap-1">
                          {['C', 'D'].map(seat => (
                            <button
                              key={`${row}${seat}`}
                              onClick={() => setSelectedSeat(`${row}${seat}`)}
                              className={`w-8 h-8 text-xs rounded ${
                                selectedSeat === `${row}${seat}`
                                  ? 'bg-blue-ocean text-white'
                                  : 'bg-amber-premium text-white hover:bg-amber-premium/80'
                              }`}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Economy Class</h4>
                  <div className="space-y-2">
                    {[10, 11, 12, 13, 14].map(row => (
                      <div key={row} className="flex items-center gap-2">
                        <span className="w-6 text-sm text-primary-600">{row}</span>
                        <div className="flex gap-1">
                          {['A', 'B', 'C'].map(seat => (
                            <button
                              key={`${row}${seat}`}
                              onClick={() => setSelectedSeat(`${row}${seat}`)}
                              className={`w-8 h-8 text-xs rounded ${
                                selectedSeat === `${row}${seat}`
                                  ? 'bg-blue-ocean text-white'
                                  : Math.random() > 0.7
                                  ? 'bg-primary-400 text-white cursor-not-allowed'
                                  : 'bg-primary-100 border hover:bg-primary-200'
                              }`}
                              disabled={Math.random() > 0.7}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                        <div className="w-4"></div>
                        <div className="flex gap-1">
                          {['D', 'E', 'F'].map(seat => (
                            <button
                              key={`${row}${seat}`}
                              onClick={() => setSelectedSeat(`${row}${seat}`)}
                              className={`w-8 h-8 text-xs rounded ${
                                selectedSeat === `${row}${seat}`
                                  ? 'bg-blue-ocean text-white'
                                  : Math.random() > 0.7
                                  ? 'bg-primary-400 text-white cursor-not-allowed'
                                  : 'bg-primary-100 border hover:bg-primary-200'
                              }`}
                              disabled={Math.random() > 0.7}
                            >
                              {seat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedSeat && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Seat</h4>
                  <div className="flex justify-between items-center">
                    <span>Seat {selectedSeat}</span>
                    <span className="font-semibold">
                      {selectedSeat.includes('1') || selectedSeat.includes('2') ? '+$49' : 'Included'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setShowSeatModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSeatModal(false);
                  if (selectedSeat?.includes('1') || selectedSeat?.includes('2')) {
                    setAddOns(prev => ({ ...prev, seatUpgrade: true }));
                  }
                }}
                disabled={!selectedSeat}
              >
                Confirm Seat Selection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightDetailsPage;