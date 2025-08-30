import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Airline {
  _id: string;
  name: string;
  code: string;
  logo?: string;
  country: string;
  active: boolean;
}

const AirlineManagement: React.FC = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    try {
      const { apiService } = await import('@/services/api');
      const response = await apiService.get('/master/airlines');
      if (response.success) {
        setAirlines(response.data.airlines || []);
      }
    } catch (error) {
      console.error('Failed to load airlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const classes = formData.getAll('classes');
    
    const airlineData = {
      name: formData.get('name'),
      code: formData.get('code'),
      icaoCode: formData.get('icaoCode'),
      country: formData.get('country'),
      logo: formData.get('logo'),
      website: formData.get('website'),
      contact: {
        phone: formData.get('phone'),
        email: formData.get('email')
      },
      services: {
        classes: classes
      },
      alliance: formData.get('alliance'),
      status: formData.get('active') === 'on' ? 'active' : 'inactive'
    };

    try {
      const { apiService } = await import('@/services/api');
      const response = editingAirline
        ? await apiService.put(`/master/airlines/${editingAirline._id}`, airlineData)
        : await apiService.post('/master/airlines', airlineData);
      
      if (response.success) {
        await loadAirlines();
        setShowForm(false);
        setEditingAirline(null);
      }
    } catch (error) {
      alert('Failed to save airline');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-primary-900">Airlines</h3>
        <Button onClick={() => setShowForm(true)}>+ Add Airline</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Logo</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Codes</th>
              <th className="text-left py-3 px-4 font-semibold">Country</th>
              <th className="text-left py-3 px-4 font-semibold">Classes</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map(airline => (
              <tr key={airline._id} className="border-b border-primary-100">
                <td className="py-3 px-4">
                  {airline.logo ? (
                    <img src={airline.logo} alt={airline.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center text-xs">
                      {airline.code}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-medium">{airline.name}</td>
                <td className="py-3 px-4">
                  <div className="font-mono text-sm">
                    <div>IATA: {airline.code}</div>
                    {(airline as any).icaoCode && <div className="text-xs text-primary-500">ICAO: {(airline as any).icaoCode}</div>}
                  </div>
                </td>
                <td className="py-3 px-4">{airline.country}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {((airline as any).services?.classes || []).map((cls: string) => (
                      <span key={cls} className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {cls.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    airline.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {airline.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setEditingAirline(airline);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold text-primary-900 mb-4">
              {editingAirline ? 'Edit Airline' : 'Add New Airline'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Name *</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  defaultValue={editingAirline?.name}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">IATA Code *</label>
                  <input 
                    name="code" 
                    type="text" 
                    required 
                    maxLength="2"
                    defaultValue={editingAirline?.code}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md uppercase" 
                    placeholder="AA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">ICAO Code</label>
                  <input 
                    name="icaoCode" 
                    type="text" 
                    maxLength="3"
                    className="w-full px-3 py-2 border border-primary-300 rounded-md uppercase" 
                    placeholder="AAL"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Country *</label>
                <input 
                  name="country" 
                  type="text" 
                  required 
                  defaultValue={editingAirline?.country}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Logo URL</label>
                <input 
                  name="logo" 
                  type="url" 
                  defaultValue={editingAirline?.logo}
                  className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              {/* Contact Information */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Contact Information</h5>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Website</label>
                    <input 
                      name="website" 
                      type="url" 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                      placeholder="https://airline.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Phone</label>
                      <input 
                        name="phone" 
                        type="tel" 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                        placeholder="+1-800-123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        className="w-full px-3 py-2 border border-primary-300 rounded-md" 
                        placeholder="info@airline.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service Classes */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-primary-900 mb-3">Service Classes</h5>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center">
                    <input type="checkbox" name="classes" value="economy" className="mr-2" defaultChecked />
                    <span className="text-sm">Economy</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="classes" value="premium_economy" className="mr-2" />
                    <span className="text-sm">Premium Economy</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="classes" value="business" className="mr-2" />
                    <span className="text-sm">Business</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="classes" value="first" className="mr-2" />
                    <span className="text-sm">First Class</span>
                  </label>
                </div>
              </div>
              
              {/* Alliance */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Alliance</label>
                <select name="alliance" className="w-full px-3 py-2 border border-primary-300 rounded-md">
                  <option value="">No Alliance</option>
                  <option value="Star Alliance">Star Alliance</option>
                  <option value="OneWorld">OneWorld</option>
                  <option value="SkyTeam">SkyTeam</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="active" 
                  defaultChecked={editingAirline?.active ?? true}
                  className="mr-2" 
                />
                <span className="text-sm font-medium text-primary-700">Active</span>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingAirline(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAirline ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AirlineManagement;