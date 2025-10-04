import React from 'react';
import Button from '@/components/common/Button';

interface TripDetailsModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
  onDownloadReceipt?: () => void;
  onMakePayment?: () => void;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  trip,
  isOpen,
  onClose,
  onDownloadReceipt,
  onMakePayment
}) => {
  if (!isOpen || !trip) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'converted': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending-payment': 'bg-orange-100 text-orange-800 border-orange-200',
      'payment-received': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const currency = trip.currency || trip.pricing?.currency || 'USD';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">Trip Details</h2>
            <p className="text-primary-600">{trip.reference}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-primary-400 hover:text-primary-600">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(trip.status)}`}>
                {trip.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-900">
                {currency} {(trip.finalPrice || trip.estimatedPrice || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Trip Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="text-primary-900 font-medium">{trip.title}</p>
                  <p className="text-sm text-gray-500">📍 {trip.destination}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Travelers</label>
                  <p className="text-primary-900">{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Payment Information</h3>
              {trip.bookingDetails ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <label className="text-sm font-medium text-blue-700">Total</label>
                      <p className="text-lg font-bold text-blue-900">
                        {currency} {(trip.finalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <label className="text-sm font-medium text-green-700">Paid</label>
                      <p className="text-lg font-bold text-green-900">
                        {currency} {trip.bookingDetails.totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Payment details available after consultation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <div className="flex gap-3">
            {trip.actions?.canDownloadReceipt && onDownloadReceipt && (
              <Button variant="outline" onClick={onDownloadReceipt}>Download Receipt</Button>
            )}
            {trip.actions?.canMakePayment && onMakePayment && (
              <Button onClick={onMakePayment} className="bg-green-600 hover:bg-green-700">Make Payment</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;