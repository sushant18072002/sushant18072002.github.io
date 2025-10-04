import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/api.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ContentModal from '@/components/admin/ContentModal';
import PackageManagement from '@/components/admin/PackageManagement';
import PackageManagementDashboard from '@/components/admin/PackageManagementDashboard';
import UnifiedPackageForm from '@/components/admin/UnifiedPackageForm';
import TripManagement from '@/components/admin/TripManagement';
import MasterDataManagement from '@/components/admin/MasterDataManagement';
import CompleteTripForm from '@/components/admin/CompleteTripForm';
import BookingManagement from '@/components/admin/BookingManagement';
import BookingDetailsModal from '@/components/admin/BookingDetailsModal';
import AppointmentDetailsModal from '@/components/admin/AppointmentDetailsModal';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import PaymentModal from '@/components/admin/PaymentModal';
import NotificationModal from '@/components/admin/NotificationModal';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import FlightManagement from '@/components/admin/FlightManagement';
import UserManagement from '@/components/admin/UserManagement';
import HotelManagement from '@/components/admin/HotelManagement';
import HeroManagement from '@/components/admin/HeroManagement';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editPackageId, setEditPackageId] = useState<string | null>(null);
  const [contentModalType, setContentModalType] = useState<'flight' | 'hotel' | 'package'>('flight');
  const [tripData, setTripData] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<any>(null);
  const [notificationData, setNotificationData] = useState<any>(null);

  const loadTripData = async (tripId: string) => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.get(`/admin/trips/${tripId}`);
      if (response.success) {
        setTripData(response.data.trip);
        return response.data.trip;
      }
    } catch (error) {
      console.error('Failed to load trip data:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (activeTab === 'appointments' || activeTab === 'bookings') {
      loadAdminData();
    }
  }, [activeTab]);

  const loadAdminData = async () => {
    console.log('🔄 Loading admin data...');
    console.log('User role:', user?.role);
    try {
      setLoadingData(true);
      const [appointmentsRes, bookingsRes] = await Promise.all([
        apiService.get('/admin/appointments'),
        apiService.get('/admin/bookings/all') // Use new admin endpoint that gets ALL bookings
      ]);

      if (appointmentsRes.success) {
        console.log('✅ Admin appointments loaded:', appointmentsRes.data.appointments?.length || 0);
        setAppointments(appointmentsRes.data.appointments || []);
      }
      
      if (bookingsRes.success) {
        console.log('✅ Admin bookings response:', bookingsRes);
        console.log('✅ Admin bookings data structure:', bookingsRes.data);
        
        // Handle different possible response structures
        let bookingsArray = [];
        if (bookingsRes.data?.bookings) {
          bookingsArray = bookingsRes.data.bookings;
        } else if (Array.isArray(bookingsRes.data)) {
          bookingsArray = bookingsRes.data;
        } else if (bookingsRes.bookings) {
          bookingsArray = bookingsRes.bookings;
        }
        
        console.log('✅ Final bookings array:', bookingsArray);
        console.log('✅ Final bookings length:', bookingsArray.length);
        setAdminBookings(bookingsArray);
      } else {
        console.log('❌ Admin bookings failed:', bookingsRes);
        setAdminBookings([]);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoadingData(false);
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    
    setConfirmModalData({
      title: 'Update Appointment Status',
      message: `Appointment: ${appointment?.appointmentReference}\nCustomer: ${appointment?.customer?.firstName} ${appointment?.customer?.lastName}\nTrip: ${appointment?.trip?.title}\n\nThis will mark the appointment as ${status.toUpperCase()}.\n\nDo you want to proceed?`,
      confirmText: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      type: status === 'completed' ? 'info' : 'warning',
      onConfirm: () => performAppointmentStatusUpdate(appointmentId, status)
    });
    setShowConfirmModal(true);
  };

  const performAppointmentStatusUpdate = async (appointmentId, status) => {
    try {
      const response = await apiService.put(`/admin/appointments/${appointmentId}`, { status });
      if (response.success) {
        setNotificationData({
          title: 'Appointment Updated',
          message: `Appointment status has been updated to ${status.toUpperCase()} successfully!`,
          type: 'success'
        });
        setShowNotificationModal(true);
        loadAdminData();
      } else {
        setNotificationData({
          title: 'Update Failed',
          message: response.error?.message || 'Failed to update appointment status',
          type: 'error'
        });
        setShowNotificationModal(true);
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      setNotificationData({
        title: 'Update Failed',
        message: error.message || 'Network error occurred',
        type: 'error'
      });
      setShowNotificationModal(true);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    const booking = adminBookings.find(b => b._id === bookingId);
    const currentStatus = booking?.status || 'draft';
    
    setConfirmModalData({
      title: 'Confirm Status Change',
      message: `Booking: ${booking?.bookingReference || bookingId}\nCustomer: ${booking?.customer?.firstName} ${booking?.customer?.lastName}\n\nCurrent Status: ${currentStatus.replace('-', ' ').toUpperCase()}\nNew Status: ${newStatus.replace('-', ' ').toUpperCase()}\n\nAre you sure you want to change the status?`,
      confirmText: 'Update Status',
      type: 'warning',
      onConfirm: () => performBookingStatusUpdate(bookingId, newStatus, currentStatus),
      onCancel: () => {
        const dropdown = document.querySelector(`select[data-booking-id="${bookingId}"]`);
        if (dropdown) dropdown.value = currentStatus;
      }
    });
    setShowConfirmModal(true);
  };

  const performBookingStatusUpdate = async (bookingId, newStatus, currentStatus) => {
    try {
      console.log('🔄 Updating booking status:', { bookingId, newStatus });
      
      const response = await apiService.put(`/appointments/bookings/${bookingId}/status`, {
        status: newStatus
      });
      
      console.log('📝 Status update response:', response);

      if (response.success) {
        setAdminBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
        
        const booking = adminBookings.find(b => b._id === bookingId);
        setNotificationData({
          title: 'Status Updated Successfully',
          message: `Booking: ${booking?.bookingReference}\nNew Status: ${newStatus.replace('-', ' ').toUpperCase()}`,
          type: 'success'
        });
        setShowNotificationModal(true);
      } else {
        console.error('❌ Status update failed:', response);
        setNotificationData({
          title: 'Status Update Failed',
          message: response.error?.message || 'Unknown error occurred',
          type: 'error'
        });
        setShowNotificationModal(true);
        
        const dropdown = document.querySelector(`select[data-booking-id="${bookingId}"]`);
        if (dropdown) dropdown.value = currentStatus;
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
      setNotificationData({
        title: 'Status Update Failed',
        message: error.message || 'Network error occurred',
        type: 'error'
      });
      setShowNotificationModal(true);
      
      const dropdown = document.querySelector(`select[data-booking-id="${bookingId}"]`);
      if (dropdown) dropdown.value = currentStatus;
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const recordPayment = async (bookingId, remainingAmount) => {
    const booking = adminBookings.find(b => b._id === bookingId);
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (amount: number, method: string) => {
    const bookingId = selectedBooking?._id;
    const remainingAmount = (selectedBooking?.pricing?.finalAmount || 0) - (selectedBooking?.payment?.totalPaid || 0);
    
    try {
      const response = await apiService.post(`/admin/bookings/${bookingId}/payment`, {
        amount: amount,
        method: method,
        transactionId: `TXN-${Date.now()}`,
        notes: 'Payment recorded by admin'
      });

      if (response.success) {
        const newTotalPaid = (response.data.booking?.payment?.totalPaid || 0);
        const isFullyPaid = newTotalPaid >= remainingAmount;
        
        setAdminBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { 
                ...booking, 
                payment: { 
                  ...booking.payment, 
                  totalPaid: newTotalPaid,
                  status: isFullyPaid ? 'completed' : 'partial'
                },
                status: isFullyPaid ? 'payment-received' : 'pending-payment'
              }
            : booking
        ));
        
        setNotificationData({
          title: 'Payment Recorded Successfully',
          message: `Amount: ${selectedBooking?.pricing?.currency || 'USD'} ${amount.toLocaleString()}\nMethod: ${method}\nStatus: ${isFullyPaid ? 'Payment Completed' : 'Partial Payment'}`,
          type: 'success'
        });
        setShowNotificationModal(true);
      } else {
        setNotificationData({
          title: 'Payment Recording Failed',
          message: response.error?.message || 'Unknown error occurred',
          type: 'error'
        });
        setShowNotificationModal(true);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setNotificationData({
        title: 'Payment Recording Failed',
        message: error.message || 'Network error occurred',
        type: 'error'
      });
      setShowNotificationModal(true);
    }
  };

  const convertAppointmentToBooking = async (appointmentId, estimatedPrice) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    setConfirmModalData({
      title: 'Convert Appointment to Booking',
      message: `Appointment: ${appointment?.appointmentReference}\nCustomer: ${appointment?.customer?.firstName} ${appointment?.customer?.lastName}\nTrip: ${appointment?.trip?.title}\n\nEstimated Price: $${estimatedPrice}\n\nThis will convert the appointment to a confirmed booking.\n\nDo you want to proceed?`,
      confirmText: 'Convert to Booking',
      type: 'info',
      onConfirm: () => performConversion(appointmentId, estimatedPrice)
    });
    setShowConfirmModal(true);
  };

  const performConversion = async (appointmentId, estimatedPrice) => {
    try {
      const response = await apiService.post(`/admin/appointments/${appointmentId}/convert`, {
        finalPrice: estimatedPrice,
        paymentMethod: 'bank-transfer',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        travelers: { count: 2, adults: 2 }
      });

      if (response.success) {
        setNotificationData({
          title: 'Conversion Successful',
          message: 'Appointment has been converted to booking successfully!',
          type: 'success'
        });
        setShowNotificationModal(true);
        loadAdminData();
      } else {
        setNotificationData({
          title: 'Conversion Failed',
          message: response.error?.message || 'Unknown error occurred',
          type: 'error'
        });
        setShowNotificationModal(true);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setNotificationData({
        title: 'Conversion Failed',
        message: error.message || 'Network error occurred',
        type: 'error'
      });
      setShowNotificationModal(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800',
      'converted': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary-900">Admin Dashboard</h1>
          <p className="text-primary-600">Manage your travel platform</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'flights', label: 'Flights', icon: '✈️' },
                  { id: 'hotels', label: 'Hotels', icon: '🏨' },
                  { id: 'trips', label: 'Trips', icon: '🧳' },
                  { id: 'master-data', label: 'Master Data', icon: '🗂️' },
                  { id: 'users', label: 'Users', icon: '👥' },
                  { id: 'appointments', label: 'Appointments', icon: '📅' },
                  { id: 'bookings', label: 'Bookings', icon: '📋' },
                  { id: 'blog', label: 'Blog', icon: '📝' },
                  { id: 'analytics', label: 'Analytics', icon: '📈' },
                  { id: 'hero', label: 'Hero Content', icon: '🎬' }
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

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-ocean mb-2">{appointments.length}</div>
                    <div className="text-sm text-primary-600">Total Appointments</div>
                    <div className="text-xs text-emerald mt-1">{appointments.filter(a => a.status === 'scheduled').length} scheduled</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-emerald mb-2">{adminBookings.length}</div>
                    <div className="text-sm text-primary-600">Total Bookings</div>
                    <div className="text-xs text-emerald mt-1">{adminBookings.filter(b => b.status === 'confirmed').length} confirmed</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-amber-premium mb-2">
                      ${adminBookings.reduce((sum, b) => sum + (b.pricing?.finalAmount || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-primary-600">Total Revenue</div>
                    <div className="text-xs text-blue-ocean mt-1">All bookings</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'converted').length / appointments.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-primary-600">Conversion Rate</div>
                    <div className="text-xs text-amber-500 mt-1">Appointments → Bookings</div>
                  </Card>
                </div>
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary-900">Quick Actions</h3>
                    <Button onClick={loadAdminData} size="sm">Refresh Data</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <div className="font-semibold text-blue-900">Manage Appointments</div>
                      <div className="text-sm text-blue-600">{appointments.filter(a => a.status === 'scheduled').length} pending</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors"
                    >
                      <div className="text-2xl mb-2">📋</div>
                      <div className="font-semibold text-green-900">Manage Bookings</div>
                      <div className="text-sm text-green-600">{adminBookings.filter(b => b.payment?.status === 'pending').length} pending payment</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('trips')}
                      className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition-colors"
                    >
                      <div className="text-2xl mb-2">🌍</div>
                      <div className="font-semibold text-purple-900">Manage Trips</div>
                      <div className="text-sm text-purple-600">Add new trips</div>
                    </button>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-ocean text-white rounded-full flex items-center justify-center text-sm">📋</div>
                      <div>
                        <div className="text-sm font-semibold">New booking for Bali Adventure</div>
                        <div className="text-xs text-primary-500">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald/10 rounded-lg">
                      <div className="w-8 h-8 bg-emerald text-white rounded-full flex items-center justify-center text-sm">⭐</div>
                      <div>
                        <div className="text-sm font-semibold">5-star review for Paris Romance</div>
                        <div className="text-xs text-primary-500">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">🧳</div>
                      <div>
                        <div className="text-sm font-semibold">New trip published: Iceland Northern Lights</div>
                        <div className="text-xs text-primary-500">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'flights' && <FlightManagement />}

            {activeTab === 'hotels' && <HotelManagement />}

            {activeTab === 'packages' && (
              <PackageManagementDashboard 
                onCreatePackage={() => {
                  setEditPackageId(null);
                  setShowPackageForm(true);
                }}
                onEditPackage={(packageId) => {
                  setEditPackageId(packageId);
                  setShowPackageForm(true);
                }}
              />
            )}
            
            {activeTab === 'trips' && (
              <TripManagement 
                onCreateTrip={() => {
                  setEditPackageId(null);
                  setTripData(null);
                  setShowPackageForm(true);
                }}
                onEditTrip={async (tripId) => {
                  setEditPackageId(tripId);
                  const trip = await loadTripData(tripId);
                  setTripData(trip);
                  setShowPackageForm(true);
                }}
              />
            )}
            
            {activeTab === 'master-data' && (
              <MasterDataManagement />
            )}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'appointments' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Appointment Management</h2>
                  <Button onClick={loadAdminData}>Refresh</Button>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600">Customer appointments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Main Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-primary-900">{appointment.appointmentReference}</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-primary-600 font-medium">{appointment.trip?.title || 'Trip Consultation'}</p>
                                <p className="text-sm text-gray-500">📍 {appointment.trip?.destination || 'Destination TBD'}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary-900">
                                  {appointment.trip?.currency || 'USD'} {(appointment.pricing?.estimatedTotal || 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">Estimated</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">👤 Customer</p>
                                <p className="font-medium text-primary-900">
                                  {appointment.customer?.firstName} {appointment.customer?.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{appointment.customer?.email}</p>
                                <p className="text-sm text-gray-500">{appointment.customer?.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">📅 Schedule</p>
                                <p className="font-medium text-primary-900">
                                  {appointment.schedule?.preferredDate ? new Date(appointment.schedule.preferredDate).toLocaleDateString() : 'TBD'}
                                </p>
                                <p className="text-sm text-gray-500">{appointment.schedule?.timeSlot || 'Time TBD'}</p>
                                <p className="text-sm text-gray-500">Travelers: {appointment.customer?.travelers || 1}</p>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500">
                              Created: {new Date(appointment.createdAt).toLocaleDateString()} • 
                              Source: {appointment.source || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-col gap-3 lg:w-48">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewAppointmentDetails(appointment)}
                              className="w-full"
                            >
                              View Details
                            </Button>
                            
                            {appointment.status === 'scheduled' && (
                              <Button
                                size="sm"
                                onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                            
                            {appointment.status === 'completed' && (
                              <Button
                                size="sm"
                                onClick={() => convertAppointmentToBooking(appointment._id, appointment.pricing?.estimatedTotal || 999)}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                Convert to Booking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'bookings' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Booking Management</h2>
                  <Button onClick={loadAdminData}>Refresh</Button>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading bookings...</p>
                  </div>
                ) : adminBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600">Converted bookings will appear here</p>
                    <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                      <p><strong>Debug Info:</strong></p>
                      <p>adminBookings type: {typeof adminBookings}</p>
                      <p>adminBookings length: {adminBookings?.length || 'undefined'}</p>
                      <p>adminBookings value: {JSON.stringify(adminBookings)}</p>
                    </div>
                    <Button onClick={loadAdminData} className="mt-4">Reload Data</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4 p-2 bg-green-100 rounded text-sm">
                      <strong>Found {adminBookings.length} booking(s)</strong>
                    </div>
                    {adminBookings.map((booking) => {
                      const remainingAmount = (booking.pricing?.finalAmount || 0) - (booking.payment?.totalPaid || 0);
                      
                      return (
                        <div key={booking._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Main Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-primary-900">{booking.bookingReference}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                      {(booking.status || 'draft').replace('-', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-primary-600 font-medium">{booking.trip?.title || 'Trip Booking'}</p>
                                  <p className="text-sm text-gray-500">📍 {booking.trip?.destination || 'Destination TBD'}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary-900">
                                    {booking.trip?.currency || booking.pricing?.currency || 'USD'} {(booking.pricing?.finalAmount || 0).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-500">Total Amount</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">👤 Customer</p>
                                  <p className="font-medium text-primary-900">
                                    {booking.customer?.firstName} {booking.customer?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">{booking.customer?.email}</p>
                                  <p className="text-sm text-gray-500">{booking.customer?.phone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">💳 Payment Status</p>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.payment?.status || 'pending')}`}>
                                      {(booking.payment?.status || 'pending').toUpperCase()}
                                    </span>
                                    <span className="text-sm text-gray-500">{booking.payment?.method || 'N/A'}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Paid: <span className="font-medium text-green-600">
                                      {booking.trip?.currency || booking.pricing?.currency || 'USD'} {(booking.payment?.totalPaid || 0).toLocaleString()}
                                    </span>
                                  </p>
                                  {remainingAmount > 0 && (
                                    <p className="text-sm text-gray-600">
                                      Remaining: <span className="font-medium text-orange-600">
                                        {booking.trip?.currency || booking.pricing?.currency || 'USD'} {remainingAmount.toLocaleString()}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Created: {new Date(booking.createdAt).toLocaleDateString()} • 
                                Travelers: {booking.travelers?.count || 1} • 
                                Source: {booking.source || 'N/A'}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-col gap-3 lg:w-48">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewBookingDetails(booking)}
                                className="w-full"
                              >
                                View Details
                              </Button>
                              
                              {booking.payment?.status === 'pending' && remainingAmount > 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => recordPayment(booking._id, remainingAmount)}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  Record Payment
                                </Button>
                              )}
                              
                              <select
                                value={booking.status || 'draft'}
                                data-booking-id={booking._id}
                                onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="draft">Draft</option>
                                <option value="pending-payment">Pending Payment</option>
                                <option value="payment-received">Payment Received</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                )}
              </Card>
            )}

            {activeTab === 'blog' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Blog Management</h2>
                  <Button onClick={() => setShowCreatePost(true)}>Create New Post</Button>
                </div>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts found</h3>
                  <p className="text-gray-600 mb-6">Create your first blog post to get started</p>
                  <Button onClick={() => setShowCreatePost(true)}>Create Post</Button>
                </div>
              </Card>
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {activeTab === 'hero' && <HeroManagement />}
          </div>
        </div>
      </div>
      
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreatePost(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowCreatePost(false)}
              className="absolute top-4 right-4 text-2xl text-primary-400 hover:text-primary-600"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Create New Blog Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter post title"
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Content</label>
                <textarea
                  rows={8}
                  placeholder="Write your blog post content here..."
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreatePost(false)} className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">
                  Create Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ContentModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        type={contentModalType}
        onSubmit={async (data) => {
          try {
            console.log('Creating', contentModalType, data);
            const { apiService } = await import('@/services/api');
            const response = await apiService.post(`/admin/${contentModalType}s`, data);
            
            if (response.success) {
              alert(`${contentModalType} created successfully!`);
              setShowContentModal(false);
              window.location.reload();
            } else {
              alert(`Failed to create ${contentModalType}: ${response.error?.message || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Create error:', error);
            alert(`Failed to create ${contentModalType}. Please try again.`);
          }
        }}
      />
      
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-900">
                  {editPackageId ? 'Edit Trip' : 'Create New Trip'}
                </h2>
                <button
                  onClick={() => setShowPackageForm(false)}
                  className="text-2xl text-primary-400 hover:text-primary-600"
                >
                  ×
                </button>
              </div>
              <UnifiedPackageForm 
                packageId={editPackageId}
                onSubmit={async (data) => {
                  try {
                    const { apiService } = await import('@/services/api');
                    const response = editPackageId 
                      ? await apiService.put(`/admin/trips/${editPackageId}`, data)
                      : await apiService.post('/admin/trips', data);
                    
                    if (response.success) {
                      setShowPackageForm(false);
                      setEditPackageId(null);
                      window.location.reload();
                    }
                  } catch (error) {
                    alert('Failed to save trip');
                  }
                }}
                onClose={() => {
                  setShowPackageForm(false);
                  setEditPackageId(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBooking(null);
        }}
        onStatusUpdate={updateBookingStatus}
        onRecordPayment={recordPayment}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          confirmModalData?.onCancel?.();
          setConfirmModalData(null);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          confirmModalData?.onConfirm?.();
          setConfirmModalData(null);
        }}
        title={confirmModalData?.title || ''}
        message={confirmModalData?.message || ''}
        confirmText={confirmModalData?.confirmText}
        type={confirmModalData?.type}
      />
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={handlePaymentSubmit}
        booking={selectedBooking}
        remainingAmount={(selectedBooking?.pricing?.finalAmount || 0) - (selectedBooking?.payment?.totalPaid || 0)}
      />
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          setNotificationData(null);
        }}
        title={notificationData?.title || ''}
        message={notificationData?.message || ''}
        type={notificationData?.type}
      />
      
      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={() => {
          setShowAppointmentModal(false);
          setSelectedAppointment(null);
        }}
        onStatusUpdate={updateAppointmentStatus}
        onConvertToBooking={convertAppointmentToBooking}
      />
    </div>
  );
};

export default AdminPage;