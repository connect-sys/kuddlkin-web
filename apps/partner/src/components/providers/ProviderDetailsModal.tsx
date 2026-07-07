import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Mail, Phone, MapPin, Calendar, Users, Star, IndianRupee, AlertTriangle, Clock } from 'lucide-react';
import { getDisplayImageUrl } from '../../utils/r2Utils';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  services: string[];
  status: 'Active' | 'Pending' | 'Under Review' | 'Rejected' | 'Suspended' | 'approved' | 'pending';
  rating: number;
  totalBookings: number;
  revenue: number;
  joinedDate: string;
  city?: string;
  state?: string;
  profile_image_url?: string;
  profileCompletionPercentage?: number;
  profileComplete?: boolean;
  kyc_status?: string;
  created_at?: string;
  // Additional detailed fields
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  area?: string;
  pincode?: string;
  experience_years?: number;
  languages?: string;
  description?: string;
  service_categories?: string;
  specific_services?: string;
  age_groups?: string;
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  document_urls?: string;
  average_rating?: number;
}

interface ProviderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider | null;
  onProviderUpdate?: (updatedProvider: Provider) => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({
  isOpen,
  onClose,
  provider,
  onProviderUpdate
}) => {
  const { user, refreshUser } = useAuth();
  const [detailedProvider, setDetailedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Reset state when modal closes or provider changes
  useEffect(() => {
    if (!isOpen) {
      // Clear state when modal closes
      setDetailedProvider(null);
      setDocuments([]);
      setIsApproving(false);
    }
  }, [isOpen]);

  // Fetch detailed provider data and documents when modal opens or provider changes
  useEffect(() => {
    if (isOpen && provider?.id) {
      // Reset detailed provider immediately when switching providers
      setDetailedProvider(null);
      setDocuments([]);
      // Fetch new data
      fetchDetailedProvider(provider.id);
      fetchDocuments(provider.id);
    }
  }, [isOpen, provider?.id]);

  const fetchDetailedProvider = async (providerId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partner/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const detailedData = data.partner || data;
        
        // Only update if we're still viewing the same provider
        if (providerId === provider?.id) {
          // Merge with basic provider data to ensure we have all fields
          const mergedData = {
            ...provider,
            ...detailedData,
            // Ensure name is properly constructed
            name: detailedData.first_name && detailedData.last_name 
              ? `${detailedData.first_name} ${detailedData.last_name}`.trim()
              : provider?.name || detailedData.name || 'Partner Profile'
          };
          
          setDetailedProvider(mergedData);
        }
      } else {
        if (providerId === provider?.id) {
          setDetailedProvider(provider); // Fallback to basic provider data
        }
      }
    } catch (error) {
      if (providerId === provider?.id) {
        setDetailedProvider(provider); // Fallback to basic provider data
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (providerId: string) => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/provider/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const documentsList: { name: string; url: string; type: string }[] = [];
        
        // Handle the response structure from the documents API
        if (data.documents && Array.isArray(data.documents)) {
          data.documents.forEach((doc: any) => {
            if (doc.document_type && doc.document_url) {
              let displayName = doc.document_type;
              
              // Convert document type to display name
              switch (doc.document_type.toLowerCase()) {
                case 'pan_card':
                case 'pan':
                  displayName = 'PAN Card';
                  break;
                case 'aadhaar_card':
                case 'aadhaar':
                case 'aadhar':
                  displayName = 'Aadhaar Card';
                  break;
                default:
                  displayName = doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              }
              
              documentsList.push({
                name: displayName,
                url: doc.document_url,
                type: doc.document_type
              });
            }
          });
        }
        
        setDocuments(documentsList);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  if (!isOpen || !provider) return null;

  const currentProvider = detailedProvider || provider;

  const handleApprovePartner = async () => {
    try {
      setIsApproving(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partner/${provider.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`Partner ${provider.name} approved successfully!`);
        
        // Refresh the detailed provider data to show updated status
        await fetchDetailedProvider(provider.id);
        
        // Update parent component
        const updatedProvider = { ...provider, status: 'approved' as const, kyc_status: 'verified' };
        onProviderUpdate?.(updatedProvider);
        
        // If the approved partner is the current user, refresh their data immediately
        if (provider.id === user?.id) {
          await refreshUser();
          // Force a small delay to ensure the UI updates
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        toast.error(`Failed to approve partner: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      toast.error(`Error approving partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };

  const isAlreadyApproved = currentProvider.status === 'approved' || currentProvider.status === 'Active' || currentProvider.kyc_status === 'verified' || currentProvider.kyc_status === 'approved';
  const isProfileComplete = currentProvider.profileComplete ?? ((currentProvider.profileCompletionPercentage || 0) === 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Partner Profile</h2>
              <p className="text-white/80 text-sm mt-1">Complete partner information and verification status</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading partner details...</p>
            </div>
          ) : (
            <div className="p-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-8">
                <div className="flex items-center space-x-6">
                  {/* Profile Image with Progress */}
                  <div className="relative">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90 absolute" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={(currentProvider.profileCompletionPercentage || 0) >= 90 ? '#10b981' :
                                 (currentProvider.profileCompletionPercentage || 0) >= 70 ? '#f59e0b' :
                                 '#ef4444'}
                          strokeWidth="3"
                          strokeDasharray={`${currentProvider.profileCompletionPercentage || 0}, 100`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      
                      {currentProvider.profile_image_url && currentProvider.profile_image_url.trim() !== '' ? (
                        <img
                          src={currentProvider.profile_image_url}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg absolute top-2 left-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="40" cy="40" r="40" fill="#578f82"/>
                                <circle cx="40" cy="30" r="10" fill="white"/>
                                <path d="M20 60c0-11 9-20 20-20s20 9 20 20" fill="white"/>
                              </svg>
                            `)}`
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[#578f82] flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg absolute top-2 left-2">
                          {currentProvider.first_name?.charAt(0) || currentProvider.name?.charAt(0) || 'P'}
                        </div>
                      )}
                      
                      {/* Completion percentage badge */}
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg">
                        <span className={`text-xs font-bold ${
                          (currentProvider.profileCompletionPercentage || 0) >= 90 ? 'text-green-600' :
                          (currentProvider.profileCompletionPercentage || 0) >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {currentProvider.profileCompletionPercentage || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Provider Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {currentProvider.first_name && currentProvider.last_name 
                          ? `${currentProvider.first_name} ${currentProvider.last_name}`
                          : currentProvider.name || 'Partner Profile'}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        currentProvider.status === 'approved' || currentProvider.kyc_status === 'verified'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : currentProvider.status === 'pending' || currentProvider.kyc_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : currentProvider.status === 'Active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {(currentProvider.status === 'approved' || currentProvider.kyc_status === 'verified') && <CheckCircle className="w-4 h-4 mr-1" />}
                        {(currentProvider.status === 'pending' || currentProvider.kyc_status === 'pending') && <Clock className="w-4 h-4 mr-1" />}
                        {currentProvider.status === 'Active' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {currentProvider.kyc_status === 'verified' ? 'Verified' : 
                         currentProvider.status === 'approved' ? 'Approved' :
                         currentProvider.status === 'Active' ? 'Active' :
                         currentProvider.status || currentProvider.kyc_status || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4 text-[#578f82]" />
                        <span>{currentProvider.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4 text-[#578f82]" />
                        <span>{currentProvider.phone || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-[#578f82]" />
                        <span>Joined {currentProvider.created_at ? new Date(currentProvider.created_at).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{currentProvider.average_rating || 'No ratings yet'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[#578f82]" />
                    Personal Information
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Full Name</span>
                    <span className="text-sm text-gray-900 font-medium">{currentProvider.first_name} {currentProvider.last_name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Email</span>
                    <span className="text-sm text-gray-900">{currentProvider.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Phone</span>
                    <span className="text-sm text-gray-900">{currentProvider.phone}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Date of Birth</span>
                    <span className="text-sm text-gray-900">{currentProvider.date_of_birth || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Gender</span>
                    <span className="text-sm text-gray-900">{currentProvider.gender || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Experience</span>
                    <span className="text-sm text-gray-900 font-medium">{currentProvider.experience_years} years</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Languages</span>
                    <span className="text-sm text-gray-900">{currentProvider.languages || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Address Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#578f82]" />
                    Address Information
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Address</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">{currentProvider.address || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Area</span>
                    <span className="text-sm text-gray-900">{currentProvider.area || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">City</span>
                    <span className="text-sm text-gray-900 font-medium">{currentProvider.city || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">State</span>
                    <span className="text-sm text-gray-900">{currentProvider.state || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">Pincode</span>
                    <span className="text-sm text-gray-900 font-mono">{currentProvider.pincode || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Banking Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Service Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-[#578f82]" />
                    Service Information
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Categories</span>
                    <span className="text-sm text-gray-900">{currentProvider.service_categories || 'Not provided'}</span>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Specific Services</span>
                    <span className="text-sm text-gray-900">{currentProvider.specific_services || 'Not provided'}</span>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Age Groups</span>
                    <span className="text-sm text-gray-900">{currentProvider.age_groups || 'Not provided'}</span>
                  </div>
                  <div className="py-3">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Description</span>
                    <span className="text-sm text-gray-900">{currentProvider.description || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Banking Information Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2 text-[#578f82]" />
                    Banking Information
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Account Holder</span>
                    <span className="text-sm text-gray-900 font-medium">{currentProvider.account_holder_name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Bank Name</span>
                    <span className="text-sm text-gray-900">{currentProvider.bank_name || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Account Number</span>
                    <span className="text-sm text-gray-900 font-mono">
                      {currentProvider.account_number ? 
                        `****${currentProvider.account_number.slice(-4)}` : 'Not provided'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">IFSC Code</span>
                    <span className="text-sm text-gray-900 font-mono">{currentProvider.ifsc_code || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">UPI ID</span>
                    <span className="text-sm text-gray-900">{currentProvider.upi_id || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mt-8">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[#578f82]" />
                    Documents
                  </h4>
                </div>
                <div className="p-6">
                  {documentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82] mx-auto"></div>
                      <p className="mt-4 text-gray-600 text-sm">Loading documents...</p>
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {documents.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                          <div className="mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <h5 className="font-medium text-gray-900 mb-2">{doc.name}</h5>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            View Document
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Approval Button Section */}
            <div className="mt-8 flex justify-center">
              {isAlreadyApproved ? (
                <div className="px-6 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Partner Already Approved
                </div>
              ) : isProfileComplete ? (
                <button
                  onClick={handleApprovePartner}
                  disabled={isApproving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Partner</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" title="Profile must be 100% complete to approve">
                  Profile Incomplete ({currentProvider.profileCompletionPercentage || 0}%)
                </div>
              )}
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailsModal;
