import React, { useState } from 'react';
import { CreditCard, AlertCircle, Check, X, Loader } from 'lucide-react';

interface AccountVerificationSectionProps {
  accountData: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  onAccountDataChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

interface AccountVerificationStatus {
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  verified: boolean;
  message: string;
}

const AccountVerificationSection: React.FC<AccountVerificationSectionProps> = ({
  accountData,
  onAccountDataChange,
  errors
}) => {
  const [accountVerification, setAccountVerification] = useState<AccountVerificationStatus>({
    status: 'pending',
    verified: false,
    message: ''
  });

  const verifyAccount = async () => {
    if (!accountData.accountNumber || !accountData.ifscCode) return;
    
    setAccountVerification({ 
      status: 'verifying', 
      verified: false, 
      message: 'Verifying account details with bank...' 
    });
    
    // Mock verification - in production, this would call a real bank verification API
    setTimeout(() => {
      const isValid = accountData.accountNumber.length >= 9 && 
                     accountData.ifscCode.length === 11 &&
                     /^[A-Z]{4}0[A-Z0-9]{6}$/.test(accountData.ifscCode);
      
      setAccountVerification({
        status: isValid ? 'verified' : 'failed',
        verified: isValid,
        message: isValid 
          ? 'Account verified successfully with bank records' 
          : 'Account verification failed. Please check your details.'
      });
    }, 3000);
  };

  const getBankNameFromIFSC = (ifsc: string) => {
    // Mock bank name detection from IFSC
    const bankCodes: Record<string, string> = {
      'SBIN': 'State Bank of India',
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'AXIS': 'Axis Bank',
      'PUNB': 'Punjab National Bank',
      'UBIN': 'Union Bank of India',
      'CNRB': 'Canara Bank',
      'BARB': 'Bank of Baroda'
    };
    
    const bankCode = ifsc.substring(0, 4);
    return bankCodes[bankCode] || '';
  };

  // Auto-fill bank name when IFSC is entered
  const handleIFSCChange = (value: string) => {
    onAccountDataChange('ifscCode', value.toUpperCase());
    
    if (value.length === 11) {
      const bankName = getBankNameFromIFSC(value);
      if (bankName && !accountData.bankName) {
        onAccountDataChange('bankName', bankName);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
        <p className="text-gray-600 mt-2">Add your bank account for payments (Optional)</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Optional Step</h4>
            <p className="text-yellow-700 text-sm">
              You can skip this step and add account details later from your profile settings.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-[#578f82]" />
          Bank Account Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              value={accountData.accountHolderName}
              onChange={(e) => onAccountDataChange('accountHolderName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter account holder name"
            />
            {errors.accountHolderName && (
              <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={accountData.accountNumber}
              onChange={(e) => onAccountDataChange('accountNumber', e.target.value.replace(/\D/g, ''))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                errors.accountNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter account number"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              value={accountData.ifscCode}
              onChange={(e) => handleIFSCChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                errors.ifscCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter IFSC code (e.g., SBIN0001234)"
              maxLength={11}
            />
            {errors.ifscCode && (
              <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={accountData.bankName}
              onChange={(e) => onAccountDataChange('bankName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent ${
                errors.bankName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter bank name (auto-filled from IFSC)"
            />
            {errors.bankName && (
              <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
            )}
          </div>
        </div>

        {/* Account Verification */}
        {accountData.accountNumber && accountData.ifscCode && (
          <div className="mt-6 bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Account Verification</h4>
              <button
                onClick={verifyAccount}
                disabled={accountVerification.status === 'verifying'}
                className="px-4 py-2 bg-[#578f82] text-white rounded-lg hover:bg-[#4a7c70] transition-colors disabled:opacity-50"
              >
                {accountVerification.status === 'verifying' ? (
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Account'
                )}
              </button>
            </div>
            
            {accountVerification.message && (
              <div className={`flex items-center space-x-2 text-sm ${
                accountVerification.verified ? 'text-green-600' : 
                accountVerification.status === 'failed' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {accountVerification.verified ? (
                  <Check className="w-4 h-4" />
                ) : accountVerification.status === 'failed' ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                <span>{accountVerification.message}</span>
              </div>
            )}

            {accountVerification.verified && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-700 text-sm">
                  <p className="font-medium">Account Details Verified:</p>
                  <p>Account Holder: {accountData.accountHolderName}</p>
                  <p>Bank: {accountData.bankName}</p>
                  <p>Account Number: ****{accountData.accountNumber.slice(-4)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountVerificationSection;
