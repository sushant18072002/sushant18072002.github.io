import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripService, Trip, TripFilters } from '@/services/trip.service';
import { masterDataService, Category } from '@/services/masterData.service';
import { apiService } from '@/services/api.service';
import { sanitizeHtml } from '@/utils/sanitize';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

// Emoji pattern for cleaning suggestions
const EMOJI_PATTERN = /^[📍🔍🎯🏷️✨🎨⚡📂🏖️🌊☀️🏔️⛰️🥾🏛️🎭💎🥂🛎️💰🎒💵👨👩👧👦🎠👶💕🌹💑🎢🧗🚁]\s/;
const SUFFIX_PATTERN = /\s(trips?|difficulty|getaways?|destinations?|experiences?|adventures?|sports?|escapes?|holidays?|tours?)$/i;

// Helper functions
const cleanSuggestionText = (suggestion: string): string => {
  return suggestion
    .replace(EMOJI_PATTERN, '')
    .replace(SUFFIX_PATTERN, '')
    .trim();
};

const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop';
  }
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${API_BASE_URL}${imageUrl}`;
};

const sanitizeAndTruncate = (text?: string, maxLength: number = 100): string => {
  if (!text) return 'Discover amazing experiences and create unforgettable memories';
  return sanitizeHtml(text).substring(0, maxLength);
};

const getCurrencySymbol = (currency?: string): string => {
  switch (currency) {
    case 'INR': return '₹';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return '$';
  }
};

const TripsHubPageRedesigned: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<TripFilters>({
    category: '',
    priceRange: '',
    duration: '',
    search: ''
  });
  
  // Use cleanup hook
  useCleanup();

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || searchParams.get('description') || '';
    const budget = searchParams.get('budget') || '';
    
    setActiveFilters({
      category: mapCategoryFromUrl(category),
      priceRange: mapBudgetFromUrl(budget),
      duration: '',
      search
    });
    
    if (search) setSearchQuery(search);
    
    // Cleanup function
    return () => {
      setShowSuggestions(false);
      setSuggestions([]);
    };
  }, [searchParams]);

  // Load data when filters change
  useEffect(() => {
    const controller = new AbortController();
    
    const loadData = async () => {
      if (activeFilters.search || activeFilters.category || activeFilters.priceRange || activeFilters.duration) {
        await loadTrips(controller.signal);
      } else {
        await loadFeaturedTrips(controller.signal);
      }
    };
    
    loadData();
    
    return () => {
      controller.abort();
    };
  }, [activeFilters]);

  const mapCategoryFromUrl = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'adventure-trips': 'adventure',
      'cultural-trips': 'cultural',
      'beach-trips': 'relaxation'
    };
    return categoryMap[category] || category;
  };

  const mapBudgetFromUrl = (budget: string): string => {
    const budgetMap: Record<string, string> = {
      'budget': 'budget',
      'mid-range': 'mid-range',
      'luxury': 'luxury'
    };
    return budgetMap[budget] || '';
  };

  const loadFeaturedTrips = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [tripsResponse, categoriesResponse] = await Promise.all([
        tripService.getFeaturedTrips(),
        masterDataService.getCategories('trip')
      ]);
      
      if (!signal?.aborted) {
        setFeaturedTrips(tripsResponse.trips || []);
        setTrips(tripsResponse.trips || []);
        setCategories(categoriesResponse.categories || []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Failed to load featured trips:', error);
        setFeaturedTrips([]);
        setTrips([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const loadTrips = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await tripService.getTrips(activeFilters);
      if (!signal?.aborted) {
        setTrips(response.trips || []);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Failed to load trips:', error);
        setTrips([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activeFilters]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        handleGenerateSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [trips, featuredTrips, categories]
  );

  const handleGenerateSuggestions = useCallback(async (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    try {
      const response = await apiService.get(`/trips?search=${encodeURIComponent(query)}&limit=5`);
      
      if (response.success && response.data?.trips?.length > 0) {
        const apiSuggestions = response.data.trips.map((trip: any) => {
          if (trip.primaryDestination?.name) {
            return `📍 ${trip.primaryDestination.name}`;
          }
          return `🎯 ${trip.title?.replace(/<[^>]*>/g, '').substring(0, 40) || 'Trip'}`;
        });
        
        setSuggestions([...new Set(apiSuggestions)].slice(0, 4));
        setShowSuggestions(true);
        return;
      }
    } catch (error) {
      console.warn('Search API not available, using local suggestions');
    }
    
    // Enhanced local suggestions fallback
    const suggestions = new Set<string>();
    const searchTrips = trips.length > 0 ? trips : featuredTrips;
    
    // Quick destination matching
    searchTrips.forEach(trip => {
      if (trip.primaryDestination?.name?.toLowerCase().includes(lowerQuery)) {
        suggestions.add(`📍 ${trip.primaryDestination.name}`);
      }
    });
    
    // Category matching
    categories.forEach(cat => {
      if (cat.name?.toLowerCase().includes(lowerQuery)) {
        suggestions.add(`${cat.icon || '📂'} ${cat.name}`);
      }
    });
    
    // Smart contextual suggestions
    const contextualMap: Record<string, string> = {
      'beach': '🏖️ Beach destinations',
      'mountain': '🏔️ Mountain adventures', 
      'culture': '🏛️ Cultural experiences',
      'luxury': '💎 Luxury getaways',
      'budget': '💰 Budget adventures',
      'family': '👨👩👧👦 Family trips',
      'romantic': '💕 Romantic escapes',
      'adventure': '🎢 Adventure sports',
      'lal': '🎯 Lala Land',
      'berlin': '📍 Berlin',
      'manali': '📍 Manali'
    };
    
    Object.entries(contextualMap).forEach(([key, suggestion]) => {
      if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
        suggestions.add(suggestion);
      }
    });
    
    // Add popular search terms
    const popularTerms = ['Adventure trips', 'Cultural tours', 'Beach holidays', 'Mountain treks'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(lowerQuery)) {
        suggestions.add(`🔍 ${term}`);
      }
    });
    
    setSuggestions(Array.from(suggestions).slice(0, 6));
    setShowSuggestions(true);
  }, [trips, featuredTrips, categories]);



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters(prev => ({ ...prev, search: searchQuery }));
    setShowSuggestions(false);
  };

  const updateFilter = (key: keyof TripFilters, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setActiveFilters({ category: '', priceRange: '', duration: '', search: '' });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const hasActiveFilters = useMemo(() => 
    Object.values(activeFilters).some(value => value !== ''),
    [activeFilters]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-emerald-500/5 to-amber-400/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 px-4 py-2 rounded-full text-sm mb-6 text-emerald-700 font-medium">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>✨ {trips.length || featuredTrips.length} amazing trips available</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#23262F] mb-4 sm:mb-6 font-['DM_Sans'] leading-[0.9] sm:leading-[0.85] tracking-tight">
              Your next amazing<br/>
              <span className="bg-gradient-to-r from-[#3B71FE] to-[#58C27D] bg-clip-text text-transparent">
                adventure awaits
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-[#777E90] mb-6 sm:mb-8 font-['Poppins'] leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
              Discover handcrafted itineraries, customize to your heart's content, and create memories that last forever
            </p>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B1B5C3] text-xl">🔍</div>
                  <input
                    type="text"
                    placeholder="Search destinations, activities, or dream trips..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) {
                        debouncedSearch(e.target.value);
                      } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) {
                        handleGenerateSuggestions(searchQuery);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E6E8EC] rounded-2xl focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] transition-all text-base font-['Poppins'] placeholder:text-[#B1B5C3] shadow-sm hover:shadow-md"
                  />
                  
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilters(prev => ({ ...prev, search: '' }));
                        setShowSuggestions(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B1B5C3] hover:text-[#777E90] text-xl"
                    >
                      ✕
                    </button>
                  )}
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E8EC] rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            const cleanSuggestion = cleanSuggestionText(suggestion);
                            setSearchQuery(cleanSuggestion);
                            setActiveFilters(prev => ({ ...prev, search: cleanSuggestion }));
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-[#F4F5F6] transition-colors font-['Poppins'] text-[#23262F] border-b border-[#E6E8EC] last:border-b-0 flex items-center gap-2"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white rounded-2xl font-bold font-['DM_Sans'] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="py-8 bg-white border-t border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Category Filters */}
            {[
              { key: '', label: 'All Trips', icon: '🌍' },
              { key: 'adventure', label: 'Adventure', icon: '🏔️' },
              { key: 'cultural', label: 'Cultural', icon: '🏛️' },
              { key: 'relaxation', label: 'Beach & Wellness', icon: '🏖️' },
              { key: 'romance', label: 'Romance', icon: '💕' },
              { key: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => updateFilter('category', filter.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilters.category === filter.key
                    ? 'bg-[#3B71FE] text-white shadow-lg'
                    : 'bg-[#F4F5F6] text-[#777E90] hover:bg-[#E6E8EC] hover:text-[#23262F]'
                }`}
              >
                <span>{filter.icon}</span>
                <span className="font-['DM_Sans']">{filter.label}</span>
              </button>
            ))}
          </div>
          
          {/* Price Range Filters */}
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {[
              { key: '', label: 'Any Budget' },
              { key: 'budget', label: '💰 Under $1,500' },
              { key: 'mid-range', label: '💵 $1,500 - $3,500' },
              { key: 'luxury', label: '💎 Above $3,500' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => updateFilter('priceRange', filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilters.priceRange === filter.key
                    ? 'bg-[#58C27D] text-white shadow-lg'
                    : 'bg-white border border-[#E6E8EC] text-[#777E90] hover:border-[#58C27D] hover:text-[#58C27D]'
                }`}
              >
                <span className="font-['DM_Sans']">{filter.label}</span>
              </button>
            ))}
          </div>
          
          {hasActiveFilters && (
            <div className="text-center mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-[#777E90] hover:text-[#23262F] font-medium font-['Poppins'] underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#23262F] font-['DM_Sans'] leading-tight mb-2">
              {hasActiveFilters 
                ? `${trips.length} trips found`
                : '✨ Featured Adventures'
              }
            </h2>
            
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.search && (
                  <span className="px-3 py-1 bg-[#3B71FE]/10 text-[#3B71FE] rounded-full text-sm font-medium">
                    🔍 "{activeFilters.search}"
                  </span>
                )}
                {activeFilters.category && (
                  <span className="px-3 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-full text-sm font-medium">
                    📂 {activeFilters.category}
                  </span>
                )}
                {activeFilters.priceRange && (
                  <span className="px-3 py-1 bg-[#FFD166]/10 text-[#FFD166] rounded-full text-sm font-medium">
                    💰 {activeFilters.priceRange}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-[#3B71FE] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#777E90] font-['Poppins']">Finding amazing trips for you...</p>
            </div>
          )}

          {/* Trips Grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {trips.map((trip, index) => (
                <div
                  key={`trip-${trip._id || trip.slug || index}-${trip.title?.substring(0, 10) || 'trip'}`}
                  className="group cursor-pointer bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 active:scale-95 sm:active:scale-100"
                  onClick={() => navigate(`/trips/${trip.slug || trip._id}`)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={getImageUrl(trip.images?.[0]?.url)}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      {trip.featured && (
                        <span className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          🔥 Featured
                        </span>
                      )}
                      <span className="bg-white/90 backdrop-blur-sm text-[#23262F] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ml-auto">
                        {trip.duration?.days || 5} Days
                      </span>
                    </div>
                    
                    {/* Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-black text-white mb-1 drop-shadow-lg font-['DM_Sans'] leading-tight">
                        {sanitizeHtml(trip.title) || 'Amazing Adventure'}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow font-['Poppins']">
                        📍 {sanitizeHtml(trip.primaryDestination?.name) || 'Beautiful Destination'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <span className="px-2 py-1 bg-[#3B71FE]/10 text-[#3B71FE] rounded-lg text-xs font-medium whitespace-nowrap">
                        {trip.category?.icon} {sanitizeHtml(trip.category?.name)}
                      </span>
                      {trip.difficulty && (
                        <span className="px-2 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-lg text-xs font-medium whitespace-nowrap">
                          {sanitizeHtml(trip.difficulty?.charAt(0).toUpperCase() + trip.difficulty?.slice(1))}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-[#777E90] text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed font-['Poppins']">
                      {sanitizeAndTruncate(trip.description, 100)}...
                    </p>
                    
                    {/* Trip Details */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-xs">
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#F4F5F6] rounded-lg min-h-[24px]">
                        <span className="text-xs">👥</span>
                        <span className="text-[#777E90] font-['Poppins'] text-xs">{Math.max(1, trip.groupSize?.min || 1)}-{Math.min(50, trip.groupSize?.max || 20)} guests</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#F4F5F6] rounded-lg min-h-[24px]">
                        <span className="text-xs">💪</span>
                        <span className="text-[#777E90] font-['Poppins'] capitalize text-xs">{(['low', 'moderate', 'high'].includes(trip.physicalRequirements?.fitnessLevel) ? trip.physicalRequirements.fitnessLevel : 'low')} fitness</span>
                      </div>
                      {trip.bookingInfo?.instantBook ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#58C27D]/10 rounded-lg min-h-[24px]">
                          <span className="text-xs">⚡</span>
                          <span className="text-[#58C27D] font-['Poppins'] font-medium text-xs">Instant book</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD166]/10 rounded-lg min-h-[24px]">
                          <span className="text-xs">📋</span>
                          <span className="text-[#FFD166] font-['Poppins'] font-medium text-xs">Approval needed</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Price & Rating */}
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        {trip.pricing?.discountAmount > 0 && trip.pricing?.sellPrice && (
                          <div className="text-sm text-[#B1B5C3] line-through font-['DM_Sans'] mb-1">
                            {getCurrencySymbol(trip.pricing?.currency)}{trip.pricing.sellPrice.toLocaleString()}
                          </div>
                        )}
                        <div className="text-2xl font-black text-[#23262F] font-['DM_Sans'] leading-none">
                          {getCurrencySymbol(trip.pricing?.currency)}{(trip.pricing?.finalPrice || trip.pricing?.estimated || 1999).toLocaleString()}
                          {trip.pricing?.discountPercent > 0 && (
                            <span className="text-sm text-[#58C27D] font-medium ml-2">
                              {Math.round(Math.min(99, Math.max(1, trip.pricing.discountPercent)))}% off
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#777E90] font-medium font-['Poppins'] mt-1">
                          per person • {trip.pricing?.priceRange || 'mid-range'} • {trip.pricing?.taxIncluded ? 'taxes included' : 'plus taxes'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-[#FFD166] text-base">⭐</span>
                          <span className="font-bold text-[#23262F] font-['DM_Sans'] text-sm">{trip.stats?.rating || 'New'}</span>
                          {trip.stats?.reviewCount > 0 && (
                            <span className="text-xs text-[#777E90] font-['Poppins']">({trip.stats.reviewCount})</span>
                          )}
                        </div>
                        <div className="text-xs text-[#58C27D] font-medium font-['Poppins']">
                          👁️ {trip.stats?.views || 0} views
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Policy */}
                    <div className="text-xs text-[#777E90] font-['Poppins'] mb-3 sm:mb-4 p-2 bg-[#F4F5F6] rounded-lg">
                      ✅ {trip.bookingInfo?.cancellationPolicy || 'Free cancellation available'} • 
                      💳 {Math.min(100, Math.max(0, trip.bookingInfo?.depositRequired || 50))}% deposit required
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button 
                        className="flex-1 bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 font-bold font-['DM_Sans'] text-sm rounded-xl sm:rounded-2xl py-3 px-4 min-h-[44px] active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.slug || trip._id}`);
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="flex-1 sm:flex-none px-4 py-3 border-2 border-[#3B71FE] text-[#3B71FE] hover:bg-[#3B71FE] hover:text-white transition-all duration-300 font-bold font-['DM_Sans'] text-sm rounded-xl sm:rounded-2xl min-h-[44px] active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.slug || trip._id}/customize`);
                        }}
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && trips.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🌍</div>
              <h3 className="text-2xl font-black text-[#23262F] mb-4 font-['DM_Sans']">No trips found</h3>
              <p className="text-[#777E90] mb-8 font-['Poppins'] max-w-md mx-auto leading-relaxed">
                Try adjusting your search or explore our amazing featured trips
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
                <button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white px-6 py-3 rounded-xl sm:rounded-2xl font-bold font-['DM_Sans'] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base min-h-[44px] active:scale-95"
                >
                  Clear Search
                </button>
                <button 
                  onClick={() => navigate('/ai-itinerary')}
                  className="border-2 border-[#3B71FE] text-[#3B71FE] hover:bg-[#3B71FE] hover:text-white px-6 py-3 rounded-xl sm:rounded-2xl font-bold font-['DM_Sans'] transition-all duration-300 text-sm sm:text-base min-h-[44px] active:scale-95"
                >
                  Create Custom Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gradient-to-br from-[#F4F5F6] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-black bg-gradient-to-r from-[#3B71FE] to-[#58C27D] bg-clip-text text-transparent mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">
                47K+
              </div>
              <div className="text-lg text-[#777E90] font-['Poppins'] font-medium">Happy Travelers</div>
            </div>
            <div className="group">
              <div className="text-5xl font-black bg-gradient-to-r from-[#FFD166] to-[#FF6B35] bg-clip-text text-transparent mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">
                4.9★
              </div>
              <div className="text-lg text-[#777E90] font-['Poppins'] font-medium">Average Rating</div>
            </div>
            <div className="group">
              <div className="text-5xl font-black bg-gradient-to-r from-[#58C27D] to-[#3B71FE] bg-clip-text text-transparent mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">
                95%
              </div>
              <div className="text-lg text-[#777E90] font-['Poppins'] font-medium">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Utility function with cleanup
function debounce(func: Function, delay: number) {
  let timeoutId: number;
  const debounced = (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func.apply(null, args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}

// Cleanup function for component unmount
const useCleanup = () => {
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
    };
  }, []);
};

export default TripsHubPageRedesigned;