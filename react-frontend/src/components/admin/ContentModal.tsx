import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/common/Button';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'flight' | 'hotel' | 'package';
  onSubmit: (data: any) => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ isOpen, onClose, type, onSubmit }) => {
  const form = useForm();

  if (!isOpen) return null;

  const renderFlightForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Flight Number</label>
          <input {...form.register('flightNumber', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="DL1234" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Airline ID</label>
          <input {...form.register('airline', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Airline ObjectId" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Departure Airport</label>
          <input {...form.register('departureAirport', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Airport ObjectId" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Arrival Airport</label>
          <input {...form.register('arrivalAirport', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Airport ObjectId" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Economy Price</label>
          <input {...form.register('economyPrice', { required: true })} type="number" className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="599" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (min)</label>
          <input {...form.register('duration', { required: true })} type="number" className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="480" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
          <select {...form.register('status')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderHotelForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">Hotel Name</label>
        <input {...form.register('name', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Le Grand Hotel Paris" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">City</label>
          <input {...form.register('city', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Paris" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Country</label>
          <input {...form.register('country', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="France" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Star Rating</label>
          <select {...form.register('starRating', { required: true })} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
            <option value="3">3 Star</option>
            <option value="4">4 Star</option>
            <option value="5">5 Star</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Min Price</label>
          <input {...form.register('minPrice', { required: true })} type="number" className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="299" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
          <select {...form.register('status')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (type) {
      case 'flight': return renderFlightForm();
      case 'hotel': return renderHotelForm();
      case 'package':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Package Title *</label>
              <input {...form.register('title', { required: 'Title is required' })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Bali Luxury Escape" />
              {form.formState.errors.title && <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Description</label>
              <textarea {...form.register('description')} rows={3} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Amazing tropical getaway with luxury accommodations..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Destinations (comma separated) *</label>
                <input {...form.register('destinations', { required: 'Destinations are required' })} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Bali, Ubud, Seminyak" />
                {form.formState.errors.destinations && <p className="text-red-500 text-sm mt-1">{form.formState.errors.destinations.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Category</label>
                <select {...form.register('category')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                  <option value="">Select Category</option>
                  <option value="adventure">Adventure</option>
                  <option value="romantic">Romantic</option>
                  <option value="family">Family</option>
                  <option value="luxury">Luxury</option>
                  <option value="cultural">Cultural</option>
                  <option value="beach">Beach</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (days) *</label>
                <input {...form.register('duration', { required: 'Duration is required', min: 1 })} type="number" min="1" className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="7" />
                {form.formState.errors.duration && <p className="text-red-500 text-sm mt-1">{form.formState.errors.duration.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Price *</label>
                <input {...form.register('price', { required: 'Price is required', min: 0 })} type="number" min="0" step="0.01" className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="2499" />
                {form.formState.errors.price && <p className="text-red-500 text-sm mt-1">{form.formState.errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Currency</label>
                <select {...form.register('currency')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Includes (comma separated)</label>
                <input {...form.register('includes')} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Flights, Hotels, Meals, Tours" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-900 mb-2">Excludes (comma separated)</label>
                <input {...form.register('excludes')} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="Travel Insurance, Personal Expenses" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">Highlights (comma separated)</label>
              <input {...form.register('highlights')} className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="5-star resorts, Private villa, Spa treatments" />
            </div>
          </div>
        );
      default:
        return <div>Invalid content type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-primary-400 hover:text-primary-600">×</button>
        
        <h2 className="text-2xl font-bold text-primary-900 mb-6">
          Add New {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        
        <form onSubmit={form.handleSubmit((data) => {
          // Transform data based on type
          let transformedData = { ...data };
          
          if (type === 'package') {
            transformedData = {
              title: data.title,
              description: data.description,
              destinations: data.destinations,
              duration: parseInt(data.duration),
              price: {
                amount: parseFloat(data.price),
                currency: data.currency || 'USD'
              },
              category: data.category,
              includes: data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : [],
              excludes: data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [],
              highlights: data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : [],
              status: 'active'
            };
          }
          
          onSubmit(transformedData);
        })}>
          {renderForm()}
          
          <div className="flex gap-3 pt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;