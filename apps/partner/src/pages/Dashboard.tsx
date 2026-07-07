import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  User
} from 'lucide-react';
import PasswordResetModal from '../components/auth/PasswordResetModal';
import CompleteProfileModal from '../components/modals/CompleteProfileModal';
import RefreshStatusButton from '../components/RefreshStatusButton';
import PartnerBookingCalendar from '../components/calendar/PartnerBookingCalendar';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { isFirstLogin, clearFirstLogin, user } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // Consistent role checks with DynamicSidebar
  const isAdmin = user?.email === 'tech@tendernest.world' || user?.email === 'admin@kuddl.co' || user?.role === 'admin';
  const isServiceWorker = user?.role === 'service_worker';
  
  // Debug logging
  useEffect(() => {
    console.log('Dashboard - User object:', user);
    console.log('Dashboard - User email:', user?.email);
    console.log('Dashboard - User role:', user?.role);
    console.log('Dashboard - isAdmin:', isAdmin);
  }, [user, isAdmin]);

  const [analyticsData, setAnalyticsData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    completionRate: 0,
    monthlyBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthOverMonth: {
      bookingsChange: 0,
      revenueChange: 0,
      ratingChange: 0,
      completionRateChange: 0,
      bookingsDirection: 'up' as 'up' | 'down',
      revenueDirection: 'up' as 'up' | 'down',
      ratingDirection: 'up' as 'up' | 'down',
      completionRateDirection: 'up' as 'up' | 'down'
    }
  });

  const [adminData, setAdminData] = useState({
    totalPartners: 0,
    totalBookings: 0,
    totalRevenue: 0,
    completionRate: 0,
    recentActivities: []
  });

  useEffect(() => {
    // Check profile completion status first
    checkProfileCompletion();
    // Fetch dashboard data
    fetchDashboardData();
  }, [isFirstLogin, user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return;

      if (isAdmin) {
        // Fetch admin dashboard data
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const completionRate = data.data.totalBookings > 0 
              ? Math.round((data.data.completedBookings / data.data.totalBookings) * 100)
              : 0;
            
            setAdminData({
              totalPartners: data.data.totalPartners || 0,
              totalBookings: data.data.totalBookings || 0,
              totalRevenue: data.data.totalRevenue || 0,
              completionRate: completionRate,
              recentActivities: data.data.recentActivities || []
            });
          }
        }
      } else {
        // Fetch partner dashboard data with cache-busting
        console.log('Fetching dashboard data for user ID:', user.id);
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/partner/stats?providerId=${user.id}&t=${Date.now()}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard API Response:', data);
          if (data.success && data.data) {
            console.log('Setting analytics data:', {
              totalBookings: data.data.totalBookings || 0,
              totalRevenue: data.data.totalRevenue || 0,
              averageRating: data.data.averageRating !== undefined ? data.data.averageRating : 0,
              completionRate: data.data.completionRate || 0,
              monthlyBookings: data.data.monthlyBookings || 0,
              pendingBookings: data.data.pendingBookings || 0,
              completedBookings: data.data.completedBookings || 0,
              recentBookings: data.data.recentBookings || []
            });
            setAnalyticsData({
              totalBookings: data.data.totalBookings || 0,
              totalRevenue: data.data.totalRevenue || 0,
              averageRating: data.data.averageRating !== undefined ? data.data.averageRating : 0,
              completionRate: data.data.completionRate || 0,
              monthlyBookings: data.data.monthlyBookings || 0,
              pendingBookings: data.data.pendingBookings || 0,
              completedBookings: data.data.completedBookings || 0,
              recentBookings: data.data.recentBookings || [],
              monthOverMonth: data.data.monthOverMonth || {
                bookingsChange: 0,
                revenueChange: 0,
                ratingChange: 0,
                completionRateChange: 0,
                bookingsDirection: 'up' as 'up' | 'down',
                revenueDirection: 'up' as 'up' | 'down',
                ratingDirection: 'up' as 'up' | 'down',
                completionRateDirection: 'up' as 'up' | 'down'
              }
            });
          }
        } else {
          console.error('Dashboard API failed:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkProfileCompletion = async () => {
    if (user) {
      // Admin and service workers don't need to complete profile
      if (user.role === 'admin' || user.role === 'service_worker') {
        setProfileComplete(true);
        setShowCompleteProfileModal(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
          console.log('No token found');
          setShowCompleteProfileModal(false);
          setLoading(false);
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/api/partner/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile completion check:', data);
          
          if (data.success && data.data) {
            const kycStatus = data.data.kyc_status;
            const profileData = data.data;
            console.log('KYC Status:', kycStatus);
            console.log('Profile Data:', profileData);
            
            // Check if profile has essential fields completed based on new requirements
            // Basic Info: name, email, phone, DOB, gender, address details
            // Services: categories, age groups, experience, description, languages
            // Documents & Banking: Aadhaar verification + bank details required
            const hasEssentialFields = profileData.first_name && 
                                     profileData.last_name &&
                                     profileData.email && 
                                     profileData.phone &&
                                     profileData.date_of_birth &&
                                     profileData.gender &&
                                     profileData.pincode &&
                                     profileData.address &&
                                     profileData.city &&
                                     profileData.state &&
                                     profileData.area &&
                                     profileData.service_categories && 
                                     profileData.age_groups &&
                                     profileData.experience_years &&
                                     profileData.description &&
                                     profileData.languages &&
                                     profileData.account_holder_name &&
                                     profileData.account_number &&
                                     profileData.ifsc_code &&
                                     profileData.bank_name;
            
            // Check if partner is verified
            const verified = kycStatus === 'approved' || kycStatus === 'verified';
            setIsVerified(verified);
            
            // Profile is complete if it has essential fields, regardless of verification status
            setProfileComplete(hasEssentialFields);
            console.log('Profile Complete:', hasEssentialFields);
            console.log('Is Verified:', verified);
            
            // Never auto-open modal - only set profile status
            setShowCompleteProfileModal(false);
          } else {
            console.log('Profile not found');
            setShowCompleteProfileModal(false);
          }
        } else {
          console.log('Profile API error');
          setShowCompleteProfileModal(false);
        }
      } catch (error) {
        console.error('Profile check error:', error);
        setShowCompleteProfileModal(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePasswordReset = () => {
    setShowPasswordModal(false);
    clearFirstLogin();
  };

  const handleProfileComplete = async () => {
    setShowCompleteProfileModal(false);
    setProfileComplete(true);
    // Explicitly prevent password reset modal after profile completion
    setShowPasswordModal(false);
    clearFirstLogin();
    
    // Refetch profile to get updated kyc_status from database
    await checkProfileCompletion();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-0">
      {/* Modals */}
      <PasswordResetModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordReset}
      />
      
      <CompleteProfileModal 
        isOpen={showCompleteProfileModal} 
        onClose={handleProfileComplete}
        onSubmit={handleProfileComplete}
        canClose={true}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 px-5 pt-6 sm:px-0 sm:pt-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' :
             isServiceWorker ? `${user?.full_name || user?.name || 'Staff'} Dashboard` :
             user?.first_name ? `${user.first_name} ${user.last_name || ''} Dashboard` : 'Partner Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage your platform and monitor performance' :
             isServiceWorker ? 'View your assigned bookings and tasks' :
             'Track your business performance and insights'}
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {!isAdmin && !isServiceWorker && !profileComplete && !isVerified && (
            <button
              onClick={() => setShowCompleteProfileModal(true)}
              className="bg-[#578f82] text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-[#4a7c70] transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <User className="w-4 h-4" />
              <span>Complete Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
        {isAdmin ? (
          // Admin Metrics
          <>
            <div className="bg-white rounded-2xl sm:rounded-lg p-5 sm:p-6 border border-gray-100 sm:border-gray-200 shadow-sm sm:shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Partners</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.totalPartners}</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{adminData.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </>
        ) : (
          // Partner Metrics
          <>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {analyticsData.monthOverMonth?.bookingsDirection === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={analyticsData.monthOverMonth?.bookingsDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(analyticsData.monthOverMonth?.bookingsChange || 0)}%
                </span>
                <span className="ml-1 text-gray-500">from last month</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {analyticsData.monthOverMonth?.revenueDirection === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={analyticsData.monthOverMonth?.revenueDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(analyticsData.monthOverMonth?.revenueChange || 0)}%
                </span>
                <span className="ml-1 text-gray-500">from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.averageRating === 0 ? '0.0' : analyticsData.averageRating.toFixed(1)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {analyticsData.monthOverMonth?.ratingDirection === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={analyticsData.monthOverMonth?.ratingDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(analyticsData.monthOverMonth?.ratingChange || 0)}%
                </span>
                <span className="ml-1 text-gray-500">from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-[#578f82] rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {analyticsData.monthOverMonth?.completionRateDirection === 'up' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={analyticsData.monthOverMonth?.completionRateDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(analyticsData.monthOverMonth?.completionRateChange || 0)}%
                </span>
                <span className="ml-1 text-gray-500">from last month</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/services"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-kuddl-orange transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">All Services</p>
                <p className="text-sm text-gray-600">Review & approve</p>
              </div>
            </a>
            
            <a
              href="/providers"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-kuddl-orange transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">All Partners</p>
                <p className="text-sm text-gray-600">Manage providers</p>
              </div>
            </a>
            
            <a
              href="/bookings"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-kuddl-orange transition-all"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">All Bookings</p>
                <p className="text-sm text-gray-600">Monitor bookings</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <p className="text-sm text-gray-600">Your latest booking requests and updates</p>
        </div>
        <div className="space-y-4">
          {analyticsData.recentBookings && analyticsData.recentBookings.length > 0 ? (
            <>
              {analyticsData.recentBookings.slice(0, 3).map((booking: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium">{booking.service_name}</div>
                    <div className="text-sm text-gray-500">
                      {booking.customer_name} • {booking.booking_date} at {booking.start_time}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium">₹{booking.total_amount}</span>
                  </div>
                </div>
              ))}
              {analyticsData.recentBookings.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/bookings')}
                    className="text-[#578f82] hover:text-[#4a7a6e] font-medium text-sm transition-colors duration-200"
                  >
                    View All Bookings →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent bookings found</p>
              <p className="text-sm">Your bookings will appear here once customers start booking your services</p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section - Only show for partners */}
      {!isAdmin && (
        <div className="px-4 sm:px-0 mt-6 sm:mt-8">
          <div className="bg-white rounded-2xl sm:rounded-lg p-5 sm:p-6 border border-gray-100 sm:border-gray-200 shadow-sm sm:shadow-none">
            <div className="mb-5 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Calendar</h3>
              <p className="text-sm text-gray-600">View your bookings and availability at a glance</p>
            </div>
            <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 pb-2">
              <PartnerBookingCalendar 
                view="month"
                height={500}
                showHeader={true}
                selectable={false}
                onEventClick={(clickInfo) => {
                  // The calendar component now handles this with its own modal
                  // No need for alert here as the PartnerBookingCalendar has its own modal
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
