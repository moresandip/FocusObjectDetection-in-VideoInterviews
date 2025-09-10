import React, { useState, useCallback, useRef } from 'react';
import { Monitor, Shield } from 'lucide-react';
import { VideoMonitor } from './components/VideoMonitor';
import { EventLog } from './components/EventLog';
import { SessionStats } from './components/SessionStats';
import { InterviewControls } from './components/InterviewControls';
import { ProctoringReport } from './components/ProctoringReport';
import { useVideoDetection } from './hooks/useVideoDetection';
import { DetectionEvent, ProctoringSession } from './types/proctoring';

function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [currentSession, setCurrentSession] = useState<ProctoringSession>({
    candidateName: '',
    startTime: Date.now(),
    events: [],
    totalFocusLostTime: 0,
    totalAbsentTime: 0,
    integrityScore: 100
  });
  const [showReport, setShowReport] = useState(false);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const { isModelLoaded, detectionState, startDetection, stopDetection } = useVideoDetection();

  const handleVideoReady = useCallback((videoElement: HTMLVideoElement) => {
    videoElementRef.current = videoElement;
  }, []);

  const handleNewEvent = useCallback((event: DetectionEvent) => {
    setCurrentSession(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));
  }, []);

  const handleStartInterview = useCallback(() => {
    if (!candidateName.trim()) {
      alert('Please enter candidate name before starting the interview.');
      return;
    }
    
    if (!videoElementRef.current) {
      alert('Please wait for camera to be ready before starting the interview.');
      return;
    }
    
    if (!isModelLoaded) {
      alert('Please wait for AI models to load before starting the interview.');
      return;
    }
    
    const newSession: ProctoringSession = {
      candidateName: candidateName.trim(),
      startTime: Date.now(),
      events: [],
      totalFocusLostTime: 0,
      totalAbsentTime: 0,
      integrityScore: 100
    };
    
    setCurrentSession(newSession);
    setIsSessionActive(true);
    startDetection(videoElementRef.current, handleNewEvent);
  }, [candidateName, startDetection, handleNewEvent]);

  const handleStopInterview = useCallback(() => {
    stopDetection();
    setIsSessionActive(false);
    setCurrentSession(prev => ({
      ...prev,
      endTime: Date.now()
    }));
  }, [stopDetection]);

  const handleGenerateReport = useCallback(() => {
    setShowReport(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">ProctorVision AI</h1>
              <p className="text-blue-200 text-sm font-medium">AI-Powered Interview Monitoring System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full shadow-sm ${isModelLoaded ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-semibold text-gray-700">
                  AI Models: {isModelLoaded ? 'Ready' : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full shadow-sm ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-semibold text-gray-700">
                  Session: {isSessionActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Controls */}
        <InterviewControls
          isActive={isSessionActive}
          onStart={handleStartInterview}
          onStop={handleStopInterview}
          onGenerateReport={handleGenerateReport}
          candidateName={candidateName}
          onCandidateNameChange={setCandidateName}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Monitor - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <VideoMonitor
              onVideoReady={handleVideoReady}
              detectionState={detectionState}
            />
          </div>

          {/* Session Stats */}
          <div>
            <SessionStats
              session={currentSession}
              isActive={isSessionActive}
            />
          </div>
        </div>

        {/* Event Log - Full width */}
        <EventLog events={currentSession.events} />
      </div>

      {/* Report Modal */}
      <ProctoringReport
        session={currentSession}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}

export default App;