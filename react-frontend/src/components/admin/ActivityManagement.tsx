import React, { useState, useEffect } from 'react';
import { masterDataService } from '@/services/masterData.service';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ActivityManagement: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    duration: 2,
    difficulty: 'easy',
    groupSize: { min: 1, max: 10 },
    pricing: { currency: 'USD', adult: 50, child: 25, group: 200 },
    includes: '',
    excludes: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesRes, categoriesRes, citiesRes] = await Promise.all([
        masterDataService.getAdminActivities(),
        masterDataService.getAdminCategories(),
        masterDataService.getAdminCities()
      ]);
      setActivities(activitiesRes.activities || []);
      setCategories(categoriesRes.categories || []);
      setCities(citiesRes.cities || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        includes: formData.includes.split(',').map(s => s.trim()).filter(s => s),
        excludes: formData.excludes.split(',').map(s => s.trim()).filter(s => s)
      };

      if (editingActivity) {
        await masterDataService.updateActivity(editingActivity._id, activityData);
      } else {
        await masterDataService.createActivity(activityData);
      }
      loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Failed to save activity');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      city: '',
      duration: 2,
      difficulty: 'easy',
      groupSize: { min: 1, max: 10 },
      pricing: { currency: 'USD', adult: 50, child: 25, group: 200 },
      includes: '',
      excludes: '',
      status: 'active'
    });
    setEditingActivity(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary-900">Activities</h3>
          <p className="text-primary-600">Manage activity master data</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Activity</Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-primary-900">
              {editingActivity ? 'Edit Activity' : 'Add New Activity'}
            </h4>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Activity Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                required
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city._id} value={city._id}>
                    {city.name}, {city.country?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (hours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Min Group Size</label>
                <input
                  type="number"
                  value={formData.groupSize.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    groupSize: { ...prev.groupSize, min: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Max Group Size</label>
                <input
                  type="number"
                  value={formData.groupSize.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    groupSize: { ...prev.groupSize, max: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Adult Price</label>
                <input
                  type="number"
                  value={formData.pricing.adult}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, adult: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Child Price</label>
                <input
                  type="number"
                  value={formData.pricing.child}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, child: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Group Price</label>
                <input
                  type="number"
                  value={formData.pricing.group}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    pricing: { ...prev.pricing, group: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Includes (comma separated)</label>
              <input
                type="text"
                value={formData.includes}
                onChange={(e) => setFormData(prev => ({ ...prev, includes: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="guide, equipment, lunch"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Excludes (comma separated)</label>
              <input
                type="text"
                value={formData.excludes}
                onChange={(e) => setFormData(prev => ({ ...prev, excludes: e.target.value }))}
                className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                placeholder="transport, insurance"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                {editingActivity ? 'Update Activity' : 'Create Activity'}
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
                  <th className="text-left py-3 px-4">Activity</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(activity => (
                  <tr key={activity._id} className="border-b border-primary-100">
                    <td className="py-3 px-4 font-semibold">{activity.name}</td>
                    <td className="py-3 px-4">{activity.category?.icon} {activity.category?.name}</td>
                    <td className="py-3 px-4">{activity.city?.name}</td>
                    <td className="py-3 px-4">{activity.duration?.typical || activity.duration}h</td>
                    <td className="py-3 px-4">${activity.pricing?.adult}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        activity.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-100 text-red-700'
                      }`}>
                        {activity.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingActivity(activity);
                        setFormData({
                          name: activity.name,
                          description: activity.description || '',
                          category: activity.category?._id || '',
                          city: activity.city?._id || '',
                          duration: activity.duration?.typical || activity.duration || 2,
                          difficulty: activity.difficulty || 'easy',
                          groupSize: activity.groupSize || { min: 1, max: 10 },
                          pricing: activity.pricing || { currency: 'USD', adult: 50, child: 25, group: 200 },
                          includes: activity.includes?.join(', ') || '',
                          excludes: activity.excludes?.join(', ') || '',
                          status: activity.status
                        });
                        setShowForm(true);
                      }}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {activities.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-primary-900 mb-2">No activities found</h3>
                <p className="text-primary-600 mb-4">Add your first activity to get started</p>
                <Button onClick={() => setShowForm(true)}>Add Activity</Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityManagement;