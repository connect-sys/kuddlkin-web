import React, { useState } from 'react';
import LivenessCheck from './LivenessCheck';
import { CheckCircle, Camera } from 'lucide-react';

const KycLivenessStep: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleVerificationSuccess = (image: string) => {
    setCapturedImage(image);
    setIsVerified(true);
    setShowCamera(false);
    console.log("Liveness Verified! Image captured.");
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
        <p className="text-gray-500">
          We need to verify that you are a real person. Please complete the quick liveness check below.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {!isVerified ? (
          !showCamera ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-10 h-10 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Take a Video Selfie</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  You will be asked to perform a simple action like blinking or turning your head.
                </p>
              </div>

              <button
                onClick={() => setShowCamera(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                Start Verification
              </button>
            </div>
          ) : (
            <LivenessCheck 
              onVerified={handleVerificationSuccess}
              onCancel={() => setShowCamera(false)}
            />
          )
        ) : (
          <div className="text-center space-y-6 py-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">Verification Successful</h3>
              <p className="text-sm text-gray-500">
                Your identity has been verified successfully.
              </p>
            </div>

            {capturedImage && (
              <div className="max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-green-100 shadow-md">
                <img src={capturedImage} alt="Verified Selfie" className="w-full h-auto" />
              </div>
            )}
            
            <button
              onClick={() => {
                setIsVerified(false);
                setCapturedImage(null);
              }}
              className="text-gray-400 hover:text-gray-600 text-sm underline"
            >
              Reset / Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycLivenessStep;