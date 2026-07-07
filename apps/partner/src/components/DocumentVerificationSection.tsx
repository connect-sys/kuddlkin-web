import React, { useState } from 'react';
import { FileText, Shield, Check, X, Upload, AlertCircle, Loader } from 'lucide-react';

interface DocumentVerificationSectionProps {
  documents: {
    panCard: File | null;
    aadhaarCard: File | null;
    businessCertificate: File | null;
  };
  onDocumentUpload: (field: string, file: File | null) => void;
  enableDigiLocker: boolean;
  onDigiLockerToggle: (enabled: boolean) => void;
}

const DocumentVerificationSection: React.FC<DocumentVerificationSectionProps> = ({
  documents,
  onDocumentUpload,
  enableDigiLocker,
  onDigiLockerToggle
}) => {
  const [documentVerification, setDocumentVerification] = useState({
    panCard: { status: 'pending', verified: false },
    aadhaarCard: { status: 'pending', verified: false },
    businessCertificate: { status: 'pending', verified: false }
  });

  const handleFileUpload = (field: string, file: File | null) => {
    onDocumentUpload(field, file);
    
    // Auto-verify document (mock AI verification)
    if (file) {
      setDocumentVerification(prev => ({
        ...prev,
        [field]: { status: 'verifying', verified: false }
      }));

      // Simulate AI verification
      setTimeout(() => {
        setDocumentVerification(prev => ({
          ...prev,
          [field]: { status: 'verified', verified: true }
        }));
      }, 2000);
    } else {
      setDocumentVerification(prev => ({
        ...prev,
        [field]: { status: 'pending', verified: false }
      }));
    }
  };

  const connectDigiLocker = () => {
    // Silent enable; no alert
    onDigiLockerToggle(true);
  };

  const documentTypes = [
    { key: 'panCard', label: 'PAN Card', required: true },
    { key: 'aadhaarCard', label: 'Aadhaar Card', required: true },
    { key: 'businessCertificate', label: 'Business Certificate', required: false }
  ];

  return (
    <div className="space-y-6">
      {/* DigiLocker Integration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          DigiLocker Integration
        </h3>
        <p className="text-blue-700 text-sm mb-4">
          Connect your DigiLocker account to automatically fetch and verify your documents.
        </p>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="digilocker"
            checked={enableDigiLocker}
            onChange={(e) => {
              if (e.target.checked) {
                connectDigiLocker();
              } else {
                onDigiLockerToggle(false);
              }
            }}
            className="w-4 h-4 text-[#578f82] border-gray-300 rounded focus:ring-[#578f82]"
          />
          <label htmlFor="digilocker" className="text-sm text-blue-700">
            Enable DigiLocker document verification
          </label>
        </div>
        {enableDigiLocker && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700 text-sm">
              <Check className="w-4 h-4" />
              <span>DigiLocker connected successfully</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Document Upload */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-[#578f82]" />
          Document Upload
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map(({ key, label, required }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(key, e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#578f82] file:text-white hover:file:bg-[#4a7c70]"
                />
                
                {/* Verification Status */}
                <div className="absolute right-2 top-2">
                  {documentVerification[key as keyof typeof documentVerification]?.status === 'verifying' && (
                    <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                  )}
                  {documentVerification[key as keyof typeof documentVerification]?.verified && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* Status Messages */}
              {documentVerification[key as keyof typeof documentVerification]?.status === 'verifying' && (
                <p className="text-blue-600 text-xs flex items-center">
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  Verifying document with AI...
                </p>
              )}
              {documentVerification[key as keyof typeof documentVerification]?.status === 'verified' && (
                <p className="text-green-600 text-xs flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Document verified successfully
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Verification Summary */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
          <div className="space-y-2">
            {documentTypes.map(({ key, label, required }) => {
              const status = documentVerification[key as keyof typeof documentVerification];
              const hasFile = documents[key as keyof typeof documents];
              
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {label} {required && <span className="text-red-500">*</span>}
                  </span>
                  <div className="flex items-center space-x-2">
                    {!hasFile ? (
                      <span className="text-gray-400">Not uploaded</span>
                    ) : status?.status === 'verifying' ? (
                      <span className="text-blue-600 flex items-center">
                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                        Verifying
                      </span>
                    ) : status?.verified ? (
                      <span className="text-green-600 flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationSection;
