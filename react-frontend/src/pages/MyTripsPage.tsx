import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/api.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Trip {
  id: string;
  type: 'appointment' | 'booking';
  reference: string;
  status: string;
  title: string;
  destination: string;
  estimatedPrice?: number;
  finalPrice?: number;
  currency: string;
  date?: string;
  startDate?: string;
  timeSlot?: string;
  travelers: number;
  createdAt: string;
  appointmentDetails?: any;
  bookingDetails?: any;
  actions: {
    canReschedule?: boolean;
    canCancel?: boolean;
    canViewDetails?: boolean;
    canDownloadReceipt?: boolean;
    canMakePayment?: boolean;
  };
}

interface Stats {
  totalTrips: number;
  appointments: {
    total: number;
    scheduled: number;
    completed: number;
    converted: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
  };
  totalValue: number;
}

const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'appointments' | 'bookings'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadTrips();
  }, [isAuthenticated]);

  const loadTrips = async () => {
    try {
      console.log('🔄 Loading unified trips...');
      setLoading(true);
      
      const response = await apiService.get('/user/trips');
      
      if (response.success) {
        console.log('✅ Trips loaded:', response.data.trips.length);
        setTrips(response.data.trips || []);
        setStats(response.data.stats || null);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, type: string) => {
    const colors = {
      // Appointment statuses
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      
      // Booking statuses
      'draft': 'bg-yellow-100 text-yellow-800',
      'pending-payment': 'bg-orange-100 text-orange-800',
      'payment-received': 'bg-green-100 text-green-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (type: string, status: string) => {
    if (type === 'appointment') {
      return status === 'converted' ? '✅' : '📅';
    }
    return status === 'completed' ? '🎉' : '🎫';
  };

  const getProgressStage = (trip: Trip) => {
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
        case 'draft': return { stage: 4, label: 'Booking Created' };
        case 'pending-payment': return { stage: 5, label: 'Payment Pending' };
        case 'payment-received': return { stage: 6, label: 'Payment Received' };
        case 'confirmed': return { stage: 6, label: 'Trip Confirmed' };
        case 'completed': return { stage: 7, label: 'Trip Completed' };
        default: return { stage: 4, label: 'Booking Created' };
      }
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    if (filter === 'appointments') return trip.type === 'appointment';
    if (filter === 'bookings') return trip.type === 'booking';
    return true;
  });

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
              <h1 className="text-3xl font-bold text-primary-900">My Trips</h1>
              <p className="text-primary-600">Track your journey from consultation to adventure</p>
            </div>
            <Button onClick={() => navigate('/trips')}>
              Plan New Trip
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-ocean mb-2">{stats.totalTrips}</div>
              <div className="text-sm text-primary-600">Total Trips</div>
              <div className="text-xs text-primary-500 mt-1">All time</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald mb-2">{stats.appointments.scheduled}</div>
              <div className="text-sm text-primary-600">Upcoming Consultations</div>
              <div className="text-xs text-emerald mt-1">Ready to discuss</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-premium mb-2">{stats.bookings.confirmed}</div>
              <div className="text-sm text-primary-600">Confirmed Trips</div>
              <div className="text-xs text-blue-ocean mt-1">Ready to travel</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">${stats.totalValue.toLocaleString()}</div>
              <div className="text-sm text-primary-600">Total Investment</div>
              <div className="text-xs text-amber-500 mt-1">In adventures</div>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <Card className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'all', label: 'All Trips', count: trips.length },
                { id: 'appointments', label: 'Consultations', count: trips.filter(t => t.type === 'appointment').length },
                { id: 'bookings', label: 'Bookings', count: trips.filter(t => t.type === 'booking').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">Start your journey by booking a consultation call</p>
            <Button onClick={() => navigate('/trips')}>Browse Destinations</Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredTrips.map((trip) => {
              const progress = getProgressStage(trip);
              return (
                <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Trip Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getStatusIcon(trip.type, trip.status)}</span>
                            <h3 className="text-xl font-bold text-primary-900">{trip.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status, trip.type)}`}>
                              {trip.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-primary-600 mb-2">📍 {trip.destination}</p>
                          <p className="text-sm text-primary-500">
                            {trip.type === 'appointment' ? '📅' : '🎫'} {trip.reference} • {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-900">
                            ${(trip.finalPrice || trip.estimatedPrice || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-primary-500">
                            {trip.type === 'appointment' ? 'Estimated' : 'Total'}
                          </div>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-sm font-medium text-primary-700">Journey Progress:</div>
                          <div className="text-sm text-primary-600">{progress.label}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-ocean h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.stage / 7) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      {trip.type === 'appointment' && trip.date && (
                        <p className="text-sm text-primary-600 mb-2">
                          🕒 {new Date(trip.date).toLocaleDateString()} at {trip.timeSlot}
                        </p>
                      )}
                      
                      {trip.type === 'booking' && trip.startDate && (
                        <p className="text-sm text-primary-600 mb-2">
                          🗓️ {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate || trip.startDate).toLocaleDateString()}
                        </p>
                      )}

                      {trip.bookingDetails && (
                        <div className="text-sm text-primary-600">
                          💳 Payment: {trip.bookingDetails.paymentStatus} • 
                          Paid: ${trip.bookingDetails.totalPaid.toLocaleString()} • 
                          Remaining: ${trip.bookingDetails.remainingAmount.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      {trip.actions.canViewDetails && (
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                      )}
                      
                      {trip.actions.canReschedule && (
                        <Button size="sm" variant="outline" className="w-full">
                          Reschedule
                        </Button>
                      )}
                      
                      {trip.actions.canMakePayment && (
                        <Button size="sm" className="w-full">
                          Make Payment
                        </Button>
                      )}
                      
                      {trip.actions.canDownloadReceipt && (
                        <Button size="sm" variant="outline" className="w-full">
                          Download Receipt
                        </Button>
                      )}
                      
                      {trip.actions.canCancel && (
                        <Button size="sm" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                          Cancel
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
    </div>
  );
};

export default MyTripsPage;