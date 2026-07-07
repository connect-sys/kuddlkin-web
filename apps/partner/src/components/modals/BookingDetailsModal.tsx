import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, Mail, User, Baby, AlertCircle, Repeat, Key, CheckCircle } from 'lucide-react';
import OTPVerificationModal from './OTPVerificationModal';

interface Child {
  id?: string;
  name: string;
  age: string;
  gender: 'male' | 'female';
  medicalConditions?: string;
  bedtime?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  specialNeeds?: string;
}

interface ParentDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  alternateContactName?: string;
  alternateContactPhone?: string;
}

interface BookingDetails {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  special_requirements: string; // This is the JSON string or parsed object
  special_requests?: string; // Sometimes it might be here
  children?: Child[]; // If already parsed
  parentDetails?: ParentDetails; // If already parsed
  recurring?: boolean;
}

interface BookingDetailsModalProps {
  booking: BookingDetails;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onStartService?: (id: string, otpCode: string) => void;
  actionLoading?: boolean;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ 
  booking, 
  isOpen, 
  onClose,
  onAccept,
  onReject,
  onComplete,
  onCancel,
  onStartService,
  actionLoading = false
}) => {
  const [showOTPModal, setShowOTPModal] = useState(false);

  if (!isOpen) return null;

  // Parse special_requirements / special_requests if it's a string
  let details: any = {};
  try {
    const rawReqs = booking.special_requests || booking.special_requirements;
    if (typeof rawReqs === 'string') {
        details = JSON.parse(rawReqs);
    } else if (typeof rawReqs === 'object') {
        details = rawReqs;
    }
  } catch (e) {
    console.error("Failed to parse booking details", e);
  }

  const parent: ParentDetails = details.parentDetails || {
    fullName: booking.customer_name,
    email: '',
    phone: '',
    address: ''
  };

  const children: Child[] = details.children || [];
  const specialInstructions = details.specialInstructions || '';
  const recurring = details.recurring || false;

  // Check if booking start time is in the past
  const isBookingInPast = () => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
    const now = new Date();
    return bookingDateTime < now;
  };

  const isPastBooking = isBookingInPast();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10 flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-xs sm:text-sm text-gray-500">#{booking.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Status Banner */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold capitalize ${
              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              Status: {booking.status}
            </div>
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold capitalize ${
              booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
              booking.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              Payment: {booking.payment_status}
            </div>
            {recurring && (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold bg-purple-100 text-purple-700 flex items-center gap-1.5 sm:gap-2">
                    <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Recurring Booking
                </div>
            )}
          </div>

          {/* Service & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Service Info</h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-2 sm:space-y-3">
                    <p className="font-bold text-gray-900 text-base sm:text-lg">{booking.service_name}</p>
                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{new Date(booking.booking_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                    </div>
                    <div className="font-bold text-[#267D71] text-base sm:text-lg mt-2">
                        Total: ₹{booking.total_amount.toLocaleString()}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Parent Details</h3>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{parent.fullName}</span>
                    </div>
                    {parent.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${parent.phone}`} className="text-[#267D71] hover:underline text-sm sm:text-base">{parent.phone}</a>
                        </div>
                    )}
                    {parent.email && (
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={`mailto:${parent.email}`} className="text-[#267D71] hover:underline truncate text-sm sm:text-base">{parent.email}</a>
                        </div>
                    )}
                    {parent.address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <span className="text-gray-600 text-xs sm:text-sm">{parent.address}</span>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Alternate Contact */}
          {(parent.alternateContactName || parent.alternateContactPhone) && (
              <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Alternate Contact</h3>
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      {parent.alternateContactName && (
                          <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-orange-400 flex-shrink-0" />
                              <span className="font-medium text-gray-900 text-sm sm:text-base">{parent.alternateContactName}</span>
                          </div>
                      )}
                      {parent.alternateContactPhone && (
                          <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                              <a href={`tel:${parent.alternateContactPhone}`} className="text-gray-700 hover:text-orange-600 text-sm sm:text-base">{parent.alternateContactPhone}</a>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* Children Info */}
          {children.length > 0 && (
              <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Children ({children.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {children.map((child, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-white shadow-sm">
                              <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-[#E6F8F6] rounded-full flex items-center justify-center text-xl flex-shrink-0">
                                      {child.gender === 'female' ? '👧' : '👦'}
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-900 text-sm sm:text-base">{child.name}</p>
                                      <p className="text-xs text-gray-500">{child.age} • <span className="capitalize">{child.gender}</span></p>
                                  </div>
                              </div>
                              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                  {child.medicalConditions && (
                                      <div className="flex gap-2">
                                          <span className="text-gray-500 font-medium">Medical:</span>
                                          <span className="text-gray-900">{child.medicalConditions}</span>
                                      </div>
                                  )}
                                  {child.allergies && (
                                      <div className="flex gap-2">
                                          <span className="text-red-500 font-medium">Allergies:</span>
                                          <span className="text-gray-900">{child.allergies}</span>
                                      </div>
                                  )}
                                  {child.dietaryRestrictions && (
                                      <div className="flex gap-2">
                                          <span className="text-orange-500 font-medium">Dietary:</span>
                                          <span className="text-gray-900">{child.dietaryRestrictions}</span>
                                      </div>
                                  )}
                                  {child.bedtime && (
                                      <div className="flex gap-2">
                                          <span className="text-indigo-500 font-medium">Bedtime:</span>
                                          <span className="text-gray-900">{child.bedtime}</span>
                                      </div>
                                  )}
                                  {child.specialNeeds && (
                                      <div className="flex gap-2">
                                          <span className="text-purple-500 font-medium">Special Needs:</span>
                                          <span className="text-gray-900">{child.specialNeeds}</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Special Instructions */}
          {specialInstructions && (
              <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Special Instructions</h3>
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-100 flex gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{specialInstructions}</p>
                  </div>
              </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 flex-shrink-0 pb-safe">
            <button 
                onClick={onClose}
                disabled={actionLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base"
            >
                Close
            </button>
            {booking.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => onReject(booking.id)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 font-bold hover:bg-red-100 disabled:opacity-50 text-sm sm:text-base"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => onAccept(booking.id)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#267D71] text-white rounded-lg font-bold hover:bg-[#1e635c] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        {actionLoading ? 'Processing...' : 'Accept Booking'}
                    </button>
                </div>
            )}
            {booking.status === 'confirmed' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {onCancel && (
                        <button 
                            onClick={() => onCancel(booking.id)}
                            disabled={actionLoading || isPastBooking}
                            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                                isPastBooking 
                                    ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                            } disabled:opacity-50`}
                            title={isPastBooking ? 'Cannot cancel past bookings' : 'Cancel this booking'}
                        >
                            Cancel Booking
                        </button>
                    )}
                    <button 
                        onClick={() => setShowOTPModal(true)}
                        disabled={actionLoading || isPastBooking}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${
                            isPastBooking 
                                ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#267D71] text-white hover:bg-[#1e635c]'
                        } disabled:opacity-50`}
                        title={isPastBooking ? 'Cannot start past bookings' : 'Start this service'}
                    >
                        <Key className="w-4 h-4" />
                        {isPastBooking ? 'Past Booking' : 'Start Service'}
                    </button>
                </div>
            )}
            {booking.status === 'in_progress' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="px-4 py-2 sm:py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto">
                        <Clock className="w-4 h-4" />
                        Service in Progress
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        Waiting for customer to mark as completed
                    </p>
                </div>
            )}
            {booking.status === 'completed' && (
                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Service Completed
                </div>
            )}
        </div>

        {/* OTP Verification Modal */}
        {onStartService && (
            <OTPVerificationModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                booking={booking}
                onStartService={async (bookingId: string, otpCode: string) => {
                    await onStartService(bookingId, otpCode);
                    setShowOTPModal(false);
                }}
                loading={actionLoading}
            />
        )}
      </div>
    </div>
  );
};

export default BookingDetailsModal;
