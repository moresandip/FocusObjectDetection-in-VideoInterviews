import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';

interface VideoMonitorProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void;
  detectionState: {
    isFacePresent: boolean;
    isFocused: boolean;
    faceCount: number;
    detectedObjects: string[];
  };
}

export const VideoMonitor: React.FC<VideoMonitorProps> = ({
  onVideoReady,
  detectionState
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadedmetadata', () => {
            setStreamError('');
            setIsStreaming(true);
            onVideoReady(videoRef.current!);
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        const domError = error as DOMException;
        
        switch (domError.name) {
          case 'NotAllowedError':
          setStreamError('CAMERA_ERROR');
            break;
          case 'NotFoundError':
            setStreamError('CAMERA_NOT_FOUND');
            break;
          case 'NotReadableError':
            setStreamError('CAMERA_IN_USE');
            break;
          case 'OverconstrainedError':
            setStreamError('CAMERA_CONSTRAINTS');
            break;
          default:
            setStreamError('CAMERA_ERROR');
        }
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoReady]);

  const retryCamera = async () => {
    setIsRetrying(true);
    setStreamError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setIsStreaming(true);
          onVideoReady(videoRef.current!);
        });
      }
    } catch (error) {
      console.error('Retry failed:', error);
      const domError = error as DOMException;
      if (domError.name === 'NotAllowedError') {
        setStreamError('PERMISSION_DENIED');
      } else {
        setStreamError('Unable to access camera. Please check your camera settings and try again.');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusColor = () => {
    if (!detectionState.isFacePresent) return 'text-red-500';
    if (!detectionState.isFocused) return 'text-yellow-500';
    if (detectionState.faceCount > 1) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!detectionState.isFacePresent) return <XCircle className="w-4 h-4" />;
    if (!detectionState.isFocused) return <AlertTriangle className="w-4 h-4" />;
    if (detectionState.faceCount > 1) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!detectionState.isFacePresent) return 'No face detected';
    if (!detectionState.isFocused) return 'Looking away';
    if (detectionState.faceCount > 1) return `${detectionState.faceCount} faces detected`;
    return 'Focused';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isStreaming ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          <span className="font-medium">Candidate Video</span>
        </div>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>
      
      <div className="relative">
        {streamError === 'PERMISSION_DENIED' ? (
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Permission Required</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                To start the interview monitoring, please allow camera access:
              </p>
              <div className="bg-white rounded-lg p-4 mb-4 text-left">
                <ol className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    Look for the camera icon 📷 in your browser's address bar
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    Click it and select "Allow\" for camera access
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    Click "Try Again\" below
                  </li>
                </ol>
              </div>
              <button
                onClick={retryCamera}
                disabled={isRetrying}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : streamError === 'CAMERA_NOT_FOUND' ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No camera found. Please connect a camera device.</p>
              <button
                onClick={retryCamera}
                disabled={isRetrying}
                className="mt-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : streamError === 'CAMERA_IN_USE' ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Camera is in use by another application.</p>
              <button
                onClick={retryCamera}
                disabled={isRetrying}
                className="mt-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : streamError ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Unable to access camera. Please check settings.</p>
              <button
                onClick={retryCamera}
                disabled={isRetrying}
                className="mt-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full aspect-video object-cover"
          />
        )}
        
        {/* Detection overlay */}
        {detectionState.detectedObjects.length > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Objects: {detectionState.detectedObjects.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};