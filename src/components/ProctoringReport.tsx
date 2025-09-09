import React from 'react';
import { X, Download, Calendar, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProctoringSession } from '../types/proctoring';

interface ProctoringReportProps {
  session: ProctoringSession;
  isOpen: boolean;
  onClose: () => void;
}

export const ProctoringReport: React.FC<ProctoringReportProps> = ({
  session,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const duration = (session.endTime || Date.now()) - session.startTime;
  
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const calculateIntegrityScore = () => {
    let score = 100;
    
    session.events.forEach(event => {
      switch (event.type) {
        case 'focus_lost':
          score -= Math.min(10, (event.duration || 0) / 1000);
          break;
        case 'face_absent':
          score -= Math.min(15, (event.duration || 0) / 2000);
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

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const eventCounts = session.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const downloadReport = () => {
    const reportData = {
      candidateName: session.candidateName,
      startTime: new Date(session.startTime).toISOString(),
      endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
      duration: formatDuration(duration),
      integrityScore,
      totalEvents: session.events.length,
      eventBreakdown: eventCounts,
      events: session.events.map(event => ({
        type: event.type,
        timestamp: new Date(event.timestamp).toISOString(),
        description: event.description,
        duration: event.duration
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proctoring-report-${session.candidateName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Proctoring Report</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Candidate Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{session.candidateName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(session.startTime).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{new Date(session.startTime).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center bg-blue-50 rounded-lg p-4">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{formatDuration(duration)}</p>
              <p className="text-sm text-gray-600">Total Duration</p>
            </div>
            <div className="text-center bg-red-50 rounded-lg p-4">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{session.events.length}</p>
              <p className="text-sm text-gray-600">Total Events</p>
            </div>
            <div className={`text-center ${integrityScore >= 80 ? 'bg-green-50' : integrityScore >= 60 ? 'bg-yellow-50' : 'bg-red-50'} rounded-lg p-4`}>
              {integrityScore >= 80 ? (
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${getScoreColor(integrityScore)}`}>
                {integrityScore}%
              </p>
              <p className="text-sm text-gray-600">
                Integrity Score ({getScoreLabel(integrityScore)})
              </p>
            </div>
          </div>

          {/* Event Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Event Breakdown</h3>
            {Object.entries(eventCounts).length === 0 ? (
              <div className="text-center py-8 bg-green-50 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <p className="text-green-800 font-medium">No issues detected during the interview</p>
                <p className="text-green-600 text-sm">Excellent performance!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(eventCounts).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center bg-gray-50 rounded p-3">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                      {count} occurrences
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Events */}
          {session.events.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Detailed Events</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {session.events.map((event, index) => (
                  <div key={event.id} className="border rounded p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-medium capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};