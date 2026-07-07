import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  FileText, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Save,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'react-hot-toast';

interface PartnerProfile {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  business_name: string;
  description: string;
  experience_years: number;
  languages: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gender: string;
  date_of_birth: string;
  service_categories: string;
  specific_services: string;
  age_groups: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  upi_id: string;
  profile_image_url: string;
  kyc_status: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  // Profile completion fields from backend
  profileComplete?: boolean;
  profileCompletionPercentage?: number;
  missingFields?: string[];
}

interface Document {
  id: string;
  document_type: string;
  document_url: string;
  file_name: string;
  verification_status: string;
  created_at: string;
}

const AdminPartnerProfile: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (partnerId) {
      fetchPartnerProfile();
      fetchPartnerDocuments();
    }
  }, [partnerId]);

  const fetchPartnerProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partner/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Admin Partner Profile API Response:', data);
        console.log('📊 Profile Completion Data:', {
          profileComplete: data.partner?.profileComplete,
          profileCompletionPercentage: data.partner?.profileCompletionPercentage,
          missingFields: data.partner?.missingFields
        });
        
        // Ensure backend completion data is properly mapped
        const profileWithCompletion = {
          ...data.partner,
          profileComplete: data.partner?.profileComplete || false,
          profileCompletionPercentage: data.partner?.profileCompletionPercentage || 0,
          missingFields: data.partner?.missingFields || []
        };
        
        console.log('✅ MAPPED PROFILE DATA:', {
          originalPercentage: data.partner?.profileCompletionPercentage,
          mappedPercentage: profileWithCompletion.profileCompletionPercentage,
          profileComplete: profileWithCompletion.profileComplete
        });
        
        setProfile(profileWithCompletion);
      } else {
        toast.error('Failed to load partner profile');
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
      toast.error('Failed to load partner profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerDocuments = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/provider/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const calculateProfileCompleteness = (): { percentage: number; missingFields: string[] } => {
    if (!profile) return { percentage: 0, missingFields: [] };

    // EXACT field list as specified by user
    const requiredFields = [
      { field: 'first_name', label: 'Full Name (First)' },
      { field: 'last_name', label: 'Full Name (Last)' },
      { field: 'email', label: 'Email' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'gender', label: 'Gender' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'pincode', label: 'Pincode' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' },
      { field: 'area', label: 'Area' },
      { field: 'service_categories', label: 'Primary Service Category' },
      { field: 'specific_services', label: 'Specific Category' },
      { field: 'age_groups', label: 'Age Group You Serve' },
      { field: 'experience_years', label: 'Experience' },
      { field: 'languages', label: 'Language Spoken' },
      { field: 'description', label: 'Service Description' },
      { field: 'qualifications', label: 'Qualifications' },
      { field: 'serviceable_pincodes', label: 'Serviceable Pincodes' },
      { field: 'account_holder_name', label: 'Account Holder Name' },
      { field: 'account_number', label: 'Account Number' },
      { field: 'ifsc_code', label: 'IFSC Code' },
      { field: 'bank_name', label: 'Bank Name' },
      { field: 'account_type', label: 'Account Type' }
    ];

    const missingFields: string[] = [];
    let completedFields = 0;

    requiredFields.forEach(({ field, label }) => {
      const value = profile[field as keyof PartnerProfile];
      if (value && 
          value !== '' && 
          value !== 0 && 
          value !== 'New' && 
          value !== 'Partner' && 
          !String(value).includes('@temp.kuddl.com')) {
        completedFields++;
      } else {
        missingFields.push(label);
      }
    });

    const totalFields = requiredFields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    return { percentage, missingFields };
  };

  const handleApprovePartner = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'verified',
          documentStatuses: {},
          profileCompletion: 100
        })
      });

      if (response.ok) {
        toast.success('Partner approved successfully!');
        // Update local profile state immediately
        setProfile(prev => prev ? { ...prev, kyc_status: 'verified' } : null);
        
        // If this is the current user being approved, refresh their data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (partnerId === currentUser.id) {
          // Refresh user data to update sidebar restrictions
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        toast.error('Failed to approve partner');
      }
    } catch (error) {
      console.error('Error approving partner:', error);
      toast.error('Failed to approve partner');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndClose = () => {
    toast.success('Changes saved successfully!');
    navigate('/admin/partners');
  };

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // ALWAYS use backend data first, no local calculation unless absolutely necessary
  const percentage = profile?.profileCompletionPercentage ?? 0;
  const missingFields = profile?.missingFields ?? [];
  const isProfileComplete = profile?.profileComplete ?? false;
  
  // Debug what we're actually using
  console.log('🔥 FINAL ADMIN PERCENTAGE:', {
    backendValue: profile?.profileCompletionPercentage,
    finalPercentage: percentage,
    isComplete: isProfileComplete,
    profileId: profile?.id
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#578f82]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Partner not found</p>
        <Button onClick={() => navigate('/admin/partners')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Partners
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/partners')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[#578f82]">
                {profile.first_name} {profile.last_name}
              </h1>
              {/* Verification Status Badge */}
              <Badge 
                className={
                  profile.kyc_status === 'verified' || profile.kyc_status === 'approved'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : profile.kyc_status === 'rejected'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : profile.kyc_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }
              >
                {profile.kyc_status === 'verified' || profile.kyc_status === 'approved' ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                ) : profile.kyc_status === 'rejected' ? (
                  <div className="flex items-center space-x-1">
                    <X className="w-3 h-3" />
                    <span>Rejected</span>
                  </div>
                ) : profile.kyc_status === 'pending' ? (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Pending</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Unverified</span>
                  </div>
                )}
              </Badge>
            </div>
            <p className="text-gray-600">Partner Profile - Admin View</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Profile with Circular Progress */}
          <div className="flex items-center space-x-3">
            {/* Profile Avatar with Circular Progress */}
            <div className="relative">
              {/* Circular Progress Ring */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                {/* Background circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="transparent"
                />
                {/* Progress circle */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={percentage === 100 ? '#10b981' : '#f59e0b'}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${(percentage / 100) * 175.93} 175.93`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Profile Avatar */}
              <div className="absolute inset-2 w-12 h-12 rounded-full bg-[#578f82] flex items-center justify-center text-white font-semibold">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
            </div>
            {/* Profile Info */}
            <div className="text-right">
              <p className="text-sm font-medium">Profile Complete</p>
              <p className={`text-xs ${percentage === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                {percentage}%
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                console.log('🔄 Refreshing partner data...');
                fetchPartnerProfile();
              }}
              variant="outline"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button
              onClick={handleSaveAndClose}
              variant="outline"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </Button>
            
            {isProfileComplete ? (
              <Button
                onClick={handleApprovePartner}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {saving ? 'Approving...' : 'Approve Partner'}
              </Button>
            ) : (
              <Button
                disabled
                variant="outline"
                className="border-yellow-500 text-yellow-600 cursor-not-allowed"
              >
                <X className="w-4 h-4 mr-2" />
                Profile Incomplete
              </Button>
            )}
          </div>
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: User },
            { id: 'services', label: 'Services', icon: Briefcase },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'banking', label: 'Banking', icon: CreditCard }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-[#578f82] text-[#578f82]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{profile.first_name} {profile.last_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">{profile.date_of_birth || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Gender</p>
                      <p className="text-gray-900">{profile.gender || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">City</p>
                      <p className="text-gray-900">{profile.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">State</p>
                      <p className="text-gray-900">{profile.state || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pincode</p>
                    <p className="text-gray-900">{profile.pincode || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Service Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.service_categories ? profile.service_categories.split(',').map((category, index) => (
                        <Badge key={index} variant="secondary">{category.trim()}</Badge>
                      )) : <span className="text-gray-400">Not provided</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Age Groups</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.age_groups ? profile.age_groups.split(',').map((group, index) => (
                        <Badge key={index} variant="outline">{group.trim()}</Badge>
                      )) : <span className="text-gray-400">Not provided</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Experience</p>
                    <p className="text-gray-900">{profile.experience_years ? `${profile.experience_years} years` : 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages ? profile.languages.split(',').map((lang, index) => (
                        <Badge key={index} variant="outline">{lang.trim()}</Badge>
                      )) : <span className="text-gray-400">Not provided</span>}
                    </div>
                  </div>
                </div>
                
                {profile.description && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{profile.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {formatDocumentType(doc.document_type)}
                          </h4>
                          <Badge 
                            className={
                              doc.verification_status === 'verified' 
                                ? 'bg-green-100 text-green-800'
                                : doc.verification_status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {doc.verification_status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <p>File: {doc.file_name}</p>
                          <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(doc.document_url, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Holder Name</p>
                    <p className="text-gray-900">{profile.account_holder_name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Bank Name</p>
                    <p className="text-gray-900">{profile.bank_name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Number</p>
                    <p className="text-gray-900">
                      {profile.account_number ? `****${profile.account_number.slice(-4)}` : 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">IFSC Code</p>
                    <p className="text-gray-900">{profile.ifsc_code || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Account Type</p>
                    <p className="text-gray-900">{profile.account_type || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">UPI ID</p>
                    <p className="text-gray-900">{profile.upi_id || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPartnerProfile;
