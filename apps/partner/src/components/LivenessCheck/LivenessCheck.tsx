import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Camera as CameraIcon } from 'lucide-react';

interface LivenessCheckProps {
  onVerified: (image: string) => void;
  onCancel?: () => void;
}

type Direction = 'left' | 'right';

const LivenessCheck: React.FC<LivenessCheckProps> = ({ onVerified, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<'loading' | 'detecting' | 'success' | 'failed'>('loading');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [completedDirections, setCompletedDirections] = useState<Set<Direction>>(new Set());
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const stateRef = useRef({
    status: 'loading' as string,
    completedDirections: new Set<Direction>(),
    currentDirection: null as Direction | null,
    directionHistory: [] as number[], // For smoothing detection
  });

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current) {
      return null;
    }
    
    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      return null;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    // Mirror the image (flip horizontally)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    return dataURL;
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback(() => {
    stateRef.current.status = 'success';
    setStatus('success');
    
    // Countdown from 3 to 1
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Wait 3 seconds after liveness verification before capturing image
    setTimeout(() => {
      const image = captureImage();
      if (image) {
        setTimeout(() => {
          stopCamera();
          onVerified(image);
        }, 500);
      } else {
        setStatus('failed');
      }
    }, 3000); // 3 second delay before capture
  }, [captureImage, onVerified, stopCamera]);

  const getHeadDirection = (landmarks: faceapi.FaceLandmarks68): Direction | null => {
    const nose = landmarks.getNose();
    const leftCheek = landmarks.getJawOutline()[0];
    const rightCheek = landmarks.getJawOutline()[16];

    // Calculate horizontal direction (left/right only)
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
    const noseCenterX = nose[3].x;
    const faceCenterX = (leftCheek.x + rightCheek.x) / 2;
    const horizontalOffset = (noseCenterX - faceCenterX) / faceWidth;

    // Add to history for smoothing (keep last 5 readings)
    stateRef.current.directionHistory.push(horizontalOffset);
    if (stateRef.current.directionHistory.length > 5) {
      stateRef.current.directionHistory.shift();
    }

    // Calculate smoothed average
    const avgOffset = stateRef.current.directionHistory.reduce((a, b) => a + b, 0) / stateRef.current.directionHistory.length;

    console.log('Head direction - Horizontal:', horizontalOffset.toFixed(3), 'Smoothed:', avgOffset.toFixed(3));

    // More lenient thresholds for smoother detection
    if (avgOffset > 0.12) return 'left';  // User's left (appears right in mirrored video)
    if (avgOffset < -0.12) return 'right'; // User's right (appears left in mirrored video)

    return null;
  };

  const runDetection = useCallback(() => {
    if (!videoRef.current || !modelsLoaded) return;

    intervalRef.current = setInterval(async () => {
      if (stateRef.current.status !== 'detecting') return;
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        if (!detection) {
          setCurrentDirection(null);
          stateRef.current.currentDirection = null;
          return;
        }

        const landmarks = detection.landmarks;
        const direction = getHeadDirection(landmarks);
        
        setCurrentDirection(direction);
        stateRef.current.currentDirection = direction;

        // Check if this direction is completed
        if (direction && !stateRef.current.completedDirections.has(direction)) {
          // Add a small delay to ensure user holds the position
          setTimeout(() => {
            if (stateRef.current.currentDirection === direction && !stateRef.current.completedDirections.has(direction)) {
              const newCompleted = new Set(stateRef.current.completedDirections);
              newCompleted.add(direction);
              stateRef.current.completedDirections = newCompleted;
              setCompletedDirections(new Set(newCompleted));
              // Check if all directions are completed (only left and right)
              if (newCompleted.size >= 2) {
                handleSuccess();
              }
            }
          }, 500); // Hold position for 500ms (smoother)
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    }, 150);
  }, [modelsLoaded, handleSuccess]);

  const handleStart = useCallback(async () => {
    setCameraError(null);
    setStatus('loading');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera is not supported in this browser.');
        setStatus('failed');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      }

      stateRef.current = {
        status: 'detecting',
        completedDirections: new Set(),
        currentDirection: null,
        directionHistory: [],
      };
      setCompletedDirections(new Set());
      setCurrentDirection(null);
      setStatus('detecting');

    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings, then reload.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
        setCameraError('Camera is in use by another app. Close other camera apps and try again.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error'}`);
      }
      setStatus('failed');
    }
  }, [modelsLoaded]);

  useEffect(() => {
    if (status === 'detecting' && modelsLoaded) {
      runDetection();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, modelsLoaded, runDetection]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Auto-start on mount
  useEffect(() => {
    handleStart();
  }, [handleStart]);

  const handleRetry = () => {
    stopCamera();
    setStatus('loading');
    setCompletedDirections(new Set());
    setCurrentDirection(null);
    stateRef.current = {
      status: 'loading',
      completedDirections: new Set(),
      currentDirection: null,
      directionHistory: [],
    };
    handleStart();
  };

  const getDirectionStyle = (direction: Direction) => {
    const isCompleted = completedDirections.has(direction);
    const isCurrent = currentDirection === direction;
    
    if (isCompleted) {
      return 'stroke-green-400 fill-green-400/20 animate-pulse';
    } else if (isCurrent) {
      return 'stroke-yellow-400 fill-yellow-400/20 animate-pulse';
    } else {
      return 'stroke-gray-400 fill-gray-400/10';
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
      <div className="relative aspect-[4/3]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />

        {/* Directional Circle Guide - Left/Right Only */}
        {status === 'detecting' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Main circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.3"
                />
                
                {/* Left semicircle */}
                <path
                  d="M 100 20 A 80 80 0 0 0 100 180 Z"
                  className={`transition-all duration-300 ${getDirectionStyle('left')}`}
                  strokeWidth="4"
                />
                
                {/* Right semicircle */}
                <path
                  d="M 100 20 A 80 80 0 0 1 100 180 Z"
                  className={`transition-all duration-300 ${getDirectionStyle('right')}`}
                  strokeWidth="4"
                />

                {/* Direction labels */}
                <text x="60" y="105" fill="white" fontSize="14" textAnchor="middle" className="font-bold">LEFT</text>
                <text x="140" y="105" fill="white" fontSize="14" textAnchor="middle" className="font-bold">RIGHT</text>
                
                {/* Center divider line */}
                <line x1="100" y1="20" x2="100" y2="180" stroke="white" strokeWidth="2" opacity="0.3" />
              </svg>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 z-10">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className={`px-3 py-1 rounded-full backdrop-blur-md font-semibold text-xs flex items-center gap-1.5 ${
              status === 'detecting' ? 'bg-black/50 text-white' :
              status === 'success' ? 'bg-green-500 text-white' :
              status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-800/80 text-gray-300'
            }`}>
              {status === 'detecting' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              {status === 'loading' ? 'LOADING...' :
               status === 'detecting' ? 'TURN YOUR HEAD' :
               status === 'success' ? 'VERIFIED' : 'FAILED'}
            </div>

            <div className="text-white/70 text-xs font-medium">
              {completedDirections.size}/2
            </div>
          </div>

          {/* Center content */}
          <div className="flex flex-col items-center justify-center flex-1">
            {/* Loading */}
            {status === 'loading' && (
              <div className="text-center space-y-3 animate-in fade-in duration-300">
                <Loader2 className="w-12 h-12 text-white/60 animate-spin mx-auto" />
                <p className="text-white/70 text-sm">Starting camera & loading models...</p>
              </div>
            )}

            {/* Error */}
            {cameraError && (
              <div className="text-center p-4 bg-red-500/80 backdrop-blur rounded-xl text-white max-w-xs animate-in fade-in duration-200">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{cameraError}</p>
              </div>
            )}

            {/* Detecting instructions */}
            {status === 'detecting' && !cameraError && (
              <div className="text-center space-y-3 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-white/15 backdrop-blur border-2 border-white/30">
                  <CameraIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white drop-shadow-lg">
                  Turn your head in all directions
                </h2>
                <p className="text-white/70 text-sm">
                  Move your head to light up each section
                </p>
              </div>
            )}

            {/* Success */}
            {status === 'success' && (
              <div className="text-center animate-in zoom-in duration-300">
                {countdown !== null ? (
                  <>
                    <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/50">
                      <span className="text-6xl font-bold text-white">{countdown}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Hold Still...</h2>
                    <p className="text-white/80 text-sm mt-2">Capturing your photo</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/50">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Liveness Verified!</h2>
                  </>
                )}
              </div>
            )}

            {/* Failed */}
            {status === 'failed' && !cameraError && (
              <div className="text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/50">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-3">Verification Failed</h2>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-all flex items-center gap-2 mx-auto active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </button>
              </div>
            )}
          </div>

          {/* Bottom — cancel */}
          <div className="text-center">
            {onCancel && (
              <button
                onClick={() => { stopCamera(); onCancel(); }}
                className="text-white/50 hover:text-white text-xs underline decoration-dotted transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivenessCheck;
