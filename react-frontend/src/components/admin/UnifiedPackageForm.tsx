import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import MultiSelect from '@/components/common/MultiSelect';
import Button from '@/components/common/Button';
import ItineraryBuilder from './ItineraryBuilder';
import ImageUpload from './ImageUpload';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/config/api.config';
import { APP_CONSTANTS, TRIP_CONSTANTS, FORM_CONSTANTS, getCurrencySymbol } from '@/constants/app.constants';

interface PackageFormData {
  title: string;
  description: string;
  destinations: string;
  duration: number;
  price: number;
  basePrice: number;
  sellPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  profitMargin: number;
  taxIncluded: boolean;
  currency: string;
  category: string;
  includes: string;
  excludes: string;
  highlights: string;
  featured: boolean;
  quickAccess: boolean;
  template: boolean;
  priority: number;
  status: string;
  type: string;
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
  specialNeeds: string;
  priceRange: string;
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
  paymentTerms: string;
  depositRequired: number;
  finalPaymentDue: number;
  // Travel Info
  bestTimeMonths: string;
  weather: string;
  minTemp: number;
  maxTemp: number;
  rainfall: string;
  visaRequired: boolean;
  visaCountries: string;
  visaProcessingTime: string;
  visaCost: number;
  healthInsurance: boolean;
  vaccinations: string;
  medicalFacilities: string;
  safetyLevel: string;
  safetyWarnings: string;
  emergencyContacts: string;
  languages: string;
  localCurrency: string;
  customs: string;
  etiquette: string;
  packingEssentials: string;
  packingClothing: string;
  packingEquipment: string;
  packingOptional: string;
  // Availability
  maxBookings: number;
  seasonal: boolean;
  // Sharing
  isPublic: boolean;
  allowCopy: boolean;
  allowComments: boolean;
  // Customization
  customizableDuration: boolean;
  customizableActivities: boolean;
  customizableAccommodation: boolean;
  customizableDates: boolean;
  customizableGroupSize: boolean;
  tags: string;
}

interface UnifiedPackageFormProps {
  packageId?: string; // If provided, it's edit mode
  onClose: () => void;
}

const UnifiedPackageForm: React.FC<UnifiedPackageFormProps> = ({ packageId, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdPackageId, setCreatedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itinerary, setItinerary] = useState<{ overview: string; days: any[] }>({ overview: '', days: [] });
  const [tripDuration, setTripDuration] = useState(FORM_CONSTANTS.MIN_DURATION_DAYS || 7);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [includedServices, setIncludedServices] = useState<{
    flights: string[];
    hotels: string[];
    activities: string[];
    transport: string[];
    meals: string[];
    guides: boolean;
  }>({
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
      currency: APP_CONSTANTS.DEFAULT_CURRENCY,
      featured: false
    }
  });

  const calculatePricing = useCallback(() => {
    // Calculate sellPrice from breakdown components (schema-compliant)
    const safeParseFloat = (value: any) => {
      const parsed = parseFloat(value?.toString() || '0');
      return isNaN(parsed) ? 0 : parsed;
    };
    
    const breakdown = {
      flights: safeParseFloat(form.getValues('priceBreakdownFlights')),
      accommodation: safeParseFloat(form.getValues('priceBreakdownAccommodation')),
      activities: safeParseFloat(form.getValues('priceBreakdownActivities')),
      food: safeParseFloat(form.getValues('priceBreakdownFood')),
      transport: safeParseFloat(form.getValues('priceBreakdownTransport')),
      other: safeParseFloat(form.getValues('priceBreakdownOther'))
    };
    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    form.setValue('sellPrice', total); // sellPrice = breakdown total
    
    // Calculate profit margin: (sellPrice - basePrice) / basePrice * 100
    const basePrice = safeParseFloat(form.getValues('basePrice'));
    if (basePrice > 0 && total > 0) {
      const profitMargin = ((total - basePrice) / basePrice * 100);
      form.setValue('profitMargin', isNaN(profitMargin) ? 0 : parseFloat(profitMargin.toFixed(1)));
    }
    
    // Calculate finalPrice: sellPrice - discount = what customer pays
    const discountPercent = safeParseFloat(form.getValues('discountPercent'));
    const discountAmount = safeParseFloat(form.getValues('discountAmount'));
    let finalPrice = total;
    
    if (discountPercent > 0 && total > 0) {
      finalPrice = total - (total * discountPercent / 100);
      const calculatedDiscountAmount = total * discountPercent / 100;
      form.setValue('discountAmount', isNaN(calculatedDiscountAmount) ? 0 : parseFloat(calculatedDiscountAmount.toFixed(2)));
    } else if (discountAmount > 0 && total > 0) {
      finalPrice = total - discountAmount;
      const calculatedDiscountPercent = (discountAmount / total * 100);
      form.setValue('discountPercent', isNaN(calculatedDiscountPercent) ? 0 : parseFloat(calculatedDiscountPercent.toFixed(1)));
    }
    
    // Ensure final price is never negative
    finalPrice = Math.max(0, finalPrice);
    form.setValue('finalPrice', isNaN(finalPrice) ? 0 : parseFloat(finalPrice.toFixed(2)));
  }, [form]);

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Pricing', icon: '💰' },
    { id: 3, title: 'Itinerary', icon: '🗓️' },
    { id: 4, title: 'Travel Info', icon: 'ℹ️' },
    { id: 5, title: 'Settings', icon: '⚙️' },
    { id: 6, title: 'Images', icon: '📸' }
  ];

  useEffect(() => {
    loadCategories();
    if (isEditMode && packageId) {
      loadPackageData();
    }
    
    return () => {
      setErrors([]);
      setHasUnsavedChanges(false);
    };
  }, [isEditMode, packageId]);
  
  // Auto-calculate pricing when breakdown values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && [
        'priceBreakdownFlights',
        'priceBreakdownAccommodation', 
        'priceBreakdownActivities',
        'priceBreakdownFood',
        'priceBreakdownTransport',
        'priceBreakdownOther',
        'basePrice',
        'discountPercent',
        'discountAmount'
      ].includes(name)) {
        calculatePricing();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, calculatePricing]);
  
  const loadCategories = async () => {
    try {
      const [categoriesResponse, citiesResponse, countriesResponse] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.MASTER_CATEGORIES}?type=trip`),
        apiService.get(`/locations/cities?limit=${APP_CONSTANTS.DEFAULT_PAGE_SIZE * 10}`),
        apiService.get(API_ENDPOINTS.MASTER_COUNTRIES)
      ]);
      
      if (categoriesResponse.success) {
        setCategories((categoriesResponse.data as any)?.categories || []);
      }
      
      if (citiesResponse.success) {
        setCities((citiesResponse.data as any)?.cities || []);
      }
      
      if (countriesResponse.success) {
        setCountries((countriesResponse.data as any)?.countries || []);
      }
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };



  const loadPackageData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`${API_ENDPOINTS.TRIPS}/${packageId}`);
      if (response.success && response.data) {
        const packageData = (response.data as any)?.trip || (response.data as any)?.package || response.data;
        // Use dedicated fields if available, otherwise extract from tags
        const highlights = packageData.highlights?.join(', ') || 
          packageData.tags?.filter((tag: string) => 
            ['5-star', 'luxury', 'villa', 'spa', 'resort', 'private', 'premium'].some((keyword: string) => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        const includes = packageData.includes?.join(', ') || 
          packageData.tags?.filter((tag: string) => 
            ['flights', 'hotels', 'meals', 'tours', 'guide', 'transport', 'accommodation'].some((keyword: string) => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        const excludes = packageData.excludes?.join(', ') || 
          packageData.tags?.filter((tag: string) => 
            ['insurance', 'personal', 'visa', 'tips'].some((keyword: string) => 
              tag.toLowerCase().includes(keyword)
            )
          ).join(', ') || '';
        
        form.reset({
          title: packageData.title || '',
          description: packageData.description || '',
          destinations: (() => {
            const parts = [];
            if (packageData.primaryDestination?.name) {
              parts.push(packageData.primaryDestination.name);
              if (packageData.primaryDestination.country?.name) {
                parts.push(packageData.primaryDestination.country.name);
              }
            }
            if (packageData.destinations && packageData.destinations.length > 0) {
              packageData.destinations.forEach((dest: any) => {
                if (typeof dest === 'string') {
                  parts.push(dest);
                } else if (dest.name) {
                  parts.push(dest.name);
                }
              });
            }
            return parts.join(', ');
          })(),
          duration: packageData.duration?.days || packageData.duration || 7,
          price: packageData.pricing?.estimated || packageData.price?.amount || packageData.price || 0,
          basePrice: packageData.pricing?.basePrice || 0,
          sellPrice: packageData.pricing?.sellPrice || 0,
          discountPercent: packageData.pricing?.discountPercent || 0,
          discountAmount: packageData.pricing?.discountAmount || 0,
          finalPrice: packageData.pricing?.finalPrice || 0,
          profitMargin: packageData.pricing?.profitMargin || 0,
          taxIncluded: packageData.pricing?.taxIncluded !== false,
          currency: packageData.pricing?.currency || packageData.price?.currency || 'USD',
          category: packageData.category?.name || packageData.category || '',
          highlights,
          includes,
          excludes,
          featured: packageData.featured || false,
          quickAccess: packageData.quickAccess || false,
          template: packageData.template || false,
          priority: packageData.priority || 0,
          status: packageData.status || 'draft',
          type: packageData.type || 'custom',
          tags: packageData.tags?.join(', ') || '',
          travelStyle: packageData.travelStyle || 'cultural',
          difficulty: packageData.difficulty || 'moderate',
          couples: packageData.suitableFor?.couples || false,
          families: packageData.suitableFor?.families || false,
          soloTravelers: packageData.suitableFor?.soloTravelers || false,
          groups: packageData.suitableFor?.groups || false,
          minGroupSize: packageData.groupSize?.min || 1,
          maxGroupSize: packageData.groupSize?.max || 20,
          recommendedGroupSize: packageData.groupSize?.recommended || 4,
          fitnessLevel: packageData.physicalRequirements?.fitnessLevel || 'low',
          walkingDistance: packageData.physicalRequirements?.walkingDistance || 0,
          altitude: packageData.physicalRequirements?.altitude || 0,
          specialNeeds: packageData.physicalRequirements?.specialNeeds?.join(', ') || '',
          priceRange: packageData.pricing?.priceRange || 'mid-range',
          priceBreakdownFlights: packageData.pricing?.breakdown?.flights || 0,
          priceBreakdownAccommodation: packageData.pricing?.breakdown?.accommodation || 0,
          priceBreakdownActivities: packageData.pricing?.breakdown?.activities || 0,
          priceBreakdownFood: packageData.pricing?.breakdown?.food || 0,
          priceBreakdownTransport: packageData.pricing?.breakdown?.transport || 0,
          priceBreakdownOther: packageData.pricing?.breakdown?.other || 0,
          instantBook: packageData.bookingInfo?.instantBook || false,
          requiresApproval: packageData.bookingInfo?.requiresApproval !== false,
          advanceBooking: packageData.bookingInfo?.advanceBooking || 7,
          cancellationPolicy: packageData.bookingInfo?.cancellationPolicy || '',
          paymentTerms: packageData.bookingInfo?.paymentTerms || '',
          depositRequired: packageData.bookingInfo?.depositRequired || 50,
          finalPaymentDue: packageData.bookingInfo?.finalPaymentDue || 30,
          // Travel Info
          bestTimeMonths: Array.isArray(packageData.travelInfo?.bestTimeToVisit?.months) 
            ? packageData.travelInfo.bestTimeToVisit.months.join(', ') 
            : packageData.travelInfo?.bestTimeToVisit?.months || '',
          weather: packageData.travelInfo?.bestTimeToVisit?.weather || '',
          minTemp: packageData.travelInfo?.bestTimeToVisit?.temperature?.min || 0,
          maxTemp: packageData.travelInfo?.bestTimeToVisit?.temperature?.max || 0,
          rainfall: packageData.travelInfo?.bestTimeToVisit?.rainfall || '',
          visaRequired: packageData.travelInfo?.visaRequirements?.required || false,
          visaCountries: Array.isArray(packageData.travelInfo?.visaRequirements?.countries)
            ? packageData.travelInfo.visaRequirements.countries.join(', ')
            : packageData.travelInfo?.visaRequirements?.countries || '',
          visaProcessingTime: packageData.travelInfo?.visaRequirements?.processingTime || '',
          visaCost: packageData.travelInfo?.visaRequirements?.cost || 0,
          healthInsurance: packageData.travelInfo?.healthRequirements?.healthInsurance || false,
          vaccinations: Array.isArray(packageData.travelInfo?.healthRequirements?.vaccinations)
            ? packageData.travelInfo.healthRequirements.vaccinations.join(', ')
            : packageData.travelInfo?.healthRequirements?.vaccinations || '',
          medicalFacilities: packageData.travelInfo?.healthRequirements?.medicalFacilities || '',
          safetyLevel: packageData.travelInfo?.safetyInformation?.level || 'low',
          safetyWarnings: Array.isArray(packageData.travelInfo?.safetyInformation?.warnings)
            ? packageData.travelInfo.safetyInformation.warnings.join(', ')
            : packageData.travelInfo?.safetyInformation?.warnings || '',
          emergencyContacts: Array.isArray(packageData.travelInfo?.safetyInformation?.emergencyContacts)
            ? packageData.travelInfo.safetyInformation.emergencyContacts.join(', ')
            : packageData.travelInfo?.safetyInformation?.emergencyContacts || '',
          languages: Array.isArray(packageData.travelInfo?.localCulture?.language)
            ? packageData.travelInfo.localCulture.language.join(', ')
            : packageData.travelInfo?.localCulture?.language || '',
          localCurrency: packageData.travelInfo?.localCulture?.currency || '',
          customs: Array.isArray(packageData.travelInfo?.localCulture?.customs)
            ? packageData.travelInfo.localCulture.customs.join(', ')
            : packageData.travelInfo?.localCulture?.customs || '',
          etiquette: Array.isArray(packageData.travelInfo?.localCulture?.etiquette)
            ? packageData.travelInfo.localCulture.etiquette.join(', ')
            : packageData.travelInfo?.localCulture?.etiquette || '',
          packingEssentials: Array.isArray(packageData.travelInfo?.packingList?.essentials)
            ? packageData.travelInfo.packingList.essentials.join(', ')
            : packageData.travelInfo?.packingList?.essentials || '',
          packingClothing: Array.isArray(packageData.travelInfo?.packingList?.clothing)
            ? packageData.travelInfo.packingList.clothing.join(', ')
            : packageData.travelInfo?.packingList?.clothing || '',
          packingEquipment: Array.isArray(packageData.travelInfo?.packingList?.equipment)
            ? packageData.travelInfo.packingList.equipment.join(', ')
            : packageData.travelInfo?.packingList?.equipment || '',
          packingOptional: Array.isArray(packageData.travelInfo?.packingList?.optional)
            ? packageData.travelInfo.packingList.optional.join(', ')
            : packageData.travelInfo?.packingList?.optional || '',
          // Availability & Sharing
          maxBookings: packageData.availability?.maxBookings || 20,
          seasonal: packageData.availability?.seasonal || false,
          isPublic: packageData.sharing?.isPublic !== false,
          allowCopy: packageData.sharing?.allowCopy !== false,
          allowComments: packageData.sharing?.allowComments !== false,
          // Customization
          customizableDuration: packageData.customizable?.duration !== false,
          customizableActivities: packageData.customizable?.activities !== false,
          customizableAccommodation: packageData.customizable?.accommodation !== false,
          customizableDates: packageData.customizable?.dates !== false,
          customizableGroupSize: packageData.customizable?.groupSize !== false
        });
        
        // Initialize selected destinations and countries
        const destIds = [];
        if (packageData.primaryDestination) {
          destIds.push(packageData.primaryDestination._id || packageData.primaryDestination);
        }
        if (packageData.destinations && packageData.destinations.length > 0) {
          destIds.push(...packageData.destinations.map((d: any) => d._id || d));
        }
        setSelectedDestinations(destIds);
        
        if (packageData.countries && packageData.countries.length > 0) {
          setSelectedCountries(packageData.countries.map((c: any) => c._id || c));
        }
        
        if (packageData.itinerary) {
          let itineraryData;
          if (Array.isArray(packageData.itinerary)) {
            // Handle array format (days only)
            itineraryData = { overview: '', days: packageData.itinerary };
          } else if (packageData.itinerary.days) {
            // Handle object format with days array
            itineraryData = packageData.itinerary;
          } else {
            // Handle other formats
            itineraryData = { overview: '', days: [] };
          }
          
          // Ensure each day has proper locationName field
          if (itineraryData.days) {
            itineraryData.days = itineraryData.days.map((day: any) => ({
              ...day,
              locationName: day.locationName || day.location || '',
              estimatedCost: {
                ...day.estimatedCost,
                currency: day.estimatedCost?.currency || packageData.pricing?.currency || 'USD'
              }
            }));
          }
          
          setItinerary(itineraryData);
          setTripDuration(packageData.duration?.days || itineraryData.days?.length || 7);
        } else {
          setTripDuration(packageData.duration?.days || 7);
        }
        
        if (packageData.includedServices) {
          setIncludedServices({
            flights: packageData.includedServices.flights || [],
            hotels: packageData.includedServices.hotels || [],
            activities: packageData.includedServices.activities || [],
            transport: packageData.includedServices.transport || [],
            meals: packageData.includedServices.meals || [],
            guides: packageData.includedServices.guides || false
          });
        }
        
        if (packageData.images) {
          setUploadedImages(packageData.images);
        }
      }
    } catch (error) {
      console.error('Failed to load package data', { error, packageId });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoSubmit = async (data: PackageFormData) => {
    setSaving(true);
    setErrors([]);
    try {
      // Get destination and category
      let primaryDestination = selectedDestinations[0] || null;
      let categoryId = null;
      
      if (!primaryDestination) {
        console.error('Form validation failed: No primary destination selected');
        setErrors(['Please select a primary destination']);
        setSaving(false);
        return;
      }
      
      // Get category
      if (data.category && categories.length > 0) {
        const category = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
        if (category) categoryId = category._id;
      }
      

      
      // Validate pricing logic - ensure schema compliance
      // basePrice: your cost, sellPrice: breakdown total, finalPrice: customer pays
      const basePrice = parseFloat(data.basePrice?.toString()) || 0;
      const sellPrice = parseFloat(data.sellPrice?.toString()) || 0;
      const finalPrice = parseFloat(data.finalPrice?.toString()) || 0;
      
      // Business logic validation: sellPrice must be higher than basePrice for profit
      if (basePrice >= sellPrice && basePrice > 0) {
        console.warn('Pricing validation failed: Sell price not higher than base price', { basePrice, sellPrice });
        setErrors(['Sell price must be higher than base price to ensure profit margin']);
        setSaving(false);
        return;
      }
      
      // Schema validation: finalPrice should not exceed sellPrice (discount logic)
      if (finalPrice > sellPrice && sellPrice > 0) {
        console.warn('Pricing validation failed: Final price exceeds sell price', { finalPrice, sellPrice });
        setErrors(['Final price cannot be higher than sell price (check discount calculation)']);
        setSaving(false);
        return;
      }
      
      const transformedData = {
        title: data.title,
        description: data.description,
        primaryDestination: primaryDestination,
        destinations: selectedDestinations.slice(1), // Additional destinations (excluding primary)
        countries: selectedCountries,
        duration: {
          days: parseInt(data.duration.toString()),
          nights: parseInt(data.duration.toString()) - 1
        },
        pricing: {
          // Schema-compliant pricing structure
          // basePrice: what you pay, sellPrice: breakdown total, finalPrice: customer pays
          basePrice: basePrice,
          sellPrice: sellPrice, // This should equal breakdown total
          discountPercent: parseFloat(data.discountPercent?.toString()) || 0,
          discountAmount: parseFloat(data.discountAmount?.toString()) || 0,
          finalPrice: finalPrice, // sellPrice - discount = finalPrice
          profitMargin: parseFloat(data.profitMargin?.toString()) || ((sellPrice - basePrice) / basePrice * 100),
          taxIncluded: data.taxIncluded !== false,
          estimated: parseFloat(data.price?.toString()) || parseFloat(data.finalPrice?.toString()) || 0,
          currency: data.currency || 'USD',
          priceRange: data.priceRange || (parseFloat(data.price?.toString() || '0') < 1000 ? 'budget' : parseFloat(data.price?.toString() || '0') < 3000 ? 'mid-range' : 'luxury'),
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
        tags: Array.from(new Set([
          ...(data.tags ? data.tags.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : []),
          ...(data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [])
        ])),
        highlights: data.highlights ? data.highlights.split(',').map(item => item.trim()).filter(item => item) : [],
        includes: data.includes ? data.includes.split(',').map(item => item.trim()).filter(item => item) : [],
        excludes: data.excludes ? data.excludes.split(',').map(item => item.trim()).filter(item => item) : [],
        featured: data.featured || false,
        quickAccess: data.quickAccess || false,
        template: data.template || false,
        priority: parseInt(data.priority?.toString()) || 0,
        status: data.status || 'published',
        type: data.type || 'custom',
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
          specialNeeds: data.specialNeeds ? data.specialNeeds.split(',').map(item => item.trim()).filter(item => item) : []
        },
        customizable: {
          duration: data.customizableDuration !== false,
          activities: data.customizableActivities !== false,
          accommodation: data.customizableAccommodation !== false,
          dates: data.customizableDates !== false,
          groupSize: data.customizableGroupSize !== false
        },
        bookingInfo: {
          instantBook: data.instantBook || false,
          requiresApproval: data.requiresApproval !== false,
          advanceBooking: parseInt(data.advanceBooking?.toString()) || 7,
          cancellationPolicy: data.cancellationPolicy || '',
          paymentTerms: data.paymentTerms || '',
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
        const response = await apiService.put(`${API_ENDPOINTS.TRIPS}/${packageId}`, transformedData);
        if (response.success) {
          console.info('Package updated successfully', { packageId });
        } else {
          console.error('Failed to update package', { packageId, error: response.errors });
          setErrors(Array.isArray(response.errors) ? response.errors : [response.errors || 'Failed to update package']);
        }
      } else {
        // Create new package
        const response = await apiService.post(API_ENDPOINTS.TRIPS, transformedData);
        if (response.success) {
          const createdId = (response.data as any)?.trip?._id || (response.data as any)?.package?._id || (response.data as any)?._id;
          console.info('Package created successfully', { createdId });
          setCreatedPackageId(createdId);
          setCurrentStep(2);
        } else {
          console.error('Failed to create package', { error: response.errors });
          setErrors(Array.isArray(response.errors) ? response.errors : [response.errors || 'Failed to create package']);
        }
      }
    } catch (error) {
      console.error('Package save operation failed', { error, isEditMode, packageId });
      setErrors(['Failed to save package. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  const handleItinerarySave = async (itineraryData: any) => {
    const targetPackageId = isEditMode ? packageId : createdPackageId;
    if (!targetPackageId) return;
    
    try {
      // Ensure itinerary has proper structure with day numbers
      const formattedItinerary = itineraryData.days?.map((day: any, index: number) => {
        const dayNumber = day.day || index + 1;
        return {
          day: Number(dayNumber),
          title: day.title || `Day ${dayNumber}`,
          description: day.description || '',
          locationName: day.locationName || day.location || '',
          activities: (day.activities || []).map((activity: any) => ({
            ...activity,
            location: typeof activity.location === 'string' ? activity.location : activity.location || ''
          })),
          estimatedCost: day.estimatedCost || { currency: form.getValues('currency') || 'USD', amount: 0 },
          tips: day.tips || []
        };
      }) || [];
      
      await apiService.put(`${API_ENDPOINTS.TRIPS}/${targetPackageId}`, { 
        itinerary: formattedItinerary
      });
      setItinerary({ ...itineraryData, days: formattedItinerary });
      if (isEditMode) {
        console.info('Itinerary updated successfully', { targetPackageId });
      } else {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Itinerary save operation failed', { error, targetPackageId, isEditMode });
    }
  };

  const handleSaveCurrentTab = async () => {
    const data = form.getValues();
    const targetPackageId = isEditMode ? packageId : createdPackageId;
    
    if (!targetPackageId) {
      console.warn('Save current tab failed: No target package ID available');
      setSaving(false);
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        travelInfo: {
          bestTimeToVisit: {
            months: data.bestTimeMonths ? data.bestTimeMonths.split(',').map(m => m.trim()).filter(m => m) : [],
            weather: data.weather || '',
            temperature: { min: data.minTemp || 0, max: data.maxTemp || 0 },
            rainfall: data.rainfall || ''
          },
          visaRequirements: {
            required: data.visaRequired || false,
            countries: data.visaCountries ? data.visaCountries.split(',').map(c => c.trim()).filter(c => c) : [],
            processingTime: data.visaProcessingTime || '',
            cost: data.visaCost || 0
          },
          healthRequirements: {
            healthInsurance: data.healthInsurance || false,
            vaccinations: data.vaccinations ? data.vaccinations.split(',').map(v => v.trim()).filter(v => v) : [],
            medicalFacilities: data.medicalFacilities || ''
          },
          safetyInformation: {
            level: data.safetyLevel || 'low',
            warnings: data.safetyWarnings ? data.safetyWarnings.split(',').map(w => w.trim()).filter(w => w) : [],
            emergencyContacts: data.emergencyContacts ? data.emergencyContacts.split(',').map(e => e.trim()).filter(e => e) : []
          },
          localCulture: {
            language: data.languages ? data.languages.split(',').map(l => l.trim()).filter(l => l) : [],
            currency: data.localCurrency || '',
            customs: data.customs ? data.customs.split(',').map(c => c.trim()).filter(c => c) : [],
            etiquette: data.etiquette ? data.etiquette.split(',').map(e => e.trim()).filter(e => e) : []
          },
          packingList: {
            essentials: data.packingEssentials ? data.packingEssentials.split(',').map(e => e.trim()).filter(e => e) : [],
            clothing: data.packingClothing ? data.packingClothing.split(',').map(c => c.trim()).filter(c => c) : [],
            equipment: data.packingEquipment ? data.packingEquipment.split(',').map(e => e.trim()).filter(e => e) : [],
            optional: data.packingOptional ? data.packingOptional.split(',').map(o => o.trim()).filter(o => o) : []
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
        customizable: {
          duration: data.customizableDuration !== false,
          activities: data.customizableActivities !== false,
          accommodation: data.customizableAccommodation !== false,
          dates: data.customizableDates !== false,
          groupSize: data.customizableGroupSize !== false
        },
        includedServices: includedServices
      };
      
      await apiService.put(`${API_ENDPOINTS.TRIPS}/${targetPackageId}`, updateData);
      setHasUnsavedChanges(false);
      console.info('Tab changes saved successfully', { targetPackageId });
    } catch (error) {
      console.error('Tab save operation failed', { error, targetPackageId });
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
        await apiService.put(`${API_ENDPOINTS.TRIPS}/${targetPackageId}`, { images: newImages });
        console.info('Images saved to trip successfully', { targetPackageId, imageCount: newImages.length });
      } catch (error) {
        console.error('Failed to save images to trip', { error, targetPackageId, imageCount: newImages.length });
      }
    }
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
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-ocean mb-4"></div>
              <p className="text-primary-600 font-medium">Loading trip data...</p>
              <p className="text-primary-400 text-sm mt-1">Please wait while we fetch the details</p>
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
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Primary Destination *</label>
                      <MultiSelect
                        options={cities.map(city => ({
                          value: city._id,
                          label: city.name,
                          subtitle: city.country?.name || city.state?.name
                        }))}
                        value={selectedDestinations.slice(0, 1)}
                        onChange={(values) => {
                          setSelectedDestinations([...values, ...selectedDestinations.slice(1)]);
                          if (values.length > 0) {
                            const selectedCity = cities.find(c => c._id === values[0]);
                            if (selectedCity) {
                              form.setValue('destinations', `${selectedCity.name}, ${selectedCity.country?.name || ''}`);
                              
                              // Auto-populate country if not already selected
                              if (selectedCity.country?._id && !selectedCountries.includes(selectedCity.country._id)) {
                                setSelectedCountries([...selectedCountries, selectedCity.country._id]);
                              }
                            }
                          }
                        }}
                        placeholder="Select primary destination..."
                        searchable={true}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Additional Destinations</label>
                      <MultiSelect
                        options={cities.map(city => ({
                          value: city._id,
                          label: city.name,
                          subtitle: city.country?.name || city.state?.name
                        }))}
                        value={selectedDestinations.slice(1)}
                        onChange={(values) => {
                          const primary = selectedDestinations[0];
                          setSelectedDestinations(primary ? [primary, ...values] : values);
                          
                          // Auto-populate countries from additional destinations
                          const newCountries = [...selectedCountries];
                          values.forEach(destId => {
                            const city = cities.find(c => c._id === destId);
                            if (city?.country?._id && !newCountries.includes(city.country._id)) {
                              newCountries.push(city.country._id);
                            }
                          });
                          setSelectedCountries(newCountries);
                        }}
                        placeholder="Select additional destinations..."
                        searchable={true}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Countries</label>
                      <MultiSelect
                        options={countries.map(country => ({
                          value: country._id,
                          label: country.name,
                          subtitle: country.code
                        }))}
                        value={selectedCountries}
                        onChange={setSelectedCountries}
                        placeholder="Select countries..."
                        searchable={true}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
                            newDays = [...currentDays, ...additionalDays] as any[];
                          } else {
                            // Remove excess days
                            newDays = currentDays.slice(0, days);
                          }
                          
                          setItinerary({ overview: itinerary.overview || '', days: newDays });
                        }} />
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Travel Style</label>
                      <select {...form.register('travelStyle')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        {TRIP_CONSTANTS.CATEGORIES.map(style => (
                          <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Difficulty</label>
                      <select {...form.register('difficulty')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        {TRIP_CONSTANTS.DIFFICULTY_LEVELS.map(level => (
                          <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                        ))}
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
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Price Range</label>
                      <select {...form.register('priceRange')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        {TRIP_CONSTANTS.BUDGET_RANGES.map(range => (
                          <option key={range} value={range}>{range.charAt(0).toUpperCase() + range.slice(1).replace('-', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Trip Type</label>
                      <select {...form.register('type')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        {TRIP_CONSTANTS.TYPES.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Status</label>
                      <select {...form.register('status')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Priority</label>
                      <input {...form.register('priority')} type="number" min="0" 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="0" />
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
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-primary-900 mb-3">Special Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center p-3 bg-white rounded-lg border border-primary-200 hover:border-blue-ocean transition-colors cursor-pointer">
                        <input type="checkbox" {...form.register('featured')} className="mr-3" />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">⭐ Featured Trip</span>
                          <p className="text-xs text-primary-500">Show in featured section</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 bg-white rounded-lg border border-primary-200 hover:border-blue-ocean transition-colors cursor-pointer">
                        <input type="checkbox" {...form.register('quickAccess')} className="mr-3" />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">🚀 Quick Access</span>
                          <p className="text-xs text-primary-500">Add to quick access menu</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 bg-white rounded-lg border border-primary-200 hover:border-blue-ocean transition-colors cursor-pointer">
                        <input type="checkbox" {...form.register('template')} className="mr-3" />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">📋 Template</span>
                          <p className="text-xs text-primary-500">Use as template for new trips</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="font-medium text-red-800">Please fix the following errors:</span>
                      </div>
                      <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
                    {isEditMode && (
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </div>
                      ) : isEditMode ? 'Save Changes' : 'Next: Pricing →'}
                    </Button>
                  </div>
                </form>
              )}

              {currentStep === 2 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">💰 Complete Pricing Setup</h3>

                  {/* Step 1: Your Cost */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">💰 Step 1: Your Total Cost</h4>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Your Total Cost (What you pay) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('basePrice', { required: 'Total cost required' })} 
                            type="number" min="0" step="0.01" className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="800" 
                            onChange={() => {
                              const basePrice = parseFloat(form.getValues('basePrice')?.toString() || '0') || 0;
                              const sellPrice = parseFloat(form.getValues('sellPrice')?.toString() || '0') || 0;
                              if (basePrice > 0 && sellPrice > 0) {
                                const profitMargin = ((sellPrice - basePrice) / basePrice * 100);
                                form.setValue('profitMargin', isNaN(profitMargin) ? 0 : parseFloat(profitMargin.toFixed(1)));
                              }
                            }} />
                        </div>
                        <p className="text-xs text-primary-500 mt-1">Include flights, hotels, guides, permits, etc. - everything you pay</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown - Auto-calculates Sell Price */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">💸 Step 2: Customer Price Breakdown</h4>
                    <p className="text-sm text-primary-600 mb-4">Set what customers pay for each component - total becomes your sell price</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Flights</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownFlights')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Accommodation</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownAccommodation')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="700" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Activities</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownActivities')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Food</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownFood')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="30" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Transport</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownTransport')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Other</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('priceBreakdownOther')} type="number" min="0" 
                            className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" placeholder="40" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Auto-calculated Sell Price */}
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-primary-900">Sell Price (Auto-calculated):</span>
                        <span className="font-bold text-2xl text-green-600">
                          {(() => {
                            const currency = form.watch('currency') || 'USD';
                            const symbol = currency === 'INR' ? '₹' : 
                                         currency === 'EUR' ? '€' : 
                                         currency === 'GBP' ? '£' : '$';
                            
                            const safeParseFloat = (value: any) => {
                              const parsed = parseFloat(value?.toString() || '0');
                              return isNaN(parsed) ? 0 : parsed;
                            };
                            
                            const total = safeParseFloat(form.watch('priceBreakdownFlights')) +
                              safeParseFloat(form.watch('priceBreakdownAccommodation')) +
                              safeParseFloat(form.watch('priceBreakdownActivities')) +
                              safeParseFloat(form.watch('priceBreakdownFood')) +
                              safeParseFloat(form.watch('priceBreakdownTransport')) +
                              safeParseFloat(form.watch('priceBreakdownOther'));
                            
                            return `${symbol}${total.toFixed(2)}`;
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">This is what customers see as the original price</p>
                    </div>
                  </div>
                  
                  {/* Step 3: Discount & Final Price */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">🎯 Step 3: Discount & Final Price</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Discount %</label>
                        <input {...form.register('discountPercent')} 
                          type="number" min="0" max="100" step="0.1" className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="10" 
                          onChange={(e) => {
                            const percent = parseFloat(e.target.value) || 0;
                            if (percent > 0) {
                              form.setValue('discountAmount', 0); // Clear amount when using percent
                            }
                          }} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">OR Discount Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('discountAmount')} 
                            type="number" min="0" step="0.01" className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="100" 
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0;
                              if (amount > 0) {
                                form.setValue('discountPercent', 0); // Clear percent when using amount
                              }
                            }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Final Price (Auto)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-600">{getCurrencySymbol(form.watch('currency') || APP_CONSTANTS.DEFAULT_CURRENCY)}</span>
                          <input {...form.register('finalPrice')} 
                            type="number" className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg bg-gray-50" 
                            readOnly />
                        </div>
                        <p className="text-xs text-primary-500 mt-1">What customer actually pays</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profit Analysis */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-primary-900 mb-3">📊 Profit Analysis</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-xl font-bold text-red-600">
                          {(() => {
                            const currency = form.watch('currency') || 'USD';
                            const symbol = currency === 'INR' ? '₹' : 
                                         currency === 'EUR' ? '€' : 
                                         currency === 'GBP' ? '£' : '$';
                            const basePrice = parseFloat(form.watch('basePrice')?.toString() || '0') || 0;
                            return `${symbol}${basePrice.toFixed(2)}`;
                          })()}
                        </div>
                        <div className="text-xs text-red-600 font-medium mt-1">Your Cost</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xl font-bold text-blue-600">
                          {(() => {
                            const currency = form.watch('currency') || 'USD';
                            const symbol = currency === 'INR' ? '₹' : 
                                         currency === 'EUR' ? '€' : 
                                         currency === 'GBP' ? '£' : '$';
                            const sellPrice = parseFloat(form.watch('sellPrice')?.toString() || '0') || 0;
                            return `${symbol}${sellPrice.toFixed(2)}`;
                          })()}
                        </div>
                        <div className="text-xs text-blue-600 font-medium mt-1">Sell Price</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xl font-bold text-green-600">
                          {(() => {
                            const currency = form.watch('currency') || 'USD';
                            const symbol = currency === 'INR' ? '₹' : 
                                         currency === 'EUR' ? '€' : 
                                         currency === 'GBP' ? '£' : '$';
                            const finalPrice = parseFloat(form.watch('finalPrice')?.toString() || '0') || 0;
                            return `${symbol}${finalPrice.toFixed(2)}`;
                          })()}
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-1">Customer Pays</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-xl font-bold text-purple-600">{(parseFloat(form.watch('profitMargin')?.toString() || '0') || 0).toFixed(1)}%</div>
                        <div className="text-xs text-purple-600 font-medium mt-1">Profit Margin</div>
                      </div>
                    </div>
                    
                    {/* Validation */}
                    {Number(form.watch('basePrice') || 0) >= Number(form.watch('sellPrice') || 0) && Number(form.watch('basePrice') || 0) > 0 && (
                      <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm mt-3">
                        ⚠️ Warning: Your sell price should be higher than your cost!
                      </div>
                    )}
                    {Number(form.watch('profitMargin') || 0) < 10 && Number(form.watch('profitMargin') || 0) >= 0 && (
                      <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-3 py-2 rounded text-sm mt-3">
                        💡 Low profit margin. Consider increasing your prices.
                      </div>
                    )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Cancellation Policy</label>
                        <textarea {...form.register('cancellationPolicy')} rows={3} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Free cancellation up to 72 hours before departure..." />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Payment Terms</label>
                        <textarea {...form.register('paymentTerms')} rows={3} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="50% deposit required, balance due 30 days before departure..." />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => setCurrentStep(1)}>← Previous</Button>
                    <div className="flex gap-2">
                      {isEditMode && (
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Saving...' : '💾 Save Pricing'}
                        </Button>
                      )}
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
                    <div className="flex gap-2">
                      {isEditMode && (
                        <Button onClick={async () => {
                          const targetPackageId = isEditMode ? packageId : createdPackageId;
                          if (targetPackageId && itinerary.days && itinerary.days.length > 0) {
                            await handleItinerarySave(itinerary);
                          }
                        }} disabled={saving}>
                          {saving ? 'Saving...' : '💾 Save Itinerary'}
                        </Button>
                      )}
                      <Button onClick={() => setCurrentStep(4)}>Next: Travel Info →</Button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Travel Information & Requirements</h3>
                  
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
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Visa Countries</label>
                          <input {...form.register('visaCountries')} 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="USA, UK, Canada" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Processing Time</label>
                          <input {...form.register('visaProcessingTime')} 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="5-10 business days" />
                        </div>
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
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Medical Facilities</label>
                          <input {...form.register('medicalFacilities')} 
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                            placeholder="Good medical facilities available" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Safety Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Safety Level</label>
                        <select {...form.register('safetyLevel')} className="w-full px-4 py-3 border border-primary-200 rounded-lg">
                          <option value="low">Low Risk</option>
                          <option value="moderate">Moderate Risk</option>
                          <option value="high">High Risk</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Safety Warnings</label>
                        <input {...form.register('safetyWarnings')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Avoid certain areas at night" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Emergency Contacts</label>
                        <input {...form.register('emergencyContacts')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Police: 911, Hospital: 112" />
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
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Etiquette</label>
                        <input {...form.register('etiquette')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Tipping customs, greetings" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Local Customs</label>
                      <textarea {...form.register('customs')} rows={3} 
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                        placeholder="Dress modestly at religious sites, remove shoes before entering temples..." />
                    </div>
                  </div>

                  {/* Packing List */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Packing List</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Essentials</label>
                        <input {...form.register('packingEssentials')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Passport, tickets, insurance" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Clothing</label>
                        <input {...form.register('packingClothing')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Light clothing, swimwear, jacket" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Equipment</label>
                        <input {...form.register('packingEquipment')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Camera, chargers, adapters" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Optional Items</label>
                        <input {...form.register('packingOptional')} 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="Books, games, snacks" />
                      </div>
                    </div>
                  </div>

                  {/* Included Services */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Included Services</h4>
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
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => setCurrentStep(3)}>← Previous</Button>
                    <div className="flex gap-2">
                      {isEditMode && (
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Saving...' : '💾 Save Travel Info'}
                        </Button>
                      )}
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(5)}>
                        Next: Settings →
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 5 && (
                <form onSubmit={form.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                  <h3 className="text-xl font-bold text-primary-900 mb-4">Trip Settings & Customization</h3>
                  
                  {/* Availability & Sharing */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Availability & Sharing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Max Bookings</label>
                        <input {...form.register('maxBookings')} type="number" min="1" 
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg" 
                          placeholder="20" />
                      </div>
                      <div className="flex items-center space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" {...form.register('seasonal')} className="mr-2" />
                          <span className="text-sm font-semibold text-primary-900">🌍 Seasonal Trip</span>
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('isPublic')} className="mr-3" defaultChecked />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">🌐 Public Trip</span>
                          <p className="text-xs text-primary-500">Visible to all users</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('allowCopy')} className="mr-3" defaultChecked />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">📋 Allow Copy</span>
                          <p className="text-xs text-primary-500">Users can copy this trip</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('allowComments')} className="mr-3" defaultChecked />
                        <div>
                          <span className="text-sm font-semibold text-primary-900">💬 Allow Comments</span>
                          <p className="text-xs text-primary-500">Users can comment on trip</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Customization Options */}
                  <div>
                    <h4 className="text-lg font-semibold text-primary-900 mb-3">Customization Options</h4>
                    <p className="text-primary-600 mb-4">Allow customers to customize trip elements</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('customizableDuration')} className="mr-3" defaultChecked />
                        <span className="text-sm font-medium">📅 Duration</span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('customizableActivities')} className="mr-3" defaultChecked />
                        <span className="text-sm font-medium">🎯 Activities</span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('customizableAccommodation')} className="mr-3" defaultChecked />
                        <span className="text-sm font-medium">🏨 Hotels</span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('customizableDates')} className="mr-3" defaultChecked />
                        <span className="text-sm font-medium">📆 Dates</span>
                      </label>
                      <label className="flex items-center p-3 bg-gray-50 rounded-lg border border-primary-200 hover:border-blue-ocean hover:bg-blue-50 transition-all cursor-pointer">
                        <input type="checkbox" {...form.register('customizableGroupSize')} className="mr-3" defaultChecked />
                        <span className="text-sm font-medium">👥 Group Size</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveCurrentTab} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save Settings'}
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentStep(6)}>Next: Images →</Button>
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 6 && (createdPackageId || isEditMode) && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Upload Package Images</h3>
                  <ImageUpload 
                    images={uploadedImages}
                    onImagesChange={setUploadedImages}
                    onImagesUploaded={handleImagesUploaded}
                    category="trip"
                    packageId={isEditMode ? packageId! : createdPackageId!}
                  />
                  
                
                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(5)}>← Previous</Button>
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        if (uploadedImages.length > 0) {
                          await handleImagesUploaded([]);
                        }
                        const targetPackageId = isEditMode ? packageId : createdPackageId;
                        console.info('Trip saved successfully', { targetPackageId });
                      }} disabled={saving}>
                        {saving ? 'Saving...' : '💾 Save Images'}
                      </Button>
                      <Button variant="outline" onClick={onClose}>Close</Button>
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