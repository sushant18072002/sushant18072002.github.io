import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Destination Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800">
        <img
          src={`https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop&auto=format`}
          alt={`${flight.route.arrival.airport.city} destination`}
          className="w-full h-full object-cover opacity-30"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=400&fit=crop&auto=format';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">
              {flight.route.departure.airport.city} → {flight.route.arrival.airport.city}
            </h1>
            <p className="text-xl">
              {flight.airline.name} • {flight.flightNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/flights')}>
            ← Back to Search
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Flight Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Route Card */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Flight Details</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-900 mb-1">
                    {formatTime(flight.route.departure.scheduledTime)}
                  </div>
                  <div className="text-lg font-semibold text-primary-700 mb-1">
                    {flight.route.departure.airport.code}
                  </div>
                  <div className="text-sm text-primary-600">
                    {flight.route.departure.airport.name}
                  </div>
                  <div className="text-sm text-primary-500">
                    {flight.route.departure.airport.city}
                  </div>
                </div>

                <div className="flex-1 text-center mx-8">
                  <div className="text-lg font-semibold text-primary-600 mb-2">
                    {formatDuration(flight.duration.scheduled)}
                  </div>
                  <div className="relative">
                    <div className="border-t-2 border-primary-300"></div>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2">
                      <span className="text-2xl text-primary-400">✈️</span>
                    </div>
                  </div>
                  <div className="text-sm text-primary-500 mt-2">
                    Direct • {flight.distance} km
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-900 mb-1">
                    {formatTime(flight.route.arrival.scheduledTime)}
                  </div>
                  <div className="text-lg font-semibold text-primary-700 mb-1">
                    {flight.route.arrival.airport.code}
                  </div>
                  <div className="text-sm text-primary-600">
                    {flight.route.arrival.airport.name}
                  </div>
                  <div className="text-sm text-primary-500">
                    {flight.route.arrival.airport.city}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-primary-600">
                {formatDate(flight.route.departure.scheduledTime)}
              </div>
            </Card>

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

          {/* Booking Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Select Your Class</h3>
              
              <div className="space-y-4">
                {/* Economy */}
                <div className="border border-primary-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-primary-900">Economy</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ${flight.pricing.economy.totalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-primary-600 mb-3">
                    {flight.pricing.economy.availability} seats available
                  </div>
                  <Button className="w-full">Select Economy</Button>
                </div>

                {/* Business */}
                {flight.pricing.business && (
                  <div className="border border-primary-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-primary-900">Business</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        ${flight.pricing.business.totalPrice}
                      </span>
                    </div>
                    <div className="text-sm text-primary-600 mb-3">
                      {flight.pricing.business.availability} seats available
                    </div>
                    <Button className="w-full">Select Business</Button>
                  </div>
                )}

                {/* First */}
                {flight.pricing.first && (
                  <div className="border border-primary-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-primary-900">First Class</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        ${flight.pricing.first.totalPrice}
                      </span>
                    </div>
                    <div className="text-sm text-primary-600 mb-3">
                      {flight.pricing.first.availability} seats available
                    </div>
                    <Button className="w-full">Select First Class</Button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-primary-200">
                <div className="flex justify-between text-sm text-primary-600">
                  <span>Status:</span>
                  <span className="font-semibold text-green-600">{flight.status}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsPage;