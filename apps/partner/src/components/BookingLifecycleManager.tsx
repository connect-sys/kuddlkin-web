import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, MapPin, Phone, User, 
  AlertTriangle, Timer, Navigation, IndianRupee, Star 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingLifecycleManagerProps {
  partnerId: string;
}

interface BookingRequest {
  id: string;
  bookingId: string;
  parentName: string;
  parentPhone: string;
  childrenCount: number;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  otpCode?: string;
  timeRemaining?: number;
  createdAt: string;
}

const BookingLifecycleManager: React.FC<BookingLifecycleManagerProps> = ({ partnerId }) => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [partnerId]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/partner/bookings?providerId=${partnerId}`
      );
      const data = await response.json();
      
      if (data.success) {
        // Filter and sort bookings for lifecycle management
        const lifecycleBookings = data.events
          .filter((booking: any) => 
            ['pending', 'accepted', 'in_progress'].includes(booking.extendedProps?.status)
          )
          .map((booking: any) => ({
            id: booking.id,
            bookingId: booking.id,
            parentName: booking.extendedProps?.customerName || 'Unknown',
            parentPhone: booking.extendedProps?.customerPhone || '',
            childrenCount: 1, // This should come from booking data
            date: booking.start.split('T')[0],
            startTime: new Date(booking.start).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            endTime: new Date(booking.end).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            address: 'Address from booking', // This should come from booking data
            amount: booking.extendedProps?.totalAmount || 0,
            status: booking.extendedProps?.status || 'pending',
            createdAt: booking.extendedProps?.createdAt || new Date().toISOString()
          }));
        
        setBookings(lifecycleBookings);
      }
    } catch (error) {
      console.error('Fetch bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToBooking = async (bookingId: string, response: 'accept' | 'decline', reason?: string) => {
    setResponding(bookingId);
    try {
      const apiResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          providerId: partnerId,
          response,
          reason
        })
      });

      const data = await apiResponse.json();
      
      if (data.success) {
        toast.success(`Booking ${response}ed successfully!`);
        fetchBookings(); // Refresh the list
      } else {
        toast.error(data.message || `Failed to ${response} booking`);
      }
    } catch (error) {
      console.error(`${response} booking error:`, error);
      toast.error(`Failed to ${response} booking`);
    } finally {
      setResponding(null);
    }
  };

  const checkInToBooking = async (bookingId: string) => {
    setCheckingIn(bookingId);
    
    // Get current location
    if (!location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            await performCheckIn(bookingId, latitude, longitude);
          },
          (error) => {
            console.error('Location error:', error);
            toast.error('Unable to get location. Please enable location services.');
            setCheckingIn(null);
          }
        );
      } else {
        toast.error('Geolocation is not supported by this browser');
        setCheckingIn(null);
      }
    } else {
      await performCheckIn(bookingId, location.latitude, location.longitude);
    }
  };

  const performCheckIn = async (bookingId: string, latitude: number, longitude: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          providerId: partnerId,
          latitude,
          longitude,
          notes: 'Partner checked in via mobile app'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Successfully checked in!');
        fetchBookings(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check in error:', error);
      toast.error('Failed to check in');
    } finally {
      setCheckingIn(null);
    }
  };

  const completeBooking = async (bookingId: string, otpCode: string, codAmount?: number) => {
    if (!otpCode || otpCode.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setCompleting(bookingId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          providerId: partnerId,
          otpCode,
          codAmountReceived: codAmount,
          notes: 'Service completed successfully'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Booking completed successfully!');
        fetchBookings(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Complete booking error:', error);
      toast.error('Failed to complete booking');
    } finally {
      setCompleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const remainingMs = (15 * 60 * 1000) - diffMs; // 15 minutes in ms
    
    if (remainingMs <= 0) return 0;
    return Math.floor(remainingMs / 1000 / 60); // Return minutes
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#267D71]/30 border-t-[#267D71] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#24335A] mb-2">Booking Management</h2>
        <p className="text-gray-600">Manage your active bookings and respond to requests</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-500 mb-2">No Active Bookings</h3>
          <p className="text-gray-400">You're all caught up! New booking requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onRespond={respondToBooking}
              onCheckIn={checkInToBooking}
              onComplete={completeBooking}
              responding={responding}
              checkingIn={checkingIn}
              completing={completing}
              getStatusColor={getStatusColor}
              getTimeRemaining={getTimeRemaining}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BookingCardProps {
  booking: BookingRequest;
  onRespond: (bookingId: string, response: 'accept' | 'decline', reason?: string) => void;
  onCheckIn: (bookingId: string) => void;
  onComplete: (bookingId: string, otpCode: string, codAmount?: number) => void;
  responding: string | null;
  checkingIn: string | null;
  completing: string | null;
  getStatusColor: (status: string) => string;
  getTimeRemaining: (createdAt: string) => number;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onRespond,
  onCheckIn,
  onComplete,
  responding,
  checkingIn,
  completing,
  getStatusColor,
  getTimeRemaining
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [codAmount, setCodAmount] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  const timeRemaining = booking.status === 'pending' ? getTimeRemaining(booking.createdAt) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
          {booking.status === 'pending' && timeRemaining > 0 && (
            <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              <Timer className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{timeRemaining}m left</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#267D71]">₹{booking.amount}</div>
          <div className="text-sm text-gray-500">{booking.date}</div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <span className="font-medium">{booking.parentName}</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-600">{booking.parentPhone}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-600 text-sm">{booking.address}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-2" />
            <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-gray-600">{booking.childrenCount} children</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Based on Status */}
      <div className="border-t pt-4">
        {booking.status === 'pending' && (
          <div className="space-y-3">
            {timeRemaining > 0 ? (
              <>
                <div className="flex space-x-3">
                  <button
                    onClick={() => onRespond(booking.bookingId, 'accept')}
                    disabled={responding === booking.bookingId}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {responding === booking.bookingId ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Accept Booking
                  </button>
                  <button
                    onClick={() => setShowDeclineForm(!showDeclineForm)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </button>
                </div>
                
                {showDeclineForm && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Please provide a reason for declining (optional)"
                      className="w-full px-3 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onRespond(booking.bookingId, 'decline', declineReason)}
                        disabled={responding === booking.bookingId}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm Decline
                      </button>
                      <button
                        onClick={() => setShowDeclineForm(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">Response time expired</p>
                <p className="text-red-600 text-sm">This booking will be auto-cancelled</p>
              </div>
            )}
          </div>
        )}

        {booking.status === 'accepted' && (
          <button
            onClick={() => onCheckIn(booking.bookingId)}
            disabled={checkingIn === booking.bookingId}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {checkingIn === booking.bookingId ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Check In (I've Arrived)
          </button>
        )}

        {booking.status === 'in_progress' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Complete Service</h4>
              <p className="text-blue-700 text-sm mb-3">
                Enter the 4-digit OTP provided by the parent to complete this booking
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Parent's OTP *
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    COD Amount (if applicable)
                  </label>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onComplete(booking.bookingId, otpInput, parseFloat(codAmount) || undefined)}
              disabled={completing === booking.bookingId || otpInput.length !== 4}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {completing === booking.bookingId ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              Complete Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingLifecycleManager;
