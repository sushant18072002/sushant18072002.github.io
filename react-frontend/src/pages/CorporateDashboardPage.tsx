import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { corporateService, CorporateBooking } from '@/services/corporate.service';

const CorporateDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<CorporateBooking[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<CorporateBooking[]>([]);

  useEffect(() => {
    if (!user?.corporate?.company) {
      navigate('/corporate/setup');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, bookingsResponse, approvalsResponse] = await Promise.all([
        corporateService.getCompanyDashboard(),
        corporateService.getCompanyBookings({ limit: 5 }),
        user?.corporate?.canApprove ? corporateService.getPendingApprovals() : Promise.resolve({ data: { bookings: [] } })
      ]);

      setDashboardData(dashboardResponse.data);
      setRecentBookings(bookingsResponse.data.bookings);
      setPendingApprovals(approvalsResponse.data.bookings);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (bookingId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      await corporateService.approveBooking(bookingId, action, { notes });
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Approval action failed:', error);
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
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Corporate Dashboard</h1>
              <p className="text-primary-600 mt-1">Manage your company's travel bookings and approvals</p>
            </div>
            <Button onClick={() => navigate('/trips')}>
              New Booking
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-ocean/10 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-primary-600">Total Employees</p>
                <p className="text-2xl font-bold text-primary-900">{dashboardData?.stats?.totalEmployees || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald/10 rounded-lg">
                <span className="text-2xl">✈️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-primary-600">Active Bookings</p>
                <p className="text-2xl font-bold text-primary-900">{dashboardData?.stats?.activeBookings || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-premium/10 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-primary-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-primary-900">{dashboardData?.stats?.pendingApprovals || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-primary-600">Monthly Spend</p>
                <p className="text-2xl font-bold text-primary-900">${dashboardData?.stats?.monthlySpend?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-900">Recent Bookings</h2>
              <Button variant="outline" onClick={() => navigate('/corporate/bookings')}>
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking._id} className="border border-primary-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-primary-900">{booking.bookingReference}</h3>
                        <p className="text-sm text-primary-600">
                          {booking.bookedBy.profile.firstName} {booking.bookedBy.profile.lastName} • {booking.corporate.department}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald/10 text-emerald' :
                        booking.status === 'pending-approval' ? 'bg-amber-premium/10 text-amber-premium' :
                        booking.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-primary-100 text-primary-600'
                      }`}>
                        {booking.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary-600">
                        {new Date(booking.travelDates.departure).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-primary-900">
                        ${booking.pricing.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-primary-600 text-center py-8">No recent bookings</p>
              )}
            </div>
          </Card>

          {/* Pending Approvals */}
          {user?.corporate?.canApprove && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary-900">Pending Approvals</h2>
                <Button variant="outline" onClick={() => navigate('/corporate/approvals')}>
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.slice(0, 3).map((booking) => (
                    <div key={booking._id} className="border border-primary-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-primary-900">{booking.bookingReference}</h3>
                          <p className="text-sm text-primary-600">
                            {booking.bookedBy.profile.firstName} {booking.bookedBy.profile.lastName}
                          </p>
                          <p className="text-sm text-primary-600">{booking.corporate.department} • {booking.corporate.purpose}</p>
                        </div>
                        <span className="font-semibold text-primary-900">
                          ${booking.pricing.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproval(booking._id, 'approve')}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApproval(booking._id, 'reject', 'Rejected from dashboard')}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-primary-600 text-center py-8">No pending approvals</p>
                )}
              </div>
            </Card>
          )}

          {/* Department Spending */}
          {!user?.corporate?.canApprove && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Department Spending</h2>
              
              <div className="space-y-4">
                {dashboardData?.departmentSpending?.slice(0, 5).map((dept: any) => (
                  <div key={dept._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary-900">{dept._id}</p>
                      <p className="text-sm text-primary-600">{dept.bookingCount} bookings</p>
                    </div>
                    <span className="font-semibold text-primary-900">
                      ${dept.totalSpent.toLocaleString()}
                    </span>
                  </div>
                )) || (
                  <p className="text-primary-600 text-center py-8">No spending data available</p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/trips')}
              className="p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">✈️</span>
              <span>Book Travel</span>
            </Button>
            
            {user?.corporate?.canApprove && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/corporate/approvals')}
                className="p-4 h-auto flex flex-col items-center"
              >
                <span className="text-2xl mb-2">✅</span>
                <span>Review Approvals</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/corporate/reports')}
              className="p-4 h-auto flex flex-col items-center"
            >
              <span className="text-2xl mb-2">📊</span>
              <span>View Reports</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CorporateDashboardPage;