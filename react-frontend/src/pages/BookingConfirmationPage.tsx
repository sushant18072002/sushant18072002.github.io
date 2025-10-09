import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingReference, message } = location.state || {};

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-primary-900 mb-4">Booking Confirmed!</h2>
        <p className="text-primary-600 mb-6">
          {message || 'Your booking has been submitted successfully.'}
        </p>
        
        {bookingReference && (
          <div className="bg-primary-50 p-4 rounded-lg mb-6">
            <div className="text-sm text-primary-600 mb-1">Booking Reference</div>
            <div className="text-xl font-bold text-primary-900">{bookingReference}</div>
          </div>
        )}

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
};

export default BookingConfirmationPage;