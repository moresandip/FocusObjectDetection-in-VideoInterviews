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
    if (!videoElementRef.current || !candidateName.trim()) return;
    
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ProctorVision AI</h1>
              <p className="text-gray-300 text-sm">AI-Powered Interview Monitoring System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  AI Models: {isModelLoaded ? 'Ready' : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
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