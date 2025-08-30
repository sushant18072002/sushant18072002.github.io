import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import EnhancedHotelForm from './EnhancedHotelForm';

const HotelManagement: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/hotels');
      const data = await response.json();
      if (data.success) {
        setHotels(data.data.hotels || []);
      }
    } catch (error) {
      console.error('Failed to load hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Hotel Management</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Hotel</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">Loading hotels...</div>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="text-left py-3 px-4">Hotel</th>
                  <th className="text-left py-3 px-4">Rating</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Price Range</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map(hotel => (
                  <tr key={hotel._id} className="border-b border-primary-100">
                    <td className="py-3 px-4">
                      <div className="font-semibold">{hotel.name}</div>
                      <div className="text-sm text-primary-600">{hotel.description?.substring(0, 50)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-500">{'⭐'.repeat(hotel.starRating || 0)}</span>
                        <span className="ml-1 text-sm">({hotel.starRating})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{hotel.location?.address?.area}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        ${hotel.pricing?.priceRange?.min} - ${hotel.pricing?.priceRange?.max}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        hotel.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {hotel.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingHotel(hotel);
                        setShowForm(true);
                      }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hotels.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">No hotels found</h3>
                <p className="text-primary-600 mb-4">Add your first hotel to get started</p>
                <Button onClick={() => setShowForm(true)}>Add Hotel</Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Enhanced Hotel Form Modal */}
      {showForm && (
        <EnhancedHotelForm
          editingHotel={editingHotel}
          onSave={async (hotelData) => {
            try {
              const response = await fetch(`http://localhost:3000/api/hotels${editingHotel ? `/${editingHotel._id}` : ''}`, {
                method: editingHotel ? 'PUT' : 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(hotelData)
              });
              
              const result = await response.json();
              if (result.success) {
                loadHotels();
                setShowForm(false);
                setEditingHotel(null);
                alert('Hotel saved successfully!');
              } else {
                alert('Failed to save hotel: ' + result.error?.message);
              }
            } catch (error) {
              console.error('Failed to save hotel:', error);
              alert('Failed to save hotel');
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingHotel(null);
          }}
        />
      )}
    </div>
  );
};

export default HotelManagement;