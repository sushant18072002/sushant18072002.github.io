import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string | { name: string; code: string };
  flightCategory?: string;
  flightType?: string;
  featured?: boolean;
  aircraft?: { type: string; model: string; registration: string };
  route: {
    departure: { airport: string | { name: string; code: string }; scheduledTime: string };
    arrival: { airport: string | { name: string; code: string }; scheduledTime: string };
  };
  duration?: { scheduled: number };
  distance?: number;
  pricing: {
    economy: { totalPrice: number };
    premiumEconomy?: { totalPrice: number };
    business?: { totalPrice: number };
    first?: { totalPrice: number };
  };
  operatingDays?: number[];
  validFrom?: string;
  validTo?: string;
  services?: {
    wifi?: { available: boolean; price?: number };
    meals?: any[];
    entertainment?: any[];
    powerOutlets?: { available: boolean };
  };
  status: string;
}

const FlightManagement: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const [flightsRes, airlinesRes, airportsRes] = await Promise.all([
        apiService.get('/admin/flights'),
        apiService.get('/master/airlines'),
        apiService.get('/master/airports')
      ]);
      
      if (flightsRes.success) setFlights(flightsRes.data.flights || []);
      if (airlinesRes.success) setAirlines(airlinesRes.data.airlines || []);
      if (airportsRes.success) setAirports(airportsRes.data.airports || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const operatingDays = formData.getAll('operatingDays').map(day => parseInt(day as string));
    
    // Handle image uploads
    const images = [];
    const aircraftImage = formData.get('aircraftImage') as File;
    const cabinImage = formData.get('cabinImage') as File;
    
    if (aircraftImage && aircraftImage.size > 0) {
      images.push({
        url: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop`,
        alt: 'Aircraft Image',
        category: 'aircraft',
        isPrimary: true
      });
    }
    
    if (cabinImage && cabinImage.size > 0) {
      images.push({
        url: `https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop`,
        alt: 'Cabin Image',
        category: 'cabin',
        isPrimary: false
      });
    }
    
    const flightData = {
      flightNumber: formData.get('flightNumber'),
      airline: formData.get('airline'),
      flightCategory: formData.get('flightCategory') || 'domestic',
      flightType: formData.get('flightType') || 'direct',
      featured: formData.get('featured') === 'on',
      aircraft: {
        type: formData.get('aircraftType'),
        model: formData.get('aircraftModel'),
        registration: formData.get('registration')
      },
      route: {
        departure: {
          airport: formData.get('departureAirport'),
          scheduledTime: formData.get('departureTime')
        },
        arrival: {
          airport: formData.get('arrivalAirport'),
          scheduledTime: formData.get('arrivalTime')
        }
      },
      duration: {
        scheduled: parseInt(formData.get('duration') as string) || 0
      },
      distance: parseInt(formData.get('distance') as string) || 0,
      pricing: {
        economy: {
          basePrice: parseFloat(formData.get('economyPrice') as string) || 0,
          totalPrice: parseFloat(formData.get('economyPrice') as string) || 0,
          availability: 150
        },
        premiumEconomy: {
          basePrice: parseFloat(formData.get('premiumEconomyPrice') as string) || 0,
          totalPrice: parseFloat(formData.get('premiumEconomyPrice') as string) || 0,
          availability: 50
        },
        business: {
          basePrice: parseFloat(formData.get('businessPrice') as string) || 0,
          totalPrice: parseFloat(formData.get('businessPrice') as string) || 0,
          availability: 30
        },
        first: {
          basePrice: parseFloat(formData.get('firstPrice') as string) || 0,
          totalPrice: parseFloat(formData.get('firstPrice') as string) || 0,
          availability: 12
        }
      },
      operatingDays: operatingDays,
      validFrom: formData.get('validFrom') ? new Date(formData.get('validFrom') as string) : new Date(),
      validTo: formData.get('validTo') ? new Date(formData.get('validTo') as string) : null,
      services: {
        wifi: {
          available: formData.get('wifiAvailable') === 'on',
          price: parseFloat(formData.get('wifiPrice') as string) || 0
        },
        powerOutlets: {
          available: formData.get('powerOutlets') === 'on'
        }
      },
      images: images,
      status: formData.get('status') || 'scheduled'
    };

    try {
      const { apiService } = await import('@/services/api');
      const response = editingFlight
        ? await apiService.put(`/admin/flights/${editingFlight._id}`, flightData)
        : await apiService.post('/admin/flights', flightData);
      
      if (response.success) {
        await loadData();
        setShowForm(false);
        setEditingFlight(null);
        alert(`Flight ${editingFlight ? 'updated' : 'created'} successfully! ✓`);
      }
    } catch (error) {
      alert('Failed to save flight: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary-900">Flight Management</h3>
        <Button onClick={() => setShowForm(true)}>+ Add Flight</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Flight</th>
              <th className="text-left py-3 px-4 font-semibold">Route</th>
              <th className="text-left py-3 px-4 font-semibold">Schedule</th>
              <th className="text-left py-3 px-4 font-semibold">Price</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(flight => (
              <tr key={flight._id} className="border-b border-primary-100">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-semibold">{flight.flightNumber}</div>
                    <div className="text-sm text-primary-600">{flight.airline?.name}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{flight.route?.departure?.airport?.code} → {flight.route?.arrival?.airport?.code}</div>
                    <div className="text-primary-600">{flight.route?.departure?.airport?.name}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{new Date(flight.route?.departure?.scheduledTime).toLocaleString()}</div>
                    <div className="text-primary-600">{new Date(flight.route?.arrival?.scheduledTime).toLocaleString()}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold">${flight.pricing?.economy?.totalPrice}</div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    flight.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    flight.status === 'delayed' ? 'bg-yellow-100 text-yellow-700' :
                    flight.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {flight.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingFlight(flight);
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
          <Card className="p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold text-primary-900 mb-4">
              {editingFlight ? 'Edit Flight' : 'Add New Flight'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Flight Number *</label>
                  <input 
                    name="flightNumber" 
                    type="text" 
                    required 
                    defaultValue={editingFlight?.flightNumber}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    placeholder="AA123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Airline *</label>
                  <select 
                    name="airline" 
                    required 
                    defaultValue={editingFlight?.airline || ''}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md"
                  >
                    <option value="">Select Airline</option>
                    {airlines.map(airline => (
                      <option key={airline._id} value={airline._id}>
                        {airline.code} - {airline.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Flight Classification */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Category</label>
                  <select name="flightCategory" defaultValue={editingFlight?.flightCategory || 'domestic'} className="w-full px-3 py-2 border border-primary-300 rounded-md">
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                    <option value="charter">Charter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Type</label>
                  <select name="flightType" defaultValue={editingFlight?.flightType || 'direct'} className="w-full px-3 py-2 border border-primary-300 rounded-md">
                    <option value="direct">Direct</option>
                    <option value="connecting">Connecting</option>
                    <option value="codeshare">Codeshare</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input type="checkbox" name="featured" defaultChecked={editingFlight?.featured || false} className="mr-2" />
                    <span className="text-sm font-medium text-primary-700">⭐ Featured</span>
                  </label>
                </div>
              </div>
              
              {/* Aircraft Info */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Aircraft Information</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Type</label>
                    <input name="aircraftType" type="text" defaultValue={editingFlight?.aircraft?.type || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="Boeing 737" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Model</label>
                    <input name="aircraftModel" type="text" defaultValue={editingFlight?.aircraft?.model || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="737-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Registration</label>
                    <input name="registration" type="text" defaultValue={editingFlight?.aircraft?.registration || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="N12345" />
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Route Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Departure Airport *</label>
                    <select 
                      name="departureAirport" 
                      required 
                      defaultValue={editingFlight?.route?.departure?.airport || ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md"
                    >
                      <option value="">Select Airport</option>
                      {airports.map(airport => (
                        <option key={airport._id} value={airport._id}>
                          {airport.code} - {airport.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Arrival Airport *</label>
                    <select 
                      name="arrivalAirport" 
                      required 
                      defaultValue={editingFlight?.route?.arrival?.airport || ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md"
                    >
                      <option value="">Select Airport</option>
                      {airports.map(airport => (
                        <option key={airport._id} value={airport._id}>
                          {airport.code} - {airport.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Departure Time *</label>
                    <input 
                      name="departureTime" 
                      type="datetime-local" 
                      required 
                      defaultValue={editingFlight?.route?.departure?.scheduledTime ? new Date(editingFlight.route.departure.scheduledTime).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Arrival Time *</label>
                    <input 
                      name="arrivalTime" 
                      type="datetime-local" 
                      required 
                      defaultValue={editingFlight?.route?.arrival?.scheduledTime ? new Date(editingFlight.route.arrival.scheduledTime).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Pricing by Class</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Economy ($)</label>
                    <input name="economyPrice" type="number" min="0" step="0.01" defaultValue={editingFlight?.pricing?.economy?.totalPrice || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="299" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Premium Economy ($)</label>
                    <input name="premiumEconomyPrice" type="number" min="0" step="0.01" defaultValue={editingFlight?.pricing?.premiumEconomy?.totalPrice || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="599" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Business ($)</label>
                    <input name="businessPrice" type="number" min="0" step="0.01" defaultValue={editingFlight?.pricing?.business?.totalPrice || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="899" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">First Class ($)</label>
                    <input name="firstPrice" type="number" min="0" step="0.01" defaultValue={editingFlight?.pricing?.first?.totalPrice || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="1999" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Duration (minutes)</label>
                    <input name="duration" type="number" min="0" defaultValue={editingFlight?.duration?.scheduled || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="180" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Distance (km)</label>
                    <input name="distance" type="number" min="0" defaultValue={editingFlight?.distance || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="1500" />
                  </div>
                </div>
              </div>
              
              {/* Operating Schedule */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Operating Schedule</h5>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Valid From</label>
                    <input 
                      name="validFrom" 
                      type="date" 
                      defaultValue={editingFlight ? new Date(editingFlight.validFrom || Date.now()).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Valid To</label>
                    <input 
                      name="validTo" 
                      type="date" 
                      defaultValue={editingFlight?.validTo ? new Date(editingFlight.validTo).toISOString().split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Operating Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={day} className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="operatingDays" 
                          value={index} 
                          defaultChecked={editingFlight?.operatingDays?.includes(index) || false}
                          className="mr-1" 
                        />
                        <span className="text-xs">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Flight Images</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Aircraft Image</label>
                    <input 
                      type="file" 
                      name="aircraftImage" 
                      accept="image/*"
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Cabin Image</label>
                    <input 
                      type="file" 
                      name="cabinImage" 
                      accept="image/*"
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Services */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">In-Flight Services</h5>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-medium text-primary-800 mb-2">WiFi Service</h6>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="wifiAvailable" defaultChecked={editingFlight?.services?.wifi?.available || false} className="mr-2" />
                        <span className="text-sm">WiFi Available</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-1">WiFi Price ($)</label>
                        <input name="wifiPrice" type="number" min="0" step="0.01" defaultValue={editingFlight?.services?.wifi?.price || ''} className="w-full px-3 py-2 border border-primary-300 rounded-md" placeholder="15" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-primary-800 mb-2">Other Services</h6>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="mealsIncluded" defaultChecked={editingFlight?.services?.meals?.length > 0 || false} className="mr-2" />
                        <span className="text-sm">Meals Included</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="entertainmentAvailable" defaultChecked={editingFlight?.services?.entertainment?.length > 0 || false} className="mr-2" />
                        <span className="text-sm">Entertainment System</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" name="powerOutlets" defaultChecked={editingFlight?.services?.powerOutlets?.available || false} className="mr-2" />
                        <span className="text-sm">Power Outlets</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingFlight?.status || 'scheduled'}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingFlight(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFlight ? 'Update Flight' : 'Create Flight'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FlightManagement;