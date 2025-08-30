import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { flightService } from '@/services/flight.service';
import { Flight, Airport } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useApi from '@/hooks/useApi';
import { PopularRoutesCards, FlightDealsCards } from '@/components/FlightCards';

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
  const [fromAirports, setFromAirports] = useState<Airport[]>([]);
  const [toAirports, setToAirports] = useState<Airport[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [flightDeals, setFlightDeals] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUrlParameters();
  }, [searchParams]);

  const loadUrlParameters = () => {
    const autoSearch = searchParams.get('autoSearch') === 'true';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const dateParam = searchParams.get('departDate');
    
    console.log('URL Parameters:', { fromParam, toParam, dateParam, autoSearch });
    
    if (fromParam || toParam || dateParam) {
      // Convert codes to city names for display
      const getCodeToCityMap = () => {
        const sampleAirports = [
          { code: 'JFK', city: 'New York' },
          { code: 'CDG', city: 'Paris' },
          { code: 'DXB', city: 'Dubai' },
          { code: 'NRT', city: 'Tokyo' },
          { code: 'LHR', city: 'London' },
          { code: 'LAX', city: 'Los Angeles' }
        ];
        return sampleAirports.reduce((map, airport) => {
          map[airport.code] = airport.city;
          return map;
        }, {});
      };
      
      const codeToCity = getCodeToCityMap();
      const fromCity = codeToCity[fromParam] || fromParam;
      const toCity = codeToCity[toParam] || toParam;
      
      // Create new form data with URL parameters
      const newFormData = {
        ...searchForm,
        from: fromCity || searchForm.from,
        to: toCity || searchForm.to,
        departDate: dateParam || searchForm.departDate,
        passengers: parseInt(searchParams.get('passengers')) || searchForm.passengers,
        class: searchParams.get('class') || searchForm.class
      };
      
      console.log('New form data:', newFormData);
      setSearchForm(newFormData);
      
      if (autoSearch) {
        console.log('Triggering auto search with params:', { from: fromParam, to: toParam });
        // Use the URL parameters directly for search instead of waiting for state update
        performSearch(newFormData);
      }
    }
  };

  const getCityToCodeMap = () => {
    const sampleAirports = [
      { code: 'JFK', city: 'New York' },
      { code: 'CDG', city: 'Paris' },
      { code: 'DXB', city: 'Dubai' },
      { code: 'NRT', city: 'Tokyo' },
      { code: 'LHR', city: 'London' },
      { code: 'LAX', city: 'Los Angeles' }
    ];
    return sampleAirports.reduce((map, airport) => {
      map[airport.city] = airport.code;
      return map;
    }, {});
  };

  const performSearch = async (formData = searchForm) => {
    console.log('performSearch called with:', formData);
    
    if (!formData.from && !formData.to) {
      alert('Please select departure and arrival cities');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cityToCode = getCityToCodeMap();
      const fromCode = cityToCode[formData.from] || formData.from;
      const toCode = cityToCode[formData.to] || formData.to;
      
      const searchData = {
        from: fromCode,
        to: toCode,
        departDate: formData.departDate || undefined,
        returnDate: formData.tripType === 'roundtrip' ? formData.returnDate : undefined,
        passengers: formData.passengers,
        class: formData.class,
        maxPrice: filters.maxPrice,
        airlines: filters.airlines.join(','),
        stops: filters.stops === 'any' ? undefined : filters.stops,
        sort: filters.sort
      };

      console.log('Search data:', searchData);

      const queryParams = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      console.log('Final search query:', queryParams.toString());
      
      const response = await fetch(`http://localhost:3000/api/flights?${queryParams}`);
      const data = await response.json();
      setFlights(data.data?.flights || []);
      setSearched(true);
    } catch (error: any) {
      console.error('Error searching flights:', error);
      setError(error.message || 'Error searching flights. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };



  const loadInitialData = async () => {
    try {
      const [routesRes, dealsRes] = await Promise.all([
        fetch('http://localhost:3000/api/flights/popular-routes').then(r => r.json()),
        fetch('http://localhost:3000/api/flights/deals').then(r => r.json())
      ]);
      setPopularRoutes(routesRes.data?.routes || []);
      setFlightDeals(dealsRes.data?.deals || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const searchAirports = async (query: string, setAirportsFunc: any) => {
    if (query.length < 2) {
      setAirportsFunc([]);
      return;
    }
    
    const sampleAirports = [
      { _id: '1', code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
      { _id: '2', code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
      { _id: '3', code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
      { _id: '4', code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
      { _id: '5', code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'UK' },
      { _id: '6', code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' }
    ];
    
    try {
      const response = await fetch(`http://localhost:3000/api/airports/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const filtered = sampleAirports.filter(airport => 
          airport.code.toLowerCase().includes(query.toLowerCase()) ||
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city.toLowerCase().includes(query.toLowerCase())
        );
        setAirportsFunc(filtered);
        return;
      }
      const data = await response.json();
      setAirportsFunc(data.data?.airports || []);
    } catch (error) {
      console.error('Error searching airports:', error);
      const filtered = sampleAirports.filter(airport => 
        airport.code.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city.toLowerCase().includes(query.toLowerCase())
      );
      setAirportsFunc(filtered);
    }
  };

  const handleSearch = async () => {
    performSearch();
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Perfect Flight</h1>
            <p className="text-lg text-white/90">Compare prices from hundreds of airlines</p>
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
                      searchAirports(e.target.value, setFromAirports);
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
                {showFromSuggestions && fromAirports.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {fromAirports.map((airport) => (
                      <div
                        key={airport._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, from: airport.city }));
                          setShowFromSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{airport.name}</div>
                          <div className="text-sm text-primary-500">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-sm font-mono text-primary-400">{airport.code}</div>
                      </div>
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
                      searchAirports(e.target.value, setToAirports);
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
                {showToSuggestions && toAirports.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {toAirports.map((airport) => (
                      <div
                        key={airport._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, to: airport.city }));
                          setShowToSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{airport.name}</div>
                          <div className="text-sm text-primary-500">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-sm font-mono text-primary-400">{airport.code}</div>
                      </div>
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
                    className="mb-2"
                  >
                    Apply Filters
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setSearchForm({
                        from: '',
                        to: '',
                        departDate: new Date().toISOString().split('T')[0],
                        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        passengers: 1,
                        class: 'economy',
                        tripType: 'roundtrip'
                      });
                      setSearched(false);
                      setFlights([]);
                    }}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Clear Search
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
                        className="mb-4 p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 rounded-lg"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Left: Airline & Flight Info */}
                          <div className="flex items-center gap-3 lg:w-1/4">
                            <div className="flex-shrink-0">
                              <img
                                src={flight.airline?.logo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=80&h=60&fit=crop&auto=format'}
                                alt={flight.airline?.name}
                                className="w-20 h-16 object-contain rounded-lg border shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=80&h=60&fit=crop&auto=format';
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-primary-900 text-lg mb-1 leading-tight">{flight.airline?.name}</div>
                              <div className="text-sm text-primary-600 mb-1">{flight.flightNumber}</div>
                              <div className="text-sm text-primary-500 mb-1">
                                {flight.aircraft?.type || flight.aircraft?.model || 'Aircraft'} • {flight.distance || 0} km
                              </div>
                              <div className="text-sm text-green-600 font-semibold">
                                {flight.flightType || 'Direct'} Flight
                              </div>
                            </div>
                          </div>

                          {/* Center: Route & Time */}
                          <div className="flex items-center justify-center gap-4 lg:w-2/4">
                            {/* Departure */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-900 mb-1">
                                {new Date(flight.route.departure.scheduledTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </div>
                              <div className="text-lg font-bold text-primary-700 mb-1">{flight.route.departure.airport?.code}</div>
                              <div className="text-sm text-primary-600">{flight.route.departure.airport?.city}</div>
                              <div className="text-sm text-primary-400 mt-1">
                                {new Date(flight.route.departure.scheduledTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            
                            {/* Flight Path */}
                            <div className="flex-1 max-w-40 text-center">
                              <div className="text-base text-primary-600 font-bold mb-3">
                                {formatDuration(flight.duration?.scheduled || 0)}
                              </div>
                              <div className="relative">
                                <div className="border-t-2 border-primary-300"></div>
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2">
                                  <span className="text-2xl text-primary-400">✈️</span>
                                </div>
                              </div>
                              <div className="text-sm text-primary-500 mt-3 font-medium">Direct</div>
                            </div>
                            
                            {/* Arrival */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-900 mb-1">
                                {new Date(flight.route.arrival.scheduledTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </div>
                              <div className="text-lg font-bold text-primary-700 mb-1">{flight.route.arrival.airport?.code}</div>
                              <div className="text-sm text-primary-600">{flight.route.arrival.airport?.city}</div>
                              <div className="text-sm text-primary-400 mt-1">
                                {new Date(flight.route.arrival.scheduledTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Right: Price & Action */}
                          <div className="text-center lg:text-right lg:w-1/4">
                            <div className="text-3xl font-bold text-emerald-600 mb-3">
                              {formatPrice(flight.pricing[searchForm.class]?.totalPrice || 0)}
                            </div>
                            <div className="text-base text-primary-600 mb-2">per person</div>
                            <div className="text-sm text-primary-500 mb-4">
                              {flight.pricing[searchForm.class]?.availability || 0} seats available
                            </div>
                            
                            <Button 
                              size="lg" 
                              className="w-full lg:w-auto px-10 py-4 text-lg font-semibold mb-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFlightSelect(flight);
                              }}
                            >
                              Select Flight
                            </Button>
                            
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="text-green-600 font-semibold">Status: {flight.status || 'Scheduled'}</div>
                              {flight.pricing.business && (
                                <div className="text-primary-500">Business: {formatPrice(flight.pricing.business.totalPrice)}</div>
                              )}
                              <div className="text-primary-400">Class: {searchForm.class}</div>
                            </div>
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
            <PopularRoutesCards />
            <FlightDealsCards />
          </div>
        </section>
      )}
    </div>
  );
};

export default FlightsPage;