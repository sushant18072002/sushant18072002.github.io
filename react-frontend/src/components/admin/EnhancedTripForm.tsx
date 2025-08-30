import React, { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface EnhancedTripFormProps {
  editingTrip?: any;
  onSave: (tripData: any) => void;
  onCancel: () => void;
}

const EnhancedTripForm: React.FC<EnhancedTripFormProps> = ({ editingTrip, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Destinations', icon: '🗺️' },
    { id: 3, title: 'Itinerary', icon: '📅' },
    { id: 4, title: 'Services', icon: '🏨' },
    { id: 5, title: 'Travel Info', icon: 'ℹ️' },
    { id: 6, title: 'Media', icon: '📸' }
  ];

  useEffect(() => {
    loadMasterData();
    if (editingTrip) {
      setItinerary(editingTrip.itinerary || []);
      setUploadedImages(editingTrip.images || []);
    }
  }, [editingTrip]);

  const loadMasterData = async () => {
    try {
      const [categoriesRes, citiesRes, countriesRes] = await Promise.all([
        fetch('http://localhost:3000/api/master/categories?type=trip').then(r => r.json()),
        fetch('http://localhost:3000/api/master/cities').then(r => r.json()),
        fetch('http://localhost:3000/api/master/countries').then(r => r.json())
      ]);
      
      setCategories(categoriesRes.data?.categories || []);
      setCities(citiesRes.data?.cities || []);
      setCountries(countriesRes.data?.countries || []);
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const tripData = {
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type'),
      category: formData.get('category'),
      
      primaryDestination: formData.get('primaryDestination'),
      destinations: Array.from(formData.getAll('destinations')),
      countries: Array.from(formData.getAll('countries')),
      
      duration: {
        days: parseInt(formData.get('days') as string),
        nights: parseInt(formData.get('nights') as string)
      },
      
      travelStyle: formData.get('travelStyle'),
      difficulty: formData.get('difficulty'),
      
      suitableFor: {
        couples: formData.get('couples') === 'on',
        families: formData.get('families') === 'on',
        soloTravelers: formData.get('soloTravelers') === 'on',
        groups: formData.get('groups') === 'on'
      },
      
      groupSize: {
        min: parseInt(formData.get('minGroupSize') as string) || 1,
        max: parseInt(formData.get('maxGroupSize') as string) || 20,
        recommended: parseInt(formData.get('recommendedGroupSize') as string) || 4
      },
      
      physicalRequirements: {
        fitnessLevel: formData.get('fitnessLevel'),
        walkingDistance: parseFloat(formData.get('walkingDistance') as string) || 0,
        altitude: parseInt(formData.get('altitude') as string) || 0,
        specialNeeds: (formData.get('specialNeeds') as string)?.split(',').map(s => s.trim()).filter(s => s) || []
      },
      
      pricing: {
        currency: formData.get('currency') || 'USD',
        estimated: parseInt(formData.get('estimatedPrice') as string) || 0,
        priceRange: formData.get('priceRange'),
        breakdown: {
          flights: parseInt(formData.get('flightsCost') as string) || 0,
          accommodation: parseInt(formData.get('accommodationCost') as string) || 0,
          activities: parseInt(formData.get('activitiesCost') as string) || 0,
          food: parseInt(formData.get('foodCost') as string) || 0,
          transport: parseInt(formData.get('transportCost') as string) || 0,
          other: parseInt(formData.get('otherCost') as string) || 0
        }
      },
      
      travelInfo: {
        bestTimeToVisit: {
          months: Array.from(formData.getAll('bestMonths')),
          weather: formData.get('weather'),
          temperature: {
            min: parseInt(formData.get('minTemp') as string) || 0,
            max: parseInt(formData.get('maxTemp') as string) || 0
          },
          rainfall: formData.get('rainfall')
        },
        visaRequirements: {
          required: formData.get('visaRequired') === 'on',
          countries: (formData.get('visaCountries') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          processingTime: formData.get('visaProcessingTime'),
          cost: parseInt(formData.get('visaCost') as string) || 0
        },
        healthRequirements: {
          vaccinations: (formData.get('vaccinations') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          healthInsurance: formData.get('healthInsurance') === 'on',
          medicalFacilities: formData.get('medicalFacilities')
        },
        safetyInformation: {
          level: formData.get('safetyLevel'),
          warnings: (formData.get('safetyWarnings') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          emergencyContacts: (formData.get('emergencyContacts') as string)?.split(',').map(s => s.trim()).filter(s => s) || []
        },
        localCulture: {
          language: (formData.get('languages') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          currency: formData.get('localCurrency'),
          customs: (formData.get('customs') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          etiquette: (formData.get('etiquette') as string)?.split(',').map(s => s.trim()).filter(s => s) || []
        },
        packingList: {
          essentials: (formData.get('essentials') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          clothing: (formData.get('clothing') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          equipment: (formData.get('equipment') as string)?.split(',').map(s => s.trim()).filter(s => s) || [],
          optional: (formData.get('optional') as string)?.split(',').map(s => s.trim()).filter(s => s) || []
        }
      },
      
      bookingInfo: {
        instantBook: formData.get('instantBook') === 'on',
        requiresApproval: formData.get('requiresApproval') === 'on',
        advanceBooking: parseInt(formData.get('advanceBooking') as string) || 7,
        cancellationPolicy: formData.get('cancellationPolicy'),
        paymentTerms: formData.get('paymentTerms'),
        depositRequired: parseInt(formData.get('depositRequired') as string) || 50,
        finalPaymentDue: parseInt(formData.get('finalPaymentDue') as string) || 30
      },
      
      customizable: {
        duration: formData.get('customizableDuration') === 'on',
        activities: formData.get('customizableActivities') === 'on',
        accommodation: formData.get('customizableAccommodation') === 'on',
        dates: formData.get('customizableDates') === 'on',
        groupSize: formData.get('customizableGroupSize') === 'on'
      },
      
      itinerary,
      images: uploadedImages,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(t => t) || [],
      featured: formData.get('featured') === 'on',
      status: formData.get('status') || 'draft'
    };
    
    onSave(tripData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const formData = new FormData();
    Array.from(e.target.files).forEach((file, index) => {
      formData.append('images', file);
      formData.append(`alt_${index}`, `Trip image ${index + 1}`);
    });
    
    try {
      const response = await fetch('http://localhost:3000/api/upload/multiple', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.images) {
          setUploadedImages(prev => [...prev, ...result.data.images]);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    }
  };

  const addItineraryDay = () => {
    const newDay = {
      day: itinerary.length + 1,
      title: `Day ${itinerary.length + 1}`,
      description: '',
      activities: [],
      estimatedCost: { currency: 'USD', amount: 0 },
      tips: []
    };
    setItinerary([...itinerary, newDay]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 max-w-7xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-primary-900">
            {editingTrip ? 'Edit Trip' : 'Create New Trip'}
          </h4>
          <button onClick={onCancel} className="text-3xl text-primary-400 hover:text-primary-600">×</button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'
              }`}>
                <span className="text-sm">{step.icon}</span>
              </div>
              <div className="ml-2 min-w-0">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h5 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Trip Title *</label>
                    <input name="title" type="text" required defaultValue={editingTrip?.title} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Trip Type *</label>
                    <select name="type" required defaultValue={editingTrip?.type} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="featured">Featured</option>
                      <option value="ai-generated">AI Generated</option>
                      <option value="custom">Custom</option>
                      <option value="user-created">User Created</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">Description *</label>
                  <textarea name="description" rows={4} required defaultValue={editingTrip?.description} 
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Category</label>
                    <select name="category" defaultValue={editingTrip?.category} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Travel Style</label>
                    <select name="travelStyle" defaultValue={editingTrip?.travelStyle} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="">Select Style</option>
                      <option value="adventure">Adventure</option>
                      <option value="luxury">Luxury</option>
                      <option value="cultural">Cultural</option>
                      <option value="relaxed">Relaxed</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Difficulty</label>
                    <select name="difficulty" defaultValue={editingTrip?.difficulty} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Price Range</label>
                    <select name="priceRange" defaultValue={editingTrip?.pricing?.priceRange} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="budget">Budget</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Duration (Days) *</label>
                    <input name="days" type="number" min="1" required defaultValue={editingTrip?.duration?.days} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Duration (Nights) *</label>
                    <input name="nights" type="number" min="0" required defaultValue={editingTrip?.duration?.nights} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">Suitable For</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input type="checkbox" name="couples" defaultChecked={editingTrip?.suitableFor?.couples} className="mr-2" />
                      <span className="text-sm">Couples</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="families" defaultChecked={editingTrip?.suitableFor?.families} className="mr-2" />
                      <span className="text-sm">Families</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="soloTravelers" defaultChecked={editingTrip?.suitableFor?.soloTravelers} className="mr-2" />
                      <span className="text-sm">Solo Travelers</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="groups" defaultChecked={editingTrip?.suitableFor?.groups} className="mr-2" />
                      <span className="text-sm">Groups</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => setCurrentStep(2)}>Next: Destinations</Button>
              </div>
            </div>
          )}

          {/* Step 2: Destinations */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h5 className="text-lg font-semibold text-primary-900 mb-4">Destinations & Locations</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Primary Destination *</label>
                    <select name="primaryDestination" required defaultValue={editingTrip?.primaryDestination} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="">Select Primary Destination</option>
                      {cities.map(city => (
                        <option key={city._id} value={city._id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Additional Destinations</label>
                    <select name="destinations" multiple defaultValue={editingTrip?.destinations} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean h-32">
                      {cities.map(city => (
                        <option key={city._id} value={city._id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">Countries</label>
                  <select name="countries" multiple defaultValue={editingTrip?.countries} 
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean h-24">
                    {countries.map(country => (
                      <option key={country._id} value={country._id}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Min Group Size</label>
                    <input name="minGroupSize" type="number" min="1" defaultValue={editingTrip?.groupSize?.min || 1} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Max Group Size</label>
                    <input name="maxGroupSize" type="number" min="1" defaultValue={editingTrip?.groupSize?.max || 20} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Recommended Size</label>
                    <input name="recommendedGroupSize" type="number" min="1" defaultValue={editingTrip?.groupSize?.recommended || 4} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(3)}>Next: Itinerary</Button>
              </div>
            </div>
          )}

          {/* Additional steps would continue here... */}
          {/* For brevity, showing navigation for remaining steps */}
          {currentStep > 2 && currentStep < 6 && (
            <div className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h5 className="text-lg font-semibold text-primary-900 mb-4">
                  {steps.find(s => s.id === currentStep)?.title} - Coming Soon
                </h5>
                <p className="text-primary-600">This section will contain detailed forms for {steps.find(s => s.id === currentStep)?.title.toLowerCase()}.</p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                  {currentStep === 5 ? 'Next: Media' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Final Step */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h5 className="text-lg font-semibold text-primary-900 mb-4">Media & Settings</h5>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">Trip Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Tags (comma separated)</label>
                    <input name="tags" type="text" defaultValue={editingTrip?.tags?.join(', ')} 
                      placeholder="beach, adventure, culture" 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Status</label>
                    <select name="status" defaultValue={editingTrip?.status || 'draft'} 
                      className="w-full px-3 py-2 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-ocean">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="featured" defaultChecked={editingTrip?.featured} className="mr-2" />
                    <span className="text-sm font-medium text-primary-700">Featured Trip</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(5)}>Back</Button>
                <Button type="submit">{editingTrip ? 'Update Trip' : 'Create Trip'}</Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

export default EnhancedTripForm;