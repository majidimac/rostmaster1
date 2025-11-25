import React, { useEffect, useRef, useCallback } from 'react';
import { Flame, Wind, RotateCw, Zap, LogOut } from 'lucide-react';
import { ControlType, EventType, RoastEvent } from '../../types';
import { getEventDescription } from '../../utils/helpers';

interface RoastTimelineProps {
  events: RoastEvent[];
  duration: number;
  currentTime: number;
  isEditing: boolean;
  onEventUpdate?: (event: RoastEvent) => void;
  onEventClick?: (event: RoastEvent) => void;
  highlightedEventTimestamp?: number | null;
}

const getEventIcon = (event: RoastEvent) => {
  switch (event.type) {
    case EventType.FirstCrack:
      return <Zap className="w-5 h-5 text-orange-400" />;
    case EventType.Discharge:
      return <LogOut className="w-5 h-5 text-red-500" />;
    case EventType.ControlChange:
      switch (event.control) {
        case ControlType.Flame:
          return <Flame className="w-4 h-4 text-red-400" />;
        case ControlType.DrumFan:
        case ControlType.CoolingFan:
          return <Wind className="w-4 h-4 text-cyan-400" />;
        case ControlType.DrumRotation:
        case ControlType.DrumSpeed:
          return <RotateCw className="w-4 h-4 text-green-400" />;
        default:
          return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      }
    default:
      return null;
  }
};

export const RoastTimeline: React.FC<RoastTimelineProps> = ({
  events,
  duration,
  currentTime,
  isEditing,
  onEventUpdate,
  onEventClick,
  highlightedEventTimestamp,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const draggingEventRef = useRef<RoastEvent | null>(null);

  const handleMouseDown = (e: React.MouseEvent, roastEvent: RoastEvent) => {
    if (!isEditing || !onEventUpdate) return;
    draggingEventRef.current = roastEvent;
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingEventRef.current || !timelineRef.current || !onEventUpdate) return;

      const timelineBounds = timelineRef.current.getBoundingClientRect();
      const newX = e.clientX - timelineBounds.left;
      const percent = Math.max(0, Math.min(1, newX / timelineBounds.width));
      const newTimestamp = Math.round(percent * duration);

      onEventUpdate({ ...draggingEventRef.current, timestamp: newTimestamp });
    },
    [duration, onEventUpdate]
  );

  const handleMouseUp = useCallback(() => {
    draggingEventRef.current = null;
  }, []);

  useEffect(() => {
    if (isEditing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isEditing, handleMouseMove, handleMouseUp]);

  const progressPercent = (currentTime / (duration || 1)) * 100;

  return (
    <div className="bg-gray-900 p-4 rounded-lg my-4 border border-gray-800 shadow-inner">
      <h3 className="text-xs font-medium text-gray-500 mb-6 uppercase tracking-wider">نوار زمان رُست</h3>
      <div ref={timelineRef} className="relative w-full h-10 pt-2 pb-2 select-none">
        {/* Base Line */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-700 rounded-full" />

        {/* Events */}
        {events.map((event, index) => {
          const uniqueKey = `${event.type}-${event.control}-${event.timestamp}-${index}`;
          return (
            <div
              key={uniqueKey}
              className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${(event.timestamp / duration) * 100}%`, zIndex: 10 }}
              onMouseDown={isEditing ? (e) => handleMouseDown(e, event) : undefined}
              onClick={isEditing ? () => onEventClick?.(event) : undefined}
            >
              <div
                className={`relative flex items-center justify-center -translate-x-1/2 ${
                  isEditing ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                <div
                  className={`absolute w-full h-full rounded-full transition-transform duration-200 ${
                    draggingEventRef.current === event ? 'scale-150 bg-amber-500/50' : ''
                  } ${
                    highlightedEventTimestamp === event.timestamp
                      ? 'animate-ping absolute h-6 w-6 rounded-full bg-amber-400 opacity-75'
                      : ''
                  }`}
                />
                <div className="relative bg-gray-800 rounded-full p-1 border border-gray-600 shadow-sm">
                  {getEventIcon(event)}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-xs text-white bg-gray-800 border border-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
                  {getEventDescription(event, true)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};