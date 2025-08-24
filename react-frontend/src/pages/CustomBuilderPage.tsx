import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const CustomBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    travelStyle: '',
    interests: [],
    accommodation: '',
    transportation: '',
    groupSize: 1,
    specialRequests: ''
  });

  const steps = [
    { id: 1, title: 'Destination', icon: '🌍' },
    { id: 2, title: 'Duration & Budget', icon: '📅' },
    { id: 3, title: 'Travel Style', icon: '✨' },
    { id: 4, title: 'Interests', icon: '🎯' },
    { id: 5, title: 'Preferences', icon: '⚙️' },
    { id: 6, title: 'Review', icon: '📋' }
  ];

  const destinations = [
    { id: 'europe', name: 'Europe', countries: ['France', 'Italy', 'Spain', 'Greece', 'Germany'] },
    { id: 'asia', name: 'Asia', countries: ['Japan', 'Thailand', 'Indonesia', 'Vietnam', 'India'] },
    { id: 'americas', name: 'Americas', countries: ['USA', 'Canada', 'Mexico', 'Brazil', 'Peru'] },
    { id: 'oceania', name: 'Oceania', countries: ['Australia', 'New Zealand', 'Fiji'] },
    { id: 'africa', name: 'Africa', countries: ['South Africa', 'Kenya', 'Morocco', 'Egypt'] }
  ];

  const travelStyles = [
    { id: 'luxury', name: 'Luxury', desc: 'Premium experiences, 5-star hotels', icon: '💎' },
    { id: 'adventure', name: 'Adventure', desc: 'Outdoor activities, unique experiences', icon: '🏔️' },
    { id: 'cultural', name: 'Cultural', desc: 'Museums, history, local traditions', icon: '🎭' },
    { id: 'relaxation', name: 'Relaxation', desc: 'Beaches, spas, peaceful settings', icon: '🧘' },
    { id: 'budget', name: 'Budget', desc: 'Affordable options, local experiences', icon: '💰' }
  ];

  const interests = [
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'nature', name: 'Nature & Wildlife', icon: '🌿' },
    { id: 'history', name: 'History & Museums', icon: '🏛️' },
    { id: 'nightlife', name: 'Nightlife & Entertainment', icon: '🎉' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'photography', name: 'Photography', icon: '📸' },
    { id: 'wellness', name: 'Wellness & Spa', icon: '💆' },
    { id: 'sports', name: 'Sports & Activities', icon: '⚽' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const generateItinerary = () => {
    // Navigate to results with form data
    navigate('/custom-builder/results', { state: { formData } });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">Where do you want to go?</h2>
              <p className="text-primary-600">Choose your dream destination</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(region => (
                <Card
                  key={region.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    formData.destination === region.id ? 'ring-2 ring-blue-ocean bg-blue-50' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, destination: region.id }))}
                >
                  <h3 className="text-xl font-bold text-primary-900 mb-3">{region.name}</h3>
                  <div className="space-y-1">
                    {region.countries.slice(0, 3).map(country => (
                      <div key={country} className="text-sm text-primary-600">{country}</div>
                    ))}
                    {region.countries.length > 3 && (
                      <div className="text-sm text-primary-500">+{region.countries.length - 3} more</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <input
                type="text"
                placeholder="Or type a specific destination..."
                className="w-full max-w-md px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                value={formData.destination.startsWith('custom:') ? formData.destination.slice(7) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: `custom:${e.target.value}` }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">Duration & Budget</h2>
              <p className="text-primary-600">How long and how much?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-primary-900 mb-4">Trip Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  {['3-5 days', '1 week', '2 weeks', '3+ weeks'].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setFormData(prev => ({ ...prev, duration }))}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        formData.duration === duration
                          ? 'border-blue-ocean bg-blue-50 text-blue-ocean'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-primary-900 mb-4">Budget per person</label>
                <div className="space-y-3">
                  {[
                    { id: 'budget', label: 'Budget', range: '$500 - $1,500' },
                    { id: 'mid', label: 'Mid-range', range: '$1,500 - $3,000' },
                    { id: 'luxury', label: 'Luxury', range: '$3,000 - $6,000' },
                    { id: 'ultra', label: 'Ultra Luxury', range: '$6,000+' }
                  ].map(budget => (
                    <button
                      key={budget.id}
                      onClick={() => setFormData(prev => ({ ...prev, budget: budget.id }))}
                      className={`w-full p-4 border rounded-lg text-left transition-all ${
                        formData.budget === budget.id
                          ? 'border-blue-ocean bg-blue-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold">{budget.label}</div>
                      <div className="text-sm text-primary-600">{budget.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">What's your travel style?</h2>
              <p className="text-primary-600">Choose the style that best describes you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {travelStyles.map(style => (
                <Card
                  key={style.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    formData.travelStyle === style.id ? 'ring-2 ring-blue-ocean bg-blue-50' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                >
                  <div className="text-4xl mb-3">{style.icon}</div>
                  <h3 className="text-xl font-bold text-primary-900 mb-2">{style.name}</h3>
                  <p className="text-primary-600">{style.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">What interests you most?</h2>
              <p className="text-primary-600">Select all that apply (3-5 recommended)</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {interests.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    formData.interests.includes(interest.id)
                      ? 'border-blue-ocean bg-blue-50 text-blue-ocean'
                      : 'border-primary-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-semibold">{interest.name}</div>
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm text-primary-600">
              Selected: {formData.interests.length} interests
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">Final preferences</h2>
              <p className="text-primary-600">A few more details to perfect your trip</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-semibold text-primary-900 mb-4">Accommodation</label>
                <div className="space-y-3">
                  {[
                    { id: 'hotel', label: 'Hotels', desc: 'Traditional hotel experience' },
                    { id: 'boutique', label: 'Boutique', desc: 'Unique, smaller properties' },
                    { id: 'resort', label: 'Resorts', desc: 'All-inclusive experiences' },
                    { id: 'local', label: 'Local Stays', desc: 'B&Bs, guesthouses' }
                  ].map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => setFormData(prev => ({ ...prev, accommodation: acc.id }))}
                      className={`w-full p-3 border rounded-lg text-left transition-all ${
                        formData.accommodation === acc.id
                          ? 'border-blue-ocean bg-blue-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-sm text-primary-600">{acc.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-primary-900 mb-4">Group Size</label>
                <select
                  value={formData.groupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent mb-6"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} traveler{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                
                <label className="block text-lg font-semibold text-primary-900 mb-4">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Any special requirements, dietary restrictions, accessibility needs, or specific requests..."
                  rows={4}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary-900 mb-4">Review your preferences</h2>
              <p className="text-primary-600">Everything looks good? Let's create your perfect itinerary!</p>
            </div>
            
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Destination</h3>
                  <p className="text-primary-600 mb-4">
                    {formData.destination.startsWith('custom:') 
                      ? formData.destination.slice(7)
                      : destinations.find(d => d.id === formData.destination)?.name || 'Not selected'
                    }
                  </p>
                  
                  <h3 className="font-semibold text-primary-900 mb-2">Duration</h3>
                  <p className="text-primary-600 mb-4">{formData.duration || 'Not selected'}</p>
                  
                  <h3 className="font-semibold text-primary-900 mb-2">Budget</h3>
                  <p className="text-primary-600 mb-4">
                    {formData.budget ? formData.budget.charAt(0).toUpperCase() + formData.budget.slice(1) : 'Not selected'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">Travel Style</h3>
                  <p className="text-primary-600 mb-4">
                    {travelStyles.find(s => s.id === formData.travelStyle)?.name || 'Not selected'}
                  </p>
                  
                  <h3 className="font-semibold text-primary-900 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.interests.map(interestId => {
                      const interest = interests.find(i => i.id === interestId);
                      return interest ? (
                        <span key={interestId} className="px-2 py-1 bg-blue-50 text-blue-ocean rounded text-sm">
                          {interest.icon} {interest.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  
                  <h3 className="font-semibold text-primary-900 mb-2">Group Size</h3>
                  <p className="text-primary-600">{formData.groupSize} traveler{formData.groupSize > 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {formData.specialRequests && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-primary-900 mb-2">Special Requests</h3>
                  <p className="text-primary-600">{formData.specialRequests}</p>
                </div>
              )}
            </Card>
            
            <div className="text-center">
              <Button size="lg" onClick={generateItinerary} className="px-8">
                🎯 Generate My Perfect Itinerary
              </Button>
              <p className="text-sm text-primary-600 mt-2">
                This will take 30-60 seconds to create your custom itinerary
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-primary-50 py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/itineraries')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors mb-4"
          >
            <span>←</span>
            <span>Back to Itineraries</span>
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/ai-itinerary')}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-200"
            >
              🤖 AI Builder
            </button>
            <button 
              onClick={() => navigate('/packages')}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold hover:bg-primary-200"
            >
              📦 Packages
            </button>
            <button className="px-4 py-2 bg-blue-ocean text-white rounded-lg font-semibold">
              🛠️ Custom
            </button>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary-900">Custom Trip Builder</h1>
            <span className="text-sm text-primary-600">Step {currentStep} of {steps.length}</span>
          </div>
          
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep >= step.id
                        ? 'bg-blue-ocean text-white'
                        : 'bg-primary-200 text-primary-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className={`text-sm font-semibold ${
                      currentStep >= step.id ? 'text-primary-900' : 'text-primary-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-blue-ocean' : 'bg-primary-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderStep()}
          
          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < steps.length && (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.destination) ||
                  (currentStep === 2 && (!formData.duration || !formData.budget)) ||
                  (currentStep === 3 && !formData.travelStyle) ||
                  (currentStep === 4 && formData.interests.length === 0)
                }
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomBuilderPage;