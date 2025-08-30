import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService, Trip, FlightOption, HotelOption } from '@/services/trip.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TripCustomizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [flightOptions, setFlightOptions] = useState<Array<{ route: string; flights: FlightOption[] }>>([]);
  const [hotelOptions, setHotelOptions] = useState<Array<{ destination: string; hotels: HotelOption[] }>>([]);
  const [selectedFlights, setSelectedFlights] = useState<string[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<Array<{ hotelId: string; nights: number; rooms: number }>>([]);
  const [travelers, setTravelers] = useState({ adults: 2, children: 0 });
  const [travelDates, setTravelDates] = useState({
    departure: '',
    return: ''
  });

  useEffect(() => {
    if (id) {
      loadTripDetails();
    }
  }, [id]);

  const loadTripDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await tripService.getTripDetails(id);
      setTrip(response.trip);
    } catch (error) {
      console.error('Failed to load trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFlightOptions = async () => {
    if (!trip || !travelDates.departure || !travelDates.return) return;

    try {
      const response = await tripService.getTripFlights(trip.id, {
        departureDate: travelDates.departure,
        returnDate: travelDates.return,
        passengers: travelers.adults + travelers.children
      });
      setFlightOptions(response.flightOptions || []);
    } catch (error) {
      console.error('Failed to load flight options:', error);
    }
  };

  const loadHotelOptions = async () => {
    if (!trip || !travelDates.departure || !travelDates.return) return;

    try {
      const response = await tripService.getTripHotels(trip.id, {
        checkIn: travelDates.departure,
        checkOut: travelDates.return,
        guests: travelers.adults + travelers.children
      });
      setHotelOptions(response.hotelOptions || []);
    } catch (error) {
      console.error('Failed to load hotel options:', error);
    }
  };

  const handleGetQuote = async () => {
    if (!trip) return;

    try {
      const response = await tripService.getTripQuote({
        tripId: trip.id,
        selectedFlights: selectedFlights.map(id => ({ flightId: id, class: 'economy' })),
        selectedHotels,
        travelers,
        departureDate: travelDates.departure
      });

      // Navigate to booking with quote
      navigate(`/booking/trip/${trip.id}`, { 
        state: { 
          quote: response.quote,
          customizations: {
            selectedFlights,
            selectedHotels,
            travelers,
            travelDates
          }
        }
      });
    } catch (error) {
      console.error('Failed to get quote:', error);
      alert('Failed to get quote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Trip Not Found</h2>
          <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Travel Details', icon: '📅' },
    { id: 2, title: 'Flights', icon: '✈️' },
    { id: 3, title: 'Hotels', icon: '🏨' },
    { id: 4, title: 'Review', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Customize Your Trip</h1>
              <p className="text-primary-600">{trip.title}</p>
            </div>
            <Button variant="outline" onClick={() => navigate(`/trips/${trip.id}`)}>
              Back to Trip
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      activeStep >= step.id
                        ? 'bg-blue-ocean text-white'
                        : 'bg-primary-200 text-primary-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-semibold ${
                      activeStep >= step.id ? 'text-primary-900' : 'text-primary-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    activeStep > step.id ? 'bg-blue-ocean' : 'bg-primary-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeStep === 1 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Travel Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Departure Date</label>
                  <input
                    type="date"
                    value={travelDates.departure}
                    onChange={(e) => setTravelDates(prev => ({ ...prev, departure: e.target.value }))}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Return Date</label>
                  <input
                    type="date"
                    value={travelDates.return}
                    onChange={(e) => setTravelDates(prev => ({ ...prev, return: e.target.value }))}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Adults</label>
                  <select
                    value={travelers.adults}
                    onChange={(e) => setTravelers(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Children</label>
                  <select
                    value={travelers.children}
                    onChange={(e) => setTravelers(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    {[0,1,2,3,4].map(num => (
                      <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    loadFlightOptions();
                    setActiveStep(2);
                  }}
                  disabled={!travelDates.departure || !travelDates.return}
                >
                  Next: Select Flights
                </Button>
              </div>
            </Card>
          )}

          {activeStep === 2 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Select Flights</h2>
              
              {flightOptions.length === 0 ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="text-primary-600 mt-4">Loading flight options...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {flightOptions.map((route, routeIndex) => (
                    <div key={routeIndex}>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">{route.route}</h3>
                      <div className="space-y-3">
                        {route.flights.slice(0, 3).map((flight) => (
                          <div
                            key={flight.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedFlights.includes(flight.id)
                                ? 'border-blue-ocean bg-blue-50'
                                : 'border-primary-200 hover:border-primary-300'
                            }`}
                            onClick={() => {
                              setSelectedFlights(prev => 
                                prev.includes(flight.id)
                                  ? prev.filter(id => id !== flight.id)
                                  : [...prev, flight.id]
                              );
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold">{flight.airline.name} {flight.flightNumber}</div>
                                <div className="text-sm text-primary-600">
                                  {flight.departure.scheduledTime} - {flight.arrival.scheduledTime}
                                </div>
                                <div className="text-sm text-primary-500">
                                  {flight.departure.airport.name} → {flight.arrival.airport.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald">
                                  ${flight.pricing.economy}
                                </div>
                                <div className="text-sm text-primary-500">per person</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setActiveStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    loadHotelOptions();
                    setActiveStep(3);
                  }}
                >
                  Next: Select Hotels
                </Button>
              </div>
            </Card>
          )}

          {activeStep === 3 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Select Hotels</h2>
              
              {hotelOptions.length === 0 ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" />
                  <p className="text-primary-600 mt-4">Loading hotel options...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {hotelOptions.map((destination, destIndex) => (
                    <div key={destIndex}>
                      <h3 className="text-lg font-semibold text-primary-900 mb-4">{destination.destination}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {destination.hotels.slice(0, 4).map((hotel) => (
                          <div
                            key={hotel.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedHotels.some(h => h.hotelId === hotel.id)
                                ? 'border-blue-ocean bg-blue-50'
                                : 'border-primary-200 hover:border-primary-300'
                            }`}
                            onClick={() => {
                              setSelectedHotels(prev => {
                                const existing = prev.find(h => h.hotelId === hotel.id);
                                if (existing) {
                                  return prev.filter(h => h.hotelId !== hotel.id);
                                } else {
                                  return [...prev, { hotelId: hotel.id, nights: trip.duration.nights, rooms: 1 }];
                                }
                              });
                            }}
                          >
                            <div className="flex gap-4">
                              {hotel.images[0] && (
                                <img
                                  src={hotel.images[0]}
                                  alt={hotel.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-primary-900">{hotel.name}</h4>
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-amber-500">⭐</span>
                                  <span className="text-sm">{hotel.rating}</span>
                                  <span className="text-sm text-primary-500">({hotel.reviewCount} reviews)</span>
                                </div>
                                <div className="text-sm text-primary-600 mb-2">
                                  {hotel.amenities.slice(0, 3).join(', ')}
                                </div>
                                <div className="text-lg font-bold text-emerald">
                                  ${hotel.priceRange.min} - ${hotel.priceRange.max}
                                </div>
                                <div className="text-sm text-primary-500">per night</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setActiveStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setActiveStep(4)}>
                  Review & Get Quote
                </Button>
              </div>
            </Card>
          )}

          {activeStep === 4 && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Review Your Customization</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Travel Details</h3>
                  <p className="text-primary-600">
                    {travelDates.departure} to {travelDates.return} • {travelers.adults} adults, {travelers.children} children
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Selected Flights</h3>
                  <p className="text-primary-600">
                    {selectedFlights.length} flights selected
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Selected Hotels</h3>
                  <p className="text-primary-600">
                    {selectedHotels.length} hotels selected
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setActiveStep(3)}>
                  Back
                </Button>
                <Button onClick={handleGetQuote}>
                  Get Quote & Book
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default TripCustomizationPage;