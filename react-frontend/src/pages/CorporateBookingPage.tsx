import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { corporateService } from '@/services/corporate.service';
import { tripService } from '@/services/trip.service';

const corporateBookingSchema = z.object({
  // Corporate details
  department: z.string().min(1, 'Department is required'),
  project: z.string().optional(),
  purpose: z.string().min(1, 'Travel purpose is required'),
  purposeDescription: z.string().optional(),
  
  // Primary traveler (always the booking user)
  primaryTraveler: z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email required'),
    department: z.string().min(1, 'Department required')
  }),
  
  // Additional travelers
  additionalTravelers: z.array(z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.string().email('Valid email required'),
    department: z.string().min(1, 'Department required')
  })).optional(),
  
  // Travel dates
  departureDate: z.string().min(1, 'Departure date required'),
  returnDate: z.string().optional(),
  
  specialRequests: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val, 'You must agree to terms')
});

type CorporateBookingFormData = z.infer<typeof corporateBookingSchema>;

const CorporateBookingPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<string[]>([]);

  const form = useForm<CorporateBookingFormData>({
    resolver: zodResolver(corporateBookingSchema),
    defaultValues: {
      department: user?.corporate?.department || '',
      project: '',
      purpose: 'business-meeting',
      purposeDescription: '',
      primaryTraveler: {
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        email: user?.email || '',
        department: user?.corporate?.department || ''
      },
      additionalTravelers: [],
      departureDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: '',
      specialRequests: '',
      agreeTerms: false
    }
  });

  const steps = [
    { id: 1, title: 'Corporate Details', icon: '🏢' },
    { id: 2, title: 'Travelers', icon: '👥' },
    { id: 3, title: 'Review & Submit', icon: '✅' }
  ];

  const travelPurposes = [
    { value: 'business-meeting', label: 'Business Meeting' },
    { value: 'conference', label: 'Conference/Event' },
    { value: 'training', label: 'Training' },
    { value: 'client-visit', label: 'Client Visit' },
    { value: 'team-building', label: 'Team Building' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }

    if (!user?.corporate?.company) {
      navigate('/corporate/setup');
      return;
    }

    loadInitialData();
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load company details
      const companyResponse = await corporateService.getCompanyDetails();
      setCompany(companyResponse.data.company);
      
      // Extract departments from budget controls
      const depts = companyResponse.data.company.settings.budgetControls.departmentBudgets.map(
        (budget: any) => budget.department
      );
      setDepartments(depts);

      // Load booking item data
      if (type === 'trip' && id) {
        const tripResponse = await tripService.getTripDetails(id);
        const trip = tripResponse.trip;
        setBookingData({
          title: trip.title,
          destination: trip.primaryDestination?.name,
          duration: `${trip.duration?.days} days, ${trip.duration?.nights} nights`,
          price: trip.pricing?.finalPrice || trip.pricing?.estimated || 0,
          currency: trip.pricing?.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTraveler = () => {
    const currentTravelers = form.getValues('additionalTravelers') || [];
    form.setValue('additionalTravelers', [
      ...currentTravelers,
      {
        firstName: '',
        lastName: '',
        email: '',
        department: user?.corporate?.department || ''
      }
    ]);
  };

  const removeTraveler = (index: number) => {
    const currentTravelers = form.getValues('additionalTravelers') || [];
    form.setValue('additionalTravelers', currentTravelers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: CorporateBookingFormData) => {
    setLoading(true);
    try {
      const travelers = [
        { employee: { ...data.primaryTraveler }, isPrimary: true },
        ...(data.additionalTravelers || []).map(traveler => ({
          employee: traveler,
          isPrimary: false
        }))
      ];

      const bookingPayload = {
        type: type as string,
        corporate: {
          department: data.department,
          project: data.project,
          purpose: data.purpose,
          purposeDescription: data.purposeDescription
        },
        travelers,
        bookingDetails: {
          [type as string]: {
            [`${type}Id`]: id,
            ...bookingData
          }
        },
        travelDates: {
          departure: data.departureDate,
          return: data.returnDate
        },
        specialRequests: data.specialRequests
      };

      const response = await corporateService.createCorporateBooking(bookingPayload);
      
      // Navigate to success page or bookings list
      navigate('/corporate/bookings', {
        state: {
          message: response.data.message,
          bookingReference: response.data.booking.bookingReference,
          requiresApproval: response.data.requiresApproval
        }
      });
    } catch (error: any) {
      console.error('Corporate booking failed:', error);
      alert(error.response?.data?.error?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors mb-4"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Corporate Booking</h1>
          <p className="text-primary-600">Book travel for your team with corporate rates and approval workflow</p>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6">
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
                  <div className="ml-2">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {/* Step 1: Corporate Details */}
              {currentStep === 1 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-primary-900 mb-6">Corporate Details</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Department *</label>
                        <select
                          {...form.register('department')}
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        {form.formState.errors.department && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.department.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Project/Cost Center</label>
                        <input
                          {...form.register('project')}
                          placeholder="Optional"
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Travel Purpose *</label>
                      <select
                        {...form.register('purpose')}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      >
                        {travelPurposes.map(purpose => (
                          <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                        ))}
                      </select>
                      {form.formState.errors.purpose && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.purpose.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Purpose Description</label>
                      <textarea
                        {...form.register('purposeDescription')}
                        rows={3}
                        placeholder="Provide more details about the travel purpose..."
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Departure Date *</label>
                        <input
                          {...form.register('departureDate')}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        />
                        {form.formState.errors.departureDate && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.departureDate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Return Date</label>
                        <input
                          {...form.register('returnDate')}
                          type="date"
                          min={form.watch('departureDate')}
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        />
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      fullWidth 
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Travelers
                    </Button>
                  </div>
                </Card>
              )}

              {/* Step 2: Travelers */}
              {currentStep === 2 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-primary-900 mb-6">Travelers</h2>
                  
                  <div className="space-y-6">
                    {/* Primary Traveler */}
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-primary-900 mb-4">Primary Traveler (You)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">First Name *</label>
                          <input
                            {...form.register('primaryTraveler.firstName')}
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Last Name *</label>
                          <input
                            {...form.register('primaryTraveler.lastName')}
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Email *</label>
                          <input
                            {...form.register('primaryTraveler.email')}
                            type="email"
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-primary-900 mb-2">Department *</label>
                          <select
                            {...form.register('primaryTraveler.department')}
                            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                          >
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Additional Travelers */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-primary-900">Additional Travelers</h3>
                        <Button type="button" variant="outline" onClick={addTraveler}>
                          + Add Traveler
                        </Button>
                      </div>

                      {form.watch('additionalTravelers')?.map((_, index) => (
                        <div key={index} className="border border-primary-200 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-primary-900">Traveler {index + 2}</h4>
                            <button
                              type="button"
                              onClick={() => removeTraveler(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-primary-900 mb-2">First Name *</label>
                              <input
                                {...form.register(`additionalTravelers.${index}.firstName`)}
                                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-primary-900 mb-2">Last Name *</label>
                              <input
                                {...form.register(`additionalTravelers.${index}.lastName`)}
                                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-primary-900 mb-2">Email *</label>
                              <input
                                {...form.register(`additionalTravelers.${index}.email`)}
                                type="email"
                                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-primary-900 mb-2">Department *</label>
                              <select
                                {...form.register(`additionalTravelers.${index}.department`)}
                                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                              >
                                {departments.map(dept => (
                                  <option key={dept} value={dept}>{dept}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button type="button" onClick={() => setCurrentStep(3)} className="flex-1">
                        Continue to Review
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <Card className="p-6">
                  <h2 className="text-2xl font-bold text-primary-900 mb-6">Review & Submit</h2>
                  
                  <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-primary-900 mb-3">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Department:</span>
                          <span className="font-medium">{form.watch('department')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Purpose:</span>
                          <span className="font-medium">{travelPurposes.find(p => p.value === form.watch('purpose'))?.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Travelers:</span>
                          <span className="font-medium">{1 + (form.watch('additionalTravelers')?.length || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Travel Dates:</span>
                          <span className="font-medium">
                            {form.watch('departureDate')} 
                            {form.watch('returnDate') && ` - ${form.watch('returnDate')}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Special Requests</label>
                      <textarea
                        {...form.register('specialRequests')}
                        rows={3}
                        placeholder="Any special requirements or requests..."
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        {...form.register('agreeTerms')}
                        type="checkbox"
                        className="mt-1 accent-blue-ocean"
                      />
                      <label className="text-sm text-primary-700">
                        I agree to the corporate travel policy and understand that this booking may require approval before confirmation.
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
                        {loading ? <LoadingSpinner size="sm" /> : 'Submit Booking'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Booking Details</h3>
              
              {bookingData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary-900">{bookingData.title}</h4>
                    <p className="text-sm text-primary-600">{bookingData.destination}</p>
                    <p className="text-sm text-primary-600">{bookingData.duration}</p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Base Price (per person)</span>
                      <span>{bookingData.currency} {bookingData.price}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Corporate Discount</span>
                      <span className="text-emerald">-10%</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Estimated Total</span>
                      <span>{bookingData.currency} {Math.round(bookingData.price * 0.9 * (1 + (form.watch('additionalTravelers')?.length || 0)))}</span>
                    </div>
                  </div>

                  <div className="bg-amber-premium/10 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-premium font-semibold text-sm">
                      <span>⚠️</span>
                      <span>Approval Required</span>
                    </div>
                    <p className="text-xs text-primary-600 mt-1">This booking will be sent for approval based on your company policy</p>
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

export default CorporateBookingPage;