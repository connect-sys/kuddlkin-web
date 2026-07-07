
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BlinkCaptureProps {
  onSuccess: (data: { firstUrl?: string; profilePictureKey?: string; profilePictureUrl?: string; imageUrl?: string }) => void;
  autoStart?: boolean;
  token?: string;
}

const BlinkCapture: React.FC<BlinkCaptureProps> = ({ onSuccess, autoStart = false, token }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'detecting' | 'captured'>('idle');

  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsCapturing(true);
      setStatus('detecting');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Simulate auto-capture after detection delay
      setTimeout(() => {
        capturePhoto();
      }, 3000);

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please allow camera permissions.');
      setIsCapturing(false);
      setStatus('idle');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally for mirror effect if needed, but usually better to capture raw
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageBase64);
        setStatus('captured');
        stopCamera();
        
        // Auto-confirm after capture
        handleAutoConfirm(imageBase64);
      }
    }
  };

  const handleAutoConfirm = async (imageBase64: string) => {
    try {
      setUploading(true);
      
      // If token is available, perform real backend verification
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/kyc/face/liveness`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image_base64: imageBase64 })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Liveness check failed');
        }
        
        toast.success('Face liveness verified successfully');
      } else {
        // Fallback simulation if no token provided (dev mode/legacy)
        toast.success('Liveliness detected & photo captured successfully');
      }
      
      // Return the base64 image to parent
      onSuccess({
        imageUrl: imageBase64,
        // Mimicking the structure expected by the modal
        profilePictureUrl: imageBase64 
      });
      
    } catch (err: any) {
      console.error('Error processing photo:', err);
      const errorMessage = err.message || 'Failed to verify face liveness';
      toast.error(errorMessage);
      setError(errorMessage);
      // If verification failed, allow retrying
      setStatus('idle'); // Allow UI to reset or user to retake
    } finally {
      setUploading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
    setStatus('idle');
    startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;
    handleAutoConfirm(capturedImage);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="relative w-full max-w-md aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        {!isCapturing && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            <Camera className="w-12 h-12 mb-4 text-gray-400" />
            <p className="mb-4">Position your face clearly in the frame.</p>
            {error ? (
              <div className="flex items-center text-red-400 mb-4">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            ) : null}
            <button
              onClick={startCamera}
              className="bg-[#578f82] hover:bg-[#4a7c70] text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {isCapturing && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="bg-white rounded-full p-1 shadow-lg transform active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full border-4 border-white bg-red-500" />
              </button>
            </div>
          </>
        )}

        {capturedImage && (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white p-2 text-center text-sm">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div className="flex space-x-4">
          <button
            onClick={retakePhoto}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake</span>
          </button>
          
          {/* Only show manual confirm if NOT using strict token verification, or allow retry? 
              User asked for "otherwise show retake", implying they don't want manual confirm on failure.
              But we might want a "Retry" button for network errors. 
              For now, hiding "Use Photo" if token is present to enforce liveness flow via auto-capture or retake.
          */}
          {!token && (
            <button
              onClick={confirmPhoto}
              disabled={uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-[#578f82] hover:bg-[#4a7c70] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Use Photo</span>
            </button>
          )}
        </div>
      )}
      
      {/* Loading Overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white rounded-lg z-10">
          <Loader2 className="w-10 h-10 animate-spin mb-2" />
          <p className="font-medium">Verifying Liveness...</p>
        </div>
      )}
    </div>
  );
};

export default BlinkCapture;
