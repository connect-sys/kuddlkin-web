import React, { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface MobileCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => void;
}

const MobileCaptureModal: React.FC<MobileCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isOpen) startCamera();
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      // Flash effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 120);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
            onCapture(file);
            stopCamera();
            onClose();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white opacity-80 rounded-lg pointer-events-none transition-all duration-150" />
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Take Your Selfie</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-4">Position yourself in the center</p>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 px-4 py-2 bg-[#578f82] text-white rounded-lg hover:bg-[#4a7c70] transition-colors"
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCaptureModal;
