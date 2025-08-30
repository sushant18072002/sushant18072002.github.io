import React, { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

const BookingManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-900">Booking Management</h2>
      </div>

      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-primary-900 mb-2">Booking Management</h3>
        <p className="text-primary-600 mb-6">Manage customer bookings and reservations</p>
        <Button>View Bookings</Button>
      </Card>
    </div>
  );
};

export default BookingManagement;