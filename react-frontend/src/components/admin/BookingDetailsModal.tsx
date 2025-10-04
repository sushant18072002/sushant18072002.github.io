import React from 'react';
import Button from '@/components/common/Button';

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
  onRecordPayment: (bookingId: string, amount: number) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  onRecordPayment
}) => {
  if (!isOpen || !booking) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending-payment': 'bg-orange-100 text-orange-800 border-orange-200',
      'payment-received': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const remainingAmount = (booking.pricing?.finalAmount || 0) - (booking.payment?.totalPaid || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">Booking Details</h2>
            <p className="text-primary-600">{booking.bookingReference}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-primary-400 hover:text-primary-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {(booking.status || 'draft').replace('-', ' ').toUpperCase()}
              </span>
              <div className="text-sm text-gray-600">
                Created: {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2">
              {booking.payment?.status === 'pending' && remainingAmount > 0 && (
                <Button
                  size="sm"
                  onClick={() => onRecordPayment(booking._id, remainingAmount)}
                >
                  Record Payment
                </Button>
              )}
              <select
                value={booking.status || 'draft'}
                onChange={(e) => onStatusUpdate(booking._id, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="draft">Draft</option>
                <option value="pending-payment">Pending Payment</option>
                <option value="payment-received">Payment Received</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-primary-900">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-primary-900">{booking.customer?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-primary-900">{booking.customer?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Travelers</label>
                  <p className="text-primary-900">
                    {booking.travelers?.count || 1} traveler{(booking.travelers?.count || 1) > 1 ? 's' : ''} 
                    ({booking.travelers?.adults || 1} adults, {booking.travelers?.children || 0} children)
                  </p>
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Trip Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="text-primary-900">{booking.trip?.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-primary-900">{booking.trip?.destination || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-primary-900">
                    {booking.trip?.duration?.days || 0} days, {booking.trip?.duration?.nights || 0} nights
                  </p>
                </div>
                {booking.trip?.startDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Travel Dates</label>
                    <p className="text-primary-900">
                      {new Date(booking.trip.startDate).toLocaleDateString()} - {' '}
                      {booking.trip.endDate ? new Date(booking.trip.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Pricing & Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="text-sm font-medium text-blue-700">Base Price</label>
                <p className="text-xl font-bold text-blue-900">
                  {booking.pricing?.currency || '$'}{(booking.pricing?.basePrice || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="text-sm font-medium text-green-700">Total Amount</label>
                <p className="text-xl font-bold text-green-900">
                  {booking.pricing?.currency || '$'}{(booking.pricing?.finalAmount || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <label className="text-sm font-medium text-orange-700">Remaining</label>
                <p className="text-xl font-bold text-orange-900">
                  {booking.pricing?.currency || '$'}{remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.payment?.status || 'pending')}`}>
                  {(booking.payment?.status || 'pending').toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Method:</span>
                  <span className="ml-2 font-medium">{booking.payment?.method || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="ml-2 font-medium">
                    {booking.pricing?.currency || '$'}{(booking.payment?.totalPaid || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">System Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Booking Reference:</span>
                <span className="ml-2 font-mono font-medium">{booking.bookingReference}</span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium">{booking.source || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{new Date(booking.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 font-medium">{new Date(booking.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;