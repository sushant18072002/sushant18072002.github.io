import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  };
  status: string;
}

const FlightSearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchFlights();
  }, [searchParams]);

  const searchFlights = async () => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    if (!from || !to) {
      navigate('/flights');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append('departure', from);
      if (to) params.append('arrival', to);
      if (date) params.append('date', date);

      const response = await fetch(`http://localhost:3000/api/flights?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFlights(data.data.flights || []);
      }
    } catch (error) {
      console.error('Failed to search flights:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/flights')}>
            ← Back to Search
          </Button>
          <h1 className="text-2xl font-bold text-primary-900">
            {flights.length} flights found
          </h1>
        </div>

        {flights.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-primary-900 mb-2">No flights found</h3>
            <p className="text-primary-600 mb-4">Try adjusting your search criteria</p>
            <Button onClick={() => navigate('/flights')}>Search Again</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {flights.map(flight => (
              <Card 
                key={flight._id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/flights/${flight._id}`)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  {/* Airline & Flight Info */}
                  <div className="flex items-center gap-4">
                    {flight.airline.logo ? (
                      <img 
                        src={flight.airline.logo} 
                        alt={flight.airline.name} 
                        className="w-12 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=48&h=32&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-8 bg-primary-100 rounded flex items-center justify-center text-xs font-bold">
                        {flight.airline.code}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-primary-900 text-lg">{flight.airline.name}</div>
                      <div className="text-sm text-primary-600">{flight.flightNumber}</div>
                      <div className="text-xs text-primary-500">{flight.distance} km • Direct</div>
                    </div>
                  </div>

                  {/* Route & Time */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-900">
                        {formatTime(flight.route.departure.scheduledTime)}
                      </div>
                      <div className="text-sm font-semibold text-primary-700">{flight.route.departure.airport.code}</div>
                      <div className="text-xs text-primary-500">{flight.route.departure.airport.city}</div>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="text-sm text-primary-600 font-medium">{formatDuration(flight.duration.scheduled)}</div>
                      <div className="border-t border-primary-200 my-2"></div>
                      <div className="text-xs text-primary-500">Direct</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-900">
                        {formatTime(flight.route.arrival.scheduledTime)}
                      </div>
                      <div className="text-sm font-semibold text-primary-700">{flight.route.arrival.airport.code}</div>
                      <div className="text-xs text-primary-500">{flight.route.arrival.airport.city}</div>
                    </div>
                  </div>

                  {/* Price & Availability */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                      ${flight.pricing.economy.totalPrice}
                    </div>
                    <div className="text-sm text-primary-600">per person</div>
                    <div className="text-xs text-primary-500 mt-1">
                      {flight.pricing.economy.availability} seats left
                    </div>
                    {flight.pricing.business && (
                      <div className="text-xs text-primary-500">
                        Business: ${flight.pricing.business.totalPrice}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/flights/${flight._id}`);
                      }}
                    >
                      Select Flight
                    </Button>
                    <div className="text-xs text-center text-primary-500 mt-2">
                      Status: {flight.status}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchResultsPage;