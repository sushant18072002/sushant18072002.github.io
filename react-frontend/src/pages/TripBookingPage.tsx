import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { apiService } from '@/services/api.service';

const stepOneSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  travelers: z.number().min(1).max(20)
});

const stepTwoSchema = z.object({
  preferredDate: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot')
});

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  travelers: z.number().min(1).max(20),
  preferredDate: z.string().min(1, 'Please select a date'),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  specialRequests: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val, 'You must agree to terms')
});

type BookingFormData = z.infer<typeof bookingSchema>;

const TripBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Debug step changes
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
  }, [currentStep]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const form = useForm<BookingFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: user?.firstName || user?.profile?.firstName || '',
      lastName: user?.lastName || user?.profile?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || user?.profile?.phone || '',
      travelers: 2,
      preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timeSlot: '',
      specialRequests: '',
      agreeTerms: false
    }
  });

  const steps = [
    { id: 1, title: 'Your Details', icon: '👤', desc: 'Personal information' },
    { id: 2, title: 'Schedule', icon: '📅', desc: 'Pick date & time' },
    { id: 3, title: 'Confirm', icon: '✅', desc: 'Review & confirm' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: `/trip-booking/${id}` } });
      return;
    }
    loadTripData();
  }, [id, isAuthenticated]);

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || user.profile?.firstName || '',
        lastName: user.lastName || user.profile?.lastName || '',
        email: user.email || '',
        phone: user.phone || user.profile?.phone || '',
        travelers: form.getValues('travelers') || 2,
        preferredDate: form.getValues('preferredDate') || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeSlot: form.getValues('timeSlot') || '',
        specialRequests: form.getValues('specialRequests') || '',
        agreeTerms: form.getValues('agreeTerms') || false
      });
    }
  }, [user, form]);

  const loadTripData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await apiService.get(`/trips/${id}`);
      if (response.success) {
        setTrip(response.data.trip || response.data);
      }
    } catch (error) {
      console.error('Failed to load trip:', error);
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [
      '09:00 AM - 10:00 AM',
      '10:30 AM - 11:30 AM', 
      '12:00 PM - 01:00 PM',
      '02:00 PM - 03:00 PM',
      '03:30 PM - 04:30 PM',
      '05:00 PM - 06:00 PM'
    ];
    console.log('Generated time slots:', slots);
    setAvailableSlots(slots);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleStepOne = async () => {
    console.log('Step 1 button clicked');
    
    // Clear previous errors
    form.clearErrors();
    
    // Get current form values
    const formData = form.getValues();
    console.log('Step 1 form data:', formData);
    
    // Manual validation with error display
    let hasErrors = false;
    
    if (!formData.firstName || formData.firstName.length < 2) {
      form.setError('firstName', { message: 'First name required' });
      hasErrors = true;
    }
    
    if (!formData.lastName || formData.lastName.length < 2) {
      form.setError('lastName', { message: 'Last name required' });
      hasErrors = true;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      form.setError('email', { message: 'Valid email required' });
      hasErrors = true;
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      form.setError('phone', { message: 'Valid phone number required' });
      hasErrors = true;
    }
    
    // Validate phone number format
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      form.setError('phone', { message: 'Please enter a valid phone number' });
      hasErrors = true;
    }
    
    if (hasErrors) {
      console.log('Validation failed, stopping');
      return;
    }

    // Update profile if needed
    if (!user?.phone && !user?.profile?.phone) {
      try {
        await apiService.put('/users/profile', {
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }

    generateTimeSlots();
    console.log('Moving to step 2');
    setCurrentStep(2);
  };

  const handleStepTwo = () => {
    const selectedDate = form.getValues('preferredDate');
    const selectedSlot = form.getValues('timeSlot');
    
    if (!selectedDate || !selectedSlot) {
      return;
    }
    
    setCurrentStep(3);
  };

  const handleFinalBooking = async (data: BookingFormData) => {
    setLoading(true);
    try {
      const bookingPayload = {
        tripId: id,
        customerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        },
        bookingDetails: {
          travelers: data.travelers,
          preferredDate: data.preferredDate,
          timeSlot: data.timeSlot,
          specialRequests: data.specialRequests
        },
        tripInfo: {
          title: trip?.title,
          destination: trip?.primaryDestination?.name,
          duration: trip?.duration,
          price: trip?.pricing?.finalPrice || trip?.pricing?.estimated
        }
      };

      const response = await apiService.post('/appointments', bookingPayload);
      
      if (response.success) {
        setBookingConfirmed(true);
      }
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#23262F] mb-4 font-['DM_Sans']">Appointment Booked!</h2>
          <p className="text-[#777E90] mb-6 font-['Poppins']">
            Your consultation appointment has been scheduled. Our travel expert will contact you at the selected time to discuss your trip details.
          </p>
          
          <div className="bg-[#F4F5F6] p-4 rounded-lg mb-6 text-left">
            <div className="text-sm text-[#777E90] mb-1">Appointment Details:</div>
            <div className="font-medium text-[#23262F]">{form.getValues('preferredDate')}</div>
            <div className="font-medium text-[#23262F]">{form.getValues('timeSlot')}</div>
            <div className="text-sm text-[#777E90] mt-2">Reference: TRV-{Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              My Bookings
            </Button>
            <Button onClick={() => navigate('/')} className="flex-1">
              Back Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCFCFD] to-white">
      {/* Header */}
      <section className="bg-white py-6 border-b border-[#E6E8EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#777E90] hover:text-[#23262F] transition-colors mb-4"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#23262F] mb-6 font-['DM_Sans']">Book Your Trip</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep >= step.id
                        ? 'bg-[#3B71FE] text-white'
                        : 'bg-[#F4F5F6] text-[#777E90]'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-semibold ${
                      currentStep >= step.id ? 'text-[#23262F]' : 'text-[#777E90]'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-[#777E90]">{step.desc}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-[#3B71FE]' : 'bg-[#E6E8EC]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#23262F] mb-6 font-['DM_Sans']">Your Details</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#23262F] mb-2">First Name</label>
                        <input
                          {...form.register('firstName')}
                          className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#23262F] mb-2">Last Name</label>
                        <input
                          {...form.register('lastName')}
                          className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                        />
                        {form.formState.errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#23262F] mb-2">Email</label>
                        <input
                          {...form.register('email')}
                          type="email"
                          className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#23262F] mb-2">Phone Number *</label>
                        <input
                          {...form.register('phone')}
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                        )}
                        <p className="text-xs text-[#777E90] mt-1">Required for appointment confirmation</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#23262F] mb-2">Number of Travelers</label>
                      <select
                        {...form.register('travelers', { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                      >
                        {Array.from({length: trip?.groupSize?.max || 8}, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} traveler{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>

                    <Button 
                      type="button" 
                      fullWidth 
                      size="lg"
                      onClick={() => {
                        console.log('Button clicked');
                        const formData = form.getValues();
                        console.log('Form data:', formData);
                        console.log('Current step before:', currentStep);
                        
                        if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
                          console.log('Validation failed - missing fields');
                          alert('Please fill all required fields');
                          return;
                        }
                        
                        console.log('Validation passed, generating slots and moving to step 2');
                        generateTimeSlots();
                        setCurrentStep(2);
                        console.log('Current step after:', 2);
                      }}
                    >
                      Continue to Schedule
                    </Button>
                  </div>
                </Card>
            )}

            {/* Step 2 & 3: Form Submission */}
            {currentStep > 1 && (
              <form onSubmit={form.handleSubmit(currentStep === 2 ? handleStepTwo : handleFinalBooking)}>

              {/* Step 2: Schedule Appointment */}
              {currentStep === 2 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#23262F] mb-6 font-['DM_Sans']">Schedule Consultation</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-[#F4F5F6] p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span>📞</span>
                        <span className="font-semibold text-[#23262F]">Free Consultation Call</span>
                      </div>
                      <p className="text-sm text-[#777E90]">
                        Our travel expert will call you to discuss your trip preferences, customize the itinerary, and answer any questions.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#23262F] mb-2">Preferred Date</label>
                      <input
                        {...form.register('preferredDate')}
                        type="date"
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent"
                      />
                      {form.formState.errors.preferredDate && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#23262F] mb-2">Available Time Slots</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableSlots.map((slot) => (
                          <label key={slot} className="flex items-center p-3 border border-[#E6E8EC] rounded-lg cursor-pointer hover:border-[#3B71FE] transition-colors">
                            <input
                              {...form.register('timeSlot')}
                              type="radio"
                              value={slot}
                              className="mr-3 accent-[#3B71FE]"
                            />
                            <span className="text-sm font-medium">{slot}</span>
                          </label>
                        ))}
                      </div>
                      {form.formState.errors.timeSlot && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.timeSlot.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Continue
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#23262F] mb-6 font-['DM_Sans']">Confirm Appointment</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-[#F4F5F6] p-4 rounded-lg">
                      <h3 className="font-semibold text-[#23262F] mb-3">Appointment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#777E90]">Date:</span>
                          <span className="font-medium">{form.getValues('preferredDate')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#777E90]">Time:</span>
                          <span className="font-medium">{form.getValues('timeSlot')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#777E90]">Contact:</span>
                          <span className="font-medium">{form.getValues('phone')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#23262F] mb-2">Special Requests (Optional)</label>
                      <textarea
                        {...form.register('specialRequests')}
                        rows={3}
                        placeholder="Any specific preferences or questions about the trip..."
                        className="w-full px-4 py-3 border border-[#E6E8EC] rounded-lg focus:ring-2 focus:ring-[#3B71FE] focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        {...form.register('agreeTerms')}
                        type="checkbox"
                        className="mt-1 accent-[#3B71FE]"
                      />
                      <label className="text-sm text-[#777E90]">
                        I agree to the consultation call and understand that this is not a confirmed booking until payment is processed after the call.
                      </label>
                    </div>
                    {form.formState.errors.agreeTerms && (
                      <p className="text-red-500 text-sm">{form.formState.errors.agreeTerms.message}</p>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? <LoadingSpinner size="sm" /> : 'Confirm Appointment'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              </form>
            )}
          </div>

          {/* Trip Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-[#23262F] mb-4 font-['DM_Sans']">Trip Summary</h3>
              
              {trip && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#23262F]">{trip.title}</h4>
                    <p className="text-sm text-[#777E90]">{trip.primaryDestination?.name}</p>
                    <p className="text-sm text-[#777E90]">{trip.duration?.days} days, {trip.duration?.nights} nights</p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Price per person</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{trip.pricing?.finalPrice || trip.pricing?.estimated || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Travelers</span>
                      <span>{form.watch('travelers')} person{form.watch('travelers') > 1 ? 's' : ''}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Estimated Total</span>
                      <span>{trip.pricing?.currency === 'INR' ? '₹' : '$'}{((trip.pricing?.finalPrice || trip.pricing?.estimated || 0) * form.watch('travelers')).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-[#58C27D]/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-[#58C27D] font-semibold text-sm">
                      <span>✅</span>
                      <span>No payment required now</span>
                    </div>
                    <p className="text-xs text-[#777E90] mt-1">Payment will be discussed during consultation</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBookingPage;