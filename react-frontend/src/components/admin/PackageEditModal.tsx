import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/common/Button';
import { apiService } from '@/services/api';

interface PackageEditModalProps {
  packageId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface PackageFormData {
  title: string;
  description: string;
  destinations: string;
  duration: number;
  price: number;
  currency: string;
  category: string;
  highlights: string;
  includes: string;
  excludes: string;
  featured: boolean;
  status: string;
}

const PackageEditModal: React.FC<PackageEditModalProps> = ({ 
  packageId, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm<PackageFormData>();

  useEffect(() => {
    if (isOpen && packageId) {
      loadPackageData();
    }
  }, [isOpen, packageId]);

  const loadPackageData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/admin/packages/${packageId}`);
      if (response.success && response.data) {
        const pkg = response.data.package || response.data;
        form.reset({
          title: pkg.title || '',
          description: pkg.description || '',
          destinations: Array.isArray(pkg.destinations) ? pkg.destinations.join(', ') : pkg.destinations || '',
          duration: pkg.duration || 0,
          price: pkg.price?.amount || pkg.price || 0,
          currency: pkg.price?.currency || 'USD',
          category: pkg.category || '',
          highlights: Array.isArray(pkg.highlights) ? pkg.highlights.join(', ') : pkg.highlights || '',
          includes: Array.isArray(pkg.includes) ? pkg.includes.join(', ') : pkg.includes || '',
          excludes: Array.isArray(pkg.excludes) ? pkg.excludes.join(', ') : pkg.excludes || '',
          featured: pkg.featured || false,
          status: pkg.status || 'active'
        });
      }
    } catch (error) {
      console.error('Failed to load package:', error);
      alert('Failed to load package data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: PackageFormData) => {
    setSaving(true);
    try {
      const updateData = {
        title: data.title,
        description: data.description,
        destinations: data.destinations.split(',').map(d => d.trim()).filter(d => d),
        duration: parseInt(data.duration.toString()),
        price: {
          amount: parseFloat(data.price.toString()),
          currency: data.currency || 'USD'
        },
        category: data.category,
        highlights: data.highlights ? data.highlights.split(',').map(h => h.trim()).filter(h => h) : [],
        includes: data.includes ? data.includes.split(',').map(i => i.trim()).filter(i => i) : [],
        excludes: data.excludes ? data.excludes.split(',').map(e => e.trim()).filter(e => e) : [],
        featured: data.featured,
        status: data.status
      };

      const response = await apiService.put(`/admin/packages/${packageId}`, updateData);
      
      if (response.success) {
        alert('Package updated successfully!');
        onSave();
        onClose();
      } else {
        alert('Failed to update package: ' + (response.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update package. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary-900">Edit Package</h2>
            <button onClick={onClose} className="text-2xl text-primary-400 hover:text-primary-600">×</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-ocean"></div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Package Title *</label>
                  <input 
                    {...form.register('title', { required: 'Title is required' })} 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Category</label>
                  <select {...form.register('category')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                    <option value="">Select Category</option>
                    <option value="adventure">Adventure</option>
                    <option value="luxury">Luxury</option>
                    <option value="cultural">Cultural</option>
                    <option value="beach">Beach</option>
                    <option value="family">Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Description</label>
                <textarea 
                  {...form.register('description')} 
                  rows={3} 
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Destinations *</label>
                  <input 
                    {...form.register('destinations', { required: 'Destinations required' })} 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                    placeholder="Bali, Ubud, Seminyak"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (days) *</label>
                  <input 
                    {...form.register('duration', { required: 'Duration required' })} 
                    type="number" 
                    min="1" 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Price *</label>
                  <input 
                    {...form.register('price', { required: 'Price required' })} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Currency</label>
                  <select {...form.register('currency')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Highlights</label>
                  <input 
                    {...form.register('highlights')} 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                    placeholder="5-star resorts, Private villa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Includes</label>
                  <input 
                    {...form.register('includes')} 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                    placeholder="Flights, Hotels, Meals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Excludes</label>
                  <input 
                    {...form.register('excludes')} 
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                    placeholder="Travel Insurance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
                  <select {...form.register('status')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      {...form.register('featured')} 
                      className="mr-2"
                    />
                    <span className="text-sm font-semibold text-primary-900">Featured Package</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageEditModal;