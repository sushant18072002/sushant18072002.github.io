import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tripService, Trip, TripFilters } from '@/services/trip.service';
import { masterDataService, Category } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import API_CONFIG from '@/config/api.config';

const QuickTripAccess: React.FC = () => {
  const navigate = useNavigate();
  const [slugs, setSlugs] = useState<{slug: string, title: string}[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadSlugs();
  }, []);

  const loadSlugs = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/trips/slugs`);
      const data = await response.json();
      if (data.success) {
        setSlugs(data.data.slugs || []);
      }
    } catch (error) {
      console.error('Failed to load slugs:', error);
    }
  };

  const displaySlugs = showAll ? slugs : slugs.slice(0, 10);

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex flex-wrap gap-2 mb-4">
        {displaySlugs.map((item) => (
          <button
            key={item.slug}
            onClick={() => navigate(`/trips/${item.slug}`)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-xs font-medium transition-colors"
            title={item.title}
          >
            {item.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>
      {slugs.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {showAll ? 'Show Less' : `Show All ₹{slugs.length} Trips`}
        </button>
      )}
    </div>
  );
};

const TripsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: destinationId } = useParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = useState<Trip[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<TripFilters & { difficulty?: string }>({
    category: '',
    priceRange: '',
    duration: '',
    search: '',
    destination: destinationId || '',
    difficulty: ''
  });

  useEffect(() => {
    loadInitialData();
    loadUrlParameters();
  }, []);

  useEffect(() => {
    if (destinationId) {
      loadDestinationTrips();
    }
  }, [destinationId]);

  const loadUrlParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const destination = urlParams.get('destination');
    const priceRange = urlParams.get('priceRange');
    const description = urlParams.get('description');
    const type = urlParams.get('type');
    const category = urlParams.get('category');
    const budget = urlParams.get('budget');
    
    if (destination || priceRange || description || type || category || budget) {
      const newFilters = { ...filters };
      
      // Set search query from various sources
      if (description) {
        newFilters.search = description;
        setSearchQuery(description);
      } else if (destination) {
        newFilters.search = destination;
        setSearchQuery(destination);
      }
      
      // Set category from type or category - map adventure category types
      if (type) {
        newFilters.category = mapAdventureCategoryToFilter(type);
      } else if (category) {
        newFilters.category = mapAdventureCategoryToFilter(category);
      }
      
      // Set price range
      if (priceRange) {
        newFilters.priceRange = priceRange;
      } else if (budget) {
        // Map budget values to price ranges
        const budgetMap: Record<string, string> = {
          'budget': 'budget',
          'budget-friendly': 'budget',
          'mid-range': 'mid-range',
          'luxury': 'luxury',
          'unlimited': 'luxury'
        };
        newFilters.priceRange = budgetMap[budget] || budget;
      }
      
      setFilters(newFilters);
      
      // Update URL to reflect current state
      const newUrl = new URL(window.location.href);
      if (newFilters.search) newUrl.searchParams.set('search', newFilters.search);
      if (newFilters.category) newUrl.searchParams.set('category', newFilters.category);
      if (newFilters.priceRange) newUrl.searchParams.set('priceRange', newFilters.priceRange);
      window.history.replaceState({}, '', newUrl.toString());
    }
  };
  
  // Map adventure category types to filter values
  const mapAdventureCategoryToFilter = (categoryType: string): string => {
    const categoryMap: Record<string, string> = {
      'adventure': 'adventure',
      'relaxation': 'relaxation', 
      'cultural': 'cultural',
      'city': 'city',
      'nature': 'nature',
      'food': 'food',
      'luxury': 'luxury',
      'romance': 'romance',
      'family': 'family'
    };
    return categoryMap[categoryType] || categoryType;
  };

  useEffect(() => {
    if (filters.search || filters.category || filters.priceRange || filters.duration || (filters as any).difficulty) {
      loadTrips();
    }
  }, [filters]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [featuredResponse, categoriesResponse] = await Promise.all([
        tripService.getFeaturedTrips(),
        masterDataService.getCategories('trip')
      ]);

      setFeaturedTrips(featuredResponse.trips || []);
      setCategories(categoriesResponse.categories || []);
      
      // Auto-load trips if URL parameters exist
      if (window.location.search) {
        loadUrlParameters();
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Fallback to empty arrays
      setFeaturedTrips([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips(filters);
      setTrips(response.trips || []);
    } catch (error) {
      console.error('Failed to load trips:', error);
      // Show user-friendly error message
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDestinationTrips = async () => {
    if (!destinationId) return;
    
    setLoading(true);
    try {
      // Get destination info first
      const destResponse = await fetch(`${API_CONFIG.BASE_URL}/destinations/${destinationId}`);
      const destData = await destResponse.json();
      
      if (destData.success && destData.data.destination) {
        setDestinationName(destData.data.destination.name);
        
        // Search for trips by destination name
        const tripsResponse = await tripService.getTrips({
          search: destData.data.destination.name,
          category: '',
          priceRange: '',
          duration: ''
        });
        
        setTrips(tripsResponse.trips || []);
      }
    } catch (error) {
      console.error('Failed to load destination trips:', error);
      // Fallback: load featured trips
      const response = await tripService.getFeaturedTrips();
      setTrips(response.trips || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setShowSuggestions(false);
    // Auto-scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const generateSuggestions = (query: string) => {
    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Add destination suggestions from featured trips
    featuredTrips.forEach(trip => {
      if (trip.primaryDestination?.name?.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`📍 ₹{trip.primaryDestination.name}`);
      }
      if (trip.title?.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`🎯 ₹{trip.title.replace(/<[^>]*>/g, '')}`);
      }
    });
    
    // Add category suggestions
    categories.forEach(cat => {
      if (cat.name?.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`${cat.icon} ₹{cat.name}`);
      }
    });
    
    // Add popular search terms
    const popularTerms = ['Adventure', 'Beach', 'Mountain', 'City', 'Culture', 'Luxury', 'Budget', 'Family'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(lowerQuery)) {
        suggestions.push(`🔍 ₹{term} trips`);
      }
    });
    
    return [...new Set(suggestions)].slice(0, 6);
  };

  const clearFilters = () => {
    setFilters({ category: '', priceRange: '', duration: '', search: '', destination: destinationId || '', difficulty: '' });
    setSearchQuery('');
    setShowSuggestions(false);
    // Reset to featured trips when clearing filters
    if (!destinationId) {
      setTrips([]);
    }
  };

  const hasActiveFilters = useMemo(() => 
    filters.search || filters.category || filters.priceRange || filters.duration || (filters as any).difficulty,
    [filters.search, filters.category, filters.priceRange, filters.duration, (filters as any).difficulty]
  );
  
  const displayTrips = hasActiveFilters ? trips : featuredTrips;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary-900 mb-4 font-['DM_Sans'] leading-[0.85] tracking-tight">
            {destinationName ? `Trips to ₹{destinationName}` : 'Your next amazing trip starts here'}
          </h1>
          <p className="text-base sm:text-lg text-primary-600 mb-8 font-['Poppins'] font-medium leading-relaxed max-w-2xl mx-auto">
            {destinationName 
              ? `Explore amazing experiences and adventures in ₹{destinationName}`
              : 'See beautiful itineraries, pick what you love, customize to make it yours'
            }
          </p>
          
          {/* Enhanced Search */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search destinations, activities, or trip types..."
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (value.length >= 2) {
                        const suggestions = generateSuggestions(value);
                        setSearchSuggestions(suggestions);
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) {
                        const suggestions = generateSuggestions(searchQuery);
                        setSearchSuggestions(suggestions);
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-blue-ocean transition-all text-base font-['Poppins'] placeholder:text-gray-500 shadow-sm hover:shadow-md"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">🔍</span>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters(prev => ({ ...prev, search: '' }));
                        setShowSuggestions(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  )}
                  
                  {/* Auto Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const cleanSuggestion = suggestion.replace(/^[📍🎯🔍]\s/, '').replace(/ trips$/, '');
                            setSearchQuery(cleanSuggestion);
                            setFilters(prev => ({ ...prev, search: cleanSuggestion }));
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors font-['Poppins'] text-gray-700 hover:text-blue-ocean border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setFilters(prev => ({ ...prev, search: searchQuery.trim() }));
                      setShowSuggestions(false);
                    }
                  }}
                  className="px-8 py-4 bg-blue-ocean text-white rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg min-w-[120px]"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Options - Compact */}
      <section className="py-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-primary-900 mb-1 font-['DM_Sans']">Can't find what you're looking for?</h3>
            <p className="text-sm text-primary-600 font-['Poppins']">Create your own custom trip</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
            <button 
              onClick={() => navigate('/ai-itinerary')}
              className="flex items-center gap-2 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-ocean text-primary-900 px-4 py-3 rounded-lg font-medium font-['DM_Sans'] transition-all duration-300 hover:shadow-sm text-sm"
            >
              <span className="text-lg">🧠</span>
              <span>AI Trip Builder</span>
            </button>
            
            <button 
              onClick={() => navigate('/custom-builder')}
              className="flex items-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald text-primary-900 px-4 py-3 rounded-lg font-medium font-['DM_Sans'] transition-all duration-300 hover:shadow-sm text-sm"
            >
              <span className="text-lg">🛠️</span>
              <span>Custom Builder</span>
            </button>
          </div>
        </div>
      </section>



      {/* Results with Sidebar */}
      <section id="search-results" className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar - Filters */}
            <div className="w-full lg:w-72 flex-shrink-0 order-2 lg:order-1">
              <div className="bg-white border border-gray-200 rounded-xl p-4 lg:sticky lg:top-4">
                <h3 className="text-base font-bold text-primary-900 mb-3 font-['DM_Sans']">Filter Trips</h3>
                
                {/* Quick Filters */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-['DM_Sans']">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: '', label: 'All' },
                        { key: 'adventure', label: '🏔️ Adventure' },
                        { key: 'cultural', label: '🎭 Culture' },
                        { key: 'relaxation', label: '🧘 Wellness' },
                        { key: 'romance', label: '💕 Romance' },
                        { key: 'family', label: '👨‍👩‍👧‍👦 Family' }
                      ].map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setFilters(prev => ({ ...prev, category: cat.key }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ₹{
                            filters.category === cat.key
                              ? 'bg-blue-ocean text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-['DM_Sans']">Price Range</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: '', label: 'Any Budget' },
                        { key: 'budget', label: '💰 Under ₹1,500' },
                        { key: 'mid-range', label: '💵 ₹1,500 - ₹3,500' },
                        { key: 'luxury', label: '💎 Above ₹3,500' }
                      ].map(price => (
                        <button
                          key={price.key}
                          onClick={() => setFilters(prev => ({ ...prev, priceRange: price.key }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ₹{
                            filters.priceRange === price.key
                              ? 'bg-emerald text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {price.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-['DM_Sans']">Duration</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: '', label: 'Any Duration' },
                        { key: '1-3', label: '📅 1-3 Days' },
                        { key: '4-7', label: '📅 4-7 Days' },
                        { key: '8-14', label: '📅 1-2 Weeks' },
                        { key: '15+', label: '📅 2+ Weeks' }
                      ].map(duration => (
                        <button
                          key={duration.key}
                          onClick={() => setFilters(prev => ({ ...prev, duration: duration.key }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ₹{
                            filters.duration === duration.key
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block font-['DM_Sans']">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: '', label: 'Any Level' },
                        { key: 'easy', label: '🟢 Easy' },
                        { key: 'moderate', label: '🟡 Moderate' },
                        { key: 'challenging', label: '🔴 Challenging' }
                      ].map(diff => (
                        <button
                          key={diff.key}
                          onClick={() => setFilters(prev => ({ ...prev, difficulty: diff.key }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ₹{
                            (filters as any).difficulty === diff.key
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {diff.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {(filters.search || filters.category || filters.priceRange || filters.duration || (filters as any).difficulty) && (
                    <button
                      onClick={clearFilters}
                      className="w-full mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium font-['DM_Sans']"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 order-1 lg:order-2">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-primary-900 font-['DM_Sans'] leading-[0.9] tracking-tight mb-2">
                  {destinationName
                    ? `${displayTrips.length} trips to ₹{destinationName}`
                    : hasActiveFilters
                    ? `${displayTrips.length} trips found`
                    : '✨ Amazing Trips People Love'
                  }
                </h2>
                {(filters.search || filters.category || filters.priceRange || filters.duration || (filters as any).difficulty) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filters.search && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium font-['DM_Sans']">
                        🔍 "{filters.search}"
                      </span>
                    )}
                    {filters.category && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium font-['DM_Sans']">
                        📂 {filters.category}
                      </span>
                    )}
                    {filters.priceRange && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium font-['DM_Sans']">
                        💰 {filters.priceRange}
                      </span>
                    )}
                    {filters.duration && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium font-['DM_Sans']">
                        📅 {filters.duration} days
                      </span>
                    )}
                    {(filters as any).difficulty && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium font-['DM_Sans']">
                        🎯 {(filters as any).difficulty}
                      </span>
                    )}
                  </div>
                )}
              </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="lg" />
              <p className="text-primary-600 font-['Poppins'] mt-4">Finding amazing trips for you...</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayTrips.map((trip, index) => (
                <div
                  key={trip.id || trip._id || `trip-${index}`}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg"
                  onClick={() => navigate(`/trips/${trip.slug || trip._id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={trip.images?.[0]?.url?.startsWith('http') 
        ? trip.images[0].url 
        : trip.images?.[0]?.url 
          ? `${API_CONFIG.BASE_URL.replace('/api', '')}${trip.images[0].url}` 
          : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&auto=format'}
                      alt={trip.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&auto=format';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      {trip.featured && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg font-['DM_Sans']">
                          🔥 Trending
                        </span>
                      )}
                      <span className="bg-white/90 backdrop-blur-sm text-primary-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg font-['DM_Sans'] ml-auto">
                        {trip.duration?.days || 0} Days
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-lg font-['DM_Sans'] leading-tight">
                        {trip.title?.replace(/<[^>]*>/g, '') || 'Untitled Trip'}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow font-['Poppins']">
                        📍 {trip.primaryDestination?.name || 'Amazing Destination'} • {trip.duration?.days || 5} Days
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium font-['DM_Sans']">
                        {trip.category?.icon} {trip.category?.name}
                      </span>
                      {trip.difficulty && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium font-['DM_Sans']">
                          {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
                        </span>
                      )}
                      {trip.suitableFor?.couples && (
                        <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium font-['DM_Sans']">
                          💕 Couples
                        </span>
                      )}
                    </div>
                    
                    <p className="text-primary-600 text-sm mb-4 line-clamp-2 leading-relaxed font-['Poppins']">
                      {trip.description?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Discover amazing experiences and create unforgettable memories on this incredible journey'}...
                    </p>
                    
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <div className="text-xl font-black text-emerald font-['DM_Sans'] leading-none">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString() || 'TBD'}
                        </div>
                        <div className="text-xs text-primary-500 font-medium font-['Poppins'] mt-1">
                          per person • {trip.pricing?.priceRange || 'budget'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-amber-400 text-base">⭐</span>
                          <span className="font-bold text-primary-900 font-['DM_Sans'] text-sm">{trip.stats?.rating || 4.5}</span>
                          <span className="text-xs text-primary-500 font-['Poppins']">({trip.stats?.reviewCount || 89})</span>
                        </div>
                        <div className="text-xs text-green-600 font-medium font-['Poppins']">
                          👁️ {trip.stats?.views || 12} views
                        </div>
                      </div>
                    </div>
                    

                    
                    <div className="flex gap-3">
                      <button 
                        className="flex-1 bg-blue-ocean text-white hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg font-bold font-['DM_Sans'] text-sm rounded-xl py-3 px-4 min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Track user interaction
                          console.log('Trip viewed:', {
                            tripId: trip._id,
                            title: trip.title,
                            category: trip.category?.name,
                            searchQuery: filters.search,
                            timestamp: new Date().toISOString()
                          });
                          
                          // Pass current search context to trip details
                          const searchParams = new URLSearchParams();
                          if (filters.search) searchParams.set('from', 'search');
                          if (filters.category) searchParams.set('category', filters.category);
                          const queryString = searchParams.toString();
                          navigate(`/trips/${trip.slug || trip._id}${queryString ? '?' + queryString : ''}`);
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="px-4 py-3 border-2 border-blue-ocean text-blue-ocean hover:bg-blue-ocean hover:text-white transition-all duration-300 font-bold font-['DM_Sans'] text-sm rounded-xl min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Track customization intent
                          console.log('Trip customization started:', {
                            tripId: trip._id,
                            title: trip.title,
                            fromSearch: true,
                            timestamp: new Date().toISOString()
                          });
                          
                          // Pass trip data to customize page
                          navigate(`/trips/${trip.slug || trip._id}/customize`, {
                            state: {
                              tripData: {
                                title: trip.title,
                                destination: trip.primaryDestination?.name,
                                duration: trip.duration,
                                pricing: trip.pricing,
                                category: trip.category
                              },
                              fromSearch: true
                            }
                          });
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

              {displayTrips.length === 0 && !loading && (
                <div className="text-center py-12 col-span-full">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-tight">No trips found</h3>
                  <p className="text-base text-primary-600 mb-6 font-['Poppins'] leading-relaxed max-w-md mx-auto">Try adjusting your search or explore our amazing featured trips</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={clearFilters}
                      className="bg-blue-ocean text-white hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg font-bold font-['DM_Sans'] px-5 py-2.5 rounded-xl text-sm"
                    >
                      Clear Search
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/ai-itinerary')}
                      className="border-2 border-blue-ocean text-blue-ocean hover:bg-blue-ocean hover:text-white transition-all duration-300 font-bold font-['DM_Sans'] px-5 py-2.5 rounded-xl text-sm"
                    >
                      Create Custom Trip
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-5xl sm:text-6xl font-black text-blue-ocean mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">47K+</div>
              <div className="text-xl text-primary-600 font-['Poppins'] font-medium">Happy Travelers</div>
            </div>
            <div className="group">
              <div className="text-5xl sm:text-6xl font-black text-amber-500 mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">4.9★</div>
              <div className="text-xl text-primary-600 font-['Poppins'] font-medium">Average Rating</div>
            </div>
            <div className="group">
              <div className="text-5xl sm:text-6xl font-black text-emerald mb-4 font-['DM_Sans'] group-hover:scale-110 transition-transform duration-300">95%</div>
              <div className="text-xl text-primary-600 font-['Poppins'] font-medium">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-primary-900 mb-3 font-['DM_Sans'] leading-[0.9] tracking-tight">It's This Simple</h2>
            <p className="text-base text-primary-600 font-['Poppins'] font-medium">Three easy ways to get your perfect trip</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'See & Love', desc: 'Browse beautiful trips and find one you love', icon: '🔍' },
              { step: '2', title: 'Customize', desc: 'Adjust dates, activities, and budget to fit you', icon: '⚙️' },
              { step: '3', title: 'Book & Go', desc: 'Everything\'s planned - just pack and enjoy', icon: '✈️' }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-ocean to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 font-['DM_Sans'] shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-tight">{item.title}</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripsHubPage;
