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
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    selectedRoom: ''
  });

  useEffect(() => {
    if (id) {
      loadHotel(id);
    }
  }, [id]);

  const loadHotel = async (hotelId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}`);
      const data = await response.json();
      if (data.success) {
        setHotel(data.data.hotel);
      }
    } catch (error) {
      console.error('Failed to load hotel:', error);
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

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-900 mb-4">Hotel Not Found</h1>
          <Button onClick={() => navigate('/hotels')}>Back to Hotels</Button>
        </div>
      </div>
    );
  }

  const allImages = hotel.images || [];
  const currentImage = allImages[selectedImageIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-primary-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors"
          >
            <span>←</span>
            <span>Back to Hotels</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-yellow-500">{'⭐'.repeat(hotel.starRating)}</span>
            <span className="text-sm text-primary-600">{hotel.starRating} Star Hotel</span>
            {hotel.chain && (
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                {hotel.chain}
              </span>
            )}
            {(hotel.category || hotel.hotelCategory) && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium capitalize">
                {hotel.category || hotel.hotelCategory}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-2">{hotel.name}</h1>
          <p className="text-primary-600 mb-4">
            📍 {hotel.location?.address?.area || hotel.location?.cityName}, {hotel.location?.address?.street || hotel.location?.countryName}
          </p>
          
          {/* Tags */}
          {hotel.tags && hotel.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {hotel.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-amber-500">⭐</span>
              <span className="font-semibold">{hotel.rating?.overall || 4.5}</span>
              <span className="text-primary-600">({hotel.rating?.reviewCount || 0} reviews)</span>
            </div>
            <div className="text-2xl font-bold text-emerald">
              From ${hotel.pricing?.averageNightlyRate || hotel.pricing?.priceRange?.min || 'N/A'}/night
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="p-0 overflow-hidden">
              <div className="relative">
                <img
                  src={currentImage?.url 
                    ? (currentImage.url.startsWith('http') 
                        ? currentImage.url 
                        : `http://localhost:3000${currentImage.url}`)
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop'}
                  alt={currentImage?.alt || hotel.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';
                  }}
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-blue-ocean' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.url?.startsWith('http') ? image.url : `http://localhost:3000${image.url}`}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary-900 mb-4">About This Hotel</h2>
              <p className="text-primary-700 leading-relaxed">{hotel.description}</p>
            </Card>

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

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Book Your Stay</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Check-in</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Check-out</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Guests</label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Rooms</label>
                    <select
                      value={bookingData.rooms}
                      onChange={(e) => setBookingData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                    >
                      {[1,2,3,4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary-700">Price per night</span>
                    <span className="font-semibold">${hotel.pricing?.averageNightlyRate || hotel.pricing?.priceRange?.min || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-primary-700">Total (est.)</span>
                    <span className="text-xl font-bold text-emerald">
                      ${((hotel.pricing?.averageNightlyRate || hotel.pricing?.priceRange?.min || 0) * bookingData.rooms).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBooking}
                  disabled={!bookingData.checkIn || !bookingData.checkOut}
                >
                  Book Now
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-primary-500">Free cancellation • No booking fees</p>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-600">Phone:</span>
                  <span className="text-primary-900">{hotel.contact?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Email:</span>
                  <span className="text-primary-900">
                    {hotel.contact?.email ? hotel.contact.email.replace(/^(mailto:)+/g, '') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Check-in:</span>
                  <span className="text-primary-900">{hotel.contact?.checkIn || '15:00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-600">Check-out:</span>
                  <span className="text-primary-900">{hotel.contact?.checkOut || '11:00'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailsPage;