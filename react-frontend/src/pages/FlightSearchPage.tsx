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
  pricing: {
    economy: { totalPrice: number; availability: number };
    business?: { totalPrice: number; availability: number };
  };
  status: string;
}

const FlightSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForm, setSearchForm] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    passengers: searchParams.get('passengers') || '1',
    class: searchParams.get('class') || 'economy'
  });

  useEffect(() => {
    loadAirports();
    if (searchForm.from && searchForm.to && searchForm.date) {
      searchFlights();
    }
  }, []);

  const loadAirports = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.get('/master/airports');
      if (response.success) {
        setAirports(response.data.airports || []);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    }
  };

  const searchFlights = async () => {
    if (!searchForm.from || !searchForm.to || !searchForm.date) {
      alert('Please fill in all search fields');
      return;
    }

    setLoading(true);
    try {
      const { apiService } = await import('@/services/api');
      const params = new URLSearchParams({
        departure: searchForm.from,
        arrival: searchForm.to,
        date: searchForm.date,
        passengers: searchForm.passengers,
        class: searchForm.class
      });
      
      const response = await apiService.get(`/flights?${params}`);
      if (response.success) {
        setFlights(response.data.flights || []);
      }
    } catch (error) {
      console.error('Failed to search flights:', error);
      alert('Failed to search flights');
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-primary-900 mb-6">Flight Search</h1>
          
          {/* Search Form */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">From</label>
                <select 
                  value={searchForm.from}
                  onChange={(e) => setSearchForm({...searchForm, from: e.target.value})}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md"
                >
                  <option value="">Select Airport</option>
                  {airports.map(airport => (
                    <option key={airport._id} value={airport._id}>
                      {airport.code} - {airport.city}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">To</label>
                <select 
                  value={searchForm.to}
                  onChange={(e) => setSearchForm({...searchForm, to: e.target.value})}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md"
                >
                  <option value="">Select Airport</option>
                  {airports.map(airport => (
                    <option key={airport._id} value={airport._id}>
                      {airport.code} - {airport.city}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Date</label>
                <input 
                  type="date"
                  value={searchForm.date}
                  onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Passengers</label>
                <select 
                  value={searchForm.passengers}
                  onChange={(e) => setSearchForm({...searchForm, passengers: e.target.value})}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md"
                >
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={searchFlights} disabled={loading} className="w-full">
                  {loading ? 'Searching...' : 'Search Flights'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-primary-900">
                {flights.length} flights found
              </h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-primary-300 rounded-md text-sm">
                  <option>Sort by Price</option>
                  <option>Sort by Duration</option>
                  <option>Sort by Departure</option>
                </select>
              </div>
            </div>
            
            {flights.map(flight => (
              <Card key={flight._id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/flights/${flight._id}`)}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  {/* Airline & Flight */}
                  <div className="flex items-center gap-3">
                    {flight.airline.logo ? (
                      <img src={flight.airline.logo} alt={flight.airline.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center text-xs font-bold">
                        {flight.airline.code}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-primary-900">{flight.airline.name}</div>
                      <div className="text-sm text-primary-600">{flight.flightNumber}</div>
                    </div>
                  </div>
                  
                  {/* Route & Time */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-900">
                        {formatTime(flight.route.departure.scheduledTime)}
                      </div>
                      <div className="text-sm text-primary-600">{flight.route.departure.airport.code}</div>
                      <div className="text-xs text-primary-500">{formatDate(flight.route.departure.scheduledTime)}</div>
                    </div>
                    
                    <div className="flex-1 text-center">
                      <div className="text-sm text-primary-600">{formatDuration(flight.duration.scheduled)}</div>
                      <div className="border-t border-primary-200 my-1"></div>
                      <div className="text-xs text-primary-500">Direct</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-900">
                        {formatTime(flight.route.arrival.scheduledTime)}
                      </div>
                      <div className="text-sm text-primary-600">{flight.route.arrival.airport.code}</div>
                      <div className="text-xs text-primary-500">{formatDate(flight.route.arrival.scheduledTime)}</div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald">
                      ${searchForm.class === 'business' && flight.pricing.business 
                        ? flight.pricing.business.totalPrice 
                        : flight.pricing.economy.totalPrice}
                    </div>
                    <div className="text-sm text-primary-600">per person</div>
                    <div className="text-xs text-primary-500">
                      {searchForm.class === 'business' && flight.pricing.business 
                        ? flight.pricing.business.availability 
                        : flight.pricing.economy.availability} seats left
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">No flights found</h3>
            <p className="text-primary-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;