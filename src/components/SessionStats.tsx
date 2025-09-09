import React from 'react';
import { BarChart3, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProctoringSession } from '../types/proctoring';

interface SessionStatsProps {
  session: ProctoringSession;
  isActive: boolean;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session, isActive }) => {
  const duration = isActive 
    ? Date.now() - session.startTime
    : (session.endTime || Date.now()) - session.startTime;
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateIntegrityScore = () => {
    let score = 100;
    
    // Deduct points based on events
    session.events.forEach(event => {
      switch (event.type) {
        case 'focus_lost':
          score -= Math.min(10, (event.duration || 0) / 1000); // 1 point per second, max 10
          break;
        case 'face_absent':
          score -= Math.min(15, (event.duration || 0) / 2000); // 1 point per 2 seconds, max 15
          break;
        case 'multiple_faces':
          score -= 5;
          break;
        case 'phone_detected':
          score -= 20;
          break;
        case 'book_detected':
          score -= 15;
          break;
        case 'device_detected':
          score -= 10;
          break;
      }
    });
    
    return Math.max(0, Math.round(score));
  };

  const integrityScore = calculateIntegrityScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const eventCounts = session.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-gray-800 text-white p-3 flex items-center space-x-2">
        <BarChart3 className="w-5 h-5" />
        <span className="font-medium">Session Statistics</span>
        {isActive && <span className="text-green-400 text-sm">● LIVE</span>}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Clock className="w-6 h-6 mx-auto mb-1 text-gray-600" />
            <p className="text-lg font-bold">{formatDuration(duration)}</p>
            <p className="text-sm text-gray-600">Duration</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(integrityScore)}`}>
              {integrityScore}%
            </div>
            <p className="text-sm text-gray-600">Integrity Score</p>
          </div>
        </div>

        {/* Event Summary */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Event Summary
          </h3>
          <div className="space-y-2">
            {Object.entries(eventCounts).length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
                <p className="text-sm">No issues detected</p>
              </div>
            ) : (
              Object.entries(eventCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {type.replace('_', ' ')}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};