import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api.service';
import { TripData } from '@/types/trip.types';
import { sanitizeHtml, sanitizeUrl } from '@/utils/sanitize';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (id && !trip) {
      loadTripDetails();
    }
  }, [id, trip]);

  const loadTripDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await apiService.get(`/trips/${id}`);
      if (data.success) {
        setTrip(data.data.trip || data.data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
        <div className="animate-pulse">
          <div className="h-[70vh] bg-gradient-to-r from-gray-200 to-gray-300 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="h-8 bg-white/20 rounded-lg w-3/4 mb-4"></div>
              <div className="h-12 bg-white/20 rounded-lg w-1/2"></div>
            </div>
          </div>
          
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
      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between py-4 lg:py-6">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full shadow-sm">
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
            <span className="text-[#B1B5C3] text-sm font-['DM_Sans'] font-bold">
              {trip.title.length > 15 ? `${trip.title.substring(0, 15)}...` : trip.title}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#23262F] mb-4 font-['DM_Sans'] leading-tight">
              {sanitizeHtml(trip.title)}
            </h1>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=24&h=24&fit=crop&crop=face" 
                  alt="Host" 
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-[#777E90] text-sm font-['Poppins'] font-medium">Hosted by</span>
                <span className="text-[#23262F] text-sm font-['Poppins'] font-medium">Adventure Tours</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[#23262F] text-sm font-['Poppins'] font-medium">{trip.stats?.rating || 4.8}</span>
                <span className="text-[#777E90] text-sm font-['Poppins']">({trip.stats?.reviewCount || 256} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#777E90]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-[#777E90] text-sm font-['Poppins']">
                  {trip.destinations?.map(d => d.name).join(', ') || trip.primaryDestination?.name || 'Amazing Destination'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 bg-white border-2 border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
              <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white border-2 border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
              <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white border-2 border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
              <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white border-2 border-[#E6E8EC] rounded-full flex items-center justify-center hover:border-[#3B71FE] transition-colors">
              <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-4 h-[500px] rounded-3xl overflow-hidden mb-16">
          <div className="col-span-2 row-span-2">
            <img
              src={trip.images?.[0]?.url?.startsWith('http') 
                ? sanitizeUrl(trip.images[0].url) 
                : trip.images?.[0]?.url 
                  ? sanitizeUrl(`${API_BASE_URL}${trip.images[0].url}`) 
                  : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'}
              alt={trip.title}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => {
                setSelectedImageIndex(0);
                setShowImageModal(true);
              }}
            />
            <button 
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-6 left-6 bg-[#FCFCFD] text-[#23262F] px-4 py-2 rounded-2xl font-bold text-sm font-['DM_Sans'] shadow-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Show all photos
            </button>
          </div>
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="relative">
              <img
                src={trip.images?.[index]?.url?.startsWith('http') 
                  ? sanitizeUrl(trip.images[index].url) 
                  : trip.images?.[index]?.url 
                    ? sanitizeUrl(`${API_BASE_URL}${trip.images[index].url}`) 
                    : `https://images.unsplash.com/photo-150690592534${index}-21bda4d32df4?w=400&h=240&fit=crop`}
                alt={`${trip.title} - Image ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowImageModal(true);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="border-t border-[#E6E8EC] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Trip Overview */}
              <div>
                <h2 className="text-2xl font-black text-[#23262F] mb-6 font-['DM_Sans']">
                  {trip.category?.name ? `${trip.category.name} Experience` : 'Complete Adventure Experience'}
                </h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#777E90]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">{trip.groupSize?.min || 1}-{trip.groupSize?.max || 20} guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#777E90]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">{trip.duration?.days || 7} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#777E90]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">1 bedroom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#777E90]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">1 private bath</span>
                  </div>
                </div>
                
                <p className="text-[#777E90] text-base font-['Poppins'] leading-relaxed mb-6">
                  {sanitizeHtml(trip.description || 'Described by travel experts as having one of the best experiences we\'ve ever seen, you will love this carefully curated adventure. Every detail has been perfectly planned to create unforgettable memories.')}
                </p>
                
                <p className="text-[#777E90] text-base font-['Poppins'] leading-relaxed mb-6">
                  Enjoy breathtaking views and experiences from your well-appointed accommodations with modern amenities and premium service throughout your journey.
                </p>
                
                <p className="text-[#777E90] text-base font-['Poppins'] leading-relaxed">
                  Your private experience takes in the best of {trip.primaryDestination?.name || 'this destination'}, letting you soak up unparalleled natural beauty by day and cultural richness by night.
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-black text-[#23262F] mb-6 font-['DM_Sans']">What's Included</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Free wifi 24/7</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11H7v9a2 2 0 002 2h6a2 2 0 002-2v-9h-2v9H9v-9z"/>
                      <path d="M13 1H11v2H9v2h6V3h-2V1z"/>
                      <path d="M5 5v2h14V5H5z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Free clean bathroom</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 3H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h3l-1 1v1h12v-1l-1-1h3c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 13H4V5h16v11z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Free computer</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Breakfast included</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Premium services</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-[#777E90]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-[#777E90] text-sm font-['Poppins']">Nearby attractions</span>
                  </div>
                </div>
                
                <button className="mt-8 bg-white border-2 border-[#E6E8EC] text-[#23262F] px-4 py-3 rounded-2xl font-bold text-sm font-['DM_Sans'] hover:border-[#3B71FE] transition-colors">
                  More details
                </button>
              </div>
            </div>

            {/* Right Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-[#FCFCFD] rounded-3xl p-8 shadow-[0_64px_64px_-48px_rgba(15,15,15,0.08)] border border-[#E6E8EC] sticky top-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#B1B5C3] line-through font-['DM_Sans']">
                          ${((trip.pricing?.estimated || 999) * 1.2).toLocaleString()}
                        </span>
                        <span className="text-2xl font-black text-[#23262F] font-['DM_Sans']">
                          ${trip.pricing?.estimated?.toLocaleString() || '999'}
                        </span>
                        <span className="text-[#777E90] text-base font-['Poppins']">/night</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <svg className="w-5 h-5 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-[#23262F] text-sm font-['Poppins'] font-medium">{trip.stats?.rating || 4.8}</span>
                        <span className="text-[#777E90] text-sm font-['Poppins']">({trip.stats?.reviewCount || 256} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face" 
                    alt="Host" 
                    className="w-16 h-16 rounded-full"
                  />
                </div>

                {/* Booking Form */}
                <div className="bg-[#F4F5F6] rounded-2xl p-4 mb-8">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3">
                      <svg className="w-6 h-6 text-[#B1B5C3]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs text-[#777E90] font-['Poppins']">Check-in</div>
                        <div className="text-base font-medium text-[#23262F] font-['Poppins']">May 15, 2021</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border-l border-[#E6E8EC]">
                      <svg className="w-6 h-6 text-[#B1B5C3]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs text-[#777E90] font-['Poppins']">Check-out</div>
                        <div className="text-base font-medium text-[#23262F] font-['Poppins']">May 22, 2021</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <svg className="w-6 h-6 text-[#B1B5C3]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <div>
                      <div className="text-xs text-[#777E90] font-['Poppins']">Guest</div>
                      <div className="text-base font-medium text-[#23262F] font-['Poppins']">2 guests</div>
                    </div>
                  </div>
                </div>

                {/* Booking Actions */}
                <div className="flex gap-2 mb-8">
                  <button className="bg-white border-2 border-[#E6E8EC] text-[#23262F] px-6 py-3 rounded-2xl font-bold text-base font-['DM_Sans'] hover:border-[#3B71FE] transition-colors flex items-center gap-2">
                    Save
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    onClick={handleBookTrip}
                    className="flex-1 bg-[#3B71FE] text-white py-3 rounded-2xl font-bold text-base font-['DM_Sans'] hover:bg-[#58C27D] transition-colors"
                  >
                    Reserve
                  </button>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-['Poppins']">
                    <span className="text-[#777E90]">${trip.pricing?.estimated?.toLocaleString() || '999'} x 7 nights</span>
                    <span className="text-[#23262F] font-medium">${((trip.pricing?.estimated || 999) * 7).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-['Poppins']">
                    <span className="text-[#777E90]">10% campaign discount</span>
                    <span className="text-[#23262F] font-medium">-${Math.round((trip.pricing?.estimated || 999) * 7 * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-['Poppins']">
                    <span className="text-[#777E90]">Service fee</span>
                    <span className="text-[#23262F] font-medium">$103</span>
                  </div>
                  <div className="bg-[#F4F5F6] rounded-lg p-3 flex justify-between font-['Poppins']">
                    <span className="text-[#23262F] font-medium">Total</span>
                    <span className="text-[#23262F] font-medium">${Math.round(((trip.pricing?.estimated || 999) * 7 * 0.9) + 103).toLocaleString()}</span>
                  </div>
                </div>

                {/* Report Link */}
                <div className="text-center">
                  <button className="flex items-center gap-2 text-xs text-[#777E90] font-['Poppins'] mx-auto hover:text-[#23262F] transition-colors">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/>
                    </svg>
                    Report this property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-3xl z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 transition-all"
            >
              ×
            </button>
            
            <img
              src={trip.images?.[selectedImageIndex]?.url?.startsWith('http') 
                ? sanitizeUrl(trip.images[selectedImageIndex].url) 
                : trip.images?.[selectedImageIndex]?.url 
                  ? sanitizeUrl(`${API_BASE_URL}${trip.images[selectedImageIndex].url}`) 
                  : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'}
              alt={`${trip.title} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm">
              {selectedImageIndex + 1} / {trip.images?.length || 5}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailsPage;