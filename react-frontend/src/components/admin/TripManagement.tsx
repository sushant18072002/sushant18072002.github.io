import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TripCard from './TripCard';

interface Trip {
  _id: string;
  title: string;
  slug: string;
  description: string;
  primaryDestination: { name: string };
  category: { name: string; icon: string };
  duration: { days: number; nights: number };
  pricing: { estimated: number; currency: string };
  type: string;
  status: string;
  featured: boolean;
  stats: { views: number; bookings: number };
  createdAt: string;
}

interface TripManagementProps {
  onCreateTrip: () => void;
  onEditTrip: (tripId: string) => void;
}

const TripManagement: React.FC<TripManagementProps> = ({ onCreateTrip, onEditTrip }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });

  useEffect(() => {
    loadTrips();
  }, [filters]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);

      const response = await apiService.get(`/admin/trips?${params.toString()}`);
      if (response.success) {
        setTrips(response.data.trips || []);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (tripId: string, currentFeatured: boolean) => {
    try {
      const response = await apiService.put(`/admin/trips/${tripId}/featured`);
      if (response.success) {
        setTrips(trips.map(trip => 
          trip._id === tripId ? { ...trip, featured: !currentFeatured } : trip
        ));
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      alert('Failed to update trip');
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to archive this trip?')) return;
    
    try {
      const response = await apiService.delete(`/admin/trips/${tripId}`);
      if (response.success) {
        loadTrips(); // Reload trips
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip');
    }
  };

  const duplicateTrip = async (tripId: string) => {
    try {
      const response = await apiService.post(`/admin/trips/${tripId}/duplicate`);
      if (response.success) {
        loadTrips(); // Reload trips
        alert('Trip duplicated successfully!');
      }
    } catch (error) {
      console.error('Failed to duplicate trip:', error);
      alert('Failed to duplicate trip');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary-900">Trip Management</h2>
          <p className="text-primary-600">Manage all travel trips and experiences</p>
        </div>
        <Button onClick={onCreateTrip}>
          + Create New Trip
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search trips..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="featured">Featured</option>
              <option value="ai-generated">AI Generated</option>
              <option value="custom">Custom</option>
              <option value="user-created">User Created</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={loadTrips} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Trips List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map(trip => (
            <TripCard
              key={trip._id}
              trip={trip}
              onEdit={onEditTrip}
              onToggleFeatured={toggleFeatured}
              onDuplicate={duplicateTrip}
              onDelete={deleteTrip}
            />
          ))}
        </div>
      )}

      {trips.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🧳</div>
          <h3 className="text-xl font-semibold text-primary-900 mb-2">No trips found</h3>
          <p className="text-primary-600 mb-4">Create your first trip to get started</p>
          <Button onClick={onCreateTrip}>Create New Trip</Button>
        </Card>
      )}
    </div>
  );
};

export default TripManagement;