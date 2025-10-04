import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';

interface TripFormData {
  title: string;
  description: string;
  primaryDestination: string;
  duration: number;
  finalPrice: number;
  currency: string;
  category: string;
  travelStyle: string;
  difficulty: string;
  status: string;
}

interface UnifiedPackageFormProps {
  packageId?: string;
  onClose: () => void;
  onSuccess?: (tripId: string) => void;
}

const UnifiedPackageFormSimplified: React.FC<UnifiedPackageFormProps> = ({ 
  packageId, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  
  const isEditMode = !!packageId;
  
  const form = useForm<TripFormData>({
    defaultValues: {
      currency: 'USD',
      status: 'published',
      travelStyle: 'cultural',
      difficulty: 'easy'
    }
  });

  useEffect(() => {
    loadMasterData();
    if (isEditMode && packageId) {
      loadTripData();
    }
  }, [isEditMode, packageId]);

  const loadMasterData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.MASTER_CATEGORIES}?type=trip`),
        apiService.get('/locations/cities?limit=100')
      ]);
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data?.categories || []);
      }
      
      if (citiesRes.success) {
        setCities(citiesRes.data?.cities || []);
      }
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };

  const loadTripData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_ENDPOINTS.TRIPS}/${packageId}`);
      if (response.success && response.data) {
        const trip = response.data.trip || response.data;
        
        form.reset({
          title: trip.title || '',
          description: trip.description || '',
          primaryDestination: trip.primaryDestination?._id || '',
          duration: trip.duration?.days || 5,
          finalPrice: trip.pricing?.finalPrice || trip.pricing?.estimated || 0,
          currency: trip.pricing?.currency || 'USD',
          category: trip.category?._id || '',
          travelStyle: trip.travelStyle || 'cultural',
          difficulty: trip.difficulty || 'easy',
          status: trip.status || 'published'
        });
      }
    } catch (error) {
      console.error('Failed to load trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TripFormData) => {
    setSaving(true);
    try {
      const transformedData = {
        title: data.title,
        description: data.description,
        primaryDestination: data.primaryDestination,
        duration: {
          days: parseInt(data.duration.toString()),
          nights: parseInt(data.duration.toString()) - 1
        },
        pricing: {
          finalPrice: parseFloat(data.finalPrice.toString()),
          estimated: parseFloat(data.finalPrice.toString()),
          currency: data.currency,
          priceRange: parseFloat(data.finalPrice.toString()) < 1000 ? 'budget' : 
                     parseFloat(data.finalPrice.toString()) < 3000 ? 'mid-range' : 'luxury'
        },
        category: data.category,
        travelStyle: data.travelStyle,
        difficulty: data.difficulty,
        status: data.status,
        type: 'custom',
        suitableFor: {
          couples: true,
          families: true,
          soloTravelers: false,
          groups: false
        },
        groupSize: {
          min: 1,
          max: 20,
          recommended: 4
        },
        physicalRequirements: {
          fitnessLevel: data.difficulty === 'challenging' ? 'high' : 
                      data.difficulty === 'moderate' ? 'moderate' : 'low'
        },
        bookingInfo: {
          instantBook: false,
          requiresApproval: true,
          advanceBooking: 7,
          depositRequired: 50,
          finalPaymentDue: 30
        },
        sharing: {
          isPublic: true,
          allowCopy: true,
          allowComments: true
        }
      };

      let response;
      if (isEditMode) {
        response = await apiService.put(`${API_ENDPOINTS.TRIPS}/${packageId}`, transformedData);
      } else {
        response = await apiService.post(API_ENDPOINTS.TRIPS, transformedData);
      }

      if (response.success) {
        const tripId = response.data?.trip?._id || response.data?._id || packageId;
        onSuccess?.(tripId);
        onClose();
      } else {
        throw new Error(response.errors?.[0] || 'Failed to save trip');
      }
    } catch (error) {
      console.error('Failed to save trip:', error);
      alert('Failed to save trip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading trip data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Trip' : 'Create Trip'}
            </h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Title *</label>
                <input 
                  {...form.register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Amazing Bali Adventure"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Destination *</label>
                <select 
                  {...form.register('primaryDestination', { required: 'Destination is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select destination...</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>
                      {city.name} {city.country?.name && `(${city.country.name})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                {...form.register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your amazing trip..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days) *</label>
                <input 
                  {...form.register('duration', { required: 'Duration is required', min: 1 })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input 
                  {...form.register('finalPrice', { required: 'Price is required', min: 0 })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                  {...form.register('currency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  {...form.register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                <select 
                  {...form.register('travelStyle')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                  <option value="cultural">Cultural</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select 
                  {...form.register('difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  {...form.register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedPackageFormSimplified;