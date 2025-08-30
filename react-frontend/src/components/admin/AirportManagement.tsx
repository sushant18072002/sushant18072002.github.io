import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Airport {
  _id: string;
  code: string;
  icaoCode?: string;
  name: string;
  city: string;
  country: string;
  type: string;
  status: string;
}

const AirportManagement: React.FC = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.get('/master/airports');
      if (response.success) {
        setAirports(response.data.airports || []);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const transportationOptions = {
      taxi: formData.get('taxi') === 'on',
      bus: formData.get('bus') === 'on',
      train: formData.get('train') === 'on',
      metro: formData.get('metro') === 'on',
      rental_car: formData.get('rental_car') === 'on'
    };

    const airportData = {
      code: formData.get('code'),
      icaoCode: formData.get('icaoCode'),
      name: formData.get('name'),
      city: formData.get('city'),
      country: formData.get('country'),
      timezone: formData.get('timezone'),
      type: formData.get('type'),
      location: {
        coordinates: {
          coordinates: [
            parseFloat(formData.get('longitude') as string) || 0,
            parseFloat(formData.get('latitude') as string) || 0
          ]
        },
        elevation: parseInt(formData.get('elevation') as string) || 0
      },
      facilities: {
        wifi: formData.get('wifi') === 'on',
        parking: {
          available: formData.get('parking') === 'on',
          capacity: parseInt(formData.get('parkingCapacity') as string) || 0
        },
        transportation: transportationOptions
      },
      statistics: {
        passengers_annual: parseInt(formData.get('passengersAnnual') as string) || 0,
        flights_annual: parseInt(formData.get('flightsAnnual') as string) || 0,
        cargo_annual: parseInt(formData.get('cargoAnnual') as string) || 0
      },
      contact: {
        phone: formData.get('phone'),
        website: formData.get('website'),
        email: formData.get('email')
      },
      status: formData.get('status') || 'active'
    };

    try {
      const { apiService } = await import('@/services/api');
      const response = editingAirport
        ? await apiService.put(`/master/airports/${editingAirport._id}`, airportData)
        : await apiService.post('/master/airports', airportData);
      
      if (response.success) {
        await loadAirports();
        setShowForm(false);
        setEditingAirport(null);
      }
    } catch (error) {
      alert('Failed to save airport');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary-900">Airport Management</h3>
        <Button onClick={() => setShowForm(true)}>+ Add Airport</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Codes</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Location</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {airports.map(airport => (
              <tr key={airport._id} className="border-b border-primary-100">
                <td className="py-3 px-4">
                  <div className="font-mono text-sm">
                    <div>IATA: {airport.code}</div>
                    {airport.icaoCode && <div className="text-xs text-primary-500">ICAO: {airport.icaoCode}</div>}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{airport.name}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{airport.city}</div>
                    <div className="text-primary-600">{airport.country}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                    {airport.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    airport.status === 'active' ? 'bg-green-100 text-green-700' :
                    airport.status === 'under_construction' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {airport.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingAirport(airport);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold text-primary-900 mb-4">
              {editingAirport ? 'Edit Airport' : 'Add New Airport'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h5 className="font-semibold text-primary-900 mb-3">Basic Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">IATA Code *</label>
                    <input 
                      name="code" 
                      type="text" 
                      required 
                      maxLength="3"
                      defaultValue={editingAirport?.code}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md uppercase" 
                      placeholder="JFK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">ICAO Code</label>
                    <input 
                      name="icaoCode" 
                      type="text" 
                      maxLength="4"
                      defaultValue={editingAirport?.icaoCode}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md uppercase" 
                      placeholder="KJFK"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Airport Name *</label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      defaultValue={editingAirport?.name}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="John F. Kennedy International Airport"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">City *</label>
                    <input 
                      name="city" 
                      type="text" 
                      required 
                      defaultValue={editingAirport?.city}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Country *</label>
                    <input 
                      name="country" 
                      type="text" 
                      required 
                      defaultValue={editingAirport?.country}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Timezone</label>
                    <input 
                      name="timezone" 
                      type="text" 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="America/New_York"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Coordinates */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Location & Coordinates</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Longitude</label>
                    <input 
                      name="longitude" 
                      type="number" 
                      step="any"
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="-73.7781"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Latitude</label>
                    <input 
                      name="latitude" 
                      type="number" 
                      step="any"
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="40.6413"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Elevation (m)</label>
                    <input 
                      name="elevation" 
                      type="number" 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="4"
                    />
                  </div>
                </div>
              </div>

              {/* Airport Classification */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Classification</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Airport Type</label>
                    <select name="type" className="w-full px-3 py-2 border border-primary-300 rounded-md">
                      <option value="international">International</option>
                      <option value="domestic">Domestic</option>
                      <option value="regional">Regional</option>
                      <option value="military">Military</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Status</label>
                    <select name="status" className="w-full px-3 py-2 border border-primary-300 rounded-md">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="under_construction">Under Construction</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Facilities & Services</h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-medium text-primary-800 mb-2">General Facilities</h6>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="wifi" className="mr-2" />
                        <span className="text-sm">📶 Free WiFi</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="parking" className="mr-2" />
                        <span className="text-sm">🅿️ Parking Available</span>
                      </label>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-primary-700 mb-1">Parking Capacity</label>
                      <input name="parkingCapacity" type="number" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="5000" />
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-primary-800 mb-2">Transportation</h6>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="taxi" className="mr-2" defaultChecked />
                        <span className="text-sm">🚕 Taxi</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="bus" className="mr-2" />
                        <span className="text-sm">🚌 Bus</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="train" className="mr-2" />
                        <span className="text-sm">🚆 Train</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="metro" className="mr-2" />
                        <span className="text-sm">🚇 Metro</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="rental_car" className="mr-2" />
                        <span className="text-sm">🚗 Car Rental</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Annual Statistics</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Passengers (Annual)</label>
                    <input name="passengersAnnual" type="number" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="50000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Flights (Annual)</label>
                    <input name="flightsAnnual" type="number" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="400000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Cargo (Tons/Year)</label>
                    <input name="cargoAnnual" type="number" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="2000000" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Contact Information</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Phone</label>
                    <input name="phone" type="tel" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="+1-718-244-4444" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Website</label>
                    <input name="website" type="url" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="https://www.jfkairport.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Email</label>
                    <input name="email" type="email" className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="info@jfkairport.com" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingAirport(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAirport ? 'Update Airport' : 'Create Airport'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AirportManagement;