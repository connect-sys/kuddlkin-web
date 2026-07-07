import React, { useState } from 'react';
import { X, Copy, Eye, EyeOff, CheckCircle, User, Mail, Lock } from 'lucide-react';

interface PartnerCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerData: {
    name: string;
    email: string;
    temporaryPassword: string;
  } | null;
}

const PartnerCredentialsModal: React.FC<PartnerCredentialsModalProps> = ({ 
  isOpen, 
  onClose, 
  partnerData 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const copyAllCredentials = async () => {
    if (!partnerData) return;
    
    const credentials = `Email: ${partnerData.email}
Password: ${partnerData.temporaryPassword}`;

    try {
      await navigator.clipboard.writeText(credentials);
      setCopiedField('all');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen || !partnerData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-kuddl-green rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-kuddl-green">Partner Created!</h2>
              <p className="text-sm text-gray-600">Login credentials generated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              {partnerData.name} has been successfully added as a partner.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LOGIN EMAIL</label>
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-900">{partnerData.email}</span>
              <button
                onClick={() => copyToClipboard(partnerData.email, 'email')}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Copy email"
              >
                {copiedField === 'email' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TEMPORARY PASSWORD</label>
            <div className="bg-yellow-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-900 font-mono">{partnerData.temporaryPassword}</span>
              <button
                onClick={() => copyToClipboard(partnerData.temporaryPassword, 'password')}
                className="p-1.5 hover:bg-yellow-100 rounded transition-colors"
                title="Copy password"
              >
                {copiedField === 'password' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-yellow-600 text-xs font-bold">⚠</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-900">Important</p>
                <p className="text-xs text-yellow-800 mt-1">
                  Please share these credentials with the partner securely. They will be required to change the password on first login.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#578F82] text-white rounded-lg hover:bg-[#4a7c70] transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCredentialsModal;
