import React, { useState, useEffect } from 'react';
import { Building2, User, Clock, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OperationalProfileSetupProps {
  partnerId: string;
  onSetupComplete: (profile: any) => void;
}

interface ProfileData {
  partnerType: 'solo' | 'academy' | '';
  businessName: string;
  bufferTimeMinutes: number;
  autoAcceptBookings: boolean;
}

const OperationalProfileSetup: React.FC<OperationalProfileSetupProps> = ({ 
  partnerId, 
  onSetupComplete 
}) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    partnerType: '',
    businessName: '',
    bufferTimeMinutes: 30,
    autoAcceptBookings: false
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setupProfile = async () => {
    if (!profileData.partnerType) {
      toast.error('Please select your partner type');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/partner/setup-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: partnerId,
          partnerType: profileData.partnerType,
          businessName: profileData.businessName,
          bufferTimeMinutes: profileData.bufferTimeMinutes,
          autoAcceptBookings: profileData.autoAcceptBookings
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Operational profile setup completed!');
        onSetupComplete(data.data);
      } else {
        toast.error(data.message || 'Failed to setup profile');
      }
    } catch (error) {
      console.error('Setup profile error:', error);
      toast.error('Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return profileData.partnerType !== '';
    if (currentStep === 2) return profileData.partnerType === 'solo' || profileData.businessName.trim() !== '';
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#24335A] mb-2">Setup Your Operational Profile</h2>
        <p className="text-gray-600">Configure your partner settings to start receiving bookings</p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step ? 'bg-[#267D71] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  currentStep > step ? 'bg-[#267D71]' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Partner Type Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#24335A] mb-4">What type of partner are you?</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Solo Partner */}
            <div 
              onClick={() => handleInputChange('partnerType', 'solo')}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                profileData.partnerType === 'solo' 
                  ? 'border-[#267D71] bg-[#E6F8F6] shadow-md' 
                  : 'border-gray-200 hover:border-[#267D71]/50'
              }`}
            >
              <div className="flex items-center mb-4">
                <User className="w-8 h-8 text-[#267D71] mr-3" />
                <h4 className="text-lg font-bold text-[#24335A]">Solo Partner</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Individual service provider offering personalized experiences
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Set your own working hours</li>
                <li>• Direct booking management</li>
                <li>• Flexible scheduling</li>
                <li>• Personal brand building</li>
              </ul>
            </div>

            {/* Academy Partner */}
            <div 
              onClick={() => handleInputChange('partnerType', 'academy')}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                profileData.partnerType === 'academy' 
                  ? 'border-[#267D71] bg-[#E6F8F6] shadow-md' 
                  : 'border-gray-200 hover:border-[#267D71]/50'
              }`}
            >
              <div className="flex items-center mb-4">
                <Building2 className="w-8 h-8 text-[#267D71] mr-3" />
                <h4 className="text-lg font-bold text-[#24335A]">Big Academy</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Educational institution with multiple batches and structured programs
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Batch-based scheduling</li>
                <li>• Multiple capacity management</li>
                <li>• Structured programmes</li>
                <li>• Team coordination</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Business Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#24335A] mb-4">Business Configuration</h3>
          
          {profileData.partnerType === 'academy' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business/Academy Name *
              </label>
              <input
                type="text"
                value={profileData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#267D71]"
                placeholder="Enter your academy name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Time Between Bookings (minutes)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="15"
                max="60"
                step="15"
                value={profileData.bufferTimeMinutes}
                onChange={(e) => handleInputChange('bufferTimeMinutes', parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center bg-[#E6F8F6] px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-[#267D71] mr-2" />
                <span className="font-bold text-[#267D71]">{profileData.bufferTimeMinutes} min</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Travel time automatically blocked between sessions to prevent overlapping bookings
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoAccept"
                checked={profileData.autoAcceptBookings}
                onChange={(e) => handleInputChange('autoAcceptBookings', e.target.checked)}
                className="mt-1 mr-3"
              />
              <div>
                <label htmlFor="autoAccept" className="font-medium text-gray-700 cursor-pointer">
                  Auto-Accept Bookings
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Automatically accept booking requests without manual approval. 
                  You can change this later in settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#24335A] mb-4">Confirm Your Setup</h3>
          
          <div className="bg-gray-50 p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Partner Type:</span>
              <div className="flex items-center">
                {profileData.partnerType === 'solo' ? (
                  <><User className="w-4 h-4 mr-2" /> Solo Partner</>
                ) : (
                  <><Building2 className="w-4 h-4 mr-2" /> Big Academy</>
                )}
              </div>
            </div>
            
            {profileData.businessName && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Business Name:</span>
                <span className="font-bold text-[#267D71]">{profileData.businessName}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Buffer Time:</span>
              <span className="font-bold text-[#267D71]">{profileData.bufferTimeMinutes} minutes</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Auto-Accept:</span>
              <span className={`font-bold ${profileData.autoAcceptBookings ? 'text-green-600' : 'text-gray-500'}`}>
                {profileData.autoAcceptBookings ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">Next Steps</p>
              <p className="text-blue-700 text-sm mt-1">
                After setup, you'll configure your {profileData.partnerType === 'solo' ? 'working hours' : 'batch timings'} 
                and start receiving booking requests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < 3 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-[#267D71] text-white rounded-lg hover:bg-[#1e635c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={setupProfile}
            disabled={loading}
            className="px-8 py-2 bg-[#267D71] text-white rounded-lg hover:bg-[#1e635c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Setting up...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OperationalProfileSetup;
