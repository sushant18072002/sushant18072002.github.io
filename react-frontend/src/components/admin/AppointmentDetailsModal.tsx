import React from 'react';
import Button from '@/components/common/Button';

interface AppointmentDetailsModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (appointmentId: string, status: string) => void;
  onConvertToBooking: (appointmentId: string, estimatedPrice: number) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onStatusUpdate,
  onConvertToBooking
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'confirmed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'converted': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-primary-900">Appointment Details</h2>
            <p className="text-primary-600">{appointment.appointmentReference}</p>
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
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                {appointment.status.toUpperCase()}
              </span>
              <div className="text-sm text-gray-600">
                Created: {new Date(appointment.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-2">
              {appointment.status === 'scheduled' && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(appointment._id, 'completed')}
                >
                  Mark Complete
                </Button>
              )}
              {appointment.status === 'completed' && (
                <Button
                  size="sm"
                  onClick={() => onConvertToBooking(appointment._id, appointment.pricing?.estimatedTotal || 999)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Convert to Booking
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-primary-900">{appointment.customer?.firstName} {appointment.customer?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-primary-900">{appointment.customer?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-primary-900">{appointment.customer?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Travelers</label>
                  <p className="text-primary-900">{appointment.customer?.travelers || 1} traveler(s)</p>
                </div>
              </div>
            </div>

            {/* Trip Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Trip Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Trip Title</label>
                  <p className="text-primary-900">{appointment.trip?.title || 'Trip Consultation'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="text-primary-900">{appointment.trip?.destination || 'Destination TBD'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-primary-900">
                    {appointment.trip?.duration?.days || 0} days, {appointment.trip?.duration?.nights || 0} nights
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estimated Price</label>
                  <p className="text-primary-900">
                    {appointment.trip?.currency || 'USD'} {(appointment.pricing?.estimatedTotal || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Schedule Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="text-sm font-medium text-blue-700">Preferred Date</label>
                <p className="text-lg font-bold text-blue-900">
                  {appointment.schedule?.preferredDate ? new Date(appointment.schedule.preferredDate).toLocaleDateString() : 'TBD'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="text-sm font-medium text-green-700">Time Slot</label>
                <p className="text-lg font-bold text-green-900">
                  {appointment.schedule?.timeSlot || 'TBD'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <label className="text-sm font-medium text-purple-700">Status</label>
                <p className="text-lg font-bold text-purple-900">
                  {appointment.schedule?.displayDateTime || 'Not Scheduled'}
                </p>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {appointment.specialRequests && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Special Requests</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{appointment.specialRequests}</p>
              </div>
            </div>
          )}

          {/* Consultation Details */}
          {appointment.consultation && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">Consultation Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Customer Interest:</span>
                  <span className="ml-2 font-medium">{appointment.consultation.customerInterest || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Follow-up Required:</span>
                  <span className="ml-2 font-medium">{appointment.consultation.followUpRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-900 border-b pb-2">System Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Appointment Reference:</span>
                <span className="ml-2 font-mono font-medium">{appointment.appointmentReference}</span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium">{appointment.source || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{new Date(appointment.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 font-medium">{new Date(appointment.updatedAt).toLocaleString()}</span>
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

export default AppointmentDetailsModal;