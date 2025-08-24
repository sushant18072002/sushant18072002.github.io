import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchService, SearchResult } from '@/services/search.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    priceRange: 'all',
    rating: 0
  });

  const query = searchParams.get('q') || '';

  const sampleResults: SearchResult[] = [
    {
      id: 'flight-1',
      type: 'flight',
      title: 'NYC → Paris',
      description: 'Delta Airlines • Nonstop • 7h 15m',
      price: 599,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop'
    },
    {
      id: 'hotel-1',
      type: 'hotel',
      title: 'Paris Luxury Hotel',
      description: 'Downtown Paris • 5-star • Spa included',
      price: 299,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop',
      location: 'Paris, France'
    },
    {
      id: 'package-1',
      type: 'package',
      title: 'Paris Romance Package',
      description: 'Flight + Hotel + Tours • 7 days',
      price: 2499,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
      location: 'Paris, France',
      duration: 7
    }
  ];

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.globalSearch(query, {
        type: filters.type === 'all' ? undefined : filters.type
      });
      setResults(response.data.results || sampleResults);
    } catch (error) {
      setResults(sampleResults);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'package': return '📦';
      case 'itinerary': return '🗺️';
      default: return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-100 text-blue-700';
      case 'hotel': return 'bg-emerald/20 text-emerald';
      case 'package': return 'bg-purple-100 text-purple-700';
      case 'itinerary': return 'bg-amber-100 text-amber-700';
      default: return 'bg-primary-100 text-primary-700';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'flight':
        navigate(`/flights/${result.id}`);
        break;
      case 'hotel':
        navigate(`/hotels/${result.id}`);
        break;
      case 'package':
        navigate(`/packages/${result.id}`);
        break;
      case 'itinerary':
        navigate(`/itineraries/${result.id}`);
        break;
    }
  };

  const filteredResults = results.filter(result => {
    if (filters.type !== 'all' && result.type !== filters.type) return false;
    if (filters.rating > 0 && (!result.rating || result.rating < filters.rating)) return false;
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (result.price < min || (max && result.price > max)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-primary-600">
            {filteredResults.length} results found
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-3">Type</label>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'All Results' },
                      { id: 'flight', label: 'Flights' },
                      { id: 'hotel', label: 'Hotels' },
                      { id: 'package', label: 'Packages' },
                      { id: 'itinerary', label: 'Itineraries' }
                    ].map(type => (
                      <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type.id}
                          checked={filters.type === type.id}
                          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="accent-blue-ocean"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-3">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  >
                    <option value="all">All Prices</option>
                    <option value="0-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-999999">$2,500+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-3">Minimum Rating</label>
                  <div className="space-y-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.rating === rating}
                          onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                          className="accent-blue-ocean"
                        />
                        <span className="text-sm">
                          {rating === 0 ? 'Any Rating' : `${rating}+ stars`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setFilters({ type: 'all', priceRange: 'all', rating: 0 })}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-900">
                {filteredResults.length} results
              </h2>
              <select className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map(result => (
                  <Card
                    key={result.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getTypeIcon(result.type)}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(result.type)}`}>
                                {result.type.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-primary-900 mb-1">{result.title}</h3>
                            <p className="text-primary-600 mb-2">{result.description}</p>
                            {result.location && (
                              <p className="text-sm text-primary-500">📍 {result.location}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald">${result.price}</div>
                            {result.duration && (
                              <div className="text-xs text-primary-500">{result.duration} days</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {result.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-amber-premium">⭐</span>
                              <span className="font-semibold">{result.rating}</span>
                            </div>
                          )}
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredResults.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">No results found</h3>
                <p className="text-primary-600 mb-6">Try adjusting your search or filters</p>
                <Button onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;