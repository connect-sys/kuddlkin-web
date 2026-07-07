import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BookingDetailsModal from '../components/modals/BookingDetailsModal';

interface Booking {
  id: string;
  customer_name: string;
  service_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  customer_phone?: string;
  customer_email?: string;
  special_requests?: string;
  special_requirements?: string;
  children?: any[];
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Try primary bookings endpoint first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/provider/bookings?providerId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Bookings API Response:', data);
          
          if (data.success && (data.data?.bookings || data.bookings)) {
            setBookings(data.data?.bookings || data.bookings || []);
            return;
          }
        }
        
        throw new Error(`Primary API failed: ${response.status} ${response.statusText}`);
      } catch (primaryError) {
        console.warn('Primary bookings API failed, trying dashboard API:', primaryError);
        
        // Fallback to dashboard API which we know works
        const dashboardResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/partner/stats?providerId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          console.log('Dashboard API Response:', dashboardData);
          
          if (dashboardData.success && dashboardData.data?.recentBookings) {
            // Transform dashboard bookings to match expected format
            const transformedBookings = dashboardData.data.recentBookings.map((booking: any) => ({
              id: booking.id,
              customer_name: booking.customer_name || 'Unknown Customer',
              service_name: booking.service_name || 'Service',
              booking_date: booking.booking_date,
              start_time: booking.start_time || '09:00',
              end_time: booking.end_time || '11:00',
              total_amount: booking.total_amount || 0,
              status: booking.status || 'pending',
              payment_status: booking.payment_status || 'pending',
              created_at: booking.created_at,
              customer_phone: booking.customer_phone || '',
              customer_email: booking.customer_email || '',
              special_requests: booking.special_requests || '',
              special_requirements: booking.special_requirements || '',
              children: booking.children || []
            }));
            
            setBookings(transformedBookings);
            console.log('✅ Using dashboard API as fallback - loaded bookings successfully');
            return;
          }
        }
        
        throw new Error('Both primary and fallback APIs failed');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
      setSelectedBooking(booking);
      setIsModalOpen(true);
  };

  const handleAcceptBooking = async (bookingId: string) => {
      try {
          setActionLoading(true);
          const token = localStorage.getItem('token'); // Assuming token is stored here
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/accept`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          const data = await response.json();
          if (data.success) {
              // Update local state
              setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
              if (selectedBooking?.id === bookingId) {
                  setSelectedBooking(prev => prev ? { ...prev, status: 'confirmed' } : null);
              }
              setIsModalOpen(false);
          } else {
              console.error('Failed to accept booking:', data.message);
              alert(data.message || 'Failed to accept booking');
          }
      } catch (error) {
          console.error('Error accepting booking:', error);
          alert('An error occurred while accepting the booking');
      } finally {
          setActionLoading(false);
      }
  };

  const handleRejectBooking = async (bookingId: string) => {
      if (!confirm('Are you sure you want to reject this booking?')) return;
      
      try {
          setActionLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/reject`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: 'Rejected by provider' })
          });
          const data = await response.json();
          if (data.success) {
               // Update local state
               setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
               if (selectedBooking?.id === bookingId) {
                   setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
               }
               setIsModalOpen(false);
          } else {
              console.error('Failed to reject booking:', data.message);
              alert(data.message || 'Failed to reject booking');
          }
      } catch (error) {
          console.error('Error rejecting booking:', error);
          alert('An error occurred while rejecting the booking');
      } finally {
          setActionLoading(false);
      }
  };

  const handleCancelBooking = async (bookingId: string) => {
      // Check if booking is in the past
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
          const now = new Date();
          if (bookingDateTime < now) {
              alert('Cannot cancel past bookings');
              return;
          }
      }

      const reason = prompt('Please enter a reason for cancellation:');
      if (!reason) return;

      try {
          setActionLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason })
          });
          const data = await response.json();
          if (data.success) {
               setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
               if (selectedBooking?.id === bookingId) {
                   setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
               }
               setIsModalOpen(false);
          } else {
              console.error('Failed to cancel booking:', data.message);
              alert(data.message || 'Failed to cancel booking');
          }
      } catch (error) {
          console.error('Error cancelling booking:', error);
          alert('An error occurred while cancelling the booking');
      } finally {
          setActionLoading(false);
      }
  };

  const handleCompleteBooking = async (bookingId: string) => {
      if (!confirm('Are you sure you want to mark this booking as completed?')) return;

      try {
          setActionLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/complete`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
          const data = await response.json();
          if (data.success) {
               setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
               if (selectedBooking?.id === bookingId) {
                   setSelectedBooking(prev => prev ? { ...prev, status: 'completed' } : null);
               }
               setIsModalOpen(false);
          } else {
              console.error('Failed to complete booking:', data.message);
              alert(data.message || 'Failed to complete booking');
          }
      } catch (error) {
          console.error('Error completing booking:', error);
          alert('An error occurred while completing the booking');
      } finally {
          setActionLoading(false);
      }
  };

  const handleStartService = async (bookingId: string, otpCode: string) => {
      // Check if booking is in the past
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
          const now = new Date();
          if (bookingDateTime < now) {
              throw new Error('Cannot start past bookings');
          }
      }

      try {
          setActionLoading(true);
          const token = localStorage.getItem('token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/otp/booking/verify-start`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  bookingId, 
                  providerId: user?.id, 
                  otpCode 
              })
          });
          const data = await response.json();
          if (data.success) {
               // Update booking status to in_progress
               setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'in_progress' } : b));
               if (selectedBooking?.id === bookingId) {
                   setSelectedBooking(prev => prev ? { ...prev, status: 'in_progress' } : null);
               }
               alert('Service started successfully! The customer will be notified.');
          } else {
              throw new Error(data.message || 'Failed to start service');
          }
      } catch (error: any) {
          console.error('Error starting service:', error);
          throw error; // Re-throw to be handled by the modal
      } finally {
          setActionLoading(false);
      }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'confirmed':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    
    // Map tab names to status values
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'in progress': 'in_progress',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    
    const targetStatus = statusMap[activeTab.toLowerCase()];
    return matchesSearch && booking.status === targetStatus;
  });

  const tabs = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-0 min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 pt-6 sm:px-0 sm:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage your service bookings and appointments</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl sm:rounded-lg border border-gray-100 sm:border-gray-200 p-4 sm:p-6 shadow-sm sm:shadow-none mx-4 sm:mx-0">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 sm:border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent bg-gray-50 focus:bg-white transition-colors text-sm"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-[#578f82] text-white shadow-sm'
                    : 'bg-gray-50 sm:bg-gray-100 text-gray-600 hover:bg-gray-100 sm:hover:bg-gray-200 border border-gray-200 sm:border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="px-4 sm:px-0">
        <div className="bg-transparent sm:bg-white rounded-2xl sm:rounded-lg sm:border sm:border-gray-200">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl sm:rounded-none border border-dashed border-gray-200 sm:border-0 shadow-sm sm:shadow-none">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchTerm ? 'Try adjusting your search criteria' : 'Your bookings will appear here once customers start booking your services'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer & Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.service_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.start_time} - {booking.end_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{booking.total_amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                            <span className="capitalize">{booking.payment_status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                                onClick={() => handleViewDetails(booking)}
                                className="text-[#578f82] hover:text-[#4a7c70] p-1 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View (Cards) */}
              <div className="grid grid-cols-1 gap-4 sm:hidden">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col space-y-4 relative overflow-hidden">
                    {/* Status indicator bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      booking.status === 'completed' ? 'bg-green-500' :
                      booking.status === 'in_progress' ? 'bg-purple-500' :
                      booking.status === 'confirmed' ? 'bg-blue-500' :
                      booking.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex-1 pr-3">
                        <h3 className="font-semibold text-gray-900 text-base">{booking.customer_name}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{booking.service_name}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${getStatusColor(booking.status)} whitespace-nowrap`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50 pl-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Date
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> Time
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.start_time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pl-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                        <p className="text-base font-bold text-gray-900">₹{booking.total_amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold ${getPaymentStatusColor(booking.payment_status)}`}>
                          <span className="capitalize">{booking.payment_status}</span>
                        </span>
                        <button 
                          onClick={() => handleViewDetails(booking)}
                          className="flex items-center px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#578f82] text-xs font-semibold rounded-lg transition-colors border border-gray-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            booking={selectedBooking as any}
            onAccept={handleAcceptBooking}
            onReject={handleRejectBooking}
            onComplete={handleCompleteBooking}
            onCancel={handleCancelBooking}
            onStartService={handleStartService}
            actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Bookings;
