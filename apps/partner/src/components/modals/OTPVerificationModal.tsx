import React, { useState } from 'react';
import { X, Key, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    customer_name: string;
    service_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
  };
  onStartService: (bookingId: string, otpCode: string) => Promise<void>;
  loading?: boolean;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStartService,
  loading = false
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      await onStartService(booking.id, otpCode);
      setOtpCode('');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#267D71] rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Start Service</h2>
              <p className="text-sm text-gray-500">Enter OTP to begin</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Booking Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{booking.service_name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Customer:</strong> {booking.customer_name}</p>
              <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How to get OTP:</h4>
                <p className="text-sm text-blue-800">
                  Ask the parent/customer for the 6-digit OTP they received when the booking was confirmed. 
                  This ensures you're at the right location with the right customer.
                </p>
              </div>
            </div>
          </div>

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={handleOtpChange}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-[#267D71] focus:border-transparent"
                maxLength={6}
                disabled={isVerifying || loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying || loading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={otpCode.length !== 6 || isVerifying || loading}
                className="flex-1 px-4 py-3 bg-[#267D71] text-white rounded-xl font-medium hover:bg-[#1e635c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Start Service
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              <Clock className="w-3 h-3 inline mr-1" />
              OTP is valid for 24 hours from booking confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
