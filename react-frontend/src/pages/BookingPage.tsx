import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { paymentService } from '@/services/payment.service';
import { notificationService } from '@/services/notification.service';
import { unifiedBookingService, UnifiedBookingData } from '@/services/unified-booking.service';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  specialRequests: z.string().optional(),
  agreeTerms: z.boolean().refine(val => val, 'You must agree to terms')
});

const BookingPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      specialRequests: '',
      agreeTerms: false
    }
  });

  const steps = [
    { id: 1, title: 'Details', icon: '👤' },
    { id: 2, title: 'Payment', icon: '💳' },
    { id: 3, title: 'Confirmation', icon: '✅' }
  ];

  // Sample booking data
  const sampleBooking = {
    flight: {
      title: 'NYC → Paris',
      airline: 'Delta Airlines',
      date: 'Dec 15, 2024',
      passengers: 2,
      price: 599,
      total: 1198
    },
    hotel: {
      title: 'Spectacular views of Queenstown',
      location: 'Queenstown, New Zealand',
      dates: 'May 15-22, 2024',
      guests: 2,
      nights: 7,
      price: 109,
      total: 763
    },
    package: {
      title: '7-Day Queenstown Adventure Package',
      location: 'Queenstown, New Zealand',
      dates: 'May 15-22, 2024',
      travelers: 2,
      price: 999,
      total: 1797
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: location.pathname } });
      return;
    }
    setBookingData(sampleBooking[type as keyof typeof sampleBooking]);
  }, [type, id, isAuthenticated]);

  const handleSubmit = async (data: z.infer<typeof bookingSchema>) => {
    setLoading(true);
    try {
      const bookingData: UnifiedBookingData = {
        type: type as 'flight' | 'hotel' | 'itinerary' | 'package',
        itemId: id!,
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        },
        bookingDetails: bookingData || {},
        addOns: [],
        paymentInfo: {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardName: ''
        },
        specialRequests: data.specialRequests,
        totalPrice: calculateTotal().total
      };
      
      await unifiedBookingService.validateBooking(bookingData);
      setCurrentStep(2);
    } catch (error) {
      console.error('Booking validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(calculateTotal().total * 100);
      
      // Simulate payment confirmation
      await paymentService.confirmPayment(paymentIntent.data.paymentIntent.id, 'pm_card_visa');
      
      // Send booking confirmation email
      const result = await unifiedBookingService.createBooking({
        type: type as 'flight' | 'hotel' | 'itinerary' | 'package',
        itemId: id!,
        personalInfo: form.getValues(),
        bookingDetails: bookingData || {},
        addOns: [],
        paymentInfo: { cardNumber: '', expiryDate: '', cvv: '', cardName: '' },
        totalPrice: calculateTotal().total
      });
      
      await notificationService.sendBookingConfirmation(result.data.booking.id, user?.email || '');
      
      setCurrentStep(3);
    } catch (error) {
      console.error('Payment failed:', error);
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
          
          <h1 className="text-3xl font-bold text-primary-900 mb-6">Complete Your Booking</h1>
          
          {/* Progress Steps */}
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
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Traveler Details</h2>
                
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">First Name</label>
                      <input
                        {...form.register('firstName')}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Last Name</label>
                      <input
                        {...form.register('lastName')}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Email</label>
                      <input
                        {...form.register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Phone</label>
                      <input
                        {...form.register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                      )}
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
                      I agree to the <a href="/terms" className="text-blue-ocean hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-blue-ocean hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                  {form.formState.errors.agreeTerms && (
                    <p className="text-red-500 text-sm">{form.formState.errors.agreeTerms.message}</p>
                  )}

                  <Button type="submit" fullWidth size="lg" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'Continue to Payment'}
                  </Button>
                </form>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Payment Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span>🔒</span>
                        <span className="font-semibold text-primary-900">Secure Payment</span>
                      </div>
                      <p className="text-sm text-primary-600">Your payment information is encrypted and secure</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded-lg">
                        <span>💳</span>
                        <span className="text-sm">Visa</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded-lg">
                        <span>💳</span>
                        <span className="text-sm">Mastercard</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-primary-200 rounded-lg">
                        <span>🅿️</span>
                        <span className="text-sm">PayPal</span>
                      </div>
                    </div>
                  </div>

                  <Button fullWidth size="lg" onClick={processPayment} disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : `Pay $${bookingData.total}`}
                  </Button>
                </div>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-primary-900 mb-4">Booking Confirmed!</h2>
                <p className="text-primary-600 mb-6">
                  Your booking has been confirmed. You'll receive a confirmation email shortly.
                </p>
                
                <div className="bg-primary-50 p-4 rounded-lg mb-6">
                  <div className="text-sm text-primary-600 mb-1">Booking Reference</div>
                  <div className="text-xl font-bold text-primary-900">TRV-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    View Booking
                  </Button>
                  <Button onClick={() => navigate('/')}>
                    Back to Home
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary-900">{bookingData.title}</h4>
                  <p className="text-sm text-primary-600">{bookingData.location || bookingData.airline}</p>
                  <p className="text-sm text-primary-600">{bookingData.date || bookingData.dates}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Base Price</span>
                    <span>${bookingData.price}</span>
                  </div>
                  {bookingData.nights && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>{bookingData.nights} nights × {bookingData.guests} guests</span>
                      <span>${bookingData.price * bookingData.nights}</span>
                    </div>
                  )}
                  {bookingData.passengers && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>{bookingData.passengers} passengers</span>
                      <span>${bookingData.price * bookingData.passengers}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mb-2">
                    <span>Service Fee</span>
                    <span>$99</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${bookingData.total}</span>
                  </div>
                </div>

                <div className="bg-emerald/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald font-semibold text-sm">
                    <span>✅</span>
                    <span>Free cancellation up to 24h</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;