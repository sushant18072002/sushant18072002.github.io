import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Hotel {
  _id: string;
  name: string;
  location: {
    address: {
      city: string;
      country: string;
    };
  };
  starRating: number;
  pricing: {
    priceRange: {
      min: number;
    };
  };
  status: string;
}

interface HotelManagementProps {
  onCreateHotel: () => void;
}

const HotelManagement: React.FC<HotelManagementProps> = ({ onCreateHotel }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/hotels/search?limit=50');
      if (response.success && response.data) {
        setHotels(response.data.hotels || response.data);
      }
    } catch (err: any) {
      setError('Failed to load hotels. Please try again.');
      console.error('Hotel fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    
    try {
      await apiService.delete(`/admin/hotels/${id}`);
      setHotels(hotels.filter(hotel => hotel._id !== id));
    } catch (err: any) {
      alert('Failed to delete hotel. Please try again.');
      console.error('Hotel delete error:', err);
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
        <h2 className="text-2xl font-bold text-primary-900">Hotel Management</h2>
        <Button onClick={onCreateHotel}>Add Hotel</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600 mb-6">Add your first hotel to get started</p>
          <Button onClick={onCreateHotel}>Add Hotel</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4">Hotel</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Price/Night</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map(hotel => (
                <tr key={hotel._id} className="border-b border-primary-100">
                  <td className="py-3 px-4 font-semibold">{hotel.name}</td>
                  <td className="py-3 px-4">
                    {hotel.location?.address?.city}, {hotel.location?.address?.country}
                  </td>
                  <td className="py-3 px-4">⭐ {hotel.starRating || 0}</td>
                  <td className="py-3 px-4 font-bold text-emerald">
                    ${hotel.pricing?.priceRange?.min || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      hotel.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                    }`}>
                      {hotel.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(hotel._id)}
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

export default HotelManagement;