import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api.service';
import { APP_CONSTANTS, TRIP_CONSTANTS } from '@/constants/app.constants';
import { handleApiError, getUserFriendlyMessage } from '@/utils/error-handler';
import { debounce, performanceMonitor } from '@/utils/performance';
import '@/styles/home-mobile.css';

// Types
interface Location {
  _id: string;
  name: string;
  country: string;
  type: string;
}

interface Airport {
  _id: string;
  code: string;
  name: string;
  city: string;
}

interface AdventureCategory {
  icon: string;
  title: string;
  places: string;
  type: string;
}

interface PlanningOption {
  icon: string;
  title: string;
  description: string;
  badge: string;
  features: string[];
  buttonText: string;
  href: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  slug?: string;
}

interface Destination {
  id: number | string;
  name: string;
  location: string;
  price: number;
  image: string;
  discount?: string | null;
  rating?: number;
  reviewCount?: number;
  popularFor?: string[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itinerary');
  
  // Initialize with packages selected when component mounts
  useEffect(() => {
    setSelectedOption('packages');
  }, []);
  const [dreamInput, setDreamInput] = useState('');
  const [liveCounter, setLiveCounter] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState('packages');
  const [flightForm, setFlightForm] = useState({
    from: '',
    to: '',
    departDate: new Date(),
    returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    passengers: 1,
    class: 'economy'
  });
  const [hotelForm, setHotelForm] = useState({
    location: '',
    checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    guests: 2,
    rooms: 1
  });
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showTripToSuggestions, setShowTripToSuggestions] = useState(false);
  const [tripForm, setTripForm] = useState({
    to: '',
    tripType: 'any',
    departDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    travelers: 'couple',
    budget: 'mid-range'
  });
  const [fromAirports, setFromAirports] = useState<Airport[]>([]);
  const [toAirports, setToAirports] = useState<Airport[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial counter from API
    const loadLiveStats = async () => {
      try {
        const response = await apiService.getLiveStats();
        if (response.success && response.data?.tripsPlannedToday) {
          setLiveCounter(response.data.tripsPlannedToday);
        }
      } catch (error) {
        console.error('Live stats loading error:', error);
        setLiveCounter(2847); // Fallback only if API fails
      }
    };
    
    loadLiveStats();
    
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Hero image slider with preloading
  useEffect(() => {
    if (featuredContent?.heroImages?.length > 1 && !featuredContent?.heroVideo) {
      // Preload all hero images
      featuredContent.heroImages.forEach((src: string) => {
        const img = new Image();
        img.src = src;
      });
      
      const interval = setInterval(() => {
        setCurrentHeroImage(prev => 
          (prev + 1) % featuredContent.heroImages.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredContent?.heroImages, featuredContent?.heroVideo]);

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const selectItineraryOption = (option: string) => {
    setSelectedOption(option);
  };

  const searchLocations = React.useCallback(
    debounce(async (query: string) => {
      if (query.length < APP_CONSTANTS.MIN_SEARCH_LENGTH) {
        setLocationSuggestions([]);
        return;
      }
      
      try {
        const response = await performanceMonitor.measureAsync(
          'location-search',
          () => apiService.searchLocations(query)
        );
        
        if (response.success && response.data?.locations) {
          setLocationSuggestions(response.data.locations);
        } else {
          setLocationSuggestions([]);
        }
      } catch (error) {
        const appError = handleApiError(error);
        console.error('Location search error:', getUserFriendlyMessage(appError));
        setLocationSuggestions([]);
      }
    }, APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
    []
  );

  const searchAirports = React.useCallback(
    debounce(async (query: string, setAirportsFunc: (airports: Airport[]) => void) => {
      if (query.length < APP_CONSTANTS.MIN_SEARCH_LENGTH) {
        setAirportsFunc([]);
        return;
      }
      
      try {
        const response = await performanceMonitor.measureAsync(
          'airport-search',
          () => apiService.searchAirports(query)
        );
        
        if (response.success && response.data?.airports) {
          setAirportsFunc(response.data.airports);
        } else {
          setAirportsFunc([]);
        }
      } catch (error) {
        const appError = handleApiError(error);
        console.error('Airport search error:', getUserFriendlyMessage(appError));
        setAirportsFunc([]);
      }
    }, APP_CONSTANTS.SEARCH_DEBOUNCE_MS),
    []
  );

  const getAirportCodeFromCity = async (cityName: string): Promise<string> => {
    try {
      const response = await apiService.searchAirports(cityName);
      if (response.success && response.data?.airports?.length > 0) {
        return response.data.airports[0].code;
      }
      return cityName; // Fallback to city name if no airport found
    } catch (error) {
      console.error('Airport code lookup error:', error);
      return cityName;
    }
  };

  const performSearch = async () => {
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
        if (tripForm.departDate) params.append('date', tripForm.departDate.toISOString().split('T')[0]);
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
      
      const fromCode = await getAirportCodeFromCity(flightForm.from);
      const toCode = await getAirportCodeFromCity(flightForm.to);
      
      const params = new URLSearchParams({
        from: fromCode,
        to: toCode,
        departDate: flightForm.departDate.toISOString().split('T')[0],
        returnDate: flightForm.returnDate.toISOString().split('T')[0],
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
        checkIn: hotelForm.checkIn.toISOString().split('T')[0],
        checkOut: hotelForm.checkOut.toISOString().split('T')[0],
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
    // Map trip category slugs to search terms
    const categoryMap: Record<string, string> = {
      'adventure-trips': 'adventure',
      'cultural-trips': 'cultural', 
      'beach-trips': 'beach'
    };
    const searchTerm = categoryMap[type] || type;
    navigate(`/trips?category=${searchTerm}`);
  };

  const viewDestination = (id: string) => {
    // Check if we have trips for this destination, otherwise show destination info
    navigate(`/destination/${id}`);
  };

  const viewPackage = (id: string) => {
    navigate(`/trips/${id}`);
  };

  const adventureCategories: AdventureCategory[] = featuredContent?.adventureCategories || [
    {
      icon: '🏔️',
      title: 'Mountain Adventures',
      places: '50+ Places',
      type: 'adventure'
    },
    {
      icon: '🏖️',
      title: 'Beach Escapes',
      places: '30+ Places',
      type: 'relaxation'
    },
    {
      icon: '🏛️',
      title: 'Cultural Tours',
      places: '40+ Places',
      type: 'cultural'
    },
    {
      icon: '🌆',
      title: 'City Breaks',
      places: '25+ Places',
      type: 'city'
    },
    {
      icon: '🦁',
      title: 'Wildlife Safari',
      places: '15+ Places',
      type: 'nature'
    },
    {
      icon: '🍷',
      title: 'Food & Wine',
      places: '20+ Places',
      type: 'food'
    }
  ];

  const planningOptions: PlanningOption[] = featuredContent?.planningOptions || [
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
      href: '/trips',
    },
    {
      icon: '🛠️',
      title: 'Custom Builder',
      description: 'Step-by-step control over every detail',
      badge: '🎯 Pro',
      features: ['🎛️ Full control', '📋 5-step wizard'],
      buttonText: 'Start Building',
      href: '/custom-builder',
    },
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  // Load hero data immediately for faster rendering
  useEffect(() => {
    loadHeroData();
  }, []);



  const loadHeroData = async () => {
    try {
      // Check if hero data is cached
      const cachedHero = sessionStorage.getItem('hero_data');
      if (cachedHero) {
        const parsed = JSON.parse(cachedHero);
        if (Date.now() - parsed.timestamp < 300000) { // 5 minutes cache
          setFeaturedContent(parsed.data);
          return;
        }
      }
      
      const heroRes = await apiService.getHomeFeatured();
      if (heroRes.success) {
        setFeaturedContent(heroRes.data);
        // Cache hero data
        sessionStorage.setItem('hero_data', JSON.stringify({
          data: heroRes.data,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Hero data loading error:', error);
      // Fallback to default hero content
      setFeaturedContent({
        heroTitle: 'Air, sleep, dream',
        heroSubtitle: 'Find and book a great experience.',
        heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop'
      });
    }
  };

  const loadHomeData = async () => {
    try {
      const [contentRes, statsRes] = await performanceMonitor.measureAsync(
        'home-data-load',
        () => Promise.all([
          apiService.getHomeFeatured(),
          apiService.getHomeStats()
        ])
      );
      
      if (contentRes.success) {
        setFeaturedContent(contentRes.data);
      } else {
        console.warn('Failed to load featured content:', contentRes.error?.message);
      }
      
      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        console.warn('Failed to load stats:', statsRes.error?.message);
      }
    } catch (error) {
      const appError = handleApiError(error);
      console.error('Home data loading error:', getUserFriendlyMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const featuredPackages = featuredContent?.featuredTrips || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero relative h-[calc(100vh-120px)] flex items-center overflow-visible">
        {featuredContent?.heroVideo ? (
          <video 
            className="hero-bg absolute top-0 left-0 w-full h-full object-cover z-[1]" 
            src={featuredContent.heroVideo}
            autoPlay
            muted={featuredContent.heroVideoMuted !== false}
            loop
            playsInline
            preload="metadata"
          />
        ) : featuredContent?.heroImages?.length > 1 ? (
          <div className="hero-slider absolute top-0 left-0 w-full h-full z-[1]">
            {featuredContent.heroImages.map((image, index) => (
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
            className="hero-bg absolute top-0 left-0 w-full h-full object-cover z-[1]" 
            src={featuredContent?.heroImage || featuredContent?.heroImages?.[0] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop"} 
            alt="Beautiful landscape"
            loading="eager"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop";
            }}
          />
        )}
        <div className="hero-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[rgba(15,23,42,0.4)] via-[rgba(30,64,175,0.3)] to-[rgba(16,185,129,0.4)] z-[2]"></div>
        
        <div className="hero-content relative z-10 max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 lg:gap-6 items-center w-full h-full">
          <div className="hero-text text-white text-center lg:text-left order-2 lg:order-1">
            <div className="hero-badge inline-flex items-center gap-2 bg-white/20 backdrop-blur-[10px] border border-white/30 px-3 py-1.5 rounded-full text-xs mb-3">
              <div className="live-dot w-1.5 h-1.5 bg-emerald rounded-full animate-pulse"></div>
              <span>{liveCounter.toLocaleString()} dreams planned today</span>
            </div>
            
            <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 font-['DM_Sans']">
              {featuredContent?.heroTitle || 'Air, sleep, dream'}
            </h1>
            <p className="hero-subtitle text-lg md:text-xl font-normal leading-7 mb-6 font-['Poppins'] opacity-90">
              {featuredContent?.heroSubtitle || 'Find and book a great experience.'}
            </p>
            <button 
              className="hero-cta bg-blue-ocean text-white border-none px-5 py-2 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-300 font-['DM_Sans'] inline-flex items-center gap-2 hover:bg-emerald hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(88,194,125,0.3)]"
              onClick={() => document.querySelector('.search-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Start your search
            </button>
          </div>

          {/* Search Widget */}
          <div className="search-widget bg-white/95 rounded-2xl p-4 md:p-6 shadow-[0_20px_40px_-10px_rgba(15,15,15,0.15)] border border-white/50 w-full max-w-none relative order-1 lg:order-2" style={{zIndex: 1}}>
            {/* Search Tabs */}
            <div className="search-tabs flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => switchTab('flights')}
                className={`search-tab flex-1 py-2 px-2 md:px-3 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-md flex items-center justify-center gap-2 ${
                  activeTab === 'flights'
                    ? 'text-white bg-blue-ocean shadow-md'
                    : 'text-gray-600 hover:text-blue-ocean hover:bg-white'
                }`}
              >
                <span className="text-base">✈️</span>
                <span className="font-bold">Flights</span>
              </button>
              <button
                onClick={() => switchTab('hotels')}
                className={`search-tab flex-1 py-2 px-2 md:px-3 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-md flex items-center justify-center gap-2 ${
                  activeTab === 'hotels'
                    ? 'text-white bg-blue-ocean shadow-md'
                    : 'text-gray-600 hover:text-blue-ocean hover:bg-white'
                }`}
              >
                <span className="text-base">🏨</span>
                <span className="font-bold">Hotels</span>
              </button>
              <button
                onClick={() => switchTab('itinerary')}
                className={`search-tab flex-1 py-2 px-2 md:px-3 font-semibold text-sm cursor-pointer relative font-['DM_Sans'] transition-all duration-300 rounded-md flex items-center justify-center gap-2 ${
                  activeTab === 'itinerary'
                    ? 'text-white bg-blue-ocean shadow-md'
                    : 'text-gray-600 hover:text-blue-ocean hover:bg-white'
                }`}
              >
                <span className="text-base">✨</span>
                <span className="font-bold hidden sm:inline">Complete Trip</span>
                <span className="font-bold sm:hidden">Trip</span>
              </button>
            </div>

            {/* Search Forms */}
            <div className={`search-content ${activeTab === 'flights' ? 'block' : 'hidden'}`} style={{overflow: 'visible'}}>
              <div className="search-form flex flex-col gap-2">
                <div className="form-row grid grid-cols-2 gap-3 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">🛫</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5 relative">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">From</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full placeholder:text-primary-400 placeholder:font-normal" 
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
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1" style={{zIndex: 999999}}>
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
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">🛬</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5 relative">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">To</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full placeholder:text-primary-400 placeholder:font-normal" 
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
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1" style={{zIndex: 999999}}>
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
                <div className="form-row grid grid-cols-2 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Departure</div>
                      <DatePicker
                        selected={flightForm.departDate}
                        onChange={(date) => setFlightForm(prev => ({ ...prev, departDate: date || new Date() }))}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer pl-2"
                        placeholderText="Select date"
                        dateFormat="MMM dd, yyyy"
                        minDate={new Date()}
                        popperClassName="custom-datepicker-popper"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Return</div>
                      <DatePicker
                        selected={flightForm.returnDate}
                        onChange={(date) => setFlightForm(prev => ({ ...prev, returnDate: date || new Date() }))}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer pl-2"
                        placeholderText="Select date"
                        dateFormat="MMM dd, yyyy"
                        minDate={flightForm.departDate}
                        popperClassName="custom-datepicker-popper"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Passengers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">✈️</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Class</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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

            <div className={`search-content ${activeTab === 'hotels' ? 'block' : 'hidden'}`} style={{overflow: 'visible'}}>
              <div className="search-form flex flex-col gap-2">
                <div className="form-row grid grid-cols-1 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">🏨</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5 relative">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Destination</div>
                      <input 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full placeholder:text-primary-400 placeholder:font-normal" 
                        placeholder="Where are you going?" 
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
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1" style={{zIndex: 999999}}>
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
                <div className="form-row grid grid-cols-2 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Check in</div>
                      <DatePicker
                        selected={hotelForm.checkIn}
                        onChange={(date) => setHotelForm(prev => ({ ...prev, checkIn: date || new Date() }))}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer pl-2"
                        placeholderText="Select date"
                        dateFormat="MMM dd, yyyy"
                        minDate={new Date()}
                        popperClassName="custom-datepicker-popper"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Check out</div>
                      <DatePicker
                        selected={hotelForm.checkOut}
                        onChange={(date) => setHotelForm(prev => ({ ...prev, checkOut: date || new Date() }))}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer pl-2"
                        placeholderText="Select date"
                        dateFormat="MMM dd, yyyy"
                        minDate={hotelForm.checkIn}
                        popperClassName="custom-datepicker-popper"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-[1fr_auto] gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Travelers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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
                    className="search-btn w-auto h-12 bg-gradient-to-r from-blue-600 to-blue-700 border-none rounded-xl cursor-pointer flex items-center justify-center text-sm ml-4 transition-all duration-300 text-white font-['DM_Sans'] font-semibold gap-2 px-5 min-w-[120px] hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                  >
                    <span className="text-base">🏨</span>
                    <span>Search Hotels</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={`search-content ${activeTab === 'itinerary' ? 'block' : 'hidden'} active min-h-[240px]`} style={{overflow: 'visible'}}>
              <div className="search-form flex flex-col gap-2">
                <div className="form-row grid grid-cols-1 gap-2 items-end">
                  <div className="form-field full-width col-span-full flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">✨</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Dream Trip</div>
                      <input 
                        value={dreamInput}
                        onChange={(e) => setDreamInput(e.target.value)}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full placeholder:text-primary-400 placeholder:font-normal" 
                        placeholder="e.g., Romantic getaway in Paris, Adventure in Japan, Beach relaxation in Bali..." 
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row grid grid-cols-2 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">🌍</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5 relative">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Destination</div>
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
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1" style={{zIndex: 999999}}>
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
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">🎭</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Trip Type</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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
                <div className="form-row grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end">
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">📅</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">When</div>
                      <DatePicker
                        selected={tripForm.departDate}
                        onChange={(date) => setTripForm(prev => ({ ...prev, departDate: date || new Date() }))}
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer pl-2"
                        placeholderText="Select date"
                        dateFormat="MMM dd, yyyy"
                        minDate={new Date()}
                        popperClassName="custom-datepicker-popper"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">👥</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Travelers</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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
                  <div className="form-field flex-1 flex items-center bg-white/90 backdrop-blur-sm rounded-xl py-3 px-4 pl-12 relative min-h-[52px] border border-gray-100 hover:border-blue-200 transition-all">
                    <div className="field-icon absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-60">💰</div>
                    <div className="field-content flex-1 flex flex-col gap-0.5">
                      <div className="field-label text-xs font-medium text-primary-600 font-['Poppins'] uppercase tracking-wide">Budget</div>
                      <select 
                        className="field-input border-none bg-none text-sm text-primary-800 font-['Poppins'] font-medium outline-none w-full cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzk0QTNBOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] bg-no-repeat bg-right bg-[center_right_0.75rem] pr-8 pl-2"
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
                <div className="itinerary-options grid grid-cols-1 sm:grid-cols-3 gap-2 my-4">
                  <div 
                    className={`option-card bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl py-4 px-4 text-center cursor-pointer transition-all duration-300 min-h-[80px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 ${
                      selectedOption === 'ai-magic' ? 'selected border-blue-500 bg-blue-50 shadow-md transform -translate-y-0.5' : ''
                    }`}
                    onClick={() => selectItineraryOption('ai-magic')}
                  >
                    <div className="option-badge badge-popular absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] px-2 py-1 rounded-full font-bold font-['DM_Sans'] bg-emerald text-white shadow-sm">⚡ Popular</div>
                    <div className="text-xl md:text-2xl mb-2">🧠</div>
                    <div className="text-sm font-bold text-primary-900 mb-1">AI Magic</div>
                    <div className="text-xs text-primary-500 leading-tight">AI creates perfect trip</div>
                  </div>
                  <div 
                    className={`option-card bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl py-4 px-4 text-center cursor-pointer transition-all duration-300 min-h-[80px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 ${
                      selectedOption === 'packages' ? 'selected border-blue-500 bg-blue-50 shadow-md transform -translate-y-0.5' : ''
                    }`}
                    onClick={() => selectItineraryOption('packages')}
                  >
                    <div className="option-badge badge-ready absolute -top-2 left-1/2 -translate-x-1/2 text-[0.6rem] px-2 py-1 rounded-full font-bold font-['DM_Sans'] bg-emerald text-white shadow-sm">🌟 Default</div>
                    <div className="text-xl md:text-2xl mb-2">📦</div>
                    <div className="text-sm font-bold text-primary-900 mb-1">Trips</div>
                    <div className="text-xs text-primary-500 leading-tight">Pre-made adventures</div>
                  </div>
                  <div 
                    className={`option-card bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl py-4 px-4 text-center cursor-pointer transition-all duration-300 min-h-[80px] flex flex-col justify-center relative hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 ${
                      selectedOption === 'custom' ? 'selected border-blue-500 bg-blue-50 shadow-md transform -translate-y-0.5' : ''
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
                  className="search-btn full-width w-full ml-0 mt-4 text-base px-6 h-12 bg-gradient-to-r from-blue-600 to-blue-700 border-none rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 text-white font-['DM_Sans'] font-semibold gap-2 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:transform active:scale-95"
                >
                  <span className="search-icon text-lg">🔍</span>
                  <span>Find Perfect Trips</span>
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
              {featuredContent?.adventureSection?.title || "Let's go on an adventure"}
            </h2>
            <p className="section-subtitle text-2xl font-normal leading-8 text-primary-400 font-['Poppins']">
              {featuredContent?.adventureSection?.subtitle || "Find and book a great experience."}
            </p>
          </div>

          <div className="adventure-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-[1120px] mx-auto">
            {adventureCategories.length > 0 ? adventureCategories.map((category: AdventureCategory, index: number) => (
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
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-primary-600">Adventure categories will be available soon.</p>
              </div>
            )}
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
            {featuredContent?.destinationSpotlight?.destinations?.length > 0 ? featuredContent.destinationSpotlight.destinations.map((destination: Destination, index: number) => (
              <div key={destination.id || index} className="destination-card min-w-[256px] cursor-pointer transition-all duration-300 rounded-3xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]" onClick={() => viewDestination(String(destination.id) || `destination-${index}`)}>
                <div className="destination-image relative w-64 h-64 rounded-3xl overflow-hidden mb-5">
                  <img 
                    src={destination.image?.startsWith('http') ? destination.image : `https://images.unsplash.com/${destination.image}?w=400&h=400&fit=crop`} 
                    alt={destination.name || 'Beautiful destination'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop';
                    }}
                  />
                  <div className="destination-badge absolute top-4 left-4 bg-primary-900 text-white px-3 rounded-[13px] text-xs font-bold uppercase leading-[26px] font-['Poppins']">
                    {destination.discount || `from $${destination.price}`}
                  </div>
                </div>
                <div className="destination-info">
                  <h3 className="text-base font-medium leading-6 text-primary-900 mb-2 font-['Poppins']">{destination.name}</h3>
                  <div className="destination-info-row flex items-center justify-between text-xs font-['Poppins']">
                    <div className="destination-location flex items-center gap-1.5 text-primary-400">
                      <span className="location-icon">📍</span>
                      <span>{destination.location}</span>
                    </div>
                    {destination.rating && (
                      <div className="destination-rating flex items-center gap-1 text-primary-600">
                        <span>⭐</span>
                        <span className="font-semibold">{destination.rating}</span>
                        {destination.reviewCount && (
                          <span className="text-primary-400">({destination.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 min-w-full">
                <p className="text-primary-600 mb-4">Featured destinations will be available soon.</p>
                <Button onClick={loadHomeData} variant="outline">
                  Load Destinations
                </Button>
              </div>
            )}
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
            {planningOptions.map((option: PlanningOption, index: number) => (
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
                  {option.features.map((feature: string, featureIndex: number) => (
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
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.happyCustomers?.toLocaleString() || '0'}+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Happy Travelers</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.averageRating || '0'}⭐</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Average Rating</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.destinations || '0'}+</div>
              <div className="stat-label text-base text-primary-400 font-medium font-['Poppins']">Destinations</div>
            </div>
            <div className="stat-item p-8 bg-gradient-to-br from-white to-blue-ocean/[0.02] rounded-3xl border border-primary-200 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,113,254,0.1)] hover:border-blue-ocean before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-ocean before:via-emerald before:to-amber-premium">
              <div className="stat-number text-[40px] font-black bg-gradient-to-br from-blue-ocean to-emerald bg-clip-text text-transparent mb-2 font-['DM_Sans']">{stats?.support || 'N/A'}</div>
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
            {(featuredContent?.blogPosts || []).map((post: BlogPost, index: number) => (
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