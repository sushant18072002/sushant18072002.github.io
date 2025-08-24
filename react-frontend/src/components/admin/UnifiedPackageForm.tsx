import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@/components/common/Button';
import ItineraryBuilder from './ItineraryBuilder';
import ImageUpload from './ImageUpload';
import { apiService } from '@/services/api';

interface PackageFormData {
  title: string;
  description: string;
  destinations: string;
  duration: number;
  price: number;
  currency: string;
  category: string;
  includes: string;
  excludes: string;
  highlights: string;
  featured: boolean;
}

interface UnifiedPackageFormProps {
  packageId?: string; // If provided, it's edit mode
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const UnifiedPackageForm: React.FC<UnifiedPackageFormProps> = ({ packageId, onSubmit, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState({ overview: '', days: [] });
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  
  const isEditMode = !!packageId;
  const form = useForm<PackageFormData>({
    defaultValues: {
      currency: 'USD',
      featured: false
    }
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Itinerary', icon: '🗓️' },
    { id: 3, title: 'Images', icon: '📸' },
    { id: 4, title: 'Review', icon: '✅' }
  ];

  useEffect(() => {
    if (isEditMode && packageId) {
      loadPackageData();
    }
  }, [isEditMode, packageId]);

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
          duration: pkg.duration || 7,
          price: pkg.price?.amount || pkg.price || 0,
          currency: pkg.price?.currency || 'USD',
          category: pkg.category || '',
          highlights: Array.isArray(pkg.highlights) ? pkg.highlights.join(', ') : pkg.highlights || '',
          includes: Array.isArray(pkg.includes) ? pkg.includes.join(', ') : pkg.includes || '',
          excludes: Array.isArray(pkg.excludes) ? pkg.excludes.join(', ') : pkg.excludes || '',
          featured: pkg.featured || false
        });
        
        if (pkg.itinerary) {
          setItinerary(pkg.itinerary);
        }
      }
    } catch (error) {
      console.error('Failed to load package:', error);
      alert('Failed to load package data');
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSubmit = async (data: PackageFormData) => {
    setSaving(true);
    try {
      const transformedData = {
        title: data.title,
        description: data.description,
        destinations: data.destinations.split(',').map(d => d.trim()).filter(d => d),
        duration: parseInt(data.duration.toString()),
        price: {
          amount: parseFloat(data.price.toString()),
          currency: data.currency || 'USD'
        },
        category: data.category,
        includes: data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : [],
        excludes: data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [],
        highlights: data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : [],
        featured: data.featured || false,
        status: 'active'
      };

      if (isEditMode) {
        // Update existing package
        const response = await apiService.put(`/admin/packages/${packageId}`, transformedData);
        if (response.success) {
          alert('Package updated successfully!');
          onSubmit({ packageId, ...transformedData });
        } else {
          alert('Failed to update package: ' + (response.error?.message || 'Unknown error'));
        }
      } else {
        // Create new package
        const response = await apiService.post('/admin/packages', transformedData);
        if (response.success) {
          setCreatedPackageId(response.data.package._id || response.data.package.id);
          setCurrentStep(2);
        } else {
          alert('Failed to create package: ' + (response.error?.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save package. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleItinerarySave = async (itineraryData: any) => {
    const targetPackageId = isEditMode ? packageId : createdPackageId;
    if (!targetPackageId) return;
    
    try {
      await apiService.put(`/admin/packages/${targetPackageId}`, { itinerary: itineraryData });
      setItinerary(itineraryData);
      if (isEditMode) {
        alert('Itinerary updated successfully!');
      } else {
        setCurrentStep(3);
      }
    } catch (error) {
      alert('Failed to save itinerary');
    }
  };

  const handleImagesUploaded = (images: any[]) => {
    setUploadedImages([...uploadedImages, ...images]);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      packageId: isEditMode ? packageId : createdPackageId,
      itinerary,
      images: uploadedImages
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary-900">
              {isEditMode ? 'Edit Package' : 'Create Package'}
            </h2>
            <button onClick={onClose} className="text-2xl text-primary-400 hover:text-primary-600">×</button>
          </div>
          
          {/* Progress Steps for Create Mode */}
          {!isEditMode && (
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.id ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <div className="ml-2">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-ocean' : 'text-primary-600'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-blue-ocean' : 'bg-primary-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Tab Navigation for Edit Mode */}
          {isEditMode && (
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-4 py-2 rounded-lg ${currentStep === 1 ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'}`}
              >
                📝 Basic Info
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className={`px-4 py-2 rounded-lg ${currentStep === 2 ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'}`}
              >
                🗓️ Itinerary
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className={`px-4 py-2 rounded-lg ${currentStep === 3 ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'}`}
              >
                📸 Images
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-ocean"></div>
            </div>
          ) : (
            <>
              {currentStep === 1 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Package Title *</label>
                      <input {...form.register('title', { required: 'Title is required' })} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Bali Luxury Escape" />
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
                    <textarea {...form.register('description')} rows={3} 
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                      placeholder="Amazing tropical getaway..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Destinations *</label>
                      <input {...form.register('destinations', { required: 'Destinations required' })} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Bali, Ubud, Seminyak" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (days) *</label>
                      <input {...form.register('duration', { required: 'Duration required' })} 
                        type="number" min="1" className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="7" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Price *</label>
                      <input {...form.register('price', { required: 'Price required' })} 
                        type="number" min="0" step="0.01" className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="2499" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Highlights (comma separated)</label>
                      <input {...form.register('highlights')} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="5-star resorts, Private villa, Spa treatments" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Includes (comma separated)</label>
                      <input {...form.register('includes')} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Flights, Hotels, Meals, Tours" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Excludes (comma separated)</label>
                      <input {...form.register('excludes')} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Travel Insurance, Personal Expenses" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Currency</label>
                      <select {...form.register('currency')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('featured')} className="mr-2" />
                        <span className="text-sm font-semibold text-primary-900">Featured Package</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    {isEditMode && (
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Next: Itinerary'}
                    </Button>
                  </div>
                </form>
              )}

              {currentStep === 2 && (
                <div>
                  <ItineraryBuilder 
                    initialItinerary={itinerary}
                    onSave={handleItinerarySave} 
                  />
                  {isEditMode && (
                    <div className="flex justify-end pt-4">
                      <Button onClick={onClose}>Done</Button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (createdPackageId || isEditMode) && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Upload Package Images</h3>
                  <ImageUpload 
                    packageId={isEditMode ? packageId! : createdPackageId!} 
                    onImagesUploaded={handleImagesUploaded}
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-primary-900 mb-3">Uploaded Images ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={`http://localhost:3000${image.url}`} 
                              alt={image.alt} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            {image.isPrimary && (
                              <div className="absolute top-1 left-1 bg-blue-ocean text-white text-xs px-2 py-1 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-6">
                    {!isEditMode && <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>}
                    {!isEditMode && <Button onClick={() => setCurrentStep(4)}>Next: Review</Button>}
                    {isEditMode && <Button onClick={onClose}>Done</Button>}
                  </div>
                </div>
              )}

              {currentStep === 4 && !isEditMode && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary-900">Package Created Successfully!</h3>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <p className="text-primary-600 mb-4">
                      Your package has been created with {itinerary.days?.length || 0} days of itinerary 
                      and {uploadedImages.length} images uploaded.
                    </p>
                    
                    <div className="flex gap-4">
                      <Button onClick={handleFinalSubmit}>Complete & Close</Button>
                      <Button variant="outline" onClick={() => setCurrentStep(3)}>Add More Images</Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedPackageForm;