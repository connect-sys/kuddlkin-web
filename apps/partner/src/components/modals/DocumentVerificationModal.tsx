import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Download, Eye, FileText, Image, User, CreditCard, Building, Phone, Mail, MapPin, Calendar, AlertTriangle, Check } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  city?: string;
  pincode?: string;
  experienceYears?: number;
  serviceArea?: string;
  totalBookings?: number;
  averageRating?: number;
  // Profile completion fields
  first_name?: string;
  last_name?: string;
  state?: string;
  service_categories?: string;
  specific_services?: string;
  age_groups?: string;
  languages?: string;
  description?: string;
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  profile_image_url?: string;
}

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  fileSize: number;
  mimeType: string;
}

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  onVerificationComplete: (partnerId: string, status: 'verified' | 'rejected') => void;
}

const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  partner,
  onVerificationComplete
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>(partner.status);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, 'pending' | 'verified' | 'rejected'>>({});
  const [partnerProfile, setPartnerProfile] = useState<Partner | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Calculate profile completion percentage - EXACT field list as specified by user
  const calculateProfileCompletion = (profile: Partner) => {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone', 'gender', 'date_of_birth',
      'pincode', 'address', 'city', 'state', 'area', 'service_categories',
      'specific_services', 'age_groups', 'experience_years', 'languages',
      'description', 'qualifications', 'serviceable_pincodes',
      'account_holder_name', 'account_number', 'ifsc_code', 'bank_name', 'account_type'
    ];
    
    let completedFields = 0;
    const totalFields = requiredFields.length;
    
    // Check all required fields
    requiredFields.forEach(field => {
      const value = profile[field as keyof Partner];
      if (value && 
          value.toString().trim() !== '' && 
          value !== 'New' && 
          value !== 'Partner' && 
          !value.toString().includes('@temp.kuddl.com')) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  };

  // Fetch partner profile data
  const fetchPartnerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partner.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPartnerProfile(result.data);
          const completion = calculateProfileCompletion(result.data);
          setProfileCompletion(completion);
        }
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      // Use basic partner data as fallback
      setPartnerProfile(partner);
      setProfileCompletion(50); // Default completion
    }
  };

  // Fetch partner documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partner.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.documents);
        
        // Initialize document statuses
        const initialStatuses: Record<string, 'pending' | 'verified' | 'rejected'> = {};
        result.documents.forEach((doc: Document) => {
          initialStatuses[doc.id] = doc.verificationStatus;
        });
        setDocumentStatuses(initialStatuses);
      } else {
        // Fallback to mock documents if API fails
        const mockDocuments: Document[] = [
          {
            id: '1',
            documentType: 'profile-photo',
            fileName: 'profile_photo.jpg',
            fileUrl: '/placeholder-profile.jpg',
            verificationStatus: 'pending',
            uploadedAt: partner.createdAt,
            fileSize: 1024000,
            mimeType: 'image/jpeg'
          },
          {
            id: '2',
            documentType: 'pan-card',
            fileName: 'pan_card.pdf',
            fileUrl: '/placeholder-document.pdf',
            verificationStatus: 'pending',
            uploadedAt: partner.createdAt,
            fileSize: 2048000,
            mimeType: 'application/pdf'
          },
          {
            id: '3',
            documentType: 'aadhaar-front',
            fileName: 'aadhaar_front.jpg',
            fileUrl: '/placeholder-aadhaar.jpg',
            verificationStatus: 'pending',
            uploadedAt: partner.createdAt,
            fileSize: 1536000,
            mimeType: 'image/jpeg'
          },
          {
            id: '4',
            documentType: 'aadhaar-back',
            fileName: 'aadhaar_back.jpg',
            fileUrl: '/placeholder-aadhaar.jpg',
            verificationStatus: 'pending',
            uploadedAt: partner.createdAt,
            fileSize: 1536000,
            mimeType: 'image/jpeg'
          }
        ];

        setDocuments(mockDocuments);
        
        // Initialize document statuses
        const initialStatuses: Record<string, 'pending' | 'verified' | 'rejected'> = {};
        mockDocuments.forEach(doc => {
          initialStatuses[doc.id] = doc.verificationStatus;
        });
        setDocumentStatuses(initialStatuses);
      }

    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPartnerProfile();
      fetchDocuments();
    }
  }, [isOpen, partner.id]);

  const getDocumentIcon = (documentType: string) => {
    if (!documentType) return <FileText className="w-5 h-5" />;
    
    switch (documentType) {
      case 'profile-photo': return <User className="w-5 h-5" />;
      case 'pan-card': return <CreditCard className="w-5 h-5" />;
      case 'aadhaar-front':
      case 'aadhaar-back': return <CreditCard className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentTitle = (documentType: string) => {
    if (!documentType) return 'Unknown Document';
    
    switch (documentType) {
      case 'profile-photo': return 'Profile Photo';
      case 'pan-card': return 'PAN Card';
      case 'aadhaar-front': return 'Aadhaar Front';
      case 'aadhaar-back': return 'Aadhaar Back';
      default: return documentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusColor = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const handleDocumentStatusChange = (documentId: string, status: 'verified' | 'rejected') => {
    setDocumentStatuses(prev => ({
      ...prev,
      [documentId]: status
    }));
  };

  const handleFinalVerification = async () => {
    try {
      setLoading(true);
      
      // Check if profile is complete
      if (profileCompletion < 100) {
        alert(`Profile is only ${profileCompletion}% complete. Partner must complete their profile before verification. Missing required fields are marked with ❌.`);
        setLoading(false);
        return;
      }
      
      // Check if all documents are verified
      const allDocumentsVerified = Object.values(documentStatuses).every(status => status === 'verified');
      const hasRejectedDocuments = Object.values(documentStatuses).some(status => status === 'rejected');
      
      let finalStatus: 'verified' | 'rejected';
      
      if (allDocumentsVerified) {
        finalStatus = 'verified';
      } else if (hasRejectedDocuments) {
        finalStatus = 'rejected';
      } else {
        alert('Please verify all documents before completing the verification process.');
        return;
      }

      // Make API call to update the partner status
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partner.id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: finalStatus,
          documentStatuses: documentStatuses,
          profileCompletion: profileCompletion
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local verification status immediately
        setVerificationStatus(finalStatus);
        
        if (finalStatus === 'verified') {
          alert('✅ Partner verified successfully! Their services are now visible to customers.');
        }
        
        // Call the parent callback to update the partner list
        onVerificationComplete(partner.id, finalStatus);
        
        // Close the modal after successful verification
        onClose();
      } else {
        throw new Error(result.message || 'Failed to update verification status');
      }
      
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Error updating verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#578f82] to-[#cf956d] p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Document Verification</h2>
              <p className="text-white/90 mt-1 text-sm sm:text-base hidden sm:block">Review and verify partner documents</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Partner Info */}
        <div className="p-3 sm:p-6 border-b border-gray-200 bg-gray-50 overflow-x-hidden">
          <div className="flex items-start space-x-3 sm:space-x-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#578f82] to-[#cf956d] rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
              {(partnerProfile?.first_name || partner.name)?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {partnerProfile?.first_name && partnerProfile?.last_name 
                      ? `${partnerProfile.first_name} ${partnerProfile.last_name}`
                      : partner.name || 'Partner Name'
                    }
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block w-fit ${
                      partner.status === 'verified' ? 'bg-green-100 text-green-800' :
                      partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {partner.status || 'Pending'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            profileCompletion >= 80 ? 'bg-green-500' :
                            profileCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                        {profileCompletion}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">Contact Information</h4>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={partnerProfile?.email ? 'text-gray-900' : 'text-red-500'}>
                      {partnerProfile?.email || partner.email || 'Missing ❌'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={partnerProfile?.phone ? 'text-gray-900' : 'text-red-500'}>
                      {partnerProfile?.phone || partner.phone || 'Missing ❌'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={partnerProfile?.city && partnerProfile?.state ? 'text-gray-900' : 'text-red-500'}>
                      {partnerProfile?.city && partnerProfile?.state 
                        ? `${partnerProfile.city}, ${partnerProfile.state} ${partnerProfile.pincode || ''}`
                        : 'Location Missing ❌'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">Business Details</h4>
                  <div className="text-gray-600">
                    <span className="font-medium">Business:</span> 
                    <span className={partnerProfile?.businessName ? 'text-gray-900 ml-1' : 'text-yellow-600 ml-1'}>
                      {partnerProfile?.businessName || 'Not provided ⚠️'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Experience:</span> 
                    <span className={partnerProfile?.experienceYears ? 'text-gray-900 ml-1' : 'text-red-500 ml-1'}>
                      {partnerProfile?.experienceYears ? `${partnerProfile.experienceYears} years` : 'Missing ❌'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Languages:</span> 
                    <span className={partnerProfile?.languages ? 'text-gray-900 ml-1' : 'text-red-500 ml-1'}>
                      {partnerProfile?.languages || 'Missing ❌'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">Service Information</h4>
                  <div className="text-gray-600">
                    <span className="font-medium">Categories:</span> 
                    <span className={partnerProfile?.service_categories ? 'text-gray-900 ml-1' : 'text-red-500 ml-1'}>
                      {partnerProfile?.service_categories ? partnerProfile.service_categories.replace(/,/g, ', ') : 'Missing ❌'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Age Groups:</span> 
                    <span className={partnerProfile?.age_groups ? 'text-gray-900 ml-1' : 'text-red-500 ml-1'}>
                      {partnerProfile?.age_groups ? partnerProfile.age_groups.replace(/,/g, ', ') : 'Missing ❌'}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Description:</span> 
                    <span className={partnerProfile?.description ? 'text-gray-900 ml-1' : 'text-red-500 ml-1'}>
                      {partnerProfile?.description ? (partnerProfile.description.length > 30 ? `${partnerProfile.description.substring(0, 30)}...` : partnerProfile.description) : 'Missing ❌'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b pb-1">Banking & Platform</h4>
                  <div className="text-gray-600">
                    <span className="font-medium">Bank Account:</span> 
                    <span className={partnerProfile?.bank_name && partnerProfile?.account_number ? 'text-green-600 ml-1' : 'text-yellow-600 ml-1'}>
                      {partnerProfile?.bank_name && partnerProfile?.account_number ? '✅ Provided' : '⚠️ Optional'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Joined: {partner.createdAt || 'Unknown'}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Total Bookings:</span> {partner.totalBookings || 0}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Rating:</span> {partner.averageRating || 'N/A'} ⭐
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-[#578f82] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading documents...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((document, index) => (
                  <div key={document.id || `doc-${index}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getDocumentIcon(document.documentType)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{getDocumentTitle(document.documentType)}</h5>
                          <p className="text-sm text-gray-500">{document.fileName || 'Unknown file'}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(document.fileSize || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(documentStatuses[document.id] || document.verificationStatus || 'pending')}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(documentStatuses[document.id] || document.verificationStatus || 'pending')}`}>
                          {((documentStatuses[document.id] || document.verificationStatus || 'pending').charAt(0).toUpperCase() + (documentStatuses[document.id] || document.verificationStatus || 'pending').slice(1))}
                        </span>
                      </div>
                    </div>

                    {/* Document Preview */}
                    <div className="mb-4">
                      {(document.mimeType || '').startsWith('image/') ? (
                        <div 
                          className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => document.fileUrl && setSelectedImage(document.fileUrl)}
                        >
                          <div className="text-center">
                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to view image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">PDF Document</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => document.id && handleDocumentStatusChange(document.id, 'verified')}
                          className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                            documentStatuses[document.id] === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => document.id && handleDocumentStatusChange(document.id, 'rejected')}
                          className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                            documentStatuses[document.id] === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                {Object.values(documentStatuses).filter(status => status === 'verified').length} of {documents.length} documents verified
              </div>
              <div className="text-sm">
                Profile: <span className={`font-medium ${
                  profileCompletion >= 100 ? 'text-green-600' :
                  profileCompletion >= 80 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {profileCompletion}% complete
                </span>
                {profileCompletion < 100 && (
                  <span className="text-red-500 ml-2">
                    (Required for verification)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalVerification}
                disabled={loading || profileCompletion < 100}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                  profileCompletion >= 100 
                    ? 'bg-[#578f82] text-white hover:bg-[#4a7c70]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={profileCompletion < 100 ? 'Profile must be 100% complete to verify partner' : ''}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {profileCompletion < 100 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Profile Incomplete</p>
                  <p>Partner must complete all required fields (marked with ❌) before verification. Only verified partners' services are visible to customers.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Document preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationModal;
