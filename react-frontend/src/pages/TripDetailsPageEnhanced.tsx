import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { TripData } from '@/types/trip.types';
import { sanitizeHtml, sanitizeUrl } from '@/utils/sanitize';
import { APP_CONSTANTS } from '@/constants/app.constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';



const TripDetailsPageEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const [travelers, setTravelers] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  useEffect(() => {
    if (id) loadTripDetails();
  }, [id]);

  const loadTripDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiService.get(`/trips/${id}`);
      if (data.success) {
        const tripData = data.data.trip || data.data;
        setTrip(tripData);
        // Set end date based on trip duration
        if (tripData.duration?.days) {
          const startDateObj = new Date(startDate);
          const endDateCalc = new Date(startDateObj.getTime() + tripData.duration.days * 24 * 60 * 60 * 1000);
          setEndDate(endDateCalc.toISOString().split('T')[0]);
        }
      } else {
        console.error('API returned error:', data.error);
        // For development, use mock data if API fails
        if (import.meta.env.DEV) {
          setTrip(null);
        }
      }
    } catch (error) {
      console.error('Failed to load trip details:', error);
      // For development, show error state
      if (import.meta.env.DEV) {
        setTrip(null);
      }
    } finally {
      setLoading(false);
    }
  };



  const calculateTotal = () => {
    const tripDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const packageDays = trip?.duration?.days || 5;
    const numberOfPackages = Math.ceil(tripDays / packageDays);
    const packagePrice = trip?.pricing?.finalPrice || trip?.pricing?.estimated || 699.97;
    const basePrice = packagePrice * numberOfPackages;
    const serviceFee = 99;
    return Math.max(0, basePrice + serviceFee);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
        {/* Navigation Skeleton */}
        <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E6E8EC]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </nav>

        <div className="animate-pulse">
          {/* Hero Section Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="h-8 lg:h-12 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            
            {/* Image Gallery Skeleton */}
            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] flex gap-4">
              <div className="flex-1 bg-gray-200 rounded-2xl relative">
                <div className="absolute bottom-4 left-4 w-32 h-8 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-16 h-6 bg-black/20 rounded-full"></div>
              </div>
              <div className="hidden lg:flex flex-col gap-3 w-[200px]">
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Content */}
              <div className="w-full lg:w-2/3 space-y-8">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
                
                {/* Itinerary Skeleton */}
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-[#E6E8EC] rounded-2xl p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Booking Sidebar Skeleton */}
              <div className="w-full lg:w-1/3">
                <div className="bg-[#FCFCFD] border border-[#E6E8EC] rounded-3xl p-8">
                  <div className="mb-8">
                    <div className="flex items-baseline gap-3 mb-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#F4F5F6] rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-8">
                    <div className="w-20 h-12 bg-gray-200 rounded-3xl"></div>
                    <div className="flex-1 h-12 bg-gray-200 rounded-3xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8 bg-white shadow-lg rounded-full p-4 border border-[#E6E8EC]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#3B71FE] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-[#777E90] font-['Poppins']">Loading trip details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FCFCFD] to-white px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-3xl font-black text-[#23262F] mb-4 font-['DM_Sans']">Connection Error</h2>
          <p className="text-[#777E90] mb-4 font-['Poppins']">Unable to connect to the server. Please check if the backend is running.</p>
          <div className="bg-[#F4F5F6] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#777E90] font-['Poppins'] mb-2">Development Info:</p>
            <p className="text-xs text-[#777E90] font-mono">Backend: http://localhost:3000</p>
            <p className="text-xs text-[#777E90] font-mono">Frontend: http://localhost:3001</p>
            <p className="text-xs text-[#777E90] font-mono">Trip ID: {id}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-[#3B71FE] text-white py-3 rounded-2xl font-bold font-['DM_Sans'] hover:bg-[#58C27D] transition-all duration-300"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="flex-1 bg-white border-2 border-[#E6E8EC] text-[#23262F] py-3 rounded-2xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Navigation Breadcrumb */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white border border-[#E6E8EC] px-3 py-2 rounded-full hover:border-[#3B71FE] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline font-bold text-[#23262F] font-['DM_Sans']">Go home</span>
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-bold font-['DM_Sans']">
              <button onClick={() => navigate('/')} className="text-[#777E90] hover:text-[#3B71FE] transition-colors">
                Home
              </button>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <button onClick={() => navigate('/trips')} className="text-[#777E90] hover:text-[#3B71FE] transition-colors">
                Trips
              </button>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#777E90]">
                {trip.primaryDestination?.name || trip.destinations?.[0]?.name || trip.countries?.[0]?.name || 'Destination'}
                {trip.destinations && trip.destinations.length > 1 && (
                  <span className="text-xs ml-1 opacity-75">+{trip.destinations.length - 1} more</span>
                )}
              </span>
              <svg className="w-2 h-2 text-[#777E90]" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#B1B5C3]">{trip.title.length > 12 ? `${trip.title.substring(0, 12)}...` : trip.title}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#23262F] mb-3 lg:mb-4 font-['DM_Sans'] leading-tight">
                {sanitizeHtml(trip.title)}
              </h1>
              <div className="flex items-center flex-wrap gap-2 lg:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FFD166] text-sm">⭐</span>
                  <span className="font-medium text-[#23262F] font-['Poppins'] text-sm">{trip.stats?.rating || 'New'}</span>
                  {trip.stats?.reviewCount > 0 && (
                    <span className="hidden sm:inline text-[#777E90] font-['Poppins'] text-sm">({trip.stats.reviewCount} reviews)</span>
                  )}
                </div>
                {trip.featured && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#58C27D] text-white rounded-full">
                    <span className="text-white text-xs">🏆</span>
                    <span className="text-white font-['Poppins'] text-xs font-medium">Featured</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F4F5F6] rounded-full">
                  <span className="text-[#777E90] text-xs">📍</span>
                  <span className="text-[#777E90] font-['Poppins'] text-xs">
                    {trip.primaryDestination?.name || trip.destinations?.[0]?.name || trip.countries?.[0]?.name || 'Amazing Destination'}
                    {trip.destinations && trip.destinations.length > 1 && (
                      <span className="ml-1">& {trip.destinations.length - 1} more</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3 self-start">
              <button className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
                <span className="text-[#777E90] text-xs lg:text-sm">📍</span>
              </button>
              <button className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
                <span className="text-[#777E90] text-xs lg:text-sm">📤</span>
              </button>
              <button className="w-8 h-8 lg:w-9 lg:h-9 bg-white border border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
                <span className="text-[#777E90] text-xs lg:text-sm">❤️</span>
              </button>
            </div>
          </div>

          {/* Hero Gallery */}
          <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] flex gap-2 lg:gap-4 relative">
            {/* Main Image */}
            <div className="flex-1 relative group">
              <div className="relative w-full h-full">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#3B71FE] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={trip.images?.[selectedImageIndex]?.url 
                    ? (trip.images[selectedImageIndex].url.startsWith('http') ? sanitizeUrl(trip.images[selectedImageIndex].url) : `${API_BASE_URL}${trip.images[selectedImageIndex].url}`)
                    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
                  alt={trip.images?.[selectedImageIndex]?.alt || trip.title}
                  className={`w-full h-full object-cover rounded-2xl shadow-lg transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>
              
              {/* Navigation Buttons */}
              {trip.images && trip.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : trip.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5 text-[#23262F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setSelectedImageIndex(selectedImageIndex < trip.images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <svg className="w-5 h-5 text-[#23262F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Show All Photos Button */}
              <button 
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-[#23262F] px-4 py-2 rounded-full font-bold font-['DM_Sans'] text-sm hover:bg-white transition-colors flex items-center gap-2 shadow-lg"
              >
                <span className="text-sm">🖼️</span>
                <span>Show all photos</span>
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-['Poppins']">
                {selectedImageIndex + 1} / {trip.images?.length || 1}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="hidden lg:flex flex-col gap-2 lg:gap-3 w-[160px] lg:w-[200px]">
              {trip.images?.slice(0, 3).map((image, index) => (
                <div key={index} className="flex-1 relative group cursor-pointer" onClick={() => setSelectedImageIndex(index)}>
                  <img
                    src={image.url?.startsWith('http') 
                      ? sanitizeUrl(image.url) 
                      : `${API_BASE_URL}${image.url}`}
                    alt={image.alt || `${trip.title} ${index + 1}`}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-[#3B71FE] shadow-lg' 
                        : 'hover:shadow-md hover:scale-[1.02] shadow-sm'
                    }`}
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-[#3B71FE]/10 rounded-xl"></div>
                  )}
                </div>
              )) || [
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=180&fit=crop',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=180&fit=crop', 
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=180&fit=crop'
              ].map((src, index) => (
                <div key={index} className="flex-1 relative group cursor-pointer" onClick={() => setSelectedImageIndex(index)}>
                  <img
                    src={src}
                    alt={`${trip.title} ${index + 1}`}
                    className={`w-full h-full object-cover rounded-xl transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-[#3B71FE] shadow-lg' 
                        : 'hover:shadow-md hover:scale-[1.02] shadow-sm'
                    }`}
                  />
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-[#3B71FE]/10 rounded-xl"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Content */}
            <div className="w-full lg:w-2/3 space-y-6 lg:space-y-8">
              {/* Package Info */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#23262F] mb-3 font-['DM_Sans'] leading-tight">
                  {trip.category?.name || 'Adventure Trip'}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[#777E90] font-['Poppins'] text-sm leading-6">Organized by</span>
                  <span className="font-medium text-[#23262F] font-['Poppins'] text-base leading-6">{APP_CONSTANTS.APP_NAME}</span>
                  <span className="px-2 py-1 bg-[#58C27D] text-white rounded-full text-xs font-medium">Verified</span>
                </div>
                
                <div className="border-t border-[#E6E8EC] pt-3 lg:pt-4 flex flex-wrap gap-3 lg:gap-4 mb-6 lg:mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">👥</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm">{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">📅</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm">{trip.duration?.days || 5} days, {trip.duration?.nights || 4} nights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#777E90] text-base">🏨</span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm capitalize">{trip.pricing?.priceRange || 'Quality'} accommodation</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[#777E90] font-['Poppins'] text-sm lg:text-base leading-relaxed mb-4 lg:mb-6">
                  {sanitizeHtml(trip.description)}
                </p>

                <p className="text-[#777E90] font-['Poppins'] text-sm lg:text-base leading-relaxed mb-4 lg:mb-6">
                  This {trip.travelStyle || 'adventure'} experience offers {trip.difficulty || 'easy'} activities perfect for {trip.suitableFor?.couples ? 'couples' : ''}{trip.suitableFor?.families ? (trip.suitableFor?.couples ? ' and families' : 'families') : ''}. Best time to visit: {trip.travelInfo?.bestTimeToVisit?.months?.join(', ') || 'Year-round'}.
                </p>
                
                {/* Destinations Overview */}
                {(trip.primaryDestination || trip.destinations?.length > 0) && (
                  <div className="mb-4 lg:mb-6 bg-[#F4F5F6] rounded-xl p-4">
                    <h4 className="font-bold text-[#23262F] mb-3 font-['DM_Sans'] text-sm lg:text-base flex items-center gap-2">
                      🗺️ Trip Destinations
                    </h4>
                    <div className="space-y-2">
                      {trip.primaryDestination && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#3B71FE] text-white rounded-full text-xs font-medium">Primary</span>
                          <span className="text-[#23262F] font-['Poppins'] text-sm font-medium">{trip.primaryDestination.name}</span>
                        </div>
                      )}
                      {trip.destinations?.filter(dest => dest._id !== trip.primaryDestination?._id).map((destination, index) => (
                        <div key={destination._id} className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-[#58C27D]/20 text-[#58C27D] rounded-full text-xs font-medium">Stop {index + 1}</span>
                          <span className="text-[#777E90] font-['Poppins'] text-sm">{destination.name}</span>
                        </div>
                      ))}
                      {trip.countries?.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#E6E8EC]">
                          <span className="text-xs text-[#777E90] font-['Poppins'] block mb-1">Countries visited:</span>
                          <div className="flex flex-wrap gap-1">
                            {trip.countries.map((country, index) => (
                              <span key={country._id} className="px-2 py-0.5 bg-white text-[#777E90] rounded text-xs">
                                {country.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {trip.highlights?.length > 0 && (
                  <div className="mb-4 lg:mb-6">
                    <h4 className="font-bold text-[#23262F] mb-2 lg:mb-3 font-['DM_Sans'] text-sm lg:text-base">Trip Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {trip.highlights.slice(0, 5).map((highlight, index) => (
                        <span key={index} className="px-2 lg:px-3 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-full text-xs lg:text-sm font-medium">
                          ✨ {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Itinerary */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#23262F] mb-4 lg:mb-6 font-['DM_Sans']">Daily Itinerary</h3>
                {trip.itinerary && trip.itinerary.length > 0 ? (
                  <div className="space-y-3 lg:space-y-4">
                    {trip.itinerary.map((day, index) => (
                      <div key={day.day || index} className="bg-white border border-[#E6E8EC] rounded-xl lg:rounded-2xl p-4 lg:p-6">
                        <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#3B71FE] text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans'] text-sm lg:text-base">
                            {day.day || index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base lg:text-lg font-bold text-[#23262F] font-['DM_Sans'] leading-tight">
                              {day.title || `Day ${day.day || index + 1}`}
                            </h4>
                            {(day.locationName || day.location) && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs lg:text-sm text-[#58C27D] font-['Poppins']">
                                  📍 {day.locationName || day.location}
                                </span>
                                {day.locationName && day.locationName !== trip.primaryDestination?.name && (
                                  <span className="text-xs bg-[#FFD166]/20 text-[#FFD166] px-2 py-0.5 rounded-full font-medium">
                                    Local
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {day.description && (
                          <p className="text-[#777E90] font-['Poppins'] text-sm lg:text-base mb-3 lg:mb-4 leading-relaxed">{day.description}</p>
                        )}
                        
                        {day.activities && day.activities.length > 0 ? (
                          <div className="mb-3 lg:mb-4">
                            <h5 className="font-bold text-[#23262F] font-['DM_Sans'] mb-2 text-sm lg:text-base">Activities</h5>
                            <div className="space-y-2 lg:space-y-3">
                              {day.activities.map((activity, actIndex) => (
                                <div key={actIndex} className="bg-[#F4F5F6] rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <span className="text-[#58C27D] text-sm mt-0.5">✓</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-[#23262F] font-['Poppins'] text-sm font-medium">
                                          {activity.customTitle || activity.title}
                                        </span>
                                        {activity.time && (
                                          <span className="text-[#777E90] font-['Poppins'] text-xs bg-white px-2 py-0.5 rounded">
                                            {activity.time}
                                          </span>
                                        )}
                                        {activity.type && (
                                          <span className="text-[#3B71FE] font-['Poppins'] text-xs bg-[#3B71FE]/10 px-2 py-0.5 rounded capitalize">
                                            {activity.type}
                                          </span>
                                        )}
                                      </div>
                                      {activity.description && (
                                        <p className="text-[#777E90] font-['Poppins'] text-xs leading-relaxed mb-1">{activity.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 text-xs">
                                        {activity.location && (
                                          <span className="text-[#777E90] font-['Poppins'] flex items-center gap-1">
                                            📍 {activity.location}
                                          </span>
                                        )}
                                        {activity.estimatedCost?.amount > 0 && (
                                          <span className="text-[#58C27D] font-['Poppins'] font-medium">
                                            {activity.estimatedCost.currency === 'INR' ? '₹' : '$'}{activity.estimatedCost.amount}
                                            {activity.estimatedCost.perPerson ? '/person' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : day.day > 1 && (
                          <div className="mb-3 lg:mb-4 p-3 bg-[#FFD166]/10 rounded-lg">
                            <p className="text-[#777E90] font-['Poppins'] text-sm">
                              🛠️ Activities for Day {day.day} are being finalized by our travel experts.
                            </p>
                          </div>
                        )}
                        
                        {day.tips && day.tips.length > 0 && (
                          <div className="mt-3 lg:mt-4 p-3 bg-[#FFD166]/10 rounded-lg">
                            <h6 className="font-bold text-[#23262F] font-['DM_Sans'] text-sm mb-2">💡 Tips</h6>
                            <ul className="text-[#777E90] font-['Poppins'] text-xs lg:text-sm space-y-1 leading-relaxed">
                              {day.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2">
                                  <span className="text-[#FFD166] mt-0.5">•</span>
                                  <span className="flex-1">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 lg:space-y-4">
                    {Array.from({ length: trip.duration?.days || 5 }, (_, index) => (
                      <div key={index} className="bg-[#F4F5F6] rounded-xl lg:rounded-2xl p-4 lg:p-6">
                        <div className="flex items-center gap-3 lg:gap-4 mb-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#B1B5C3] text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans'] text-sm lg:text-base">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base lg:text-lg font-bold text-[#23262F] font-['DM_Sans'] leading-tight">
                              Day {index + 1} - Itinerary Coming Soon
                            </h4>
                            <span className="text-xs lg:text-sm text-[#777E90] font-['Poppins'] mt-1 block">
                              Our travel experts are crafting detailed activities
                            </span>
                          </div>
                        </div>
                        <p className="text-[#777E90] font-['Poppins'] text-sm leading-relaxed">
                          Exciting {trip.travelStyle || 'cultural'} experiences and {trip.category?.name?.toLowerCase() || 'adventure'} activities planned for this day.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What's Included & Excluded */}
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-[#23262F] mb-4 lg:mb-6 font-['DM_Sans']">What's Included</h3>
                <div className="grid grid-cols-1 gap-3 lg:gap-4 mb-6 lg:mb-8">
                  {/* Accommodation */}
                  <div className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                    <span className="text-[#58C27D] mt-0.5">✓</span>
                    <span className="flex-1">🏨 {trip.pricing?.priceRange || 'Quality'} accommodation ({trip.duration?.nights || 4} nights)</span>
                  </div>
                  
                  {/* Transport */}
                  {trip.includedServices?.transport?.map((transport, index) => (
                    <div key={`transport-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">🚐 {transport}</span>
                    </div>
                  ))}
                  
                  {/* Meals */}
                  {trip.includedServices?.meals?.map((meal, index) => (
                    <div key={`meal-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">🍽️ {meal}</span>
                    </div>
                  ))}
                  
                  {/* Guide */}
                  {trip.includedServices?.guides && (
                    <div className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">👨🏫 Professional Guide</span>
                    </div>
                  )}
                  
                  {/* Additional Includes from API */}
                  {trip.includes?.slice(0, 4).map((item, index) => (
                    <div key={`include-${index}`} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>
                
                {/* What's NOT Included */}
                {trip.excludes?.length > 0 && (
                  <div className="mt-6 lg:mt-8">
                    <h4 className="text-base lg:text-lg font-bold text-[#23262F] mb-3 lg:mb-4 font-['DM_Sans']">What's NOT Included</h4>
                    <div className="grid grid-cols-1 gap-3 lg:gap-4">
                      {trip.excludes.slice(0, 6).map((item, index) => (
                        <div key={index} className="flex items-start gap-3 text-[#777E90] font-['Poppins'] text-sm">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span className="flex-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                

              </div>
            </div>

            {/* Right Booking Card */}
            <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-8 bg-[#FCFCFD] border border-[#E6E8EC] rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-lg lg:shadow-[0px_64px_64px_-48px_rgba(15,15,15,0.08)]">
                {/* Price Section */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex items-baseline gap-2 lg:gap-3 mb-2">
                    {trip.pricing?.discountAmount > 0 && (
                      <span className="text-lg lg:text-2xl text-[#B1B5C3] line-through font-bold font-['DM_Sans']">
                        {trip.pricing?.currency === 'INR' ? '₹' : '$'}{(trip.pricing?.sellPrice || (trip.pricing?.finalPrice + trip.pricing?.discountAmount)).toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl lg:text-3xl font-bold text-[#23262F] font-['DM_Sans']">
                      {trip.pricing?.currency === 'INR' ? '₹' : '$'}{(trip.pricing?.finalPrice || trip.pricing?.estimated || 699.97).toLocaleString()}
                    </span>
                    <span className="text-[#777E90] font-['Poppins'] text-sm lg:text-base">total</span>
                  </div>
                </div>

                {/* Booking Form */}
                <div className="bg-[#F4F5F6] rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Check-in</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Check-out</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-medium text-[#777E90] mb-1.5 lg:mb-2 font-['Poppins']">Guests</label>
                    <select 
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 lg:py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-[#3B71FE] font-['Poppins'] text-sm"
                    >
                      {Array.from({length: trip.groupSize?.max || 8}, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Booking Actions */}
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-2 mb-6 lg:mb-8">
                  <button className="sm:w-auto bg-white border border-[#E6E8EC] text-[#23262F] py-2.5 lg:py-3 px-4 lg:px-6 rounded-2xl lg:rounded-3xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] hover:bg-[#3B71FE]/5 transition-all duration-200 flex items-center justify-center gap-2 text-sm lg:text-base">
                    <span>❤️</span>
                    <span>Save</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/booking/trip/${trip._id || trip.id}`)}
                    className="flex-1 bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white py-3 lg:py-3 px-6 rounded-2xl lg:rounded-3xl font-bold font-['DM_Sans'] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm lg:text-base flex items-center justify-center gap-2"
                  >
                    <span>🎆</span>
                    <span>Reserve Now</span>
                  </button>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-['Poppins'] text-sm">
                    <span>Trip package × {Math.ceil(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) / (trip?.duration?.days || 5))} package(s)</span>
                    <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{((trip.pricing?.finalPrice || trip.pricing?.estimated || 699.97) * Math.ceil(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) / (trip?.duration?.days || 5))).toLocaleString()}</span>
                  </div>
                  {trip.pricing?.discountAmount > 0 && (
                    <div className="flex justify-between text-[#58C27D] font-['Poppins'] text-sm">
                      <span>{trip.pricing?.discountPercent}% campaign discount</span>
                      <span>-{trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-['Poppins'] text-sm">
                    <span>Service fee</span>
                    <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}99</span>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3">
                    <div className="flex justify-between font-bold text-lg font-['DM_Sans']">
                      <span>Total</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="space-y-2 mb-4 lg:mb-6">
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">{trip.bookingInfo?.cancellationPolicy || 'Free cancellation available'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">{trip.bookingInfo?.instantBook ? 'Instant confirmation' : 'Requires approval'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#58C27D] font-['Poppins'] text-xs lg:text-sm">
                    <span className="mt-0.5">✅</span>
                    <span className="flex-1">Secure payment & booking</span>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="text-center">
                  <button className="text-xs lg:text-sm text-[#777E90] hover:text-[#23262F] font-['Poppins'] flex items-center gap-1 mx-auto">
                    💬 Need help? Contact support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Information */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Trip Details */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#23262F] font-['DM_Sans'] mb-4 lg:mb-6">Trip Details</h2>
              <div className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Duration</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.duration?.days || 5} days, {trip.duration?.nights || 4} nights
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Group Size</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.groupSize?.min}-{trip.groupSize?.max} travelers
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Difficulty</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm capitalize">
                      {trip.difficulty || 'Easy'} • {trip.physicalRequirements?.fitnessLevel || 'Low'} fitness
                    </p>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                    <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Best Time</h4>
                    <p className="text-[#777E90] font-['Poppins'] text-sm">
                      {trip.travelInfo?.bestTimeToVisit?.months?.slice(0,2).join(', ') || 'Year-round'}
                      {trip.travelInfo?.bestTimeToVisit?.weather && (
                        <span className="block text-xs mt-1">{trip.travelInfo.bestTimeToVisit.weather} weather</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(trip.suitableFor || {}).filter(([_, value]) => value).length > 0 ? (
                      Object.entries(trip.suitableFor).map(([key, value]) => 
                        value && (
                          <span key={key} className="px-2 lg:px-3 py-1 bg-[#58C27D]/10 text-[#58C27D] rounded-full text-xs lg:text-sm font-medium">
                            {key === 'soloTravelers' ? 'Solo Travelers' : 
                             key === 'couples' ? 'Couples' :
                             key === 'families' ? 'Families' :
                             key === 'groups' ? 'Groups' : key}
                          </span>
                        )
                      )
                    ) : (
                      <span className="px-2 lg:px-3 py-1 bg-[#F4F5F6] text-[#777E90] rounded-full text-xs lg:text-sm">All Travelers</span>
                    )}
                  </div>
                </div>
                
                {trip.pricing?.breakdown && Object.values(trip.pricing.breakdown).some(value => value > 0) && (
                  <div>
                    <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(trip.pricing.breakdown)
                        .filter(([_, value]) => value > 0)
                        .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-[#777E90] font-['Poppins'] capitalize">
                            {key === 'accommodation' ? 'Hotels' : 
                             key === 'transport' ? 'Transport' :
                             key === 'food' ? 'Meals' :
                             key === 'activities' ? 'Activities' :
                             key === 'flights' ? 'Flights' : key}
                          </span>
                          <span className="text-[#23262F] font-['Poppins']">
                            {trip.pricing?.currency === 'INR' ? '₹' : '$'}{value}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t border-[#E6E8EC] pt-2 mt-3">
                        <span className="text-[#23262F] font-['DM_Sans']">Total</span>
                        <span className="text-[#23262F] font-['DM_Sans']">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.finalPrice || trip.pricing?.estimated || 699}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Safety & Requirements */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-[#23262F] font-['DM_Sans'] mb-4 lg:mb-6">Safety & Requirements</h2>
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-[#F4F5F6] rounded-lg p-3 lg:p-4">
                  <h4 className="font-bold text-[#23262F] mb-1 lg:mb-2 font-['DM_Sans'] text-sm lg:text-base">Safety Level</h4>
                  <p className="text-[#777E90] font-['Poppins'] text-sm capitalize">
                    {trip.safetyInformation?.level || 'Low'} risk • Professional guides included
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Physical Requirements</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm capitalize flex-1">{trip.physicalRequirements?.fitnessLevel || 'Low'} fitness level required</span>
                    </div>
                    {trip.physicalRequirements?.walkingDistance && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#58C27D] mt-0.5">✓</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Walking: {trip.physicalRequirements.walkingDistance}km per day</span>
                      </div>
                    )}
                    {trip.physicalRequirements?.altitude && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#58C27D] mt-0.5">✓</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Max altitude: {trip.physicalRequirements.altitude}m</span>
                      </div>
                    )}
                    {trip.physicalRequirements?.specialNeeds && trip.physicalRequirements.specialNeeds.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[#777E90] font-['Poppins'] text-sm font-medium block mb-1">Special requirements:</span>
                        <ul className="text-[#777E90] font-['Poppins'] text-sm space-y-1">
                          {trip.physicalRequirements.specialNeeds.map((need, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#FFD166] mt-0.5">•</span>
                              <span className="flex-1">{need}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#23262F] mb-2 font-['DM_Sans'] text-sm lg:text-base">Booking Policy</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#58C27D] mt-0.5">✓</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">{trip.bookingInfo?.cancellationPolicy || 'Free cancellation available'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#3B71FE] mt-0.5">💳</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">{trip.bookingInfo?.depositRequired || 50}% deposit required, balance due {trip.bookingInfo?.finalPaymentDue || 30} days before departure</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#FFD166] mt-0.5">⏱️</span>
                      <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">
                        {trip.bookingInfo?.instantBook ? 'Instant booking available' : 'Requires approval'}
                        {trip.bookingInfo?.advanceBooking && ` • Book ${trip.bookingInfo.advanceBooking} days in advance`}
                      </span>
                    </div>
                    {trip.availability?.maxBookings && (
                      <div className="flex items-start gap-2">
                        <span className="text-[#777E90] mt-0.5">👥</span>
                        <span className="text-[#777E90] font-['Poppins'] text-sm flex-1">Limited to {trip.availability.maxBookings} bookings per departure</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#3B71FE]/5 to-[#58C27D]/5 rounded-2xl border border-[#E6E8EC]">
            <span className="text-4xl mb-4 block">{trip.category?.icon || '🎆'}</span>
            <h3 className="text-xl font-bold text-[#23262F] font-['DM_Sans'] mb-2">Ready for Your {trip.category?.name || 'Adventure'}?</h3>
            <p className="text-[#777E90] font-['Poppins'] mb-4 text-center">
              {trip.stats?.views > 0 ? `Join ${trip.stats.views}+ travelers who have viewed this ${trip.category?.name?.toLowerCase() || 'adventure'}!` : 
               `Be the first to experience this amazing ${trip.category?.name?.toLowerCase() || 'adventure'} in ${trip.primaryDestination?.name || trip.countries?.[0]?.name || 'beautiful destinations'}!`}
              {trip.stats?.bookings > 0 && (
                <span className="block text-[#58C27D] font-medium mt-2">
                  ✓ {trip.stats.bookings} travelers have already booked this trip
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={() => navigate(`/booking/trip/${trip._id || trip.id}`)}
                className="bg-gradient-to-r from-[#3B71FE] to-[#58C27D] text-white py-4 px-8 sm:px-10 rounded-2xl font-bold font-['DM_Sans'] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Book Your Adventure</span>
                <span>→</span>
              </button>
              {trip.sharing?.allowCopy && (
                <button className="bg-white border-2 border-[#E6E8EC] text-[#23262F] py-4 px-6 rounded-2xl font-bold font-['DM_Sans'] hover:border-[#3B71FE] hover:bg-[#3B71FE]/5 transition-all duration-200 text-sm sm:text-base flex items-center gap-2">
                  <span>📎</span>
                  <span>Share Trip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Image Gallery Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              ×
            </button>
            
            {/* Previous Button */}
            {trip.images && trip.images.length > 1 && (
              <button 
                onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : trip.images.length - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Next Button */}
            {trip.images && trip.images.length > 1 && (
              <button 
                onClick={() => setSelectedImageIndex(selectedImageIndex < trip.images.length - 1 ? selectedImageIndex + 1 : 0)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* Main Image */}
            <img
              src={trip.images?.[selectedImageIndex]?.url 
                ? (trip.images[selectedImageIndex].url.startsWith('http') ? sanitizeUrl(trip.images[selectedImageIndex].url) : `${API_BASE_URL}${trip.images[selectedImageIndex].url}`)
                : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
              alt={`${trip.title} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image Counter */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-['Poppins']">
              {selectedImageIndex + 1} / {trip.images?.length || 1}
            </div>
            
            {/* Thumbnail Strip */}
            {trip.images && trip.images.length > 1 && (
              <div className="hidden sm:flex absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 gap-2 max-w-full overflow-x-auto px-4">
                {trip.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-white opacity-100' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image.url 
                        ? (image.url.startsWith('http') ? sanitizeUrl(image.url) : `${API_BASE_URL}${image.url}`)
                        : `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=64&h=48&fit=crop`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailsPageEnhanced;