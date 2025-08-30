import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/common/Button';
import { masterDataService } from '@/services/masterData.service';

interface TripFormData {
  title: string;
  description: string;
  primaryDestination: string;
  category: string;
  duration: {
    days: number;
    nights: number;
  };
  pricing: {
    currency: string;
    estimated: number;
    priceRange: string;
  };
  difficulty: string;
  travelStyle: string;
  featured: boolean;
}

interface TripFormProps {
  trip?: any;
  onSubmit: (data: TripFormData) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<TripFormData>({
    defaultValues: trip || {
      title: '',
      description: '',
      primaryDestination: '',
      category: '',
      duration: { days: 7, nights: 6 },
      pricing: { currency: 'USD', estimated: 1000, priceRange: 'mid-range' },
      difficulty: 'moderate',
      travelStyle: 'adventure',
      featured: false
    }
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        masterDataService.getCategories('trip'),
        masterDataService.getCities()
      ]);
      setCategories(categoriesRes.categories || []);
      setCities(citiesRes.cities || []);
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (data: TripFormData) => {
    onSubmit(data);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Trip Title *</label>
          <input
            {...form.register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
            placeholder="Amazing Bali Adventure"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Category *</label>
          <select
            {...form.register('category', { required: 'Category is required' })}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="">Select Category</option>
            {categories.map((category: any) => (
              <option key={category._id} value={category._id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
        <textarea
          {...form.register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          placeholder="Describe this amazing trip..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Primary Destination *</label>
          <select
            {...form.register('primaryDestination', { required: 'Destination is required' })}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="">Select Destination</option>
            {cities.map((city: any) => (
              <option key={city._id} value={city._id}>
                {city.name}, {city.country?.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Travel Style</label>
          <select
            {...form.register('travelStyle')}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="adventure">Adventure</option>
            <option value="luxury">Luxury</option>
            <option value="cultural">Cultural</option>
            <option value="relaxed">Relaxed</option>
            <option value="business">Business</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Days</label>
          <input
            {...form.register('duration.days', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Nights</label>
          <input
            {...form.register('duration.nights', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Difficulty</label>
          <select
            {...form.register('difficulty')}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Currency</label>
          <select
            {...form.register('pricing.currency')}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Estimated Price</label>
          <input
            {...form.register('pricing.estimated', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">Price Range</label>
          <select
            {...form.register('pricing.priceRange')}
            className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
          >
            <option value="budget">Budget</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          {...form.register('featured')}
          type="checkbox"
          className="h-4 w-4 text-blue-ocean focus:ring-blue-ocean border-primary-300 rounded"
        />
        <label className="ml-2 block text-sm text-primary-700">Featured Trip</label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {trip ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;