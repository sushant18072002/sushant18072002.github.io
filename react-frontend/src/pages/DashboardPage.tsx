import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/api.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TripDetailsModal from '@/components/user/TripDetailsModal';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('mytrips');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [unifiedTrips, setUnifiedTrips] = useState([]);
  const [tripStats, setTripStats] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);

  const sampleBookings = [
    {
      id: 'TRV-ABC123',
      type: 'flight',
      title: 'NYC → Paris',
      subtitle: 'Delta Airlines • Dec 15, 2024',
      status: 'confirmed',
      price: 1198,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop'
    },
    {
      id: 'TRV-DEF456',
      type: 'package',
      title: 'Bali Luxury Escape',
      subtitle: '7 days • 2 travelers',
      status: 'upcoming',
      price: 4998,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop'
    },
    {
      id: 'TRV-GHI789',
      type: 'hotel',
      title: 'Queenstown Views',
      subtitle: 'May 15-22 • 7 nights',
      status: 'completed',
      price: 866,
      image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=300&h=200&fit=crop'
    }
  ];

  const sampleFavorites = [
    {
      id: 'fav-1',
      type: 'itinerary',
      title: 'Japan Cultural Journey',
      subtitle: '10 days • Cultural',
      price: 3299,
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop'
    },
    {
      id: 'fav-2',
      type: 'hotel',
      title: 'Swiss Alpine Resort',
      subtitle: 'Zermatt, Switzerland',
      price: 450,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'appointments' || activeTab === 'bookings' || activeTab === 'mytrips') {
      loadUserData();
    }
  }, [activeTab]);

  const loadUserData = async () => {
    console.log('🔄 Loading user data...');
    try {
      setLoadingData(true);
      const [appointmentsRes, bookingsRes, tripsRes] = await Promise.all([
        apiService.get('/appointments'),
        apiService.get('/appointments/bookings'),
        apiService.get('/user/trips')
      ]);

      if (appointmentsRes.success) {
        console.log('✅ User appointments loaded:', appointmentsRes.data.appointments?.length || 0);
        setAppointments(appointmentsRes.data.appointments || []);
      }
      
      if (bookingsRes.success) {
        console.log('✅ User bookings loaded:', bookingsRes.data.bookings?.length || 0);
        setBookings(bookingsRes.data.bookings || []);
      }

      if (tripsRes.success) {
        console.log('✅ Unified trips loaded:', tripsRes.data.trips?.length || 0);
        setUnifiedTrips(tripsRes.data.trips || []);
        setTripStats(tripsRes.data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoadingData(false);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'upcoming': return 'bg-emerald/20 text-emerald';
      case 'completed': return 'bg-primary-100 text-primary-700';
      default: return 'bg-primary-100 text-primary-700';
    }
  };

  const handleMakePayment = (trip) => {
    const currency = trip.currency || trip.pricing?.currency || 'USD';
    const amount = trip.finalPrice || trip.estimatedPrice || 0;
    
    alert(`Payment Instructions\n\nBooking Reference: ${trip.reference}\nAmount: ${currency} ${amount.toLocaleString()}\n\nPayment Methods:\n• Bank Transfer\n• UPI Payment\n• Cash Payment\n\nContact Information:\nPhone: +1-234-567-8900\nEmail: payments@travel.com\n\nAfter payment, please share the transaction details for confirmation.`);
  };

  const handleDownloadReceipt = (trip) => {
    // Simulate receipt download
    const receiptData = {
      reference: trip.reference,
      title: trip.title,
      destination: trip.destination,
      amount: trip.finalPrice || trip.estimatedPrice || 0,
      currency: trip.currency || trip.pricing?.currency || 'USD',
      status: trip.status,
      date: new Date().toLocaleDateString()
    };
    
    const receiptText = `TRAVEL RECEIPT\n\nReference: ${receiptData.reference}\nTrip: ${receiptData.title}\nDestination: ${receiptData.destination}\nAmount: ${receiptData.currency} ${receiptData.amount.toLocaleString()}\nStatus: ${receiptData.status.toUpperCase()}\nDate: ${receiptData.date}\n\nThank you for choosing our services!`;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${trip.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'package': return '📦';
      case 'itinerary': return '🗺️';
      default: return '🎯';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-primary-600">Manage your bookings and plan your next adventure</p>
            </div>
            <Button onClick={() => navigate('/trips')}>
              Plan New Trip
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-governor to-blue-mirage rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-bold text-primary-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-primary-600">Traveler since 2024</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {[
                  { id: 'mytrips', label: 'My Trips', icon: '🌍' },
                  { id: 'favorites', label: 'Favorites', icon: '❤️' },
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-ocean text-white'
                        : 'text-primary-700 hover:bg-primary-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Simplified to only My Trips tab */}
            {activeTab === 'mytrips' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">My Trips</h2>
                  <Button onClick={() => navigate('/trips')}>Plan New Trip</Button>
                </div>

                {/* Trip Statistics */}
                {tripStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-ocean mb-1">{tripStats.totalTrips}</div>
                      <div className="text-sm text-primary-600">Total Trips</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-emerald mb-1">{tripStats.appointments.scheduled}</div>
                      <div className="text-sm text-primary-600">Upcoming Consultations</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-amber-premium mb-1">{tripStats.bookings.confirmed}</div>
                      <div className="text-sm text-primary-600">Confirmed Trips</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">${tripStats.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-primary-600">Total Investment</div>
                    </Card>
                  </div>
                )}

                {loadingData ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading trips...</p>
                  </div>
                ) : unifiedTrips.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="text-6xl mb-4">🌍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
                    <p className="text-gray-600 mb-6">Start your journey by booking a consultation call</p>
                    <Button onClick={() => navigate('/trips')}>Browse Destinations</Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {unifiedTrips.map((trip) => {
                      const getStatusColor = (status, type) => {
                        const colors = {
                          'scheduled': 'bg-blue-100 text-blue-800',
                          'completed': 'bg-purple-100 text-purple-800',
                          'converted': 'bg-emerald-100 text-emerald-800',
                          'draft': 'bg-yellow-100 text-yellow-800',
                          'confirmed': 'bg-green-100 text-green-800'
                        };
                        return colors[status] || 'bg-gray-100 text-gray-800';
                      };

                      const getProgressStage = (trip) => {
                        if (trip.type === 'appointment') {
                          switch (trip.status) {
                            case 'scheduled': return { stage: 1, label: 'Consultation Scheduled' };
                            case 'confirmed': return { stage: 2, label: 'Consultation Confirmed' };
                            case 'completed': return { stage: 3, label: 'Consultation Completed' };
                            case 'converted': return { stage: 4, label: 'Converted to Booking' };
                            default: return { stage: 1, label: 'Consultation Scheduled' };
                          }
                        } else {
                          switch (trip.status) {
                            case 'draft': return { stage: 4, label: 'Awaiting Payment' };
                            case 'pending-payment': return { stage: 5, label: 'Payment Processing' };
                            case 'payment-received': return { stage: 6, label: 'Payment Confirmed' };
                            case 'confirmed': return { stage: 6, label: 'Trip Confirmed' };
                            case 'completed': return { stage: 7, label: 'Trip Completed' };
                            default: return { stage: 4, label: 'Awaiting Payment' };
                          }
                        }
                      };

                      const progress = getProgressStage(trip);
                      
                      // Get trip image based on destination
                      const getTripImage = (destination) => {
                        const images = {
                          'Berlin': 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=300&h=200&fit=crop',
                          'Paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
                          'Tokyo': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop',
                          'Bali': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=300&h=200&fit=crop',
                          'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=200&fit=crop'
                        };
                        return images[destination] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop';
                      };
                      
                      const currency = trip.currency || trip.pricing?.currency || 'USD';
                      
                      return (
                        <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                          <div className="flex flex-col lg:flex-row">
                            {/* Trip Image */}
                            <div className="lg:w-48 h-48 lg:h-auto">
                              <img
                                src={getTripImage(trip.destination)}
                                alt={trip.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1 p-6">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl">{trip.type === 'appointment' ? '📅' : '🎟️'}</span>
                                <h3 className="text-lg font-bold text-primary-900">{trip.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status, trip.type)}`}>
                                  {trip.status.replace('-', ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-primary-600 text-sm mb-2">📍 {trip.destination}</p>
                              <p className="text-xs text-primary-500 mb-3">
                                {trip.type === 'appointment' ? '📅' : '🎟️'} {trip.reference} • {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                                {trip.originalAppointment && (
                                  <span className="block mt-1 text-gray-500">
                                    📅 From consultation: {trip.originalAppointment.reference}
                                  </span>
                                )}
                              </p>
                              
                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-xs font-medium text-primary-700">Progress:</div>
                                  <div className="text-xs text-primary-600">{progress.label}</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-ocean h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.stage / 7) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {trip.type === 'appointment' && trip.date && (
                                <p className="text-xs text-primary-600">
                                  🕰️ {new Date(trip.date).toLocaleDateString()} at {trip.timeSlot}
                                </p>
                              )}
                              
                              {trip.type === 'booking' && trip.originalAppointment && (
                                <p className="text-xs text-primary-600">
                                  📅 Original consultation: {new Date(trip.originalAppointment.date).toLocaleDateString()} at {trip.originalAppointment.timeSlot}
                                </p>
                              )}
                              
                              {trip.bookingDetails && (
                                <div className="text-xs text-primary-600">
                                  <p>💳 Payment Status: <span className="font-medium">{trip.bookingDetails.paymentStatus.replace('-', ' ').toUpperCase()}</span></p>
                                  <p>Paid: {currency} {trip.bookingDetails.totalPaid.toLocaleString()} • Remaining: {currency} {trip.bookingDetails.remainingAmount.toLocaleString()}</p>
                                  {trip.bookingDetails.paymentStatus === 'pending' && (
                                    <p className="text-orange-600 font-medium mt-1">⚠️ Payment of {currency} {trip.bookingDetails.remainingAmount.toLocaleString()} required</p>
                                  )}
                                  {trip.bookingDetails.paymentStatus === 'completed' && (
                                    <p className="text-green-600 font-medium mt-1">✅ Payment confirmed - Trip ready!</p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 lg:w-40">
                              <div className="text-right mb-2">
                                <div className="text-2xl font-bold text-primary-900">
                                  {currency} {(trip.finalPrice || trip.estimatedPrice || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-primary-500">
                                  {trip.type === 'appointment' ? 'Estimated' : 'Total Amount'}
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-xs"
                                onClick={() => {
                                  setSelectedTrip(trip);
                                  setShowTripModal(true);
                                }}
                              >
                                View Details
                              </Button>
                              
                              {trip.actions?.canMakePayment && (
                                <Button 
                                  size="sm" 
                                  className="w-full text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => handleMakePayment(trip)}
                                >
                                  Make Payment
                                </Button>
                              )}
                              
                              {trip.actions?.canDownloadReceipt && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs"
                                  onClick={() => handleDownloadReceipt(trip)}
                                >
                                  Download Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Remove unused tabs - keeping only My Trips */}
            {false && activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">My Appointments</h2>
                  <Button onClick={() => navigate('/trips')}>Book Consultation</Button>
                </div>

                {loadingData ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-600 mb-6">Book a consultation call to start planning your dream trip</p>
                    <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment._id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">📅</span>
                                  <h3 className="text-lg font-bold text-primary-900">{appointment.trip?.title || 'Trip Consultation'}</h3>
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-primary-600 text-sm">📍 {appointment.trip?.destination || 'Destination TBD'}</p>
                                <p className="text-primary-600 text-sm">📞 {new Date(appointment.schedule.preferredDate).toLocaleDateString()} at {appointment.schedule.timeSlot}</p>
                                <p className="text-xs text-primary-500 mt-1">Ref: {appointment.appointmentReference}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-primary-900">
                                  ${appointment.pricing?.estimatedTotal || 0}
                                </div>
                                <div className="text-xs text-primary-500">Estimated</div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" variant="outline">View Details</Button>
                              {appointment.status === 'scheduled' && (
                                <>
                                  <Button size="sm" variant="outline">Reschedule</Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {false && activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">My Bookings</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-ocean text-white rounded-lg text-sm">All</button>
                    <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200">Upcoming</button>
                    <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200">Past</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {loadingData ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">Your confirmed trip bookings will appear here</p>
                    <Button onClick={() => navigate('/trips')}>Browse Trips</Button>
                  </div>
                ) : bookings.map(booking => (
                    <Card key={booking._id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📋</span>
                                <h3 className="text-lg font-bold text-primary-900">{booking.bookingReference}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-primary-600 text-sm">{booking.trip?.destination || 'Trip Booking'}</p>
                              <p className="text-xs text-primary-500 mt-1">Booking ID: {booking.bookingReference}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary-900">{booking.pricing?.currency || '$'}{booking.pricing?.finalAmount || 0}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm" variant="outline">Download Receipt</Button>
                            {booking.status === 'upcoming' && (
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Saved Favorites</h2>
                  <Button variant="outline" onClick={() => navigate('/trips')}>
                    Browse More
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sampleFavorites.map(item => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{getTypeIcon(item.type)}</span>
                          <h3 className="font-bold text-primary-900">{item.title}</h3>
                        </div>
                        <p className="text-primary-600 text-sm mb-3">{item.subtitle}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-emerald">${item.price}</span>
                          <div className="flex gap-2">
                            <Button size="sm">Book Now</Button>
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded">❤️</button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { id: 'email', label: 'Email notifications', desc: 'Booking confirmations and updates' },
                        { id: 'sms', label: 'SMS notifications', desc: 'Important travel alerts' },
                        { id: 'deals', label: 'Deal alerts', desc: 'Special offers and discounts' }
                      ].map(setting => (
                        <div key={setting.id} className="flex items-center justify-between p-4 border border-primary-200 rounded-lg">
                          <div>
                            <div className="font-semibold text-primary-900">{setting.label}</div>
                            <div className="text-sm text-primary-600">{setting.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-ocean"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-4">Privacy</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Trip Details Modal */}
      <TripDetailsModal
        trip={selectedTrip}
        isOpen={showTripModal}
        onClose={() => {
          setShowTripModal(false);
          setSelectedTrip(null);
        }}
        onDownloadReceipt={() => {
          if (selectedTrip) {
            handleDownloadReceipt(selectedTrip);
          }
        }}
        onMakePayment={() => {
          if (selectedTrip) {
            handleMakePayment(selectedTrip);
          }
        }}
      />
    </div>
  );
};

export default DashboardPage;