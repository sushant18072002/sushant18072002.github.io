import React, { useState, useEffect } from 'react';
import { masterDataService } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const CityManagement: React.FC = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    coordinates: { latitude: 0, longitude: 0 },
    timezone: '',
    description: '',
    popularFor: '',
    bestTimeToVisit: '',
    images: '',
    featured: false,
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [citiesRes, countriesRes] = await Promise.all([
        masterDataService.getAdminCities(),
        masterDataService.getAdminCountries()
      ]);
      setCities(citiesRes.cities || []);
      setCountries(countriesRes.countries || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cityData = {
        ...formData,
        popularFor: formData.popularFor.split(',').map(s => s.trim()).filter(s => s),
        bestTimeToVisit: formData.bestTimeToVisit.split(',').map(s => s.trim()).filter(s => s),
        images: formData.images ? formData.images.split(',').map(s => s.trim()).filter(s => s) : []
      };

      if (editingCity) {
        await masterDataService.updateCity(editingCity._id, cityData);
      } else {
        await masterDataService.createCity(cityData);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save city:', error);
      alert('Failed to save city');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      coordinates: { latitude: 0, longitude: 0 },
      timezone: '',
      description: '',
      popularFor: '',
      bestTimeToVisit: '',
      images: '',
      featured: false,
      status: 'active'
    });
    setEditingCity(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary-900">Cities</h3>
          <p className="text-primary-600">Manage city master data</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add City</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-primary-900">
              {editingCity ? 'Edit City' : 'Add New City'}
            </h4>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">City Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country._id} value={country._id}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.latitude}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, latitude: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.coordinates.longitude}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, longitude: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="America/New_York"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-primary-900 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Popular For (comma separated)</label>
              <input
                type="text"
                value={formData.popularFor}
                onChange={(e) => setFormData(prev => ({ ...prev, popularFor: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="beaches, nightlife, culture"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Best Time to Visit (comma separated)</label>
              <input
                type="text"
                value={formData.bestTimeToVisit}
                onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToVisit: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="March, April, May"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Images (comma separated URLs)</label>
              <input
                type="text"
                value={formData.images || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Featured</label>
              <select
                value={formData.featured ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                {editingCity ? 'Update City' : 'Create City'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-200">
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Popular For</th>
                  <th className="text-left py-3 px-4">Featured</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map(city => (
                  <tr key={city._id} className="border-b border-primary-100">
                    <td className="py-3 px-4 font-semibold">{city.name}</td>
                    <td className="py-3 px-4">{city.country?.flag} {city.country?.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {city.popularFor?.slice(0, 2).join(', ')}
                      {city.popularFor?.length > 2 && '...'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        city.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {city.featured ? '⭐ FEATURED' : 'REGULAR'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        city.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {city.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingCity(city);
                          setFormData({
                            name: city.name,
                            country: city.country?._id || '',
                            coordinates: city.coordinates || { latitude: 0, longitude: 0 },
                            timezone: city.timezone || '',
                            description: city.description || '',
                            popularFor: city.popularFor?.join(', ') || '',
                            bestTimeToVisit: city.bestTimeToVisit?.join(', ') || '',
                            images: city.images?.join(', ') || '',
                            featured: city.featured || false,
                            status: city.status
                          });
                          setShowForm(true);
                        }}>
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cities.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏙️</div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">No cities found</h3>
                <p className="text-primary-600 mb-4">Add your first city to get started</p>
                <Button onClick={() => setShowForm(true)}>Add City</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CityManagement;