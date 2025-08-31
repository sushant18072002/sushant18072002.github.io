import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tripService, Trip, TripFilters } from '@/services/trip.service';
import { masterDataService, Category } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const QuickTripAccess: React.FC = () => {
  const navigate = useNavigate();
  const [slugs, setSlugs] = useState<{slug: string, title: string}[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadSlugs();
  }, []);

  const loadSlugs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trips/slugs');
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
          {showAll ? 'Show Less' : `Show All ${slugs.length} Trips`}
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
  const [filters, setFilters] = useState<TripFilters>({
    category: '',
    priceRange: '',
    duration: '',
    search: '',
    destination: destinationId || ''
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
    if (filters.search || filters.category || filters.priceRange || filters.duration) {
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
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      const response = await tripService.getTrips(filters);
      setTrips(response.trips || []);
    } catch (error) {
      console.error('Failed to load trips:', error);
    }
  };

  const loadDestinationTrips = async () => {
    if (!destinationId) return;
    
    setLoading(true);
    try {
      // Get destination info first
      const destResponse = await fetch(`http://localhost:3000/api/destinations/${destinationId}`);
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
  };

  const clearFilters = () => {
    setFilters({ category: '', priceRange: '', duration: '', search: '', destination: destinationId || '' });
    setSearchQuery('');
    setTrips([]);
  };

  const hasActiveFilters = useMemo(() => 
    filters.search || filters.category || filters.priceRange || filters.duration,
    [filters.search, filters.category, filters.priceRange, filters.duration]
  );
  
  const displayTrips = hasActiveFilters ? trips : featuredTrips;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary-900 mb-4 font-['DM_Sans'] leading-[0.9] tracking-tight">
            {destinationName ? `Trips to ${destinationName}` : 'Your next amazing trip starts here'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-600 mb-8 font-['Poppins'] font-medium leading-relaxed max-w-3xl mx-auto">
            {destinationName 
              ? `Explore amazing experiences and adventures in ${destinationName}`
              : 'See beautiful itineraries, pick what you love, customize to make it yours'
            }
          </p>
          
          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder={destinationName ? `Search trips in ${destinationName}...` : "Where do you want to go? (e.g., Paris, Tokyo, Bali)"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Any Experience</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="relaxation">Beach & Relaxation</option>
                    <option value="city">City Break</option>
                    <option value="nature">Nature & Wildlife</option>
                    <option value="food">Food & Wine</option>
                    <option value="luxury">Luxury</option>
                    <option value="romance">Romance</option>
                    <option value="family">Family</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="">Any Budget</option>
                    <option value="budget">Budget ($500-$1,500)</option>
                    <option value="mid-range">Mid-range ($1,500-$3,500)</option>
                    <option value="luxury">Luxury ($3,500+)</option>
                  </select>
                </div>
              </div>
              <Button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🔍 Find Perfect Trips
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/ai-itinerary')}
              className="flex items-center gap-2"
            >
              🤖 AI Trip Planner
              <span className="text-sm opacity-75">Create from scratch</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/custom-builder')}
              className="flex items-center gap-2"
            >
              🛠️ Custom Builder
              <span className="text-sm opacity-75">Step-by-step</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {/* Trip Categories from Database */}
                {categories.filter(cat => cat.type === 'trip').map(category => (
                  <button
                    key={category._id}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      category: prev.category === category.slug ? '' : category.slug 
                    }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.category === category.slug
                        ? 'bg-blue-ocean text-white shadow-lg'
                        : 'bg-white text-primary-700 hover:bg-primary-100 border border-primary-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>

              {/* Price Range */}
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="">All Prices</option>
                <option value="budget">Budget ($500-$1,500)</option>
                <option value="mid-range">Mid-range ($1,500-$3,500)</option>
                <option value="luxury">Luxury ($3,500+)</option>
              </select>

              {/* Duration */}
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="">Any Duration</option>
                <option value="1-3">1-3 days</option>
                <option value="4-7">4-7 days</option>
                <option value="8-14">1-2 weeks</option>
                <option value="15-999">2+ weeks</option>
              </select>
            </div>

            {(filters.search || filters.category || filters.priceRange || filters.duration) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-900 font-['DM_Sans'] leading-[0.9] tracking-tight">
              {destinationName
                ? `${displayTrips.length} trips to ${destinationName}`
                : filters.search || filters.category || filters.priceRange || filters.duration
                ? `${displayTrips.length} trips found`
                : '✨ Amazing Trips People Love'
              }
            </h2>
            <p className="text-base sm:text-lg text-primary-600 font-['Poppins'] font-medium mt-2 mb-6">
              Real itineraries, real experiences, ready to customize
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayTrips.map((trip, index) => (
                <Card
                  key={trip.id || trip._id || `trip-${index}`}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl overflow-hidden border-0 shadow-lg"
                  onClick={() => navigate(`/trips/${trip.slug || trip._id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={trip.images?.[0]?.url?.startsWith('http') 
        ? trip.images[0].url 
        : trip.images?.[0]?.url 
          ? `http://localhost:3000${trip.images[0].url}` 
          : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&auto=format'}
                      alt={trip.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&auto=format';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-primary-900 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {trip.duration?.days || 0} days
                      </span>
                    </div>
                    {trip.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                          ⭐ Featured
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 drop-shadow-lg font-['DM_Sans'] leading-tight">
                        {trip.title?.replace(/<[^>]*>/g, '') || 'Untitled Trip'}
                      </h3>
                      <p className="text-white/90 text-sm drop-shadow">
                        📍 {trip.primaryDestination?.name?.replace(/<[^>]*>/g, '') || trip.destination?.replace(/<[^>]*>/g, '') || 'Multiple Destinations'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 rounded-full text-xs font-semibold">
                        {trip.category?.icon} {trip.category?.name}
                      </span>
                      {trip.difficulty && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-semibold">
                          {trip.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-primary-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {trip.description?.replace(/<[^>]*>/g, '') || 'Discover amazing experiences and create unforgettable memories on this incredible journey.'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald font-['DM_Sans'] leading-none">
                          From ${trip.pricing?.estimated?.toLocaleString() || 'TBD'}
                        </div>
                        <div className="text-xs text-primary-500 font-medium font-['Poppins']">
                          per person • {trip.pricing?.currency || 'USD'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-amber-400 text-lg">⭐</span>
                          <span className="font-bold text-primary-900 font-['DM_Sans']">{trip.stats?.rating || 4.5}</span>
                          <span className="text-xs text-primary-500 font-['Poppins']">({trip.stats?.reviewCount || 0})</span>
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-blue-ocean text-white hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg font-bold font-['DM_Sans'] text-sm rounded-xl py-2.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.slug || trip._id}`);
                        }}
                      >
                        Customize
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-4 border-2 border-blue-ocean text-blue-ocean hover:bg-blue-ocean hover:text-white transition-all duration-300 font-bold font-['DM_Sans'] text-sm rounded-xl py-2.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trips/${trip.slug || trip._id}/ai-similar`);
                        }}
                      >
                        AI Similar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {displayTrips.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-tight">No trips found</h3>
              <p className="text-primary-600 mb-6 font-['Poppins'] leading-relaxed">Try adjusting your filters or search terms</p>
              <div className="space-y-2">
                <Button onClick={clearFilters}>Clear Filters</Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:3000/api/trips/create-samples', { method: 'POST' });
                    const result = await response.json();
                    if (result.success) {
                      alert('Sample trips created!');
                      loadInitialData();
                    }
                  } catch (error) {
                    console.error('Failed to create samples:', error);
                  }
                }}>Create Sample Trips</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Trip Access */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-tight">Quick Access</h2>
            <p className="text-primary-600 text-sm font-['Poppins']">Jump directly to any trip</p>
          </div>
          <QuickTripAccess />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-primary-900 mb-4 font-['DM_Sans'] leading-[0.9] tracking-tight">It's This Simple</h2>
            <p className="text-lg text-primary-600 font-['Poppins'] font-medium">Three easy ways to get your perfect trip</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Discover', desc: 'Browse amazing trips or let AI create one for you', icon: '🔍' },
              { step: '2', title: 'Customize', desc: 'Adjust dates, activities, hotels, and flights to fit you', icon: '⚙️' },
              { step: '3', title: 'Book & Go', desc: 'Everything is planned - just pack and enjoy your adventure', icon: '✈️' }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-ocean text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-tight">{item.title}</h3>
                <p className="text-primary-600 font-['Poppins'] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripsHubPage;