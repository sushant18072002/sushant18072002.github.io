import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hotelService } from '@/services/hotel.service';
import { Hotel } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
    guests: parseInt(searchParams.get('guests') || '2'),
    rooms: parseInt(searchParams.get('rooms') || '1')
  });
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({
    maxPrice: 500,
    starRating: [] as number[],
    amenities: [] as string[]
  });
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [hotelDeals, setHotelDeals] = useState([]);

  useEffect(() => {
    loadInitialData();
    if (searchParams.get('autoSearch') === 'true') {
      handleSearch();
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [destinationsRes, dealsRes] = await Promise.all([
        hotelService.getPopularDestinations(),
        hotelService.getHotelDeals()
      ]);
      setPopularDestinations(destinationsRes.data.destinations || []);
      setHotelDeals(dealsRes.data.deals || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchForm.location || !searchForm.checkIn || !searchForm.checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const searchParams = {
        location: searchForm.location,
        checkIn: searchForm.checkIn,
        checkOut: searchForm.checkOut,
        guests: searchForm.guests,
        rooms: searchForm.rooms,
        maxPrice: filters.maxPrice,
        starRating: filters.starRating,
        amenities: filters.amenities
      };

      const response = await hotelService.searchHotels(searchParams);
      setHotels(response.data.hotels || []);
      setSearched(true);
    } catch (error) {
      console.error('Error searching hotels:', error);
      alert('Error searching hotels. Please try again.');
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

  const sampleHotels = [
    {
      _id: '1',
      name: 'Hotel Le Grand Paris',
      images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop'],
      rating: { overall: 4.8, totalReviews: 1247 },
      location: { address: { city: 'Paris', area: 'Champs-Élysées' } },
      amenities: { general: ['WiFi', 'Pool', 'Spa'] },
      pricing: { priceRange: { min: 245, max: 334 } },
      starRating: 5,
      featured: true
    },
    {
      _id: '2',
      name: 'Paris Central Hotel',
      images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop'],
      rating: { overall: 4.6, totalReviews: 892 },
      location: { address: { city: 'Paris', area: 'Marais District' } },
      amenities: { general: ['WiFi', 'Restaurant', 'Bar'] },
      pricing: { priceRange: { min: 180, max: 220 } },
      starRating: 4
    },
    {
      _id: '3',
      name: 'Boutique Seine Hotel',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop'],
      rating: { overall: 4.9, totalReviews: 654 },
      location: { address: { city: 'Paris', area: 'Saint-Germain' } },
      amenities: { general: ['WiFi', 'Breakfast', 'Gym'] },
      pricing: { priceRange: { min: 220, max: 280 } },
      starRating: 4,
      popular: true
    },
    {
      _id: '4',
      name: 'Hotel Montmartre',
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop'],
      rating: { overall: 4.7, totalReviews: 456 },
      location: { address: { city: 'Paris', area: 'Montmartre' } },
      amenities: { general: ['WiFi', 'Terrace', 'Bar'] },
      pricing: { priceRange: { min: 210, max: 280 } },
      starRating: 4
    },
    {
      _id: '5',
      name: 'Luxury Palace Hotel',
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop'],
      rating: { overall: 4.9, totalReviews: 2156 },
      location: { address: { city: 'Paris', area: 'Opera District' } },
      amenities: { general: ['WiFi', 'Spa', 'Concierge'] },
      pricing: { priceRange: { min: 420, max: 600 } },
      starRating: 5,
      luxury: true
    },
    {
      _id: '6',
      name: 'Budget Friendly Inn',
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop'],
      rating: { overall: 4.2, totalReviews: 789 },
      location: { address: { city: 'Paris', area: 'Latin Quarter' } },
      amenities: { general: ['WiFi', 'Breakfast'] },
      pricing: { priceRange: { min: 95, max: 120 } },
      starRating: 3
    }
  ];

  const displayHotels = hotels.length > 0 ? hotels : (searched ? [] : sampleHotels);

  return (
    <div className="min-h-screen bg-white">
      {/* Hotel Header */}
      <section className="bg-white py-10 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-900 mb-4">Find your perfect stay</h1>
            <p className="text-lg text-primary-600">From luxury resorts to cozy boutique hotels</p>
          </div>

          {/* Compact Search Form */}
          <Card className="max-w-4xl mx-auto" padding="lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-primary-700 mb-2">Where are you going?</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchForm.location}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    placeholder="Destination"
                  />
                  <div className="absolute left-3 top-3 text-primary-400">
                    📍
                  </div>
                </div>
              </div>

              {/* Check In */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Check in</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchForm.checkIn}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                  <div className="absolute left-3 top-3 text-primary-400">
                    📅
                  </div>
                </div>
              </div>

              {/* Check Out */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Check out</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchForm.checkOut}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  />
                  <div className="absolute left-3 top-3 text-primary-400">
                    📅
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Travelers</label>
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
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent appearance-none"
                  >
                    <option>1 Adult, 1 Room</option>
                    <option>2 Adults, 1 Room</option>
                    <option>2 Adults, 2 Children</option>
                    <option>4 Adults, 2 Rooms</option>
                  </select>
                  <div className="absolute left-3 top-3 text-primary-400">
                    👥
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  size="lg"
                  className="h-12 w-12 flex items-center justify-center"
                >
                  {loading ? <LoadingSpinner size="sm" /> : '🔍'}
                </Button>
              </div>
            </div>
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
                <h2 className="text-2xl font-bold text-primary-900 mb-2">
                  Hotels in {searchForm.location}
                </h2>
                <p className="text-primary-600">
                  {new Date(searchForm.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(searchForm.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {searchForm.guests} Adults, {searchForm.rooms} Room{searchForm.rooms > 1 ? 's' : ''}
                </p>
                <div className="text-sm text-emerald font-semibold mt-1">
                  Found {displayHotels.length} hotels
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearched(false)}
                className="flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Modify Search</span>
              </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex justify-between items-center mb-8 p-5 bg-primary-50 rounded-2xl">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recommended')}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    sortBy === 'recommended'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-transparent text-primary-400 hover:bg-blue-ocean hover:text-white'
                  }`}
                >
                  <span>⭐</span>
                  <span>Best Match</span>
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    sortBy === 'price'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-transparent text-primary-400 hover:bg-blue-ocean hover:text-white'
                  }`}
                >
                  <span>💰</span>
                  <span>Price</span>
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    sortBy === 'rating'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-transparent text-primary-400 hover:bg-blue-ocean hover:text-white'
                  }`}
                >
                  <span>🏆</span>
                  <span>Rating</span>
                </button>
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    sortBy === 'distance'
                      ? 'bg-blue-ocean text-white'
                      : 'bg-transparent text-primary-400 hover:bg-blue-ocean hover:text-white'
                  }`}
                >
                  <span>📍</span>
                  <span>Distance</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    viewType === 'list'
                      ? 'bg-blue-ocean text-white border-blue-ocean'
                      : 'bg-white text-primary-400 border-primary-200 hover:bg-blue-ocean hover:text-white hover:border-blue-ocean'
                  }`}
                >
                  📋
                </button>
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    viewType === 'grid'
                      ? 'bg-blue-ocean text-white border-blue-ocean'
                      : 'bg-white text-primary-400 border-primary-200 hover:bg-blue-ocean hover:text-white hover:border-blue-ocean'
                  }`}
                >
                  ⊞
                </button>
                <button className="bg-emerald text-white px-4 py-2 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-ocean transition-all">
                  <span>🗺️</span>
                  <span>Map</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4 order-2 lg:order-1">
                <Card className="sticky top-4">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Filter Results</h3>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Price per night: {formatPrice(filters.maxPrice)}
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
                    <label className="block text-sm font-medium text-primary-700 mb-2">Star Rating</label>
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
                            <span className="text-sm">
                              {'⭐'.repeat(stars)} {stars === 5 ? 'Luxury' : stars === 4 ? 'Upscale' : 'Mid-range'}
                            </span>
                          </div>
                          <span className="text-xs text-primary-400">({stars === 5 ? '47' : stars === 4 ? '89' : '156'})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-primary-700 mb-2">Amenities</label>
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
                          <span className="text-sm">
                            {amenity === 'WiFi' ? '🌐' : amenity === 'Breakfast' ? '🍳' : amenity === 'Pool' ? '🏊' : '🚗'} {amenity}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Apply Filters
                  </Button>
                </Card>
              </div>

              {/* Hotel Results */}
              <div className="flex-1 order-1 lg:order-2">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : displayHotels.length === 0 ? (
                  <Card className="text-center py-12">
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-semibold text-primary-900 mb-2">No hotels found</h3>
                    <p className="text-primary-600">Try adjusting your search criteria or dates</p>
                  </Card>
                ) : (
                  <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {displayHotels.map((hotel: any) => (
                      <Card
                        key={hotel._id}
                        hover
                        className={`cursor-pointer overflow-hidden p-0 ${
                          viewType === 'list' ? 'flex flex-row' : 'flex flex-col h-96'
                        }`}
                        onClick={() => handleHotelSelect(hotel)}
                      >
                        {/* Hotel Image */}
                        <div className={`relative overflow-hidden ${
                          viewType === 'list' ? 'w-48 h-36 flex-shrink-0' : 'w-full h-48'
                        }`}>
                          <img
                            src={hotel.images?.[0] || '/api/placeholder/300/200'}
                            alt={hotel.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {hotel.featured && (
                            <div className="absolute top-3 left-3 bg-blue-ocean text-white px-2 py-1 rounded-xl text-xs font-bold">
                              Featured
                            </div>
                          )}
                          {hotel.popular && (
                            <div className="absolute top-3 left-3 bg-amber-premium text-white px-2 py-1 rounded-xl text-xs font-bold">
                              Popular
                            </div>
                          )}
                          {hotel.luxury && (
                            <div className="absolute top-3 left-3 bg-emerald text-white px-2 py-1 rounded-xl text-xs font-bold">
                              Luxury
                            </div>
                          )}
                        </div>

                        {/* Hotel Content */}
                        <div className={`p-4 flex flex-col justify-between ${
                          viewType === 'list' ? 'flex-1' : 'flex-1'
                        }`}>
                          <div>
                            <h3 className="text-lg font-bold text-primary-900 mb-2 line-clamp-1">
                              {hotel.name}
                            </h3>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-amber-premium text-sm">
                                {renderStars(hotel.starRating)}
                              </span>
                              <span className="bg-blue-ocean text-white px-2 py-0.5 rounded-xl text-xs font-bold">
                                {hotel.rating?.overall || 4.5}
                              </span>
                              <span className="text-xs text-primary-400">
                                ({hotel.rating?.totalReviews || 0})
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-sm text-primary-600 mb-2">
                              <span>📍</span>
                              <span>{hotel.location?.address?.area || 'City Center'}</span>
                            </div>

                            {/* Amenities */}
                            <div className="text-xs text-primary-400 mb-3">
                              {hotel.amenities?.general?.slice(0, 3).join(' • ') || 'WiFi • Restaurant • Pool'}
                            </div>
                          </div>

                          {/* Price and Book Button */}
                          <div className="flex justify-between items-end">
                            <div>
                              {hotel.pricing?.priceRange?.max > hotel.pricing?.priceRange?.min && (
                                <div className="text-sm text-primary-400 line-through">
                                  {formatPrice(hotel.pricing.priceRange.max)}
                                </div>
                              )}
                              <div className="text-xl font-bold text-blue-ocean">
                                {formatPrice(hotel.pricing?.priceRange?.min || 150)}
                              </div>
                              <div className="text-xs text-primary-400">per night</div>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/hotels/${hotel._id}/booking`);
                              }}
                            >
                              Book
                            </Button>
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
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary-900 mb-4">
                Popular destinations worldwide
              </h2>
              <p className="text-lg text-primary-600">
                Discover amazing places with great hotel deals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=250&fit=crop', price: 89, hotels: 2847, rating: 4.2 },
                { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop', price: 75, hotels: 3156, rating: 4.4 },
                { name: 'London, UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop', price: 95, hotels: 4231, rating: 4.1 },
                { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=250&fit=crop', price: 45, hotels: 1923, rating: 4.5 }
              ].map((destination, index) => (
                <Card
                  key={index}
                  hover
                  className="cursor-pointer overflow-hidden p-0"
                  onClick={() => selectDestination(destination.name)}
                >
                  <div className="relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-emerald text-white px-3 py-1 rounded-2xl text-xs font-bold">
                      From ${destination.price}/night
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-primary-900 mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-primary-600 mb-3">
                      {destination.name.includes('Paris') ? 'City of Light & Romance' :
                       destination.name.includes('Tokyo') ? 'Modern Metropolis & Tradition' :
                       destination.name.includes('London') ? 'Royal Heritage & Culture' :
                       'Tropical Paradise & Temples'}
                    </p>
                    <div className="flex justify-between text-xs text-primary-400">
                      <span>🏨 {destination.hotels.toLocaleString()} hotels</span>
                      <span>⭐ {destination.rating} avg rating</span>
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
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary-900 mb-4">
                Why book hotels with TravelAI?
              </h2>
              <p className="text-lg text-primary-600">
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
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
                  <p className="text-sm text-primary-600 leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HotelsPage;