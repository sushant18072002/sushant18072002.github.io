import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itineraryService } from '@/services/itinerary.service';
import { Itinerary } from '@/types/api.types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ItineraryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('2024-05-15');
  const [travelers, setTravelers] = useState(2);
  const [showGallery, setShowGallery] = useState(false);

  const sampleItinerary = {
    id: 'queenstown-adventure',
    title: '7-Day Queenstown Adventure Package',
    description: 'Experience the ultimate Queenstown adventure with our carefully curated 7-day package.',
    location: 'Queenstown, New Zealand',
    duration: 7,
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviews: 127,
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=832&h=832&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=272&h=272&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=272&h=272&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=272&h=272&fit=crop'
    ],
    highlights: [
      { icon: '👥', text: '2-8 guests' },
      { icon: '📅', text: '7 days / 6 nights' },
      { icon: '🏨', text: 'Luxury accommodation' }
    ],
    inclusions: [
      '🏨 Luxury accommodation (6 nights)',
      '🍽️ All meals & beverages',
      '🚁 Helicopter tours',
      '🚤 Boat cruises',
      '🎿 Activity equipment',
      '👨‍🏫 Expert guides',
      '🚐 All transfers',
      '🛡️ Travel insurance'
    ],
    itinerary: [
      {
        day: 1,
        title: '🛬 Arrival & Welcome',
        date: 'May 15, 2024',
        description: 'Airport pickup, luxury hotel check-in, welcome dinner with local cuisine',
        activities: [
          { time: '2:00 PM', activity: 'Airport pickup & transfer' },
          { time: '3:30 PM', activity: 'Hotel check-in & welcome briefing' },
          { time: '7:00 PM', activity: 'Welcome dinner at The Bunker Restaurant' }
        ],
        tags: ['Transfer', 'Check-in', 'Dinner']
      },
      {
        day: 2,
        title: '🚁 Helicopter & Milford Sound',
        date: 'May 16, 2024',
        description: 'Scenic helicopter flight, Milford Sound cruise, wildlife viewing',
        activities: [
          { time: '8:00 AM', activity: 'Breakfast at hotel' },
          { time: '9:30 AM', activity: 'Helicopter flight to Milford Sound' },
          { time: '11:00 AM', activity: 'Milford Sound cruise & lunch' },
          { time: '4:00 PM', activity: 'Return helicopter flight' },
          { time: '7:30 PM', activity: 'Dinner at Fishbone Bar & Grill' }
        ],
        tags: ['Helicopter', 'Cruise', 'Wildlife']
      },
      {
        day: 3,
        title: '🪂 Adventure Sports',
        date: 'May 17, 2024',
        description: 'Bungee jumping, jet boat thrills, wine tasting in Central Otago',
        activities: [
          { time: '9:00 AM', activity: 'Kawarau Gorge bungee jumping' },
          { time: '11:30 AM', activity: 'Shotover Jet boat experience' },
          { time: '2:00 PM', activity: 'Lunch at The Fork and Tap' },
          { time: '4:00 PM', activity: 'Central Otago wine tasting tour' },
          { time: '8:00 PM', activity: 'Dinner at Rātā Restaurant' }
        ],
        tags: ['Bungee', 'Jet Boat', 'Wine']
      }
    ]
  };

  useEffect(() => {
    if (id) {
      loadItineraryDetails();
    }
  }, [id]);

  const loadItineraryDetails = async () => {
    try {
      const response = await itineraryService.getItineraryDetails(id!);
      setItinerary(response.data.itinerary || sampleItinerary);
    } catch (error) {
      setItinerary(sampleItinerary);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const basePrice = itinerary?.price || 999;
    const subtotal = basePrice * travelers;
    const discount = 300;
    const serviceFee = 99;
    return {
      subtotal,
      discount,
      serviceFee,
      total: subtotal - discount + serviceFee
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Itinerary not found</h2>
          <Button onClick={() => navigate('/itineraries')}>Back to Itineraries</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <section className="bg-primary-50 py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
            <button onClick={() => navigate('/')} className="hover:text-primary-900">Home</button>
            <span>&gt;</span>
            <button onClick={() => navigate('/packages')} className="hover:text-primary-900">Packages</button>
            <span>&gt;</span>
            <span>New Zealand</span>
            <span>&gt;</span>
            <span className="text-primary-900 font-semibold">Queenstown Adventure</span>
          </div>
          <button
            onClick={() => navigate('/itineraries')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
          >
            <span>←</span>
            <span>Go home</span>
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-primary-900 mb-4">{itinerary.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face"
                    alt="Host"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-primary-600">Adventure Tours NZ</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-premium">⭐</span>
                  <span className="font-semibold">{itinerary.rating}</span>
                  <span className="text-primary-600">({itinerary.reviews} reviews)</span>
                </div>
                <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">🏆 Premium Package</span>
                <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-bold">📍 {itinerary.location}</span>
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
                src={itinerary.images[0]}
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
              {itinerary.images.slice(1).map((image, index) => (
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
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Complete Adventure Package</h2>
                <div className="flex items-center gap-2 mb-4 text-primary-600">
                  <span>Organized by</span>
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face"
                    alt="Host"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">Adventure Tours NZ</span>
                </div>

                <div className="flex gap-6 mb-6">
                  {itinerary.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xl">{highlight.icon}</span>
                      <span className="text-primary-600">{highlight.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-primary-700 leading-relaxed">
                  {itinerary.description} From helicopter tours over stunning landscapes to adrenaline-pumping activities and luxury accommodations.
                </p>
              </Card>

              {/* Itinerary Timeline */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">Itinerary</h3>
                <div className="space-y-4">
                  {itinerary.itinerary?.map((day) => (
                    <div
                      key={day.day}
                      className="border border-primary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-ocean text-white rounded-full flex items-center justify-center font-bold">
                            {day.day}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-primary-900">{day.title}</h4>
                            <span className="text-sm text-primary-500">{day.date}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                        >
                          {selectedDay === day.day ? 'Hide Details' : 'View Details'}
                        </Button>
                      </div>
                      
                      <p className="text-primary-700 mb-4">{day.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {day.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {selectedDay === day.day && day.activities && (
                        <div className="mt-4 pt-4 border-t border-primary-200">
                          <h5 className="font-semibold text-primary-900 mb-3">Detailed Schedule</h5>
                          <div className="space-y-2">
                            {day.activities.map((activity, index) => (
                              <div key={index} className="flex gap-4">
                                <span className="text-sm font-semibold text-blue-ocean min-w-[80px]">
                                  {activity.time}
                                </span>
                                <span className="text-sm text-primary-700">{activity.activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* What's Included */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itinerary.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center gap-2 text-primary-700">
                      <span>{inclusion}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-6">View full itinerary</Button>
              </Card>

              {/* Location */}
              <Card>
                <h3 className="text-2xl font-bold text-primary-900 mb-6">Location & Activities</h3>
                <div className="bg-primary-50 rounded-lg p-8 text-center">
                  <h4 className="text-xl font-bold text-primary-900 mb-2">🗺️ {itinerary.location}</h4>
                  <p className="text-primary-600 mb-4">Explore the adventure capital with stunning lake and mountain views</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-sm text-primary-700">🏨 Luxury Hotels</div>
                    <div className="text-sm text-primary-700">🚁 Helicopter Tours</div>
                    <div className="text-sm text-primary-700">🎿 Ski Areas</div>
                    <div className="text-sm text-primary-700">🥾 Hiking Trails</div>
                  </div>
                  <Button variant="outline">View Interactive Map</Button>
                </div>
              </Card>
            </div>

            {/* Booking Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary-900">${itinerary.price}</span>
                    <span className="text-primary-600">/person</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-primary-400 line-through">${itinerary.originalPrice}</span>
                    <span className="bg-emerald text-white px-2 py-1 rounded text-xs font-bold">23% OFF</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-amber-premium">⭐</span>
                  <span className="font-semibold">{itinerary.rating}</span>
                  <span className="text-sm text-primary-600">({itinerary.reviews} reviews)</span>
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face"
                    alt="Host"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
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
                        <option key={num} value={num}>{num} adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <Button variant="outline" className="flex-1">Save +</Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/itineraries/${id}/booking`)}
                  >
                    Book Now
                  </Button>
                </div>

                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between">
                    <span>${itinerary.price} x {travelers} travelers</span>
                    <span>${calculateTotal().subtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald">
                    <span>Early bird discount</span>
                    <span>-${calculateTotal().discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>${calculateTotal().serviceFee}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${calculateTotal().total}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-primary-600 mb-6">
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Free cancellation up to 48h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Best price guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅</span>
                    <span>Instant confirmation</span>
                  </div>
                </div>

                <button className="text-sm text-primary-600 hover:text-primary-900 transition-colors">
                  🚩 Report this package
                </button>
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
              {itinerary.images.map((image, index) => (
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

export default ItineraryDetailsPage;