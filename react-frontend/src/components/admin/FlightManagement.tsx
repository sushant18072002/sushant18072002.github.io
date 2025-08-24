import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: {
    name: string;
    code: string;
  };
  route: {
    departure: {
      airport: {
        code: string;
        city: string;
      };
    };
    arrival: {
      airport: {
        code: string;
        city: string;
      };
    };
  };
  pricing: {
    economy: {
      totalPrice: number;
    };
  };
  status: string;
}

interface FlightManagementProps {
  onCreateFlight: () => void;
}

const FlightManagement: React.FC<FlightManagementProps> = ({ onCreateFlight }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/flights/search?limit=50');
      if (response.success && response.data?.flights) {
        setFlights(response.data.flights);
      } else if (response.success && response.data) {
        setFlights(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError('Failed to load flights. Please try again.');
      console.error('Flight fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    
    try {
      await apiService.delete(`/admin/flights/${id}`);
      setFlights(flights.filter(flight => flight._id !== id));
    } catch (err: any) {
      alert('Failed to delete flight. Please try again.');
      console.error('Flight delete error:', err);
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
        <h2 className="text-2xl font-bold text-primary-900">Flight Management</h2>
        <Button onClick={onCreateFlight}>Add Flight</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {flights.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600 mb-6">Add your first flight to get started</p>
          <Button onClick={onCreateFlight}>Add Flight</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4">Flight</th>
                <th className="text-left py-3 px-4">Route</th>
                <th className="text-left py-3 px-4">Airline</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map(flight => (
                <tr key={flight._id} className="border-b border-primary-100">
                  <td className="py-3 px-4 font-mono">{flight.flightNumber}</td>
                  <td className="py-3 px-4">
                    {flight.route?.departure?.airport?.code} → {flight.route?.arrival?.airport?.code}
                  </td>
                  <td className="py-3 px-4">{flight.airline?.name}</td>
                  <td className="py-3 px-4 font-bold text-emerald">
                    ${flight.pricing?.economy?.totalPrice || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      flight.status === 'scheduled' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                    }`}>
                      {flight.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(flight._id)}
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

export default FlightManagement;