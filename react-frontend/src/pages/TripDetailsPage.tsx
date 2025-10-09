import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { TripData } from '@/types/trip.types';
import { sanitizeHtml, sanitizeUrl } from '@/utils/sanitize';
import API_CONFIG from '@/config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL.replace('/api', '');

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [/* searchParams */] = useSearchParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [/* selectedImageIndex */, /* setSelectedImageIndex */] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && !trip) {
      loadTripDetails();
    }
  }, [id, trip]);
  
  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showImageModal) return;
      
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft' && modalImageIndex > 0) {
        setModalImageIndex(modalImageIndex - 1);
      } else if (e.key === 'ArrowRight' && trip?.images && modalImageIndex < trip.images.length - 1) {
        setModalImageIndex(modalImageIndex + 1);
      }
    };
    
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [showImageModal, modalImageIndex, trip?.images]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && trip?.images && modalImageIndex < trip.images.length - 1) {
      setModalImageIndex(modalImageIndex + 1);
    }
    if (isRightSwipe && modalImageIndex > 0) {
      setModalImageIndex(modalImageIndex - 1);
    }
  };

  const loadTripDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await apiService.get(`/trips/${id}`);
      if (data.success) {
        setTrip((data as any).data.trip || (data as any).data);
      }
    } catch (error) {
      console.error('Failed to load trip details:', error);
      setError('Failed to load trip details. Please try again.');
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrip = () => {
    if (trip) {
      navigate(`/booking/trip/${trip._id || trip.id}`);
    }
  };

  // const handleCustomizeTrip = () => {
  //   if (trip) {
  //     navigate(`/trips/${trip._id || trip.id}/customize`);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
        <div className="animate-pulse">
          {/* Hero Skeleton */}
          <div className="h-[70vh] bg-gradient-to-r from-gray-200 to-gray-300 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="h-8 bg-white/20 rounded-lg w-3/4 mb-4"></div>
              <div className="h-12 bg-white/20 rounded-lg w-1/2"></div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-10 bg-gray-200 rounded-lg w-2/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                  <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FCFCFD] to-white px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">
              {error ? '⚠️' : '🏔️'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#23262F] mb-4 font-['DM_Sans'] leading-tight">
            {error ? 'Connection Error' : 'Trip Not Found'}
          </h2>
          <p className="text-[#777E90] mb-8 font-['Poppins'] text-base leading-relaxed">
            {error || 'The trip you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <div className="space-y-4">
            {error && (
              <button 
                onClick={() => {
                  setError(null);
                  loadTripDetails();
                }}
                className="w-full bg-[#58C27D] text-white py-4 rounded-2xl font-bold font-['DM_Sans'] hover:bg-[#3B71FE] transition-all duration-300 hover:shadow-lg active:scale-95 touch-manipulation"
              >
                🔄 Try Again
              </button>
            )}
            <button 
              onClick={() => navigate('/trips')} 
              className="w-full bg-[#3B71FE] text-white py-4 rounded-2xl font-bold font-['DM_Sans'] hover:bg-[#58C27D] transition-all duration-300 hover:shadow-lg active:scale-95 touch-manipulation"
            >
              Browse All Trips
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="w-full text-[#777E90] py-4 font-medium font-['DM_Sans'] hover:text-[#23262F] transition-colors active:scale-95 touch-manipulation"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Navigation Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-4 lg:py-6">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#3B71FE] hover:text-[#58C27D] transition-colors font-bold text-sm font-['DM_Sans'] active:scale-95 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Go home
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#777E90] text-sm font-['DM_Sans'] font-bold">
              <span>Home</span>
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-[#777E90] text-sm font-['DM_Sans'] font-bold">
              <span>Stays</span>
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex items-center gap-2 text-[#777E90] text-sm font-['DM_Sans'] font-bold">
              <span>New Zealand</span>
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 6 10">
                <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#B1B5C3] text-sm font-['DM_Sans'] font-bold">{trip.title.length > 15 ? `${trip.title.substring(0, 15)}...` : trip.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={trip.images?.[0]?.url?.startsWith('http') 
              ? sanitizeUrl(trip.images[0].url) 
              : trip.images?.[0]?.url 
                ? sanitizeUrl(`${API_BASE_URL}${trip.images[0].url}`) 
                : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Mobile-first layout */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              {/* Title & Meta */}
              <div className="flex-1">
                {/* Mobile meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-amber-400 text-sm">⭐</span>
                    <span className="font-bold text-white font-['DM_Sans'] text-sm">{trip.stats?.rating || 4.9}</span>
                    <span className="text-xs text-white/90 font-['Poppins']">({trip.stats?.reviewCount || 127})</span>
                  </div>
                  {trip.featured && (
                    <span className="px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-bold font-['DM_Sans']">
                      🏆 Premium
                    </span>
                  )}
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium font-['DM_Sans']">
                    📍 {trip.destinations?.map(d => d.name).join(', ') || trip.primaryDestination?.name || 'Amazing Destination'}
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-4 font-['DM_Sans'] leading-tight drop-shadow-lg">
                  {sanitizeHtml(trip.title)}
                </h1>
                
                {/* Mobile-optimized trip details */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span>👥</span>
                    <span className="font-medium font-['DM_Sans']">{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span>📅</span>
                    <span className="font-medium font-['DM_Sans']">{trip.duration?.days || 5}d/{trip.duration?.nights || 4}n</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/90 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span>🏨</span>
                    <span className="font-medium font-['DM_Sans']">{trip.pricing?.priceRange || 'Quality'}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Mobile optimized */}
              <div className="flex items-center justify-between lg:justify-end gap-3">
                <div className="flex items-center gap-2">
                  <button 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white hover:scale-105 active:scale-95"
                    title="View on Map"
                  >
                    📍
                  </button>
                  <button 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white hover:scale-105 active:scale-95"
                    title="Share Trip"
                  >
                    📤
                  </button>
                  <button 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all text-white hover:scale-105 active:scale-95"
                    title="Save to Favorites"
                  >
                    ❤️
                  </button>
                </div>
                
                {/* Gallery button - always visible on mobile */}
                <button 
                  onClick={() => {
                    setModalImageIndex(0);
                    setShowImageModal(true);
                  }}
                  className="px-3 py-2 sm:px-4 bg-white text-primary-900 rounded-lg font-bold font-['DM_Sans'] text-xs sm:text-sm hover:bg-white/90 transition-colors flex items-center gap-1 shadow-lg active:scale-95"
                >
                  🖼️ <span className="hidden sm:inline">Photos</span><span className="sm:hidden">{trip.images?.length || 5}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
        




      {/* Main Content */}
      <section className="py-6 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-10">
              {/* Package Info */}
              <div className="bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-primary-900 font-['DM_Sans'] leading-tight">
                    {sanitizeHtml(trip.category?.name ? `${trip.category.name} Package` : 'Complete Adventure Package')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald font-['DM_Sans']">
                      {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString() || '999'}
                    </span>
                    <span className="text-sm text-primary-600 font-['Poppins']">/person</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-sm text-primary-600 font-['Poppins']">Organized by</span>
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face" 
                    alt="Host" 
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-primary-900 font-['DM_Sans']">Adventure Tours</span>
                </div>
                
                {/* Suitable For */}
                <div className="mb-6 sm:mb-8">
                  <h4 className="font-bold text-primary-900 mb-3 sm:mb-4 font-['DM_Sans'] text-base sm:text-lg">Perfect For</h4>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                    {trip.suitableFor?.couples && (
                      <span className="px-3 py-2 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1 sm:gap-2">
                        💕 <span className="hidden sm:inline">Couples</span><span className="sm:hidden">Couple</span>
                      </span>
                    )}
                    {trip.suitableFor?.families && (
                      <span className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1 sm:gap-2">
                        👨👩👧👦 <span className="hidden sm:inline">Families</span><span className="sm:hidden">Family</span>
                      </span>
                    )}
                    {trip.suitableFor?.soloTravelers && (
                      <span className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1 sm:gap-2">
                        🎒 <span className="hidden sm:inline">Solo Travelers</span><span className="sm:hidden">Solo</span>
                      </span>
                    )}
                    {trip.suitableFor?.groups && (
                      <span className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium font-['DM_Sans'] flex items-center justify-center gap-1 sm:gap-2">
                        👥 <span className="hidden sm:inline">Groups</span><span className="sm:hidden">Group</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Trip Category & Style */}
                <div className="mb-8">
                  <h4 className="font-bold text-primary-900 mb-4 font-['DM_Sans']">Trip Details</h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {trip.category && (
                      <span className="px-4 py-2 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2" style={{backgroundColor: `${trip.category.color}20`, color: trip.category.color}}>
                        {trip.category.icon} {trip.category.name}
                      </span>
                    )}
                    {trip.travelStyle && (
                      <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                        🌎 {trip.travelStyle.charAt(0).toUpperCase() + trip.travelStyle.slice(1)}
                      </span>
                    )}
                    {trip.difficulty && (
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2 ${
                        trip.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                        trip.difficulty === 'moderate' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        🏃 {trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}
                      </span>
                    )}
                  </div>
                  
                  {/* Trip Tags */}
                  {trip.tags && trip.tags.length > 0 && (
                    <div>
                      <h5 className="font-medium text-primary-900 mb-2 font-['DM_Sans']">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {trip.tags && trip.tags.slice(0, 8).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                        {trip.tags && trip.tags.length > 8 && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                            +{trip.tags && trip.tags.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Customization Options */}
                {trip.customizable && Object.values(trip.customizable).some(Boolean) && (
                  <div className="mb-8">
                    <h4 className="font-bold text-primary-900 mb-4 font-['DM_Sans']">Customization Options</h4>
                    <div className="flex flex-wrap gap-3">
                      {trip.customizable.duration && (
                        <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                          📅 Duration
                        </span>
                      )}
                      {trip.customizable.activities && (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                          🎯 Activities
                        </span>
                      )}
                      {trip.customizable.accommodation && (
                        <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                          🏨 Accommodation
                        </span>
                      )}
                      {trip.customizable.dates && (
                        <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                          📆 Dates
                        </span>
                      )}
                      {trip.customizable.groupSize && (
                        <span className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium font-['DM_Sans'] flex items-center gap-2">
                          👥 Group Size
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <p className="text-primary-700 leading-relaxed font-['Poppins'] text-base mb-6">
                  {sanitizeHtml(trip.description || 'Experience the ultimate adventure with our carefully curated package. From thrilling activities to luxury accommodations, this comprehensive package includes all meals, premium accommodations, guided tours, and exclusive access to the best attractions and hidden gems.')}
                </p>
              </div>
              

              {/* Itinerary Section */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4 sm:mb-6 font-['DM_Sans']">Day-by-Day Itinerary</h3>
                <div className="space-y-3 sm:space-y-4">
                  {trip.itinerary?.length > 0 ? trip.itinerary.map((day, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow active:scale-[0.99] touch-manipulation">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-ocean text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans'] text-sm sm:text-base flex-shrink-0">
                            {day.day || index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base sm:text-lg font-bold text-primary-900 font-['DM_Sans'] leading-tight">
                              {day.title || `Day ${index + 1} Activities`}
                            </h4>
                            <span className="text-xs sm:text-sm text-primary-600 font-['Poppins']">
                              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <button className="text-blue-ocean hover:text-emerald font-medium font-['DM_Sans'] text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-blue-50 active:scale-95 touch-manipulation flex-shrink-0">
                          <span className="hidden sm:inline">View Details</span><span className="sm:hidden">›</span>
                        </button>
                      </div>
                      <p className="text-primary-600 font-['Poppins'] mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                        {day.description || 'Exciting activities and experiences planned for this day'}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {day.activities?.slice(0, 3).map((activity, actIndex) => (
                          <span key={actIndex} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                            {activity.title || activity}
                          </span>
                        )) || [
                          <span key="1" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Adventure</span>,
                          <span key="2" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Sightseeing</span>,
                          <span key="3" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Local Experience</span>
                        ]}
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          +{Math.max(0, (day.activities?.length || 3) - 3)} more
                        </span>
                      </div>
                    </div>
                  )) : [
                    // Default itinerary based on duration
                    ...Array.from({ length: trip.duration?.days || 7 }, (_, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-ocean text-white rounded-full flex items-center justify-center font-bold font-['DM_Sans']">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-primary-900 font-['DM_Sans']">
                                {index === 0 ? '🛬 Arrival & Welcome' :
                                 index === (trip.duration?.days || 7) - 1 ? '✈️ Departure' :
                                 `🎆 Day ${index + 1} Adventure`}
                              </h4>
                              <span className="text-sm text-primary-600 font-['Poppins']">
                                {new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <button className="text-blue-ocean hover:text-emerald font-medium font-['DM_Sans'] text-sm">
                            View Details
                          </button>
                        </div>
                        <p className="text-primary-600 font-['Poppins'] mb-4">
                          {index === 0 ? 'Airport pickup, luxury accommodation check-in, welcome dinner with local cuisine' :
                           index === (trip.duration?.days || 7) - 1 ? 'Breakfast, souvenir shopping, airport transfer' :
                           'Exciting activities, local experiences, and cultural immersion planned for today'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {index === 0 ? [
                            <span key="1" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Transfer</span>,
                            <span key="2" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Check-in</span>,
                            <span key="3" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Dinner</span>
                          ] : index === (trip.duration?.days || 7) - 1 ? [
                            <span key="1" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Breakfast</span>,
                            <span key="2" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Shopping</span>,
                            <span key="3" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Transfer</span>
                          ] : [
                            <span key="1" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Adventure</span>,
                            <span key="2" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Culture</span>,
                            <span key="3" className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">Local Food</span>
                          ]}
                        </div>
                      </div>
                    ))
                  ]}
                </div>
                <button className="mt-6 text-blue-ocean hover:text-emerald font-bold font-['DM_Sans'] text-sm">
                  View full itinerary
                </button>
              </div>
              
              {/* What's Included */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4 sm:mb-6 font-['DM_Sans']">What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Transport Services */}
                  {trip.includedServices?.transport?.map((transport, index) => (
                    <div key={`transport-${index}`} className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                      <span className="text-emerald">✓</span>
                      <span>🚐 {transport}</span>
                    </div>
                  ))}
                  
                  {/* Meals */}
                  {trip.includedServices?.meals?.map((meal, index) => (
                    <div key={`meal-${index}`} className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                      <span className="text-emerald">✓</span>
                      <span>🍽️ {meal}</span>
                    </div>
                  ))}
                  
                  {/* Guide */}
                  {trip.includedServices?.guides && (
                    <div className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                      <span className="text-emerald">✓</span>
                      <span>👨🏫 Professional Guide</span>
                    </div>
                  )}
                  
                  {/* Additional Includes */}
                  {trip.includes?.map((item, index) => (
                    <div key={`include-${index}`} className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                      <span className="text-emerald">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  
                  {/* Accommodation */}
                  <div className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                    <span className="text-emerald">✓</span>
                    <span>🏨 {trip.pricing?.priceRange || 'Quality'} accommodation ({trip.duration?.nights || 4} nights)</span>
                  </div>
                </div>
                
                {/* What's NOT Included */}
                {trip.excludes?.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-primary-900 mb-4 font-['DM_Sans']">What's NOT Included</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trip.excludes.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-primary-700 font-['Poppins']">
                          <span className="text-red-500">✗</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Travel Information */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary-900 mb-4 sm:mb-6 font-['DM_Sans']">Travel Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Best Time to Visit */}
                  {trip.travelInfo?.bestTimeToVisit && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                      <h4 className="font-bold text-primary-900 mb-2 font-['DM_Sans'] flex items-center gap-2 text-sm sm:text-base">
                        🌡️ <span className="hidden sm:inline">Best Time to Visit</span><span className="sm:hidden">Best Time</span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        {trip.travelInfo.bestTimeToVisit.months?.length > 0 && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Months:</span> {trip.travelInfo.bestTimeToVisit.months.join(', ')}
                          </p>
                        )}
                        {trip.travelInfo.bestTimeToVisit.weather && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Weather:</span> {trip.travelInfo.bestTimeToVisit.weather}
                          </p>
                        )}
                        {trip.travelInfo.bestTimeToVisit.temperature && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Temperature:</span> {trip.travelInfo.bestTimeToVisit.temperature.min}°C - {trip.travelInfo.bestTimeToVisit.temperature.max}°C
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Physical Requirements */}
                  {trip.physicalRequirements && (
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <h4 className="font-bold text-primary-900 mb-2 font-['DM_Sans'] flex items-center gap-2">
                        🏃 Physical Requirements
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-['Poppins']">
                          <span className="font-medium">Fitness Level:</span> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            trip.physicalRequirements.fitnessLevel === 'low' ? 'bg-green-100 text-green-700' :
                            trip.physicalRequirements.fitnessLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {trip.physicalRequirements.fitnessLevel?.charAt(0).toUpperCase() + trip.physicalRequirements.fitnessLevel?.slice(1)}
                          </span>
                        </p>
                        {trip.physicalRequirements.walkingDistance > 0 && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Walking:</span> {trip.physicalRequirements.walkingDistance} km/day
                          </p>
                        )}
                        {trip.physicalRequirements.altitude > 0 && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Max Altitude:</span> {trip.physicalRequirements.altitude}m
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Local Culture */}
                  {trip.travelInfo?.localCulture && (
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <h4 className="font-bold text-primary-900 mb-2 font-['DM_Sans'] flex items-center gap-2">
                        🌍 Local Culture
                      </h4>
                      <div className="space-y-2 text-sm">
                        {trip.travelInfo.localCulture.language?.length > 0 && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Languages:</span> {trip.travelInfo.localCulture.language.join(', ')}
                          </p>
                        )}
                        {trip.travelInfo.localCulture.currency && (
                          <p className="font-['Poppins']">
                            <span className="font-medium">Currency:</span> {trip.travelInfo.localCulture.currency}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Safety Information */}
                  {trip.travelInfo?.safetyInformation && (
                    <div className="bg-amber-50 p-4 rounded-xl">
                      <h4 className="font-bold text-primary-900 mb-2 font-['DM_Sans'] flex items-center gap-2">
                        🛡️ Safety Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-['Poppins']">
                          <span className="font-medium">Safety Level:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            trip.travelInfo.safetyInformation.level === 'low' ? 'bg-green-100 text-green-700' :
                            trip.travelInfo.safetyInformation.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {trip.travelInfo.safetyInformation.level?.charAt(0).toUpperCase() + trip.travelInfo.safetyInformation.level?.slice(1)} Risk
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Booking Information */}
              <div>
                <h3 className="text-2xl font-bold text-primary-900 mb-6 font-['DM_Sans']">Booking Details</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-primary-900 mb-3 font-['DM_Sans']">Booking Policy</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Booking Type:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trip.bookingInfo?.instantBook ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {trip.bookingInfo?.instantBook ? '⚡ Instant Book' : '✅ Requires Approval'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Advance Booking:</span>
                          <span className="font-medium">{trip.bookingInfo?.advanceBooking || 7} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Deposit Required:</span>
                          <span className="font-medium">{trip.bookingInfo?.depositRequired || 50}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Final Payment:</span>
                          <span className="font-medium">{trip.bookingInfo?.finalPaymentDue || 30} days before</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-primary-900 mb-3 font-['DM_Sans']">Trip Capacity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Group Size:</span>
                          <span className="font-medium">{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Recommended:</span>
                          <span className="font-medium">{trip.groupSize?.recommended || 4} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Max Bookings:</span>
                          <span className="font-medium">{trip.availability?.maxBookings || 20} total</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-primary-600 font-['Poppins']">Trip Type:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trip.availability?.seasonal ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {trip.availability?.seasonal ? '🌿 Seasonal' : '📅 Year-round'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {trip.bookingInfo?.cancellationPolicy && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-bold text-primary-900 mb-2 font-['DM_Sans']">Cancellation Policy</h4>
                      <p className="text-sm text-primary-600 font-['Poppins']">
                        {trip.bookingInfo.cancellationPolicy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Pricing Breakdown */}
              <div>
                <h3 className="text-2xl font-bold text-primary-900 mb-6 font-['DM_Sans']">Pricing Breakdown</h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trip.pricing?.breakdown && Object.entries(trip.pricing.breakdown).map(([key, value]) => (
                      value > 0 && (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <span className="capitalize text-primary-600 font-['Poppins'] font-medium">{key}</span>
                          <span className="font-bold text-primary-900 font-['DM_Sans']">
                            {trip.pricing?.currency === 'INR' ? '₹' : '$'}{value.toLocaleString()}
                          </span>
                        </div>
                      )
                    ))}
                    <div className="col-span-full border-t-2 border-primary-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-primary-900 font-['DM_Sans']">Total per person</span>
                        <span className="text-2xl font-black text-emerald font-['DM_Sans']">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-primary-500 font-['Poppins']">Original price</span>
                        <span className="text-sm text-primary-500 line-through font-['Poppins']">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{((trip.pricing?.estimated || 0) + (trip.pricing?.discountAmount || 0) || 999).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald font-['DM_Sans']">You save</span>
                        <span className="text-sm font-bold text-emerald font-['DM_Sans']">
                          -{trip.pricing?.currency === 'INR' ? '₹' : '$'}{Math.abs(trip.pricing?.discountAmount || 0)} ({trip.pricing?.discountPercent || 10}% OFF)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Booking Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 z-10 space-y-6">
                {/* Booking Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-lg">
                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-3xl font-black text-primary-900 font-['DM_Sans']">
                          {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString() || '999'}
                        </span>
                        <span className="text-primary-600 font-['Poppins'] ml-2">/person</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-primary-500 line-through font-['Poppins']">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">👨‍👩‍👧‍👦 Families</span>
                          
                          {trip.suitableFor?.soloTravelers && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">🧳 Solo</span>
                          )}
                          {trip.suitableFor?.groups && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">👥 Groups</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">⭐</span>
                        <span className="font-bold text-primary-900 font-['DM_Sans']">{trip.stats?.rating || 4.9}</span>
                        <span className="text-sm text-primary-600 font-['Poppins']">({trip.stats?.reviewCount || 127} reviews)</span>
                      </div>
                      <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face" 
                        alt="Host" 
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                  </div>
                  
                  {/* Booking Form */}
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-primary-700 mb-1 sm:mb-2 font-['DM_Sans']">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-blue-ocean font-['Poppins'] text-sm" 
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-primary-700 mb-1 sm:mb-2 font-['DM_Sans']">End Date</label>
                        <input 
                          type="date" 
                          className="w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-blue-ocean font-['Poppins'] text-sm" 
                          defaultValue={new Date(Date.now() + (trip.duration?.days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-primary-700 mb-1 sm:mb-2 font-['DM_Sans']">Travelers</label>
                      <select 
                        className="w-full px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-blue-ocean font-['Poppins'] text-sm"
                        defaultValue="2"
                      >
                        <option value="1">1 adult</option>
                        <option value="2">2 adults</option>
                        <option value="3">3 adults</option>
                        <option value="4">4 adults</option>
                        <option value="5">5 adults</option>
                        <option value="6">6 adults</option>
                        <option value="7">7 adults</option>
                        <option value="8">8 adults</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Booking Actions */}
                  <div className="space-y-3 mb-6">
                    <button className="w-full bg-blue-ocean text-white py-3 sm:py-4 rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-colors active:scale-95 touch-manipulation">
                      🔖 Save for Later
                    </button>
                    <button 
                      onClick={handleBookTrip}
                      className="w-full bg-emerald text-white py-3 sm:py-4 rounded-xl font-bold font-['DM_Sans'] hover:bg-blue-ocean transition-colors active:scale-95 touch-manipulation text-base sm:text-lg"
                    >
                      🎆 Book Now
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between font-['Poppins']">
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString() || '999'} x 2 travelers</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{((trip.pricing?.estimated || 999) * 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald font-['Poppins']">
                      <span>Early bird discount</span>
                      <span>-{trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.discountAmount || 300}</span>
                    </div>
                    <div className="flex justify-between font-['Poppins']">
                      <span>Service fee</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}99</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 font-['DM_Sans']">
                      <span>Total</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{Math.max(0, ((trip.pricing?.estimated || 999) * 2) - (trip.pricing?.discountAmount || 0) + 99).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {/* Guarantees */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-emerald font-['Poppins']">
                      <span>✅</span>
                      <span>{trip.bookingInfo?.cancellationPolicy || 'Free cancellation up to 48h'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald font-['Poppins']">
                      <span>✅</span>
                      <span>Best price guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald font-['Poppins']">
                      <span>✅</span>
                      <span>{trip.bookingInfo?.instantBook ? 'Instant confirmation' : 'Quick approval process'}</span>
                    </div>
                  </div>
                  
                  {/* Report Link */}
                  <div className="text-center">
                    <button className="text-sm text-primary-500 hover:text-primary-700 font-['Poppins']">
                      🚩 Report this package
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Reviews Section */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-primary-900 font-['DM_Sans']">Guest Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="text-center sm:text-right">
                  <div className="text-2xl sm:text-3xl font-black text-primary-900 font-['DM_Sans']">{trip.stats?.rating || 4.9}</div>
                  <div className="flex items-center justify-center sm:justify-end gap-1">
                    <div className="flex text-amber-400 text-sm sm:text-base">
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-primary-600 font-['Poppins']">{trip.stats?.reviewCount || 127} reviews</div>
                </div>
              </div>
            </div>
            
            {/* Sample Reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow active:scale-[0.99] touch-manipulation">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face" 
                    alt="Reviewer" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-primary-900 font-['DM_Sans']">Sarah Johnson</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
                <p className="text-primary-600 font-['Poppins'] text-sm leading-relaxed mb-3">
                  "Absolutely incredible experience! The {trip.category?.name?.toLowerCase() || 'adventure'} was breathtaking and the guides were fantastic. Every detail was perfectly planned."
                </p>
                <span className="text-xs text-primary-500 font-['Poppins']">2 weeks ago</span>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" 
                    alt="Reviewer" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-primary-900 font-['DM_Sans']">Mike Chen</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
                <p className="text-primary-600 font-['Poppins'] text-sm leading-relaxed mb-3">
                  "Perfect blend of {trip.travelStyle || 'adventure'} and luxury. The {trip.duration?.days || 7}-day itinerary was well-paced and every moment was memorable. Highly recommend!"
                </p>
                <span className="text-xs text-primary-500 font-['Poppins']">1 month ago</span>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face" 
                    alt="Reviewer" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-primary-900 font-['DM_Sans']">Emma Wilson</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
                <p className="text-primary-600 font-['Poppins'] text-sm leading-relaxed mb-3">
                  "Best vacation ever! The trip to {trip.primaryDestination?.name || trip.destinations?.[0]?.name || 'this destination'} exceeded all expectations. The {trip.pricing?.priceRange || 'luxury'} accommodations were perfect."
                </p>
                <span className="text-xs text-primary-500 font-['Poppins']">3 weeks ago</span>
              </div>
            </div>
            
            <div className="text-center mt-6 sm:mt-8">
              <button className="bg-white text-blue-ocean border-2 border-blue-ocean px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold font-['DM_Sans'] hover:bg-blue-ocean hover:text-white transition-colors active:scale-95 touch-manipulation text-sm sm:text-base">
                View all {trip.stats?.reviewCount || 127} reviews
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Image Gallery Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button - Mobile optimized */}
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl sm:text-3xl z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 transition-all active:scale-90 touch-manipulation"
            >
              ×
            </button>
            
            {/* Previous Button */}
            {trip.images && trip.images.length > 1 && modalImageIndex > 0 && (
              <button 
                onClick={() => setModalImageIndex(modalImageIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-4xl z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                ‹
              </button>
            )}
            
            {/* Next Button */}
            {trip.images && trip.images.length > 1 && modalImageIndex < trip.images.length - 1 && (
              <button 
                onClick={() => setModalImageIndex(modalImageIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-4xl z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                ›
              </button>
            )}
            
            {/* Main Image */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={trip.images?.[modalImageIndex]?.url?.startsWith('http') 
                  ? sanitizeUrl(trip.images[modalImageIndex].url) 
                  : trip.images?.[modalImageIndex]?.url 
                    ? sanitizeUrl(`${API_BASE_URL}${trip.images[modalImageIndex].url}`) 
                    : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
                alt={`${trip.title} - Image ${modalImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg select-none"
                draggable={false}
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                {modalImageIndex + 1} / {trip.images?.length || 1}
              </div>
              
              {/* Mobile swipe indicator */}
              <div className="lg:hidden absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
                {trip.images?.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === modalImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                )) || Array.from({length: 5}, (_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === modalImageIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {trip.images && trip.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-lg">
                {trip.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                      modalImageIndex === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url?.startsWith('http') ? sanitizeUrl(image.url) : sanitizeUrl(`${API_BASE_URL}${image.url}`)}
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
      
      {/* Mobile Floating Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        {/* Quick Actions Row */}
        <div className="flex items-center justify-around py-2 border-b border-gray-100">
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 active:scale-95 touch-manipulation">
            <span className="text-lg">🗺️</span>
            <span className="text-xs font-medium text-primary-600 font-['DM_Sans']">Map</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 active:scale-95 touch-manipulation">
            <span className="text-lg">📤</span>
            <span className="text-xs font-medium text-primary-600 font-['DM_Sans']">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 active:scale-95 touch-manipulation">
            <span className="text-lg">❤️</span>
            <span className="text-xs font-medium text-primary-600 font-['DM_Sans']">Save</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 active:scale-95 touch-manipulation">
            <span className="text-lg">📞</span>
            <span className="text-xs font-medium text-primary-600 font-['DM_Sans']">Call</span>
          </button>
        </div>
        
        {/* Booking Row */}
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-primary-900 font-['DM_Sans']">
                {trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.estimated?.toLocaleString() || '999'}
              </span>
              <span className="text-sm text-primary-600 font-['Poppins']">/person</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary-500">
              <span className="text-amber-400">⭐</span>
              <span>{trip.stats?.rating || 4.9}</span>
              <span>({trip.stats?.reviewCount || 127})</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-ocean text-white px-4 py-3 rounded-xl font-bold font-['DM_Sans'] hover:bg-emerald transition-colors active:scale-95 touch-manipulation text-sm">
              🔖 Save
            </button>
            <button 
              onClick={handleBookTrip}
              className="bg-emerald text-white px-6 py-3 rounded-xl font-bold font-['DM_Sans'] hover:bg-blue-ocean transition-colors active:scale-95 touch-manipulation flex items-center gap-2"
            >
              🎆 Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPage;
