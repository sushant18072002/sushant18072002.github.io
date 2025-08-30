import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Trip {
  _id: string;
  title: string;
  destination: string;
  destinations: string[];
  duration: {
    days: number;
    nights: number;
  };
  pricing: {
    estimated: number;
    currency: string;
  };
  status: string;
  category: {
    name: string;
    icon: string;
  };
  type: string;
  featured: boolean;
}

interface TripManagementProps {
  onCreateTrip: () => void;
}

const TripManagement: React.FC<TripManagementProps> = ({ onCreateTrip }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/trips');
      if (response.success && response.data) {
        setTrips(response.data.trips || response.data);
      }
    } catch (err: any) {
      setError('Failed to load trips. Please try again.');
      console.error('Trip fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await apiService.delete(`/admin/trips/${id}`);
      setTrips(trips.filter(trip => trip._id !== id));
    } catch (err: any) {
      alert('Failed to delete trip. Please try again.');
      console.error('Trip delete error:', err);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-900">Trip Management</h2>
        <Button onClick={onCreateTrip}>Add Trip</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {packages.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600 mb-6">Create your first travel trip to get started</p>
          <Button onClick={onCreateTrip}>Create Trip</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4">Trip</th>
                <th className="text-left py-3 px-4">Destination</th>
                <th className="text-left py-3 px-4">Duration</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip._id} className="border-b border-primary-100">
                  <td className="py-3 px-4 font-semibold">{trip.title}</td>
                  <td className="py-3 px-4">{trip.destination}</td>
                  <td className="py-3 px-4">{trip.duration?.days || 0} days</td>
                  <td className="py-3 px-4 font-bold text-emerald">
                    {trip.pricing?.currency || '$'}{trip.pricing?.estimated || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trip.status === 'published' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                    }`}>
                      {trip.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(trip._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default TripManagement;