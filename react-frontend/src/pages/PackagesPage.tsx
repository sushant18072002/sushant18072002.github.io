import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { packageService, TravelPackage } from '@/services/package.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PackageComparison from '@/components/packages/PackageComparison';

const PackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [comparePackages, setComparePackages] = useState<TravelPackage[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    destination: '',
    priceRange: 'all',
    duration: 'all'
  });

  const categories = [
    { id: 'all', name: 'All Packages', icon: '🌍' },
    { id: 'adventure', name: 'Adventure', icon: '🏔️' },
    { id: 'luxury', name: 'Luxury', icon: '💎' },
    { id: 'cultural', name: 'Cultural', icon: '🎭' },
    { id: 'beach', name: 'Beach', icon: '🏖️' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' }
  ];

  // Remove sample data - use real API data only

  useEffect(() => {
    loadPackages();
  }, [filters]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await packageService.getAllPackages();
      console.log('API Response:', response); // Debug log
      
      if (response && response.data) {
        // Handle both direct response and nested response
        const packagesData = response.data.packages || response.data;
        console.log('Packages data:', packagesData); // Debug log
        setPackages(Array.isArray(packagesData) ? packagesData : []);
      } else {
        console.log('No data in response');
        setPackages([]);
      }
    } catch (error) {
      console.error('Failed to load packages:', error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    if (filters.category !== 'all' && pkg.category !== filters.category) return false;
    if (filters.destination && !pkg.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (pkg.price < min || (max && pkg.price > max)) return false;
    }
    if (filters.duration !== 'all') {
      const [minDays, maxDays] = filters.duration.split('-').map(Number);
      if (pkg.duration < minDays || (maxDays && pkg.duration > maxDays)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            Travel Packages
          </h1>
          <p className="text-xl text-primary-600 mb-8">
            Expertly crafted journeys for every type of traveler
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-primary-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setFilters(prev => ({ ...prev, category: category.id }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filters.category === category.id
                        ? 'bg-blue-ocean text-white'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="lg:w-80">
              <h3 className="text-sm font-semibold text-primary-900 mb-3">Destination</h3>
              <input
                type="text"
                placeholder="Search destinations..."
                value={filters.destination}
                onChange={(e) => setFilters(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="0-1000">Under $1,000</option>
                <option value="1000-2500">$1,000 - $2,500</option>
                <option value="2500-5000">$2,500 - $5,000</option>
                <option value="5000-999999">$5,000+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="all">Any Duration</option>
                <option value="1-3">1-3 days</option>
                <option value="4-7">4-7 days</option>
                <option value="8-14">1-2 weeks</option>
                <option value="15-999">2+ weeks</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-primary-900">
                {filteredPackages.length} packages found
              </h2>
              {comparePackages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary-600">
                    {comparePackages.length} selected for comparison
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => setShowComparison(true)}
                    disabled={comparePackages.length < 2}
                  >
                    Compare ({comparePackages.length})
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setComparePackages([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
            <select className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Duration</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map(pkg => (
                <Card
                  key={pkg.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`/packages/${pkg.id}`)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={pkg.images[0]?.startsWith('http') ? pkg.images[0] : `http://localhost:3000${pkg.images[0]}`}
                      alt={pkg.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary-900 text-white px-2 py-1 rounded text-xs font-bold">
                        {pkg.duration} days
                      </span>
                    </div>
                    {pkg.originalPrice && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">
                          Save ${pkg.originalPrice - pkg.price}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                        {categories.find(c => c.id === pkg.category)?.icon} {pkg.category}
                      </span>
                      {pkg.difficulty && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                          {pkg.difficulty}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary-900 mb-2">{pkg.title}</h3>
                    <p className="text-primary-600 mb-2">📍 {pkg.destination}</p>
                    <p className="text-primary-600 text-sm mb-4">{pkg.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {pkg.highlights.slice(0, 2).map((highlight, index) => (
                        <div key={index} className="text-sm text-primary-700">✓ {highlight}</div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {pkg.originalPrice && (
                          <span className="text-sm text-primary-400 line-through">${pkg.originalPrice}</span>
                        )}
                        <div className="text-2xl font-bold text-emerald">${pkg.price}</div>
                        <div className="text-xs text-primary-500">per person</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-premium">⭐</span>
                          <span className="font-semibold">{pkg.rating}</span>
                        </div>
                        <div className="text-xs text-primary-500">({pkg.reviews} reviews)</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (comparePackages.find(p => p.id === pkg.id)) {
                            setComparePackages(comparePackages.filter(p => p.id !== pkg.id));
                          } else if (comparePackages.length < 3) {
                            setComparePackages([...comparePackages, pkg]);
                          }
                        }}
                        className={comparePackages.find(p => p.id === pkg.id) ? 'bg-blue-ocean text-white' : ''}
                      >
                        {comparePackages.find(p => p.id === pkg.id) ? '✓' : '+'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredPackages.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-primary-900 mb-2">No packages found</h3>
              <p className="text-primary-600 mb-6">Try adjusting your filters to see more results</p>
              <Button onClick={() => setFilters({ category: 'all', destination: '', priceRange: 'all', duration: 'all' })}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {showComparison && comparePackages.length >= 2 && (
        <PackageComparison
          packages={comparePackages}
          onClose={() => setShowComparison(false)}
          onSelectPackage={(packageId) => {
            navigate(`/packages/${packageId}`);
            setShowComparison(false);
          }}
        />
      )}
    </div>
  );
};

export default PackagesPage;