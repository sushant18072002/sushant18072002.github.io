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
  travelStyle: string;
  difficulty: string;
  couples: boolean;
  families: boolean;
  soloTravelers: boolean;
  groups: boolean;
  minGroupSize: number;
  maxGroupSize: number;
  recommendedGroupSize: number;
  fitnessLevel: string;
  walkingDistance: number;
  altitude: number;
  priceBreakdownFlights: number;
  priceBreakdownAccommodation: number;
  priceBreakdownActivities: number;
  priceBreakdownFood: number;
  priceBreakdownTransport: number;
  priceBreakdownOther: number;
  instantBook: boolean;
  requiresApproval: boolean;
  advanceBooking: number;
  cancellationPolicy: string;
  depositRequired: number;
  finalPaymentDue: number;
  // Travel Info
  bestTimeMonths: string;
  weather: string;
  minTemp: number;
  maxTemp: number;
  visaRequired: boolean;
  visaCost: number;
  healthInsurance: boolean;
  vaccinations: string;
  safetyLevel: string;
  languages: string;
  localCurrency: string;
  customs: string;
  // Availability
  maxBookings: number;
  seasonal: boolean;
  // Sharing
  isPublic: boolean;
  allowCopy: boolean;
  allowComments: boolean;
  // Missing fields
  tags: string;
  includes: string;
  excludes: string;
  travelStyle: string;
  template: boolean;
  shareCode: string;
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
  const [tripDuration, setTripDuration] = useState(7);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [includedServices, setIncludedServices] = useState({
    flights: [],
    hotels: [],
    activities: [],
    transport: [],
    meals: [],
    guides: false
  });
  
  const isEditMode = !!packageId;
  const form = useForm<PackageFormData>({
    defaultValues: {
      currency: 'USD',
      featured: false
    },
    onChange: () => setHasUnsavedChanges(true)
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Details', icon: '⚙️' },
    { id: 3, title: 'Itinerary', icon: '🗓️' },
    { id: 4, title: 'Services', icon: '🏨' },
    { id: 5, title: 'Travel Info', icon: 'ℹ️' },
    { id: 6, title: 'Settings', icon: '⚙️' },
    { id: 7, title: 'Images', icon: '📸' }
  ];

  useEffect(() => {
    loadCategories();
    if (isEditMode && packageId) {
      loadPackageData();
    }
  }, [isEditMode, packageId]);
  
  const loadCategories = async () => {
    try {
      const [categoriesResponse, citiesResponse] = await Promise.all([
        apiService.get('/master/categories?type=trip'),
        apiService.get('/master/cities')
      ]);
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories || []);
      }
      
      if (citiesResponse.success) {
        setCities(citiesResponse.data.cities || []);
      }
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };

  const searchDestinations = async (query: string) => {
    if (query.length < 2) {
      setDestinationSuggestions([]);
      return;
    }
    
    try {
      const response = await apiService.get(`/locations/search?q=${encodeURIComponent(query)}`);
      if (response.success) {
        setDestinationSuggestions(response.data.locations || []);
      }
    } catch (error) {
      console.error('Error searching destinations:', error);
      // Fallback to cities data
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country?.name?.toLowerCase().includes(query.toLowerCase())
      );
      setDestinationSuggestions(filtered.slice(0, 5));
    }
  };

  const loadPackageData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/admin/packages/${packageId}`);
      if (response.success && response.data) {
        const pkg = response.data.trip || response.data.package || response.data;
        // Use dedicated fields if available, otherwise extract from tags
        const highlights = pkg.highlights?.join(', ') || 
          pkg.tags?.filter(tag => 
            ['5-star', 'luxury', 'villa', 'spa', 'resort', 'private', 'premium'].some(keyword => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        const includes = pkg.includes?.join(', ') || 
          pkg.tags?.filter(tag => 
            ['flights', 'hotels', 'meals', 'tours', 'guide', 'transport', 'accommodation'].some(keyword => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        const excludes = pkg.excludes?.join(', ') || 
          pkg.tags?.filter(tag => 
            ['insurance', 'personal', 'visa', 'tips'].some(keyword => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        form.reset({
          title: pkg.title || '',
          description: pkg.description || '',
          destinations: pkg.primaryDestination?.name ? `${pkg.primaryDestination.name}, ${pkg.primaryDestination.country?.name || ''}` : '',
          duration: pkg.duration?.days || pkg.duration || 7,
          price: pkg.pricing?.estimated || pkg.price?.amount || pkg.price || 0,
          currency: pkg.pricing?.currency || pkg.price?.currency || 'USD',
          category: pkg.category?.name || pkg.category || '',
          highlights,
          includes,
          excludes,
          featured: pkg.featured || false,
          template: pkg.template || false,
          tags: pkg.tags?.join(', ') || '',
          travelStyle: pkg.travelStyle || '',
          difficulty: pkg.difficulty || '',
          couples: pkg.suitableFor?.couples || false,
          families: pkg.suitableFor?.families || false,
          soloTravelers: pkg.suitableFor?.soloTravelers || false,
          groups: pkg.suitableFor?.groups || false,
          minGroupSize: pkg.groupSize?.min || 1,
          maxGroupSize: pkg.groupSize?.max || 20,
          recommendedGroupSize: pkg.groupSize?.recommended || 4,
          fitnessLevel: pkg.physicalRequirements?.fitnessLevel || 'low',
          walkingDistance: pkg.physicalRequirements?.walkingDistance || 0,
          altitude: pkg.physicalRequirements?.altitude || 0,
          priceBreakdownFlights: pkg.pricing?.breakdown?.flights || 0,
          priceBreakdownAccommodation: pkg.pricing?.breakdown?.accommodation || 0,
          priceBreakdownActivities: pkg.pricing?.breakdown?.activities || 0,
          priceBreakdownFood: pkg.pricing?.breakdown?.food || 0,
          priceBreakdownTransport: pkg.pricing?.breakdown?.transport || 0,
          priceBreakdownOther: pkg.pricing?.breakdown?.other || 0,
          instantBook: pkg.bookingInfo?.instantBook || false,
          requiresApproval: pkg.bookingInfo?.requiresApproval !== false,
          advanceBooking: pkg.bookingInfo?.advanceBooking || 7,
          cancellationPolicy: pkg.bookingInfo?.cancellationPolicy || '',
          depositRequired: pkg.bookingInfo?.depositRequired || 50,
          finalPaymentDue: pkg.bookingInfo?.finalPaymentDue || 30,
          // Travel Info
          bestTimeMonths: pkg.travelInfo?.bestTimeToVisit?.months?.join(', ') || '',
          weather: pkg.travelInfo?.bestTimeToVisit?.weather || '',
          minTemp: pkg.travelInfo?.bestTimeToVisit?.temperature?.min || 0,
          maxTemp: pkg.travelInfo?.bestTimeToVisit?.temperature?.max || 0,
          visaRequired: pkg.travelInfo?.visaRequirements?.required || false,
          visaCost: pkg.travelInfo?.visaRequirements?.cost || 0,
          healthInsurance: pkg.travelInfo?.healthRequirements?.healthInsurance || false,
          vaccinations: pkg.travelInfo?.healthRequirements?.vaccinations?.join(', ') || '',
          safetyLevel: pkg.travelInfo?.safetyInformation?.level || 'low',
          languages: pkg.travelInfo?.localCulture?.language?.join(', ') || '',
          localCurrency: pkg.travelInfo?.localCulture?.currency || '',
          customs: pkg.travelInfo?.localCulture?.customs?.join(', ') || '',
          // Availability & Sharing
          maxBookings: pkg.availability?.maxBookings || 20,
          seasonal: pkg.availability?.seasonal || false,
          isPublic: pkg.sharing?.isPublic !== false,
          allowCopy: pkg.sharing?.allowCopy !== false,
          allowComments: pkg.sharing?.allowComments !== false
        });
        
        if (pkg.itinerary) {
          const itineraryData = Array.isArray(pkg.itinerary) ? { overview: '', days: pkg.itinerary } : pkg.itinerary;
          setItinerary(itineraryData);
          setTripDuration(pkg.duration?.days || itineraryData.days?.length || 7);
        } else {
          setTripDuration(pkg.duration?.days || 7);
        }
        
        if (pkg.includedServices) {
          setIncludedServices({
            flights: pkg.includedServices.flights || [],
            hotels: pkg.includedServices.hotels || [],
            activities: pkg.includedServices.activities || [],
            transport: pkg.includedServices.transport || [],
            meals: pkg.includedServices.meals || [],
            guides: pkg.includedServices.guides || false
          });
        }
        
        if (pkg.images) {
          setUploadedImages(pkg.images);
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
      // Get destination and category
      let primaryDestination = selectedDestinations[0] || null;
      let categoryId = null;
      
      // If no destination selected from autocomplete, try to find by name
      if (!primaryDestination && data.destinations) {
        const destinationName = data.destinations.split(',')[0].trim();
        try {
          const destResponse = await apiService.get(`/locations/search?q=${encodeURIComponent(destinationName)}`);
          if (destResponse.success && destResponse.data.locations?.length > 0) {
            primaryDestination = destResponse.data.locations[0]._id;
          }
        } catch (error) {
          console.warn('Failed to resolve destination:', error);
        }
      }
      
      // Get category
      if (data.category) {
        try {
          const catResponse = await apiService.get('/master/categories?type=trip');
          if (catResponse.success && catResponse.data.categories?.length > 0) {
            const category = catResponse.data.categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
            if (category) categoryId = category._id;
          }
        } catch (error) {
          console.warn('Failed to resolve category:', error);
        }
      }
      
      if (!primaryDestination) {
        alert('Please select a valid destination from the suggestions');
        return;
      }
      
      const transformedData = {
        title: data.title,
        description: data.description,
        primaryDestination: primaryDestination,
        destinations: [primaryDestination],
        duration: {
          days: parseInt(data.duration.toString()),
          nights: parseInt(data.duration.toString()) - 1
        },
        pricing: {
          estimated: parseFloat(data.price.toString()),
          currency: data.currency || 'USD',
          priceRange: parseFloat(data.price.toString()) < 1000 ? 'budget' : parseFloat(data.price.toString()) < 3000 ? 'mid-range' : 'luxury',
          breakdown: {
            flights: parseFloat(data.priceBreakdownFlights?.toString()) || 0,
            accommodation: parseFloat(data.priceBreakdownAccommodation?.toString()) || 0,
            activities: parseFloat(data.priceBreakdownActivities?.toString()) || 0,
            food: parseFloat(data.priceBreakdownFood?.toString()) || 0,
            transport: parseFloat(data.priceBreakdownTransport?.toString()) || 0,
            other: parseFloat(data.priceBreakdownOther?.toString()) || 0
          }
        },
        category: categoryId,
        tags: [
          ...(data.tags ? data.tags.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [])
        ],
        highlights: data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : [],
        includes: data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : [],
        excludes: data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [],
        featured: data.featured || false,
        template: data.template || false,
        status: 'published',
        type: 'custom',
        suitableFor: {
          couples: data.couples || false,
          families: data.families || false,
          soloTravelers: data.soloTravelers || false,
          groups: data.groups || false
        },
        travelStyle: data.travelStyle || 'cultural',
        difficulty: data.difficulty || 'moderate',
        groupSize: {
          min: parseInt(data.minGroupSize?.toString()) || 1,
          max: parseInt(data.maxGroupSize?.toString()) || 20,
          recommended: parseInt(data.recommendedGroupSize?.toString()) || 4
        },
        physicalRequirements: {
          fitnessLevel: data.fitnessLevel || 'low',
          walkingDistance: parseFloat(data.walkingDistance?.toString()) || 0,
          altitude: parseInt(data.altitude?.toString()) || 0,
          specialNeeds: []
        },
        customizable: {
          duration: true,
          activities: true,
          accommodation: true,
          dates: true,
          groupSize: true
        },
        bookingInfo: {
          instantBook: data.instantBook || false,
          requiresApproval: data.requiresApproval !== false,
          advanceBooking: parseInt(data.advanceBooking?.toString()) || 7,
          cancellationPolicy: data.cancellationPolicy || '',
          paymentTerms: '',
          depositRequired: parseInt(data.depositRequired?.toString()) || 50,
          finalPaymentDue: parseInt(data.finalPaymentDue?.toString()) || 30
        },
        includedServices: includedServices,
        travelInfo: {
          bestTimeToVisit: {
            months: data.bestTimeMonths ? data.bestTimeMonths.split(',').map(m => m.trim()) : [],
            weather: data.weather || '',
            temperature: { min: data.minTemp || 0, max: data.maxTemp || 0 }
          },
          visaRequirements: {
            required: data.visaRequired || false,
            cost: data.visaCost || 0
          },
          healthRequirements: {
            healthInsurance: data.healthInsurance || false,
            vaccinations: data.vaccinations ? data.vaccinations.split(',').map(v => v.trim()) : []
          },
          safetyInformation: {
            level: data.safetyLevel || 'low'
          },
          localCulture: {
            language: data.languages ? data.languages.split(',').map(l => l.trim()) : [],
            currency: data.localCurrency || '',
            customs: data.customs ? data.customs.split(',').map(c => c.trim()) : []
          }
        },
        availability: {
          maxBookings: parseInt(data.maxBookings?.toString()) || 20,
          seasonal: data.seasonal || false,
          startDates: [],
          currentBookings: [],
          blackoutDates: []
        },
        sharing: {
          isPublic: data.isPublic !== false,
          allowCopy: data.allowCopy !== false,
          allowComments: data.allowComments !== false
        }
      };

      if (isEditMode) {
        // Update existing package
        const response = await apiService.put(`/admin/packages/${packageId}`, transformedData);
        if (response.success) {
          alert('Package updated successfully!');
          // Don't close form, let user navigate
        } else {
          alert('Failed to update package: ' + (response.error?.message || 'Unknown error'));
        }
      } else {
        // Create new package
        const response = await apiService.post('/admin/packages', transformedData);
        if (response.success) {
          const createdId = response.data.trip?._id || response.data.package?._id || response.data._id;
          setCreatedPackageId(createdId);
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
      // Ensure itinerary has proper structure with day numbers
      const formattedItinerary = itineraryData.days?.map((day: any, index: number) => ({
        day: day.day || index + 1,
        title: day.title || `Day ${index + 1}`,
        description: day.description || '',
        locationName: day.location || '',
        activities: (day.activities || []).map(activity => ({
          ...activity,
          location: typeof activity.location === 'string' ? activity.location : activity.location || ''
        })),
        estimatedCost: day.estimatedCost || { currency: 'USD', amount: 0 },
        tips: day.tips || []
      })) || [];
      
      await apiService.put(`/admin/packages/${targetPackageId}`, { itinerary: formattedItinerary });
      setItinerary({ ...itineraryData, days: formattedItinerary });
      if (isEditMode) {
        alert('Itinerary updated successfully!');
        // Stay on itinerary tab
      } else {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Itinerary save error:', error);
      alert('Failed to save itinerary');
    }
  };

  const handleSaveCurrentTab = async () => {
    const data = form.getValues();
    const targetPackageId = isEditMode ? packageId : createdPackageId;
    
    if (!targetPackageId) {
      alert('Please complete basic info first');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        travelInfo: {
          bestTimeToVisit: {
            months: data.bestTimeMonths ? data.bestTimeMonths.split(',').map(m => m.trim()) : [],
            weather: data.weather || '',
            temperature: { min: data.minTemp || 0, max: data.maxTemp || 0 }
          },
          visaRequirements: {
            required: data.visaRequired || false,
            cost: data.visaCost || 0
          },
          healthRequirements: {
            healthInsurance: data.healthInsurance || false,
            vaccinations: data.vaccinations ? data.vaccinations.split(',').map(v => v.trim()) : []
          },
          safetyInformation: {
            level: data.safetyLevel || 'low'
          },
          localCulture: {
            language: data.languages ? data.languages.split(',').map(l => l.trim()) : [],
            currency: data.localCurrency || '',
            customs: data.customs ? data.customs.split(',').map(c => c.trim()) : []
          }
        },
        availability: {
          maxBookings: parseInt(data.maxBookings?.toString()) || 20,
          seasonal: data.seasonal || false
        },
        sharing: {
          isPublic: data.isPublic !== false,
          allowCopy: data.allowCopy !== false,
          allowComments: data.allowComments !== false
        },
        includedServices: includedServices
      };
      
      await apiService.put(`/admin/packages/${targetPackageId}`, updateData);
      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleImagesUploaded = async (images: any[]) => {
    const newImages = [...uploadedImages, ...images];
    setUploadedImages(newImages);
    
    // Save images to trip immediately
    const targetPackageId = isEditMode ? packageId : createdPackageId;
    if (targetPackageId) {
      try {
        await apiService.put(`/admin/packages/${targetPackageId}`, { images: newImages });
        console.log('Images saved to trip');
      } catch (error) {
        console.error('Failed to save images to trip:', error);
      }
    }
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
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-primary-100">
              <div className="flex items-center gap-1 min-w-max pb-1">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      currentStep >= step.id ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'
                    }`}>
                      <span className="text-xs">{step.icon}</span>
                    </div>
                    <div className="ml-1">
                      <div className={`text-xs font-medium whitespace-nowrap ${
                        currentStep >= step.id ? 'text-blue-ocean' : 'text-primary-600'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-6 h-0.5 mx-1 ${
                        currentStep > step.id ? 'bg-blue-ocean' : 'bg-primary-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tab Navigation for Edit Mode */}
          {isEditMode && (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-primary-100">
              <div className="flex items-center gap-1 min-w-max pb-1">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (hasUnsavedChanges) {
                        if (confirm('You have unsaved changes. Save before switching tabs?')) {
                          handleSaveCurrentTab().then(() => setCurrentStep(step.id));
                        }
                      } else {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      currentStep === step.id ? 'bg-blue-ocean text-white' : 'bg-primary-100 text-primary-600'
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span>{step.title}</span>
                  </button>
                ))}
              </div>
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
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                        ))}
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
                    <div className="relative">
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Primary Destination *</label>
                      <input
                        {...form.register('destinations', { required: 'Destination required' })}
                        type="text"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg"
                        placeholder="e.g., Paris, France"
                        onChange={(e) => {
                          form.setValue('destinations', e.target.value);
                          if (e.target.value.length >= 2) {
                            searchDestinations(e.target.value);
                            setShowDestinationSuggestions(true);
                          }
                        }}
                        onFocus={(e) => {
                          if (e.target.value.length >= 2) {
                            searchDestinations(e.target.value);
                            setShowDestinationSuggestions(true);
                          }
                        }}
                      />
                      {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {destinationSuggestions.map((destination) => (
                            <div
                              key={destination._id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const cityName = destination.country ? `${destination.name}, ${destination.country}` : destination.name;
                                form.setValue('destinations', cityName);
                                setSelectedDestinations([destination._id]);
                                setShowDestinationSuggestions(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-primary-50 flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <div className="font-medium">{destination.name}</div>
                                <div className="text-sm text-primary-500">{destination.country}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Duration (days) *</label>
                      <input {...form.register('duration', { required: 'Duration required' })} 
                        type="number" min="1" className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="7" 
                        onChange={(e) => {
                          const days = parseInt(e.target.value) || 7;
                          setTripDuration(days);
                          
                          // Preserve existing data when adjusting days
                          const currentDays = itinerary.days || [];
                          let newDays;
                          
                          if (days > currentDays.length) {
                            // Add new days
                            const additionalDays = Array.from({ length: days - currentDays.length }, (_, i) => ({
                              day: currentDays.length + i + 1,
                              title: `Day ${currentDays.length + i + 1}`,
                              description: '',
                              locationName: '',
                              activities: [],
                              estimatedCost: { currency: 'USD', amount: 0 },
                              tips: []
                            }));
                            newDays = [...currentDays, ...additionalDays];
                          } else {
                            // Remove excess days
                            newDays = currentDays.slice(0, days);
                          }
                          
                          setItinerary({ overview: itinerary.overview || '', days: newDays });
                        }} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Total Price *</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <label className="flex items-center">
                          <input type="radio" name="priceType" value="per-person" defaultChecked className="mr-2" />
                          <span className="text-sm">Per Person</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="priceType" value="per-group" className="mr-2" />
                          <span className="text-sm">Per Group</span>
                        </label>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">$</span>
                        <input {...form.register('price', { required: 'Price required' })} 
                          type="number" min="0" step="0.01" className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="2499" />
                      </div>
                      <p className="text-xs text-primary-500 mt-1">Detailed breakdown can be set in Details tab</p>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Travel Style</label>
                      <select {...form.register('travelStyle')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        <option value="cultural">Cultural</option>
                        <option value="adventure">Adventure</option>
                        <option value="luxury">Luxury</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Difficulty</label>
                      <select {...form.register('difficulty')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                      </select>
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

                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Suitable For</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('couples')} className="mr-2" />
                        <span className="text-sm">💕 Couples</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('families')} className="mr-2" />
                        <span className="text-sm">👨‍👩‍👧‍👦 Families</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('soloTravelers')} className="mr-2" />
                        <span className="text-sm">🧳 Solo</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('groups')} className="mr-2" />
                        <span className="text-sm">👥 Groups</span>
                      </label>
                    </div>
                  </div>

                  {/* Tags and Template */}
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Tags (comma separated)</label>
                    <input {...form.register('tags')} 
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                      placeholder="adventure, culture, food, luxury" />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input type="checkbox" {...form.register('featured')} className="mr-2" />
                      <span className="text-sm font-semibold text-primary-900">⭐ Featured Trip</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" {...form.register('template')} className="mr-2" />
                      <span className="text-sm font-semibold text-primary-900">📋 Template</span>
                    </label>
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
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Trip Details & Requirements</h3>
                  
                  {/* Group Size */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Group Size</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Minimum</label>
                        <input {...form.register('minGroupSize')} type="number" min="1" defaultValue="1" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Maximum</label>
                        <input {...form.register('maxGroupSize')} type="number" min="1" defaultValue="20" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Recommended</label>
                        <input {...form.register('recommendedGroupSize')} type="number" min="1" defaultValue="4" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Physical Requirements */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Physical Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Fitness Level</label>
                        <select {...form.register('fitnessLevel')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                          <option value="low">Low</option>
                          <option value="moderate">Moderate</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Walking Distance (km/day)</label>
                        <input {...form.register('walkingDistance')} type="number" min="0" step="0.1" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Altitude (meters)</label>
                        <input {...form.register('altitude')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="1000" />
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Price Breakdown</h4>
                    <p className="text-sm text-primary-600 mb-4">Break down the total price into components (should add up to total price)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Flights</label>
                        <input {...form.register('priceBreakdownFlights')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="800" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Accommodation</label>
                        <input {...form.register('priceBreakdownAccommodation')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Activities</label>
                        <input {...form.register('priceBreakdownActivities')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="300" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Food</label>
                        <input {...form.register('priceBreakdownFood')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="200" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Transport</label>
                        <input {...form.register('priceBreakdownTransport')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="100" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Other</label>
                        <input {...form.register('priceBreakdownOther')} type="number" min="0" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="50" />
                      </div>
                    </div>
                  </div>

                  {/* Booking Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Booking Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('instantBook')} className="mr-2" />
                          <span className="text-sm font-semibold text-primary-900">⚡ Instant Booking</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('requiresApproval')} className="mr-2" defaultChecked />
                          <span className="text-sm font-semibold text-primary-900">✅ Requires Approval</span>
                        </label>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Advance Booking (days)</label>
                          <input {...form.register('advanceBooking')} type="number" min="0" defaultValue="7" 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Deposit Required (%)</label>
                          <input {...form.register('depositRequired')} type="number" min="0" max="100" defaultValue="50" 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Cancellation Policy</label>
                      <textarea {...form.register('cancellationPolicy')} rows={3} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Free cancellation up to 72 hours before departure..." />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => setCurrentStep(1)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                        Next: Itinerary →
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 3 && (
                <div>
                  <ItineraryBuilder 
                    initialItinerary={itinerary || { overview: '', days: [] }}
                    tripDuration={tripDuration}
                    onSave={handleItinerarySave} 
                  />
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>← Previous</Button>
                    <Button onClick={() => setCurrentStep(4)}>Next: Services →</Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Included Services</h3>
                  <p className="text-primary-600 mb-4">What's included in the trip price</p>
                  
                  {/* Transport & Meals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-3">🚗 Transportation</h4>
                      <div className="space-y-2">
                        {['Airport transfers', 'Local transport', 'Private car', 'Public transport', 'Taxi/Uber credits'].map(transport => (
                          <label key={transport} className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="mr-2"
                              checked={includedServices.transport.includes(transport)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setIncludedServices(prev => ({
                                    ...prev,
                                    transport: [...prev.transport, transport]
                                  }));
                                } else {
                                  setIncludedServices(prev => ({
                                    ...prev,
                                    transport: prev.transport.filter(t => t !== transport)
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm">{transport}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-primary-900 mb-3">🍽️ Meals</h4>
                      <div className="space-y-2">
                        {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Welcome drink', 'Cooking class'].map(meal => (
                          <label key={meal} className="flex items-center">
                            <input 
                              type="checkbox" 
                              className="mr-2"
                              checked={includedServices.meals.includes(meal)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setIncludedServices(prev => ({
                                    ...prev,
                                    meals: [...prev.meals, meal]
                                  }));
                                } else {
                                  setIncludedServices(prev => ({
                                    ...prev,
                                    meals: prev.meals.filter(m => m !== meal)
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm">{meal}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Other Services */}
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-3">👥 Other Services</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="mr-2"
                          checked={includedServices.guides}
                          onChange={(e) => setIncludedServices(prev => ({ ...prev, guides: e.target.checked }))}
                        />
                        <span className="text-sm">👨‍🏫 Tour Guide</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">📷 Photography</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">🎁 Welcome kit</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">📱 SIM card</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">🌍 Travel insurance</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">📞 24/7 support</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Note:</strong> Flights and hotels are managed separately. 
                      Day-specific activities are added in the Itinerary tab.
                    </p>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => setCurrentStep(3)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(5)}>
                        Next →
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 5 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Travel Information</h3>
                  
                  {/* Best Time to Visit */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Best Time to Visit</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Best Months</label>
                        <input {...form.register('bestTimeMonths')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="April, May, June" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Weather</label>
                        <input {...form.register('weather')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Sunny and dry" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Min Temp (°C)</label>
                          <input {...form.register('minTemp')} type="number" 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="20" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Max Temp (°C)</label>
                          <input {...form.register('maxTemp')} type="number" 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="30" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visa & Health */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Visa & Health Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('visaRequired')} className="mr-2" />
                          <span className="text-sm font-semibold text-primary-900">📝 Visa Required</span>
                        </label>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Visa Cost ($)</label>
                          <input {...form.register('visaCost')} type="number" min="0" 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" placeholder="35" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('healthInsurance')} className="mr-2" />
                          <span className="text-sm font-semibold text-primary-900">🏥 Health Insurance Required</span>
                        </label>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Vaccinations</label>
                          <input {...form.register('vaccinations')} 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="None required" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Local Culture */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Local Culture</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Languages</label>
                        <input {...form.register('languages')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="English, Local language" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Local Currency</label>
                        <input {...form.register('localCurrency')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="USD, EUR" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Safety Level</label>
                        <select {...form.register('safetyLevel')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                          <option value="low">Low Risk</option>
                          <option value="moderate">Moderate Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Local Customs & Etiquette</label>
                      <textarea {...form.register('customs')} rows={3} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Dress modestly at religious sites, remove shoes before entering temples..." />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveCurrentTab} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save'}
                      </Button>
                      {!isEditMode && (
                        <Button variant="outline" onClick={() => setCurrentStep(6)}>Next →</Button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 6 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Trip Settings</h3>
                  
                  {/* Availability Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Availability</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Max Bookings</label>
                        <input {...form.register('maxBookings')} type="number" min="1" defaultValue="20" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('seasonal')} className="mr-2" />
                          <span className="text-sm font-semibold text-primary-900">🌿 Seasonal Trip</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Sharing Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Sharing & Privacy</h4>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('isPublic')} className="mr-2" defaultChecked />
                        <span className="text-sm font-semibold text-primary-900">🌍 Public Trip (visible to everyone)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('allowCopy')} className="mr-2" defaultChecked />
                        <span className="text-sm font-semibold text-primary-900">📋 Allow others to copy this trip</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" {...form.register('allowComments')} className="mr-2" defaultChecked />
                        <span className="text-sm font-semibold text-primary-900">💬 Allow comments and reviews</span>
                      </label>
                    </div>
                  </div>

                  {/* Customization Settings */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Customization Options</h4>
                    <p className="text-sm text-primary-600 mb-3">Allow customers to customize these aspects of the trip</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">📅 Duration</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">🎭 Activities</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">🏨 Hotels</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">📅 Dates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">👥 Group Size</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(5)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveCurrentTab} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save'}
                      </Button>
                      {!isEditMode && (
                        <Button variant="outline" onClick={() => setCurrentStep(7)}>Next →</Button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 7 && (createdPackageId || isEditMode) && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Upload Package Images</h3>
                  <ImageUpload 
                    images={uploadedImages}
                    onImagesChange={setUploadedImages}
                    onImagesUploaded={handleImagesUploaded}
                    category="trip"
                    packageId={isEditMode ? packageId! : createdPackageId!}
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-primary-900 mb-3">Uploaded Images ({uploadedImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={image.url?.startsWith('http') ? image.url : `http://localhost:3000${image.url}`} 
                              alt={image.alt} 
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                              }}
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
                    <Button variant="outline" onClick={() => setCurrentStep(6)}>← Previous</Button>
                    <Button onClick={onClose}>💾 Save & Close</Button>
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