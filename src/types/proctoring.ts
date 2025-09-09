export interface DetectionEvent {
  id: string;
  type: 'focus_lost' | 'face_absent' | 'multiple_faces' | 'phone_detected' | 'book_detected' | 'device_detected';
  timestamp: number;
  duration?: number;
  confidence?: number;
  description: string;
}

export interface ProctoringSession {
  candidateName: string;
  startTime: number;
  endTime?: number;
  events: DetectionEvent[];
  totalFocusLostTime: number;
  totalAbsentTime: number;
  integrityScore: number;
}

export interface DetectionState {
  isFacePresent: boolean;
  isFocused: boolean;
  faceCount: number;
  detectedObjects: string[];
  lastFaceTime: number;
  lastFocusTime: number;
  focusLostStart: number;
  absentStart: number;
}