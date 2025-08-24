import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { flightService } from '@/services/flight.service';
import { Flight, Airport } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useApi from '@/hooks/useApi';

interface FlightSearchForm {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway';
}

const FlightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm, setSearchForm] = useState<FlightSearchForm>({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    departDate: searchParams.get('departDate') || new Date().toISOString().split('T')[0],
    returnDate: searchParams.get('returnDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    passengers: parseInt(searchParams.get('passengers') || '1'),
    class: (searchParams.get('class') as any) || 'economy',
    tripType: (searchParams.get('tripType') as any) || 'roundtrip'
  });
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    maxPrice: 5000,
    airlines: [] as string[],
    stops: 'any',
    sort: 'price'
  });
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [flightDeals, setFlightDeals] = useState([]);

  useEffect(() => {
    loadInitialData();
    if (searchParams.get('autoSearch') === 'true') {
      handleSearch();
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [routesRes, dealsRes] = await Promise.all([
        flightService.getPopularRoutes(),
        flightService.getFlightDeals()
      ]);
      setPopularRoutes(routesRes.data.routes || []);
      setFlightDeals(dealsRes.data.deals || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const searchAirports = async (query: string) => {
    if (query.length < 2) return;
    try {
      const response = await flightService.searchAirports(query);
      setAirports(response.data.airports || []);
    } catch (error) {
      console.error('Error searching airports:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchForm.from || !searchForm.to || !searchForm.departDate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchParams = {
        from: searchForm.from,
        to: searchForm.to,
        departDate: searchForm.departDate,
        returnDate: searchForm.tripType === 'roundtrip' ? searchForm.returnDate : undefined,
        passengers: searchForm.passengers,
        class: searchForm.class,
        maxPrice: filters.maxPrice,
        airlines: filters.airlines.join(','),
        stops: filters.stops === 'any' ? undefined : filters.stops,
        sort: filters.sort
      };

      const response = await flightService.searchFlights(searchParams);
      setFlights(response.data?.flights || []);
      setSearched(true);
    } catch (error: any) {
      console.error('Error searching flights:', error);
      setError(error.message || 'Error searching flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight) => {
    navigate(`/flights/${flight._id}`, { 
      state: { 
        searchParams: searchForm,
        returnFlight: searchForm.tripType === 'roundtrip' 
      }
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <section className="bg-gradient-to-br from-blue-ocean to-emerald py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Flight</h1>
            <p className="text-xl text-white/90">Compare prices from hundreds of airlines</p>
          </div>

          {/* Search Form */}
          <Card className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm" padding="lg">
            {/* Trip Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-primary-100 rounded-lg p-1">
                <button
                  onClick={() => setSearchForm(prev => ({ ...prev, tripType: 'roundtrip' }))}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    searchForm.tripType === 'roundtrip'
                      ? 'bg-white text-blue-ocean shadow-sm'
                      : 'text-primary-600 hover:text-blue-ocean'
                  }`}
                >
                  Round Trip
                </button>
                <button
                  onClick={() => setSearchForm(prev => ({ ...prev, tripType: 'oneway' }))}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    searchForm.tripType === 'oneway'
                      ? 'bg-white text-blue-ocean shadow-sm'
                      : 'text-primary-600 hover:text-blue-ocean'
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From */}
              <div className="relative">
                <label className="block text-sm font-medium text-primary-700 mb-2">From</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.from}
                    onChange={(e) => {
                      setSearchForm(prev => ({ ...prev, from: e.target.value }));
                      searchAirports(e.target.value);
                      setShowFromSuggestions(true);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    placeholder="Departure city or airport"
                  />
                  <div className="absolute left-3 top-3 text-primary-400">
                    ✈️
                  </div>
                </div>
                {showFromSuggestions && airports.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {airports.map((airport) => (
                      <button
                        key={airport._id}
                        onClick={() => {
                          setSearchForm(prev => ({ ...prev, from: airport.code }));
                          setShowFromSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{airport.name}</div>
                          <div className="text-sm text-primary-500">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-sm font-mono text-primary-400">{airport.code}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To */}
              <div className="relative">
                <label className="block text-sm font-medium text-primary-700 mb-2">To</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.to}
                    onChange={(e) => {
                      setSearchForm(prev => ({ ...prev, to: e.target.value }));
                      searchAirports(e.target.value);
                      setShowToSuggestions(true);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    placeholder="Destination city or airport"
                  />
                  <div className="absolute left-3 top-3 text-primary-400">
                    🏁
                  </div>
                </div>
                {showToSuggestions && airports.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {airports.map((airport) => (
                      <button
                        key={airport._id}
                        onClick={() => {
                          setSearchForm(prev => ({ ...prev, to: airport.code }));
                          setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{airport.name}</div>
                          <div className="text-sm text-primary-500">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-sm font-mono text-primary-400">{airport.code}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Departure</label>
                <input
                  type="date"
                  value={searchForm.departDate}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, departDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                />
              </div>

              {/* Return Date */}
              {searchForm.tripType === 'roundtrip' && (
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Return</label>
                  <input
                    type="date"
                    value={searchForm.returnDate}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Passengers</label>
                <select
                  value={searchForm.passengers}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Class</label>
                <select
                  value={searchForm.class}
                  onChange={(e) => setSearchForm(prev => ({ ...prev, class: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  fullWidth
                  className="h-12"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Search Flights'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4 order-2 lg:order-1">
                <Card className="sticky top-4">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Filter Results</h3>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Max Price: {formatPrice(filters.maxPrice)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  {/* Stops */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary-700 mb-2">Stops</label>
                    <div className="space-y-2">
                      {['any', '0', '1', '2+'].map(stop => (
                        <label key={stop} className="flex items-center">
                          <input
                            type="radio"
                            name="stops"
                            value={stop}
                            checked={filters.stops === stop}
                            onChange={(e) => setFilters(prev => ({ ...prev, stops: e.target.value }))}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {stop === 'any' ? 'Any stops' : stop === '0' ? 'Non-stop' : stop === '1' ? '1 stop' : '2+ stops'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary-700 mb-2">Sort by</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg"
                    >
                      <option value="price">Price (Low to High)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="departure">Departure Time</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleSearch}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Apply Filters
                  </Button>
                </Card>
              </div>

              {/* Flight Results */}
              <div className="lg:w-3/4 order-1 lg:order-2">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : error ? (
                  <Card className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">Error Loading Flights</h3>
                    <p className="text-primary-600 mb-4">{error}</p>
                    <Button onClick={handleSearch}>Try Again</Button>
                  </Card>
                ) : flights.length === 0 ? (
                  <Card className="text-center py-12">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No flights found</h3>
                    <p className="text-primary-600">Try adjusting your search criteria or dates</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-primary-900">
                        {flights.length} flights found
                      </h2>
                    </div>

                    {flights.map((flight) => (
                      <Card
                        key={flight._id}
                        hover
                        className="cursor-pointer"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            {/* Airline Logo */}
                            <div className="flex-shrink-0">
                              <img
                                src={flight.airline?.logo || '/api/placeholder/60/40'}
                                alt={flight.airline?.name}
                                className="w-15 h-10 object-contain"
                              />
                            </div>

                            {/* Flight Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-8">
                                {/* Departure */}
                                <div className="text-center">
                                  <div className="text-xl font-bold text-primary-900">
                                    {new Date(flight.route.departure.scheduledTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </div>
                                  <div className="text-sm text-primary-600">
                                    {flight.route.departure.airport?.code}
                                  </div>
                                </div>

                                {/* Flight Path */}
                                <div className="flex-1 flex items-center">
                                  <div className="flex-1 border-t-2 border-primary-200 relative">
                                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-2">
                                      <span className="text-xs text-primary-500">
                                        {formatDuration(flight.duration?.scheduled || 0)}
                                      </span>
                                    </div>
                                    {flight.stops > 0 && (
                                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-400 rounded-full"></div>
                                    )}
                                  </div>
                                </div>

                                {/* Arrival */}
                                <div className="text-center">
                                  <div className="text-xl font-bold text-primary-900">
                                    {new Date(flight.route.arrival.scheduledTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </div>
                                  <div className="text-sm text-primary-600">
                                    {flight.route.arrival.airport?.code}
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-primary-500">
                                <span>{flight.airline?.name}</span>
                                <span>•</span>
                                <span>{flight.aircraft?.model}</span>
                                {flight.stops > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary-900">
                              {formatPrice(flight.pricing[searchForm.class]?.totalPrice || 0)}
                            </div>
                            <div className="text-sm text-primary-600">
                              per person
                            </div>
                            <Button size="sm" className="mt-2">
                              Select
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Routes & Deals */}
      {!searched && (
        <section className="py-12 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Popular Routes */}
            {popularRoutes.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Popular Routes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularRoutes.slice(0, 6).map((route: any, index) => (
                    <Card key={index} hover className="cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-primary-900">
                            {route.fromAirport?.[0]?.city} → {route.toAirport?.[0]?.city}
                          </div>
                          <div className="text-sm text-primary-600">
                            {route.fromAirport?.[0]?.code} - {route.toAirport?.[0]?.code}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary-900">
                            {formatPrice(route.avgPrice)}
                          </div>
                          <div className="text-xs text-primary-500">
                            avg price
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Flight Deals */}
            {flightDeals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Today's Best Deals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {flightDeals.slice(0, 8).map((deal: any) => (
                    <Card key={deal._id} hover className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary-900 mb-1">
                          {deal.route.departure.airport?.city} → {deal.route.arrival.airport?.city}
                        </div>
                        <div className="text-sm text-primary-600 mb-2">
                          {deal.airline?.name}
                        </div>
                        <div className="text-xl font-bold text-emerald mb-2">
                          {formatPrice(deal.pricing.economy.totalPrice)}
                        </div>
                        <div className="text-xs text-primary-500">
                          {new Date(deal.route.departure.scheduledTime).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default FlightsPage;