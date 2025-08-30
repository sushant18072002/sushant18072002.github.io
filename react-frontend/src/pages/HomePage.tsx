import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api.service';
import { APP_CONSTANTS, TRIP_CONSTANTS } from '@/constants/app.constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [dreamInput, setDreamInput] = useState('');
  const [liveCounter, setLiveCounter] = useState(2847);
  const [selectedOption, setSelectedOption] = useState('ai-magic');
  const [flightForm, setFlightForm] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });
  const [hotelForm, setHotelForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showTripToSuggestions, setShowTripToSuggestions] = useState(false);
  const [tripForm, setTripForm] = useState({
    to: '',
    tripType: 'any',
    departDate: '',
    travelers: 'couple',
    budget: 'mid-range'
  });
  const [fromAirports, setFromAirports] = useState<any[]>([]);
  const [toAirports, setToAirports] = useState<any[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  // Debounce search functions
  const debounceTimeout = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const selectItineraryOption = (option: string) => {
    setSelectedOption(option);
  };

  const searchLocations = React.useCallback(async (query: string) => {
    if (query.length < APP_CONSTANTS.MIN_SEARCH_LENGTH) {
      setLocationSuggestions([]);
      return;
    }
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Set new timeout
    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await apiService.searchLocations(query);
        if (response.success && response.data?.locations) {
          setLocationSuggestions(response.data.locations);
        } else {
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        setLocationSuggestions([]);
      }
    }, APP_CONSTANTS.SEARCH_DEBOUNCE_MS);
  }, []);

  const searchAirports = async (query: string, setAirportsFunc: (airports: any[]) => void) => {
    if (query.length < APP_CONSTANTS.MIN_SEARCH_LENGTH) {
      setAirportsFunc([]);
      return;
    }
    
    try {
      const response = await apiService.searchAirports(query);
      if (response.success && response.data?.airports) {
        setAirportsFunc(response.data.airports);
      } else {
        setAirportsFunc([]);
      }
    } catch (error) {
      console.error('Error searching airports:', error);
      setAirportsFunc([]);
    }
  };

  const getCityToCodeMap = () => {
    // This should be replaced with actual airport data from API
    // For now, using basic mapping for common cities
    const commonCityToCode: Record<string, string> = {
      'New York': 'JFK',
      'Paris': 'CDG',
      'Dubai': 'DXB',
      'Tokyo': 'NRT',
      'London': 'LHR',
      'Los Angeles': 'LAX'
    };
    return commonCityToCode;
  };

  const performSearch = () => {
    if (activeTab === 'itinerary') {
      if (!dreamInput.trim() && !tripForm.to) {
        alert('Please describe your dream trip or select a destination');
        return;
      }
      
      if (selectedOption === 'ai-magic') {
        const params = new URLSearchParams();
        if (dreamInput.trim()) params.append('description', dreamInput);
        if (tripForm.to) params.append('destination', tripForm.to);
        if (tripForm.tripType && tripForm.tripType !== 'any') params.append('type', tripForm.tripType);
        if (tripForm.departDate) params.append('date', tripForm.departDate);
        if (tripForm.travelers) params.append('travelers', tripForm.travelers);
        if (tripForm.budget) params.append('budget', tripForm.budget);
        navigate(`/itineraries/ai?${params}`);
      } else if (selectedOption === 'packages') {
        const params = new URLSearchParams();
        if (tripForm.to) params.append('destination', tripForm.to);
        if (tripForm.tripType && tripForm.tripType !== 'any') params.append('category', tripForm.tripType);
        if (tripForm.budget) params.append('priceRange', tripForm.budget);
        navigate(`/trips?${params}`);
      } else {
        navigate('/itineraries/custom');
      }
    } else if (activeTab === 'flights') {
      if (!flightForm.from || !flightForm.to) {
        alert('Please select departure and arrival cities');
        return;
      }
      
      const cityToCode = getCityToCodeMap();
      const fromCode = cityToCode[flightForm.from] || flightForm.from;
      const toCode = cityToCode[flightForm.to] || flightForm.to;
      
      const params = new URLSearchParams({
        from: fromCode,
        to: toCode,
        departDate: flightForm.departDate || new Date().toISOString().split('T')[0],
        returnDate: flightForm.returnDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        passengers: flightForm.passengers.toString(),
        class: flightForm.class,
        autoSearch: 'true'
      });
      navigate(`/flights?${params}`);
    } else if (activeTab === 'hotels') {
      if (!hotelForm.location) {
        alert('Please select a destination');
        return;
      }
      const params = new URLSearchParams({
        location: hotelForm.location,
        checkIn: hotelForm.checkIn || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOut: hotelForm.checkOut || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: hotelForm.guests.toString(),
        rooms: hotelForm.rooms.toString(),
        autoSearch: 'true'
      });
      navigate(`/hotels?${params}`);
    } else {
      navigate('/hotels');
    }
  };

  const selectAdventure = (type: string) => {
    navigate(`/packages?category=${type}`);
  };

  const viewDestination = (id: string) => {
    navigate(`/itinerary-details?destination=${id}`);
  };

  const viewPackage = (id: string) => {
    navigate(`/packages/${id}`);
  };

  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const adventureCategories = featuredContent?.adventureCategories || [
    {
      icon: '🏖️',
      title: 'Luxury resort at the sea',
      places: '9,326 places',
      type: 'luxury',
    },
    {
      icon: '🏕️',
      title: 'Camping amidst the wild',
      places: '12,326 places',
      type: 'camping',
    },
    {
      icon: '🏔️',
      title: 'Mountain house',
      places: '8,945 places',
      type: 'mountain',
    },
  ];

  const planningOptions = [
    {
      icon: '🧠',
      title: 'AI Dream Builder',
      description: 'Describe your dream trip and watch AI create magic',
      badge: '⚡ Most Popular',
      features: ['✨ Natural language input', '⚡ Ready in 2 minutes'],
      buttonText: 'Start Dreaming',
      href: '/itineraries/ai',
    },
    {
      icon: '📦',
      title: 'Ready Packages',
      description: 'Expert-curated trips ready to book instantly',
      badge: '🌟 Ready',
      features: ['🏆 Expert curated', '⚡ Instant booking'],
      buttonText: 'Browse Packages',
      href: '/packages',
    },
    {
      icon: '🛠️',
      title: 'Custom Builder',
      description: 'Step-by-step control over every detail',
      badge: '🎯 Pro',
      features: ['🎛️ Full control', '📋 5-step wizard'],
      buttonText: 'Start Building',
      href: '/itineraries/custom',
    },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [contentRes, statsRes] = await Promise.all([
        apiService.getHomeFeatured(),
        apiService.getHomeStats()
      ]);
      
      if (contentRes.success) {
        setFeaturedContent(contentRes.data);
      }
      
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredPackages = featuredContent?.featuredTrips || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero relative min-h-[calc(100vh-88px)] flex items-center py-8 md:py-0">
        <img 
          className="hero-bg absolute top-0 left-0 w-full h-full object-cover z-[1]" 
          src={featuredContent?.heroImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop"} 
          alt="Beautiful landscape"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop";
          }}
        />
        <div className="hero-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[rgba(15,23,42,0.4)] via-[rgba(30,64,175,0.3)] to-[rgba(16,185,129,0.4)] z-[2]"></div>
        
        <div className="hero-content relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-center w-full">
          <div className="hero-text text-white text-center lg:text-left order-2 lg:order-1">
            <div className="hero-badge inline-flex items-center gap-3 bg-white/20 backdrop-blur-[10px] border border-white/30 px-4 py-2 rounded-full text-sm mb-4">
              <div className="live-dot w-2 h-2 bg-emerald rounded-full animate-pulse"></div>
              <span>{liveCounter.toLocaleString()} dreams planned today</span>
            </div>
            
            <h1 className="hero-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-3 font-['DM_Sans']">
              Air, sleep, dream
            </h1>
            <p className="hero-subtitle text-lg md:text-xl font-normal leading-relaxed mb-4 font-['Poppins'] opacity-90">
              Find and book a great experience.
            </p>
            <button 
              className="hero-cta bg-blue-ocean text-white border-none px-6 py-3 rounded-3xl text-base font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] inline-flex items-center gap-2 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
              onClick={() => document.querySelector('.search-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Start your search
            </button>
          </div>

          {/* Search Widget */}
          <div className="search-widget bg-white/95 backdrop-blur-[20px] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-white/50 w-full max-w-none relative z-[5] order-1 lg:order-2">
            {/* Search Tabs */}
            <div className="search-tabs flex gap-2 mb-6">
              <button
                onClick={() => switchTab('flights')}
                className={`search-tab flex-1 md:flex-none md:px-6 py-3 px-4 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-lg ${
                  activeTab === 'flights'
                    ? 'text-white bg-blue-ocean shadow-lg transform -translate-y-0.5'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-ocean hover:text-blue-ocean'
                }`}
              >
                <span className="mr-2">✈️</span>
                <span>Flights</span>
              </button>
              <button
                onClick={() => switchTab('hotels')}
                className={`search-tab flex-1 md:flex-none md:px-6 py-3 px-4 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-lg ${
                  activeTab === 'hotels'
                    ? 'text-white bg-blue-ocean shadow-lg transform -translate-y-0.5'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-ocean hover:text-blue-ocean'
                }`}
              >
                <span className="mr-2">🏨</span>
                <span>Hotels</span>
              </button>
              <button
                onClick={() => switchTab('itinerary')}
                className={`search-tab flex-1 md:flex-none md:px-6 py-3 px-4 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-lg ${
                  activeTab === 'itinerary'
                    ? 'text-white bg-blue-ocean shadow-lg transform -translate-y-0.5'
                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-ocean hover:text-blue-ocean'
                }`}
              >
                <span className="mr-2">✨</span>
                <span className="hidden sm:inline">Complete Trip</span>
                <span className="sm:hidden">Trip</span>
              </button>
            </div>

            {/* Search Forms */}
            <div className={`search-content ${activeTab === 'flights' ? 'block' : 'hidden'}`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1 relative">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">From</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="Departure city or airport" 
                        value={flightForm.from}
                        onChange={(e) => {
                          setFlightForm(prev => ({ ...prev, from: e.target.value }));
                          searchAirports(e.target.value, setFromAirports);
                          setShowFromSuggestions(true);
                        }}
                        onFocus={() => {
                          setShowFromSuggestions(true);
                          if (flightForm.from.length >= 2) {
                            searchAirports(flightForm.from, setFromAirports);
                          }
                        }}
                      />
                      {showFromSuggestions && fromAirports.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                          {fromAirports.map((airport) => (
                            <div
                              key={airport._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFlightForm(prev => ({ ...prev, from: airport.city }));
                                setShowFromSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                              <div className="font-medium text-gray-900">{airport.name}</div>
                              <div className="text-xs text-gray-500">{airport.code} - {airport.city}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1 relative">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">To</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="Destination city or airport" 
                        value={flightForm.to}
                        onChange={(e) => {
                          setFlightForm(prev => ({ ...prev, to: e.target.value }));
                          searchAirports(e.target.value, setToAirports);
                          setShowToSuggestions(true);
                        }}
                        onFocus={() => {
                          setShowToSuggestions(true);
                          if (flightForm.to.length >= 2) {
                            searchAirports(flightForm.to, setToAirports);
                          }
                        }}
                      />
                      {showToSuggestions && toAirports.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                          {toAirports.map((airport) => (
                            <div
                              key={airport._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFlightForm(prev => ({ ...prev, to: airport.city }));
                                setShowToSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                              <div className="font-medium text-gray-900">{airport.name}</div>
                              <div className="text-xs text-gray-500">{airport.code} - {airport.city}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Departure</div>
                      <input 
                        type="date" 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        value={flightForm.departDate}
                        onChange={(e) => setFlightForm(prev => ({ ...prev, departDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Return</div>
                      <input 
                        type="date" 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        value={flightForm.returnDate}
                        onChange={(e) => setFlightForm(prev => ({ ...prev, returnDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Passengers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={flightForm.passengers}
                        onChange={(e) => setFlightForm(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                      >
                        <option value={1}>1 Passenger</option>
                        <option value={2}>2 Passengers</option>
                        <option value={3}>3 Passengers</option>
                        <option value={4}>4 Passengers</option>
                        <option value={5}>5 Passengers</option>
                        <option value={6}>6 Passengers</option>
                        <option value={7}>7 Passengers</option>
                        <option value={8}>8 Passengers</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎆</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Class</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={flightForm.class}
                        onChange={(e) => setFlightForm(prev => ({ ...prev, class: e.target.value }))}
                      >
                        <option value="economy">Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First Class</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-1 gap-3 items-end">
                  <button 
                    onClick={performSearch}
                    className="search-btn w-full h-12 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center text-sm transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 px-5 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
                  >
                    <span>Search Flights</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`search-content ${activeTab === 'hotels' ? 'block' : 'hidden'}`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-1 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</div>
                    <div className="field-content flex-1 flex flex-col gap-1 relative">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Where are you going?</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="Destination" 
                        value={hotelForm.location}
                        onChange={(e) => {
                          setHotelForm(prev => ({ ...prev, location: e.target.value }));
                          searchLocations(e.target.value);
                          setShowLocationSuggestions(true);
                        }}
                        onFocus={() => {
                          setShowLocationSuggestions(true);
                          if (hotelForm.location.length >= 2) {
                            searchLocations(hotelForm.location);
                          }
                        }}
                      />
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                          {locationSuggestions.map((location) => (
                            <div
                              key={location._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setHotelForm(prev => ({ ...prev, location: `${location.name}, ${location.country}` }));
                                setShowLocationSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-xs text-gray-500">{location.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Check in</div>
                      <input 
                        type="date" 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        value={hotelForm.checkIn}
                        onChange={(e) => setHotelForm(prev => ({ ...prev, checkIn: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Check out</div>
                      <input 
                        type="date" 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        value={hotelForm.checkOut}
                        onChange={(e) => setHotelForm(prev => ({ ...prev, checkOut: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-[1fr_auto] gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Travelers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={`${hotelForm.guests} Adults, ${hotelForm.rooms} Room${hotelForm.rooms > 1 ? 's' : ''}`}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.includes('1 Adult')) {
                            setHotelForm(prev => ({ ...prev, guests: 1, rooms: 1 }));
                          } else if (value.includes('2 Adults, 1 Room')) {
                            setHotelForm(prev => ({ ...prev, guests: 2, rooms: 1 }));
                          } else if (value.includes('2 Adults, 2 Children')) {
                            setHotelForm(prev => ({ ...prev, guests: 4, rooms: 1 }));
                          } else if (value.includes('4 Adults, 2 Rooms')) {
                            setHotelForm(prev => ({ ...prev, guests: 4, rooms: 2 }));
                          }
                        }}
                      >
                        <option>1 Adult, 1 Room</option>
                        <option>2 Adults, 1 Room</option>
                        <option>2 Adults, 2 Children</option>
                        <option>4 Adults, 2 Rooms</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={performSearch}
                    className="search-btn w-auto h-12 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center text-sm ml-4 transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 px-5 min-w-[120px] hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
                  >
                    <span>Search Hotels</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`search-content ${activeTab === 'itinerary' ? 'block' : 'hidden'} active min-h-[240px]`}>
              <div className="search-form flex flex-col gap-1">
                <div className="form-row grid grid-cols-1 gap-3 items-end">
                  <div className="form-field full-width col-span-full flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">✨</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Describe your dream trip</div>
                      <input 
                        value={dreamInput}
                        onChange={(e) => setDreamInput(e.target.value)}
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="e.g., Romantic getaway in Paris, Adventure in Japan, Beach relaxation in Bali..." 
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">🌍</div>
                    <div className="field-content flex-1 flex flex-col gap-1 relative">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Destination</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        placeholder="Where do you want to go?" 
                        value={tripForm.to}
                        onChange={(e) => {
                          setTripForm(prev => ({ ...prev, to: e.target.value }));
                          searchLocations(e.target.value);
                          setShowTripToSuggestions(true);
                        }}
                        onFocus={() => {
                          setShowTripToSuggestions(true);
                          if (tripForm.to.length >= 2) {
                            searchLocations(tripForm.to);
                          }
                        }}
                      />
                      {showTripToSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 mt-1">
                          {locationSuggestions.map((location) => (
                            <div
                              key={location._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setTripForm(prev => ({ ...prev, to: location.name }));
                                setShowTripToSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-xs text-gray-500">{location.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎭</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Trip Type</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={tripForm.tripType || 'any'}
                        onChange={(e) => setTripForm(prev => ({ ...prev, tripType: e.target.value }))}
                      >
                        <option value="any">Any experience</option>
                        {TRIP_CONSTANTS.CATEGORIES.map(category => {
                          const labels: Record<string, string> = {
                            adventure: 'Adventure & Outdoor',
                            cultural: 'Cultural & Historical',
                            relaxation: 'Beach & Relaxation',
                            city: 'City & Urban',
                            nature: 'Nature & Wildlife',
                            food: 'Food & Culinary',
                            luxury: 'Luxury & Spa'
                          };
                          return (
                            <option key={category} value={category}>
                              {labels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">When</div>
                      <input 
                        type="date" 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full" 
                        value={tripForm.departDate}
                        onChange={(e) => setTripForm(prev => ({ ...prev, departDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Travelers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={tripForm.travelers}
                        onChange={(e) => setTripForm(prev => ({ ...prev, travelers: e.target.value }))}
                      >
                        {TRIP_CONSTANTS.TRAVELER_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white rounded-2xl py-3 px-4 pl-14 relative min-h-[56px]">
                    <div className="field-icon absolute left-4 top-1/2 -translate-y-1/2 text-xl">💰</div>
                    <div className="field-content flex-1 flex flex-col gap-1">
                      <div className="field-label text-lg font-semibold text-primary-900 font-['Poppins']">Budget</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-400 font-['Poppins'] outline-none w-full"
                        value={tripForm.budget}
                        onChange={(e) => setTripForm(prev => ({ ...prev, budget: e.target.value }))}
                      >
                        {TRIP_CONSTANTS.BUDGET_RANGES.map(budget => (
                          <option key={budget} value={budget}>
                            {budget === 'mid-range' ? 'Mid-range' : budget.charAt(0).toUpperCase() + budget.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="itinerary-options grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-xl py-3 px-3 text-center cursor-pointer transition-all duration-300 min-h-[70px] md:min-h-[80px] flex flex-col justify-center relative hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(59,113,254,0.2)] hover:border-blue-ocean ${
                      selectedOption === 'ai-magic' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/15 to-emerald/15 shadow-[0_8px_20px_rgba(59,113,254,0.25)] transform -translate-y-1' : ''
                    }`}
                    onClick={() => selectItineraryOption('ai-magic')}
                  >
                    <div className="option-badge badge-popular absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] px-2 py-1 rounded-full font-bold font-['DM_Sans'] bg-emerald text-white shadow-sm">⚡ Popular</div>
                    <div className="text-xl md:text-2xl mb-2">🧠</div>
                    <div className="text-sm font-bold text-primary-900 mb-1">AI Magic</div>
                    <div className="text-xs text-primary-500 leading-tight">AI creates perfect trip</div>
                  </div>
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-xl py-3 px-3 text-center cursor-pointer transition-all duration-300 min-h-[70px] md:min-h-[80px] flex flex-col justify-center relative hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(59,113,254,0.2)] hover:border-blue-ocean ${
                      selectedOption === 'packages' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/15 to-emerald/15 shadow-[0_8px_20px_rgba(59,113,254,0.25)] transform -translate-y-1' : ''
                    }`}
                    onClick={() => selectItineraryOption('packages')}
                  >
                    <div className="option-badge badge-ready absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] px-2 py-1 rounded-full font-bold font-['DM_Sans'] bg-amber-premium text-white shadow-sm">🌟 Ready</div>
                    <div className="text-xl md:text-2xl mb-2">📦</div>
                    <div className="text-sm font-bold text-primary-900 mb-1">Packages</div>
                    <div className="text-xs text-primary-500 leading-tight">Pre-made adventures</div>
                  </div>
                  <div 
                    className={`option-card bg-gradient-to-br from-blue-ocean/5 to-emerald/5 border-2 border-blue-ocean/10 rounded-xl py-3 px-3 text-center cursor-pointer transition-all duration-300 min-h-[70px] md:min-h-[80px] flex flex-col justify-center relative hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(59,113,254,0.2)] hover:border-blue-ocean ${
                      selectedOption === 'custom' ? 'selected border-blue-ocean bg-gradient-to-br from-blue-ocean/15 to-emerald/15 shadow-[0_8px_20px_rgba(59,113,254,0.25)] transform -translate-y-1' : ''
                    }`}
                    onClick={() => selectItineraryOption('custom')}
                  >
                    <div className="option-badge badge-pro absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] px-2 py-1 rounded-full font-bold font-['DM_Sans'] bg-blue-ocean text-white shadow-sm">🎯 Pro</div>
                    <div className="text-xl md:text-2xl mb-2">🛠️</div>
                    <div className="text-sm font-bold text-primary-900 mb-1">Custom</div>
                    <div className="text-xs text-primary-500 leading-tight">Build from scratch</div>
                  </div>
                </div>
                <button 
                  onClick={performSearch}
                  className="search-btn full-width w-full ml-0 mt-4 text-base px-6 h-12 md:h-14 bg-blue-ocean border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 text-white font-['DM_Sans'] font-bold gap-2 hover:bg-emerald hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(88,194,125,0.3)] active:transform active:scale-95"
                >
                  <span className="search-icon text-lg">✨</span>
                  <span>Create My Dream Trip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories */}
      <section className="adventure-section py-12 md:py-20 lg:py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Let's go on an adventure
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Find and book a great experience.
            </p>
          </div>

          <div className="adventure-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-[1120px] mx-auto">
            {adventureCategories.map((category, index) => (
              <div
                key={index}
                className="adventure-card flex items-center gap-4 cursor-pointer transition-all duration-300 p-6 rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                onClick={() => selectAdventure(category.type)}
              >
                <div className="adventure-icon w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 flex items-center justify-center text-4xl md:text-6xl lg:text-[80px] rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#C1FFF7] to-[#93E9DE]">
                  {category.icon}
                </div>
                <div className="adventure-content flex-1">
                  <h3 className="text-base font-medium leading-6 text-primary-900 mb-2 font-['Poppins']">
                    {category.title}
                  </h3>
                  <div className="adventure-badge bg-primary-200 text-primary-900 px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] inline-block font-['Poppins']">
                    {category.places}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="destinations-section py-12 md:py-16 lg:py-20 bg-white relative">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              {featuredContent?.destinationSpotlight?.title || 'Explore amazing destinations'}
            </h2>
            <p className="section-subtitle text-xl text-primary-400 font-['Poppins']">
              {featuredContent?.destinationSpotlight?.subtitle || 'Discover breathtaking places around the world'}
            </p>
          </div>
          
          <div className="destinations-slider flex gap-8 overflow-x-auto scroll-smooth pb-5">
            {(featuredContent?.destinationSpotlight?.destinations || [
              { id: 1, name: 'Mountain Lodge', location: 'New Zealand', price: 190, image: 'photo-1506905925346-21bda4d32df4', discount: '20% off' },
              { id: 2, name: 'Alpine Retreat', location: 'Switzerland', price: 230, image: 'photo-1464822759844-d150baec3e5e', discount: null },
              { id: 3, name: 'Forest Cabin', location: 'Canada', price: 170, image: 'photo-1441974231531-c6227db76b6e', discount: '15% off' },
              { id: 4, name: 'Lake House', location: 'Norway', price: 280, image: 'photo-1506905925346-21bda4d32df4', discount: null }
            ]).map((destination, index) => (
              <div key={destination.id || index} className="destination-card min-w-[256px] cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => viewDestination(destination.id || `destination-${index}`)}>
                <div className="destination-image relative w-64 h-64 rounded-3xl overflow-hidden mb-5">
                  <img 
                    src={destination.image?.startsWith('http') ? destination.image : `https://images.unsplash.com/${destination.image || 'photo-1506905925346-21bda4d32df4'}?w=400&h=400&fit=crop`} 
                    alt={destination.name || 'Beautiful destination'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="destination-badge absolute top-4 left-4 bg-primary-900 text-white px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] font-['Poppins']">
                    {destination.discount || `from $${destination.price || (190 + index * 40)}`}
                  </div>
                </div>
                <div className="destination-info">
                  <h3 className="text-base font-medium leading-6 text-primary-900 mb-2 font-['Poppins']">{destination.name || 'Amazing Place'}</h3>
                  <div className="destination-rating flex items-center gap-1.5 text-xs font-semibold text-primary-400 font-['Poppins']">
                    <span className="rating-icon">📍</span>
                    <span>{destination.location || 'Beautiful Location'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="slider-controls hidden lg:flex absolute top-1/2 right-20 -translate-y-1/2 gap-2">
            <button className="slider-btn w-10 h-10 border-none rounded-2xl bg-white text-primary-400 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-blue-ocean hover:text-white">‹</button>
            <button className="slider-btn w-10 h-10 border-none rounded-2xl bg-white text-primary-400 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-blue-ocean hover:text-white">›</button>
          </div>
        </div>
      </section>

      {/* Planning Options */}
      <section className="planning-section py-12 md:py-20 lg:py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              How do you want to plan your trip?
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Choose the perfect way to create your dream journey
            </p>
          </div>

          <div className="planning-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1120px] mx-auto">
            {planningOptions.map((option, index) => (
              <div
                key={index}
                className={`planning-card bg-white rounded-2xl py-6 px-5 text-center cursor-pointer transition-all duration-300 border-2 relative hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:border-blue-ocean ${
                  index === 0 ? 'featured border-blue-ocean shadow-[0_8px_25px_rgba(59,113,254,0.15)]' : 'border-transparent'
                }`}
                onClick={() => navigate(option.href)}
              >
                {option.badge && (
                  <div className={`planning-badge absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-2xl text-xs font-bold font-['DM_Sans'] ${
                    index === 0 ? 'bg-emerald text-white' : 'bg-blue-ocean text-white'
                  }`}>
                    {option.badge}
                  </div>
                )}
                
                <div className="planning-icon text-[32px] my-4">{option.icon}</div>
                <h3 className="text-lg font-bold text-primary-900 mb-2 font-['DM_Sans']">
                  {option.title}
                </h3>
                <p className="text-sm text-primary-400 leading-5 mb-4 font-['Poppins']">{option.description}</p>
                
                <div className="planning-features mb-5">
                  {option.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature text-xs text-primary-900 mb-1.5 font-['DM_Sans'] font-medium">
                      {feature}
                    </div>
                  ))}
                </div>
                
                <button className="planning-cta bg-blue-ocean text-white border-none py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] w-full hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]">
                  {option.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="packages-section py-12 md:py-20 lg:py-[136px] bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Ready-made adventures
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Handcrafted itineraries by travel experts
            </p>
          </div>

          <div className="packages-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : featuredPackages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-primary-600">No featured trips available at the moment.</p>
                <Button onClick={loadHomeData} variant="outline" className="mt-4">
                  Retry Loading
                </Button>
              </div>
            ) : featuredPackages.map((pkg: any) => (
              <div
                key={pkg._id || pkg.id}
                className="package-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                onClick={() => viewPackage(pkg._id || pkg.id)}
              >
                <div className="package-image relative h-[228px] overflow-hidden">
                  <img
                    src={pkg.images?.[0]?.url?.startsWith('http') ? pkg.images[0].url : pkg.images?.[0]?.url ? `http://localhost:3000${pkg.images[0].url}` : pkg.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="package-badge absolute top-4 left-4 bg-primary-900 text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    {pkg.duration?.days ? `${pkg.duration.days} Days` : pkg.duration || '7 Days'}
                  </div>
                  <div className="package-price absolute top-4 right-4 bg-emerald text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    ${pkg.pricing?.estimated?.toLocaleString() || pkg.price || '1,999'}
                  </div>
                </div>
                
                <div className="package-info p-5">
                  <h3 className="text-base font-medium text-primary-900 mb-1 font-['Poppins']">{pkg.title}</h3>
                  <p className="text-xs text-primary-400 mb-3 font-['Poppins']">{pkg.primaryDestination?.name || pkg.location || 'Amazing Destination'}</p>
                  <div className="package-rating flex justify-between items-center text-xs font-['Poppins']">
                    <span className="text-primary-900 font-semibold">⭐ {pkg.stats?.rating || pkg.rating || '4.8'}</span>
                    <span className="text-primary-400">({pkg.stats?.reviewCount || pkg.reviews || '0'} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="packages-cta text-center">
            <button 
              onClick={() => navigate('/trips')}
              className="view-all-btn bg-transparent border-2 border-primary-200 text-primary-900 py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] hover:border-blue-ocean hover:text-blue-ocean"
            >
              View all trips
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof py-12 md:py-16 lg:py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-10 max-w-[1000px] mx-auto text-center">
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.happyCustomers?.toLocaleString() || '50,000'}+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Happy Travelers</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.averageRating || '4.9'}⭐</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Average Rating</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.destinations || '200'}+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Destinations</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.support || '24/7'}</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Blog */}
      <section className="travel-blog py-12 md:py-16 lg:py-20 bg-white">
        <div className="container max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20">
          <div className="section-header text-center mb-16">
            <h2 className="section-title text-5xl font-bold leading-[56px] text-primary-900 mb-3 font-['DM_Sans']">
              Latest travel insights & tips
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              Expert advice and inspiration for your next adventure
            </p>
          </div>
          
          <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
            {(featuredContent?.blogPosts || [
              {
                id: 'travel-planning-2024',
                title: 'Ultimate Travel Planning Guide 2024',
                excerpt: 'Everything you need to know to plan your perfect trip',
                category: 'Planning',
                date: 'Dec 15, 2024',
                readTime: '8 min read',
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop'
              },
              {
                id: 'budget-travel-tips',
                title: 'Travel More, Spend Less: Budget Secrets',
                excerpt: 'Smart strategies to explore the world without breaking the bank',
                category: 'Budget Tips',
                date: 'Dec 12, 2024',
                readTime: '7 min read',
                image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=350&h=200&fit=crop'
              },
              {
                id: 'best-destinations-2024',
                title: 'Top 10 Must-Visit Destinations 2024',
                excerpt: 'Discover the most amazing places to add to your travel bucket list',
                category: 'Destinations',
                date: 'Dec 10, 2024',
                readTime: '6 min read',
                image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=350&h=200&fit=crop'
              }
            ]).map((post, index) => (
              <div key={post.id || index} className="blog-card bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => navigate(`/blog/${post.id || post.slug}`)}>
                <div className="blog-image relative overflow-hidden">
                  <img 
                    src={post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop'} 
                    alt={post.title} 
                    className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop';
                    }}
                  />
                  <div className="blog-category absolute top-4 left-4 bg-blue-ocean text-white py-1.5 px-3 rounded-xl text-xs font-semibold">{post.category}</div>
                </div>
                <div className="blog-content p-6">
                  <h4 className="text-lg font-bold text-primary-900 mb-2 leading-tight">{post.title}</h4>
                  <p className="text-sm text-primary-400 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="blog-meta flex justify-between text-xs text-primary-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="blog-cta text-center">
            <a href="/blog" className="view-all-btn bg-blue-ocean text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 inline-block hover:bg-emerald hover:-translate-y-0.5">View All Articles</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;