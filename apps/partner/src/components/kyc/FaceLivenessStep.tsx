
import { useState, useRef, useEffect } from 'react';
import { kycApi } from '../../api/kyc';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, Camera, RefreshCw } from 'lucide-react';

interface FaceLivenessStepProps {
  onComplete: () => void;
  isCompleted?: boolean;
}

export default function FaceLivenessStep({ onComplete, isCompleted }: FaceLivenessStepProps) {
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageBase64);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const onSubmit = async () => {
    if (!capturedImage) return;

    try {
      setLoading(true);
      const res = await kycApi.checkFaceLiveness(capturedImage);
      if (res.success) {
        toast.success('Face liveness verified successfully');
        onComplete();
      } else {
        toast.error(res.message || 'Face liveness check failed');
        // Allow retrying
        setCapturedImage(null);
        startCamera();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Liveness check failed');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex items-center justify-center flex-col text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-800">Face Verified</h3>
        <p className="text-green-600 text-sm mt-1">Liveness check passed successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Camera className="h-5 w-5 mr-2 text-purple-600" />
        Face Liveness Check
      </h3>

      <div className="space-y-4">
        {!stream && !capturedImage && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Camera className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">We need to capture a selfie to verify your identity.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={startCamera}
              className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700"
            >
              Start Camera
            </button>
          </div>
        )}

        {stream && !capturedImage && (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors"
                title="Capture Photo"
              >
                <div className="h-8 w-8 rounded-full border-2 border-gray-800 bg-red-500" />
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden aspect-video bg-black">
              <img 
                src={capturedImage} 
                alt="Captured selfie" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                disabled={loading}
                className="flex-1 flex items-center justify-center bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retake
              </button>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Verification'}
              </button>
            </div>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
