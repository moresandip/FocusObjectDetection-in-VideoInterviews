import React from 'react';
import { Play, Square, Download, FileText, User } from 'lucide-react';

interface InterviewControlsProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  onGenerateReport: () => void;
  candidateName: string;
  onCandidateNameChange: (name: string) => void;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  isActive,
  onStart,
  onStop,
  onGenerateReport,
  candidateName,
  onCandidateNameChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-1">
            Candidate Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              id="candidateName"
              value={candidateName}
              onChange={(e) => onCandidateNameChange(e.target.value)}
              placeholder="Enter candidate name"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isActive}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={!candidateName.trim()}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>Start Interview</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Square className="w-4 h-4" />
            <span>Stop Interview</span>
          </button>
        )}

        <button
          onClick={onGenerateReport}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
};