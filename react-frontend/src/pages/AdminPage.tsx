import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
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
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import FlightManagement from '@/components/admin/FlightManagement';
import UserManagement from '@/components/admin/UserManagement';
import HotelManagement from '@/components/admin/HotelManagement';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editPackageId, setEditPackageId] = useState<string | null>(null);
  const [contentModalType, setContentModalType] = useState<'flight' | 'hotel' | 'package'>('flight');
  const [tripData, setTripData] = useState<any>(null);

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
    setTimeout(() => setLoading(false), 1000);
  }, [isAuthenticated, user]);

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
                  { id: 'bookings', label: 'Bookings', icon: '📋' },
                  { id: 'blog', label: 'Blog', icon: '📝' },
                  { id: 'analytics', label: 'Analytics', icon: '📈' }
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
                    <div className="text-3xl font-bold text-blue-ocean mb-2">1,247</div>
                    <div className="text-sm text-primary-600">Total Bookings</div>
                    <div className="text-xs text-emerald mt-1">+16% this month</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-emerald mb-2">$284K</div>
                    <div className="text-sm text-primary-600">Total Revenue</div>
                    <div className="text-xs text-emerald mt-1">+12% this month</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-amber-premium mb-2">892</div>
                    <div className="text-sm text-primary-600">Active Users</div>
                    <div className="text-xs text-blue-ocean mt-1">Last 30 days</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">4.7</div>
                    <div className="text-sm text-primary-600">Avg Rating</div>
                    <div className="text-xs text-amber-500 mt-1">⭐⭐⭐⭐⭐</div>
                  </Card>
                </div>
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

            {activeTab === 'bookings' && <BookingManagement />}

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
    </div>
  );
};

export default AdminPage;