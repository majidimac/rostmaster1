import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Edit, ArrowLeft } from 'lucide-react';
import { RoastProfile, RoastEvent, ControlType, EventType } from '../../types';
import { formatTime, toCamelCase, getEventDescription } from '../../utils/helpers';
import { RoastTimeline } from './RoastTimeline';
import { EventEditModal } from './EventEditModal';

interface RoastControlPanelProps {
  profileToLoad?: RoastProfile;
  onBack: () => void;
  onSave: (profile: RoastProfile) => void;
}

export const RoastControlPanel: React.FC<RoastControlPanelProps> = ({ profileToLoad, onBack, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devTimer, setDevTimer] = useState(0);
  const [firstCrackTime, setFirstCrackTime] = useState<number | null>(null);
  const [nextEvent, setNextEvent] = useState<RoastEvent | null>(null);
  const [highlightedEventTimestamp, setHighlightedEventTimestamp] = useState<number | null>(null);
  const [eventToEdit, setEventToEdit] = useState<RoastEvent | null>(null);

  const [profileName, setProfileName] = useState('');
  const [greenBeanWeight, setGreenBeanWeight] = useState(0);
  const [chargeTemp, setChargeTemp] = useState(0);
  const [finalWeight, setFinalWeight] = useState(0);
  const [finalTemp, setFinalTemp] = useState(0);
  const [greenBeanPrice, setGreenBeanPrice] = useState(0);
  const [roastFee, setRoastFee] = useState(0);
  const [isEditingFinal, setIsEditingFinal] = useState(false);

  const [baseFlameLevel, setBaseFlameLevel] = useState('LOW');

  const [events, setEvents] = useState<RoastEvent[]>([]);
  const [editableEvents, setEditableEvents] = useState<RoastEvent[]>([]);

  const [controls, setControls] = useState<Record<string, any>>({
    flame: 'OFF',
    drumFan: 'OFF',
    coolingFan: 'OFF',
    drumRotation: 'LEFT',
    drumSpeed: 0,
  });

  const timerIntervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (profileToLoad) {
      setProfileName(profileToLoad.name);
      setGreenBeanWeight(profileToLoad.greenBeanWeight);
      setChargeTemp(profileToLoad.chargeTemp);
      setFinalWeight(profileToLoad.finalWeight || 0);
      setFinalTemp(profileToLoad.finalTemp || 0);
      setGreenBeanPrice(profileToLoad.greenBeanPrice || 0);
      setRoastFee(profileToLoad.roastFee || 0);
      setEvents(profileToLoad.events);
      const initialControls: any = {
        flame: 'OFF',
        drumFan: 'OFF',
        coolingFan: 'OFF',
        drumRotation: 'LEFT',
        drumSpeed: 0,
      };
      profileToLoad.events
        .filter((e) => e.timestamp === 0 && e.type === EventType.ControlChange && e.control)
        .forEach((e) => {
          const key = toCamelCase(e.control as string);
          initialControls[key] = e.value;
        });
      setControls(initialControls);
      const initialFlameValue = initialControls.flame;
      if (initialFlameValue !== 'OFF') {
        setBaseFlameLevel(initialFlameValue);
      } else {
        const firstFlameOnEvent = profileToLoad.events.find(
          (e) => e.control === ControlType.Flame && e.value !== 'OFF'
        );
        setBaseFlameLevel(firstFlameOnEvent ? (firstFlameOnEvent.value as string) : 'LOW');
      }
    } else {
      setIsRecording(false);
      setIsReplaying(false);
      setIsEditing(false);
      stopTimer();
      setTimer(0);
      setDevTimer(0);
      setFirstCrackTime(null);
      setNextEvent(null);
      setProfileName('');
      setGreenBeanWeight(0);
      setChargeTemp(0);
      setFinalWeight(0);
      setFinalTemp(0);
      setGreenBeanPrice(0);
      setRoastFee(0);
      setIsEditingFinal(false);
      setBaseFlameLevel('LOW');
      setEvents([]);
      setEditableEvents([]);
      setControls({ flame: 'OFF', drumFan: 'OFF', coolingFan: 'OFF', drumRotation: 'LEFT', drumSpeed: 0 });
    }
  }, [profileToLoad, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  useEffect(() => {
    if (isReplaying && profileToLoad) {
      const upcomingEvent = profileToLoad.events
        .filter((e) => e.timestamp > timer)
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      setNextEvent(upcomingEvent || null);
    } else {
      setNextEvent(null);
    }
  }, [timer, isReplaying, profileToLoad]);

  const startTimer = () => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => setTimer((prev) => prev + 1), 1000);
  };

  const handleStart = () => {
    if (!profileName || greenBeanWeight <= 0 || chargeTemp <= 0) {
      alert('لطفاً نام پروفایل، وزن دانه سبز و دمای شروع را وارد کنید.');
      return;
    }

    const initialEvents: RoastEvent[] = [];
    Object.keys(controls).forEach((key) => {
      const controlTypeMap: Record<string, ControlType> = {
        flame: ControlType.Flame,
        drumFan: ControlType.DrumFan,
        coolingFan: ControlType.CoolingFan,
        drumRotation: ControlType.DrumRotation,
        drumSpeed: ControlType.DrumSpeed,
      };
      initialEvents.push({
        timestamp: 0,
        type: EventType.ControlChange,
        control: controlTypeMap[key],
        value: controls[key],
      });
    });

    setIsRecording(true);
    setEvents(initialEvents);
    startTimer();
  };

  const handleStartReplay = () => {
    stopTimer();
    setTimer(0);
    setDevTimer(0);
    setFirstCrackTime(null);
    if (profileToLoad) {
      const initialControls: any = {
        flame: 'OFF',
        drumFan: 'OFF',
        coolingFan: 'OFF',
        drumRotation: 'LEFT',
        drumSpeed: 0,
      };
      profileToLoad.events
        .filter((e) => e.timestamp === 0 && e.type === EventType.ControlChange && e.control)
        .forEach((e) => {
          const key = toCamelCase(e.control as string);
          initialControls[key] = e.value;
        });
      setControls(initialControls);
    }
    setIsReplaying(true);
    startTimer();
  };

  const handleDischarge = () => {
    setIsRecording(false);
    stopTimer();
    const dischargeEvent: RoastEvent = { timestamp: timer, type: EventType.Discharge };
    const finalEvents = [...events, dischargeEvent];
    setEvents(finalEvents);
    const newProfile: RoastProfile = {
      id: profileToLoad?.id || Date.now().toString(),
      name: profileName,
      greenBeanWeight,
      chargeTemp,
      events: finalEvents,
      createdAt: profileToLoad?.createdAt || new Date().toISOString(),
      finalWeight: finalWeight || undefined,
      finalTemp: finalTemp || undefined,
    };
    onSave(newProfile);
  };

  const addEvent = useCallback(
    (type: EventType, control?: ControlType, value?: string | number, eventTime = timer) => {
      if (isRecording) {
        setEvents((prev) => [...prev, { timestamp: eventTime, type, control, value }]);
      }
    },
    [isRecording, timer]
  );

  const handleControlChange = (control: ControlType, value: string | number) => {
    setControls((prev) => ({ ...prev, [toCamelCase(control)]: value }));
    if (isRecording) addEvent(EventType.ControlChange, control, value);
  };

  const handleInitialControlChange = (controlKey: string, value: string | number) => {
    if (profileToLoad) return;
    setControls((prev) => ({ ...prev, [controlKey]: value }));
    if (controlKey === 'flame' && value !== 'OFF') {
      setBaseFlameLevel(value as string);
    }
  };

  const handleSetBaseFlameLevel = (level: string) => {
    setBaseFlameLevel(level);
    if (isRecording && controls.flame !== 'OFF') handleControlChange(ControlType.Flame, level);
  };

  const handleToggleFlame = () => {
    if (!isRecording) return;
    handleControlChange(ControlType.Flame, controls.flame === 'OFF' ? baseFlameLevel : 'OFF');
  };

  const handleFirstCrack = () => {
    setFirstCrackTime(timer);
    addEvent(EventType.FirstCrack);
  };

  const handleSaveFinalDetails = () => {
    if (profileToLoad) {
      onSave({ ...profileToLoad, finalWeight, finalTemp, greenBeanPrice, roastFee });
      setIsEditingFinal(false);
    }
  };

  useEffect(() => {
    if (firstCrackTime !== null) setDevTimer(timer - firstCrackTime);
  }, [timer, firstCrackTime]);

  const playBeep = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  useEffect(() => {
    if (isReplaying) {
      const currentEvents = profileToLoad?.events.filter((e) => e.timestamp === timer) || [];
      if (currentEvents.length > 0) {
        playBeep();
        setHighlightedEventTimestamp(timer);
        setTimeout(() => setHighlightedEventTimestamp(null), 500);
      }
      currentEvents.forEach((event) => {
        if (
          event.type === EventType.ControlChange &&
          event.control &&
          typeof event.value !== 'undefined'
        ) {
          if (event.control === ControlType.Flame && event.value !== 'OFF') {
            setBaseFlameLevel(event.value as string);
          }
          setControls((prev) => ({ ...prev, [toCamelCase(event.control as string)]: event.value }));
        }
        if (event.type === EventType.FirstCrack) setFirstCrackTime(event.timestamp);
        if (event.type === EventType.Discharge) {
          stopTimer();
          setIsReplaying(false);
        }
      });
    }
  }, [timer, isReplaying, profileToLoad, stopTimer, playBeep]);

  const handleEditProfile = () => {
    if (profileToLoad) {
      setEditableEvents([...profileToLoad.events].sort((a, b) => a.timestamp - b.timestamp));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableEvents([]);
    // Reset fields to original values if cancelled
    if (profileToLoad) {
      setProfileName(profileToLoad.name);
      setGreenBeanWeight(profileToLoad.greenBeanWeight);
      setChargeTemp(profileToLoad.chargeTemp);
    }
  };

  const handleSaveChanges = () => {
    if (!profileName || greenBeanWeight <= 0 || chargeTemp <= 0) {
      alert('لطفاً نام پروفایل، وزن دانه سبز و دمای شروع معتبر وارد کنید.');
      return;
    }

    if (profileToLoad) {
      onSave({
        ...profileToLoad,
        name: profileName,
        greenBeanWeight: greenBeanWeight,
        chargeTemp: chargeTemp,
        events: editableEvents,
      });
      setIsEditing(false);
      setEditableEvents([]);
    }
  };

  const handleEventUpdate = (updatedEvent: RoastEvent) => {
    setEditableEvents((prev) =>
      prev
        .map((e) =>
          e === eventToEdit ||
          (e.timestamp === updatedEvent.timestamp &&
            e.control === updatedEvent.control &&
            e.type === updatedEvent.type)
            ? updatedEvent
            : e
        )
        .sort((a, b) => a.timestamp - b.timestamp)
    );
    if (eventToEdit) setEventToEdit(null);
  };

  const handleEventDragUpdate = (draggedEvent: RoastEvent) => {
    setEditableEvents((prev) =>
      prev
        .map((e) =>
          e.control === draggedEvent.control &&
          e.type === draggedEvent.type &&
          e.value === draggedEvent.value
            ? draggedEvent
            : e
        )
        .sort((a, b) => a.timestamp - b.timestamp)
    );
  };

  const ControlButton: React.FC<{ label: string; active: boolean; onClick: () => void; disabled?: boolean }> = ({
    label,
    active,
    onClick,
    disabled,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isReplaying || isEditing || (!!profileToLoad && !isRecording)}
      className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/30'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );

  const calculateDuration = () => {
    const currentEvents = isEditing ? editableEvents : events;
    const dischargeEvent = currentEvents.find((e) => e.type === EventType.Discharge);
    if (isRecording) return Math.max(timer, 1200);
    if (dischargeEvent) return dischargeEvent.timestamp;
    if (currentEvents.length > 0)
      return currentEvents.reduce((max, e) => Math.max(max, e.timestamp), 0) + 60;
    return 1200;
  };

  const finalCostPerKg = useMemo(() => {
    if (!profileToLoad) return 0;
    const { greenBeanWeight, finalWeight, greenBeanPrice, roastFee } = profileToLoad;

    const gbWeightKg = greenBeanWeight / 1000;
    const fWeightKg = finalWeight ? finalWeight / 1000 : 0;

    if (!gbWeightKg || !fWeightKg || typeof greenBeanPrice === 'undefined' || typeof roastFee === 'undefined') {
      return 0;
    }

    const totalGreenBeanCost = gbWeightKg * greenBeanPrice;
    const totalRoastFee = gbWeightKg * roastFee;
    const totalCost = totalGreenBeanCost + totalRoastFee;

    return totalCost / fWeightKg;
  }, [profileToLoad]);

  const weightLossPercentage = useMemo(() => {
    if (!profileToLoad) return 0;
    const { greenBeanWeight, finalWeight } = profileToLoad;
    if (!greenBeanWeight || !finalWeight) return 0;
    const loss = ((greenBeanWeight - finalWeight) / greenBeanWeight) * 100;
    return loss > 0 ? loss : 0;
  }, [profileToLoad]);

  const timelineDuration = calculateDuration();
  const displayEvents = isEditing ? editableEvents : events;
  const shouldShowTimeline =
    isRecording || isReplaying || isEditing || (profileToLoad && events.length > 0);

  const isNewProfileMode = !profileToLoad && !isRecording && !isReplaying && !isEditing;

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-800 rounded-xl shadow-2xl space-y-4 mb-24 mt-4 border border-gray-700">
      {eventToEdit && (
        <EventEditModal
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
          onSave={handleEventUpdate}
        />
      )}
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-amber-400 truncate max-w-[70%]">
          {isEditing
            ? `ویرایش: ${profileName}`
            : profileToLoad
            ? `پروفایل: ${profileName}`
            : 'شروع رُست جدید'}
        </h2>
        {!isEditing && (
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            بازگشت <ArrowLeft className="w-4 h-4 mr-1" />
          </button>
        )}
      </div>

      {(isNewProfileMode || isEditing) && (
        <div className="space-y-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
          <input
            type="text"
            placeholder="نام پروفایل / نام قهوه"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-500"
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="وزن دانه سبز (g)"
              value={greenBeanWeight || ''}
              onChange={(e) => setGreenBeanWeight(parseFloat(e.target.value))}
              className="w-1/2 bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-500 text-center"
            />
            <input
              type="number"
              placeholder="دمای شارژ (°C)"
              value={chargeTemp || ''}
              onChange={(e) => setChargeTemp(parseFloat(e.target.value))}
              className="w-1/2 bg-gray-800 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder-gray-500 text-center"
            />
          </div>
        </div>
      )}

      {(isNewProfileMode || (profileToLoad && !isRecording && !isReplaying)) && (
        <div className="space-y-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">
            {isNewProfileMode ? 'تنظیمات اولیه دستگاه' : 'وضعیت اولیه'}
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-2">شعله</label>
              <div className="grid grid-cols-4 gap-2">
                {['OFF', 'LOW', 'MEDIUM', 'HIGH'].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleInitialControlChange('flame', val)}
                    disabled={!!profileToLoad}
                    className={`py-2 rounded-md text-xs font-bold ${
                      controls.flame === val ? 'bg-amber-500 text-black' : 'bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <label className="block text-xs font-medium text-gray-400 mb-2">فن درام</label>
                <div className="grid grid-cols-2 gap-2">
                  {['OFF', 'ON'].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleInitialControlChange('drumFan', val)}
                      disabled={!!profileToLoad}
                      className={`py-2 rounded-md text-xs font-bold ${
                        controls.drumFan === val ? 'bg-amber-500 text-black' : 'bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <label className="block text-xs font-medium text-gray-400 mb-2">فن کولینگ</label>
                <div className="grid grid-cols-2 gap-2">
                  {['OFF', 'ON'].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleInitialControlChange('coolingFan', val)}
                      disabled={!!profileToLoad}
                      className={`py-2 rounded-md text-xs font-bold ${
                        controls.coolingFan === val ? 'bg-amber-500 text-black' : 'bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <label className="block text-xs font-medium text-gray-400 mb-2">چرخش درام</label>
                <div className="grid grid-cols-2 gap-2">
                  {['LEFT', 'RIGHT'].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleInitialControlChange('drumRotation', val)}
                      disabled={!!profileToLoad}
                      className={`py-2 rounded-md text-xs font-bold ${
                        controls.drumRotation === val ? 'bg-amber-500 text-black' : 'bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-400">سرعت درام</label>
                  <span className="font-mono-digital text-lg text-amber-400">{controls.drumSpeed}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={controls.drumSpeed}
                  onChange={(e) =>
                    handleInitialControlChange('drumSpeed', parseInt(e.target.value, 10))
                  }
                  disabled={!!profileToLoad}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="grid grid-cols-2 gap-4 text-center font-mono-digital select-none">
          <div className="bg-black/40 p-4 rounded-xl border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="text-xs text-cyan-400 mb-1 uppercase tracking-widest">تایمر اصلی</div>
            <div className="text-5xl font-bold tracking-widest text-gray-100">{formatTime(timer)}</div>
          </div>
          <div
            className={`bg-black/40 p-4 rounded-xl border-2 transition-colors duration-500 ${
              firstCrackTime !== null
                ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                : 'border-gray-700'
            }`}
          >
            <div className="text-xs text-orange-400 mb-1 uppercase tracking-widest">زمان توسعه</div>
            <div
              className={`text-5xl font-bold tracking-widest ${
                firstCrackTime !== null ? 'text-white' : 'text-gray-600'
              }`}
            >
              {formatTime(devTimer)}
            </div>
          </div>
        </div>
      )}

      {isReplaying && nextEvent && (
        <div className="text-center my-2 p-3 bg-black/50 border border-gray-700 rounded-lg animate-pulse">
          <p className="text-sm text-gray-200 flex items-center justify-center gap-2">
            <span className="text-2xl font-mono-digital text-amber-400 tracking-wider">
              {formatTime(nextEvent.timestamp - timer)}
            </span>
            <span className="text-xs text-gray-400">تا</span>
            <span className="font-bold">{getEventDescription(nextEvent, false)}</span>
          </p>
        </div>
      )}

      {shouldShowTimeline && (
        <RoastTimeline
          events={displayEvents}
          duration={timelineDuration}
          currentTime={timer}
          isEditing={isEditing}
          onEventClick={setEventToEdit}
          onEventUpdate={handleEventDragUpdate}
          highlightedEventTimestamp={highlightedEventTimestamp}
        />
      )}

      {(isRecording || isReplaying) && (
        <div className="space-y-3 select-none">
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
            <label className="block text-xs font-medium text-gray-400 mb-2">کنترل شعله</label>
            <div className="flex gap-2">
              <button
                onClick={handleToggleFlame}
                disabled={!isRecording}
                className={`w-1/3 text-sm font-bold py-3 rounded-lg transition-all ${
                  controls.flame !== 'OFF'
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                    : 'bg-gray-700 text-gray-300'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {controls.flame !== 'OFF' ? 'روشن' : 'خاموش'}
              </button>
              <div className="w-2/3 grid grid-cols-3 gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleSetBaseFlameLevel(val)}
                    disabled={!isRecording}
                    className={`px-2 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                      baseFlameLevel === val
                        ? 'bg-amber-500 text-gray-900 shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-2">فن درام</label>
              <div className="grid grid-cols-2 gap-2">
                {['OFF', 'ON'].map((val) => (
                  <ControlButton
                    key={val}
                    label={val}
                    active={controls.drumFan === val}
                    onClick={() => handleControlChange(ControlType.DrumFan, val)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-2">فن کولینگ</label>
              <div className="grid grid-cols-2 gap-2">
                {['OFF', 'ON'].map((val) => (
                  <ControlButton
                    key={val}
                    label={val}
                    active={controls.coolingFan === val}
                    onClick={() => handleControlChange(ControlType.CoolingFan, val)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-2">چرخش درام</label>
              <div className="grid grid-cols-2 gap-2">
                {['LEFT', 'RIGHT'].map((val) => (
                  <ControlButton
                    key={val}
                    label={val}
                    active={controls.drumRotation === val}
                    onClick={() => handleControlChange(ControlType.DrumRotation, val)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium text-gray-400">سرعت درام</label>
                <span className="font-mono-digital text-lg text-amber-400">{controls.drumSpeed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={controls.drumSpeed}
                onChange={(e) =>
                  handleControlChange(ControlType.DrumSpeed, parseInt(e.target.value, 10))
                }
                disabled={isReplaying || (!!profileToLoad && !isRecording)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 pb-4">
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={handleSaveChanges}
              className="w-1/2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              ذخیره تغییرات
            </button>
            <button
              onClick={handleCancelEdit}
              className="w-1/2 bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600"
            >
              لغو
            </button>
          </div>
        ) : isRecording ? (
          <div className="flex gap-3">
            <button
              onClick={handleFirstCrack}
              disabled={firstCrackTime !== null}
              className="w-1/2 bg-orange-600 text-white font-bold py-4 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 shadow-lg shadow-orange-600/20"
            >
              ترک اول
            </button>
            <button
              onClick={handleDischarge}
              className="w-1/2 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              تخلیه و ذخیره
            </button>
          </div>
        ) : (
          !isReplaying &&
          (profileToLoad ? (
            <div className="flex gap-3">
              <button
                onClick={handleStartReplay}
                className="w-1/2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                شروع بازپخش
              </button>
              <button
                onClick={handleEditProfile}
                className="w-1/2 bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20"
              >
                ویرایش پروفایل
              </button>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-lg"
            >
              شروع رُست
            </button>
          ))
        )}
      </div>

      {profileToLoad && !isRecording && !isEditing && (
        <div className="bg-gray-900 p-4 rounded-xl mt-4 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-amber-300">اطلاعات نهایی</h3>
            {!isEditingFinal && (
              <button onClick={() => setIsEditingFinal(true)} className="text-gray-400 hover:text-white">
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
          {isEditingFinal ? (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="وزن نهایی (g)"
                value={finalWeight || ''}
                onChange={(e) => setFinalWeight(parseFloat(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="دمای نهایی (°C)"
                value={finalTemp || ''}
                onChange={(e) => setFinalTemp(parseFloat(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="قیمت دانه سبز (تومان)"
                value={greenBeanPrice || ''}
                onChange={(e) => setGreenBeanPrice(parseFloat(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="اجرت رست (تومان)"
                value={roastFee || ''}
                onChange={(e) => setRoastFee(parseFloat(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveFinalDetails}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-bold"
                >
                  ذخیره
                </button>
                <button
                  onClick={() => setIsEditingFinal(false)}
                  className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mt-2 text-center">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">وزن نهایی</p>
                  <p className="text-lg font-bold text-gray-100">
                    {profileToLoad.finalWeight
                      ? `${profileToLoad.finalWeight.toLocaleString('fa-IR')} g`
                      : '---'}
                  </p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">دمای نهایی</p>
                  <p className="text-lg font-bold text-gray-100">
                    {profileToLoad.finalTemp
                      ? `${profileToLoad.finalTemp.toLocaleString('fa-IR')} °C`
                      : '---'}
                  </p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">قیمت دانه سبز</p>
                  <p className="text-lg font-bold text-gray-100">
                    {profileToLoad.greenBeanPrice
                      ? `${profileToLoad.greenBeanPrice.toLocaleString('fa-IR')}`
                      : '---'}
                  </p>
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">اجرت رست</p>
                  <p className="text-lg font-bold text-gray-100">
                    {profileToLoad.roastFee
                      ? `${profileToLoad.roastFee.toLocaleString('fa-IR')}`
                      : '---'}
                  </p>
                </div>
              </div>
              {(finalCostPerKg > 0 || weightLossPercentage > 0) && (
                <div className="mt-4 bg-black/30 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                  {finalCostPerKg > 0 && (
                    <div className={`p-4 text-center ${weightLossPercentage > 0 ? 'border-b border-gray-700/50' : ''}`}>
                      <p className="text-sm text-green-400 mb-1">قیمت تمام شده نهایی (یک کیلوگرم)</p>
                      <p className="text-3xl font-bold font-mono-digital text-green-300">
                        {finalCostPerKg.toLocaleString('fa-IR', { maximumFractionDigits: 0 })}
                        <span className="text-sm font-vazir mr-2 text-green-500/70">تومان</span>
                      </p>
                    </div>
                  )}
                  {weightLossPercentage > 0 && (
                    <div className="p-4 text-center bg-black/20">
                      <p className="text-sm text-orange-400 mb-1">درصد افت وزن</p>
                      <p className="text-3xl font-bold font-mono-digital text-orange-300">
                        {weightLossPercentage.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
                        <span className="text-sm font-vazir mr-2 text-orange-500/70">%</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};