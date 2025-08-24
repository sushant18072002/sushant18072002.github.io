import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);

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
    setTimeout(() => setLoading(false), 1000);
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'upcoming': return 'bg-emerald/20 text-emerald';
      case 'completed': return 'bg-primary-100 text-primary-700';
      default: return 'bg-primary-100 text-primary-700';
    }
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
            <Button onClick={() => navigate('/itineraries')}>
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
                  { id: 'bookings', label: 'My Bookings', icon: '📋' },
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
            {activeTab === 'bookings' && (
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
                  {sampleBookings.map(booking => (
                    <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-full md:w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getTypeIcon(booking.type)}</span>
                                <h3 className="text-lg font-bold text-primary-900">{booking.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="text-primary-600 text-sm">{booking.subtitle}</p>
                              <p className="text-xs text-primary-500 mt-1">Booking ID: {booking.id}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary-900">${booking.price}</div>
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
                  <Button variant="outline" onClick={() => navigate('/itineraries')}>
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
    </div>
  );
};

export default DashboardPage;