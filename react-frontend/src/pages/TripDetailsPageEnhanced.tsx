import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { TripData } from '@/types/trip.types';
import { sanitizeHtml, sanitizeUrl } from '@/utils/sanitize';
import { APP_CONSTANTS } from '@/constants/app.constants';
import { useAuthStore } from '@/store/authStore';
import AuthModal from '@/components/auth/AuthModal';
import API_CONFIG from '@/config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL.replace('/api', '');



const TripDetailsPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Sync selectedImageIndex with available images
  useEffect(() => {
    if (Array.isArray(trip?.images) && trip.images.length > 0) {
      const maxIndex = trip.images.length - 1;
      if (selectedImageIndex > maxIndex) {
        setSelectedImageIndex(0);
      }
    } else {
      setSelectedImageIndex(0);
    }
  }, [trip?.images?.length, selectedImageIndex]);
  const [showImageModal, setShowImageModal] = useState(false);

  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [relatedTrips, setRelatedTrips] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadTripDetails();
      // Skip related trips for now - endpoint not implemented
      // loadRelatedTrips();
    }
  }, [id]);

  // Handle navigation after login
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false);
      const tripId = trip?._id || trip?.id;
      if (tripId) {
        navigate(`/trip-booking/${tripId}`);
      }
    }
  }, [isAuthenticated, showAuthModal, trip, navigate]);

  const loadTripDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiService.get(`/trips/${id}`);
      if (data.success) {
        const tripData = data.data.trip || data.data;
        setTrip(tripData);
        // Set end date based on trip duration
        if (tripData.duration?.days) {
          const startDateObj = new Date(startDate);
          const endDateCalc = new Date(startDateObj.getTime() + tripData.duration.days * 24 * 60 * 60 * 1000);
          setEndDate(endDateCalc.toISOString().split('T')[0]);
        }
      } else {
        console.error('API returned error:', data.error);
        // For development, use mock data if API fails
        if (import.meta.env.DEV) {
          setTrip(null);
        }
      }
    } catch (error) {
      console.error('Failed to load trip details:', error);
      // For development, show error state
      if (import.meta.env.DEV) {
        setTrip(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedTrips = async () => {
    if (!id) return;
    try {
      const response = await apiService.get(`/trips/related/${id}`);
      if (response.success) {
        setRelatedTrips(response.data?.trips || []);
      }
    } catch (error) {
      // Related trips endpoint not implemented - skip silently
      setRelatedTrips([]);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        generateSearchSuggestions(query);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [trip?._id]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearch.cancel) {
        debouncedSearch.cancel();
      }
      setSearchSuggestions([]);
      setShowSuggestions(false);
    };
  }, [debouncedSearch]);

  const generateSearchSuggestions = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];
    
    // Add destination suggestions
    if (trip?.destinations) {
      trip.destinations.forEach((dest: any) => {
        if (dest.name?.toLowerCase().includes(lowerQuery)) {
          suggestions.push(`📍 ${dest.name}`);
        }
      });
    }
    
    // Add category suggestions
    if (trip?.category?.name?.toLowerCase().includes(lowerQuery)) {
      suggestions.push(`${trip.category.icon} ${trip.category.name}`);
    }
    
    // Add activity suggestions from itinerary
    if (trip?.itinerary) {
      trip.itinerary.forEach((day: any) => {
        day.activities?.forEach((activity: any) => {
          if (activity.title?.toLowerCase().includes(lowerQuery)) {
            suggestions.push(`🎯 ${activity.title}`);
          }
        });
      });
    }
    
    // Add popular search terms
    const popularTerms = ['Similar trips', 'Same destination', 'Same category', 'Customize trip'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`🔍 ${term}`);
      }
    });
    
    setSearchSuggestions([...new Set(suggestions)].slice(0, 6));
    setShowSuggestions(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/^[📍🎯🔍]\s/, '');
    
    if (cleanSuggestion === 'Similar trips') {
      navigate(`/trips?category=${trip?.category?.name || ''}&destination=${trip?.primaryDestination?.name || ''}`);
    } else if (cleanSuggestion === 'Same destination') {
      navigate(`/trips?destination=${trip?.primaryDestination?.name || ''}`);
    } else if (cleanSuggestion === 'Same category') {
      navigate(`/trips?category=${trip?.category?.name || ''}`);
    } else if (cleanSuggestion === 'Customize trip') {
      navigate(`/trips/${id}/customize`);
    } else {
      navigate(`/trips?search=${encodeURIComponent(cleanSuggestion)}`);
    }
    
    setShowSuggestions(false);
  };



  const calculateTotal = useMemo(() => {
    try {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime()) || endDateObj <= startDateObj) {
        return 798.97;
      }
      
      const tripDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
      const packageDays = Math.max(1, trip?.duration?.days || 5);
      
      if (packageDays <= 0) return 798.97;
      
      const numberOfPackages = Math.max(1, Math.ceil(tripDays / packageDays));
      // Use finalPrice as the actual customer price (after discount)
      // Use finalPrice as the actual customer price (what they pay after discount)
      // This aligns with the schema: basePrice -> sellPrice -> discount -> finalPrice
      const packagePrice = Math.max(0, trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97);
      const validTravelers = Math.max(1, Math.min(travelers, trip?.groupSize?.max || 20));
      
      if (packagePrice < 0) return 798.97;
      
      const basePrice = Math.round((packagePrice * numberOfPackages * validTravelers) * 100) / 100;
      const serviceFee = 99;
      const discount = Math.max(0, trip?.pricing?.discountAmount || 0);
      
      const total = Math.max(serviceFee, basePrice + serviceFee - discount);
      return Math.round(total * 100) / 100;
    } catch (error) {
      console.error('Price calculation error:', error);
      return 798.97;
    }
  }, [startDate, endDate, travelers, trip?.duration?.days, trip?.pricing?.finalPrice, trip?.pricing?.estimated, trip?.pricing?.discountAmount, trip?.groupSize?.max]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
        {/* Navigation Skeleton */}
        <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E6E8EC]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="animate-pulse">
          {/* Hero Section Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="h-8 lg:h-12 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            
            {/* Image Gallery Skeleton */}
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] flex gap-4">
              <div className="flex-1 bg-gray-200 rounded-2xl relative">
                <div className="absolute bottom-4 left-4 w-32 h-8 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-16 h-6 bg-black/20 rounded-full"></div>
              </div>
              <div className="hidden lg:flex flex-col gap-3 w-[200px]">
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Content */}
              <div className="w-full lg:w-2/3 space-y-8">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
                
                {/* Itinerary Skeleton */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-[#E6E8EC] rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Booking Sidebar Skeleton */}
              <div className="w-full lg:w-1/3">
                <div className="bg-[#FCFCFD] border border-[#E6E8EC] rounded-3xl p-8">
                  <div className="mb-8">
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#F4F5F6] rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-8">
                    <div className="w-20 h-12 bg-gray-200 rounded-3xl"></div>
                    <div className="flex-1 h-12 bg-gray-200 rounded-3xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8 bg-white shadow-lg rounded-full p-4 border border-[#E6E8EC]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#3B71FE] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-[#777E90] font-['Poppins']">Loading trip details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FCFCFD] to-white px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-black text-[#23262F] mb-4 font-['DM_Sans']">Connection Error</h2>
          <p className="text-[#777E90] mb-4 font-['Poppins']">Unable to connect to the server. Please check if the backend is running.</p>
          <div className="bg-[#F4F5F6] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#777E90] font-['Poppins'] mb-2">Development Info:</p>
            <p className="text-xs text-[#777E90] font-mono">Backend: {API_CONFIG.BASE_URL}</p>
            <p className="text-xs text-[#777E90] font-mono">Frontend: http://localhost:3001</p>
            <p className="text-xs text-[#777E90] font-mono">Trip ID: {id}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-[#3B71FE] text-white py-3 rounded-2xl font-bold font-['DM_Sans'] hover:bg-[#58C27D] transition-all duration-300"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="flex-1 bg-white border-2 border-[#E6E8EC] text-[#23262F] py-3 rounded-2xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Navigation Breadcrumb */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white border border-[#E6E8EC] px-3 py-2 rounded-full hover:border-[#3B71FE] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline font-bold text-[#23262F] font-['DM_Sans']">Go home</span>
            </button>
            
            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-md mx-4 relative hidden sm:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search similar trips..."
                  value={searchQuery}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[<>"'&]/g, '').substring(0, 100);
                    setSearchQuery(sanitizedValue);
                    if (sanitizedValue.length >= 2) {
                      debouncedSearch(sanitizedValue);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSuggestions(false);
                      e.currentTarget.blur();
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      generateSearchSuggestions(searchQuery);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-[#E6E8EC] rounded-full focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] transition-all text-sm font-['Poppins'] placeholder:text-[#B1B5C3]"
                  maxLength={100}
                  autoComplete="off"
                  role="searchbox"
                  aria-label="Search similar trips"
                  aria-expanded={showSuggestions}
                  aria-haspopup="listbox"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B1B5C3] hover:text-[#3B71FE] transition-colors"
                  aria-label="Search"
                >
                  🔍
                </button>
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B1B5C3] hover:text-[#777E90] text-sm"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                
                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E8EC] rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto"
                    role="listbox"
                    aria-label="Search suggestions"
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSuggestionClick(suggestion);
                          }
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#F4F5F6] focus:bg-[#F4F5F6] transition-colors font-['Poppins'] text-[#23262F] border-b border-[#E6E8EC] last:border-b-0 text-sm focus:outline-none"
                        role="option"
                        aria-selected={false}
                      >
                        {sanitizeHtml(suggestion)}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-bold font-['DM_Sans']">
              <button onClick={() => navigate('/')} className="text-[#777E90] hover:text-[#3B71FE] transition-colors">
                Home
              </button>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <button onClick={() => navigate('/trips')} className="text-[#777E90] hover:text-[#3B71FE] transition-colors">
                Trips
              </button>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#777E90]">
                {(() => {
                  if (trip?.primaryDestination?.name) {
                    return trip.primaryDestination.name;
                  }
                  if (Array.isArray(trip?.destinations) && trip.destinations.length > 0) {
                    return trip.destinations[0]?.name || 'Destination';
                  }
                  if (Array.isArray(trip?.countries) && trip.countries.length > 0) {
                    return trip.countries[0]?.name || 'Destination';
                  }
                  return 'Multiple Destinations';
                })()}
                {Array.isArray(trip?.destinations) && trip.destinations.length > 1 && (
                  <span className="text-xs ml-1 opacity-75">+{trip.destinations.length - 1} more</span>
                )}
                {(() => {
                  const countries = Array.isArray(trip?.countries) ? trip.countries : [];
                  const countryCount = countries.length;
                  const hasDestinations = Array.isArray(trip?.destinations) && trip.destinations.length > 0;
                  
                  if (countryCount > 1 && !hasDestinations) {
                    return (
                      <span className="text-xs ml-1 opacity-75">+{countryCount - 1} countries</span>
                    );
                  }
                  return null;
                })()}
              </span>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#B1B5C3]" title={trip?.title || 'Trip Details'}>
                {(() => {
                  const cleanTitle = trip?.title?.replace(/<[^>]*>/g, '') || 'Trip Details';
                  return cleanTitle.length > 12 ? `${cleanTitle.substring(0, 12)}...` : cleanTitle;
                })()}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#23262F] mb-3 lg:mb-4 font-['DM_Sans'] leading-tight">
                {sanitizeHtml(trip?.title || 'Trip Details')}
              </h1>
              <div className="flex items-center flex-wrap gap-2 lg:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FFD166] text-sm">⭐</span>
                  <span className="font-medium text-[#23262F] font-['Poppins'] text-sm">{trip.stats?.rating || 'New'}</span>
                  {trip.stats?.reviewCount > 0 && (
                    <span className="hidden sm:inline text-[#777E90] font-['Poppins'] text-sm">({trip.stats.reviewCount} reviews)</span>
                  )}
                </div>
                {trip.featured && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#58C27D] text-white rounded-full">
                    <span className="text-white text-xs">🏆</span>
                    <span className="text-white font-['Poppins'] text-xs font-medium">Featured</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F5F6] rounded-full">
                  <span className="text-[#777E90] text-xs">📍</span>
                  <span className="text-[#777E90] font-['Poppins'] text-xs">
                    {trip.primaryDestination?.name || trip.destinations?.[0]?.name || trip.countries?.[0]?.name || 'Amazing Destination'}
                    {trip.destinations && trip.destinations.length > 1 && (
                      <span className="ml-1">& {trip.destinations.length - 1} more</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 self-start">
              <button 
                className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors"
                aria-label="View on map"
                title="View on map"
              >
                <span className="text-[#777E90] text-xs lg:text-sm">📍</span>
              </button>
              <button 
                className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors"
                aria-label="Share trip"
                title="Share trip"
              >
                <span className="text-[#777E90] text-xs lg:text-sm">📤</span>
              </button>
              <button 
                className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors"
                aria-label="Add to favorites"
                title="Add to favorites"
              >
                <span className="text-[#777E90] text-xs lg:text-sm">❤️</span>
              </button>
            </div>
          </div>

          {/* Hero Gallery */}
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] flex gap-2 lg:gap-4 relative">
            {/* Main Image */}
            <div className="flex-1 relative group">
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#3B71FE] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={trip.images?.[selectedImageIndex]?.url 
                    ? (trip.images[selectedImageIndex].url.startsWith('http') ? sanitizeUrl(trip.images[selectedImageIndex].url) : `${API_BASE_URL}${trip.images[selectedImageIndex].url}`)
                    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
                  alt={trip.images?.[selectedImageIndex]?.alt || trip.title}
                  className={`w-full h-full object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    setImageLoading(false);
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
                  }}
                />
              </div>
              
              {/* Navigation Buttons */}
              {trip.images && trip.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : trip.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5 text-[#23262F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex(selectedImageIndex < trip.images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5 text-[#23262F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Show All Photos Button */}
              <button 
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-[#23262F] px-4 py-2 rounded-full font-bold font-['DM_Sans'] text-sm hover:bg-white transition-colors flex items-center gap-2 shadow-lg"
              >
                <span className="text-sm">🖼️</span>
                <span>Show all photos</span>
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-['Poppins']">
                {selectedImageIndex + 1} / {trip.images?.length || 1}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="hidden lg:flex flex-col gap-2 lg:gap-3 w-[160px] lg:w-[200px]">
              {(trip.images?.length > 0 ? trip.images.slice(0, 3) : [
                { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=180&fit=crop', alt: 'Travel destination' },
                { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=180&fit=crop', alt: 'Beautiful landscape' }, 
                { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=180&fit=crop', alt: 'Adventure scene' }
              ]).map((image, index) => (
                <button
                  key={index}
                  className="flex-1 relative group focus:outline-none focus:ring-2 focus:ring-[#3B71FE] rounded-xl"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setImageLoading(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedImageIndex(index);
                      setImageLoading(true);
                    }
                  }}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={typeof image === 'string' ? image : 
                         (image.url?.startsWith('http') ? sanitizeUrl(image.url) : `${API_BASE_URL}${image.url}`)}
                    alt={typeof image === 'string' ? `${trip.title} ${index + 1}` : (image.alt || `${trip.title} ${index + 1}`)}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-[#3B71FE] shadow-lg' 
                        : 'hover:shadow-md hover:scale-[1.02] shadow-sm'
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=180&fit=crop';
                    }}
                    loading="lazy"
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-[#3B71FE]/10 rounded-xl pointer-events-none"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8">
              {/* Package Info */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#23262F] mb-3 font-['DM_Sans'] leading-tight">
                  {trip.category?.name || 'Adventure Trip'}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[#777E90] font-['Poppins'] text-sm leading-6">Organized by</span>
                  <span className="font-medium text-[#23262F] font-['Poppins'] text-base leading-6">{APP_CONSTANTS.APP_NAME}</span>
                  <span className="px-2 py-1 bg-[#58C27D] text-white rounded-full text-xs font-medium">Verified</span>
                </div>
                
                <div className="border-t border-[#E6E8EC] pt-3 lg:pt-4 flex flex-wrap gap-3 lg:gap-4 mb-6 lg:mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">👥</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm">{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">📅</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm">{trip.duration?.days || 5} days, {trip.duration?.nights || 4} nights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">🏨</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm capitalize">{trip.pricing?.priceRange || 'Quality'} accommodation</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[#777E90] font-['Poppins'] text-sm lg:text-base leading-relaxed mb-4 lg:mb-6">
                  {sanitizeHtml(trip.description)}
                </p>

                <div className="text-[#777E90] font-['Poppins'] text-sm lg:text-base leading-relaxed mb-4 lg:mb-6">
                  This {(() => {
                    const validStyles = ['adventure', 'luxury', 'cultural', 'relaxed', 'business'];
                    const style = trip?.travelStyle?.toLowerCase();
                    return validStyles.includes(style) ? style : 'adventure';
                  })()} experience offers {(() => {
                    const validDifficulties = ['easy', 'moderate', 'challenging'];
                    const difficulty = trip?.difficulty?.toLowerCase();
                    return validDifficulties.includes(difficulty) ? difficulty : 'easy';
                  })()} activities perfect for {trip?.suitableFor?.couples ? 'couples' : ''}{trip?.suitableFor?.families ? (trip?.suitableFor?.couples ? ' and families' : 'families') : ''}. Best time to visit: {Array.isArray(trip?.travelInfo?.bestTimeToVisit?.months) ? trip.travelInfo.bestTimeToVisit.months.join(', ') : 'Year-round'}.
                </div>
                
                {/* Destinations Overview */}
                {(trip.primaryDestination || trip.destinations?.length > 0) && (
                  <div className="mb-4 lg:mb-6 bg-[#F4F5F6] rounded-xl p-4">
                    <h4 className="font-bold text-[#23262F] mb-3 font-['DM_Sans'] text-sm lg:text-base flex items-center gap-2">
                      🗺️ Trip Destinations
                    </h4>
                    <div className="space-y-2">
                      {trip.primaryDestination && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#3B71FE] text-white rounded-full text-xs font-medium">Primary</span>
                          <span className="text-[#23262F] font-['Poppins'] text-sm font-medium">{trip.primaryDestination.name}</span>
                        </div>
                      )}
                      {(() => {
                        const destinations = Array.isArray(trip?.destinations) ? trip.destinations : [];
                        const uniqueDestinations = destinations.filter((dest, index, arr) => {
                          const isDuplicate = arr.findIndex(d => d._id === dest._id) !== index;
                          const isPrimary = dest._id === trip?.primaryDestination?._id;
                          return !isDuplicate && !isPrimary;
                        });
                        
                        return uniqueDestinations.map((destination, index) => (
                          <div key={`dest-${destination._id}-${index}-${destination.name || 'unknown'}`} className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-[#58C27D]/20 text-[#58C27D] rounded-full text-xs font-medium">Stop {index + 1}</span>
                            <span className="text-[#777E90] font-['Poppins'] text-sm">{destination?.name || 'Destination'}</span>
                          </div>
                        ));
                      })()}
                      {trip.countries?.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#E6E8EC]">
                          <span className="text-xs text-[#777E90] font-['Poppins'] block mb-1">Countries visited:</span>
                          <div className="flex flex-wrap gap-1">
                            {trip.countries.map((country, index) => (
                              <span key={`country-${typeof country === 'string' ? country : country._id || 'unknown'}-${index}`} className="px-2 py-0.5 bg-white text-[#777E90] rounded text-xs">
                                {(() => {
                                  if (typeof country === 'string') {
                                    return `Country ${index + 1}`;
                                  }
                                  return country?.name || `Country ${index + 1}`;
                                })()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {Array.isArray(trip?.highlights) && trip.highlights.length > 0 && (
                  <div className="mb-4 lg:mb-6">
                    <h4 className="font-bold text-[#23262F] mb-2 lg:mb-3 font-['DM_Sans'] text-sm lg:text-base">Trip Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.slice(0, 5).map((highlight, index) => (
                        <span key={`highlight-${index}`} className="px-2 lg:px-3 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-full text-xs lg:text-sm font-medium">
                          ✨ {typeof highlight === 'string' ? highlight : 'Highlight'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Itinerary */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#23262F] mb-4 lg:mb-6 font-['DM_Sans']">Daily Itinerary</h3>
                {Array.isArray(trip?.itinerary) && trip.itinerary.length > 0 ? (
                  <div className="space-y-3 lg:space-y-4">
                    {trip.itinerary.map((day, index) => (
                      <div key={`day-${day?.day || index}-${day?._id || index}`} className="bg-white border border-[#E6E8EC] rounded-xl lg:rounded-2xl p-4 lg:p-6">
                        <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans'] text-sm lg:text-base shadow-lg">
                            {day.day || index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base lg:text-lg font-bold text-[#23262F] font-['DM_Sans'] leading-tight">
                              {day.title || `Day ${day.day || index + 1}`}
                            </h4>
                            {(day.locationName || day.location) && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs lg:text-sm text-[#58C27D] font-['Poppins'] font-medium">
                                  📍 {day.locationName || day.location}
                                </span>
                                {day.locationName && day.locationName !== trip.primaryDestination?.name && (
                                  <span className="text-xs bg-[#FFD166]/20 text-[#FFD166] px-2 py-0.5 rounded-full font-medium">
                                    Local Stop
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {day.description && (
                          <p className="text-[#777E90] font-['Poppins'] text-sm lg:text-base mb-3 lg:mb-4 leading-relaxed">{day.description}</p>
                        )}
                        
                        {Array.isArray(day?.activities) && day.activities.length > 0 ? (
                          <div className="mb-3 lg:mb-4">
                            <h5 className="font-bold text-[#23262F] font-['DM_Sans'] mb-2 text-sm lg:text-base">Activities</h5>
                            <div className="space-y-2 lg:space-y-3">
                              {day.activities.map((activity, actIndex) => (
                                <div key={actIndex} className="bg-[#F4F5F6] rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <span className="text-[#58C27D] text-sm mt-0.5">✓</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-[#23262F] font-['Poppins'] text-sm font-medium">
                                          {activity.customTitle || activity.title}
                                        </span>
                                        {activity?.time && (
                                          <span className="text-[#777E90] font-['Poppins'] text-xs bg-white px-2 py-0.5 rounded border border-[#E6E8EC]">
                                            ⏰ {typeof activity.time === 'string' && activity.time.match(/^\d{1,2}:\d{2}$/) ? activity.time : 'Time TBD'}
                                          </span>
                                        )}
                                        {activity.type && (
                                          <span className="text-[#3B71FE] font-['Poppins'] text-xs bg-[#3B71FE]/10 px-2 py-0.5 rounded capitalize">
                                            {activity.type}
                                          </span>
                                        )}
                                      </div>
                                      {activity.description && (
                                        <p className="text-[#777E90] font-['Poppins'] text-xs leading-relaxed mb-1">{activity.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 text-xs">
                                        {activity.location && (
                                          <span className="text-[#777E90] font-['Poppins'] flex items-center gap-1">
                                            📍 {activity.location}
                                          </span>
                                        )}
                                        {activity.estimatedCost?.amount > 0 && (
                                          <span className="text-[#58C27D] font-['Poppins'] font-medium bg-[#58C27D]/10 px-2 py-1 rounded">
                                            {(activity.estimatedCost.currency || trip.pricing?.currency) === 'INR' ? '₹' : '$'}{activity.estimatedCost.amount}
                                            {activity.estimatedCost.perPerson ? '/person' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3 lg:mb-4 p-3 bg-[#F4F5F6] rounded-lg border border-[#E6E8EC]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[#3B71FE]">📝</span>
                              <span className="text-[#23262F] font-['DM_Sans'] font-medium text-sm">Activities Coming Soon</span>
                            </div>
                            <div className="text-[#777E90] font-['Poppins'] text-sm leading-relaxed">
                              Our travel experts are crafting amazing {trip.category?.name?.toLowerCase() || 'adventure'} experiences for Day {day.day || index + 1}. 
                              <div className="text-[#3B71FE] font-medium">Check back soon for updates!</div>
                            </div>
                          </div>
                        )}
                        
                        {Array.isArray(day?.tips) && day.tips.length > 0 && (
                          <div className="mt-3 lg:mt-4 p-3 bg-[#FFD166]/10 rounded-lg">
                            <h6 className="font-bold text-[#23262F] font-['DM_Sans'] text-sm mb-2">💡 Tips</h6>
                            <ul className="text-[#777E90] font-['Poppins'] text-xs lg:text-sm space-y-1 leading-relaxed">
                              {day.tips.map((tip, tipIndex) => (
                                <li key={`tip-${tipIndex}`} className="flex items-start gap-2">
                                  <span className="text-[#FFD166] mt-0.5">•</span>
                                  <span className="flex-1">{typeof tip === 'string' ? tip : 'Travel tip'}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {Array.from({ length: trip.duration?.days || 5 }, (_, index) => (
                      <div key={index} className="bg-[#F4F5F6] rounded-xl lg:rounded-2xl p-4 lg:p-6">
                        <div className="flex items-center gap-3 lg:gap-4 mb-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#B1B5C3] text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans'] text-sm lg:text-base">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base lg:text-lg font-bold text-[#23262F] font-['DM_Sans'] leading-tight">
                              Day {index + 1} - Itinerary Coming Soon
                            </h4>
                            <span className="text-xs lg:text-sm text-[#777E90] font-['Poppins'] mt-1 block">
                              Our travel experts are crafting detailed activities
                            </span>
                          </div>
                        </div>
                        <p className="text-[#777E90] font-['Poppins'] text-sm leading-relaxed">
                          Exciting {trip.travelStyle || 'cultural'} experiences and {trip.category?.name?.toLowerCase() || 'adventure'} activities planned for this day.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What's Included & Excluded */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#23262F] mb-4 lg:mb-6 font-['DM_Sans']">What's Included</h3>
                <div className="grid grid-cols-1 gap-3 lg:gap-4 mb-6 lg:mb-8">
                  {/* Accommodation */}
                  <div className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                    <span className="text-[#58C27D] mt-0.5">✓</span>
                    <span className="flex-1">🏨 {trip.pricing?.priceRange || 'Quality'} accommodation ({trip.duration?.nights || 4} nights)</span>
                  </div>
                  
                  {/* Transport */}
                  {trip.includedServices?.transport?.map((transport, index) => (
                    <div key={`transport-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">🚐 {transport}</span>
                    </div>
                  ))}
                  
                  {/* Meals */}
                  {trip.includedServices?.meals?.map((meal, index) => (
                    <div key={`meal-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">🍽️ {meal}</span>
                    </div>
                  ))}
                  
                  {/* Guide */}
                  {trip.includedServices?.guides && (
                    <div className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">👨🏫 Professional Guide</span>
                    </div>
                  )}
                  
                  {/* Additional Includes from API */}
                  {trip.includes?.slice(0, 4).map((item, index) => (
                    <div key={`include-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* What's NOT Included */}
                {trip.excludes?.length > 0 && (
                  <div className="mt-6 lg:mt-8">
                    <h4 className="text-base lg:text-lg font-bold text-[#23262F] mb-3 lg:mb-4 font-['DM_Sans']">What's NOT Included</h4>
                    <div className="grid grid-cols-1 gap-3 lg:gap-4">
                      {trip.excludes.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span className="flex-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                

              </div>
            </div>

            {/* Right Booking Card */}
            <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-8 bg-[#FCFCFD] border border-[#E6E8EC] rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-lg lg:shadow-[0px_64px_64px_-48px_rgba(15,15,15,0.08)]">
                {/* Price Section */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex items-baseline gap-2 lg:gap-3 mb-2">
                    {trip.pricing?.discountAmount > 0 && (
                      <span className="text-lg lg:text-2xl text-[#B1B5C3] line-through font-bold font-['DM_Sans']">
                        {trip.pricing?.currency === 'INR' ? '₹' : '$'}{(trip.pricing?.sellPrice || (trip.pricing?.finalPrice + trip.pricing?.discountAmount)).toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl lg:text-3xl font-bold text-[#23262F] font-['DM_Sans']">
                      {(() => {
                        const currency = trip?.pricing?.currency || 'USD';
                        const symbol = currency === 'INR' ? '₹' : 
                                     currency === 'EUR' ? '€' : 
                                     currency === 'GBP' ? '£' : '$';
                        const price = trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97;
                        return `${symbol}${price.toLocaleString()}`;
                      })()}
                    </span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm lg:text-base">per person</span>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="bg-[#F4F5F6] rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
                    <div>
                      <label htmlFor="checkin-date" className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Check-in</label>
                      <input 
                        id="checkin-date"
                        type="date" 
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        required
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          if (!newStartDate) return;
                          
                          setStartDate(newStartDate);
                          
                          try {
                            const startDateObj = new Date(newStartDate);
                            const endDateObj = new Date(endDate);
                            const minTripDays = Math.max(1, trip?.duration?.days || 5);
                            
                            // Prevent infinite loops
                            if (isNaN(startDateObj.getTime())) return;
                            
                            if (isNaN(endDateObj.getTime()) || endDateObj <= startDateObj) {
                              const newEndDate = new Date(startDateObj);
                              newEndDate.setDate(newEndDate.getDate() + minTripDays);
                              
                              // Validate the new end date
                              if (!isNaN(newEndDate.getTime())) {
                                setEndDate(newEndDate.toISOString().split('T')[0]);
                              }
                            }
                          } catch (error) {
                            console.error('Date adjustment error:', error);
                          }
                        }}
                        className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm" 
                        aria-describedby="checkin-help"
                      />
                      <div id="checkin-help" className="sr-only">Select your trip start date</div>
                      {(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selected = new Date(startDate);
                        selected.setHours(0, 0, 0, 0);
                        
                        if (selected < today) {
                          return (
                            <div className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                              Start date cannot be in the past
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div>
                      <label htmlFor="checkout-date" className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Check-out</label>
                      <input 
                        id="checkout-date"
                        type="date" 
                        value={endDate}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          if (!newEndDate) return;
                          
                          try {
                            const selectedEndDate = new Date(newEndDate);
                            const selectedStartDate = new Date(startDate);
                            const minDays = Math.max(1, trip?.duration?.days || 5);
                            
                            // Validate dates
                            if (isNaN(selectedEndDate.getTime()) || isNaN(selectedStartDate.getTime())) {
                              return;
                            }
                            
                            const minEndDate = new Date(selectedStartDate);
                            minEndDate.setDate(minEndDate.getDate() + minDays);
                            
                            if (isNaN(minEndDate.getTime())) {
                              setEndDate(newEndDate);
                              return;
                            }
                            
                            if (selectedEndDate < minEndDate) {
                              setEndDate(minEndDate.toISOString().split('T')[0]);
                            } else {
                              setEndDate(newEndDate);
                            }
                          } catch (error) {
                            console.error('End date validation error:', error);
                            setEndDate(e.target.value);
                          }
                        }}
                        min={(() => {
                          const minDate = new Date(startDate);
                          minDate.setDate(minDate.getDate() + Math.max(1, trip?.duration?.days || 5));
                          return minDate.toISOString().split('T')[0];
                        })()}
                        max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm" 
                        aria-describedby="checkout-help"
                      />
                      <div id="checkout-help" className="sr-only">Select your trip end date</div>
                      {(() => {
                        const startDateObj = new Date(startDate);
                        const endDateObj = new Date(endDate);
                        const minDays = Math.max(1, trip?.duration?.days || 5);
                        
                        if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
                          const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysDiff < minDays) {
                            return (
                              <div className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                                Trip must be at least {minDays} days long
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="guest-select" className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Guests</label>
                    <select 
                      id="guest-select"
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm"
                    >
                      {Array.from({length: trip.groupSize?.max || 8}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Booking Actions */}
                <div className="space-y-3 mb-6 lg:mb-8">
                  {/* Individual Booking */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }
                      
                      const tripId = trip?._id || trip?.id;
                      console.log('Individual booking clicked, tripId:', tripId);
                      if (tripId) {
                        navigate(`/trip-booking/${tripId}`);
                      } else {
                        console.error('Trip ID not available for booking');
                        alert('Trip information not available. Please try again.');
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white py-3 lg:py-3 px-6 rounded-2xl lg:rounded-3xl font-bold font-['DM_Sans'] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm lg:text-base flex items-center justify-center gap-2"
                    aria-label="Book individual consultation for this trip"
                    disabled={!trip?._id && !trip?.id}
                  >
                    <span>📞</span>
                    <span>Individual Booking</span>
                  </button>
                  
                  {/* Corporate Booking */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      if (!isAuthenticated) {
                        setShowAuthModal(true);
                        return;
                      }
                      
                      const tripId = trip?._id || trip?.id;
                      console.log('Corporate booking clicked, tripId:', tripId);
                      if (tripId) {
                        navigate(`/corporate-booking/trip/${tripId}`);
                      } else {
                        console.error('Trip ID not available for corporate booking');
                        alert('Trip information not available. Please try again.');
                      }
                    }}
                    className="w-full bg-white border-2 border-[#3B71FE] text-[#3B71FE] py-3 lg:py-3 px-6 rounded-2xl lg:rounded-3xl font-bold font-['DM_Sans'] hover:bg-[#3B71FE] hover:text-white transition-all duration-200 text-sm lg:text-base flex items-center justify-center gap-2"
                    aria-label="Book corporate trip for your team"
                    disabled={!trip?._id && !trip?.id}
                  >
                    <span>🏢</span>
                    <span>Group Booking (2+ People)</span>
                  </button>
                  
                  {/* Save Button */}
                  <button className="w-full bg-white border border-[#E6E8EC] text-[#23262F] py-2.5 lg:py-3 px-4 lg:px-6 rounded-2xl lg:rounded-3xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] hover:bg-[#3B71FE]/5 transition-all duration-200 flex items-center justify-center gap-2 text-sm lg:text-base">
                    <span>❤️</span>
                    <span>Save Trip</span>
                  </button>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  {(() => {
                    try {
                      const startDateObj = new Date(startDate);
                      const endDateObj = new Date(endDate);
                      
                      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                        return (
                          <div className="flex justify-between font-['Poppins'] text-sm">
                            <span>Trip package × 1 × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
                            <span>{trip?.pricing?.currency === 'INR' ? '₹' : '$'}{((trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97) * travelers).toLocaleString()}</span>
                          </div>
                        );
                      }
                      
                      const tripDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
                      const packageDays = Math.max(1, trip?.duration?.days || 5);
                      const numberOfPackages = Math.max(1, Math.ceil(tripDays / packageDays));
                      const packagePrice = trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97;
                      
                      return (
                        <div className="flex justify-between font-['Poppins'] text-sm">
                          <span>Trip package × {numberOfPackages} × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
                          <span>
                            {(() => {
                              const currency = trip?.pricing?.currency || 'USD';
                              const symbol = currency === 'INR' ? '₹' : 
                                           currency === 'EUR' ? '€' : 
                                           currency === 'GBP' ? '£' : '$';
                              return `${symbol}${(packagePrice * numberOfPackages * travelers).toLocaleString()}`;
                            })()}
                          </span>
                        </div>
                      );
                    } catch (error) {
                      console.error('Price breakdown calculation error:', error);
                      return (
                        <div className="flex justify-between font-['Poppins'] text-sm">
                          <span>Trip package × 1 × {travelers} traveler{travelers > 1 ? 's' : ''}</span>
                          <span>{trip?.pricing?.currency === 'INR' ? '₹' : '$'}{((trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97) * travelers).toLocaleString()}</span>
                        </div>
                      );
                    }
                  })()}
                  {(() => {
                    const discountAmount = trip?.pricing?.discountAmount || 0;
                    const discountPercent = trip?.pricing?.discountPercent || 0;
                    
                    // Show discount only if both amount and percent are positive
                    // This prevents showing invalid discount data from API
                    if (discountAmount > 0 && discountPercent > 0) {
                      return (
                        <div className="flex justify-between text-[#58C27D] font-['Poppins'] text-sm">
                          <span>{Math.min(100, Math.max(0, discountPercent))}% campaign discount</span>
                          <span>
                            -{(() => {
                              const currency = trip?.pricing?.currency || 'USD';
                              const symbol = currency === 'INR' ? '₹' : 
                                           currency === 'EUR' ? '€' : 
                                           currency === 'GBP' ? '£' : '$';
                              return `${symbol}${Math.abs(discountAmount).toLocaleString()}`;
                            })()}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex justify-between font-['Poppins'] text-sm">
                    <span>Service fee</span>
                    <span>
                      {(() => {
                        const currency = trip?.pricing?.currency || 'USD';
                        const symbol = currency === 'INR' ? '₹' : 
                                     currency === 'EUR' ? '€' : 
                                     currency === 'GBP' ? '£' : '$';
                        return `${symbol}99`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between font-['Poppins'] text-sm text-[#777E90]">
                    <span>Taxes & fees</span>
                    <span>Included</span>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3">
                    <div className="flex justify-between font-bold text-lg font-['DM_Sans']">
                      <span>Total ({travelers} traveler{travelers > 1 ? 's' : ''})</span>
                      <span>
                        {(() => {
                          const currency = trip?.pricing?.currency || 'USD';
                          const symbol = currency === 'INR' ? '₹' : 
                                       currency === 'EUR' ? '€' : 
                                       currency === 'GBP' ? '£' : '$';
                          return `${symbol}${calculateTotal.toLocaleString()}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="space-y-2 mb-4 lg:mb-6">
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">{trip.bookingInfo?.cancellationPolicy || 'Free cancellation available'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">{trip.bookingInfo?.instantBook ? 'Instant confirmation' : 'Requires approval'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">Free consultation call</span>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="text-center">
                  <button className="text-xs lg:text-sm text-[#777E90] hover:text-[#23262F] font-['Poppins'] flex items-center gap-1 mx-auto">
                    💬 Need help? Contact support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Information */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Trip Details */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#23262F] font-['DM_Sans'] mb-4 lg:mb-6">Trip Details</h2>
              <div className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Duration</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.duration?.days || 5} days, {trip.duration?.nights || 4} nights
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Group Size</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.groupSize?.min}-{trip.groupSize?.max} travelers
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Difficulty</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm capitalize">
                      {(() => {
                        const validDifficulties = ['easy', 'moderate', 'challenging'];
                        const difficulty = trip?.difficulty?.toLowerCase();
                        return validDifficulties.includes(difficulty) ? difficulty : 'easy';
                      })()} • {(() => {
                        const validFitnessLevels = ['low', 'moderate', 'high'];
                        const fitnessLevel = trip?.physicalRequirements?.fitnessLevel?.toLowerCase();
                        return validFitnessLevels.includes(fitnessLevel) ? fitnessLevel : 'low';
                      })()} fitness
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Best Time</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.travelInfo?.bestTimeToVisit?.months?.slice(0,2).join(', ') || 'Year-round'}
                      {trip.travelInfo?.bestTimeToVisit?.weather && (
                        <span className="block text-xs mt-1">{trip.travelInfo.bestTimeToVisit.weather} weather</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const suitableFor = trip?.suitableFor || {};
                      const validEntries = Object.entries(suitableFor).filter(([_, value]) => Boolean(value));
                      
                      if (validEntries.length > 0) {
                        return validEntries.map(([key, value]) => 
                          value && (
                            <span key={`suitable-${key}`} className="px-2 lg:px-3 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-full text-xs lg:text-sm font-medium">
                              {key === 'soloTravelers' ? 'Solo Travelers' : 
                               key === 'couples' ? 'Couples' :
                               key === 'families' ? 'Families' :
                               key === 'groups' ? 'Groups' : 
                               typeof key === 'string' ? key.charAt(0).toUpperCase() + key.slice(1) : 'Travelers'}
                            </span>
                          )
                        );
                      }
                      return <span className="px-2 lg:px-3 py-1 bg-[#F4F5F6] text-[#777E90] rounded-full text-xs lg:text-sm">All Travelers</span>;
                    })()}
                  </div>
                </div>
                
                {trip.pricing?.breakdown && Object.values(trip.pricing.breakdown).some(value => value > 0) && (
                  <div>
                    <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(trip.pricing.breakdown)
                        .filter(([_, value]) => value > 0)
                        .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-[#777E90] font-['Poppins'] capitalize">
                            {key === 'accommodation' ? 'Hotels' : 
                             key === 'transport' ? 'Transport' :
                             key === 'food' ? 'Meals' :
                             key === 'activities' ? 'Activities' :
                             key === 'flights' ? 'Flights' : key}
                          </span>
                          <span className="text-[#23262F] font-['Poppins']">
                            {trip.pricing?.currency === 'INR' ? '₹' : '$'}{value}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t border-[#E6E8EC] pt-2 mt-3">
                        <span className="text-[#23262F] font-['DM_Sans']">Total</span>
                        <span className="text-[#23262F] font-['DM_Sans']">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.finalPrice || trip.pricing?.estimated || 699}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Safety & Requirements */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#23262F] font-['DM_Sans'] mb-4 lg:mb-6">Safety & Requirements</h2>
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                  <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Safety Level</h4>
                  <p className="text-[#777E90] font-['Poppins'] text-sm capitalize">
                    {trip.safetyInformation?.level || 'Low'} risk • Professional guides included
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Physical Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm capitalize flex-1">{trip.physicalRequirements?.fitnessLevel || 'Low'} fitness level required</span>
                    </div>
                    {trip.physicalRequirements?.walkingDistance && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#58C27D] mt-0.5">✓</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Walking: {trip.physicalRequirements.walkingDistance}km per day</span>
                      </div>
                    )}
                    {trip.physicalRequirements?.altitude && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#58C27D] mt-0.5">✓</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Max altitude: {trip.physicalRequirements.altitude}m</span>
                      </div>
                    )}
                    {trip.physicalRequirements?.specialNeeds && trip.physicalRequirements.specialNeeds.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[#777E90] font-['Poppins'] text-sm font-medium block mb-1">Special requirements:</span>
                        <ul className="text-[#777E90] font-['Poppins'] text-sm space-y-1">
                          {trip.physicalRequirements.specialNeeds.map((need, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#FFD166] mt-0.5">•</span>
                              <span className="flex-1">{need}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Booking Policy</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">{trip.bookingInfo?.cancellationPolicy || 'Free cancellation available'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#3B71FE] mt-0.5">💳</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">{trip.bookingInfo?.depositRequired || 50}% deposit required, balance due {trip.bookingInfo?.finalPaymentDue || 30} days before departure</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFD166] mt-0.5">⏱️</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">
                        {trip.bookingInfo?.instantBook ? 'Instant booking available' : 'Requires approval'}
                        {trip.bookingInfo?.advanceBooking && ` • Book ${trip.bookingInfo.advanceBooking} days in advance`}
                      </span>
                    </div>
                    {trip.availability?.maxBookings && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#777E90] mt-0.5">👥</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Limited to {trip.availability.maxBookings} bookings per departure</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#3B71FE]/5 to-[#58C27D]/5 rounded-2xl border border-[#E6E8EC]">
            <span className="text-4xl mb-4 block">{trip.category?.icon || '🎆'}</span>
            <h3 className="text-xl font-bold text-[#23262F] font-['DM_Sans'] mb-2">Ready for Your {trip.category?.name || 'Adventure'}?</h3>
            <p className="text-[#777E90] font-['Poppins'] mb-4 text-center">
              {trip.stats?.views > 0 ? `Join ${trip.stats.views}+ travelers who have viewed this ${trip.category?.name?.toLowerCase() || 'adventure'}!` : 
               `Be the first to experience this amazing ${trip.category?.name?.toLowerCase() || 'adventure'} in ${trip.primaryDestination?.name || trip.countries?.[0]?.name || 'beautiful destinations'}!`}
              {trip.stats?.bookings > 0 && (
                <span className="block text-[#58C27D] font-medium mt-2">
                  ✓ {trip.stats.bookings} travelers have already booked this trip
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                    return;
                  }
                  
                  const tripId = trip?._id || trip?.id;
                  console.log('Bottom individual button clicked, tripId:', tripId);
                  if (tripId) {
                    navigate(`/trip-booking/${tripId}`);
                  } else {
                    console.error('Trip ID not available for booking');
                    alert('Trip information not available. Please try again.');
                  }
                }}
                className="bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white py-4 px-6 sm:px-8 rounded-2xl font-bold font-['DM_Sans'] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <span>📞</span>
                <span>Individual Booking</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!isAuthenticated) {
                    setShowAuthModal(true);
                    return;
                  }
                  
                  const tripId = trip?._id || trip?.id;
                  console.log('Bottom corporate button clicked, tripId:', tripId);
                  if (tripId) {
                    navigate(`/corporate-booking/trip/${tripId}`);
                  } else {
                    console.error('Trip ID not available for corporate booking');
                    alert('Trip information not available. Please try again.');
                  }
                }}
                className="bg-white border-2 border-[#3B71FE] text-[#3B71FE] py-4 px-6 sm:px-8 rounded-2xl font-bold font-['DM_Sans'] hover:bg-[#3B71FE] hover:text-white transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <span>🏢</span>
                <span>Group Booking</span>
              </button>
              
              {trip.sharing?.allowCopy && (
                <button className="bg-white border-2 border-[#E6E8EC] text-[#23262F] py-4 px-6 rounded-2xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] hover:bg-[#3B71FE]/5 transition-all duration-200 text-sm sm:text-base flex items-center gap-2">
                  <span>📎</span>
                  <span>Share Trip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Related Trips Section */}
      {relatedTrips.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-[#F4F5F6] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-black text-[#23262F] font-['DM_Sans'] mb-4">You might also like</h2>
              <p className="text-[#777E90] font-['Poppins']">Similar adventures waiting for you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTrips.slice(0, 3).map((relatedTrip, index) => (
                <div
                  key={relatedTrip._id || index}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2"
                  onClick={() => navigate(`/trips/${relatedTrip.slug || relatedTrip._id}`)}
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={relatedTrip.images?.[0]?.url?.startsWith('http') 
                        ? relatedTrip.images[0].url 
                        : relatedTrip.images?.[0]?.url 
                          ? `${API_BASE_URL}${relatedTrip.images[0].url}` 
                          : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'}
                      alt={relatedTrip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-black text-white mb-1 drop-shadow-lg font-['DM_Sans'] leading-tight">
                        {relatedTrip.title?.replace(/<[^>]*>/g, '') || 'Amazing Trip'}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow font-['Poppins']">
                        📍 {relatedTrip.primaryDestination?.name || 'Beautiful Destination'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-lg font-black text-[#23262F] font-['DM_Sans']">
                        {relatedTrip.pricing?.currency === 'INR' ? '₹' : '$'}{relatedTrip.pricing?.finalPrice?.toLocaleString() || relatedTrip.pricing?.estimated?.toLocaleString() || '1,999'}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#FFD166]">⭐</span>
                        <span className="font-bold text-[#23262F] font-['DM_Sans'] text-sm">{relatedTrip.stats?.rating || 4.8}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white py-2 px-3 rounded-xl font-bold font-['DM_Sans'] text-sm hover:shadow-lg transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${relatedTrip.slug || relatedTrip._id}`);
                        }}
                      >
                        View Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Gallery Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowImageModal(false);
            }
          }}
          onFocus={() => {
            // Focus trap - focus the close button when modal opens
            const closeButton = document.querySelector('[aria-label="Close gallery"]') as HTMLElement;
            if (closeButton) {
              closeButton.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowImageModal(false);
            } else if (e.key === 'ArrowLeft' && Array.isArray(trip?.images) && trip.images.length > 1) {
              const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : trip.images.length - 1;
              setSelectedImageIndex(Math.max(0, Math.min(newIndex, trip.images.length - 1)));
            } else if (e.key === 'ArrowRight' && Array.isArray(trip?.images) && trip.images.length > 1) {
              const newIndex = selectedImageIndex < trip.images.length - 1 ? selectedImageIndex + 1 : 0;
              setSelectedImageIndex(Math.max(0, Math.min(newIndex, trip.images.length - 1)));
            }
          }}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close gallery"
            >
              ×
            </button>
            
            {/* Previous Button */}
            {Array.isArray(trip?.images) && trip.images.length > 1 && (
              <button 
                onClick={() => {
                  const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : trip.images.length - 1;
                  setSelectedImageIndex(Math.max(0, Math.min(newIndex, trip.images.length - 1)));
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Next Button */}
            {Array.isArray(trip?.images) && trip.images.length > 1 && (
              <button 
                onClick={() => {
                  const newIndex = selectedImageIndex < trip.images.length - 1 ? selectedImageIndex + 1 : 0;
                  setSelectedImageIndex(Math.max(0, Math.min(newIndex, trip.images.length - 1)));
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Main Image */}
            <img
              src={(() => {
                const images = Array.isArray(trip?.images) ? trip.images : [];
                const currentImage = images[selectedImageIndex];
                if (currentImage?.url) {
                  return currentImage.url.startsWith('http') 
                    ? sanitizeUrl(currentImage.url) 
                    : `${API_BASE_URL}${currentImage.url}`;
                }
                return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
              })()} 
              alt={`${trip?.title || 'Trip'} - Image ${selectedImageIndex + 1} of ${Array.isArray(trip?.images) ? trip.images.length : 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
              }}
            />
            
            {/* Image Counter */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-['Poppins']" role="status" aria-live="polite">
              {selectedImageIndex + 1} / {Array.isArray(trip?.images) ? trip.images.length : 1}
            </div>
            
            {/* Thumbnail Strip */}
            {Array.isArray(trip?.images) && trip.images.length > 1 && (
              <div className="hidden sm:flex absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 gap-2 max-w-full overflow-x-auto px-4">
                {trip.images.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => {
                      if (index >= 0 && index < trip.images.length) {
                        setSelectedImageIndex(index);
                      }
                    }}
                    className={`flex-shrink-0 w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-white ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-white opacity-100' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                    aria-label={`View image ${index + 1} of ${trip.images.length}`}
                  >
                    <img
                      src={image?.url 
                        ? (image.url.startsWith('http') ? sanitizeUrl(image.url) : `${API_BASE_URL}${image.url}`)
                        : `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=64&h=48&fit=crop`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=64&h=48&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login" 
      />
    </div>
  );
};

// Utility function with cancellation support
function debounce(func: Function, delay: number) {
  let timeoutId: number;
  const debounced = (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(null, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

export default TripDetailsPageEnhanced;
