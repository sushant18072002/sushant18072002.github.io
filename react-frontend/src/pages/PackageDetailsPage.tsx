import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageService, TravelPackage } from '@/services/package.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PackageDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [travelers, setTravelers] = useState(2);
  const [showGallery, setShowGallery] = useState(false);

  const samplePackage: TravelPackage = {
    id: 'bali-luxury',
    title: 'Bali Luxury Escape',
    description: 'Ultimate luxury experience in tropical paradise with private villas, world-class spas, and exclusive experiences.',
    destination: 'Bali, Indonesia',
    duration: 7,
    price: 2499,
    originalPrice: 2999,
    rating: 4.9,
    reviews: 234,
    images: [
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    ],
    highlights: ['5-star resorts', 'Private villa', 'Spa treatments', 'Helicopter tour', 'Private chef', 'Yacht excursion'],
    inclusions: [
      '🏨 Luxury 5-star accommodation (6 nights)',
      '🍽️ All meals with private chef',
      '✈️ Private airport transfers',
      '🧘 Daily spa treatments',
      '🚁 Helicopter island tour',
      '⛵ Private yacht excursion',
      '👨‍🏫 Personal concierge service',
      '🛡️ Comprehensive travel insurance'
    ],
    category: 'luxury',
    difficulty: 'Easy',
    bestTime: 'Apr - Oct'
  };

  useEffect(() => {
    if (id) {
      loadPackageDetails();
    }
  }, [id]);

  const loadPackageDetails = async () => {
    try {
      const response = await packageService.getPackageDetails(id!);
      if (response.success && response.data) {
        setPkg(response.data.package);
      } else {
        setPkg(null);
      }
    } catch (error) {
      console.error('Failed to load package details:', error);
      setPkg(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = pkg?.price || 2499;
    const subtotal = basePrice * travelers;
    const discount = pkg?.originalPrice ? (pkg.originalPrice - pkg.price) * travelers : 0;
    const serviceFee = Math.round(subtotal * 0.05);
    return { subtotal, discount, serviceFee, total: subtotal + serviceFee };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Package not found</h2>
          <Button onClick={() => navigate('/packages')}>Back to Packages</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <section className="bg-primary-50 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/packages')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Packages</span>
          </button>
        </div>
      </section>

      {/* Hero */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-4">{pkg.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-amber-premium">⭐</span>
                  <span className="font-semibold">{pkg.rating}</span>
                  <span className="text-primary-600">({pkg.reviews} reviews)</span>
                </div>
                <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">
                  {pkg.category.toUpperCase()}
                </span>
                <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-bold">
                  📍 {pkg.destination}
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                  {pkg.duration} days
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">📍</button>
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">📤</button>
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">❤️</button>
            </div>
          </div>

          {/* Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden mb-8">
            <div className="relative">
              <img
                src={pkg.images[0]}
                alt="Main view"
                className="w-full h-64 md:h-96 object-cover"
              />
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
              >
                <span>🖼️</span>
                <span>Show all photos</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pkg.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`View ${index + 2}`}
                  className="w-full h-32 md:h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowGallery(true)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Info */}
              <Card>
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Package Overview</h2>
                <p className="text-primary-700 leading-relaxed mb-6">{pkg.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="font-semibold text-primary-900">{pkg.duration} Days</div>
                    <div className="text-sm text-primary-600">Duration</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-primary-900">{pkg.difficulty}</div>
                    <div className="text-sm text-primary-600">Difficulty</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <div className="text-2xl mb-2">🌤️</div>
                    <div className="font-semibold text-primary-900">{pkg.bestTime}</div>
                    <div className="text-sm text-primary-600">Best Time</div>
                  </div>
                </div>
              </Card>

              {/* Highlights */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">Package Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                      <span className="text-emerald text-xl">✓</span>
                      <span className="text-primary-700 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* What's Included */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pkg.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center gap-2 text-primary-700">
                      <span>{inclusion}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Sample Itinerary */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">Sample Itinerary</h3>
                <div className="space-y-4">
                  {[
                    { day: 1, title: 'Arrival & Welcome', desc: 'Private transfer to luxury resort, welcome dinner' },
                    { day: 2, title: 'Spa & Relaxation', desc: 'Full day spa treatments, private beach access' },
                    { day: 3, title: 'Cultural Experience', desc: 'Temple visits, traditional cooking class' },
                    { day: 4, title: 'Adventure Day', desc: 'Helicopter tour, volcano hiking' },
                    { day: 5, title: 'Yacht Excursion', desc: 'Private yacht, snorkeling, sunset dinner' }
                  ].map((day) => (
                    <div key={day.day} className="flex gap-4 p-4 border border-primary-200 rounded-lg">
                      <div className="w-12 h-12 bg-blue-ocean text-white rounded-full flex items-center justify-center font-bold">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary-900">{day.title}</h4>
                        <p className="text-primary-600 text-sm">{day.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {pkg.originalPrice && (
                      <span className="text-lg text-primary-400 line-through">${pkg.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-primary-900">${pkg.price}</span>
                    <span className="text-primary-600">/person</span>
                  </div>
                  {pkg.originalPrice && (
                    <div className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">
                      Save ${pkg.originalPrice - pkg.price} per person
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-amber-premium">⭐</span>
                  <span className="font-semibold">{pkg.rating}</span>
                  <span className="text-sm text-primary-600">({pkg.reviews} reviews)</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Departure Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Travelers</label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} traveler{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span>${pkg.price} x {travelers} travelers</span>
                    <span>${calculateTotal().subtotal}</span>
                  </div>
                  {calculateTotal().discount > 0 && (
                    <div className="flex justify-between text-emerald">
                      <span>Package discount</span>
                      <span>-${calculateTotal().discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${calculateTotal().serviceFee}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().total}</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    // Check if user is logged in
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Please login to book this package');
                      navigate('/auth');
                      return;
                    }
                    navigate(`/booking/package/${id}`);
                  }}
                  className="mb-4"
                >
                  Book Package - ${calculateTotal().total}
                </Button>

                <div className="space-y-2 text-sm text-primary-600">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Free cancellation up to 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Best price guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">All Photos</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="text-white text-2xl hover:text-primary-300"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              {pkg.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`View ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetailsPage;