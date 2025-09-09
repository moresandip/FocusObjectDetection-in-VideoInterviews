import React from 'react';
import { AlertTriangle, Clock, Eye, Users, Smartphone, Book, Monitor } from 'lucide-react';
import { DetectionEvent } from '../types/proctoring';

interface EventLogProps {
  events: DetectionEvent[];
}

export const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const getEventIcon = (type: DetectionEvent['type']) => {
    switch (type) {
      case 'focus_lost': return <Eye className="w-4 h-4" />;
      case 'face_absent': return <Users className="w-4 h-4" />;
      case 'multiple_faces': return <Users className="w-4 h-4" />;
      case 'phone_detected': return <Smartphone className="w-4 h-4" />;
      case 'book_detected': return <Book className="w-4 h-4" />;
      case 'device_detected': return <Monitor className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: DetectionEvent['type']) => {
    switch (type) {
      case 'focus_lost': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'face_absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'multiple_faces': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'phone_detected': return 'text-red-600 bg-red-50 border-red-200';
      case 'book_detected': return 'text-red-600 bg-red-50 border-red-200';
      case 'device_detected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-gray-800 text-white p-3 flex items-center space-x-2">
        <Clock className="w-5 h-5" />
        <span className="font-medium">Event Log</span>
        <span className="text-sm text-gray-300">({events.length} total events)</span>
      </div>
      
      <div className="p-4">
        {recentEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No events detected yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className={`border rounded-lg p-3 ${getEventColor(event.type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {event.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{event.description}</p>
                    {event.duration && (
                      <p className="text-xs mt-1 opacity-75">
                        Duration: {Math.round(event.duration / 1000)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};