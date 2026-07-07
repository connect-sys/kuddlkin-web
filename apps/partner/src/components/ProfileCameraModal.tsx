import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, Loader2 } from 'lucide-react';

interface ProfileCameraModalProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

const ProfileCameraModal: React.FC<ProfileCameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setError(null);
    setCaptured(null);
    setCapturedBlob(null);
    setCameraReady(false);

    try {
      // Check if getUserMedia is available
      const hasMediaDevices = !!navigator.mediaDevices;
      const hasGetUserMedia = hasMediaDevices && !!navigator.mediaDevices.getUserMedia;
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      
      console.log('📷 Camera debug:', { hasMediaDevices, hasGetUserMedia, isSecure, protocol: location.protocol, hostname: location.hostname });

      if (!hasMediaDevices || !hasGetUserMedia) {
        setError(`Camera API not available. Secure: ${isSecure}, MediaDevices: ${hasMediaDevices}, getUserMedia: ${hasGetUserMedia}. Try opening in Chrome or Safari.`);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      // Ignore TensorFlow/face-api errors (they don't affect basic camera functionality)
      const errorMessage = err?.message || '';
      if (errorMessage.includes('tensor should have') || 
          errorMessage.includes('Based on the provided shape') ||
          errorMessage.includes('TensorFlow')) {
        console.warn('Ignoring TensorFlow error - not needed for basic camera:', errorMessage);
        // Don't set error state, camera should still work
        return;
      }
      
      console.error('Camera error:', err);
      const debugInfo = `[${err.name}: ${err.message}]`;
      if (err.name === 'NotAllowedError') {
        setError(`Camera permission denied. Please click the camera icon in your browser's address bar to allow access, then reload. ${debugInfo}`);
      } else if (err.name === 'NotFoundError') {
        setError(`No camera found on this device. ${debugInfo}`);
      } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        setError(`Camera is in use by another app. Close other camera apps and try again. ${debugInfo}`);
      } else if (err.name === 'OverconstrainedError') {
        setError(`Camera constraints not supported. ${debugInfo}`);
      } else {
        setError(`Could not access camera. ${debugInfo}`);
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image (selfie mode)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);

    // Show preview
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCaptured(dataUrl);

    // Create blob
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
      }
    }, 'image/jpeg', 0.9);

    // Stop camera after capture
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    setCapturedBlob(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-[#578f82]">Update Profile Photo</h3>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera / Preview Area */}
        <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-3">
          {/* Live Camera Feed */}
          {!captured && !error && (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </>
          )}

          {/* Captured Preview */}
          {captured && (
            <img src={captured} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-white text-sm">{error}</p>
                <button
                  onClick={startCamera}
                  className="mt-3 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!captured && !error && (
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="flex-1 py-3 bg-[#578f82] text-white rounded-xl font-semibold hover:bg-[#4a7c70] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture Photo
            </button>
          )}

          {captured && (
            <>
              <button
                onClick={retake}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 py-3 bg-[#578f82] text-white rounded-xl font-semibold hover:bg-[#4a7c70] transition-colors flex items-center justify-center gap-2"
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCameraModal;
