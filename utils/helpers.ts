import { ControlType, EventType, RoastEvent } from '../types';

export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const toCamelCase = (str: string): string => {
  return str.toLowerCase().replace(/_([a-z])/g, (_match, p1) => p1.toUpperCase());
};

export const getEventDescription = (event: RoastEvent, includeTime = true): string => {
  const time = formatTime(event.timestamp);
  const timeString = includeTime ? ` در ${time}` : '';

  switch (event.type) {
    case EventType.FirstCrack:
      return `ترک اول${timeString}`;
    case EventType.Discharge:
      return `تخلیه${timeString}`;
    case EventType.ControlChange: {
      const controlLabels: Record<string, string> = {
        [ControlType.Flame]: 'شعله',
        [ControlType.DrumFan]: 'فن درام',
        [ControlType.CoolingFan]: 'فن کولینگ',
        [ControlType.DrumRotation]: 'چرخش درام',
        [ControlType.DrumSpeed]: 'سرعت درام',
      };
      const controlLabel = (event.control && controlLabels[event.control]) || event.control;
      const valueLabel = event.control === ControlType.DrumSpeed ? `${event.value} RPM` : event.value;
      return `${controlLabel} به ${valueLabel}${timeString}`;
    }
    default:
      return '';
  }
};