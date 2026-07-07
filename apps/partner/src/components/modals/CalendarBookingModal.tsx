import React from 'react';
import { X, Calendar, Clock, User, Phone, IndianRupee, Tag, MapPin } from 'lucide-react';

interface BookingDetails {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    status: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    serviceType: string;
    occupancy: number;
    maxCapacity: number;
    totalAmount?: number;
    createdAt?: string;
  };
}

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
}

const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOccupancyColor = (occupancy: number, maxCapacity: number) => {
    const rate = occupancy / maxCapacity;
    if (rate >= 1) return 'text-red-600';
    if (rate >= 0.8) return 'text-orange-600';
    if (rate >= 0.5) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Tag className="w-5 h-5 text-[#578f82]" />
              <div>
                <p className="font-medium text-gray-900">{booking.extendedProps.serviceType}</p>
                <p className="text-sm text-gray-500">Service Type</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#578f82]" />
              <div>
                <p className="font-medium text-gray-900">{formatDate(booking.start)}</p>
                <p className="text-sm text-gray-500">Date</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-[#578f82]" />
              <div>
                <p className="font-medium text-gray-900">
                  {formatTime(booking.start)} - {formatTime(booking.end)}
                </p>
                <p className="text-sm text-gray-500">Time</p>
              </div>
            </div>
          </div>

          {/* Status and Occupancy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.extendedProps.status)}`}>
                {booking.extendedProps.status.charAt(0).toUpperCase() + booking.extendedProps.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Occupancy</p>
              <p className={`font-semibold ${getOccupancyColor(booking.extendedProps.occupancy, booking.extendedProps.maxCapacity)}`}>
                {booking.extendedProps.occupancy}/{booking.extendedProps.maxCapacity}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          {booking.extendedProps.customerName && (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900">Customer Information</h4>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-[#578f82]" />
                <div>
                  <p className="font-medium text-gray-900">{booking.extendedProps.customerName}</p>
                  <p className="text-sm text-gray-500">Customer Name</p>
                </div>
              </div>

              {booking.extendedProps.customerPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#578f82]" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.extendedProps.customerPhone}</p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          {booking.extendedProps.totalAmount && (
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <IndianRupee className="w-5 h-5 text-[#578f82]" />
              <div>
                <p className="font-medium text-gray-900">₹{booking.extendedProps.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
            </div>
          )}

          {/* Booking ID */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">Booking ID: {booking.id}</p>
            {booking.extendedProps.createdAt && (
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(booking.extendedProps.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-[#578f82] text-white py-2 px-4 rounded-lg hover:bg-[#4a7c70] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarBookingModal;
