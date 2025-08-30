import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const destinationId = searchParams.get('destination');
    if (id || destinationId) {
      loadTripDetails();
    }
  }, [id, searchParams]);

  const loadTripDetails = async () => {
    const tripId = id || new URLSearchParams(window.location.search).get('destination');
    if (!tripId) return;
    
    setLoading(true);
    try {
      // Try destinations endpoint first (for destination links from homepage)
      let response = await fetch(`http://localhost:3000/api/destinations/${tripId}`);
      let data = await response.json();
      
      if (data.success && data.data.trip) {
        setTrip(data.data.trip);
        return;
      }
      
      // Fallback to trips endpoint
      response = await fetch(`http://localhost:3000/api/trips/${tripId}`);
      data = await response.json();
      if (data.success) {
        setTrip(data.data.trip || data.data);
      }
    } catch (error) {
      console.error('Failed to load trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrip = () => {
    if (trip) {
      navigate(`/booking/trip/${trip._id || trip.id}`);
    }
  };

  const handleCustomizeTrip = () => {
    if (trip) {
      navigate(`/trips/${trip._id || trip.id}/customize`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Trip Not Found</h2>
          <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'booking', label: 'Booking', icon: '📅' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 overflow-hidden">
          <img
            src={trip.images?.[selectedImageIndex]?.url?.startsWith('http') 
              ? trip.images[selectedImageIndex].url 
              : trip.images?.[selectedImageIndex]?.url 
                ? `http://localhost:3000${trip.images[selectedImageIndex].url}` 
                : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        {/* Image Thumbnails */}
        {trip.images?.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {trip.images.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  selectedImageIndex === index ? 'border-white' : 'border-transparent'
                }`}
              >
                <img
                  src={image.url?.startsWith('http') ? image.url : `http://localhost:3000${image.url}`}
                  alt={`${trip.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {trip.images.length > 5 && (
              <div className="w-16 h-16 rounded-lg bg-black bg-opacity-50 flex items-center justify-center text-white text-sm">
                +{trip.images.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Trip Header */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                {trip.category?.icon} {trip.category?.name}
              </span>
              {trip.featured && (
                <span className="px-3 py-1 bg-amber-500 rounded-full text-sm font-bold">
                  ⭐ Featured
                </span>
              )}
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {trip.duration.days} days, {trip.duration.nights} nights
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{trip.title}</h1>
            <p className="text-xl opacity-90">📍 {trip.primaryDestination?.name || trip.destination || 'Multiple Destinations'}</p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="border-b sticky top-16 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-ocean text-blue-ocean'
                    : 'border-transparent text-primary-600 hover:text-primary-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-primary-900 mb-4">About This Trip</h2>
                    <p className="text-primary-700 leading-relaxed mb-6">{trip.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-3">✨ Highlights</h3>
                        <ul className="space-y-2">
                          {trip.highlights?.length > 0 ? trip.highlights.map((highlight, index) => (
                            <li key={index} className="text-primary-700">• {highlight}</li>
                          )) : trip.itinerary?.slice(0, 5).map((day, index) => (
                            <li key={index} className="text-primary-700">• {day.title}</li>
                          )) || [
                            <li key="1" className="text-primary-700">• Explore local attractions</li>,
                            <li key="2" className="text-primary-700">• Cultural experiences</li>,
                            <li key="3" className="text-primary-700">• Local cuisine tasting</li>
                          ]}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-3">👥 Perfect For</h3>
                        <div className="flex flex-wrap gap-2">
                          {trip.suitableFor?.couples && (
                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">💕 Couples</span>
                          )}
                          {trip.suitableFor?.families && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">👨‍👩‍👧‍👦 Families</span>
                          )}
                          {trip.suitableFor?.soloTravelers && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">🧳 Solo</span>
                          )}
                          {trip.suitableFor?.groups && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">👥 Groups</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Travel Info */}
                    {trip.travelInfo && (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h3 className="font-semibold text-primary-900 mb-3">🌍 Travel Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {trip.travelInfo.bestTimeToVisit?.months?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-700 mb-1">Best Time</h4>
                              <p className="text-sm text-primary-600">
                                {trip.travelInfo.bestTimeToVisit.months.join(', ')}
                                {trip.travelInfo.bestTimeToVisit.weather && ` • ${trip.travelInfo.bestTimeToVisit.weather}`}
                              </p>
                              {trip.travelInfo.bestTimeToVisit.temperature && (
                                <p className="text-xs text-primary-500">
                                  {trip.travelInfo.bestTimeToVisit.temperature.min}°C - {trip.travelInfo.bestTimeToVisit.temperature.max}°C
                                </p>
                              )}
                            </div>
                          )}
                          
                          {trip.travelInfo.localCulture?.language?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-700 mb-1">Languages</h4>
                              <p className="text-sm text-primary-600">{trip.travelInfo.localCulture.language.join(', ')}</p>
                            </div>
                          )}
                          
                          {trip.travelInfo.localCulture?.currency && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-700 mb-1">Currency</h4>
                              <p className="text-sm text-primary-600">{trip.travelInfo.localCulture.currency}</p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium text-primary-700 mb-1">Safety</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trip.travelInfo.safetyInformation?.level === 'low' ? 'bg-green-100 text-green-700' :
                              trip.travelInfo.safetyInformation?.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {trip.travelInfo.safetyInformation?.level || 'Low'} Risk
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Physical Requirements */}
                    {trip.physicalRequirements && (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h3 className="font-semibold text-primary-900 mb-3">🏃 Physical Requirements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-primary-700 mb-1">Fitness Level</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trip.physicalRequirements.fitnessLevel === 'low' ? 'bg-green-100 text-green-700' :
                              trip.physicalRequirements.fitnessLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {trip.physicalRequirements.fitnessLevel || 'Low'}
                            </span>
                          </div>
                          {trip.physicalRequirements.walkingDistance > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-700 mb-1">Walking Distance</h4>
                              <p className="text-sm text-primary-600">{trip.physicalRequirements.walkingDistance} km/day</p>
                            </div>
                          )}
                          {trip.physicalRequirements.altitude > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-700 mb-1">Altitude</h4>
                              <p className="text-sm text-primary-600">{trip.physicalRequirements.altitude}m</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Services */}
                    {trip.includedServices && (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h3 className="font-semibold text-primary-900 mb-3">✅ Included Services</h3>
                        <div className="space-y-2">
                          {trip.includedServices.transport?.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-primary-700">🚗 Transport:</span>
                              <span className="text-sm text-primary-600">{trip.includedServices.transport.join(', ')}</span>
                            </div>
                          )}
                          {trip.includedServices.meals?.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium text-primary-700">🍽️ Meals:</span>
                              <span className="text-sm text-primary-600">{trip.includedServices.meals.join(', ')}</span>
                            </div>
                          )}
                          {trip.includedServices.guides && (
                            <div className="text-sm font-medium text-primary-700">👨🏫 Professional Guide</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Includes & Excludes */}
                    <div className="mt-6 pt-6 border-t border-primary-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trip.includes?.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-primary-900 mb-3">✅ What's Included</h3>
                            <ul className="space-y-1">
                              {trip.includes.map((item, index) => (
                                <li key={index} className="text-sm text-primary-600 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {trip.excludes?.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-primary-900 mb-3">❌ What's Not Included</h3>
                            <ul className="space-y-1">
                              {trip.excludes.map((item, index) => (
                                <li key={index} className="text-sm text-primary-600 flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">✗</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary-900">Day-by-Day Itinerary</h2>
                  {trip.itinerary?.length > 0 ? trip.itinerary.map((day, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-ocean text-white rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-primary-900 mb-2">{day.title}</h3>
                          <p className="text-primary-600 mb-4">{day.description}</p>
                          
                          {day.activities && day.activities.length > 0 && (
                            <div className="space-y-3">
                              {day.activities.map((activity, actIndex) => (
                                <div key={actIndex} className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                                  <div className="text-sm font-semibold text-primary-600 min-w-[60px]">
                                    {activity.time}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-primary-900">{activity.title}</h4>
                                    <p className="text-sm text-primary-600">{activity.description}</p>
                                    {activity.estimatedCost && (
                                      <p className="text-sm text-emerald font-semibold mt-1">
                                        ${activity.estimatedCost.amount} {activity.included ? '(Included)' : '(Optional)'}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🗓️</div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-2">No Itinerary Available</h3>
                      <p className="text-primary-600">This trip doesn't have a detailed day-by-day itinerary yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-primary-900 mb-6">Pricing Breakdown</h2>
                    
                    <div className="space-y-4">
                      {trip.pricing.breakdown && Object.entries(trip.pricing.breakdown).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-primary-100">
                            <span className="capitalize text-primary-700">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-semibold">${value.toLocaleString()}</span>
                          </div>
                        )
                      ))}
                      <div className="flex justify-between items-center py-3 text-xl font-bold text-primary-900 border-t-2 border-primary-200">
                        <span>Total per person</span>
                        <span className="text-emerald">${trip.pricing.estimated?.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-primary-900 mb-6">Booking Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-3">Booking Details</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-primary-600">Booking Type:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trip.bookingInfo?.instantBook ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {trip.bookingInfo?.instantBook ? '⚡ Instant Book' : '✅ Requires Approval'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-600">Advance Booking:</span>
                            <span className="font-semibold">{trip.bookingInfo?.advanceBooking || 7} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-600">Deposit Required:</span>
                            <span className="font-semibold">{trip.bookingInfo?.depositRequired || 50}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-600">Final Payment:</span>
                            <span className="font-semibold">{trip.bookingInfo?.finalPaymentDue || 30} days before</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-primary-900 mb-3">Availability</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-primary-600">Max Bookings:</span>
                            <span className="font-semibold">{trip.availability?.maxBookings || 20} people</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-600">Trip Type:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trip.availability?.seasonal ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {trip.availability?.seasonal ? '🌿 Seasonal' : '📅 Year-round'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {trip.bookingInfo?.cancellationPolicy && (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h3 className="font-semibold text-primary-900 mb-3">Cancellation Policy</h3>
                        <p className="text-sm text-primary-600 leading-relaxed">
                          {trip.bookingInfo.cancellationPolicy}
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold text-primary-900 mb-4">Reviews & Ratings</h2>
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">⭐</div>
                      <div className="text-2xl font-bold text-primary-900">{trip.stats.rating || 4.5}</div>
                      <div className="text-primary-600">Based on {trip.stats.reviewCount || 0} reviews</div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                {/* Booking Card */}
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-emerald mb-2">
                      ${trip.pricing.estimated?.toLocaleString() || 'TBD'}
                    </div>
                    <div className="text-primary-600">
                      per person • {trip.pricing.currency || 'USD'}
                    </div>
                    <div className="text-xs text-primary-500 mt-1">
                      {trip.pricing.priceRange && (
                        <span className="capitalize bg-primary-100 px-2 py-1 rounded">
                          {trip.pricing.priceRange.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button 
                      fullWidth 
                      size="lg"
                      onClick={handleBookTrip}
                    >
                      Book This Trip
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outline"
                      onClick={handleCustomizeTrip}
                    >
                      Customize Trip
                    </Button>
                  </div>

                  <div className="text-sm text-primary-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{trip.duration.days} days, {trip.duration.nights} nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className="capitalize">{trip.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Group Size:</span>
                      <span>{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Travel Style:</span>
                      <span className="capitalize">{trip.travelStyle}</span>
                    </div>
                    {trip.physicalRequirements?.fitnessLevel && (
                      <div className="flex justify-between">
                        <span>Fitness Level:</span>
                        <span className="capitalize">{trip.physicalRequirements.fitnessLevel}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Trip Stats */}
                <Card className="p-6">
                  <h3 className="font-semibold text-primary-900 mb-4">Trip Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-600">Views:</span>
                      <span className="font-semibold">{trip.stats.views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Bookings:</span>
                      <span className="font-semibold">{trip.stats.bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Likes:</span>
                      <span className="font-semibold">{trip.stats.likes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Copies:</span>
                      <span className="font-semibold">{trip.stats.copies || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600">Rating:</span>
                      <span className="font-semibold">⭐ {trip.stats.rating || 4.5}</span>
                    </div>
                  </div>
                </Card>
                
                {/* Tags */}
                {trip.tags?.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-primary-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {trip.tags.slice(0, 8).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 8 && (
                        <span className="px-2 py-1 bg-primary-200 text-primary-600 rounded text-xs">
                          +{trip.tags.length - 8} more
                        </span>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TripDetailsPage;