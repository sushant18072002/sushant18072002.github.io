import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { APP_CONSTANTS } from '@/constants/app.constants';

// Static data moved outside component to prevent re-renders
const TABS = [
  { key: 'flights', label: 'Flights' },
  { key: 'hotels', label: 'Hotels' },
  { key: 'trips', label: 'Trips' }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');
  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveCounter, setLiveCounter] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const defaultDates = useMemo(() => ({
    weekFromNow: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    twoWeeksFromNow: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tenDaysFromNow: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }), []);

  const [flightData, setFlightData] = useState({
    from: '',
    to: '',
    departDate: defaultDates.weekFromNow,
    returnDate: defaultDates.twoWeeksFromNow,
    passengers: 1,
    class: 'economy',
    tripType: 'round-trip'
  });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [hotelData, setHotelData] = useState({
    location: '',
    checkIn: defaultDates.weekFromNow,
    checkOut: defaultDates.tenDaysFromNow,
    guests: 2,
    rooms: 1
  });
  const [tripData, setTripData] = useState({
    dreamInput: '',
    destination: '',
    category: 'any',
    travelers: 'couple',
    budget: 'mid-range'
  });
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [tripDestinationSuggestions, setTripDestinationSuggestions] = useState<any[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showTripDestinationSuggestions, setShowTripDestinationSuggestions] = useState(false);


  useEffect(() => {
    loadHomeData();
    loadLiveStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (featuredContent?.heroImages?.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroImage(prev => 
          (prev + 1) % featuredContent.heroImages.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredContent?.heroImages]);

  const loadLiveStats = async () => {
    try {
      const response = await apiService.getLiveStats();
      if (response.success && (response.data as any)?.tripsPlannedToday) {
        setLiveCounter((response.data as any).tripsPlannedToday);
      }
    } catch (error) {
      console.error('Live stats loading error:', error);
      setLiveCounter(2847);
    }
  };

  const loadHomeData = async () => {
    try {
      const [contentRes, statsRes] = await Promise.all([
        apiService.getHomeFeatured(),
        apiService.getHomeStats()
      ]);
      
      if (contentRes.success) {
        setFeaturedContent(contentRes.data);
      } else {
        setFeaturedContent({
          heroTitle: 'Discover Your Dream Journey',
          heroSubtitle: APP_CONSTANTS.APP_DESCRIPTION,
          heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop',
          adventureCategories: [
            { icon: '🏔️', title: 'Adventure Trips', places: '50+ Places', type: 'adventure-trips' },
            { icon: '🏛️', title: 'Cultural Trips', places: '40+ Places', type: 'cultural-trips' },
            { icon: '🏖️', title: 'Beach Trips', places: '30+ Places', type: 'beach-trips' }
          ],
          featuredTrips: []
        });
      }
      
      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setStats({ happyCustomers: 15000, averageRating: 4.9, destinations: 150, support: '24/7' });
      }
    } catch (error) {
      console.error('Home data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  const searchAirports = useCallback(async (query: string, field: 'from' | 'to') => {
    if (query.length < 2) {
      field === 'from' ? setFromSuggestions([]) : setToSuggestions([]);
      return;
    }
    try {
      const sanitizedQuery = query.replace(/[<>"'&]/g, '');
      const response = await apiService.searchAirports(sanitizedQuery);
      if (response.success && response.data?.airports) {
        field === 'from' ? setFromSuggestions(response.data.airports) : setToSuggestions(response.data.airports);
      }
    } catch (error) {
      console.error('Airport search error:', error);
      field === 'from' ? setFromSuggestions([]) : setToSuggestions([]);
    }
  }, []);

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const sanitizedQuery = query.replace(/[<>"'&]/g, '');
      const response = await apiService.searchLocations(sanitizedQuery);
      if (response.success && response.data?.locations) {
        setLocationSuggestions(response.data.locations);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
    }
  }, []);

  const searchTripDestinations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setTripDestinationSuggestions([]);
      return;
    }
    try {
      const sanitizedQuery = query.replace(/[<>"'&]/g, '');
      const response = await apiService.searchLocations(sanitizedQuery);
      if (response.success && response.data?.locations) {
        setTripDestinationSuggestions(response.data.locations);
      }
    } catch (error) {
      console.error('Trip destination search error:', error);
      setTripDestinationSuggestions([]);
    }
  }, []);

  const debouncedSearchAirports = useMemo(() => debounce(searchAirports, 300), [debounce, searchAirports]);
  const debouncedSearchLocations = useMemo(() => debounce(searchLocations, 300), [debounce, searchLocations]);
  const debouncedSearchTripDestinations = useMemo(() => debounce(searchTripDestinations, 300), [debounce, searchTripDestinations]);

  const handleSearch = async () => {
    try {
      switch (activeTab) {
        case 'flights':
          if (flightData.from && flightData.to) {
            const params = new URLSearchParams({
              from: flightData.from,
              to: flightData.to,
              departDate: flightData.departDate,
              returnDate: flightData.returnDate,
              passengers: flightData.passengers.toString(),
              class: flightData.class,
              tripType: flightData.tripType
            });
            navigate(`/flights?${params}`);
          }
          break;
        case 'hotels':
          if (hotelData.location) {
            const params = new URLSearchParams({
              location: hotelData.location,
              checkIn: hotelData.checkIn,
              checkOut: hotelData.checkOut,
              guests: hotelData.guests.toString(),
              rooms: hotelData.rooms.toString()
            });
            navigate(`/hotels?${params}`);
          }
          break;
        case 'trips':
          const params = new URLSearchParams();
          if (tripData.dreamInput) params.append('description', tripData.dreamInput);
          if (tripData.destination) params.append('destination', tripData.destination);
          if (tripData.category !== 'any') params.append('category', tripData.category);
          params.append('travelers', tripData.travelers);
          params.append('budget', tripData.budget);
          navigate(`/trips?${params}`);
          break;
      }
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const selectAdventure = (type: string) => {
    navigate(`/trips?category=${type}`);
  };

  const viewDestination = (destination: any) => {
    navigate(`/trips?destination=${destination.location}`);
  };

  const viewPackage = (id: string) => {
    navigate(`/trips/${id}`);
  };

  const adventureCategories = featuredContent?.adventureCategories || [
    { icon: '🏔️', title: 'Adventure Trips', places: '50+ Places', type: 'adventure-trips' },
    { icon: '🏛️', title: 'Cultural Trips', places: '40+ Places', type: 'cultural-trips' },
    { icon: '🏖️', title: 'Beach Trips', places: '30+ Places', type: 'beach-trips' }
  ];

  const featuredPackages = featuredContent?.featuredTrips || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Hero Section with Prominent Search */}
      <section className="relative">
        <div className="mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="relative h-[75vh] bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 overflow-hidden rounded-2xl lg:rounded-3xl">
            {featuredContent?.heroImages?.length > 1 ? (
              <div className="absolute top-0 left-0 w-full h-full">
                {featuredContent.heroImages.map((image: string, index: number) => (
                  <img 
                    key={index}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentHeroImage ? 'opacity-100' : 'opacity-0'
                    }`}
                    src={image}
                    alt={`Hero ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop";
                    }}
                  />
                ))}
              </div>
            ) : (
              <img 
                src={featuredContent?.heroImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1280&h=776&fit=crop"} 
                alt="Travel destination" 
                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/1280x500/3B71FE/FFFFFF?text=Travel+Destination';
                }}
              />
            )}
            
            <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
              <div className="max-w-md lg:max-w-lg">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full text-xs mb-4 text-white">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm">{liveCounter.toLocaleString()} dreams planned today</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-3 leading-tight">
                  {featuredContent?.heroTitle || 'Discover Your Dream Journey'}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                  {featuredContent?.heroSubtitle || APP_CONSTANTS.APP_DESCRIPTION}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prominent Search Widget */}
        <div className="mx-auto px-2 sm:px-4 relative">
          <div className="max-w-6xl mx-auto -mt-32 sm:-mt-36 lg:-mt-40 relative z-20">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
              {/* Tab Navigation */}
              <div className="flex items-center gap-6 lg:gap-12 mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => (
                  <button 
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 lg:pb-8 font-bold text-sm whitespace-nowrap transition-colors min-w-0 flex-shrink-0 ${
                      activeTab === tab.key 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Forms */}
              {activeTab === 'flights' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFlightData(prev => ({ ...prev, tripType: 'round-trip' }))}
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
                          flightData.tripType === 'round-trip' 
                            ? 'bg-gray-900 text-white' 
                            : 'border-2 border-gray-200 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Round-trip
                      </button>
                      <button 
                        onClick={() => setFlightData(prev => ({ ...prev, tripType: 'one-way' }))}
                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-colors ${
                          flightData.tripType === 'one-way' 
                            ? 'bg-gray-900 text-white' 
                            : 'border-2 border-gray-200 text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        One-way
                      </button>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-bold text-gray-900">{flightData.passengers} guest{flightData.passengers > 1 ? 's' : ''}</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {showPassengerDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] z-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">Passengers</span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setFlightData(prev => ({ ...prev, passengers: Math.max(1, prev.passengers - 1) }))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{flightData.passengers}</span>
                              <button 
                                onClick={() => setFlightData(prev => ({ ...prev, passengers: Math.min(9, prev.passengers + 1) }))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowPassengerDropdown(false)}
                            className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3 lg:gap-4 sm:items-end">
                    <div className="relative">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Flying from</div>
                        <input
                          type="text"
                          value={flightData.from}
                          onChange={(e) => {
                            setFlightData(prev => ({ ...prev, from: e.target.value }));
                            debouncedSearchAirports(e.target.value.replace(/[<>"'&]/g, ''), 'from');
                            setShowFromSuggestions(true);
                          }}
                          onFocus={() => setShowFromSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowFromSuggestions(false), 150)}
                          placeholder="Departure city"
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">📍</span>
                      </div>
                      {showFromSuggestions && fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1 z-50">
                          {fromSuggestions.map((airport) => (
                            <div
                              key={airport._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFlightData(prev => ({ ...prev, from: `${airport.city} (${airport.code})` }));
                                setShowFromSuggestions(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{airport.name}</div>
                              <div className="text-xs text-gray-500">{airport.code} - {airport.city}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="h-16 pl-10 pr-3 pt-2 pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-[#777E90] font-['Poppins'] mb-1">Flying to</div>
                        <input
                          type="text"
                          value={flightData.to}
                          onChange={(e) => {
                            setFlightData(prev => ({ ...prev, to: e.target.value }));
                            debouncedSearchAirports(e.target.value.replace(/[<>"'&]/g, ''), 'to');
                            setShowToSuggestions(true);
                          }}
                          onFocus={() => setShowToSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowToSuggestions(false), 150)}
                          placeholder="Destination city"
                          className="text-lg font-semibold text-[#23262F] font-['Poppins'] bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-3 top-3 w-5 h-5 flex items-center justify-center">
                        <span className="text-[#B1B5C3] text-base">📍</span>
                      </div>
                      <button 
                        onClick={() => {
                          const temp = flightData.from;
                          setFlightData(prev => ({ ...prev, from: prev.to, to: temp }));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      {showToSuggestions && toSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1 z-50">
                          {toSuggestions.map((airport) => (
                            <div
                              key={airport._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFlightData(prev => ({ ...prev, to: `${airport.city} (${airport.code})` }));
                                setShowToSuggestions(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{airport.name}</div>
                              <div className="text-xs text-gray-500">{airport.code} - {airport.city}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="h-16 pl-10 pr-3 pt-2 pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-[#777E90] font-['Poppins'] mb-1">Departure</div>
                        <input
                          type="date"
                          value={flightData.departDate}
                          onChange={(e) => setFlightData(prev => ({ ...prev, departDate: e.target.value }))}
                          className="text-lg font-semibold text-[#23262F] font-['Poppins'] bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-3 top-3 w-5 h-5 flex items-center justify-center">
                        <span className="text-[#B1B5C3] text-base">📅</span>
                      </div>
                    </div>
                    {flightData.tripType === 'round-trip' && (
                      <div className="relative">
                        <div className="h-16 pl-10 pr-3 pt-2 pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                          <div className="text-xs text-[#777E90] font-['Poppins'] mb-1">Return</div>
                          <input
                            type="date"
                            value={flightData.returnDate}
                            onChange={(e) => setFlightData(prev => ({ ...prev, returnDate: e.target.value }))}
                            className="text-lg font-semibold text-[#23262F] font-['Poppins'] bg-transparent border-none outline-none w-full"
                          />
                        </div>
                        <div className="absolute left-3 top-3 w-5 h-5 flex items-center justify-center">
                          <span className="text-[#B1B5C3] text-base">📅</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end sm:justify-start">
                      <button 
                        onClick={handleSearch}
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-full font-bold transition-all duration-300 hover:shadow-lg flex items-center justify-center touch-manipulation"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="space-y-4">
                  <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-3 lg:gap-4 sm:items-end">
                    <div className="relative">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Destination</div>
                        <input
                          type="text"
                          value={hotelData.location}
                          onChange={(e) => {
                            setHotelData(prev => ({ ...prev, location: e.target.value }));
                            debouncedSearchLocations(e.target.value.replace(/[<>"'&]/g, ''));
                            setShowLocationSuggestions(true);
                          }}
                          onFocus={() => setShowLocationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
                          placeholder="Where are you going?"
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">🏨</span>
                      </div>
                      {showLocationSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1 z-50">
                          {locationSuggestions.map((location) => (
                            <div
                              key={location._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setHotelData(prev => ({ ...prev, location: `${location.name}, ${location.country}` }));
                                setShowLocationSuggestions(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-xs text-gray-500">{location.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Check in</div>
                        <input
                          type="date"
                          value={hotelData.checkIn}
                          onChange={(e) => setHotelData(prev => ({ ...prev, checkIn: e.target.value }))}
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">📅</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Check out</div>
                        <input
                          type="date"
                          value={hotelData.checkOut}
                          onChange={(e) => setHotelData(prev => ({ ...prev, checkOut: e.target.value }))}
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">📅</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Travelers</div>
                        <select
                          value={`${hotelData.guests}-${hotelData.rooms}`}
                          onChange={(e) => {
                            const [guests, rooms] = e.target.value.split('-').map(Number);
                            setHotelData(prev => ({ ...prev, guests, rooms }));
                          }}
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        >
                          <option value="1-1">1 Adult, 1 Room</option>
                          <option value="2-1">2 Adults, 1 Room</option>
                          <option value="3-1">3 Adults, 1 Room</option>
                          <option value="4-1">4 Adults, 1 Room</option>
                          <option value="2-2">2 Adults, 2 Rooms</option>
                          <option value="4-2">4 Adults, 2 Rooms</option>
                        </select>
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">👥</span>
                      </div>
                    </div>
                    <div className="flex justify-end sm:justify-start">
                      <button 
                        onClick={handleSearch}
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-full font-bold transition-all duration-300 hover:shadow-lg flex items-center justify-center touch-manipulation"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trips' && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                      <div className="text-xs text-gray-500 mb-1">Dream Trip</div>
                      <input
                        type="text"
                        value={tripData.dreamInput}
                        onChange={(e) => setTripData(prev => ({ ...prev, dreamInput: e.target.value }))}
                        placeholder="Romantic Paris, Adventure Japan, Beach Bali..."
                        className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                      />
                    </div>
                    <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                      <span className="text-gray-400 text-sm sm:text-base">✨</span>
                    </div>
                  </div>
                  <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-3 lg:gap-4 sm:items-end">
                    <div className="relative flex-[30%]">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Destination</div>
                        <input
                          type="text"
                          value={tripData.destination}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[<>"'&]/g, '');
                            setTripData(prev => ({ ...prev, destination: value }));
                            debouncedSearchTripDestinations(value);
                            setShowTripDestinationSuggestions(true);
                          }}
                          onFocus={() => setShowTripDestinationSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowTripDestinationSuggestions(false), 150)}
                          placeholder="Where do you want to go?"
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        />
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">🌍</span>
                      </div>
                      {showTripDestinationSuggestions && tripDestinationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1 z-50">
                          {tripDestinationSuggestions.map((location) => (
                            <div
                              key={location._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setTripData(prev => ({ ...prev, destination: `${location.name}, ${location.country}` }));
                                setShowTripDestinationSuggestions(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-xs text-gray-500">{location.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-[30%]">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Trip Type</div>
                        <select
                          value={tripData.category}
                          onChange={(e) => setTripData(prev => ({ ...prev, category: e.target.value }))}
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        >
                          <option value="any">Any Type</option>
                          <option value="adventure">Adventure & Outdoor</option>
                          <option value="cultural">Cultural & Historical</option>
                          <option value="beach">Beach & Relaxation</option>
                          <option value="city">City & Urban</option>
                          <option value="nature">Nature & Wildlife</option>
                        </select>
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">🎭</span>
                      </div>
                    </div>
                    <div className="relative flex-[30%]">
                      <div className="h-14 sm:h-16 pl-8 sm:pl-10 pr-3 pt-2 pb-4 sm:pb-6 border-0 rounded-xl bg-gray-50 flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-1">Budget</div>
                        <select
                          value={tripData.budget}
                          onChange={(e) => setTripData(prev => ({ ...prev, budget: e.target.value }))}
                          className="text-sm sm:text-lg font-semibold text-gray-900 bg-transparent border-none outline-none w-full"
                        >
                          <option value="budget">Budget ($500-1500)</option>
                          <option value="mid-range">Mid-range ($1500-3000)</option>
                          <option value="luxury">Luxury ($3000+)</option>
                        </select>
                      </div>
                      <div className="absolute left-2 sm:left-3 top-2 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        <span className="text-gray-400 text-sm sm:text-base">💰</span>
                      </div>
                    </div>
                    <div className="flex justify-end sm:justify-start flex-[10%]">
                      <button 
                        onClick={handleSearch}
                        className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 hover:bg-emerald-500 text-white rounded-xl sm:rounded-full font-bold transition-all duration-300 hover:shadow-lg flex items-center justify-center touch-manipulation"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories */}
      <section className="pt-16 pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {featuredContent?.adventureSection?.title || "Let's go on an adventure"}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              {featuredContent?.adventureSection?.subtitle || "Find and book a great experience."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {adventureCategories.map((category: any, index: number) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center gap-4 cursor-pointer transition-all duration-300 p-4 sm:p-6 rounded-xl lg:rounded-2xl bg-white shadow-md hover:-translate-y-1 hover:shadow-lg active:scale-95 touch-manipulation"
                onClick={() => selectAdventure(category.type)}
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center text-3xl sm:text-5xl lg:text-6xl rounded-2xl lg:rounded-3xl bg-gradient-to-br from-cyan-100 to-emerald-200 flex-shrink-0">
                  {category.icon}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold uppercase inline-block">
                    {category.places}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              How it works
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Simple steps to your perfect trip
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-32 left-24 right-24 h-px border-t-2 border-dashed border-gray-200"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-16 lg:gap-32">
              {(featuredContent?.howItWorksSteps || [
                { id: 1, title: "Search & Discover", description: "Find your perfect trip using our AI-powered search", image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=256&h=269&fit=crop' },
                { id: 2, title: "Book with Confidence", description: "Secure booking with flexible cancellation", image: 'https://images.unsplash.com/photo-1551632811-1312ad7a1e3e?w=256&h=269&fit=crop' },
                { id: 3, title: "Travel & Enjoy", description: "Experience your dream trip with our support", image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=256&h=269&fit=crop' }
              ]).map((step: any, index: number) => (
                <div key={step.id || index} className="text-center relative">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-[269px] bg-gray-100 rounded-2xl mb-6 sm:mb-8 mx-auto overflow-hidden">
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {featuredContent?.destinationSpotlight?.title || 'Explore amazing destinations'}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              {featuredContent?.destinationSpotlight?.subtitle || 'Discover breathtaking places around the world'}
            </p>
          </div>
          
          <div className="flex gap-8 overflow-x-auto scroll-smooth pb-5">
            {featuredContent?.destinationSpotlight?.destinations?.map((destination: any, index: number) => (
              <div key={destination.id || index} className="min-w-[256px] cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => viewDestination(destination)}>
                <div className="w-64 h-64 rounded-3xl overflow-hidden mb-5 relative">
                  <img 
                    src={destination.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'} 
                    alt={destination.name || 'Beautiful destination'} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-[#23262F] text-white px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] font-['Poppins']">
                    from ${destination.price}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium leading-6 text-[#23262F] mb-2 font-['Poppins']">{destination.name}</h3>
                  <div className="flex items-center justify-between text-xs font-['Poppins']">
                    <div className="flex items-center gap-1.5 text-[#777E90]">
                      <span>📍</span>
                      <span>{destination.location}</span>
                    </div>
                    {destination.rating && (
                      <div className="flex items-center gap-1 text-[#23262F]">
                        <span>⭐</span>
                        <span className="font-semibold">{destination.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-12 min-w-full">
                <p className="text-[#777E90] mb-4">Featured destinations will be available soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Ready-made adventures
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Handcrafted itineraries by travel experts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full flex justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#777E90] font-['Poppins'] text-lg">Loading amazing trips...</p>
                </div>
              </div>
            ) : featuredPackages.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-[#777E90]">No featured trips available at the moment.</p>
              </div>
            ) : featuredPackages.map((pkg: any) => (
              <div
                key={pkg._id || pkg.id}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                onClick={() => viewPackage(pkg._id || pkg.id)}
              >
                <div className="relative h-[228px] overflow-hidden">
                  <img
                    src={pkg.images?.[0]?.url || pkg.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-[#23262F] text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    {pkg.duration?.days ? `${pkg.duration.days} Days` : '7 Days'}
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white py-1 px-2 rounded-lg text-xs font-bold font-['DM_Sans']">
                    ${pkg.pricing?.estimated?.toLocaleString() || '1,999'}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-base font-medium text-[#23262F] mb-1 font-['Poppins']">{pkg.title}</h3>
                  <p className="text-xs text-[#777E90] mb-3 font-['Poppins']">{pkg.primaryDestination?.name || 'Amazing Destination'}</p>
                  <div className="flex justify-between items-center text-xs font-['Poppins']">
                    <span className="text-[#23262F] font-semibold">⭐ {pkg.stats?.rating || '4.8'}</span>
                    <span className="text-[#777E90]">({pkg.stats?.reviewCount || '0'} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigate('/trips')}
              className="bg-transparent border-2 border-[#E6E8EC] text-[#23262F] py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] hover:border-blue-600 hover:text-blue-600"
            >
              View all trips
            </button>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Latest travel insights & tips
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Expert advice and inspiration for your next adventure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {(featuredContent?.blogPosts || []).map((post: any, index: number) => (
              <div key={post.id || index} className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => navigate(`/blog/${post.id || post.slug}`)}>
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop'} 
                    alt={post.title} 
                    className="w-full h-[200px] object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=350&h=200&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white py-1.5 px-3 rounded-xl text-xs font-semibold">{post.category}</div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-[#23262F] mb-2 leading-tight">{post.title}</h4>
                  <p className="text-sm text-[#777E90] leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex justify-between text-xs text-[#777E90]">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => navigate('/blog')}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:bg-emerald-500 hover:-translate-y-0.5 border-none cursor-pointer"
            >
              View All Articles
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 max-w-[1000px] mx-auto text-center">
            <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600">
              <div className="text-[40px] font-black bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.happyCustomers?.toLocaleString() || '15K'}+</div>
              <div className="text-base text-[#777E90] font-medium font-['Poppins']">Happy Travelers</div>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600">
              <div className="text-[40px] font-black bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.averageRating || '4.9'}⭐</div>
              <div className="text-base text-[#777E90] font-medium font-['Poppins']">Average Rating</div>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600">
              <div className="text-[40px] font-black bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.destinations || '150'}+</div>
              <div className="text-base text-[#777E90] font-medium font-['Poppins']">Destinations</div>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-3xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600">
              <div className="text-[40px] font-black bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.support || '24/7'}</div>
              <div className="text-base text-[#777E90] font-medium font-['Poppins']">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              Quick Access
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
              Jump directly to any trip
            </p>
          </div>
          
          <div className="max-w-[1000px] mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
              {(featuredContent?.quickAccessTrips && featuredContent.quickAccessTrips.length > 0) ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {featuredContent.quickAccessTrips.map((trip: any, index: number) => (
                    <button
                      key={trip.slug || index}
                      onClick={() => navigate(`/trips/${trip.slug}`)}
                      className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all duration-200 group min-h-[44px] border border-gray-200 hover:border-blue-200"
                    >
                      <span className="text-blue-600 group-hover:text-emerald-500 transition-colors text-sm">#</span>
                      <span className="text-[#23262F] font-medium font-['Poppins'] group-hover:text-blue-600 transition-colors text-sm whitespace-nowrap">
                        {trip.title}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#777E90] font-['Poppins']">No quick access trips available</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/trips')}
              className="bg-blue-600 text-white py-3 px-6 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 font-['DM_Sans'] hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)] border-none"
            >
              View All Trips
            </button>
          </div>
        </div>
      </section>
      {/* Newsletter Signup */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
              supercharge your planning powers
            </h2>
            <p className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
              Travel to make<br/>memories all<br/>around the world
            </p>
            <p className="text-base text-[#777E90] font-['Poppins'] leading-6 mb-6">
              Stacks is a production-ready library of stackable<br/>content blocks built in React Native.
            </p>
            
            <div className="max-w-[300px] mx-auto relative">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-4 pr-12 py-3 rounded-3xl border-2 border-[#E6E8EC] font-['Poppins'] text-sm focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-2 top-2 w-8 h-8 bg-[#3B71FE] text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;