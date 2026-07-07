import React, { useState, useEffect } from 'react'
import { getDisplayImageUrl } from '../utils/r2Utils'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Shield, 
  FileText, 
  CreditCard, 
  Camera,
  Save,
  Edit,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import DocumentUpload from '../components/DocumentUpload'
import SecurityTab from '../components/profile/SecurityTab'
import LivenessCheck from '../components/LivenessCheck/LivenessCheck'
import ValidatedInput from '../components/common/ValidatedInput'
import ServiceTypePicker from '../components/ServiceTypePicker'
import PincodePicker from '../components/PincodePicker'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { getCategories, ServiceCategory } from '../api/categories'
import type { ServiceType } from '../api/serviceTypes'

  const ageGroups = [
    'Newborn (0-3 months)',
    'Infant (3-12 months)',
    'Toddler (1-3 years)',
    'Preschooler (3-5 years)',
    'School Age (5-12 years)',
    'Teen (12+ years)',
    'All Ages'
  ];

const TabbedProfile: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({
    basic: false,
    services: false,
    areas: false,
    documents: false,
    banking: false
  })
  const [pincodeStatus, setPincodeStatus] = useState<{
    status: 'idle'|'checking'|'serviceable'|'not_serviceable', 
    info?: {city?: string, state?: string, area?: string}
  }>({ status: 'idle' })

  // Pincode auto-fill function
  const checkPincode = async (pincode: string) => {
    if (pincode.length === 6) {
      setPincodeStatus({ status: 'checking' })
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
        const response = await fetch(`${API_BASE_URL}/api/pincodes/check?pincode=${pincode}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setPincodeStatus({ 
            status: 'serviceable', 
            info: { 
              city: data.data.city, 
              state: data.data.state, 
              area: data.data.area !== 'undefined' ? data.data.area : undefined 
            } 
          })
          setFormData(prev => ({
            ...prev,
            city: data.data.city || '',
            state: data.data.state || '',
            area: data.data.area !== 'undefined' ? data.data.area || '' : ''
          }))
          toast.success(`Location found: ${data.data.city}, ${data.data.state}`)
        } else {
          setPincodeStatus({ status: 'not_serviceable' })
          toast.error('Pincode not found in our database')
        }
      } catch (error) {
        setPincodeStatus({ status: 'not_serviceable' })
        toast.error('Failed to verify pincode')
      }
    } else {
      setPincodeStatus({ status: 'idle' })
    }
  }
  
  const [serviceAreas, setServiceAreas] = useState<{
    pincodes: string[],
    addresses: string[],
    newPincode: string,
    newAddress: string
  }>({
    pincodes: [],
    addresses: [],
    newPincode: '',
    newAddress: ''
  })

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'services', label: 'Services & Areas', icon: Building },
    { id: 'banking_documents', label: 'Banking & Documents', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    area: '',
    pincode: '',
    profileImage: null as File | null,
    
    // Services
    primaryCategories: [] as string[],
    specificServices: [] as string[],
    serviceTypes: [] as ServiceType[],
    serviceablePincodes: [] as string[],
    ageGroups: [] as string[],
    experience: '',
    qualifications: '',
    description: '',
    languages: [] as string[],
    
    // Documents
    documents: {
      panCard: null as File | null,
      aadhaarCard: null as File | null,
    },
    
    // Banking
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: '',
    upiId: '',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Dynamic documents state
  const [dynamicDocuments, setDynamicDocuments] = useState<Array<{
    id: string;
    title: string;
    file: File | null;
    uploadedAt?: string;
    uploadedUrl?: string;
    uploading?: boolean;
  }>>([])

  const [newDocumentTitle, setNewDocumentTitle] = useState('')
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [isPanVerified, setIsPanVerified] = useState(false)
  const [panStatus, setPanStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle')
  const [uploadedDocumentUrls, setUploadedDocumentUrls] = useState<{[key: string]: string}>({})
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({})
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [showProfileImageModal, setShowProfileImageModal] = useState(false)
  const [showIncompleteFieldsModal, setShowIncompleteFieldsModal] = useState(false)

  // Verification states
  const [aadhaarStatus, setAadhaarStatus] = useState<'idle' | 'sending_otp' | 'otp_sent' | 'verifying' | 'verified' | 'failed'>('idle');
  const [aadhaarRequestId, setAadhaarRequestId] = useState<string>('')
  const [aadhaarOtp, setAadhaarOtp] = useState<string>('')
  const [gstStatus, setGstStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle')
  const [bankVerificationStatus, setBankVerificationStatus] = useState<'idle' | 'verifying_ifsc' | 'verifying_account' | 'verified' | 'failed'>('idle')

  // Verification form data
  const [verificationData, setVerificationData] = useState({
    aadhaarNumber: '',
    gstNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountHolder: '',
    accountType: '',
    isAadhaarVerified: false,
    isGstVerified: false
  })

  // Helper function to check if a specific document type exists
  const hasDocumentType = (documentType: string) => {
    const found = documents.some(doc => {
      const docType = doc.document_type?.toLowerCase()
      const normalizedDocType = docType?.replace(/[_\s]/g, '')
      const normalizedSearchType = documentType.toLowerCase().replace(/[_\s]/g, '')
      
      // Handle various naming conventions
      switch (normalizedSearchType) {
        case 'pancard':
        case 'pan':
          return normalizedDocType === 'pancard' || docType === 'pan_card' || docType === 'pancard'
        case 'aadhaarcard':
        case 'aadhaar':
          return normalizedDocType === 'aadhaarcard' || docType === 'aadhaar_card' || docType === 'aadhaarcard'
        default:
          return normalizedDocType === normalizedSearchType || docType === documentType.toLowerCase()
      }
    })
    return found
  }

  // OTP-based Aadhaar verification functions
  const handleAadhaarSendOtp = async () => {
    if (verificationData.aadhaarNumber.length !== 12) {
      toast.error('Please enter valid 12-digit Aadhaar number');
      return;
    }

    setAadhaarStatus('sending_otp');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/aadhaar/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          aadhaar_number: verificationData.aadhaarNumber
        })
      });

      const data = await response.json();
      console.log('Aadhaar OTP send response:', data);

      if (data.success) {
        setAadhaarRequestId(data.request_id);
        setAadhaarStatus('otp_sent');
        toast.success('OTP sent to your registered mobile number');
      } else {
        setAadhaarStatus('failed');
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Aadhaar OTP send error:', error);
      setAadhaarStatus('failed');
      toast.error('Failed to send OTP');
    }
  };

  const handleAadhaarVerifyOtp = async (otp: string) => {
    if (!aadhaarRequestId) {
      toast.error('Please send OTP first');
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP');
      return;
    }

    setAadhaarStatus('verifying');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kyc/aadhaar/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          request_id: String(aadhaarRequestId), // Convert to string as per Sandbox API docs
          otp: String(otp) // Convert to string as per Sandbox API docs
        })
      });
      console.log('Aadhaar OTP verification response:', response);

      const data = await response.json();
      console.log('Aadhaar OTP verification response:', data);

      if (data.success) {
        setAadhaarStatus('verified');
        setVerificationData(prev => ({ ...prev, isAadhaarVerified: true }));
        setAadhaarOtp('');
        toast.success(data.message || 'Aadhaar verified successfully!');
        
        // Store document data if available
        if (data.aadhaar_data) {
          console.log('Aadhaar document data:', data.aadhaar_data);
        }
      } else {
        setAadhaarStatus('failed');
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Aadhaar OTP verification error:', error);
      setAadhaarStatus('failed');
      toast.error('Verification service unavailable');
    }
  };


  const handleGstVerify = async () => {
    if (verificationData.gstNumber.length !== 15) {
      toast.error('Please enter valid 15-character GST number');
      return;
    }

    setGstStatus('verifying');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/gst/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gst_number: verificationData.gstNumber })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationData(prev => ({ ...prev, isGstVerified: true }));
        setGstStatus('verified');
        toast.success('GST verified successfully');
      } else {
        setGstStatus('failed');
        toast.error(data.error || 'GST verification failed');
      }
    } catch (error) {
      console.error('GST verification error:', error);
      setGstStatus('failed');
      toast.error('Verification service unavailable');
    }
  };

  const handlePanVerify = async () => {
    if (panNumber.length !== 10) {
      toast.error('Please enter valid 10-character PAN number');
      return;
    }

    setPanStatus('verifying');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/pan/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pan_number: panNumber })
      });

      const data = await response.json();

      if (data.success) {
        setIsPanVerified(true);
        setPanStatus('verified');
        toast.success('PAN verified successfully');
      } else {
        setPanStatus('failed');
        toast.error(data.error || 'PAN verification failed');
      }
    } catch (error) {
      console.error('PAN verification error:', error);
      setPanStatus('failed');
      toast.error('Verification service unavailable');
    }
  };

  const handleIfscLookup = async (ifscCode: string) => {
    if (ifscCode.length !== 11) return;

    setBankVerificationStatus('verifying_ifsc');
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setBankVerificationStatus('failed');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/bank/ifsc/${ifscCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setVerificationData(prev => ({
          ...prev,
          bankName: data.data.BANK || '',
          branchName: data.data.BRANCH || ''
        }));
        setBankVerificationStatus('idle');
        toast.success(`Bank details found: ${data.data.BANK} - ${data.data.BRANCH}`);
      } else {
        setBankVerificationStatus('failed');
        toast.error('Invalid IFSC code or bank details not found');
      }
    } catch (error) {
      console.error('IFSC lookup error:', error);
      setBankVerificationStatus('failed');
      toast.error('Failed to lookup bank details');
    }
  };

  const handleAccountVerification = async (accountNumber: string) => {
    if (!accountNumber || !verificationData.ifscCode || verificationData.ifscCode.length !== 11) return;

    setBankVerificationStatus('verifying_account');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/bank/verify-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ifsc_code: verificationData.ifscCode,
          account_number: accountNumber,
          account_holder_name: verificationData.accountHolder || profileData?.full_name || 'Account Holder',
          phone: profileData?.phone || user?.phone || '9999999999'
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setVerificationData(prev => ({
          ...prev,
          accountHolder: data.data.name_at_bank || ''
        }));
        setBankVerificationStatus('verified');
        toast.success(`Account verified: ${data.data.name_at_bank}`);
      } else {
        setBankVerificationStatus('failed');
        toast.error(data.message || 'Account verification failed or account not found');
      }
    } catch (error) {
      console.error('Account verification error:', error);
      setBankVerificationStatus('failed');
      toast.error('Failed to verify account details');
    }
  };

  // Render verification section
  const renderBankingDocuments = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Banking & Documents</span>
          </CardTitle>
          <CardDescription>
            Verified documents, banking details, and additional documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Section 1: All Verified Documents */}
          {(verificationData.isAadhaarVerified || isPanVerified || verificationData.isGstVerified) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Aadhaar Card - Only show if verified */}
                {verificationData.isAadhaarVerified && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Card</label>
                      </div>
                      <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-mono">{verificationData.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3')}</p>
                    </div>
                  </div>
                )}

                {/* PAN Card - Only show if verified */}
                {isPanVerified && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <label className="block text-sm font-medium text-gray-700">PAN Card</label>
                      </div>
                      <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-mono">{panNumber}</p>
                    </div>
                  </div>
                )}

                {/* GST Certificate - Only show if verified */}
                {verificationData.isGstVerified && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <label className="block text-sm font-medium text-gray-700">GST Certificate</label>
                      </div>
                      <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-mono">{verificationData.gstNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Document Verification Dropdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add / Verify Documents</h3>
            
            {/* Document Type Selector */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
                >
                  <option value="">Select Document Type to Add</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="gst">GST Certificate</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID Card</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Aadhaar Verification */}
              {selectedDocumentType === 'aadhaar' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-medium text-gray-700">Aadhaar Verification *</label>
                    {verificationData.isAadhaarVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={verificationData.aadhaarNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setVerificationData(prev => ({ ...prev, aadhaarNumber: value }));
                      }}
                      disabled={verificationData.isAadhaarVerified || aadhaarStatus === 'verifying' || aadhaarStatus === 'sending_otp'}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${verificationData.isAadhaarVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                      placeholder="Enter 12-digit Aadhaar Number"
                      maxLength={12}
                    />
                    
                    {!verificationData.isAadhaarVerified && (
                      <div className="space-y-3">
                        {aadhaarStatus === 'otp_sent' || aadhaarStatus === 'verifying' ? (
                          <>
                            <input
                              type="text"
                              value={aadhaarOtp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setAadhaarOtp(value);
                              }}
                              disabled={aadhaarStatus === 'verifying'}
                              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent border-gray-300"
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAadhaarVerifyOtp(aadhaarOtp)}
                                disabled={aadhaarOtp.length !== 6 || aadhaarStatus === 'verifying'}
                                className="flex-1 bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                              >
                                {aadhaarStatus === 'verifying' ? 'Verifying...' : 'Verify OTP'}
                              </button>
                              <button
                                onClick={handleAadhaarSendOtp}
                                disabled={aadhaarStatus === 'verifying'}
                                className="px-4 py-2 border border-[#578f82] text-[#578f82] rounded-lg hover:bg-[#578f82] hover:text-white transition-colors disabled:opacity-50"
                              >
                                Resend OTP
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={handleAadhaarSendOtp}
                            disabled={verificationData.aadhaarNumber.length !== 12 || aadhaarStatus === 'sending_otp'}
                            className="w-full bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            {aadhaarStatus === 'sending_otp' ? 'Sending OTP...' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAN Verification */}
              {selectedDocumentType === 'pan' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-medium text-gray-700">PAN Verification</label>
                    {isPanVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                        setPanNumber(value);
                      }}
                      disabled={isPanVerified || panStatus === 'verifying'}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${isPanVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                      placeholder="Enter PAN Number"
                      maxLength={10}
                    />
                    {!isPanVerified && (
                      <button
                        onClick={handlePanVerify}
                        disabled={panNumber.length !== 10 || panStatus === 'verifying'}
                        className="bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {panStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* GST Verification */}
              {selectedDocumentType === 'gst' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-medium text-gray-700">GST Verification</label>
                    {verificationData.isGstVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationData.gstNumber}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                        setVerificationData(prev => ({ ...prev, gstNumber: value }));
                      }}
                      disabled={verificationData.isGstVerified || gstStatus === 'verifying'}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${verificationData.isGstVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                      placeholder="Enter GST Number"
                      maxLength={15}
                    />
                    {!verificationData.isGstVerified && (
                      <button
                        onClick={handleGstVerify}
                        disabled={verificationData.gstNumber.length !== 15 || gstStatus === 'verifying'}
                        className="bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {gstStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Document Upload for DL, Voter ID, Others */}
              {(selectedDocumentType === 'driving_license' || selectedDocumentType === 'voter_id' || selectedDocumentType === 'others') && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload {selectedDocumentType === 'driving_license' ? 'Driving License' : selectedDocumentType === 'voter_id' ? 'Voter ID Card' : 'Document'}
                  </label>
                  {selectedDocumentType === 'others' && (
                    <Input
                      placeholder="Enter document name (e.g., Certificate)"
                      value={newDocumentTitle}
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                      className="mb-2 text-sm"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const docTitle = selectedDocumentType === 'others' ? newDocumentTitle : 
                                       selectedDocumentType === 'driving_license' ? 'Driving License' : 'Voter ID Card';
                        if (selectedDocumentType === 'others' && !docTitle.trim()) {
                          toast.error('Please enter document name first');
                          e.target.value = '';
                          return;
                        }
                        addDocumentWithFile(docTitle, file);
                        setSelectedDocumentType('');
                        setNewDocumentTitle('');
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#578f82] file:text-white hover:file:bg-[#4a7c70]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Banking Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                  <input
                    type="text"
                    value={verificationData.ifscCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 11);
                      setVerificationData(prev => ({ ...prev, ifscCode: value }));
                      if (value.length === 11) {
                        handleIfscLookup(value);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter IFSC Code"
                    maxLength={11}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={verificationData.bankName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Auto-filled from IFSC"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={verificationData.branchName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    placeholder="Auto-filled from IFSC"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                  <input
                    type="text"
                    value={verificationData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setVerificationData(prev => ({ ...prev, accountNumber: value }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter Account Number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={verificationData.accountHolder}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter Account Holder Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                  <select
                    value={verificationData.accountType}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, accountType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>
              </div>
              
              {/* Save Banking Details Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSave('banking')}
                  disabled={saving}
                  className="px-6 py-2 bg-[#578f82] text-white rounded-lg hover:bg-[#4a7a6e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  Save Account Details
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Uploaded Documents List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
            {dynamicDocuments.length > 0 ? (
              <div className="space-y-2">
                {dynamicDocuments.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{doc.title}</span>
                        </div>
                        {doc.uploading && (
                          <p className="text-xs text-blue-600 mt-1">⏳ Uploading to R2...</p>
                        )}
                        {doc.file && !doc.uploading && (
                          <p className="text-xs text-green-600 mt-1">✓ {doc.file.name} (Uploaded to R2)</p>
                        )}
                        {!doc.file && doc.uploadedUrl && !doc.uploading && (
                          <p className="text-xs text-green-600 mt-1">✓ Previously uploaded to R2</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No documents uploaded yet</p>
                <p className="text-xs">Select document type above to upload</p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )

  const renderVerification = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Identity Verification & Banking</span>
          </CardTitle>
          <CardDescription>
            Verify your identity and banking details for secure transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Aadhaar Verification */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <label className="block text-sm font-medium text-gray-700">Aadhaar Verification *</label>
              {verificationData.isAadhaarVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={verificationData.aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setVerificationData(prev => ({ ...prev, aadhaarNumber: value }));
                }}
                disabled={verificationData.isAadhaarVerified || aadhaarStatus === 'verifying' || aadhaarStatus === 'sending_otp'}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${verificationData.isAadhaarVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                placeholder="Enter 12-digit Aadhaar Number"
                maxLength={12}
              />
              
              {!verificationData.isAadhaarVerified && (
                <div className="space-y-3">
                  {aadhaarStatus === 'otp_sent' || aadhaarStatus === 'verifying' ? (
                    <>
                      <input
                        type="text"
                        value={aadhaarOtp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setAadhaarOtp(value);
                        }}
                        disabled={aadhaarStatus === 'verifying'}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent border-gray-300"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAadhaarVerifyOtp(aadhaarOtp)}
                          disabled={aadhaarOtp.length !== 6 || aadhaarStatus === 'verifying'}
                          className="flex-1 bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                          {aadhaarStatus === 'verifying' ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                          onClick={handleAadhaarSendOtp}
                          disabled={aadhaarStatus === 'verifying'}
                          className="px-4 py-2 border border-[#578f82] text-[#578f82] rounded-lg hover:bg-[#578f82] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleAadhaarSendOtp}
                      disabled={verificationData.aadhaarNumber.length !== 12 || aadhaarStatus === 'sending_otp'}
                      className="w-full bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {aadhaarStatus === 'sending_otp' ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* GST Verification */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <label className="block text-sm font-medium text-gray-700">GST Verification (Optional)</label>
              {verificationData.isGstVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={verificationData.gstNumber}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                  setVerificationData(prev => ({ ...prev, gstNumber: value }));
                }}
                disabled={verificationData.isGstVerified || gstStatus === 'verifying'}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${verificationData.isGstVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                placeholder="Enter GST Number (Optional)"
                maxLength={15}
              />
              {!verificationData.isGstVerified && (
                <button
                  onClick={handleGstVerify}
                  disabled={verificationData.gstNumber.length !== 15 || gstStatus === 'verifying'}
                  className="bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {gstStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                </button>
              )}
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <label className="block text-sm font-medium text-gray-700">Banking Information *</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                <input
                  type="text"
                  value={verificationData.ifscCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 11);
                    setVerificationData(prev => ({ ...prev, ifscCode: value }));
                    if (value.length === 11) {
                      handleIfscLookup(value);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  placeholder="Enter IFSC Code"
                  maxLength={11}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={verificationData.bankName}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="Auto-filled from IFSC"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={verificationData.branchName}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="Auto-filled from IFSC"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input
                  type="text"
                  value={verificationData.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationData(prev => ({ ...prev, accountNumber: value }));
                    // Removed automatic account verification - user can enter manually
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  placeholder="Enter Account Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter Account Number *</label>
                <input
                  type="text"
                  value={verificationData.confirmAccountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationData(prev => ({ ...prev, confirmAccountNumber: value }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                    verificationData.confirmAccountNumber && verificationData.accountNumber !== verificationData.confirmAccountNumber 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Re-enter Account Number"
                />
                {verificationData.confirmAccountNumber && verificationData.accountNumber !== verificationData.confirmAccountNumber && (
                  <p className="text-red-500 text-sm mt-1">Account numbers do not match</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={verificationData.accountHolder}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="Auto-filled after verification"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                <select
                  value={verificationData.accountType}
                  onChange={(e) => setVerificationData(prev => ({ ...prev, accountType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                >
                  <option value="">Select Account Type</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );

  useEffect(() => {
    fetchProfileData()
    fetchCategories()
    fetchDocuments()
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const fetchedCategories = await getCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      toast.error('Failed to load service categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      
      if (!token) {
        console.warn('No token available for documents fetch')
        return
      }

      // Get user ID from token to construct the documents endpoint
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId || payload.id || payload.sub
      
      if (!userId) {
        console.warn('No user ID found in token for documents fetch')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/provider/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success && result.documents) {
        setDocuments(result.documents)
      } else {
        setDocuments([])
      }
    } catch (error) {
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('Please login again')
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data
        setProfileData(data)
        
        // Check if user is admin (admin profiles have business_name: 'Kuddl Admin')
        const isAdminUser = data.business_name === 'Kuddl Admin' || data.service_category === 'Administration'
        setIsAdmin(isAdminUser)
        
        if (isAdminUser) {
          console.log('👑 Admin user detected - limiting profile functionality')
        }
        // Load service types from service_types column (registry IDs)
        let serviceTypesArray: ServiceType[] = [];
        if (data.service_types && typeof data.service_types === 'string' && data.service_types.trim()) {
          const ids = data.service_types.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (ids.length > 0) {
            try {
              const { listServiceTypes } = await import('../api/serviceTypes');
              const allServiceTypes = await listServiceTypes();
              serviceTypesArray = allServiceTypes.filter((st) => ids.includes(st.id));
            } catch (e) {
              console.warn('Failed to load service types', e);
            }
          }
        }

        setFormData({
          fullName: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.date_of_birth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          area: data.area || '',
          pincode: data.pincode || '',
          profileImage: null,
          primaryCategories: data.service_categories ? data.service_categories.split(',').map((s: string) => s.trim()) : [],
          specificServices: data.specific_services ? data.specific_services.split(',').map((s: string) => s.trim()) : [],
          serviceTypes: serviceTypesArray,
          serviceablePincodes: data.serviceable_pincodes ? data.serviceable_pincodes.split(',').map((p: string) => p.trim()).filter((p: string) => p) : [],
          ageGroups: data.age_groups ? data.age_groups.split(',').map((s: string) => s.trim()) : [],
          experience: data.experience || data.experience_years?.toString() || '',
          qualifications: data.qualifications || '',
          description: data.bio || data.description || '',
          languages: data.languages ? data.languages.split(',').map((s: string) => s.trim()) : [],
          documents: {
            panCard: null,
            aadhaarCard: null,
          },
          accountHolder: data.account_holder_name || data.account_holder || '',
          bankName: data.bank_name || '',
          accountNumber: data.account_number || '',
          ifscCode: data.ifsc_code || '',
          accountType: data.account_type || '',
          upiId: data.upi_id || '',
          
          // Security fields (always empty for security)
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Load verification data with banking information from database
        setVerificationData(prev => ({
          ...prev,
          ifscCode: data.ifsc_code || '',
          bankName: data.bank_name || '',
          branchName: data.branch_name || '',
          accountNumber: data.account_number || '',
          accountHolder: data.account_holder_name || data.account_holder || '',
          accountType: data.account_type || '',
          gstNumber: data.gst_number || '',
          aadhaarNumber: data.aadhaar_number || '',
          // Only mark as verified if BOTH the flag is true AND the actual data exists
          isAadhaarVerified: Boolean(data.is_aadhaar_verified && data.aadhaar_number),
          isGstVerified: Boolean(data.is_gst_verified && data.gst_number)
        }))
        
        // Load service areas data
        const pincodesFromDb = data.serviceable_pincodes ? data.serviceable_pincodes.split(',').filter(Boolean) : []
        const finalPincodes = pincodesFromDb.length > 0 ? pincodesFromDb : (data.pincode ? [String(data.pincode)] : [])
        setServiceAreas({
          pincodes: finalPincodes,
          addresses: data.service_addresses ? data.service_addresses.split(',').filter(Boolean) : [],
          newPincode: '',
          newAddress: ''
        })
        
        // Load document URLs from consolidated document_urls field
        const docUrls: {[key: string]: string} = {}
        
        // Parse document_urls JSON field
        if (data.document_urls) {
          try {
            const parsedDocs = JSON.parse(data.document_urls)
            
            // Extract keys from URLs and map to frontend format
            // Document URLs are now handled through document_urls JSON field
          } catch (error) {
            console.error('❌ Error parsing document_urls:', error)
          }
        }
        
        // Document URLs are now handled through the consolidated document_urls JSON field
        
        setUploadedDocumentUrls(docUrls)
        
        // Load additional documents
        if (data.additional_documents) {
          try {
            const additionalDocs = JSON.parse(data.additional_documents)
            const loadedDynamicDocs = additionalDocs.map((doc: any, index: number) => ({
              id: `loaded_doc_${index}_${Date.now()}`,
              title: doc.title,
              file: null, // We don't store the file, just the URL
              uploadedAt: doc.uploadedAt,
              uploadedUrl: doc.url,
              uploading: false
            }))
            setDynamicDocuments(loadedDynamicDocs)
          } catch (error) {
            console.error('Error parsing additional documents:', error)
          }
        }
      } else {
        toast.error('Profile data not found. Please complete your profile first.')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (tabId: string) => {
    console.log('🔵 handleSave called for tab:', tabId)
    
    // Validate account numbers match for verification tab
    if (tabId === 'verification' && verificationData.accountNumber && verificationData.confirmAccountNumber && 
        verificationData.accountNumber !== verificationData.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      setSaving(false);
      return;
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      console.log('🔑 Token found:', token ? 'Yes' : 'No')
      
      let updateData: any = {}
      
      switch (tabId) {
        case 'basic':
          updateData = {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            area: formData.area,
            pincode: formData.pincode
          }
          break
        case 'services':
          // Extract service type IDs for service_types column
          const serviceTypeIds = formData.serviceTypes.map((st: ServiceType) => st.id).join(',');
          const pincodes = formData.serviceablePincodes.join(',');
          
          updateData = {
            service_types: serviceTypeIds,
            service_categories: formData.primaryCategories.join(','),
            specific_services: formData.specificServices.join(','),
            serviceable_pincodes: pincodes,
            age_groups: formData.ageGroups.join(','),
            experience_years: parseInt(formData.experience) || 0,
            qualifications: formData.qualifications,
            bio: formData.description,
            languages: formData.languages.join(',')
          }
          break
        case 'documents':
          // Save document URLs to consolidated document_urls field
          const documentUrls: any = {}
          
          // Document URLs are handled through the consolidated document_urls JSON field
          
          // Store as JSON in document_urls field
          updateData = {
            document_urls: JSON.stringify(documentUrls)
          }
          
          dynamicDocuments.forEach(doc => {
            if (doc.uploadedUrl) {
              const fieldName = `${doc.title.toLowerCase().replace(/\s+/g, '_')}_url`
              documentUrls[fieldName] = doc.uploadedUrl
            }
          })
          
          // If no documents to save, just show success
          if (Object.keys(documentUrls).length === 0) {
            toast.success('No document changes to save')
            setSaving(false)
            return
          }
          
          updateData = documentUrls
          break
        case 'banking':
          if (isAdmin) {
            toast.error('Admin accounts cannot update banking information')
            setSaving(false)
            return
          }
          
          // Validate required banking fields
          const requiredBankingFields = [
            { field: verificationData.accountHolder, name: 'Account Holder Name' },
            { field: verificationData.bankName, name: 'Bank Name' },
            { field: verificationData.accountNumber, name: 'Account Number' },
            { field: verificationData.ifscCode, name: 'IFSC Code' },
            { field: verificationData.accountType, name: 'Account Type' }
          ]
          
          const missingFields = requiredBankingFields.filter(item => !item.field?.trim())
          if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.map(item => item.name).join(', ')}`)
            setSaving(false)
            return
          }
          
          updateData = {
            account_holder_name: verificationData.accountHolder,
            bank_name: verificationData.bankName,
            account_number: verificationData.accountNumber,
            ifsc_code: verificationData.ifscCode,
            account_type: verificationData.accountType
          }
          break
      }

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/partner/profile`
      console.log('🌐 API URL:', apiUrl)
      console.log('📦 Update data:', updateData)
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      console.log('📡 Response status:', response.status)
      
      const result = await response.json()
      console.log('📥 Response data:', result)
      
      if (result.success) {
        toast.success('Profile updated successfully!')
        setIsEditing(prev => ({ ...prev, [tabId]: false })) // Exit edit mode
        fetchProfileData() // Refresh data
      } else {
        toast.error(result.message || 'Failed to update profile')
        console.error('❌ Update failed:', result)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Tab completion checking functions
  const getTabCompletion = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return checkBasicInfoCompletion()
      case 'services':
        return checkServicesCompletion()
      case 'documents':
        return checkDocumentsCompletion()
      case 'banking':
        return checkBankingCompletion()
      case 'security':
        return checkSecurityCompletion()
      default:
        return { isComplete: true, missingFields: [] }
    }
  }

  const checkBasicInfoCompletion = () => {
    const missingFields = []
    if (!formData.fullName?.trim()) missingFields.push('Full Name')
    if (!formData.email?.trim()) missingFields.push('Email')
    if (!formData.phone?.trim()) missingFields.push('Phone')
    if (!formData.gender?.trim()) missingFields.push('Gender')
    if (!formData.dateOfBirth?.trim()) missingFields.push('Date of Birth')
    if (!formData.pincode?.trim()) missingFields.push('Pincode')
    if (!formData.address?.trim()) missingFields.push('Address')
    if (!formData.city?.trim()) missingFields.push('City')
    if (!formData.state?.trim()) missingFields.push('State')
    if (!formData.area?.trim()) missingFields.push('Area')
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }

  const checkServicesCompletion = () => {
    const missingFields = []
    if (!formData.primaryCategories?.length) missingFields.push('Primary Categories')
    if (!formData.specificServices?.length) missingFields.push('Specific Services')
    if (!formData.ageGroups?.length) missingFields.push('Age Groups')
    if (!formData.experience?.trim()) missingFields.push('Experience')
    if (!formData.languages?.length) missingFields.push('Languages')
    if (!formData.description?.trim()) missingFields.push('Description')
    if (!formData.qualifications?.trim()) missingFields.push('Qualifications')
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }


  const checkDocumentsCompletion = () => {
    const missingFields = []
    // PAN Card is now optional - can be uploaded in documents section
    // Only Aadhaar verification is required
    if (!verificationData.isAadhaarVerified) missingFields.push('Aadhaar Verification')
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }

  const checkBankingCompletion = () => {
    const missingFields: string[] = []
    
    if (!formData.accountHolder?.trim()) missingFields.push('Account Holder Name')
    if (!formData.bankName?.trim()) missingFields.push('Bank Name')
    if (!formData.accountNumber?.trim()) missingFields.push('Account Number')
    if (!formData.ifscCode?.trim()) missingFields.push('IFSC Code')
    if (!formData.accountType?.trim()) missingFields.push('Account Type')
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }

  const checkSecurityCompletion = () => {
    // Security tab is always considered complete as password is optional
    return { isComplete: true, missingFields: [] }
  }

  // Helper function to check if a specific field is missing
  const isFieldMissing = (fieldName: string, value: any): boolean => {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return !value || value.toString().trim() === '' || value === 'New' || value === 'Partner';
  }

  // Helper function to get field border class
  const getFieldBorderClass = (fieldName: string, value: any): string => {
    const isMissing = isFieldMissing(fieldName, value);
    return isMissing ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500';
  }

  const getAllIncompleteFields = () => {
    const allIncomplete: { tabName: string; fields: string[] }[] = []
    
    tabs.forEach(tab => {
      const completion = getTabCompletion(tab.id)
      if (!completion.isComplete) {
        allIncomplete.push({
          tabName: tab.label,
          fields: completion.missingFields
        })
      }
    })
    
    return allIncomplete
  }

  const getCompletionPercentage = () => {
    // Profile completion based on fields shown in screenshots
    const requiredFields = [
      // Basic Information (from first screenshot)
      formData.fullName, // Full Name
      formData.email, // Email
      formData.phone, // Phone
      formData.dateOfBirth, // DOB
      formData.gender, // Gender
      formData.pincode, // Pincode
      formData.address, // Address
      formData.city, // City
      formData.state, // State
      formData.area, // Area
      
      // Services & Areas (from second screenshot)
      formData.primaryCategories.length > 0 ? formData.primaryCategories.join(',') : null, // Service categories (ADVENTURE, BLOOM, etc.)
      formData.ageGroups.length > 0 ? formData.ageGroups.join(',') : null, // Age Groups (Newborn, Infant, etc.)
      formData.experience, // Years of Experience
      formData.qualifications, // Qualifications & Certifications
      formData.description, // Service Description
      formData.languages.length > 0 ? formData.languages.join(',') : null, // Languages Spoken
      
      // Banking & Documents (required for completion)
      verificationData.accountHolder, // Account Holder Name
      verificationData.accountNumber, // Account Number
      verificationData.ifscCode, // IFSC Code
      verificationData.accountType // Account Type (bankName auto-filled, not required)
    ];
    
    const completed = requiredFields.filter((field, index) => {
      const isValid = (() => {
        if (Array.isArray(field)) {
          return field.length > 0;
        }
        return field && field.toString().trim() !== '' && field !== 'New' && field !== 'Partner';
      })();
      
      // Debug each field
      const fieldNames = [
        'fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'pincode', 'address', 'city', 'state', 'area',
        'primaryCategories', 'ageGroups', 'experience', 'qualifications', 'description', 'languages',
        'accountHolder', 'accountNumber', 'ifscCode', 'accountType'
      ];
      
      if (!isValid) {
        console.log(`❌ Missing field ${index + 1}: ${fieldNames[index]} = "${field}"`);
      }
      
      return isValid;
    }).length;
    
    const percentage = Math.round((completed / requiredFields.length) * 100);
    
    // Debug logging to help identify missing fields
    if (percentage < 100) {
      console.log(`Profile completion: ${percentage}% (${completed}/${requiredFields.length} fields completed)`);
      console.log('Missing fields check:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        pincode: formData.pincode,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        area: formData.area,
        primaryCategories: formData.primaryCategories,
        ageGroups: formData.ageGroups,
        experience: formData.experience,
        qualifications: formData.qualifications,
        description: formData.description,
        languages: formData.languages,
        aadhaarUploaded: hasDocumentType('aadhaarCard'),
        accountHolder: verificationData.accountHolder,
        accountNumber: verificationData.accountNumber,
        ifscCode: verificationData.ifscCode,
        bankName: verificationData.bankName,
        accountType: verificationData.accountType
      });
    }
    
    return percentage;
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            Full Name *
            {isFieldMissing('fullName', formData.fullName) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
              className={`flex-1 md:w-full ${getFieldBorderClass('fullName', formData.fullName)}`}
            />
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('fullName', formData.fullName)}`}>
              {formData.fullName || <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div>
          {isEditing.basic ? (
            <div className="flex flex-row md:flex-col items-start md:items-start gap-2 md:gap-0">
              <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto pt-2 md:pt-0">Email *</label>
              <div className="flex-1 md:w-full">
                <ValidatedInput
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  placeholder="Enter your email"
                  label=""
                  required={true}
                  validateOnChange={true}
                  currentUserId={user?.id}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
              <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">Email *</label>
              <div className="flex-1 md:w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm">
                {formData.email || 'Not provided'}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            Phone *
            {isFieldMissing('phone', formData.phone) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('phone', formData.phone)}`}>
            {formData.phone || <span className="text-red-500">Not provided</span>}
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            DOB
            {isFieldMissing('dateOfBirth', formData.dateOfBirth) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className={`flex-1 md:w-full ${getFieldBorderClass('dateOfBirth', formData.dateOfBirth)}`}
            />
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('dateOfBirth', formData.dateOfBirth)}`}>
              {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            Gender
            {isFieldMissing('gender', formData.gender) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className={`flex-1 md:w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent text-sm ${getFieldBorderClass('gender', formData.gender)}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('gender', formData.gender)}`}>
              {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            Pincode *
            {isFieldMissing('pincode', formData.pincode) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <div className="flex-1 md:w-full">
              <Input
                value={formData.pincode}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData(prev => ({ ...prev, pincode: value }))
                  if (value.length === 6) {
                    checkPincode(value)
                  }
                }}
                placeholder="Enter pincode"
                maxLength={6}
                className={getFieldBorderClass('pincode', formData.pincode)}
              />
              {pincodeStatus.status === 'checking' && (
                <p className="text-xs text-blue-600 mt-1">Checking pincode...</p>
              )}
              {pincodeStatus.status === 'serviceable' && pincodeStatus.info && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {pincodeStatus.info.area && `${pincodeStatus.info.area}, `}{pincodeStatus.info.city}, {pincodeStatus.info.state}
                </p>
              )}
              {pincodeStatus.status === 'not_serviceable' && (
                <p className="text-xs text-red-600 mt-1">Pincode not found</p>
              )}
            </div>
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('pincode', formData.pincode)}`}>
              {formData.pincode || <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            Address
            {isFieldMissing('address', formData.address) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter your complete address"
              className={`flex-1 md:w-full ${getFieldBorderClass('address', formData.address)}`}
            />
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('address', formData.address)}`}>
              {formData.address || <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            City *
            {isFieldMissing('city', formData.city) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <Input
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Enter city"
              className={`flex-1 md:w-full ${getFieldBorderClass('city', formData.city)}`}
            />
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('city', formData.city)}`}>
              {formData.city || <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">
            State *
            {isFieldMissing('state', formData.state) && (
              <span className="text-red-500 text-xs ml-1 hidden md:inline">(Required)</span>
            )}
          </label>
          {isEditing.basic ? (
            <Input
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              placeholder="Enter state"
              className={`flex-1 md:w-full ${getFieldBorderClass('state', formData.state)}`}
            />
          ) : (
            <div className={`flex-1 md:w-full px-3 py-2 bg-gray-50 border rounded-md text-gray-900 text-sm ${getFieldBorderClass('state', formData.state)}`}>
              {formData.state || <span className="text-red-500">Not provided</span>}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">Area</label>
          {isEditing.basic ? (
            <Input
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              placeholder="Enter area or locality"
              className="flex-1 md:w-full"
            />
          ) : (
            <div className="flex-1 md:w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm">
              {formData.area || 'Not provided'}
            </div>
          )}
        </div>
      </div>

      {/* Edit/Save Button - At Bottom */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => {
            if (isEditing.basic) {
              handleSave('basic');
            } else {
              setIsEditing(prev => ({ ...prev, basic: true }));
            }
          }}
          disabled={saving}
          size="lg"
          className={`${isEditing.basic ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-medium px-8 py-3`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : isEditing.basic ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )

  // Combined Services and Areas render function
  const renderServicesAndAreas = () => (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">Services & Coverage Areas</h3>
      </div>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Service Information</span>
          </CardTitle>
          <CardDescription>
            Select your primary service categories and specific services you offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Types (using ServiceTypePicker) - MOVED TO TOP */}
          <div>
            <ServiceTypePicker
              selected={formData.serviceTypes}
              onChange={(types) => {
                if (isEditing.services) {
                  setFormData(prev => ({ ...prev, serviceTypes: types }));
                }
              }}
              label="What services do you offer?"
              placeholder="Start typing — e.g. dance, therapy, birthday magician…"
              disabled={!isEditing.services}
            />
          </div>

          {/* Serviceable Pincodes - Multi-select */}
          <div>
            <PincodePicker
              selected={formData.serviceablePincodes}
              onChange={(pincodes) => {
                if (isEditing.services) {
                  setFormData(prev => ({ ...prev, serviceablePincodes: pincodes }));
                }
              }}
              label="Serviceable Pincodes"
              placeholder="Search by pincode, area, or city..."
              disabled={!isEditing.services}
            />
          </div>

          {/* Age Groups and Experience - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Groups You Serve *</label>
              <div className="grid grid-cols-2 gap-2">
              {ageGroups.map(ageGroup => (
                <label key={ageGroup} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.ageGroups.includes(ageGroup)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          ageGroups: [...prev.ageGroups, ageGroup]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          ageGroups: prev.ageGroups.filter(age => age !== ageGroup)
                        }));
                      }
                    }}
                    disabled={!isEditing.services}
                    className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                  />
                  <span className="text-xs font-medium text-gray-700">{ageGroup}</span>
                </label>
              ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                disabled={!isEditing.services}
                placeholder="Enter years of experience"
                min="0"
                max="50"
              />
            </div>
          </div>

          {/* Description and Qualifications - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={!isEditing.services}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                rows={4}
                placeholder="Describe your services, approach, and what makes you unique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications & Certifications</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                disabled={!isEditing.services}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                rows={4}
                placeholder="List your relevant qualifications, certifications, or training"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'].map(language => (
                <label key={language} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          languages: [...prev.languages, language]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          languages: prev.languages.filter(lang => lang !== language)
                        }));
                      }
                    }}
                    disabled={!isEditing.services}
                    className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                  />
                  <span className="text-xs font-medium text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Save Button - At Bottom */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => {
            if (isEditing.services) {
              handleSave('services');
            } else {
              setIsEditing(prev => ({ ...prev, services: true }));
            }
          }}
          disabled={saving}
          size="lg"
          className={`${isEditing.services ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-medium px-8 py-3`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : isEditing.services ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Services & Areas
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      {/* Edit/Save Button - Always Visible */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Service Information</h3>
          <Button
            onClick={() => {
              console.log('Services Edit button clicked, current isEditing.services:', isEditing.services);
              if (isEditing.services) {
                handleSave('services');
              } else {
                setIsEditing(prev => ({ ...prev, services: true }));
                console.log('Set services editing to true');
              }
            }}
            disabled={saving}
            size="sm"
            className={`${isEditing.services ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} font-medium px-4 py-2`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : isEditing.services ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Services
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary Service Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Service Categories *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoriesLoading ? (
            <div className="col-span-2 text-center py-4">Loading categories...</div>
          ) : (
            categories.map(category => (
              <label key={category.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.primaryCategories.includes(category.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ 
                        ...prev, 
                        primaryCategories: [...prev.primaryCategories, category.name],
                        specificServices: [] // Reset specific services when categories change
                      }));
                    } else {
                      setFormData(prev => ({ 
                        ...prev, 
                        primaryCategories: prev.primaryCategories.filter(c => c !== category.name),
                        specificServices: prev.specificServices.filter(service => {
                          // Remove services that belong to this category
                          const categorySubcategories = category.subcategories.flatMap(sub => 
                            sub.childSubcategories?.map(child => child.name) || [sub.name]
                          );
                          return !categorySubcategories.includes(service);
                        })
                      }));
                    }
                  }}
                  className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                  disabled={!isEditing.services}
                />
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Hierarchical Services (Subcategories and Child Subcategories) */}
      {formData.primaryCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specific Services *</label>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="grid grid-cols-1 gap-2">
              {formData.primaryCategories.map(categoryName => {
                const category = categories.find(cat => cat.name === categoryName);
                if (!category) return null;
                
                return (
                  <div key={category.id} className="mb-4">
                    <h4 className="font-medium text-[#578f82] mb-2">{category.name}</h4>
                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {category.subcategories.map(subcategory => (
                        <div key={subcategory.id} className="mb-3">
                          {/* Show subcategory name if it has child subcategories */}
                          {subcategory.childSubcategories && subcategory.childSubcategories.length > 0 ? (
                            <>
                              <h5 className="font-medium text-gray-600 text-sm mb-1">{subcategory.name}</h5>
                              <div className="grid grid-cols-1 gap-1 pl-3">
                                {subcategory.childSubcategories.map(childSub => (
                                  <label key={childSub.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={formData.specificServices.includes(childSub.name)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            specificServices: [...prev.specificServices, childSub.name]
                                          }));
                                        } else {
                                          setFormData(prev => ({ 
                                            ...prev, 
                                            specificServices: prev.specificServices.filter(s => s !== childSub.name)
                                          }));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                                      disabled={!isEditing.services}
                                    />
                                    <span className="text-sm text-gray-700">{childSub.name}</span>
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : (
                            /* Show subcategory as selectable if no child subcategories */
                            <label key={subcategory.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.specificServices.includes(subcategory.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      specificServices: [...prev.specificServices, subcategory.name]
                                    }));
                                  } else {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      specificServices: prev.specificServices.filter(s => s !== subcategory.name)
                                    }));
                                  }
                                }}
                                className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                                disabled={!isEditing.services}
                              />
                              <span className="text-sm text-gray-700">{subcategory.name}</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Age Groups */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age Groups You Serve *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ageGroups.map(ageGroup => (
            <label key={ageGroup} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.ageGroups.includes(ageGroup)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ 
                      ...prev, 
                      ageGroups: [...prev.ageGroups, ageGroup]
                    }));
                  } else {
                    setFormData(prev => ({ 
                      ...prev, 
                      ageGroups: prev.ageGroups.filter(ag => ag !== ageGroup)
                    }));
                  }
                }}
                className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
              />
              <span className="text-sm text-gray-700">{ageGroup}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
        <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-24 md:w-auto">Experience *</label>
        {isEditing.services ? (
          <select
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="flex-1 md:w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
          >
            <option value="">Select Experience</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-10">5-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        ) : (
          <div className="flex-1 md:w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 text-sm">
            {formData.experience ? `${formData.experience} years` : 'Not provided'}
          </div>
        )}
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'].map(language => (
            <label key={language} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.languages.includes(language)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, languages: [...prev.languages, language] }));
                  } else {
                    setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== language) }));
                  }
                }}
                className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
              />
              <span className="text-sm text-gray-700">{language}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Service Description */}
      <div className="flex flex-col md:flex-col gap-2 md:gap-0">
        <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2">Service Description *</label>
        {isEditing.services ? (
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
            placeholder="Describe your services and expertise..."
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 min-h-[100px] text-sm">
            {formData.description || 'Not provided'}
          </div>
        )}
      </div>

      {/* Qualifications */}
      <div className="flex flex-col md:flex-col gap-2 md:gap-0">
        <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2">Qualifications</label>
        {isEditing.services ? (
          <textarea
            value={formData.qualifications}
            onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
            placeholder="List your qualifications, certifications, etc."
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 min-h-[80px] text-sm">
            {formData.qualifications || 'Not provided'}
          </div>
        )}
      </div>
    </div>
  )

  const renderServiceAreas = () => (
    <div className="space-y-6">
      {/* Combined Service Coverage Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Service Coverage Area</span>
          </CardTitle>
          <CardDescription>
            Add pincodes and specific addresses where you provide services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Serviceable Pincodes Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Serviceable Pincodes</h4>
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="Enter pincode (e.g., 110001)"
                value={serviceAreas.newPincode}
                onChange={(e) => setServiceAreas(prev => ({ ...prev, newPincode: e.target.value }))}
                maxLength={6}
                pattern="[0-9]{6}"
              />
              <Button
                onClick={() => {
                  if (serviceAreas.newPincode.length === 6 && !serviceAreas.pincodes.includes(serviceAreas.newPincode)) {
                    setServiceAreas(prev => ({
                      ...prev,
                      pincodes: [...prev.pincodes, prev.newPincode],
                      newPincode: ''
                    }))
                  }
                }}
                disabled={serviceAreas.newPincode.length !== 6}
              >
                Add Pincode
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {serviceAreas.pincodes.map((pincode, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{pincode}</span>
                  <button
                    onClick={() => {
                      setServiceAreas(prev => ({
                        ...prev,
                        pincodes: prev.pincodes.filter((_, i) => i !== index)
                      }))
                    }}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Service Addresses Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Specific Service Addresses</h4>
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="Enter address or area name"
                value={serviceAreas.newAddress}
                onChange={(e) => setServiceAreas(prev => ({ ...prev, newAddress: e.target.value }))}
              />
              <Button
                onClick={() => {
                  if (serviceAreas.newAddress.trim() && !serviceAreas.addresses.includes(serviceAreas.newAddress.trim())) {
                    setServiceAreas(prev => ({
                      ...prev,
                      addresses: [...prev.addresses, prev.newAddress.trim()],
                      newAddress: ''
                    }))
                  }
                }}
                disabled={!serviceAreas.newAddress.trim()}
              >
                Add Address
              </Button>
            </div>
            
            <div className="space-y-2">
              {serviceAreas.addresses.map((address, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{address}</span>
                  <button
                    onClick={() => {
                      setServiceAreas(prev => ({
                        ...prev,
                        addresses: prev.addresses.filter((_, i) => i !== index)
                      }))
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={() => handleSave('areas')} 
        disabled={saving}
        className="w-full bg-[#578f82] hover:bg-[#4a7c70]"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Service Coverage
      </Button>
    </div>
  )

  const addNewDocument = () => {
    if (!newDocumentTitle.trim()) {
      toast.error('Please enter a document title')
      return
    }
    
    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newDocumentTitle.trim(),
      file: null,
      uploadedAt: new Date().toISOString(),
      uploading: false
    }
    
    setDynamicDocuments(prev => [...prev, newDoc])
    setNewDocumentTitle('')
  }

  const addDocumentWithFile = async (title: string, file: File) => {
    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      file: file,
      uploadedAt: new Date().toISOString(),
      uploading: true
    }
    
    setDynamicDocuments(prev => [...prev, newDoc])
    
    // Upload to R2
    const uploadedUrl = await uploadFileToR2(file, 'additional_document')
    
    if (uploadedUrl) {
      setDynamicDocuments(prev => 
        prev.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, uploadedUrl, uploading: false }
            : doc
        )
      )
    } else {
      // Upload failed, remove the document
      toast.error('Failed to upload document')
      setDynamicDocuments(prev => prev.filter(doc => doc.id !== newDoc.id))
    }
  }

  const removeDocument = (docId: string) => {
    setDynamicDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  const uploadFileToR2 = async (file: File, documentType: string, partnerId?: string): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)  // Backend expects 'file', not 'document'
      formData.append('type', documentType)  // Backend expects 'type', not 'documentType'

      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
      
      console.log('🚀 Uploading file to R2:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 50) + '...' : 'none'
      })
      
      // Debug: Try to decode the JWT token to see its structure
      if (token) {
        try {
          const parts = token.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            console.log('🔍 JWT payload structure:', payload)
          }
        } catch (e) {
          console.warn('Could not decode JWT:', e)
        }
      }
      
      const response = await fetch(`${apiUrl}/api/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Upload response error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('❌ Expected JSON but got:', text.substring(0, 200))
        throw new Error('Server returned HTML instead of JSON. Please check API endpoint.')
      }

      const result = await response.json()
      console.log('✅ Upload result:', result)

      if (result.success) {
        return result.url || result.fileUrl || result.document?.fileUrl
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('❌ File upload error:', error)
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  const uploadRequiredDocument = async (file: File, docType: 'panCard' | 'aadhaarCard') => {
    const docTypeMap = {
      panCard: 'pan_card',
      aadhaarCard: 'aadhaar_card'
    }
    
    setUploading(prev => ({ ...prev, [docType]: true }))
    
    const uploadedUrl = await uploadFileToR2(file, docTypeMap[docType])
    
    if (uploadedUrl) {
      setFormData(prev => ({ 
        ...prev, 
        documents: { ...prev.documents, [docType]: file } 
      }))
      setUploadedDocumentUrls(prev => ({ ...prev, [docType]: uploadedUrl }))
      toast.success(`${docType.replace(/([A-Z])/g, ' $1').trim()} uploaded successfully`)
      fetchDocuments()
    }
    
    setUploading(prev => ({ ...prev, [docType]: false }))
  }

  const updateDocumentFile = async (docId: string, file: File) => {
    // Set uploading state
    setDynamicDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, uploading: true } : doc
    ))
    
    // Find the document to get its title for upload
    const document = dynamicDocuments.find(doc => doc.id === docId)
    const documentType = document?.title.toLowerCase().replace(/\s+/g, '_') || 'additional_document'
    
    // Upload to R2
    const uploadedUrl = await uploadFileToR2(file, documentType)
    
    if (uploadedUrl) {
      // Update document with file and URL
      setDynamicDocuments(prev => prev.map(doc => 
        doc.id === docId ? { 
          ...doc, 
          file, 
          uploadedUrl, 
          uploading: false 
        } : doc
      ))
      toast.success(`${document?.title} uploaded successfully`)
      fetchDocuments() // Refresh documents list
    } else {
      // Reset uploading state on failure
      setDynamicDocuments(prev => prev.map(doc => 
        doc.id === docId ? { ...doc, uploading: false } : doc
      ))
    }
  }

  const renderDocuments = () => (
    <div className="space-y-4">
      {/* All Documents List */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-700">All Uploaded Documents</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={loadingDocuments}
          >
            {loadingDocuments ? (
              <Clock className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
        
        {loadingDocuments ? (
          <div className="text-center py-4">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-600">Loading documents...</p>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc, index) => (
              <div key={doc.id || index} className="bg-white rounded-lg border p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 capitalize">
                      {doc.document_type?.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()) || 'Document'}
                    </h5>
                    <p className="text-xs text-gray-500 mt-1">{doc.file_name}</p>
                  </div>
                  <Badge 
                    variant={doc.verification_status === 'verified' ? 'default' : 'secondary'}
                    className={`text-xs ${doc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : ''}`}
                  >
                    {doc.verification_status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {doc.verification_status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                    {doc.verification_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {doc.verification_status || 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Size: {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown'}</span>
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown date'}</span>
                </div>
                {doc.document_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      const viewUrl = doc.document_url.startsWith('http') 
                        ? doc.document_url 
                        : `${import.meta.env.VITE_API_BASE_URL}/api/documents/view/${encodeURIComponent(doc.document_url)}`;
                      window.open(viewUrl, '_blank');
                    }}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        )}
      </div>


      {/* Dynamic Documents */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700">Additional Documents</h4>
          <span className="text-xs text-gray-500">PAN, DL, Voter ID, etc.</span>
        </div>

        {/* Document Type Selector */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm"
            >
              <option value="">Select Document Type</option>
              <option value="pan">PAN Card</option>
              <option value="gst_additional">GST Certificate</option>
              <option value="driving_license">Driving License</option>
              <option value="voter_id">Voter ID Card</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* PAN Verification */}
          {selectedDocumentType === 'pan' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <label className="block text-sm font-medium text-gray-700">PAN Verification</label>
                {isPanVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
                    setPanNumber(value);
                  }}
                  disabled={isPanVerified || panStatus === 'verifying'}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${isPanVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                  placeholder="Enter PAN Number"
                  maxLength={10}
                />
                {!isPanVerified && (
                  <button
                    onClick={handlePanVerify}
                    disabled={panNumber.length !== 10 || panStatus === 'verifying'}
                    className="bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {panStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Document Upload for DL, Voter ID, Others */}
          {(selectedDocumentType === 'driving_license' || selectedDocumentType === 'voter_id' || selectedDocumentType === 'others') && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {selectedDocumentType === 'driving_license' ? 'Driving License' : selectedDocumentType === 'voter_id' ? 'Voter ID Card' : 'Document'}
              </label>
              {selectedDocumentType === 'others' && (
                <Input
                  placeholder="Enter document name (e.g., Certificate)"
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  className="mb-2 text-sm"
                />
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const docTitle = selectedDocumentType === 'others' ? newDocumentTitle : 
                                   selectedDocumentType === 'driving_license' ? 'Driving License' : 'Voter ID Card';
                    if (selectedDocumentType === 'others' && !docTitle.trim()) {
                      toast.error('Please enter document name first');
                      e.target.value = '';
                      return;
                    }
                    addDocumentWithFile(docTitle, file);
                    setSelectedDocumentType('');
                    setNewDocumentTitle('');
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#578f82] file:text-white hover:file:bg-[#4a7c70]"
              />
            </div>
          )}
        </div>

        {/* Dynamic Documents List */}
        {dynamicDocuments.length > 0 ? (
          <div className="space-y-2 mt-4">
            {dynamicDocuments.map((doc) => (
              <div key={doc.id} className="bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{doc.title}</span>
                    </div>
                    {doc.uploading && (
                      <p className="text-xs text-blue-600 mt-1">⏳ Uploading to R2...</p>
                    )}
                    {doc.file && !doc.uploading && (
                      <p className="text-xs text-green-600 mt-1">✓ {doc.file.name} (Uploaded to R2)</p>
                    )}
                    {!doc.file && doc.uploadedUrl && !doc.uploading && (
                      <p className="text-xs text-green-600 mt-1">✓ Previously uploaded to R2</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 mt-4">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No additional documents added yet</p>
            <p className="text-xs">Select document type above to add</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <Button 
        onClick={() => handleSave('documents')} 
        disabled={saving}
        className="w-full md:w-auto bg-[#578f82] hover:bg-[#4a7c70]"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Documents
      </Button>
    </div>
  )

  const renderBanking = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">Acc Holder *</label>
          <Input
            value={formData.accountHolder}
            onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
            placeholder="Enter account holder name"
            className="flex-1 md:w-full"
          />
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">Bank Name *</label>
          <Input
            value={formData.bankName}
            onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
            placeholder="Enter bank name"
            className="flex-1 md:w-full"
          />
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">Acc Number *</label>
          <Input
            value={formData.accountNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
            placeholder="Enter account number"
            className="flex-1 md:w-full"
          />
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">IFSC Code *</label>
          <Input
            value={formData.ifscCode}
            onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
            placeholder="Enter IFSC code"
            className="flex-1 md:w-full"
          />
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">Acc Type</label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
            className="flex-1 md:w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Select Account Type</option>
            <option value="savings">Savings</option>
            <option value="current">Current</option>
          </select>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0">
          <label className="text-xs md:text-sm font-medium text-gray-700 md:mb-2 whitespace-nowrap flex-shrink-0 w-28 md:w-auto">UPI ID</label>
          <Input
            value={formData.upiId}
            onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
            placeholder="Enter UPI ID (optional)"
            className="flex-1 md:w-full"
          />
        </div>
      </div>

      <Button 
        onClick={() => handleSave('banking')} 
        disabled={saving}
        className="w-full md:w-auto"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Banking Information
      </Button>
    </div>
  )

  const handlePasswordChange = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken')
      
      if (!token) {
        toast.error('Please login again')
        return false
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword: newPassword
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Password updated successfully!')
        return true
      } else {
        toast.error(result.message || 'Failed to update password')
        return false
      }
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
      return false
    }
  }

  const renderSecurity = () => (
    <SecurityTab
      userEmail={user?.email || formData.email}
      onPasswordChange={handlePasswordChange}
    />
  )


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20 sm:pb-0 min-h-screen bg-[#faf8f5]">
      {/* Modern Profile Header */}
      <div className="bg-white sm:rounded-xl border-b sm:border border-gray-200 shadow-sm p-4 sm:p-6 mx-0 sm:mx-4 mt-0 sm:mt-4">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center space-x-3">
            {/* Profile Picture with Circular Progress */}
            <div className="relative flex-shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90 absolute" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getCompletionPercentage() >= 90 ? '#10b981' :
                           getCompletionPercentage() >= 70 ? '#f59e0b' :
                           '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${getCompletionPercentage()}, 100`}
                    className="transition-all duration-500"
                  />
                </svg>
                
                <div className="relative">
                  {/* Circular progress ring around profile picture */}
                  <div className="relative w-20 h-20">
                    <svg className="absolute inset-0 w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                      {/* Background circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - getCompletionPercentage() / 100)}`}
                        className={`transition-all duration-500 ${
                          getCompletionPercentage() >= 90 ? 'text-green-500' :
                          getCompletionPercentage() >= 70 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Profile picture */}
                    <div 
                      onClick={() => setShowProfileImageModal(true)}
                      className="w-16 h-16 border-4 border-white shadow-lg absolute top-2 left-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {profileData?.profile_image_url ? (
                        <Avatar className="w-full h-full">
                          <AvatarImage 
                            src={profileData?.profile_image_url} 
                            key={profileData?.profile_image_url}
                            onLoad={() => console.log('🖼️ Profile image loaded:', profileData?.profile_image_url)}
                            onError={() => console.log('❌ Profile image failed to load:', profileData?.profile_image_url)}
                          />
                          <AvatarFallback className="bg-[#578f82] text-white font-semibold text-lg">
                            {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-full h-full bg-[#578f82] rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Completion percentage text */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white px-2 py-1 rounded-full shadow-lg border border-gray-200">
                        <span className={`text-xs font-bold ${
                          getCompletionPercentage() >= 90 ? 'text-green-600' :
                          getCompletionPercentage() >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {getCompletionPercentage()}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{formData.fullName || 'Complete your name'}</h2>
              <p className="text-gray-600 text-sm truncate mt-0.5">{formData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getCompletionPercentage() === 100 ? "default" : "secondary"} className="text-xs h-6 px-2.5">
                  {getCompletionPercentage() === 100 ? 'Complete' : 'Incomplete'}
                </Badge>
                {getCompletionPercentage() === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle 
                    className="w-4 h-4 text-yellow-500 cursor-pointer hover:text-yellow-600 transition-colors" 
                    onClick={() => setShowIncompleteFieldsModal(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-6 flex-1 min-w-0">
            {/* Profile Picture with Circular Progress */}
            <div className="relative flex-shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90 absolute" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getCompletionPercentage() >= 90 ? '#10b981' :
                           getCompletionPercentage() >= 70 ? '#f59e0b' :
                           '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${getCompletionPercentage()}, 100`}
                    className="transition-all duration-500"
                  />
                </svg>
                
                <div 
                  onClick={() => setShowProfileImageModal(true)}
                  className="w-16 h-16 border-4 border-white shadow-lg absolute top-2 left-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {profileData?.profile_image_url ? (
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={profileData?.profile_image_url} 
                        key={profileData?.profile_image_url}
                        onLoad={() => console.log('🖼️ Desktop profile image loaded:', profileData?.profile_image_url)}
                        onError={() => console.log('❌ Desktop profile image failed to load:', profileData?.profile_image_url)}
                      />
                      <AvatarFallback className="bg-[#578f82] text-white font-semibold text-lg">
                        {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-full h-full bg-[#578f82] rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Completion percentage badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-lg">
                  <span className={`text-xs font-bold ${
                    getCompletionPercentage() >= 90 ? 'text-green-600' :
                    getCompletionPercentage() >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getCompletionPercentage()}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">{formData.fullName || 'Complete your name'}</h2>
              <p className="text-gray-600 text-sm truncate mt-1">{formData.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getCompletionPercentage() === 100 ? "default" : "secondary"} className="text-xs">
                  {getCompletionPercentage() === 100 ? 'Complete' : 'Incomplete'}
                </Badge>
                {getCompletionPercentage() === 100 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle 
                    className="w-4 h-4 text-yellow-500 cursor-pointer hover:text-yellow-600 transition-colors" 
                    onClick={() => setShowIncompleteFieldsModal(true)}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-lg font-semibold text-gray-600">Profile Status</div>
            <div className={`text-sm font-medium ${
              getCompletionPercentage() === 100 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {getCompletionPercentage() === 100 ? 'Complete' : `${100 - getCompletionPercentage()}% remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const tabCompletion = getTabCompletion(tab.id)
            const hasIncompleteFields = !tabCompletion.isComplete
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-1 py-3 px-4 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#578f82] text-[#578f82] bg-[#578f82]/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                
                {/* Yellow dot for incomplete fields */}
                {hasIncompleteFields && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Compact Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 animate-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
        <div className="p-3 sm:p-4 md:p-6">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'services' && renderServicesAndAreas()}
          {activeTab === 'banking_documents' && renderBankingDocuments()}
          {activeTab === 'security' && renderSecurity()}
        </div>
      </div>

      {/* Profile Image Upload Modal */}
      {showProfileImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#578f82]">Update Profile Photo</h3>
              <button
                onClick={() => setShowProfileImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <LivenessCheck
              onVerified={async (imageBase64: string) => {
                console.log('✅ Profile image captured via LivenessCheck');
                console.log('📊 Image data received - Length:', imageBase64.length);
                console.log('🔍 Image data preview:', imageBase64.substring(0, 50));
                
                try {
                  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                  if (!token) {
                    toast.error('Please login again');
                    return;
                  }

                  console.log('🔄 Converting base64 to blob...');
                  // Convert base64 to blob for upload
                  const response = await fetch(imageBase64);
                  const blob = await response.blob();
                  console.log('📦 Blob created - Size:', blob.size, 'Type:', blob.type);
                  
                  // Create FormData for file upload
                  const formData = new FormData();
                  formData.append('image', blob, 'profile-image.jpg');

                  console.log('📤 Uploading to R2 storage...');
                  // Upload to R2 via profile picture endpoint
                  const uploadResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/profile-picture`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                    body: formData
                  });
                  
                  const result = await uploadResponse.json();
                  console.log('📥 Upload response:', result);
                  
                  if (result.success) {
                    console.log('✅ Upload successful! Image URL:', result.imageUrl);
                    
                    // Add cache-busting parameter to force image refresh
                    const imageUrlWithCacheBust = `${result.imageUrl}?t=${Date.now()}`;
                    
                    // Update local state with R2 URL
                    setProfileData((prev: any) => ({
                      ...prev,
                      profile_image_url: imageUrlWithCacheBust
                    }));
                    
                    console.log('🔄 Refreshing profile data from backend...');
                    // Refresh profile data from backend
                    await fetchProfileData();
                    
                    console.log('🎉 Profile image update complete!');
                    toast.success('Profile image updated successfully!');
                    setShowProfileImageModal(false);
                  } else {
                    console.error('❌ Upload failed:', result);
                    toast.error(result.message || 'Failed to save profile image');
                  }
                } catch (error) {
                  console.error('💥 Error uploading profile image:', error);
                  toast.error('Failed to save profile image');
                }
              }}
              onCancel={() => setShowProfileImageModal(false)}
            />
          </div>
        </div>
      )}

      {/* Incomplete Fields Modal */}
      {showIncompleteFieldsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">Incomplete Fields</h3>
              </div>
              <button
                onClick={() => setShowIncompleteFieldsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Complete these fields to improve your profile and get more bookings:
              </p>
              
              {getAllIncompleteFields().map((tabInfo, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>{tabInfo.tabName}</span>
                  </h4>
                  <ul className="space-y-1">
                    {tabInfo.fields.map((field, fieldIndex) => (
                      <li key={fieldIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {getAllIncompleteFields().length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">All fields completed!</p>
                  <p className="text-sm text-gray-600">Your profile is 100% complete.</p>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => setShowIncompleteFieldsModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                {getAllIncompleteFields().length > 0 && (
                  <Button
                    onClick={() => {
                      setShowIncompleteFieldsModal(false)
                      // Navigate to first incomplete tab
                      const firstIncompleteTab = tabs.find(tab => !getTabCompletion(tab.id).isComplete)
                      if (firstIncompleteTab) {
                        setActiveTab(firstIncompleteTab.id)
                      }
                    }}
                    className="flex-1 bg-[#578f82] hover:bg-[#4a7c70]"
                  >
                    Complete Fields
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TabbedProfile
