import React, { useState } from 'react';
import Button from '@/components/common/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, method: string) => void;
  booking: any;
  remainingAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  booking,
  remainingAmount
}) => {
  const [amount, setAmount] = useState(remainingAmount.toString());
  const [method, setMethod] = useState('bank-transfer');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
      alert('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(paymentAmount, method);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Record Payment</h3>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Booking Details</div>
            <div className="font-medium text-gray-900">{booking?.bookingReference}</div>
            <div className="text-sm text-gray-600">{booking?.customer?.firstName} {booking?.customer?.lastName}</div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Remaining Amount: </span>
              {booking?.pricing?.currency || 'USD'} {remainingAmount.toLocaleString()}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {booking?.pricing?.currency || 'USD'}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="credit-card">Credit Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;