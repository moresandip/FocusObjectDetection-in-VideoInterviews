import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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
            setIsStreaming(true);
            onVideoReady(videoRef.current!);
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        const domError = error as DOMException;
        
        switch (domError.name) {
          case 'NotAllowedError':
            setStreamError('Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
            break;
          case 'NotFoundError':
            setStreamError('No camera found. Please connect a camera device and refresh the page.');
            break;
          case 'NotReadableError':
            setStreamError('Camera is already in use by another application. Please close other applications using the camera and refresh.');
            break;
          case 'OverconstrainedError':
            setStreamError('Camera does not support the requested video settings. Please try with a different camera.');
            break;
          default:
            setStreamError('Unable to access camera. Please check your camera settings and refresh the page.');
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
        {streamError ? (
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">{streamError}</p>
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
            Objects: {detectedState.detectedObjects.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};