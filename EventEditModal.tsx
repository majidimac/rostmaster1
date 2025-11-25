import React, { useState } from 'react';
import { ControlType, EventType, RoastEvent } from '../../types';
import { getEventDescription } from '../../utils/helpers';

/**
 * Props for the EventEditModal component.
 */
interface EventEditModalProps {
  /** The event to be edited. */
  event: RoastEvent;
  /** A callback function to be called when the event is saved. */
  onSave: (event: RoastEvent) => void;
  /** A callback function to be called when the modal is closed. */
  onClose: () => void;
}

/**
 * A modal component for editing the details of a roast event,
 * such as its timestamp and value.
 * @param {EventEditModalProps} props The component props.
 * @returns {JSX.Element} The rendered event edit modal.
 */
export const EventEditModal: React.FC<EventEditModalProps> = ({ event, onSave, onClose }) => {
  const [tempEvent, setTempEvent] = useState<RoastEvent>(event);

  /**
   * Handles changes to the event's timestamp.
   * @param {React.ChangeEvent<HTMLInputElement>} e The change event.
   */
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = parseInt(e.target.value, 10) || 0;
    setTempEvent((prev) => ({ ...prev, timestamp: seconds }));
  };

  /**
   * Handles changes to the event's value.
   * @param {string | number} value The new value.
   */
  const handleValueChange = (value: string | number) => {
    setTempEvent((prev) => ({ ...prev, value }));
  };

  /**
   * Renders the appropriate editor for the event's value,
   * depending on the control type.
   * @returns {JSX.Element | null} The rendered value editor.
   */
  const renderValueEditor = () => {
    if (tempEvent.type !== EventType.ControlChange || !tempEvent.control) return null;

    switch (tempEvent.control) {
      case ControlType.Flame:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">سطح شعله</label>
            <div className="grid grid-cols-4 gap-2">
              {['OFF', 'LOW', 'MEDIUM', 'HIGH'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleValueChange(val)}
                  className={`py-2 rounded-md text-sm font-medium ${
                    tempEvent.value === val ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      case ControlType.DrumFan:
      case ControlType.CoolingFan:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">وضعیت فن</label>
            <div className="grid grid-cols-2 gap-2">
              {['OFF', 'ON'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleValueChange(val)}
                  className={`py-2 rounded-md text-sm font-medium ${
                    tempEvent.value === val ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      case ControlType.DrumRotation:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">جهت چرخش</label>
            <div className="grid grid-cols-2 gap-2">
              {['LEFT', 'RIGHT'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleValueChange(val)}
                  className={`py-2 rounded-md text-sm font-medium ${
                    tempEvent.value === val ? 'bg-amber-500 text-black' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        );
      case ControlType.DrumSpeed:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">سرعت درام (RPM): {tempEvent.value}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Number(tempEvent.value)}
              onChange={(e) => handleValueChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md space-y-4 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-amber-400">ویرایش رویداد</h2>
        <p className="text-sm text-gray-300 bg-gray-900 p-2 rounded border border-gray-700">
          {getEventDescription(event, true)}
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">زمان (ثانیه)</label>
          <input
            type="number"
            value={tempEvent.timestamp}
            onChange={handleTimestampChange}
            className="w-full bg-gray-700 p-3 rounded-md border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
        {renderValueEditor()}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onSave(tempEvent)}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ذخیره
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 text-gray-200 font-bold py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};