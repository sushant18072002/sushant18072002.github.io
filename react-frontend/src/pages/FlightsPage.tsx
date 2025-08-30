import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { flightService } from '@/services/flight.service';
import { Flight, Airport } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useApi from '@/hooks/useApi';
import { PopularRoutesCards, FlightDealsCards } from '@/components/FlightCards';
import { debounce } from '@/utils/performance';

interface FlightSearchForm {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: 'economy' | 'business' | 'first';
  tripType: 'roundtrip' | 'oneway' | 'multi';
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
    
    // Click outside handler for dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.airport-dropdown')) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };
    
    // Mobile viewport height fix
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', setVH);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadUrlParameters();
  }, [searchParams]);
  
  // Cleanup mobile scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Search failed');
      }
      
      const flights = data.data?.flights || [];
      console.log('Received flights:', flights.length);
      
      setFlights(flights);
      setSearched(true);
    } catch (error: any) {
      console.error('Error searching flights:', error);
      let errorMessage = 'Unable to search flights. Please try again.';
      
      if (error.message?.includes('HTTP 404')) {
        errorMessage = 'No flights found for this route. Try different cities or dates.';
      } else if (error.message?.includes('HTTP 500')) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Connection error. Please check your internet and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setFlights([]);
      
      // Auto-hide error after 10 seconds on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => setError(null), 10000);
      }
    } finally {
      setLoading(false);
    }
  };



  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [routesRes, dealsRes] = await Promise.all([
        fetch('http://localhost:3000/api/flights/popular-routes').then(r => r.json()).catch(() => ({ data: { routes: [] } })),
        fetch('http://localhost:3000/api/flights/deals').then(r => r.json()).catch(() => ({ data: { deals: [] } }))
      ]);
      setPopularRoutes(routesRes.data?.routes || []);
      setFlightDeals(dealsRes.data?.deals || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setPopularRoutes([]);
      setFlightDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const searchAirports = React.useCallback(
    debounce(async (query: string, setAirportsFunc: any) => {
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
  }, 300), []
  );

  const handleSearch = async () => {
    // Form validation
    if (!searchForm.from.trim()) {
      setError('Please select a departure city');
      return;
    }
    if (!searchForm.to.trim()) {
      setError('Please select a destination city');
      return;
    }
    if (searchForm.from.toLowerCase() === searchForm.to.toLowerCase()) {
      setError('Departure and destination cities cannot be the same');
      return;
    }
    if (!searchForm.departDate) {
      setError('Please select a departure date');
      return;
    }
    if (searchForm.tripType === 'roundtrip' && !searchForm.returnDate) {
      setError('Please select a return date');
      return;
    }
    if (new Date(searchForm.departDate) < new Date().setHours(0,0,0,0)) {
      setError('Departure date cannot be in the past');
      return;
    }
    if (searchForm.tripType === 'roundtrip' && new Date(searchForm.returnDate) <= new Date(searchForm.departDate)) {
      setError('Return date must be after departure date');
      return;
    }
    
    setError(null);
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

  const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes || isNaN(minutes)) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(price));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Flight Search Hero */}
      <section className="bg-gradient-to-br from-blue-ocean to-emerald py-8 sm:py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-[10px] border border-white/30 px-4 py-2 rounded-full text-white mb-4">
              <span className="text-lg">✈️</span>
              <span className="text-sm font-medium font-['DM_Sans']">Find Your Perfect Flight</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-['DM_Sans'] leading-tight">
              Where will your next adventure take you?
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-['Poppins'] max-w-2xl mx-auto">
              Search millions of flights and discover amazing destinations with the best prices
            </p>
          </div>

          {/* Flight Search Form */}
          <Card className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm shadow-[0_20px_40px_-10px_rgba(15,15,15,0.15)] overflow-hidden" padding="lg">
            {/* Trip Type Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setSearchForm(prev => ({
                      ...prev,
                      tripType: 'roundtrip',
                      returnDate: prev.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }));
                    setError(null);
                  }}
                  className={`px-6 py-3 rounded-md text-sm font-semibold transition-all font-['DM_Sans'] ${
                    searchForm.tripType === 'roundtrip'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'text-primary-600 hover:text-blue-ocean hover:bg-white'
                  }`}
                >
                  Round-trip
                </button>
                <button
                  onClick={() => {
                    setSearchForm(prev => ({ ...prev, tripType: 'oneway' }));
                    setError(null);
                  }}
                  className={`px-6 py-3 rounded-md text-sm font-semibold transition-all font-['DM_Sans'] ${
                    searchForm.tripType === 'oneway'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'text-primary-600 hover:text-blue-ocean hover:bg-white'
                  }`}
                >
                  One-way
                </button>
                <button
                  onClick={() => {
                    setError('Multi-city booking is coming soon! Please use round-trip or one-way for now.');
                  }}
                  className="px-6 py-3 rounded-md text-sm font-semibold transition-all font-['DM_Sans'] text-primary-400 cursor-not-allowed opacity-60"
                  disabled
                  title="Multi-city booking coming soon"
                >
                  Multi-city
                </button>
              </div>
            </div>

            {/* Search Inputs Row */}
            <div className="flex flex-col gap-4 mb-6">
              {/* From Input */}
              <div className="flex-1 relative airport-dropdown">
                <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">From</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.from}
                    onChange={(e) => {
                      setSearchForm(prev => ({ ...prev, from: e.target.value }));
                      searchAirports(e.target.value, setFromAirports);
                      setShowFromSuggestions(true);
                    }}
                    onFocus={(e) => {
                      setShowFromSuggestions(true);
                      if (searchForm.from.length >= 2) {
                        searchAirports(searchForm.from, setFromAirports);
                      }
                      // Mobile keyboard handling
                      if (window.innerWidth < 768) {
                        const input = e.target as HTMLInputElement;
                        setTimeout(() => {
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowFromSuggestions(false);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium text-base"
                    placeholder="Departure city"
                    autoComplete="off"
                    inputMode="text"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg">
                    🛫
                  </div>
                </div>
                {showFromSuggestions && fromAirports.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                    {fromAirports.map((airport, index) => (
                      <div
                        key={airport._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, from: airport.city }));
                          setShowFromSuggestions(false);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, from: airport.city }));
                          setShowFromSuggestions(false);
                        }}
                        tabIndex={0}
                        role="option"
                        aria-selected={false}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 min-h-[48px] active:bg-blue-100 overflow-hidden"
                      >
                        <div className="min-w-0 flex-1 pr-2 overflow-hidden">
                          <div className="font-semibold text-primary-900 text-sm sm:text-base truncate leading-tight">{airport.name}</div>
                          <div className="text-xs sm:text-sm text-primary-600 truncate">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-blue-ocean bg-blue-50 px-2 py-1 rounded flex-shrink-0">{airport.code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              
              {/* Swap Button - Mobile Centered */}
              <div className="flex justify-center py-2">
                <button
                  onClick={() => {
                    if (searchForm.from || searchForm.to) {
                      setSearchForm(prev => ({
                        ...prev,
                        from: prev.to,
                        to: prev.from
                      }));
                      setShowFromSuggestions(false);
                      setShowToSuggestions(false);
                      setError(null);
                    }
                  }}
                  disabled={!searchForm.from && !searchForm.to}
                  className="p-4 bg-white border-2 border-primary-200 rounded-full hover:border-blue-ocean hover:bg-blue-50 transition-all duration-300 shadow-sm hover:rotate-180 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:rotate-0 min-h-[48px] min-w-[48px]"
                  type="button"
                  title="Swap departure and destination"
                >
                  <span className="text-xl text-primary-600 transition-transform duration-300">⇄</span>
                </button>
              </div>
              
              {/* To Input */}
              <div className="flex-1 relative airport-dropdown">
                <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">To</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.to}
                    onChange={(e) => {
                      setSearchForm(prev => ({ ...prev, to: e.target.value }));
                      searchAirports(e.target.value, setToAirports);
                      setShowToSuggestions(true);
                    }}
                    onFocus={(e) => {
                      setShowToSuggestions(true);
                      if (searchForm.to.length >= 2) {
                        searchAirports(searchForm.to, setToAirports);
                      }
                      // Mobile keyboard handling
                      if (window.innerWidth < 768) {
                        const input = e.target as HTMLInputElement;
                        setTimeout(() => {
                          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowToSuggestions(false);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium text-base"
                    placeholder="Destination city"
                    autoComplete="off"
                    inputMode="text"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg">
                    🛬
                  </div>
                </div>
                {showToSuggestions && toAirports.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-xl max-h-48 sm:max-h-60 overflow-y-auto">
                    {toAirports.map((airport, index) => (
                      <div
                        key={airport._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, to: airport.city }));
                          setShowToSuggestions(false);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          setSearchForm(prev => ({ ...prev, to: airport.city }));
                          setShowToSuggestions(false);
                        }}
                        tabIndex={0}
                        role="option"
                        aria-selected={false}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 min-h-[48px] active:bg-blue-100 overflow-hidden"
                      >
                        <div className="min-w-0 flex-1 pr-2 overflow-hidden">
                          <div className="font-semibold text-primary-900 text-sm sm:text-base truncate leading-tight">{airport.name}</div>
                          <div className="text-xs sm:text-sm text-primary-600 truncate">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-xs sm:text-sm font-mono text-blue-ocean bg-blue-50 px-2 py-1 rounded flex-shrink-0">{airport.code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
            
            {/* Second Row: Dates, Travelers, Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              {/* Departure Date */}
              <div className="relative">
                <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">Departure</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchForm.departDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setSearchForm(prev => ({
                        ...prev,
                        departDate: newDate,
                        returnDate: prev.tripType === 'roundtrip' && new Date(prev.returnDate) <= new Date(newDate) 
                          ? new Date(new Date(newDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          : prev.returnDate
                      }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full pl-12 pr-4 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium text-base"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg">
                    📅
                  </div>
                </div>
              </div>

              {/* Return Date */}
              {searchForm.tripType === 'roundtrip' && (
                <div className="relative">
                  <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">Return</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, returnDate: e.target.value }))}
                      min={searchForm.departDate}
                      max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium text-base"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg">
                      📅
                    </div>
                  </div>
                </div>
              )}

              {/* Travelers */}
              <div className="relative">
                <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">Travelers</label>
                <div className="relative">
                  <select
                    value={searchForm.passengers}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                    className="w-full pl-12 pr-8 py-4 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_1rem] text-base"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4+ Adults</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-lg">
                    👥
                  </div>
                </div>
              </div>

              {/* Search Button - Full Width on Mobile */}
              <div className="sm:col-span-2">
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchForm.from || !searchForm.to}
                  className="w-full bg-blue-ocean text-white border-none py-4 px-6 rounded-xl cursor-pointer flex items-center justify-center text-base transition-all duration-300 font-['DM_Sans'] font-bold gap-2 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] disabled:hover:transform-none disabled:hover:shadow-none"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🔍</span>
                      <span>Search Flights</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                <span className="font-medium text-sm sm:text-base leading-tight">{error}</span>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4 order-2 lg:order-1">
                <div className="lg:sticky lg:top-4">
                  {/* Mobile Filter Toggle */}
                  <div className="lg:hidden mb-4">
                    <button
                      onClick={() => {
                      const newState = !showMobileFilters;
                      setShowMobileFilters(newState);
                      // Prevent body scroll when filters are open on mobile
                      if (window.innerWidth < 1024) {
                        document.body.style.overflow = newState ? 'hidden' : 'auto';
                        if (newState) {
                          setTimeout(() => {
                            document.querySelector('.mobile-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 150);
                        }
                      }
                    }}
                      className="w-full flex items-center justify-between p-4 bg-white border border-primary-200 rounded-xl font-semibold text-primary-900 min-h-[56px]"
                    >
                      <span className="flex items-center gap-2">
                        <span>🗓️</span>
                        <span>Filters</span>
                      </span>
                      <span className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                  </div>
                  
                <Card className={`${showMobileFilters ? 'block' : 'hidden'} lg:block mobile-filters`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-primary-900 font-['DM_Sans']">Filter Results</h3>
                    <span className="text-sm text-primary-600 bg-blue-50 px-2 py-1 rounded">{flights.length} flights</span>
                  </div>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">
                      Max Price: <span className="text-blue-ocean">{formatPrice(filters.maxPrice)}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="50"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-primary-500 mt-1">
                      <span>$0</span>
                      <span>$5,000</span>
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-primary-900 mb-3 font-['DM_Sans']">Stops</label>
                    <div className="space-y-3">
                      {[
                        { value: 'any', label: 'Any stops', icon: '✈️' },
                        { value: '0', label: 'Non-stop', icon: '🚀' },
                        { value: '1', label: '1 stop', icon: '🔄' },
                        { value: '2+', label: '2+ stops', icon: '🔀' }
                      ].map(stop => (
                        <label key={stop.value} className="flex items-center p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors duration-200">
                          <input
                            type="radio"
                            name="stops"
                            value={stop.value}
                            checked={filters.stops === stop.value}
                            onChange={(e) => setFilters(prev => ({ ...prev, stops: e.target.value }))}
                            className="mr-3 text-blue-ocean focus:ring-blue-ocean"
                          />
                          <span className="mr-2">{stop.icon}</span>
                          <span className="text-sm font-medium text-primary-800">{stop.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-primary-900 mb-2 font-['DM_Sans']">Sort by</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                      className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-primary-800 font-['Poppins'] font-medium appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_1rem]"
                    >
                      <option value="price">💰 Price (Low to High)</option>
                      <option value="duration">⏱️ Duration (Shortest)</option>
                      <option value="departure">🕰️ Departure Time</option>
                      <option value="arrival">🏁 Arrival Time</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => {
                      setError(null);
                      handleSearch();
                    }}
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mb-2"
                    disabled={loading}
                  >
                    {loading ? 'Applying...' : 'Apply Filters'}
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
                      setFilters({
                        maxPrice: 5000,
                        airlines: [],
                        stops: 'any',
                        sort: 'price'
                      });
                      setSearched(false);
                      setFlights([]);
                      setError(null);
                    }}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Clear All
                  </Button>
                </Card>
                </div>
              </div>

              {/* Flight Results */}
              <div className="lg:w-3/4 order-1 lg:order-2">
                {loading ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
                      <div className="h-5 sm:h-6 bg-blue-200 rounded mb-2"></div>
                      <div className="h-3 sm:h-4 bg-blue-200 rounded w-3/4"></div>
                    </div>
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl animate-pulse">
                        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-5 sm:h-6 bg-gray-200 rounded mb-2"></div>
                              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                            <div className="text-right">
                              <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex-1 flex justify-between items-center">
                              <div className="text-center">
                                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                              </div>
                              <div className="h-3 bg-gray-200 rounded w-16 mx-4"></div>
                              <div className="text-center">
                                <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-8"></div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto">
                            <div className="h-12 bg-gray-200 rounded w-full sm:w-32"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <Card className="text-center py-12">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">Error Loading Flights</h3>
                    <p className="text-primary-600 mb-4">{error}</p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Searching...' : 'Try Again'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setError(null);
                          setSearched(false);
                          setFlights([]);
                        }}
                        disabled={loading}
                      >
                        New Search
                      </Button>
                    </div>
                  </Card>
                ) : flights.length === 0 ? (
                  <Card className="text-center py-12">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No flights found</h3>
                    <p className="text-primary-600 mb-4">Try adjusting your search criteria or dates</p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => {
                          setSearchForm(prev => ({
                            ...prev,
                            departDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          }));
                          setError(null);
                          handleSearch();
                        }}
                        disabled={loading}
                      >
                        Try Tomorrow
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearched(false);
                          setFlights([]);
                          setError(null);
                        }}
                        disabled={loading}
                      >
                        New Search
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-primary-900 font-['DM_Sans'] break-words">
                          {searchForm.from} → {searchForm.to}
                        </h2>
                        <p className="text-xs sm:text-sm text-primary-600 font-['Poppins'] mt-1">
                          {new Date(searchForm.departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {searchForm.tripType === 'roundtrip' && ` - ${new Date(searchForm.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </p>
                        <p className="text-xs sm:text-sm text-primary-600 font-['Poppins']">
                          {searchForm.passengers} {searchForm.passengers === 1 ? 'Adult' : 'Adults'} • {searchForm.tripType === 'roundtrip' ? 'Round-trip' : 'One-way'}
                        </p>
                        <div className="text-sm font-semibold text-blue-ocean mt-2">
                          Found {flights.length} flights
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSearched(false);
                          setFlights([]);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-blue-ocean font-semibold min-h-[48px]"
                      >
                        <span>✏️</span>
                        <span>Modify Search</span>
                      </button>
                    </div>

                    {flights.map((flight, index) => (
                      <Card
                        key={flight._id || index}
                        hover
                        className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 rounded-xl hover:border-blue-300 bg-white overflow-hidden"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <div className="flex flex-col gap-4">
                          {/* Mobile: Airline Info */}
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <img
                                src={flight.airline?.logo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=80&h=60&fit=crop&auto=format'}
                                alt={flight.airline?.name}
                                className="w-16 h-12 sm:w-20 sm:h-16 object-contain rounded-lg border shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=80&h=60&fit=crop&auto=format';
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-primary-900 text-base sm:text-lg mb-1 leading-tight">{flight.airline?.name || 'Airline'}</div>
                              <div className="text-sm text-primary-600 mb-1">{flight.flightNumber || 'N/A'}</div>
                              <div className="text-xs sm:text-sm text-green-600 font-semibold">
                                {flight.flightType || 'Direct'} Flight
                              </div>
                            </div>
                            {/* Mobile: Price */}
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg sm:text-xl font-bold text-emerald-600 leading-tight">
                                {formatPrice(flight.pricing?.[searchForm.class]?.totalPrice || flight.pricing?.economy?.totalPrice || 0)}
                              </div>
                              <div className="text-xs text-primary-600 whitespace-nowrap">per person</div>
                            </div>
                          </div>

                          {/* Mobile: Route & Time */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Departure */}
                            <div className="text-center flex-1">
                              <div className="text-xl sm:text-2xl font-bold text-primary-900 mb-1">
                                {flight.route?.departure?.scheduledTime ? new Date(flight.route.departure.scheduledTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                }) : '--:--'}
                              </div>
                              <div className="text-sm sm:text-base font-bold text-primary-700 mb-1">{flight.route?.departure?.airport?.code || 'N/A'}</div>
                              <div className="text-xs sm:text-sm text-primary-600">{flight.route?.departure?.airport?.city || 'Unknown'}</div>
                            </div>
                            
                            {/* Flight Path */}
                            <div className="flex-1 text-center px-2">
                              <div className="text-sm font-bold text-primary-600 mb-2">
                                {formatDuration(flight.duration?.scheduled || 0)}
                              </div>
                              <div className="relative">
                                <div className="border-t-2 border-primary-300"></div>
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-1">
                                  <span className="text-lg text-primary-400">✈️</span>
                                </div>
                              </div>
                              <div className="text-xs text-primary-500 mt-2">Direct</div>
                            </div>
                            
                            {/* Arrival */}
                            <div className="text-center flex-1">
                              <div className="text-xl sm:text-2xl font-bold text-primary-900 mb-1">
                                {flight.route?.arrival?.scheduledTime ? new Date(flight.route.arrival.scheduledTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false
                                }) : '--:--'}
                              </div>
                              <div className="text-sm sm:text-base font-bold text-primary-700 mb-1">{flight.route?.arrival?.airport?.code || 'N/A'}</div>
                              <div className="text-xs sm:text-sm text-primary-600">{flight.route?.arrival?.airport?.city || 'Unknown'}</div>
                            </div>
                          </div>

                          {/* Mobile: Action & Details */}
                          <div className="flex flex-col gap-3">
                            <Button 
                              size="lg" 
                              className="w-full px-6 py-3 text-base font-bold bg-blue-ocean hover:bg-emerald transition-all duration-300 min-h-[48px] active:scale-95"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFlightSelect(flight);
                              }}
                            >
                              Select Flight
                            </Button>
                            
                            <div className="flex justify-between items-center text-xs sm:text-sm">
                              <div className="text-primary-500 truncate">
                                {flight.pricing?.[searchForm.class]?.availability || flight.pricing?.economy?.availability || 0} seats available
                              </div>
                              <div className="text-green-600 font-semibold flex-shrink-0">{flight.status || 'Scheduled'}</div>
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

      {/* Popular Destinations */}
      {!searched && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4 font-['DM_Sans']">Popular destinations from New York</h2>
              <p className="text-lg text-primary-600 font-['Poppins']">Discover amazing places with great flight deals</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-gray-200 rounded-2xl h-48 sm:h-64"></div>
                ))}
              </div>
            ) : (
              <>
                <PopularRoutesCards />
                <FlightDealsCards />
              </>
            )}
          </div>
        </section>
      )}
      
      {/* Why Choose Us */}
      {!searched && (
        <section className="py-8 sm:py-12 lg:py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4 font-['DM_Sans']">Why book flights with TravelAI?</h2>
              <p className="text-lg text-primary-600 font-['Poppins']">We make flight booking simple, transparent, and rewarding</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 font-['DM_Sans']">Best Price Guarantee</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed">Find a lower price within 24 hours? We'll match it and give you $50 credit</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 font-['DM_Sans']">AI-Powered Search</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed">Our smart algorithms find the best flight combinations you won't see elsewhere</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 font-['DM_Sans']">Flexible Booking</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed">Free cancellation within 24 hours and easy date changes for peace of mind</p>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 font-['DM_Sans']">Complete Trip Planning</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed">Book flights, hotels, and activities together for seamless travel experiences</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default FlightsPage;