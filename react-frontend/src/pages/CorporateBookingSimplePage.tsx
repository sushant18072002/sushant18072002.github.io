import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { tripService } from '@/services/trip.service';
import { apiService } from '@/services/api.service';

const corporateBookingSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  gstNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  specialRequests: z.string().optional()
});

type CorporateBookingFormData = z.infer<typeof corporateBookingSchema>;

const CorporateBookingSimplePage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [travelers, setTravelers] = useState(2);
  const [travelerDetails, setTravelerDetails] = useState<any[]>([]);
  const [submitError, setSubmitError] = useState<string>('');

  const form = useForm<CorporateBookingFormData>({
    resolver: zodResolver(corporateBookingSchema),
    defaultValues: {
      companyName: '',
      contactPerson: user?.profile?.firstName + ' ' + user?.profile?.lastName || '',
      contactEmail: user?.email || '',
      contactPhone: '',
      gstNumber: '',
      billingAddress: '',
      specialRequests: ''
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }
    loadBookingData();
  }, [type, id, isAuthenticated]);

  useEffect(() => {
    // Initialize traveler details when count changes
    const newTravelers = Array.from({ length: travelers }, (_, index) => ({
      id: index + 1,
      title: 'Mr',
      firstName: index === 0 ? user?.profile?.firstName || '' : '',
      lastName: index === 0 ? user?.profile?.lastName || '' : '',
      email: index === 0 ? user?.email || '' : '',
      phone: index === 0 ? user?.profile?.phone || '' : '',
      dateOfBirth: '',
      passportNumber: '',
      nationality: 'Indian'
    }));
    setTravelerDetails(newTravelers);
  }, [travelers, user]);

  const loadBookingData = async () => {
    try {
      if (type === 'trip' && id) {
        const response = await tripService.getTripDetails(id);
        const trip = response.trip;
        setBookingData({
          title: trip.title,
          destination: trip.primaryDestination?.name,
          duration: `${trip.duration?.days} days, ${trip.duration?.nights} nights`,
          pricePerPerson: trip.pricing?.finalPrice || trip.pricing?.estimated || 0,
          currency: trip.pricing?.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Failed to load booking data:', error);
    }
  };

  const updateTravelerDetail = (index: number, field: string, value: string) => {
    setTravelerDetails(prev => prev.map((traveler, i) => 
      i === index ? { ...traveler, [field]: value } : traveler
    ));
  };

  const validateTravelers = () => {
    const errors: string[] = [];
    
    travelerDetails.forEach((traveler, index) => {
      if (!traveler.firstName?.trim()) {
        errors.push(`Traveler ${index + 1}: First name is required`);
      }
      if (!traveler.lastName?.trim()) {
        errors.push(`Traveler ${index + 1}: Last name is required`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async (data: CorporateBookingFormData) => {
    // Clear previous errors
    setSubmitError('');
    
    // Validate travelers
    const travelerErrors = validateTravelers();
    if (travelerErrors.length > 0) {
      setSubmitError('Please fill required traveler details: ' + travelerErrors.join(', '));
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        type: 'corporate-group',
        itemId: id,
        companyDetails: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          gstNumber: data.gstNumber,
          billingAddress: data.billingAddress
        },
        travelers: travelerDetails,
        totalTravelers: travelers,
        specialRequests: data.specialRequests,
        totalAmount: (bookingData?.pricePerPerson || 0) * travelers,
        bookingDetails: bookingData
      };

      const response = await apiService.post('/appointments/corporate-group', bookingPayload);
      
      if (response.success) {
        navigate('/booking-confirmation', {
          state: {
            bookingReference: response.data.booking.bookingReference,
            message: 'Corporate group booking submitted successfully! Our team will contact you within 24 hours.'
          }
        });
      }
    } catch (error: any) {
      console.error('Corporate booking failed:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Booking failed. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalAmount = (bookingData.pricePerPerson || 0) * travelers;

  return (
    <div className="min-h-screen bg-primary-50">
      <section className="bg-white py-6 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-900 transition-colors mb-4"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Corporate Group Booking</h1>
          <p className="text-primary-600">Book for multiple travelers with corporate benefits</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traveler Count */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-4">Number of Travelers</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-primary-700">Total Travelers:</label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Company Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-4">Company Details</h2>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Company Name *</label>
                    <input
                      {...form.register('companyName')}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                      placeholder="Your Company Name"
                    />
                    {form.formState.errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">GST Number</label>
                    <input
                      {...form.register('gstNumber')}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                      placeholder="GST Number (Optional)"
                    />
                    {form.formState.errors.gstNumber && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.gstNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Contact Person *</label>
                    <input
                      {...form.register('contactPerson')}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                    />
                    {form.formState.errors.contactPerson && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPerson.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">Contact Phone *</label>
                    <input
                      {...form.register('contactPhone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                    />
                    {form.formState.errors.contactPhone && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Contact Email *</label>
                  <input
                    {...form.register('contactEmail')}
                    type="email"
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean"
                  />
                  {form.formState.errors.contactEmail && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Billing Address</label>
                  <textarea
                    {...form.register('billingAddress')}
                    rows={3}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean resize-none"
                    placeholder="Complete billing address"
                  />
                </div>
              </form>
            </Card>

            {/* Traveler Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-4">Traveler Details</h2>
              <div className="space-y-6">
                {travelerDetails.map((traveler, index) => (
                  <div key={index} className="border border-primary-200 rounded-lg p-4">
                    <h3 className="font-medium text-primary-900 mb-3">
                      Traveler {index + 1} {index === 0 && '(Primary Contact)'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-primary-600 mb-1">Title</label>
                        <select
                          value={traveler.title}
                          onChange={(e) => updateTravelerDetail(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean text-sm"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-primary-600 mb-1">First Name *</label>
                        <input
                          value={traveler.firstName}
                          onChange={(e) => updateTravelerDetail(index, 'firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-ocean text-sm ${
                            !traveler.firstName?.trim() ? 'border-red-300 bg-red-50' : 'border-primary-200'
                          }`}
                          placeholder="Required"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-primary-600 mb-1">Last Name *</label>
                        <input
                          value={traveler.lastName}
                          onChange={(e) => updateTravelerDetail(index, 'lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-ocean text-sm ${
                            !traveler.lastName?.trim() ? 'border-red-300 bg-red-50' : 'border-primary-200'
                          }`}
                          placeholder="Required"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-sm text-primary-600 mb-1">Email</label>
                        <input
                          value={traveler.email}
                          onChange={(e) => updateTravelerDetail(index, 'email', e.target.value)}
                          type="email"
                          className="w-full px-3 py-2 border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-primary-600 mb-1">Phone</label>
                        <input
                          value={traveler.phone}
                          onChange={(e) => updateTravelerDetail(index, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-primary-200 rounded focus:ring-1 focus:ring-blue-ocean text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Special Requests */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-900 mb-4">Special Requests</h2>
              <textarea
                {...form.register('specialRequests')}
                rows={4}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean resize-none"
                placeholder="Any special requirements for the group (dietary preferences, room preferences, etc.)..."
              />
              {form.formState.errors.specialRequests && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.specialRequests.message}</p>
              )}
            </Card>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="bg-white p-6 rounded-lg border-2 border-blue-ocean">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-primary-900">Ready to Book?</h3>
                <p className="text-sm text-primary-600">Please ensure all required fields are filled</p>
              </div>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                fullWidth
                size="lg"
                disabled={loading}
                className="bg-gradient-to-r from-blue-ocean to-emerald"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Processing Booking...</span>
                  </div>
                ) : (
                  `Book for ${travelers} Travelers - ${bookingData.currency} ${Math.round(totalAmount * 0.95).toLocaleString()}`
                )}
              </Button>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary-900">{bookingData.title}</h4>
                  <p className="text-sm text-primary-600">{bookingData.destination}</p>
                  <p className="text-sm text-primary-600">{bookingData.duration}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Price per person</span>
                    <span>{bookingData.currency} {bookingData.pricePerPerson?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Number of travelers</span>
                    <span>{travelers}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Group discount (5%)</span>
                    <span className="text-emerald">-{bookingData.currency} {Math.round(totalAmount * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{bookingData.currency} {Math.round(totalAmount * 0.95).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald font-semibold text-sm">
                    <span>✅</span>
                    <span>Corporate Benefits</span>
                  </div>
                  <ul className="text-xs text-primary-600 mt-2 space-y-1">
                    <li>• 5% group discount applied</li>
                    <li>• GST invoice provided</li>
                    <li>• Flexible payment terms</li>
                    <li>• Dedicated support</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateBookingSimplePage;