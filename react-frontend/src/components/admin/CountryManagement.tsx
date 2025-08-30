import React, { useState, useEffect } from 'react';
import { masterDataService } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface Country {
  _id: string;
  name: string;
  code: string;
  code3: string;
  currency: string;
  timezone: string;
  continent: string;
  flag: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const CountryManagement: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    code3: '',
    currency: '',
    timezone: '',
    continent: '',
    flag: '',
    status: 'active'
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setLoading(true);
    try {
      const response = await masterDataService.getAdminCountries();
      setCountries(response.countries || []);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await masterDataService.updateCountry(editingCountry._id, formData);
      } else {
        await masterDataService.createCountry(formData);
      }
      loadCountries();
      resetForm();
    } catch (error) {
      console.error('Failed to save country:', error);
      alert('Failed to save country');
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      code3: country.code3,
      currency: country.currency,
      timezone: country.timezone,
      continent: country.continent,
      flag: country.flag,
      status: country.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country?')) return;
    
    try {
      await masterDataService.deleteCountry(id);
      loadCountries();
    } catch (error) {
      console.error('Failed to delete country:', error);
      alert('Failed to delete country');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      code3: '',
      currency: '',
      timezone: '',
      continent: '',
      flag: '',
      status: 'active'
    });
    setEditingCountry(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary-900">Countries</h3>
          <p className="text-primary-600">Manage country master data</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Country
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-primary-900">
              {editingCountry ? 'Edit Country' : 'Add New Country'}
            </h4>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Country Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Country Code (2-letter)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                maxLength={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Country Code (3-letter)</label>
              <input
                type="text"
                value={formData.code3}
                onChange={(e) => setFormData(prev => ({ ...prev, code3: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                maxLength={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="USD"
                required
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
              <label className="block text-sm font-semibold text-primary-900 mb-2">Continent</label>
              <select
                value={formData.continent}
                onChange={(e) => setFormData(prev => ({ ...prev, continent: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              >
                <option value="">Select Continent</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
                <option value="Antarctica">Antarctica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Flag Emoji</label>
              <input
                type="text"
                value={formData.flag}
                onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="🇺🇸"
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
              <Button type="submit" className="w-full">
                {editingCountry ? 'Update Country' : 'Create Country'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Countries List */}
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
                  <th className="text-left py-3 px-4">Flag</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Currency</th>
                  <th className="text-left py-3 px-4">Continent</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map(country => (
                  <tr key={country._id} className="border-b border-primary-100">
                    <td className="py-3 px-4 text-2xl">{country.flag || '🌍'}</td>
                    <td className="py-3 px-4 font-semibold">{country.name}</td>
                    <td className="py-3 px-4">{country.code} / {country.code3}</td>
                    <td className="py-3 px-4">{country.currency}</td>
                    <td className="py-3 px-4">{country.continent}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        country.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {country.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(country)}>
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(country._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {countries.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">No countries found</h3>
                <p className="text-primary-600 mb-4">Add your first country to get started</p>
                <Button onClick={() => setShowForm(true)}>Add Country</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CountryManagement;