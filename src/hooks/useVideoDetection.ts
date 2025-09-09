import { useRef, useCallback, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { DetectionEvent, DetectionState } from '../types/proctoring';

export const useVideoDetection = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionState, setDetectionState] = useState<DetectionState>({
    isFacePresent: false,
    isFocused: true,
    faceCount: 0,
    detectedObjects: [],
    lastFaceTime: Date.now(),
    lastFocusTime: Date.now(),
    focusLostStart: 0,
    absentStart: 0,
  });

  const faceDetectionModelRef = useRef<any>(null);
  const objectDetectionModelRef = useRef<any>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadModels = useCallback(async () => {
    try {
      // Load TensorFlow.js backend
      await tf.ready();
      
      // Load BlazeFace for face detection
      const faceModel = await import('@tensorflow-models/blazeface');
      faceDetectionModelRef.current = await faceModel.load();
      
      // Load COCO-SSD for object detection
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      objectDetectionModelRef.current = await cocoSsd.load();
      
      setIsModelLoaded(true);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }, []);

  const detectFaces = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!faceDetectionModelRef.current || !videoElement) return [];
    
    try {
      const predictions = await faceDetectionModelRef.current.estimateFaces(videoElement, false);
      return predictions;
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  }, []);

  const detectObjects = useCallback(async (videoElement: HTMLVideoElement) => {
    if (!objectDetectionModelRef.current || !videoElement) return [];
    
    try {
      const predictions = await objectDetectionModelRef.current.detect(videoElement);
      return predictions.filter((pred: any) => 
        ['cell phone', 'book', 'laptop', 'tv', 'remote', 'keyboard'].includes(pred.class)
      );
    } catch (error) {
      console.error('Object detection error:', error);
      return [];
    }
  }, []);

  const analyzeFocus = useCallback((faces: any[]) => {
    if (faces.length === 0) return false;
    
    const face = faces[0];
    if (!face.landmarks) return true;
    
    // Simple focus detection based on face angle
    // In a real implementation, you'd use more sophisticated gaze detection
    const landmarks = face.landmarks;
    const leftEye = landmarks[0];
    const rightEye = landmarks[1];
    const nose = landmarks[2];
    
    // Calculate approximate head pose
    const eyeCenter = [(leftEye[0] + rightEye[0]) / 2, (leftEye[1] + rightEye[1]) / 2];
    const faceCenter = face.topLeft[0] + (face.bottomRight[0] - face.topLeft[0]) / 2;
    
    // Simple heuristic: if eyes are roughly centered, assume focused
    const deviation = Math.abs(eyeCenter[0] - faceCenter) / (face.bottomRight[0] - face.topLeft[0]);
    return deviation < 0.3; // Allow 30% deviation
  }, []);

  const runDetection = useCallback(async (
    videoElement: HTMLVideoElement,
    onEvent: (event: DetectionEvent) => void
  ) => {
    if (!isModelLoaded || !videoElement) return;

    const faces = await detectFaces(videoElement);
    const objects = await detectObjects(videoElement);
    const currentTime = Date.now();

    setDetectionState(prevState => {
      const newState = { ...prevState };
      
      // Face presence detection
      const isFacePresent = faces.length > 0;
      newState.isFacePresent = isFacePresent;
      newState.faceCount = faces.length;
      
      if (isFacePresent) {
        newState.lastFaceTime = currentTime;
        if (prevState.absentStart > 0) {
          const duration = currentTime - prevState.absentStart;
          if (duration > 10000) { // 10 seconds
            onEvent({
              id: Date.now().toString(),
              type: 'face_absent',
              timestamp: prevState.absentStart,
              duration,
              description: `Face was absent for ${Math.round(duration / 1000)} seconds`
            });
          }
          newState.absentStart = 0;
        }
      } else {
        if (prevState.absentStart === 0) {
          newState.absentStart = currentTime;
        }
      }
      
      // Focus detection
      const isFocused = isFacePresent && analyzeFocus(faces);
      newState.isFocused = isFocused;
      
      if (isFocused) {
        newState.lastFocusTime = currentTime;
        if (prevState.focusLostStart > 0) {
          const duration = currentTime - prevState.focusLostStart;
          if (duration > 5000) { // 5 seconds
            onEvent({
              id: Date.now().toString(),
              type: 'focus_lost',
              timestamp: prevState.focusLostStart,
              duration,
              description: `Lost focus for ${Math.round(duration / 1000)} seconds`
            });
          }
          newState.focusLostStart = 0;
        }
      } else if (isFacePresent) {
        if (prevState.focusLostStart === 0) {
          newState.focusLostStart = currentTime;
        }
      }
      
      // Multiple faces detection
      if (faces.length > 1) {
        onEvent({
          id: Date.now().toString(),
          type: 'multiple_faces',
          timestamp: currentTime,
          description: `${faces.length} faces detected in frame`
        });
      }
      
      // Object detection
      const detectedObjects = objects.map((obj: any) => obj.class);
      newState.detectedObjects = detectedObjects;
      
      objects.forEach((obj: any) => {
        if (obj.score > 0.5) {
          let eventType: DetectionEvent['type'] = 'device_detected';
          if (obj.class === 'cell phone') eventType = 'phone_detected';
          if (obj.class === 'book') eventType = 'book_detected';
          
          onEvent({
            id: Date.now().toString(),
            type: eventType,
            timestamp: currentTime,
            confidence: obj.score,
            description: `${obj.class} detected with ${Math.round(obj.score * 100)}% confidence`
          });
        }
      });
      
      return newState;
    });
  }, [isModelLoaded, detectFaces, detectObjects, analyzeFocus]);

  const startDetection = useCallback((
    videoElement: HTMLVideoElement,
    onEvent: (event: DetectionEvent) => void
  ) => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    detectionIntervalRef.current = setInterval(() => {
      runDetection(videoElement, onEvent);
    }, 1000); // Run detection every second
  }, [runDetection]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    loadModels();
    return () => stopDetection();
  }, [loadModels, stopDetection]);

  return {
    isModelLoaded,
    detectionState,
    startDetection,
    stopDetection,
  };
};