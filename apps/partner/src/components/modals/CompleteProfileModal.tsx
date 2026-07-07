import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Check, User, FileText, CreditCard, Calendar, MapPin, AlertTriangle, Camera, ExternalLink, CheckCircle, Copy } from 'lucide-react';
import LivenessCheck from '../LivenessCheck/LivenessCheck';
import DocumentUpload from '../DocumentUpload';
import ProfileImagePreview from '../ProfileImagePreview';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { getCategories, ServiceCategory, ServiceSubcategory } from '../../api/categories';
import CompleteProfileModalStep2 from './CompleteProfileModalStep2';
import { ServiceType, listServiceTypes } from '../../api/serviceTypes';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  canClose?: boolean;
  mode?: 'partner' | 'admin'; // 'partner' for complete profile, 'admin' for add new partner
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false,
  canClose = false, // Default to false - no close button
  mode = 'partner'
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showBlinkCapture, setShowBlinkCapture] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  
  // Progress & Autosave States
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [lastCompletedStep, setLastCompletedStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [pincodeStatus, setPincodeStatus] = useState<{
    status: 'idle'|'checking'|'serviceable'|'not_serviceable', 
    info?: {city?: string, state?: string, area?: string}
  }>({ status: 'idle' });
  
  const [emailStatus, setEmailStatus] = useState<{
    status: 'idle'|'checking'|'available'|'taken'
  }>({ status: 'idle' });

  // Phone availability — used in admin mode while typing the partner's number.
  const [phoneStatus, setPhoneStatus] = useState<{
    status: 'idle'|'checking'|'available'|'taken'|'invalid'
  }>({ status: 'idle' });

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Pincode management states
  const [pincodeSearch, setPincodeSearch] = useState('');
  const [availablePincodes, setAvailablePincodes] = useState<any[]>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [showPincodeDropdown, setShowPincodeDropdown] = useState(false);
  
  // Initialize form data with pre-populated categories from localStorage.
  // The landing page's category-card picker writes:
  //   kuddl_partner_categories       (string[] of 'adventure'/'bloom'/'care'/'discover')
  //   kuddl_partner_subcategories    (string[] of human-readable labels + "Other (…)" entries)
  //   kuddl_partner_service_types    (string[] of registry IDs)
  // The legacy `selectedCategories` key is still read for older sessions.
  const initializeFormData = () => {
    // Admin mode: never pre-populate from localStorage (stale data from previous partner sessions)
    if (mode === 'admin') {
      return {
        primaryCategories: [] as string[],
        specificServices: [] as string[],
        serviceTypeIds: [] as string[],
      };
    }

    let prePopulatedCategories = {
      primaryCategories: [] as string[],
      specificServices: [] as string[],
      serviceTypeIds: [] as string[],
    };

    try {
      const cats = localStorage.getItem('kuddl_partner_categories');
      const subs = localStorage.getItem('kuddl_partner_subcategories');
      const stypes = localStorage.getItem('kuddl_partner_service_types');
      if (cats) prePopulatedCategories.primaryCategories = (JSON.parse(cats) as string[]).map((c) => c.toUpperCase());
      if (subs) prePopulatedCategories.specificServices = JSON.parse(subs);
      if (stypes) prePopulatedCategories.serviceTypeIds = JSON.parse(stypes);
    } catch (e) {
      console.warn('Failed to parse kuddl_partner_* keys:', e);
    }

    // Back-compat: legacy `selectedCategories` JSON written by the previous flow.
    if (
      prePopulatedCategories.primaryCategories.length === 0 &&
      prePopulatedCategories.specificServices.length === 0
    ) {
      const selectedCategoriesData = localStorage.getItem('selectedCategories');
      if (selectedCategoriesData) {
        try {
          const categoryData = JSON.parse(selectedCategoriesData);
          if (categoryData.mainCategory?.module) {
            prePopulatedCategories.primaryCategories = [categoryData.mainCategory.module];
          }
          if (categoryData.subcategories && categoryData.subcategories.length > 0) {
            prePopulatedCategories.specificServices = categoryData.subcategories;
          }
        } catch (error) {
          console.warn('Failed to parse selected categories:', error);
        }
      }
    }

    return prePopulatedCategories;
  };

  const prePopulated = initializeFormData();

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    email: '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: '',
    city: '',
    state: '',
    area: '',
    pincode: '',
    address: '',
    profileImage: null as File | null,
    
    // Step 2: Service Details
    primaryCategories: prePopulated.primaryCategories,
    specificServices: prePopulated.specificServices,
    serviceTypes: [] as ServiceType[],
    ageGroups: [] as string[],
    experience: '',
    qualifications: '',
    description: '',
    languages: [] as string[],
    serviceablePincodes: [] as string[], // Add serviceable pincodes
    
    // Step 3: Availability Settings
    partnerType: 'solo' as 'solo' | 'academy',
    bufferTimeMinutes: 30,
    calendarSyncEnabled: false,
    googleCalendarId: '',
    icalUrl: '',
    workingHours: [
      { dayOfWeek: 0, isAvailable: false, startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' }, // Sunday
      { dayOfWeek: 1, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' }, // Monday
      { dayOfWeek: 2, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' }, // Tuesday
      { dayOfWeek: 3, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' }, // Wednesday
      { dayOfWeek: 4, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' }, // Thursday
      { dayOfWeek: 5, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' }, // Friday
      { dayOfWeek: 6, isAvailable: true, startTime: '10:00', endTime: '18:00', breakStartTime: '', breakEndTime: '' }, // Saturday
    ],
    batchTimings: [] as Array<{
      batchName: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      maxCapacity: number;
      isActive: boolean;
    }>,
    
    // Step 4: Verification & Banking Details
    documents: {
      panCard: null as File | null,
      aadhaarCard: null as File | null,
    },
    accountHolder: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: '',
    upiId: '',
    aadhaarNumber: '',
    aadhaarOtp: '',
    isAadhaarVerified: false,
    panNumber: '',
    isPanVerified: false,
    gstNumber: '',
    isGstVerified: false,
  });

  const [aadhaarStatus, setAadhaarStatus] = useState<'idle' | 'authenticating' | 'awaiting_verification' | 'verifying' | 'verified' | 'failed'>('idle');
  const [aadhaarRequestId, setAadhaarRequestId] = useState<string>('');
  const [aadhaarData, setAadhaarData] = useState<any>(null); // Store Aadhaar verification response data
  const [panStatus, setPanStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [gstStatus, setGstStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [bankVerificationStatus, setBankVerificationStatus] = useState<'idle' | 'verifying_ifsc' | 'verifying_account' | 'verified' | 'failed'>('idle');

  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  const CASHFREE_BASE_URL = import.meta.env.VITE_CASHFREE_BASE_URL || import.meta.env.CASHFREE_BASE_URL;
  const CASHFREE_APPID = import.meta.env.VITE_CASHFREE_APPID || import.meta.env.CASHFREE_APPID;

  const handleSendAadhaarOtp = async () => {
    if (formData.aadhaarNumber.length !== 12) {
      toast.error('Please enter valid 12-digit Aadhaar number');
      return;
    }

    setAadhaarStatus('authenticating');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/aadhaar/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          aadhaar_number: formData.aadhaarNumber
        })
      });

      const data = await response.json();
      console.log('Aadhaar OTP send response:', data);

      if (data.success) {
        setAadhaarRequestId(data.request_id);
        setAadhaarStatus('awaiting_verification');
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

  const handleVerifyAadhaarOtp = async () => {
    if (!aadhaarRequestId || !formData.aadhaarOtp) {
      toast.error('Please enter OTP');
      return;
    }

    setAadhaarStatus('verifying');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/aadhaar/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          request_id: String(aadhaarRequestId), // Convert to string as per Sandbox API docs
          otp: String(formData.aadhaarOtp) // Convert to string as per Sandbox API docs
        })
      });

      const data = await response.json();
      console.log('Aadhaar OTP verification response:', data);

      if (data.success) {
        setAadhaarStatus('verified');
        setFormData(prev => ({ ...prev, isAadhaarVerified: true }));
        
        // Store Aadhaar data including photo
        if (data.aadhaar_data) {
          setAadhaarData(data.aadhaar_data);
          console.log('Aadhaar verification data:', data.aadhaar_data);
        }
        
        toast.success('Aadhaar verified successfully');
      } else {
        setAadhaarStatus('failed');
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('Aadhaar Verify OTP error:', error);
      setAadhaarStatus('failed');
      toast.error('Verification service unavailable');
    }
  };

  const handlePanVerify = async () => {
    if (formData.panNumber.length !== 10) {
      toast.error('Please enter valid 10-character PAN number');
      return;
    }

    setPanStatus('verifying');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/pan/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          pan_number: formData.panNumber,
          name: formData.fullName
        })
      });

      const data = await response.json();

      if (data.success) {
        setPanStatus('verified');
        setFormData(prev => ({ ...prev, isPanVerified: true }));
        toast.success(`PAN verified: ${data.data?.registered_name || 'Success'}`);
      } else {
        setPanStatus('failed');
        toast.error(data.message || 'PAN verification failed');
      }
    } catch (error: any) {
      console.error('PAN Verify error:', error);
      setPanStatus('failed');
      toast.error('Verification service unavailable');
    }
  };


  const handleGstVerify = async (gstInput?: string) => {
    const gstToVerify = typeof gstInput === 'string' ? gstInput : formData.gstNumber;

    if (gstToVerify.length !== 15) {
      if (!gstInput) toast.error('Please enter valid 15-character GST number');
      return;
    }

    setGstStatus('verifying');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/kyc/gst/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gst_number: gstToVerify })
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, isGstVerified: true }));
        setGstStatus('verified');
        toast.success(`GST verified: ${data.data?.legal_name || data.data?.trade_name || 'Success'}`);
      } else {
        setGstStatus('failed');
        toast.error(data.message || data.error || 'GST verification failed');
      }
    } catch (error) {
      console.error('GST Verify error:', error);
      setGstStatus('failed');
      toast.error('Verification service unavailable');
    }
  };

  const handleIfscLookup = async (ifscCode: string) => {
    if (ifscCode.length !== 11) return;

    setBankVerificationStatus('verifying_ifsc');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL}/api/bank/ifsc/${ifscCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          bankName: data.data.BANK || '',
          branchName: data.data.BRANCH || ''
        }));
        setBankVerificationStatus('idle');
        toast.success(`Bank details found: ${data.data.BANK} - ${data.data.BRANCH}`);
      } else {
        setBankVerificationStatus('failed');
        toast.error(data.message || 'Invalid IFSC code or bank details not found');
      }
    } catch (error) {
      console.error('IFSC lookup error:', error);
      setBankVerificationStatus('failed');
      toast.error('Failed to lookup bank details');
    }
  };


  // Update phone number when user data is available
  useEffect(() => {
    if (user?.phone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone }));
    }
  }, [user?.phone, formData.phone]);

  // First-run hydration of serviceTypes from the landing-page selection
  // (kuddl_partner_service_types in localStorage). This pre-ticks the same
  // sub-categories on step 2 even before any profile data is fetched.
  useEffect(() => {
    if (!isOpen) return;
    if (formData.serviceTypes.length > 0) return;
    const raw = prePopulated.serviceTypeIds;
    if (!raw || raw.length === 0) return;
    (async () => {
      try {
        const all = await listServiceTypes();
        const picked = all.filter((st) => raw.includes(st.id));
        if (picked.length > 0) {
          setFormData((prev: any) => ({ ...prev, serviceTypes: picked }));
        }
      } catch (e) {
        console.warn('Failed to hydrate serviceTypes from landing selection:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch categories and existing profile data when component mounts
  useEffect(() => {
    if (!isOpen) {
      // Reset loading state for next open
      setIsLoadingProfile(true);
      setCurrentStep(1); // Reset step back to 1
      return;
    }

    const fetchCategoriesAndProfile = async () => {
      console.log('🔄 [CompleteProfileModal] Starting to fetch categories and profile...');
      setCategoriesLoading(true);
      setIsLoadingProfile(true); // Force loading immediately
      
      try {
        // Fetch categories
        const fetchedCategories = await getCategories();
        console.log('✅ [CompleteProfileModal] Categories fetched:', fetchedCategories);
        setCategories(fetchedCategories);

        // Fetch existing profile data — only meaningful in partner mode. Admin is creating
        // a fresh partner so there's no provider row to pre-fill from, and calling
        // /api/partner/profile with an admin token would 401 with "no phone number found".
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (token && mode !== 'admin') {
          const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

          // Use the main profile endpoint
          const profileResponse = await fetch(`${API_BASE_URL}/api/partner/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('📋 [CompleteProfileModal] Existing profile data:', profileData);
            
            if (profileData.success && profileData.data) {
              const profile = profileData.data;
              
              // Prepare restored data correctly mapping db columns to frontend fields
              const restoredData = {
                phone: profile.phone || '',
                email: profile.email || '',
                fullName: profile.name || (profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : (profile.first_name || profile.full_name || '')),
                city: profile.city || '',
                state: profile.state || '',
                area: profile.area || '',
                pincode: profile.pincode || '',
                address: profile.address || '',
                dateOfBirth: profile.date_of_birth || '',
                gender: profile.gender || '',
                experience: profile.experience_years?.toString() || '',
                description: profile.bio || profile.description || '',
                languages: profile.languages ? profile.languages.split(',') : [],
                ageGroups: profile.age_groups ? profile.age_groups.split(',') : [],
                // Pre-populate categories from database
                primaryCategories: profile.service_categories 
                  ? profile.service_categories.split(',') 
                  : [],
                specificServices: profile.specific_services 
                  ? profile.specific_services.split(',') 
                  : [],
                serviceablePincodes: profile.serviceable_pincodes ? JSON.parse(profile.serviceable_pincodes) : [],
                partnerType: profile.partner_type || 'solo',
                bufferTimeMinutes: profile.buffer_time_minutes || 30,
                workingHours: profile.working_hours ? JSON.parse(profile.working_hours) : [
                  { dayOfWeek: 0, isAvailable: false, startTime: '09:00', endTime: '17:00', breakStartTime: '', breakEndTime: '' },
                  { dayOfWeek: 1, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
                  { dayOfWeek: 2, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
                  { dayOfWeek: 3, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
                  { dayOfWeek: 4, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
                  { dayOfWeek: 5, isAvailable: true, startTime: '09:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
                  { dayOfWeek: 6, isAvailable: true, startTime: '10:00', endTime: '18:00', breakStartTime: '', breakEndTime: '' },
                ],
                batchTimings: profile.batch_timings ? JSON.parse(profile.batch_timings) : [],
                isAadhaarVerified: profile.is_aadhaar_verified === 1 || profile.kyc_status === 'verified',
                isPanVerified: profile.is_pan_verified === 1 || profile.kyc_status === 'verified',
                isGstVerified: profile.is_gst_verified === 1 || profile.kyc_status === 'verified',
              };

              // Pre-populate form with existing data
              setFormData(prev => ({
                ...prev,
                ...restoredData
              }));

              // Hydrate serviceTypes from profile.service_types (CSV of registry IDs).
              if (profile.service_types && typeof profile.service_types === 'string' && profile.service_types.trim()) {
                const ids = profile.service_types.split(',').map((s: string) => s.trim()).filter(Boolean);
                if (ids.length > 0) {
                  try {
                    const all = await listServiceTypes();
                    const picked = all.filter((st) => ids.includes(st.id));
                    setFormData((prev: any) => ({ ...prev, serviceTypes: picked }));
                  } catch (e) {
                    console.warn('Failed to hydrate service_types', e);
                  }
                }
              }
              
              console.log('✅ [CompleteProfileModal] Form pre-populated with profile data', restoredData);
              
              if (profile.email) {
                setEmailStatus({ status: 'available' });
              }

              // Evaluate progress dynamically based on completed fields
              let firstIncompleteStep = 1;
              
              // Check Step 1: Basic Info
              const step1Complete = Boolean(
                restoredData.fullName && 
                restoredData.email && 
                restoredData.pincode && 
                restoredData.city && 
                restoredData.state && 
                restoredData.dateOfBirth && 
                restoredData.gender
              );
              
              // Check Step 2: Services — a returning partner with service_types or legacy categories counts as done.
              const hasLegacyServices = restoredData.primaryCategories.length > 0 && restoredData.specificServices.length > 0;
              const hasServiceTypes = typeof profile.service_types === 'string' && profile.service_types.trim().length > 0;
              const step2Complete = Boolean(
                (hasServiceTypes || hasLegacyServices) &&
                restoredData.ageGroups.length > 0 &&
                restoredData.experience &&
                restoredData.description &&
                restoredData.languages.length > 0
              );
              
              // Step 3 (was Availability) is removed from signup — partners configure availability later from the Dashboard.
              // Verification & Banking is now Step 3.
              const step3Complete = Boolean(restoredData.isAadhaarVerified);

              if (!step1Complete) {
                firstIncompleteStep = 1;
              } else if (!step2Complete) {
                firstIncompleteStep = 2;
              } else if (!step3Complete) {
                firstIncompleteStep = 3;
              } else {
                firstIncompleteStep = 3;
              }

              console.log(`🎯 Step completion status:`, {
                step1Complete,
                step2Complete,
                step3Complete,
                firstIncompleteStep,
                savedStep: profile.last_completed_step
              });

              // Use saved step if available, otherwise use calculated step.
              // Map a legacy savedStep of 4 (old Verification) down to 3.
              const savedStep = profile.last_completed_step ? Math.floor(Number(profile.last_completed_step)) : 0;
              const cappedSavedStep = Math.min(savedStep, 3);
              const resumeStep = cappedSavedStep > 0 ? Math.min(cappedSavedStep + 1, 3) : firstIncompleteStep;
              
              setCurrentStep(resumeStep);
              setLastCompletedStep(savedStep);
              
              if (resumeStep > 1) {
                toast.success(`Resuming from step ${resumeStep}`);
              }
              
              // Delay turning off loading to ensure state is committed
              setTimeout(() => {
                setIsLoadingProfile(false);
              }, 800);
            } else {
              setIsLoadingProfile(false);
            }
          } else {
            setIsLoadingProfile(false);
          }
        } else {
           setIsLoadingProfile(false);
        }
      } catch (error) {
        console.error('❌ [CompleteProfileModal] Failed to fetch categories or profile:', error);
        toast.error('Failed to load service categories');
        setIsLoadingProfile(false);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) {
      console.log('📂 [CompleteProfileModal] Modal opened, fetching categories and profile...');
      setIsLoadingProfile(true);
      fetchCategoriesAndProfile();
    }
  }, [isOpen, user?.phone]);

  // Pincode search functionality
  const searchPincodes = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setAvailablePincodes([]);
      return;
    }

    setPincodeLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/api/pincodes/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success && data.results) {
        setAvailablePincodes(data.results);
      } else {
        setAvailablePincodes([]);
      }
    } catch (error) {
      console.error('Pincode search error:', error);
      setAvailablePincodes([]);
    } finally {
      setPincodeLoading(false);
    }
  }, 300);

  // Handle pincode selection
  const handlePincodeSelect = (pincode: any) => {
    const pincodeValue = pincode.pincode;
    if (!formData.serviceablePincodes.includes(pincodeValue)) {
      setFormData(prev => ({
        ...prev,
        serviceablePincodes: [...prev.serviceablePincodes, pincodeValue]
      }));
    }
    setPincodeSearch('');
    setAvailablePincodes([]);
    setShowPincodeDropdown(false);
  };

  // Remove selected pincode
  const removePincode = (pincodeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      serviceablePincodes: prev.serviceablePincodes.filter(p => p !== pincodeToRemove)
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.pincode-search-container')) {
        setShowPincodeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NOTE: Availability/batch-timing step has been removed from signup.
  // Partners configure availability later from the Dashboard → Availability page.
  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Services', icon: FileText },
    { id: 3, title: 'Verification & Banking', icon: CreditCard }
  ];

  // Dynamic service categories from API
  const serviceCategories = categories.reduce((acc, category) => {
    acc[category.name] = category.subcategories.map(sub => sub.name);
    return acc;
  }, {} as Record<string, string[]>);

  const ageGroups = [
    'Newborn (0-3 months)',
    'Infant (3-12 months)',
    'Toddler (1-3 years)',
    'Preschooler (3-5 years)',
    'School Age (5-12 years)',
    'Teen (12+ years)',
    'All Ages'
  ];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'];

  // Generate temp password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Utility function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Validation functions
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        // Profile image is optional, address is required.
        // In admin mode the phone is entered here (no OTP); require sane format
        // AND availability check to pass (idle = not yet checked).
        const phoneFormatOk = mode === 'admin'
          ? /^[+]?\d[\d\s-]{7,14}$/.test((formData.phone || '').trim())
          : true;
        const phoneOk = mode === 'admin'
          ? phoneFormatOk && phoneStatus.status === 'available'
          : true;
        return !!(formData.fullName && formData.email && formData.pincode &&
                 formData.city && formData.state && formData.dateOfBirth && formData.gender &&
                 formData.address &&
                 phoneOk &&
                 emailStatus.status === 'available');
      }
      case 2:
        return !!(formData.serviceTypes.length > 0 &&
                 formData.ageGroups.length > 0 && formData.experience && formData.description && formData.languages.length > 0);
      case 3:
        // Verification & Banking — Aadhaar verification is required for partner mode,
        // but optional when admin creates a partner (admin mode).
        if (mode === 'admin') {
          // Admin mode: Aadhaar is optional, just need to have entered it if verifying
          return true;
        }
        // Partner mode: Aadhaar verification is mandatory
        return formData.isAadhaarVerified;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      // Save current step progress to backend (partner mode only). In admin mode we
      // don't have a provider row yet — everything is sent in one shot from
      // handleSubmit() to /api/admin/create-partner.
      if (mode === 'admin') {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
        return;
      }
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          const stepData: any = {
            last_completed_step: currentStep
          };

          // Add step-specific data
          if (currentStep === 1) {
            // Basic Info
            stepData.name = formData.fullName;
            stepData.email = formData.email;
            stepData.date_of_birth = formData.dateOfBirth;
            stepData.gender = formData.gender;
            stepData.address = formData.address;
            stepData.city = formData.city;
            stepData.state = formData.state;
            stepData.area = formData.area;
            stepData.pincode = formData.pincode;
          } else if (currentStep === 2) {
            // Services — send service_types (registry IDs); backend auto-tags service_categories.
            stepData.service_types = formData.serviceTypes.map((st) => st.id).join(',');
            stepData.service_categories = formData.primaryCategories.join(',');
            stepData.specific_services = formData.specificServices.join(',');
            stepData.age_groups = formData.ageGroups.join(',');
            stepData.experience_years = parseInt(formData.experience) || 0;
            stepData.qualifications = formData.qualifications;
            stepData.description = formData.description;
            stepData.languages = formData.languages.join(',');
          }
          // Step 3 is now Verification & Banking and is saved through handleSubmit().

          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/profile`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stepData)
          });
        }
      } catch (error) {
        console.error('Error saving step progress:', error);
        // Continue to next step even if save fails
      }

      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate account numbers match if both are provided
    if (formData.accountNumber && formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return;
    }
    
    if (validateStep(currentStep)) {
      try {
        setIsLoading(true);
        
let profileImageUrl = '';
        
// Handle profile image
if (formData.profileImage) {
  console.log('📤 Processing profile image...');
          
  if ((formData.profileImage as any).profilePictureUrl) {
    profileImageUrl = (formData.profileImage as any).profilePictureUrl;
    console.log('✅ Using blink verification image URL:', profileImageUrl);
  } else if ((formData.profileImage as any).imageUrl) {
    // For camera captures, pass the base64 string directly
    profileImageUrl = (formData.profileImage as any).imageUrl;
    console.log('✅ Passing base64 image data directly');
  } else if (formData.profileImage instanceof File) {
    // Convert any other uploaded File to base64
    profileImageUrl = await fileToBase64(formData.profileImage);
    console.log('✅ Converted file to base64 for direct upload');
  }
}
        
// Get phone number from localStorage if not in form data
const storedPhone = localStorage.getItem('userPhone') || localStorage.getItem('phone');
        const phoneNumber = formData.phone || storedPhone || '';
        
        // Process documents to base64 if available
        const documents: Record<string, string> = {};
        
        if (formData.documents.panCard) {
          try {
            const base64 = await fileToBase64(formData.documents.panCard);
            documents.pan_card = base64;
            console.log('✅ PAN card converted to base64');
          } catch (error) {
            console.warn('⚠️ Failed to convert PAN card to base64:', error);
          }
        }
        
        if (formData.documents.aadhaarCard) {
          try {
            const base64 = await fileToBase64(formData.documents.aadhaarCard);
            documents.aadhaar_card = base64;
            console.log('✅ Aadhaar card converted to base64');
          } catch (error) {
            console.warn('⚠️ Failed to convert Aadhaar card to base64:', error);
          }
        }
        
        // Prepare data for API
        const profileData = {
          // Basic Info
          fullName: formData.fullName,
          email: formData.email,
          phone: phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          profileImageUrl: profileImageUrl,
          
          // Location
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          area: formData.area,
          address: formData.address,
          
          // Services
          primaryCategories: formData.primaryCategories,
          specificServices: formData.specificServices,
          serviceTypes: formData.serviceTypes.map((st) => st.id),
          ageGroups: formData.ageGroups,
          experience: formData.experience,
          qualifications: formData.qualifications,
          description: formData.description,
          languages: formData.languages,
          
          // Verification
          aadhaarNumber: formData.aadhaarNumber,
          isAadhaarVerified: formData.isAadhaarVerified,
          panNumber: formData.panNumber,
          isPanVerified: formData.isPanVerified,
          gstNumber: formData.gstNumber,
          isGstVerified: formData.isGstVerified,

          // Banking (optional)
          accountHolder: formData.accountHolder,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountType: formData.accountType,
          upiId: formData.upiId,
          
          // Documents (legacy/optional)
          documents: Object.keys(documents).length > 0 ? documents : undefined
        };

        // Generate temp password for login
        const password = generateTempPassword();
        setTempPassword(password);

        // Add password to profile data
        const profileDataWithPassword = {
          ...profileData,
          tempPassword: password
        };

        // Save profile data to database.
        // Admin mode posts to /api/admin/create-partner (admin JWT, no provider row required).
        // Partner mode posts to /api/partner/complete-profile (partner OTP JWT carries phone).
        const token = localStorage.getItem('token');
        const endpoint = mode === 'admin' ? '/api/admin/create-partner' : '/api/partner/complete-profile';
        console.log('📤 Submitting profile data to backend...', endpoint);
        console.log('📋 Profile data payload:', profileDataWithPassword);
        console.log('🔑 Using token:', token ? 'Present' : 'Missing');
        console.log('🔐 Generated temp password:', password);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileDataWithPassword)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Profile saved successfully:', result);
          console.log('✅ Password set in backend:', password);
          
          // Update token if a new one is provided (includes partner ID)
          if (result.token) {
            console.log('🔑 Updating token with partner ID');
            localStorage.setItem('token', result.token);
            localStorage.setItem('authToken', result.token);
          }
          
          // Show temp password modal first
          setShowTempPassword(true);
          
          // Use the backend-generated password (it's what's stored in DB)
          setTempPassword(result.temporaryPassword || password);
          
          // Don't call onSubmit here - CompleteProfileModal handles the API call in admin mode
        } else {
          console.error('❌ Response not OK:', response.status, response.statusText);
          
          let errorMessage = 'Please try again.';
          try {
            const error = await response.json();
            console.error('❌ Error details:', error);
            errorMessage = error.message || error.error || errorMessage;
          } catch (parseError) {
            console.error('❌ Could not parse error response:', parseError);
            const errorText = await response.text();
            console.error('❌ Raw error response:', errorText);
            errorMessage = `Server error (${response.status}): ${errorText || response.statusText}`;
          }
          
          alert(`Failed to save profile: ${errorMessage}`);
        }
      } catch (error) {
        console.error('❌ Error saving profile:', error);
        alert('An error occurred while saving your profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const checkPincode = useDebouncedCallback(async (pincode: string) => {
    if (pincode.length === 6) {
      setPincodeStatus({ status: 'checking' });
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/api/pincodes/check?pincode=${pincode}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setPincodeStatus({ 
            status: 'serviceable', 
            info: { 
              city: data.data.city, 
              state: data.data.state, 
              area: data.data.area !== 'undefined' ? data.data.area : undefined 
            } 
          });
          setFormData(prev => ({
            ...prev,
            city: data.data.city || '',
            state: data.data.state || '',
            area: data.data.area !== 'undefined' ? data.data.area || '' : ''
          }));
        } else {
          setPincodeStatus({ status: 'not_serviceable' });
        }
      } catch (error) {
        setPincodeStatus({ status: 'not_serviceable' });
      }
    }
  }, 500);

  // Debounced phone availability check — only runs in admin mode (partner mode
  // uses an OTP-verified number, so the phone is already known-good).
  const checkPhoneAvailability = useDebouncedCallback(async (raw: string) => {
    const phone = (raw || '').trim();
    if (!phone) {
      setPhoneStatus({ status: 'idle' });
      return;
    }
    if (!/^[+]?\d[\d\s-]{7,14}$/.test(phone)) {
      setPhoneStatus({ status: 'invalid' });
      return;
    }
    setPhoneStatus({ status: 'checking' });
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/check-phone?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data && typeof data.available === 'boolean') {
        setPhoneStatus({ status: data.available ? 'available' : 'taken' });
      } else {
        setPhoneStatus({ status: 'available' }); // default to available if check fails
      }
    } catch (err) {
      console.error('Phone check error:', err);
      setPhoneStatus({ status: 'available' });
    }
  }, 500);

  const checkEmailAvailability = useDebouncedCallback(async (email: string) => {
    if (email && email.includes('@')) {
      setEmailStatus({ status: 'checking' });
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        // Pass current user ID to exclude their own email from duplicate check
        const currentUserId = user?.id;
        const url = currentUserId 
          ? `${API_BASE_URL}/api/check-email?email=${encodeURIComponent(email)}&currentUserId=${currentUserId}`
          : `${API_BASE_URL}/api/check-email?email=${encodeURIComponent(email)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setEmailStatus({ status: data.available ? 'available' : 'taken' });
        } else {
          setEmailStatus({ status: 'available' }); // Default to available if check fails
        }
      } catch (error) {
        console.error('Email check error:', error);
        setEmailStatus({ status: 'available' }); // Default to available if check fails
      }
    } else {
      setEmailStatus({ status: 'idle' });
    }
  }, 500);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black md:bg-black md:bg-opacity-50 flex items-center justify-center z-50 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white md:rounded-2xl shadow-2xl w-full md:max-w-4xl h-full md:h-auto md:max-h-[95vh] overflow-hidden animate-in md:slide-in-from-bottom-4 duration-500 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {mode === 'admin' ? 'Add New Partner' : 'Complete Your Profile'}
              </h2>
              <p className="text-white/80 hidden md:block">
                {mode === 'admin' 
                  ? 'Please provide partner information to create their account' 
                  : 'Please complete all required information to access your dashboard'
                }
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.id ? 'text-white' : 'text-white/60'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id ? 'bg-white text-[#578f82]' : 'bg-white/20'
                  }`}>
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/30'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 pb-4 md:pb-6 overflow-y-auto">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      const email = e.target.value;
                      setFormData(prev => ({ ...prev, email }));
                      checkEmailAvailability(email);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  {emailStatus.status === 'checking' && (
                    <p className="text-sm text-blue-600 mt-1">Checking email availability...</p>
                  )}
                  {emailStatus.status === 'available' && formData.email && (
                    <p className="text-sm text-green-600 mt-1">✓ Email is available</p>
                  )}
                  {emailStatus.status === 'taken' && (
                    <p className="text-sm text-red-600 mt-1">✗ Email is already registered. Please use a different email address.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    {mode === 'admin' ? (
                      // Admin is creating a partner: phone is enterable (no OTP step in admin flow).
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Keep digits / + / spaces only, max 15 chars.
                          const cleaned = e.target.value.replace(/[^\d+\s-]/g, '').slice(0, 15);
                          setFormData((prev) => ({ ...prev, phone: cleaned }));
                          setPhoneStatus({ status: 'idle' });
                          checkPhoneAvailability(cleaned);
                        }}
                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                          phoneStatus.status === 'taken' || phoneStatus.status === 'invalid'
                            ? 'border-red-300'
                            : phoneStatus.status === 'available'
                              ? 'border-green-300'
                              : 'border-gray-300'
                        }`}
                        placeholder="+91 98XXXXXXXX"
                      />
                    ) : (
                      <>
                        <input
                          type="tel"
                          value={formData.phone}
                          readOnly
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                          placeholder="Verified phone number"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </>
                    )}
                    {mode === 'admin' && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {phoneStatus.status === 'checking' && (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#578f82] rounded-full animate-spin" />
                        )}
                        {phoneStatus.status === 'available' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {(phoneStatus.status === 'taken' || phoneStatus.status === 'invalid') && (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {mode === 'admin' ? (
                    phoneStatus.status === 'taken' ? (
                      <p className="text-xs text-red-600 mt-1">This phone number is already registered.</p>
                    ) : phoneStatus.status === 'invalid' ? (
                      <p className="text-xs text-red-600 mt-1">Enter a valid 10–15 digit phone number.</p>
                    ) : phoneStatus.status === 'available' && formData.phone ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Phone number is available
                      </p>
                    ) : phoneStatus.status === 'checking' ? (
                      <p className="text-xs text-gray-500 mt-1">Checking availability…</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Partner will use this number to log in via OTP after you share credentials.
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified via OTP
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData(prev => ({ ...prev, pincode: val }));
                      console.log('🎯 [CompleteProfile] PINCODE INPUT ONLY:', val);
                      
                      if (val.length === 6) {
                        console.log('🌐 [CompleteProfile] CALLING API FOR:', val);
                        checkPincode(val);
                      } else {
                        setPincodeStatus({ status: 'idle' });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                  />
                  {pincodeStatus.status === 'checking' && (
                    <p className="text-sm text-blue-600 mt-1">Checking serviceability...</p>
                  )}
                  {pincodeStatus.status === 'serviceable' && (
                    <p className="text-sm text-green-600 mt-1">
                      Pincode is serviceable ({pincodeStatus.info?.area ? `${pincodeStatus.info.area}, ` : ''}
                      {pincodeStatus.info?.city}, {pincodeStatus.info?.state})
                    </p>
                  )}
                  {pincodeStatus.status === 'not_serviceable' && (
                    <p className="text-sm text-orange-600 mt-1">
                      This pincode is not in our service area. Please enter your location details manually below.
                    </p>
                  )}
                </div>
              </div>

              {/* Location fields - show after pincode check */}
              {formData.pincode.length === 6 && (pincodeStatus.status === 'serviceable' || pincodeStatus.status === 'not_serviceable') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                        pincodeStatus.status === 'serviceable' ? 'bg-gray-100' : ''
                      }`}
                      placeholder="Enter city"
                      disabled={pincodeStatus.status === 'serviceable'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                        pincodeStatus.status === 'serviceable' ? 'bg-gray-100' : ''
                      }`}
                      placeholder="Enter state"
                      disabled={pincodeStatus.status === 'serviceable'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                        pincodeStatus.status === 'serviceable' ? 'bg-gray-100' : ''
                      }`}
                      placeholder="Enter area/locality"
                      disabled={pincodeStatus.status === 'serviceable'}
                    />
                  </div>
                </div>
              )}

              {/* Address Field */}
              {formData.pincode.length === 6 && (pincodeStatus.status === 'serviceable' || pincodeStatus.status === 'not_serviceable') && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>
              )}

              {/* Profile Image Upload - Hide for admin mode OR admin user */}
              {(() => {
                const isAdminMode = mode === 'admin';
                const isAdminUser = user?.role === 'admin';
                const shouldHideProfileImage = isAdminMode || isAdminUser;
                const shouldShowProfileImage = !shouldHideProfileImage;
                
                return shouldShowProfileImage;
              })() && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex flex-col items-center space-y-4">
                    {formData.profileImage ? (
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#578f82] bg-gray-100">
                          <ProfileImagePreview 
                            file={formData.profileImage}
                            onError={() => console.warn('Profile image preview failed')}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-md">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <button
                        onClick={() => setShowBlinkCapture(true)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          formData.profileImage 
                            ? 'bg-white text-[#578f82] border-2 border-[#578f82] hover:bg-gray-50' 
                            : 'bg-[#578f82] text-white hover:bg-[#4a7c70]'
                        }`}
                      >
                        <Camera className="w-5 h-5" />
                        <span>{formData.profileImage ? 'Change Profile Pic' : 'Profile Pic'}</span>
                      </button>
                    </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Look straight at the camera. The system will automatically verify and capture your photo.
                  </p>
                </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Details */}
          {currentStep === 2 && (
            <CompleteProfileModalStep2
              formData={{
                primaryCategories: formData.primaryCategories,
                specificServices: formData.specificServices,
                serviceTypes: formData.serviceTypes,
                ageGroups: formData.ageGroups,
                experience: formData.experience,
                description: formData.description,
                languages: formData.languages
              }}
              setFormData={setFormData}
              categories={categories}
              categoriesLoading={categoriesLoading}
              pincodeSearch={pincodeSearch}
              setPincodeSearch={setPincodeSearch}
              availablePincodes={availablePincodes}
              pincodeLoading={pincodeLoading}
              showPincodeDropdown={showPincodeDropdown}
              setShowPincodeDropdown={setShowPincodeDropdown}
              searchPincodes={searchPincodes}
              handlePincodeSelect={handlePincodeSelect}
              removePincode={removePincode}
            />
          )}

          {/* Step 3 (Availability) has been removed from signup. Partners configure availability later from Dashboard → Availability. The block below is preserved (disabled) so its state and helpers continue to compile, but is never rendered. */}
          {false && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Availability Settings</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure your working hours and availability preferences.
              </p>

              {/* Partner Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Partner Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, partnerType: 'solo' }))}
                    className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                      formData.partnerType === 'solo' 
                        ? 'border-[#578f82] bg-[#578f82]/5 shadow-md' 
                        : 'border-gray-200 hover:border-[#578f82]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold text-lg ${formData.partnerType === 'solo' ? 'text-[#578f82]' : 'text-gray-900'}`}>
                          Solo Partner
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Individual service provider with flexible working hours
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.partnerType === 'solo' 
                          ? 'border-[#578f82] bg-[#578f82]' 
                          : 'border-gray-300'
                      }`}>
                        {formData.partnerType === 'solo' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData(prev => ({ ...prev, partnerType: 'academy' }))}
                    className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                      formData.partnerType === 'academy' 
                        ? 'border-[#578f82] bg-[#578f82]/5 shadow-md' 
                        : 'border-gray-200 hover:border-[#578f82]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold text-lg ${formData.partnerType === 'academy' ? 'text-[#578f82]' : 'text-gray-900'}`}>
                          Big Academy
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Academy or institution with structured batch timings
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.partnerType === 'academy' 
                          ? 'border-[#578f82] bg-[#578f82]' 
                          : 'border-gray-300'
                      }`}>
                        {formData.partnerType === 'academy' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buffer Time Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buffer Time (Minutes)</label>
                <p className="text-xs text-gray-500 mb-3">Time between bookings for travel and preparation</p>
                <select
                  value={formData.bufferTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, bufferTimeMinutes: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              {/* Working Hours for Solo Partners */}
              {formData.partnerType === 'solo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Working Hours *</label>
                  <div className="space-y-2 md:space-y-3 max-h-[400px] md:max-h-[450px] overflow-y-auto pr-2">
                    {formData.workingHours && formData.workingHours.length > 0 ? (
                      formData.workingHours.map((day, index) => {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        return (
                          <div key={index} className="p-2 md:p-3 border border-gray-200 rounded-lg">
                            {/* Day name and availability toggle - always on same row */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 min-w-[80px]">{dayNames[day.dayOfWeek]}</span>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={day.isAvailable}
                                  onChange={(e) => {
                                    const newWorkingHours = [...formData.workingHours];
                                    newWorkingHours[index] = { ...day, isAvailable: e.target.checked };
                                    setFormData(prev => ({ ...prev, workingHours: newWorkingHours }));
                                  }}
                                  className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                                />
                                <span className="ml-2 text-sm text-gray-600">Available</span>
                              </label>
                            </div>
                            
                            {/* Time inputs - stacked on mobile, inline on desktop */}
                            {day.isAvailable && (
                              <div className="space-y-2 mt-2 pl-0 md:pl-2">
                                {/* Working hours row */}
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                  <span className="text-xs text-gray-500 w-12 md:hidden">Hours:</span>
                                  <input
                                    type="time"
                                    value={day.startTime}
                                    onChange={(e) => {
                                      const newWorkingHours = [...formData.workingHours];
                                      newWorkingHours[index] = { ...day, startTime: e.target.value };
                                      setFormData(prev => ({ ...prev, workingHours: newWorkingHours }));
                                    }}
                                    className="flex-1 min-w-[90px] max-w-[110px] px-2 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                                  />
                                  <span className="text-xs md:text-sm text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={day.endTime}
                                    onChange={(e) => {
                                      const newWorkingHours = [...formData.workingHours];
                                      newWorkingHours[index] = { ...day, endTime: e.target.value };
                                      setFormData(prev => ({ ...prev, workingHours: newWorkingHours }));
                                    }}
                                    className="flex-1 min-w-[90px] max-w-[110px] px-2 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                                  />
                                </div>
                                
                                {/* Break time row */}
                                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                  <span className="text-xs text-gray-500 w-12">Break:</span>
                                  <input
                                    type="time"
                                    value={day.breakStartTime}
                                    onChange={(e) => {
                                      const newWorkingHours = [...formData.workingHours];
                                      newWorkingHours[index] = { ...day, breakStartTime: e.target.value };
                                      setFormData(prev => ({ ...prev, workingHours: newWorkingHours }));
                                    }}
                                    className="flex-1 min-w-[90px] max-w-[110px] px-2 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#578f82] focus:border-transparent"
                                  />
                                  <span className="text-xs md:text-sm text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={day.breakEndTime}
                                    onChange={(e) => {
                                      const newWorkingHours = [...formData.workingHours];
                                      newWorkingHours[index] = { ...day, breakEndTime: e.target.value };
                                      setFormData(prev => ({ ...prev, workingHours: newWorkingHours }));
                                    }}
                                    className="flex-1 min-w-[90px] max-w-[110px] px-2 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#578f82] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No working hours configured. Please refresh the page.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Batch Timings for Academy Partners */}
              {formData.partnerType === 'academy' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Batch Timings *</label>
                  <div className="space-y-3">
                    {formData.batchTimings.map((batch, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Batch Name</label>
                            <input
                              type="text"
                              value={batch.batchName}
                              onChange={(e) => {
                                const newBatchTimings = [...formData.batchTimings];
                                newBatchTimings[index] = { ...batch, batchName: e.target.value };
                                setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                              placeholder="e.g., Batch A"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                            <select
                              value={batch.dayOfWeek}
                              onChange={(e) => {
                                const newBatchTimings = [...formData.batchTimings];
                                newBatchTimings[index] = { ...batch, dayOfWeek: parseInt(e.target.value) };
                                setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                            >
                              <option value={0}>Sunday</option>
                              <option value={1}>Monday</option>
                              <option value={2}>Tuesday</option>
                              <option value={3}>Wednesday</option>
                              <option value={4}>Thursday</option>
                              <option value={5}>Friday</option>
                              <option value={6}>Saturday</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="time"
                                value={batch.startTime}
                                onChange={(e) => {
                                  const newBatchTimings = [...formData.batchTimings];
                                  newBatchTimings[index] = { ...batch, startTime: e.target.value };
                                  setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                                }}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <input
                                type="time"
                                value={batch.endTime}
                                onChange={(e) => {
                                  const newBatchTimings = [...formData.batchTimings];
                                  newBatchTimings[index] = { ...batch, endTime: e.target.value };
                                  setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                                }}
                                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                            <input
                              type="number"
                              value={batch.maxCapacity}
                              onChange={(e) => {
                                const newBatchTimings = [...formData.batchTimings];
                                newBatchTimings[index] = { ...batch, maxCapacity: parseInt(e.target.value) || 10 };
                                setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                              min="1"
                              max="50"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newBatchTimings = formData.batchTimings.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, batchTimings: newBatchTimings }));
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Batch
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newBatch = {
                          batchName: '',
                          dayOfWeek: 1,
                          startTime: '09:00',
                          endTime: '10:00',
                          maxCapacity: 10,
                          isActive: true
                        };
                        setFormData(prev => ({ ...prev, batchTimings: [...prev.batchTimings, newBatch] }));
                      }}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#578f82] hover:text-[#578f82] transition-colors"
                    >
                      + Add Batch
                    </button>
                  </div>
                </div>
              )}

              {/* Calendar Sync Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Calendar Sync (Optional)</label>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.calendarSyncEnabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, calendarSyncEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable calendar sync to prevent double-booking</span>
                  </div>
                  
                  {formData.calendarSyncEnabled && (
                    <div className="pl-6">
                      <button
                        type="button"
                        onClick={() => {
                          // This would hit the backend endpoint to initiate OAuth
                          const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
                          const partnerId = user?.id || 'pending';
                          // For now we'll just show a success message since backend OAuth isn't fully configured
                          toast.success('Google Calendar will be connected upon profile completion');
                          setFormData(prev => ({ ...prev, googleCalendarId: 'connected_pending_save' }));
                        }}
                        className={`flex items-center space-x-3 px-5 py-2.5 border rounded-lg transition-colors ${
                          formData.googleCalendarId 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">
                          {formData.googleCalendarId ? 'Google Calendar Connected' : 'Connect Google Calendar'}
                        </span>
                        {formData.googleCalendarId && <CheckCircle className="w-4 h-4 ml-2" />}
                      </button>
                      {!formData.googleCalendarId && (
                        <p className="mt-2 text-xs text-gray-500">
                          Securely connect your calendar to sync availability and bookings automatically.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification & Banking (was step 4 before availability was removed from signup) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verification & Banking</h3>
              <p className="text-sm text-gray-600 mb-6">
                Verify your identity and add banking details for payouts.
              </p>

              {/* KYC Verification Section */}
              <h4 className="text-lg font-medium text-gray-800 border-b pb-2 mb-4">Identity Verification</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Aadhaar Verification */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Aadhaar Verification {mode === 'partner' ? '*' : '(Optional)'}
                    </label>
                    {formData.isAadhaarVerified && <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> VERIFIED</span>}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => {
                        if (!formData.isAadhaarVerified) {
                           setFormData(prev => ({ ...prev, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))
                        }
                      }}
                      disabled={formData.isAadhaarVerified || aadhaarStatus === 'verifying' || aadhaarStatus === 'awaiting_verification'}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${formData.isAadhaarVerified ? 'bg-green-50 border-green-200 text-green-800' : 'border-gray-300'}`}
                      placeholder="Enter 12-digit Aadhaar Number"
                      maxLength={12}
                    />
                    
                    {!formData.isAadhaarVerified && (
                      <div className="space-y-3">
                        {aadhaarStatus === 'awaiting_verification' || aadhaarStatus === 'verifying' ? (
                          <>
                            <input
                              type="text"
                              value={formData.aadhaarOtp}
                              onChange={(e) => setFormData(prev => ({ ...prev, aadhaarOtp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                              disabled={aadhaarStatus === 'verifying'}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                              placeholder="Enter 6-digit OTP"
                              maxLength={6}
                            />
                            <div className="flex gap-2">
                                <button
                                  onClick={handleVerifyAadhaarOtp}
                                  disabled={!formData.aadhaarOtp || aadhaarStatus === 'verifying'}
                                  className="flex-1 bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                >
                                  {aadhaarStatus === 'verifying' ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button
                                  onClick={() => setAadhaarStatus('idle')}
                                  disabled={aadhaarStatus === 'verifying'}
                                  className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                                >
                                  Retry
                                </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={handleSendAadhaarOtp}
                            disabled={formData.aadhaarNumber.length !== 12 || aadhaarStatus === 'authenticating'}
                            className="w-full bg-[#578f82] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                          >
                            {aadhaarStatus === 'authenticating' ? 'Sending OTP...' : 'Send OTP'}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Display Aadhaar Photo if verified */}
                    {formData.isAadhaarVerified && aadhaarData?.photo && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-green-800 mb-2">Verified Aadhaar Details</h4>
                            <div className="space-y-1 text-xs text-green-700">
                              {aadhaarData.name && (
                                <div><span className="font-medium">Name:</span> {aadhaarData.name}</div>
                              )}
                              {aadhaarData.date_of_birth && (
                                <div><span className="font-medium">DOB:</span> {aadhaarData.date_of_birth}</div>
                              )}
                              {aadhaarData.gender && (
                                <div><span className="font-medium">Gender:</span> {aadhaarData.gender === 'M' ? 'Male' : aadhaarData.gender === 'F' ? 'Female' : aadhaarData.gender}</div>
                              )}
                              {aadhaarData.care_of && (
                                <div><span className="font-medium">Care of:</span> {aadhaarData.care_of}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <h4 className="text-lg font-medium text-gray-800 border-b pb-2">Banking Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => {
                      const ifsc = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, ifscCode: ifsc }));
                      if (ifsc.length === 11) {
                        handleIfscLookup(ifsc);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter IFSC code"
                    maxLength={11}
                  />
                  {bankVerificationStatus === 'verifying_ifsc' && (
                    <p className="text-sm text-blue-600 mt-1">Looking up bank details...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="Auto-filled from IFSC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="Auto-filled from IFSC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, accountNumber: value }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter Account Number</label>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, confirmAccountNumber: value }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                      formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Re-enter account number"
                  />
                  {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                    <p className="text-red-500 text-sm mt-1">Account numbers do not match</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter Account Holder Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  >
                    <option value="">Select account type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="Enter UPI ID (e.g., yourname@paytm)"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Secure Banking</h4>
                    <p className="text-sm text-green-800 mt-1">
                      Your banking information is encrypted and secure. We use this for payment processing only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center space-x-2 bg-[#578f82] text-white px-6 py-2 rounded-lg hover:bg-[#4a7c70] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || loading || !validateStep(currentStep)}
              className={`flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading || loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Blink Capture Modal */}
      {showBlinkCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Take Profile Photo</h3>
              <button
                onClick={() => setShowBlinkCapture(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <LivenessCheck
              onVerified={(imageBase64) => {
                // Handle the captured image data
                try {
                  console.log('Liveness check success');
                  
                  // Create a placeholder file
                  const placeholderBlob = new Blob(['placeholder'], { type: 'image/jpeg' });
                  const file = new File([placeholderBlob], 'profile-photo.jpg', { type: 'image/jpeg' });
                  
                  // Store the image URL (base64)
                  const imageUrl = imageBase64;
                  console.log('Setting image URL for preview');
                  
                  // Store all metadata
                  (file as any).imageUrl = imageUrl;
                  (file as any).profilePictureUrl = imageUrl; // Use base64 as URL
                  (file as any).isVerified = true;
                  
                  setFormData(prev => ({ ...prev, profileImage: file }));
                  
                  setShowBlinkCapture(false);
                  toast.success('Liveness verified successfully!');
                } catch (err) {
                  console.error('Error processing captured image:', err);
                  setShowBlinkCapture(false);
                  alert('Photo captured successfully! You can continue with your profile.');
                }
              }}
              onCancel={() => setShowBlinkCapture(false)}
            />
          </div>
        </div>
      )}

      {/* Temp Password Modal */}
      {showTempPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Created Successfully!</h2>
                  <p className="text-white/90 text-sm mt-0.5">Partner account has been set up</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  <strong>{formData.fullName}</strong> has been successfully added as a partner.
                </p>
              </div>

              {/* Credentials */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Login Email
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{formData.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formData.email);
                        toast.success('Email copied!');
                      }}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Temporary Password
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
                      <p className="text-lg font-bold text-amber-900 tracking-wider">{tempPassword}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tempPassword);
                        toast.success('Password copied!');
                      }}
                      className="p-3 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                      title="Copy password"
                    >
                      <Copy className="w-4 h-4 text-amber-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Important</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Please share these credentials with the partner securely. They will be required to change the password on first login.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setShowTempPassword(false);
                  if (mode === 'admin') {
                    // Admin: just close the modal and let parent refresh the list
                    onClose();
                    toast.success('Partner created successfully!');
                  } else {
                    // Partner: complete the flow, logout admin session, redirect to login
                    onSubmit(formData);
                    onClose();
                    logout();
                    toast.success('Partner created successfully! Please login with the new credentials.');
                    navigate('/login');
                  }
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#578f82] to-[#4a7c70] hover:from-[#4a7c70] hover:to-[#3d6a5f] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteProfileModal;
