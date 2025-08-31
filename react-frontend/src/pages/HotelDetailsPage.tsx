import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Hotel {
  _id: string;
  name: string;
  description: string;
  starRating: number;
  location: {
    address: {
      street: string;
      area: string;
      zipCode: string;
    };
    coordinates: {
      coordinates: [number, number];
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    checkIn: string;
    checkOut: string;
  };
  amenities: {
    general: string[];
  };
  rooms: Array<{
    id: string;
    name: string;
    type: string;
    maxOccupancy: number;
    size: number;
    pricing: {
      baseRate: number;
      currency: string;
    };
    images: Array<{
      url: string;
      alt: string;
    }>;
  }>;
  images: Array<{
    url: string;
    alt: string;
    category: string;
  }>;
  rating: {
    overall: number;
    reviewCount: number;
  };
  pricing: {
    priceRange: {
      min: number;
      max: number;
      currency: string;
    };
  };
}

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showGallery, setShowGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    selectedRoom: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    if (id && isMounted) {
      loadHotel(id);
    }
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  const loadHotel = async (hotelId: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api'}/hotels/${hotelId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setHotel(data.data.hotel);
      } else {
        throw new Error(data.error?.message || 'Failed to load hotel');
      }
    } catch (error) {
      console.error('Failed to load hotel:', error);
      setError(error instanceof Error ? error.message : 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!hotel) return;
    
    const bookingParams = new URLSearchParams({
      hotelId: hotel._id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests.toString(),
      rooms: bookingData.rooms.toString(),
      ...(bookingData.selectedRoom && { roomId: bookingData.selectedRoom })
    });
    
    navigate(`/booking/hotel/${hotel._id}?${bookingParams}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold text-primary-900 mb-2 font-['DM_Sans']">Unable to Load Hotel</h1>
          <p className="text-primary-600 mb-6 font-['Poppins']">{error}</p>
          <Button onClick={() => navigate('/hotels')} className="mr-3">Back to Hotels</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 mb-4 font-['DM_Sans']">Hotel Not Found</h1>
          <Button onClick={() => navigate('/hotels')}>Back to Hotels</Button>
        </div>
      </div>
    );
  }

  const allImages = hotel.images || [];


  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <section className="bg-primary-50 py-3 sm:py-4 border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/hotels')}
              className="flex items-center gap-2 text-blue-ocean hover:text-emerald transition-colors font-medium font-['DM_Sans'] min-h-[44px] px-2 -mx-2 rounded-lg hover:bg-blue-50"
            >
              <span>←</span>
              <span>Back to Results</span>
            </button>
            <span className="text-primary-400">•</span>
            <span className="text-primary-600 font-['Poppins'] text-sm sm:text-base">Hotel Details</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Header */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary-900 mb-3 font-['DM_Sans'] leading-[0.9] tracking-tight">{hotel.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {hotel.verified && (
                    <span className="bg-emerald text-white px-3 py-1 rounded-full text-sm font-bold font-['DM_Sans'] flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  )}
                  {hotel.chain && (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold font-['DM_Sans']">{hotel.chain}</span>
                  )}
                  <span className="text-primary-600 font-['Poppins'] font-medium">
                    📍 {hotel.location?.address?.area}, {hotel.location?.cityName}, {hotel.location?.countryName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-premium text-lg">⭐</span>
                    <span className="font-bold text-primary-900 font-['DM_Sans']">{hotel.rating?.overall || 0}</span>
                    <span className="text-primary-600 font-['Poppins']">({hotel.rating?.reviewCount?.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors" title="View on Map">
                  <span className="text-lg">📍</span>
                </button>
                <button className="p-3 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors" title="Share">
                  <span className="text-lg">📤</span>
                </button>
                <button className="p-3 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors" title="Save">
                  <span className="text-lg">❤️</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Gallery */}
            <section className="mb-8 lg:mb-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl lg:rounded-2xl overflow-hidden">
                  <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <img
                      src={allImages[0]?.url 
                        ? (allImages[0].url.startsWith('http') 
                            ? allImages[0].url 
                            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}${allImages[0].url}`)
                        : 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=832&h=832&fit=crop'}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=832&h=832&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <img
                      src={allImages[1]?.url || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=272&h=272&fit=crop'}
                      alt="Hotel view"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <img
                      src={allImages[2]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=272&h=272&fit=crop'}
                      alt="Hotel room"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <img
                      src={allImages[3]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=272&h=272&fit=crop'}
                      alt="Hotel amenity"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <div className="relative group cursor-pointer" onClick={() => setShowGallery(true)}>
                    <img
                      src={allImages[4]?.url || 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=272&h=272&fit=crop'}
                      alt="Hotel facility"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    <button 
                      onClick={() => setShowGallery(true)}
                      className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white text-primary-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold font-['DM_Sans'] text-xs sm:text-sm hover:bg-primary-50 transition-colors flex items-center gap-1 sm:gap-2 shadow-md"
                    >
                      <span>🖼️</span>
                      <span>Show all photos</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Property Info */}
            <div className="bg-white rounded-2xl p-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4 font-['DM_Sans'] leading-[1.1]">Private room in house</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-primary-600 font-['Poppins']">Hosted by</span>
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face" alt="Host" className="w-6 h-6 rounded-full" />
                <span className="font-medium text-primary-900 font-['DM_Sans']">Zoe Towne</span>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <span className="font-medium text-primary-900 font-['Poppins']">2 guests</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛏️</span>
                  <span className="font-medium text-primary-900 font-['Poppins']">1 bedroom</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚿</span>
                  <span className="font-medium text-primary-900 font-['Poppins']">1 private bath</span>
                </div>
              </div>
              
              <div className="space-y-4 text-primary-700 leading-relaxed font-['Poppins']">
                <p>{hotel.description}</p>
                <p>Enjoy breathtaking 180° views of Lake Wakatipu from your well appointed & privately accessed bedroom with modern en suite and floor-to-ceiling windows.</p>
                <p>Your private patio takes in the afternoon sun, letting you soak up unparalleled lake and mountain views by day and the stars & city lights by night.</p>
              </div>
            </div>

            {/* AI Itineraries */}
            <div className="bg-white rounded-2xl p-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-2 font-['DM_Sans'] leading-[1.1]">🤖 AI-Generated Itineraries</h3>
              <p className="text-primary-600 mb-6 font-['Poppins']">Discover perfect day plans created by our AI for your stay</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-primary-900 font-['DM_Sans'] leading-[1.2]">Adventure Seeker</h4>
                    <span className="bg-blue-ocean text-white px-3 py-1 rounded-full text-sm font-bold font-['DM_Sans']">3 Days</span>
                  </div>
                  <p className="text-primary-600 mb-4 font-['Poppins']">Bungee jumping, skydiving, jet boating</p>
                  <button className="bg-blue-ocean text-white px-4 py-2 rounded-xl font-bold font-['DM_Sans'] text-sm hover:bg-emerald transition-colors">
                    View Itinerary
                  </button>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-emerald-100">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base sm:text-lg font-bold text-primary-900 font-['DM_Sans'] leading-[1.2]">Scenic Explorer</h4>
                    <span className="bg-emerald text-white px-3 py-1 rounded-full text-sm font-bold font-['DM_Sans']">2 Days</span>
                  </div>
                  <p className="text-primary-600 mb-4 font-['Poppins']">Milford Sound, gondola rides, wine tours</p>
                  <button className="bg-emerald text-white px-4 py-2 rounded-xl font-bold font-['DM_Sans'] text-sm hover:bg-blue-ocean transition-colors">
                    View Itinerary
                  </button>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities?.general?.map((amenity, index) => {
                  let amenityName, amenityFee = '', amenityAvailable = true;
                  
                  if (typeof amenity === 'string') {
                    amenityName = amenity;
                  } else if (typeof amenity === 'object' && amenity.name) {
                    amenityName = amenity.name;
                    amenityFee = amenity.fee ? ` (€${amenity.fee})` : '';
                    amenityAvailable = amenity.available !== false;
                  } else {
                    amenityName = String(amenity);
                  }
                  
                  return (
                    <div key={index} className={`flex items-center gap-2 ${!amenityAvailable ? 'opacity-50' : ''}`}>
                      <span className={amenityAvailable ? 'text-emerald' : 'text-red-500'}>
                        {amenityAvailable ? '✓' : '✗'}
                      </span>
                      <span className="text-primary-700">{amenityName}{amenityFee}</span>
                      {!amenityAvailable && <span className="text-xs text-red-500">(Not Available)</span>}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Nearby Attractions */}
            {hotel.location?.nearbyAttractions && hotel.location.nearbyAttractions.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Nearby Attractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.location.nearbyAttractions.map((attraction, index) => {
                    const attractionName = typeof attraction === 'string' ? attraction : attraction.name;
                    const distance = typeof attraction === 'object' ? attraction.distance : null;
                    const type = typeof attraction === 'object' ? attraction.type : null;
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                        <span className="text-2xl">
                          {type === 'museum' ? '🏛️' : 
                           type === 'park' ? '🌳' : 
                           type === 'shopping' ? '🛍️' : 
                           type === 'restaurant' ? '🍽️' : '📍'}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-900">{attractionName}</h3>
                          <div className="flex items-center gap-2 text-sm text-primary-600">
                            {distance && <span>🚶 {distance}km away</span>}
                            {type && <span className="capitalize">• {type}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Hotel Policies */}
            {hotel.policies && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Hotel Policies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-3">Check-in & Check-out</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Check-in:</span>
                        <span>{hotel.policies.checkIn?.from || hotel.contact?.checkIn || '15:00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Check-out:</span>
                        <span>{hotel.policies.checkOut?.to || hotel.contact?.checkOut || '11:00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Min Age:</span>
                        <span>{hotel.policies.checkIn?.minAge || 18} years</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-primary-900 mb-3">Guests & Pets</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Children:</span>
                        <span>{hotel.policies.children?.allowed ? 'Allowed' : 'Not Allowed'}</span>
                      </div>
                      {hotel.policies.children?.allowed && (
                        <div className="flex justify-between">
                          <span className="text-primary-600">Free under:</span>
                          <span>{hotel.policies.children.freeAge} years</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-primary-600">Pets:</span>
                        <span>{hotel.policies.pets?.allowed ? `Allowed (€${hotel.policies.pets.fee || 0})` : 'Not Allowed'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {hotel.policies.cancellation && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <h3 className="font-semibold text-primary-900 mb-2">Cancellation Policy</h3>
                    <p className="text-sm text-primary-700">
                      {typeof hotel.policies.cancellation === 'string' 
                        ? hotel.policies.cancellation 
                        : hotel.policies.cancellation.description || 'Free cancellation up to 24 hours'}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Rooms */}
            {hotel.rooms && hotel.rooms.length > 0 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-4">Available Rooms</h2>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <div key={room.id} className="border border-primary-200 rounded-lg p-4 hover:border-blue-ocean transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary-900">{room.name}</h3>
                          <p className="text-primary-600 text-sm mb-2 capitalize">
                            {room.type} • Up to {room.maxOccupancy} guests {room.size && `• ${room.size}m²`}
                          </p>
                          
                          {/* Room Amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {room.amenities.slice(0, 4).map((amenity, index) => (
                                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 4 && (
                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                  +{room.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Bed Configuration */}
                          {room.bedConfiguration && (
                            <div className="text-xs text-primary-500 mb-2">
                              {room.bedConfiguration.kingBeds > 0 && `${room.bedConfiguration.kingBeds} King bed `}
                              {room.bedConfiguration.queenBeds > 0 && `${room.bedConfiguration.queenBeds} Queen bed `}
                              {room.bedConfiguration.doubleBeds > 0 && `${room.bedConfiguration.doubleBeds} Double bed `}
                              {room.bedConfiguration.singleBeds > 0 && `${room.bedConfiguration.singleBeds} Single bed`}
                            </div>
                          )}
                          
                          {room.images && room.images.length > 0 && (
                            <img
                              src={room.images[0].url?.startsWith('http') || room.images[0].url?.startsWith('blob:') 
                                ? room.images[0].url 
                                : `http://localhost:3000${room.images[0].url}`}
                              alt={room.images[0].alt}
                              className="w-32 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=128&h=96&fit=crop';
                              }}
                            />
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald">
                            ${room.pricing?.totalRate || room.pricing?.baseRate || 'N/A'}
                          </div>
                          <div className="text-sm text-primary-600">per night</div>
                          {room.pricing?.taxes > 0 && (
                            <div className="text-xs text-primary-500">+${room.pricing.taxes} taxes</div>
                          )}
                          <div className="text-xs text-primary-500 mb-2">
                            {room.totalRooms} rooms available
                          </div>
                          <Button size="sm" className="mt-2" onClick={() => {
                            // Update booking data with selected room
                            setBookingData(prev => ({ ...prev, selectedRoom: room.id }));
                          }}>Select Room</Button>
                        </div>
                      </div>
                      
                      {/* Cancellation Policy */}
                      {room.pricing?.cancellationPolicy && (
                        <div className="mt-3 pt-3 border-t border-primary-100">
                          <div className="text-xs text-primary-600">
                            <span className="font-medium">Cancellation:</span> 
                            <span className="capitalize">{room.pricing.cancellationPolicy.type}</span>
                            {room.pricing.cancellationPolicy.deadline && (
                              <span> up to {room.pricing.cancellationPolicy.deadline}h before check-in</span>
                            )}
                            {room.pricing.cancellationPolicy.fee && (
                              <span> (${room.pricing.cancellationPolicy.fee} fee)</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-primary-200 rounded-xl lg:rounded-2xl shadow-lg lg:sticky lg:top-20">
              {/* Fixed Price Header */}
              <div className="p-4 sm:p-6 border-b border-primary-100">
                <div className="flex items-baseline gap-2 mb-2">
                  {hotel.pricing?.priceRange?.max > hotel.pricing?.averageNightlyRate && (
                    <span className="text-lg text-primary-400 line-through font-['Poppins']">
                      {hotel.pricing.currencySymbol}{hotel.pricing.priceRange.max}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-primary-900 font-['DM_Sans']">
                    {hotel.pricing?.currencySymbol || '$'}{hotel.pricing?.averageNightlyRate || 0}
                  </span>
                  <span className="text-primary-600 font-['Poppins']">/ night</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-premium text-lg">★</span>
                  <span className="font-bold text-primary-900 font-['DM_Sans']">{hotel.rating?.overall || 0}</span>
                  <span className="text-primary-600 font-['Poppins']">({hotel.rating?.reviewCount?.toLocaleString()} reviews)</span>
                </div>
              </div>
              
              {/* Sticky Booking Form */}
              <div className="p-6">


              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-primary-200 rounded-xl overflow-hidden">
                  <div className="p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-primary-200">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-400">📅</span>
                      <div>
                        <div className="text-xs font-bold text-primary-700 font-['DM_Sans'] uppercase tracking-wider">Check-in</div>
                        <input
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                          className="text-sm font-medium text-primary-900 font-['Poppins'] border-none outline-none bg-transparent w-full"
                          placeholder="Add date"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-primary-400">📅</span>
                      <div>
                        <div className="text-xs font-bold text-primary-700 font-['DM_Sans'] uppercase tracking-wider">Check-out</div>
                        <input
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                          className="text-sm font-medium text-primary-900 font-['Poppins'] border-none outline-none bg-transparent w-full"
                          placeholder="Add date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-primary-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-400">👤</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-primary-700 font-['DM_Sans'] uppercase tracking-wider">Guests</div>
                      <select
                        value={bookingData.guests}
                        onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                        className="text-sm font-medium text-primary-900 font-['Poppins'] border-none outline-none bg-transparent w-full"
                      >
                        <option value={1}>1 guest</option>
                        <option value={2}>2 guests</option>
                        <option value={3}>3 guests</option>
                        <option value={4}>4 guests</option>
                        <option value={5}>5 guests</option>
                        <option value={6}>6 guests</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button className="flex-1 bg-white border border-primary-200 text-primary-900 py-3 px-4 rounded-xl font-bold font-['DM_Sans'] hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2 min-h-[48px]">
                  <span>Save</span>
                  <span>+</span>
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={!bookingData.checkIn || !bookingData.checkOut}
                  className="flex-[2] bg-blue-ocean text-white py-3 px-6 rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reserve
                </button>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-primary-600 font-['Poppins']">You won't be charged yet</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-primary-200">
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-['Poppins']">$109 x 7 nights</span>
                  <span className="font-medium text-primary-900 font-['DM_Sans']">$763</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-['Poppins']">Service fee</span>
                  <span className="font-medium text-primary-900 font-['DM_Sans']">$103</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-primary-200">
                  <span className="font-bold text-primary-900 font-['DM_Sans']">Total</span>
                  <span className="font-bold text-primary-900 font-['DM_Sans']">$866</span>
                </div>
              

              <div className="mt-6 pt-4 border-t border-primary-200">
                <button className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors font-['Poppins'] text-sm">
                  <span>🏴</span>
                  <span>Report this property</span>
                </button>
              </div>
              </div>
            </div>
          </div>

            {/* Contact Info */}
            {(hotel.contact?.phone || hotel.contact?.email || hotel.contact?.checkIn || hotel.contact?.checkOut) && (
              <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
                <h3 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  {hotel.contact?.phone && (
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-['Poppins']">Phone:</span>
                      <span className="text-primary-900 font-['Poppins'] font-medium">{hotel.contact.phone}</span>
                    </div>
                  )}
                  {hotel.contact?.email && (
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-['Poppins']">Email:</span>
                      <span className="text-primary-900 font-['Poppins'] font-medium">
                        {hotel.contact.email.replace(/^(mailto:)+/g, '')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-primary-600 font-['Poppins']">Check-in:</span>
                    <span className="text-primary-900 font-['Poppins'] font-medium">{hotel.contact?.checkIn || hotel.policies?.checkIn?.from || '15:00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-600 font-['Poppins']">Check-out:</span>
                    <span className="text-primary-900 font-['Poppins'] font-medium">{hotel.contact?.checkOut || hotel.policies?.checkOut?.to || '11:00'}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full max-h-full">
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <div className="bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary-900 mb-4 font-['DM_Sans']">{hotel.name} - Photos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allImages.map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImageIndex(index)}>
                      <img
                        src={image.url?.startsWith('http') ? image.url : `${(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api'}${image.url}`}
                        alt={image.alt || `${hotel.name} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://images.unsplash.com/photo-156407304941${index}?w=400&h=300&fit=crop`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl"></div>
                    </div>
                  ))}
                  {/* Add more placeholder images if needed */}
                  {allImages.length < 6 && Array.from({ length: 6 - allImages.length }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="relative group cursor-pointer">
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1566073771259-6a8506099945',
                          '1571896349842-33c89424de2d',
                          '1445019980597-93fa8acb246c',
                          '1582719478250-c89cae4dc85b',
                          '1520250497591-112f2f40a3f4',
                          '1564501049412-61c2ae185a50'
                        ][index % 6]}?w=400&h=300&fit=crop`}
                        alt={`${hotel.name} - View ${allImages.length + index + 1}`}
                        className="w-full h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailsPage;