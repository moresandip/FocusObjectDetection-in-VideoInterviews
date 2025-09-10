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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <label htmlFor="candidateName" className="block text-sm font-semibold text-gray-800 mb-2">
            Candidate Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
            <input
              type="text"
              id="candidateName"
              value={candidateName}
              onChange={(e) => onCandidateNameChange(e.target.value)}
              placeholder="Enter candidate name"
              className="w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-800 font-medium"
              disabled={isActive}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={!candidateName.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
          >
            <Play className="w-5 h-5" />
            <span>Start Interview</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Square className="w-5 h-5" />
            <span>Stop Interview</span>
          </button>
        )}

        <button
          onClick={onGenerateReport}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <FileText className="w-5 h-5" />
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
};