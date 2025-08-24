import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '@/services/hotel.service';
import { Hotel } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (id) {
      loadHotelDetails();
      loadHotelReviews();
    }
    setDefaultDates();
  }, [id]);

  const setDefaultDates = () => {
    const today = new Date();
    const checkin = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const checkout = new Date(checkin.getTime() + 3 * 24 * 60 * 60 * 1000);
    setCheckIn(checkin.toISOString().split('T')[0]);
    setCheckOut(checkout.toISOString().split('T')[0]);
  };

  const loadHotelDetails = async () => {
    try {
      const response = await hotelService.getHotelDetails(id!);
      setHotel(response.data.hotel);
    } catch (error) {
      console.error('Error loading hotel details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHotelReviews = async () => {
    try {
      const response = await hotelService.getHotelReviews(id!, { limit: 5 });
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const basePrice = hotel?.pricing.priceRange.min || 109;
    const serviceFee = Math.round(basePrice * nights * 0.15);
    return {
      subtotal: basePrice * nights,
      serviceFee,
      total: basePrice * nights + serviceFee
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Hotel not found</h2>
          <Button onClick={() => navigate('/hotels')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  const sampleHotel = {
    name: 'Spectacular views of Queenstown',
    location: 'Queenstown, New Zealand',
    rating: 4.8,
    reviews: 256,
    host: {
      name: 'Zoe Towne',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      superhost: true,
      since: 'March 2021'
    },
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=832&h=832&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=272&h=272&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=272&h=272&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=272&h=272&fit=crop'
    ],
    features: [
      { icon: '👥', text: '2 guests' },
      { icon: '🛏️', text: '1 bedroom' },
      { icon: '🚿', text: '1 private bath' }
    ],
    amenities: [
      { icon: '📶', text: 'Free wifi 24/7' },
      { icon: '🧻', text: 'Free clean bathroom' },
      { icon: '💻', text: 'Free computer' },
      { icon: '🍔', text: 'Breakfast included' },
      { icon: '🏥', text: 'Medical assistance' },
      { icon: '🏧', text: 'ATM nearby' }
    ],
    description: "Described by Queenstown House & Garden magazine as having 'one of the best views we've ever seen' you will love relaxing in this newly built, architectural house sitting proudly on Queenstown Hill.",
    policies: {
      checkIn: 'After 3:00 PM',
      checkOut: 'Before 11:00 AM',
      cancellation: 'Free cancellation before 48 hours',
      rules: 'No smoking • No pets • No parties'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <section className="bg-primary-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Results</span>
          </button>
        </div>
      </section>

      {/* Hotel Header */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                {sampleHotel.name}
              </h1>
              <p className="text-primary-600">
                {sampleHotel.host.superhost && '⭐ Superhost • '}
                {sampleHotel.location} • ⭐ {sampleHotel.rating} ({sampleHotel.reviews} reviews)
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">📍</button>
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">📤</button>
              <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors">❤️</button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-xl overflow-hidden">
            <div className="relative">
              <img
                src={sampleHotel.images[0]}
                alt="Hotel main view"
                className="w-full h-64 md:h-96 object-cover"
              />
              <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
              >
                <span>🖼️</span>
                <span>Show all photos</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sampleHotel.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hotel view ${index + 2}`}
                  className="w-full h-32 md:h-48 object-cover"
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
              {/* Property Info */}
              <Card>
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Private room in house</h2>
                <div className="flex items-center gap-2 mb-4 text-primary-600">
                  <span>Hosted by</span>
                  <img
                    src={sampleHotel.host.avatar}
                    alt="Host"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{sampleHotel.host.name}</span>
                </div>

                <div className="flex gap-6 mb-6">
                  {sampleHotel.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-primary-600">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-primary-700 leading-relaxed mb-4">
                  {sampleHotel.description}
                </p>
                <p className="text-primary-700 leading-relaxed mb-4">
                  Enjoy breathtaking 180° views of Lake Wakatipu from your well appointed & privately accessed bedroom with modern en suite and floor-to-ceiling windows.
                </p>
                <p className="text-primary-700 leading-relaxed">
                  Your private patio takes in the afternoon sun, letting you soak up unparalleled lake and mountain views by day and the stars & city lights by night.
                </p>
              </Card>

              {/* AI Itineraries */}
              <Card>
                <h3 className="text-xl font-bold text-primary-900 mb-2">🤖 AI-Generated Itineraries</h3>
                <p className="text-primary-600 mb-6">Discover perfect day plans created by our AI for your Queenstown stay</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-primary-900">Adventure Seeker</h4>
                      <span className="text-sm bg-primary-100 px-2 py-1 rounded">3 Days</span>
                    </div>
                    <p className="text-sm text-primary-600 mb-3">Bungee jumping, skydiving, jet boating</p>
                    <Button size="sm" variant="outline" fullWidth>View Itinerary</Button>
                  </div>
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-primary-900">Scenic Explorer</h4>
                      <span className="text-sm bg-primary-100 px-2 py-1 rounded">2 Days</span>
                    </div>
                    <p className="text-sm text-primary-600 mb-3">Milford Sound, gondola rides, wine tours</p>
                    <Button size="sm" variant="outline" fullWidth>View Itinerary</Button>
                  </div>
                </div>
              </Card>

              {/* Amenities */}
              <Card>
                <h3 className="text-xl font-bold text-primary-900 mb-6">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sampleHotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xl">{amenity.icon}</span>
                      <span className="text-primary-700">{amenity.text}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Location */}
              <Card>
                <h3 className="text-xl font-bold text-primary-900 mb-6">Location</h3>
                <div className="bg-primary-50 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="font-semibold text-primary-900 mb-2">Interactive Map</p>
                  <p className="text-sm text-primary-600">Queenstown Hill, New Zealand</p>
                </div>
              </Card>

              {/* Reviews */}
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-primary-900">
                    ⭐ {sampleHotel.rating} · {sampleHotel.reviews} reviews
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { name: 'Sarah Johnson', rating: 5, date: '2 weeks ago', text: 'Absolutely stunning views! The sunrise from the private patio was breathtaking. Zoe was an excellent host and the location is perfect for exploring Queenstown.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face' },
                    { name: 'Mike Chen', rating: 5, date: '1 month ago', text: 'Perfect location for adventure activities. Clean, comfortable, and the view is exactly as advertised. Would definitely stay again!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face' }
                  ].map((review, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-primary-900">{review.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="text-amber-premium">{'★'.repeat(review.rating)}</div>
                            <span className="text-sm text-primary-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-primary-700 text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>

                <Button variant="outline" fullWidth>Show all {sampleHotel.reviews} reviews</Button>
              </Card>

              {/* Host Profile */}
              <Card>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={sampleHotel.host.avatar}
                    alt="Host"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-primary-900">{sampleHotel.host.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">⭐ Superhost</span>
                      <span className="text-sm text-primary-600">{sampleHotel.reviews} reviews</span>
                    </div>
                    <p className="text-sm text-primary-600">Hosting since {sampleHotel.host.since}</p>
                  </div>
                </div>
                <p className="text-primary-700 mb-4">
                  I'm passionate about sharing Queenstown's beauty with travelers. As a local guide and photographer, I know all the best spots for adventures and relaxation.
                </p>
                <Button variant="outline">Contact Host</Button>
              </Card>

              {/* Policies */}
              <Card>
                <h3 className="text-xl font-bold text-primary-900 mb-6">House Rules & Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">Check-in</h4>
                    <p className="text-primary-600">{sampleHotel.policies.checkIn}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">Check-out</h4>
                    <p className="text-primary-600">{sampleHotel.policies.checkOut}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">Cancellation</h4>
                    <p className="text-primary-600">{sampleHotel.policies.cancellation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">House Rules</h4>
                    <p className="text-primary-600">{sampleHotel.policies.rules}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-primary-400 line-through">$119</span>
                  <span className="text-2xl font-bold text-primary-900">${hotel?.pricing.priceRange.min || 109}</span>
                  <span className="text-primary-600">/night</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className="text-amber-premium">★</span>
                  <span className="font-semibold">{sampleHotel.rating}</span>
                  <span className="text-sm text-primary-600">({sampleHotel.reviews} reviews)</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-primary-600 mb-1">Check-in</div>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-sm font-semibold border-none outline-none"
                      />
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-xs text-primary-600 mb-1">Check-out</div>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-sm font-semibold border-none outline-none"
                      />
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-xs text-primary-600 mb-1">Guests</div>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full text-sm font-semibold border-none outline-none"
                    >
                      <option value={1}>1 guest</option>
                      <option value={2}>2 guests</option>
                      <option value={3}>3 guests</option>
                      <option value={4}>4 guests</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="flex-1">
                    <span>Save</span>
                    <span className="ml-2">+</span>
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/hotels/${id}/booking`)}
                  >
                    Reserve
                  </Button>
                </div>

                {checkIn && checkOut && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${hotel?.pricing.priceRange.min || 109} x {calculateNights()} nights</span>
                      <span>${calculateTotal().subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${calculateTotal().serviceFee}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${calculateTotal().total}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <button className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-900 transition-colors">
                    <span>🏴</span>
                    <span>Report this property</span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">All Photos</h3>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="text-white text-2xl hover:text-primary-300"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              {sampleHotel.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hotel view ${index + 1}`}
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

export default HotelDetailsPage;