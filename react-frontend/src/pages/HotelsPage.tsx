import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import API_CONFIG from '@/config/api.config';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { debounce } from '@/utils/performance';


// Extend Hotel interface for missing properties
interface HotelData {
  verified?: boolean;
  chain?: string;
  policies?: {
    checkIn?: { from?: string; to?: string; minAge?: number };
    checkOut?: { from?: string; to?: string };
    children?: { allowed?: boolean; freeAge?: number; extraBedFee?: number };
    pets?: { allowed?: boolean; fee?: number; restrictions?: string };
    cancellation?: { type?: string; description?: string };
  };
  location?: {
    address?: { street?: string; area?: string; zipCode?: string };
    coordinates?: { coordinates?: [number, number] };
    cityName?: string;
    countryName?: string;
    nearbyAttractions?: Array<string | { name: string; distance?: number; type?: string }>;
    distanceFromCenter?: number;
  };
  pricing?: {
    currency?: string;
    currencySymbol?: string;
    averageNightlyRate?: number;
    priceRange?: { min?: number; max?: number; currency?: string };
  };
  rooms?: Array<{
    id: string;
    name: string;
    type: string;
    maxOccupancy: number;
    size?: number;
    amenities?: string[];
    bedConfiguration?: {
      singleBeds?: number;
      doubleBeds?: number;
      queenBeds?: number;
      kingBeds?: number;
    };
    pricing?: {
      baseRate: number;
      currency: string;
      currencySymbol?: string;
      taxes?: number;
      fees?: number;
      totalRate?: number;
      cancellationPolicy?: {
        type?: string;
        deadline?: number;
        fee?: number;
      };
    };
    totalRooms?: number;
    images?: Array<{ url: string; alt: string }>;
  }>;
  amenities?: {
    general?: Array<string | { name: string; fee?: number; available?: boolean }>;
    business?: Array<string | { name: string }>;
    recreation?: Array<string | { name: string }>;
    food?: Array<string | { name: string }>;
  };
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    checkIn?: string;
    checkOut?: string;
  };
}
interface HotelSearchForm {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchForm, setSearchForm] = useState<HotelSearchForm>({
    location: searchParams.get('location') || 'Paris, France',
    checkIn: searchParams.get('checkIn') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: searchParams.get('checkOut') || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    guests: parseInt(searchParams.get('guests') || '2', 10),
    rooms: parseInt(searchParams.get('rooms') || '1', 10)
  });
  
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    maxPrice: 500,
    starRating: [] as number[],
    amenities: [] as string[]
  });
  const [popularDestinations, setPopularDestinations] = useState<Array<{_id?: string; name?: string; image?: string; minPrice?: number; avgPrice?: number; count?: number; avgRating?: string}>>([]);
  const [hotelDeals, setHotelDeals] = useState<Array<{_id: string; name: string; images?: Array<{url: string}>; deal?: {discount: number; originalPrice: number; dealPrice: number}; starRating: number; location?: {address?: {area: string}; cityName?: string}; pricing?: {currencySymbol?: string; averageNightlyRate?: number}}>>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{_id: string; name: string; country: string; type: string}>>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await loadInitialData();
        if (searchParams.get('autoSearch') === 'true') {
          handleSearch();
        }
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [destinationsRes, dealsRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/hotels/popular-destinations`).then(r => r.json()),
        fetch(`${API_CONFIG.BASE_URL}/hotels/deals`).then(r => r.json())
      ]);
      
      console.log('📊 Destinations response:', destinationsRes);
      console.log('🔥 Deals response:', dealsRes);
      
      setPopularDestinations(destinationsRes.data?.destinations || []);
      setHotelDeals(dealsRes.data?.deals || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchForm.location?.trim()) {
      setError('Please enter a destination');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    if (!searchForm.checkIn) {
      setError('Please select check-in date');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    if (!searchForm.checkOut) {
      setError('Please select check-out date');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    if (new Date(searchForm.checkIn) >= new Date(searchForm.checkOut)) {
      setError('Check-out date must be after check-in date');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    try {
      // Clean and normalize destination search
      let destination = searchForm.location.trim();
      // Extract city name from "City, Country" format
      if (destination.includes(',')) {
        const parts = destination.split(',');
        destination = parts[0].trim(); // Use just the city name
      }
      
      const queryParams = new URLSearchParams({
        destination: destination,
        checkIn: searchForm.checkIn,
        checkOut: searchForm.checkOut,
        guests: searchForm.guests.toString(),
        priceRange: filters.maxPrice < 100 ? 'budget' : filters.maxPrice < 300 ? 'mid' : 'luxury'
      });
      
      if (filters.starRating.length > 0) {
        queryParams.append('starRating', Math.min(...filters.starRating).toString());
      }
      
      console.log('🔍 Searching hotels with params:', queryParams.toString());
      const response = await fetch(`${API_CONFIG.BASE_URL}/hotels?${queryParams}`);
      const data = await response.json();
      console.log('📊 Search response:', data);
      
      if (data.success) {
        const hotels = data.data?.hotels || [];
        console.log('🏨 Found hotels:', hotels.length);
        setHotels(hotels);
        setSearched(true);
        
        if (hotels.length === 0) {
          console.log('⚠️ No hotels found for:', destination);
        }
      } else {
        console.error('❌ Search failed:', data.error);
        throw new Error(data.error?.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching hotels:', error);
      setError('Error searching hotels. Please try again.');
      setTimeout(() => setError(null), 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotel: Hotel) => {
    navigate(`/hotels/${hotel._id}`, { 
      state: { 
        searchParams: searchForm
      }
    });
  };

  const searchLocations = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setLocationSuggestions([]);
        return;
      }
      
      const sampleLocations = [
        { _id: '1', name: 'Paris', country: 'France', type: 'city' },
        { _id: '2', name: 'New York', country: 'USA', type: 'city' },
        { _id: '3', name: 'Dubai', country: 'UAE', type: 'city' },
        { _id: '4', name: 'Tokyo', country: 'Japan', type: 'city' },
        { _id: '5', name: 'London', country: 'UK', type: 'city' },
        { _id: '6', name: 'Los Angeles', country: 'USA', type: 'city' },
        { _id: '7', name: 'Rome', country: 'Italy', type: 'city' },
        { _id: '8', name: 'Barcelona', country: 'Spain', type: 'city' }
      ];
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/locations/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          const filtered = sampleLocations.filter(location => 
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.country.toLowerCase().includes(query.toLowerCase())
          );
          setLocationSuggestions(filtered);
          return;
        }
        const data = await response.json();
        setLocationSuggestions(data.data?.locations || []);
      } catch (error) {
        const filtered = sampleLocations.filter(location => 
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.country.toLowerCase().includes(query.toLowerCase())
        );
        setLocationSuggestions(filtered);
      }
    }, 300),
    []
  );

  const selectDestination = (destination: string) => {
    setSearchForm(prev => ({ ...prev, location: destination }));
    handleSearch();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const displayHotels = React.useMemo(() => {
    let sortedHotels = [...hotels];
    
    switch (sortBy) {
      case 'price':
        return sortedHotels.sort((a, b) => 
          (a.pricing?.averageNightlyRate || a.pricing?.priceRange?.min || 0) - 
          (b.pricing?.averageNightlyRate || b.pricing?.priceRange?.min || 0)
        );
      case 'rating':
        return sortedHotels.sort((a: any, b: any) => (b.rating?.overall || 0) - (a.rating?.overall || 0));
      case 'distance':
        return sortedHotels.sort((a, b) => 
          (a.location?.distanceFromCenter || 0) - (b.location?.distanceFromCenter || 0)
        );
      default:
        return sortedHotels;
    }
  }, [hotels, sortBy]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hotel Header */}
      <section className="bg-white py-10 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary-900 mb-4 font-['DM_Sans'] tracking-tight leading-[0.9]">Find your perfect stay</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-primary-600 font-['Poppins'] font-medium max-w-2xl mx-auto leading-relaxed">From luxury resorts to cozy boutique hotels</p>
          </div>

          {/* Compact Search Form */}
          <Card className="max-w-4xl mx-auto" padding="md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 items-end justify-items-end">
              {/* Location */}
              <div className="relative col-span-1 sm:col-span-2 xl:col-span-2">
                <label className="block text-xs font-bold text-primary-700 mb-2 font-['DM_Sans'] uppercase tracking-wider">Where are you going?</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.location}
                    onChange={(e) => {
                      setSearchForm(prev => ({ ...prev, location: e.target.value }));
                      searchLocations(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => {
                      setShowLocationSuggestions(true);
                      if (searchForm.location.length >= 2) {
                        searchLocations(searchForm.location);
                      }
                    }}
                    className="w-full min-w-[240px] pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-sm font-['Poppins'] font-medium text-primary-800 placeholder:text-primary-400 transition-all duration-200 hover:border-primary-300"
                    placeholder="Destination"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-base">
                    📍
                  </div>
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {locationSuggestions.map((location) => (
                        <div
                          key={location._id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchForm(prev => ({ ...prev, location: `${location.name}, ${location.country}` }));
                            setShowLocationSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-primary-500">{location.country}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Check In */}
              <div className="min-w-[140px] sm:min-w-[180px]">
                <label className="block text-xs font-bold text-primary-700 mb-2 font-['DM_Sans'] uppercase tracking-wider">Check in</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchForm.checkIn}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-sm font-['Poppins'] font-medium text-primary-800 transition-all duration-200 hover:border-primary-300"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-base z-10 pointer-events-none">
                    📅
                  </div>
                </div>
              </div>

              {/* Check Out */}
              <div className="min-w-[140px] sm:min-w-[180px]">
                <label className="block text-xs font-bold text-primary-700 mb-2 font-['DM_Sans'] uppercase tracking-wider">Check out</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchForm.checkOut}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent text-sm font-['Poppins'] font-medium text-primary-800 transition-all duration-200 hover:border-primary-300"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-base z-10 pointer-events-none">
                    📅
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div className="min-w-[160px] sm:min-w-[200px]">
                <label className="block text-xs font-bold text-primary-700 mb-2 font-['DM_Sans'] uppercase tracking-wider">Travelers</label>
                <div className="relative">
                  <select
                    value={`${searchForm.guests} Adults, ${searchForm.rooms} Room${searchForm.rooms > 1 ? 's' : ''}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.includes('1 Adult')) {
                        setSearchForm(prev => ({ ...prev, guests: 1, rooms: 1 }));
                      } else if (value.includes('2 Adults, 1 Room')) {
                        setSearchForm(prev => ({ ...prev, guests: 2, rooms: 1 }));
                      } else if (value.includes('2 Adults, 2 Children')) {
                        setSearchForm(prev => ({ ...prev, guests: 4, rooms: 1 }));
                      } else if (value.includes('4 Adults, 2 Rooms')) {
                        setSearchForm(prev => ({ ...prev, guests: 4, rooms: 2 }));
                      }
                    }}
                    className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-blue-ocean focus:border-transparent appearance-none text-sm font-['Poppins'] font-medium text-primary-800 transition-all duration-200 hover:border-primary-300"
                  >
                    <option>1 Adult, 1 Room</option>
                    <option>2 Adults, 1 Room</option>
                    <option>2 Adults, 2 Children</option>
                    <option>4 Adults, 2 Rooms</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400 text-base">
                    👥
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex justify-end col-span-1">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-ocean text-white py-3 px-6 rounded-xl font-bold font-['DM_Sans'] text-sm hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🔍</span>
                      <span>Search Hotels</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="font-medium text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Results Section */}
      {searched && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-primary-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-primary-900 mb-3 font-['DM_Sans'] tracking-tight leading-[0.9]">
                  Hotels in {searchForm.location}
                </h2>
                <p className="text-base sm:text-lg text-primary-600 font-['Poppins'] font-medium mb-2 leading-relaxed">
                  {new Date(searchForm.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(searchForm.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {searchForm.guests} Adults, {searchForm.rooms} Room{searchForm.rooms > 1 ? 's' : ''}
                </p>
                <div className="text-sm sm:text-base text-emerald font-bold font-['DM_Sans'] mt-2">
                  Found {displayHotels.length} hotels
                </div>
              </div>
              <button
                onClick={() => setSearched(false)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-blue-ocean border-2 border-blue-ocean rounded-xl font-bold font-['DM_Sans'] text-sm hover:bg-blue-ocean hover:text-white transition-all duration-300 min-h-[44px]"
              >
                <span className="text-base">✏️</span>
                <span>Modify Search</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-100">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setSortBy('recommended')}
                  className={`px-5 py-3 rounded-xl text-sm font-bold font-['DM_Sans'] transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                    sortBy === 'recommended'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'bg-white text-primary-600 hover:bg-blue-ocean hover:text-white border border-primary-200 hover:border-blue-ocean'
                  }`}
                >
                  <span>⭐</span>
                  <span>Best Match</span>
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-5 py-3 rounded-xl text-sm font-bold font-['DM_Sans'] transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                    sortBy === 'price'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'bg-white text-primary-600 hover:bg-blue-ocean hover:text-white border border-primary-200 hover:border-blue-ocean'
                  }`}
                >
                  <span>💰</span>
                  <span>Price</span>
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-5 py-3 rounded-xl text-sm font-bold font-['DM_Sans'] transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                    sortBy === 'rating'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'bg-white text-primary-600 hover:bg-blue-ocean hover:text-white border border-primary-200 hover:border-blue-ocean'
                  }`}
                >
                  <span>🏆</span>
                  <span>Rating</span>
                </button>
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-5 py-3 rounded-xl text-sm font-bold font-['DM_Sans'] transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                    sortBy === 'distance'
                      ? 'bg-blue-ocean text-white shadow-md'
                      : 'bg-white text-primary-600 hover:bg-blue-ocean hover:text-white border border-primary-200 hover:border-blue-ocean'
                  }`}
                >
                  <span>📍</span>
                  <span>Distance</span>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setViewType('list')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewType === 'list'
                      ? 'bg-blue-ocean text-white border-blue-ocean shadow-md'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-blue-ocean hover:text-white hover:border-blue-ocean'
                  }`}
                  title="List View"
                >
                  📋
                </button>
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-lg min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    viewType === 'grid'
                      ? 'bg-blue-ocean text-white border-blue-ocean shadow-md'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-blue-ocean hover:text-white hover:border-blue-ocean'
                  }`}
                  title="Grid View"
                >
                  ⊞
                </button>
                <button className="bg-emerald text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold font-['DM_Sans'] flex items-center gap-1 sm:gap-2 hover:bg-blue-ocean transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg min-h-[44px]">
                  <span className="text-base">🗺️</span>
                  <span>Map</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="w-full lg:w-1/4 order-2 lg:order-1">
                <Card className="lg:sticky lg:top-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary-900 mb-4 sm:mb-6 font-['DM_Sans'] leading-tight">Filter Results</h3>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-primary-700 mb-3 font-['DM_Sans']">
                      Price per night: <span className="text-emerald">{formatPrice(filters.maxPrice)}</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="25"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                      className="w-full accent-blue-ocean"
                    />
                    <div className="flex justify-between text-xs text-primary-400 mt-1">
                      <span>$50</span>
                      <span>$500+</span>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-primary-700 mb-3 font-['DM_Sans']">Star Rating</label>
                    <div className="space-y-2">
                      {[5, 4, 3].map(stars => (
                        <label key={stars} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.starRating.includes(stars)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, starRating: [...prev.starRating, stars] }));
                                } else {
                                  setFilters(prev => ({ ...prev, starRating: prev.starRating.filter(s => s !== stars) }));
                                }
                              }}
                              className="mr-2 accent-blue-ocean"
                            />
                            <span className="text-sm font-['Poppins'] font-medium">
                              {'⭐'.repeat(stars)} {stars === 5 ? 'Luxury' : stars === 4 ? 'Upscale' : 'Mid-range'}
                            </span>
                          </div>
                          <span className="text-xs text-primary-500 font-['Poppins'] font-medium bg-primary-100 px-2 py-1 rounded">({stars === 5 ? '47' : stars === 4 ? '89' : '156'})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-primary-700 mb-3 font-['DM_Sans']">Amenities</label>
                    <div className="space-y-2">
                      {['WiFi', 'Breakfast', 'Pool', 'Parking'].map(amenity => (
                        <label key={amenity} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                              } else {
                                setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
                              }
                            }}
                            className="mr-2 accent-blue-ocean"
                          />
                          <span className="text-sm font-['Poppins'] font-medium">
                            {amenity === 'WiFi' ? '🌐' : amenity === 'Breakfast' ? '🍳' : amenity === 'Pool' ? '🏊' : '🚗'} {amenity}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSearch}
                    className="w-full bg-blue-ocean text-white py-3 px-4 rounded-xl font-bold font-['DM_Sans'] text-sm hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 min-h-[48px]"
                  >
                    Apply Filters
                  </button>
                </Card>
              </div>

              {/* Hotel Results */}
              <div className="flex-1 order-1 lg:order-2">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-ocean border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg text-primary-600 font-['Poppins'] font-medium">Finding perfect hotels...</p>
                    </div>
                  </div>
                ) : displayHotels.length === 0 ? (
                  <div className="bg-white rounded-2xl text-center py-16 px-8 border border-gray-200">
                    <div className="text-8xl mb-6">🏨</div>
                    <h3 className="text-3xl font-bold text-primary-900 mb-4 font-['DM_Sans']">No hotels found</h3>
                    <p className="text-lg text-primary-600 mb-8 font-['Poppins'] font-medium max-w-md mx-auto">Try adjusting your search criteria or create sample data</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => setSearched(false)}
                        className="bg-blue-ocean text-white px-6 py-3 rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Clear Search
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await fetch(`${API_CONFIG.BASE_URL}/hotels/create-samples`, { method: 'POST' });
                            handleSearch();
                          } catch (error) {
                            setError('Failed to create sample hotels. Please try again.');
                          }
                        }}
                        className="bg-white text-blue-ocean px-6 py-3 rounded-xl font-bold font-['DM_Sans'] border-2 border-blue-ocean hover:bg-blue-ocean hover:text-white transition-all duration-300"
                      >
                        Create Sample Hotels
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {displayHotels.map((hotel: HotelData, index: number) => (
                      <div
                        key={hotel._id}
                        className={`bg-white rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-gray-100 hover:border-blue-ocean ${
                          viewType === 'list' ? 'flex flex-row' : 'flex flex-col'
                        }`}
                        onClick={() => handleHotelSelect(hotel)}
                      >
                        {/* Hotel Image */}
                        <div className={`relative overflow-hidden ${
                          viewType === 'list' ? 'w-48 sm:w-64 h-36 sm:h-48 flex-shrink-0' : 'w-full h-48 sm:h-56'
                        }`}>
                          <img
                            src={hotel.images && hotel.images.length > 0 && hotel.images[0]?.url
                              ? (hotel.images[0].url.startsWith('http') 
                                  ? hotel.images[0].url 
                                  : `${API_CONFIG.BASE_URL.replace('/api', '')}${hotel.images[0].url}`)
                              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                            alt={hotel.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                            }}
                          />
                          {(hotel.featured || hotel.popular || hotel.luxury) && (
                            <div className="absolute top-4 left-4 bg-blue-ocean text-white px-3 py-1.5 rounded-xl text-xs font-bold font-['DM_Sans'] shadow-md">
                              {hotel.featured ? 'Featured' : hotel.popular ? 'Popular' : 'Luxury'}
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-emerald text-white px-3 py-1.5 rounded-xl text-xs font-bold font-['DM_Sans'] shadow-md">
                            From {hotel.pricing?.currencySymbol || '$'}{Math.round(hotel.pricing?.averageNightlyRate || hotel.pricing?.priceRange?.min || 0).toLocaleString()}/night
                          </div>
                        </div>

                        {/* Hotel Content */}
                        <div className={`p-4 sm:p-5 flex flex-col justify-between ${
                          viewType === 'list' ? 'flex-1' : 'flex-1'
                        }`}>
                          <div>
                            <div className="mb-3">
                              <h3 className="text-lg sm:text-xl font-bold text-primary-900 mb-1 font-['DM_Sans'] line-clamp-1 leading-tight">
                                {hotel.name}
                              </h3>
                              {hotel.chain && (
                                <span className="text-xs text-primary-500 bg-primary-100 px-2 py-1 rounded font-['Poppins'] font-medium">
                                  {hotel.chain}
                                </span>
                              )}
                            </div>
                            
                            {/* Category & Rating */}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3">
                              <span className="text-amber-premium text-base">
                                {renderStars(hotel.starRating)}
                              </span>
                              {hotel.rating?.overall > 0 && (
                                <span className="bg-blue-ocean text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold font-['DM_Sans']">
                                  {hotel.rating.overall}
                                </span>
                              )}
                              {(hotel.rating?.reviewCount > 0 || hotel.rating?.totalReviews > 0) && (
                                <span className="text-xs text-primary-500 font-['Poppins'] hidden sm:inline">
                                  ({(hotel.rating?.reviewCount || hotel.rating?.totalReviews).toLocaleString()} reviews)
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-sm text-primary-600 mb-3">
                              <span className="text-base">📍</span>
                              <span className="font-['Poppins'] font-medium">{hotel.location?.address?.area || 'City Center'}</span>
                            </div>

                            {/* Amenities */}
                            {(hotel.amenities?.general?.length > 0 || hotel.amenities?.business?.length > 0 || hotel.amenities?.recreation?.length > 0) && (
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                {hotel.amenities?.general?.slice(0, 3).map((a: any, idx: number) => {
                                  const amenityName = typeof a === 'string' ? a : (typeof a === 'object' && a.name) ? a.name : String(a);
                                  return (
                                    <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-['Poppins'] font-medium">
                                      {amenityName}
                                    </span>
                                  );
                                })}
                                {hotel.amenities?.business?.slice(0, 2).map((a: any, idx: number) => {
                                  const amenityName = typeof a === 'string' ? a : (typeof a === 'object' && a.name) ? a.name : String(a);
                                  return (
                                    <span key={`business-${idx}`} className="text-xs bg-emerald-50 text-emerald-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-['Poppins'] font-medium">
                                      {amenityName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Price and Book Button */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0 pt-2 border-t border-gray-100">
                            <div>
                              {hotel.pricing?.priceRange?.max > hotel.pricing?.priceRange?.min && (
                                <div className="text-sm text-primary-400 line-through font-['Poppins']">
                                  {formatPrice(hotel.pricing.priceRange.max)}
                                </div>
                              )}
                              <div className="text-xl sm:text-2xl font-bold text-emerald font-['DM_Sans'] leading-none">
                                {formatPrice(hotel.pricing?.averageNightlyRate || hotel.pricing?.priceRange?.min || 150)}
                              </div>
                              <div className="text-xs text-primary-500 font-['Poppins'] mt-1">per night</div>
                            </div>
                            <button
                              className="bg-blue-ocean text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold font-['DM_Sans'] text-xs sm:text-sm hover:bg-emerald transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 min-h-[44px] min-w-[80px] w-full sm:w-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${hotel._id}/booking`);
                              }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary-900 mb-4 font-['DM_Sans'] tracking-tight">
                Popular destinations worldwide
              </h2>
              <p className="text-xl md:text-2xl text-primary-600 font-['Poppins'] font-medium max-w-3xl mx-auto">
                Discover amazing places with great hotel deals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {popularDestinations.map((destination, index) => (
                <Card
                  key={index}
                  hover
                  className="cursor-pointer overflow-hidden p-0"
                  onClick={() => selectDestination(destination._id || destination.name || 'Unknown')}
                >
                  <div className="relative">
                    <img
                      src={destination.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                      alt={destination._id || destination.name || 'Destination'}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-emerald text-white px-3 py-1.5 rounded-xl text-xs font-bold font-['DM_Sans'] shadow-md">
                      From ${Math.round(destination.minPrice || destination.avgPrice || 0) || 'N/A'}/night
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-primary-900 mb-2 font-['DM_Sans']">
                      {destination._id || 'Amazing Destination'}
                    </h3>
                    <p className="text-sm text-primary-600 mb-4 font-['Poppins'] font-medium">
                      Discover amazing hotels and experiences
                    </p>
                    <div className="flex justify-between text-sm text-primary-500 font-['Poppins'] font-medium">
                      <span className="flex items-center gap-1">
                        <span className="text-base">🏨</span>
                        <span>{destination.count || 0} hotels</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base">⭐</span>
                        <span>{destination.avgRating || (4.0 + Math.random() * 1).toFixed(1)} avg rating</span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hotel Deals Section */}
      {!searched && (
        <section className="py-20 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary-900 mb-4 font-['DM_Sans'] tracking-tight">
                🔥 Hot Hotel Deals
              </h2>
              <p className="text-xl md:text-2xl text-primary-600 font-['Poppins'] font-medium max-w-3xl mx-auto">
                Limited time offers on amazing hotels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotelDeals.map((deal, index) => (
                <Card
                  key={index}
                  hover
                  className="cursor-pointer overflow-hidden p-0"
                  onClick={() => handleHotelSelect(deal)}
                >
                  <div className="relative">
                    <img
                      src={deal.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                      alt={deal.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                      }}
                    />
                    {deal.deal && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-2xl text-xs font-bold">
                        {deal.deal.discount}% OFF
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-emerald text-white px-3 py-1 rounded-2xl text-xs font-bold">
                      {renderStars(deal.starRating)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-primary-900 mb-1">
                      {deal.name}
                    </h3>
                    <p className="text-sm text-primary-600 mb-3">
                      📍 {deal.location?.address?.area || deal.location?.cityName}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        {deal.deal && (
                          <div className="text-sm text-primary-400 line-through">
                            ${deal.deal.originalPrice}
                          </div>
                        )}
                        <div className="text-xl font-bold text-emerald">
                          {deal.pricing?.currencySymbol || '$'}{(deal.deal?.dealPrice || deal.pricing?.averageNightlyRate || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-primary-400">per night</div>
                      </div>
                      <Button size="sm">Book Deal</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      {!searched && (
        <section className="py-20 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary-900 mb-4 font-['DM_Sans'] tracking-tight">
                Why book hotels with TravelAI?
              </h2>
              <p className="text-xl md:text-2xl text-primary-600 font-['Poppins'] font-medium max-w-3xl mx-auto">
                We make hotel booking simple, transparent, and rewarding
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: '💰', title: 'Best Price Guarantee', description: 'Find a lower price? We\'ll match it and give you 110% of the difference back' },
                { icon: '🤖', title: 'AI-Powered Matching', description: 'Our smart algorithms find hotels that perfectly match your preferences and budget' },
                { icon: '🛡️', title: 'Flexible Cancellation', description: 'Free cancellation on most bookings and easy modifications for peace of mind' },
                { icon: '🎯', title: 'Complete Trip Planning', description: 'Book hotels with flights and activities for seamless travel experiences' }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl text-center p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-blue-ocean">
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-primary-900 mb-4 font-['DM_Sans']">{feature.title}</h3>
                  <p className="text-base text-primary-600 leading-relaxed font-['Poppins'] font-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HotelsPage;
