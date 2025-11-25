import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Play, CheckCircle, Droplets, AlertCircle, RotateCcw, Square, Clock, SkipForward, Coffee } from 'lucide-react';

interface BackflushProps {
  onBack: () => void;
}

type Phase = 'intro' | 'detergent' | 'rinse_intro' | 'rinse' | 'soak_intro' | 'soak_timer' | 'finished';
type PumpState = 'on' | 'off' | 'waiting';

export const Backflush: React.FC<BackflushProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timer, setTimer] = useState(0);
  const [pumpState, setPumpState] = useState<PumpState>('waiting');
  
  const timerIntervalRef = useRef<number | null>(null);

  // Constants
  const DETERGENT_CYCLES = 5;
  const DETERGENT_ON_TIME = 10;
  const DETERGENT_OFF_TIME = 10;

  const RINSE_CYCLES = 10;
  const RINSE_ON_TIME = 5;
  const RINSE_OFF_TIME = 5;
  
  const SOAK_TIME = 20 * 60; // 20 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playBeep = (type: 'start' | 'stop' | 'finish') => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      // High pitch for start (Action required: Turn Pump ON)
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'stop') {
      // Lower pitch for stop/rest (Action required: Turn Pump OFF)
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Finish fanfare
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(800, ctx.currentTime);
          gain2.gain.setValueAtTime(0.1, ctx.currentTime);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.4);
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const isRunning = (pumpState === 'on' || pumpState === 'off') || phase === 'soak_timer';
    
    if (isRunning && timer > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      // Timer finished
      handleTimerFinish();
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [pumpState, timer, phase]);

  const handleTimerFinish = () => {
    if (phase === 'soak_timer') {
        playBeep('finish');
        setPhase('finished');
        return;
    }

    if (pumpState === 'on') {
      // --- Cycle ON finished -> Switch to OFF (Rest) ---
      playBeep('stop'); // Signal user to turn off pump
      setPumpState('off'); 
      
      // Set timer for the rest period
      if (phase === 'detergent') {
          setTimer(DETERGENT_OFF_TIME);
      } else {
          setTimer(RINSE_OFF_TIME);
      }
    } else if (pumpState === 'off') {
      // --- Cycle OFF (Rest) finished -> Decide Next Step ---
      
      const maxCycles = phase === 'detergent' ? DETERGENT_CYCLES : RINSE_CYCLES;

      if (currentCycle < maxCycles) {
          // -> NEXT CYCLE: Automatically start pump ON again
          setCurrentCycle((prev) => prev + 1);
          setPumpState('on');
          playBeep('start'); // Signal user to turn on pump
          
          if (phase === 'detergent') {
              setTimer(DETERGENT_ON_TIME);
          } else {
              setTimer(RINSE_ON_TIME);
          }
      } else {
          // -> FINISHED ALL CYCLES
          playBeep('finish');
          setPumpState('waiting');
          
          if (phase === 'detergent') {
            setPhase('rinse_intro');
          } else if (phase === 'rinse') {
            setPhase('soak_intro');
          }
      }
    }
  };

  const startPhaseSequence = () => {
    // Starts the first cycle of the sequence
    playBeep('start');
    setPumpState('on');
    setCurrentCycle(1);
    
    if (phase === 'detergent') {
        setTimer(DETERGENT_ON_TIME);
    } else {
        setTimer(RINSE_ON_TIME);
    }
  };

  const stopSequence = () => {
      setPumpState('waiting');
      setTimer(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const skipToNextPhase = () => {
      stopSequence();
      playBeep('finish'); // Feedback
      if (phase === 'detergent') {
          setPhase('rinse_intro');
      } else if (phase === 'rinse') {
          setPhase('soak_intro');
      } else if (phase === 'soak_timer') {
          setPhase('finished');
      }
  };

  // Render Helpers
  const getTotalCycles = () => (phase === 'detergent' ? DETERGENT_CYCLES : RINSE_CYCLES);
  
  return (
    <div className="p-4 max-w-lg mx-auto min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <Droplets className="w-6 h-6" /> بک‌واش ماشین
        </h2>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center space-y-6 relative">
        
        {/* Phase: Intro */}
        {phase === 'intro' && (
          <div className="text-center space-y-6 animate-fade-in w-full">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <AlertCircle className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">آماده‌سازی</h3>
                <p className="text-gray-300 leading-relaxed">
                    لطفاً بسکت کور (Blind Basket) را داخل پرتافیلتر قرار دهید و مقدار مناسب پودر شوینده را اضافه کنید.
                    <br/>
                    سپس پرتافیلتر را روی هدگروپ ببندید.
                </p>
            </div>
            <button
                onClick={() => {
                    setPhase('detergent');
                    setPumpState('waiting');
                }}
                className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform active:scale-95"
            >
                ورود به مرحله شستشو
            </button>
          </div>
        )}

        {/* Phase: Rinse Intro */}
        {phase === 'rinse_intro' && (
          <div className="text-center space-y-6 animate-fade-in w-full">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <RotateCcw className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">تخلیه و آبکشی</h3>
                <p className="text-gray-300 leading-relaxed">
                    پرتافیلتر را باز کنید و باقی‌مانده مواد شوینده را بشویید.
                    <br/>
                    پرتافیلتر (با بسکت کور خالی) را مجدداً ببندید برای مرحله آبکشی نهایی.
                </p>
            </div>
            <button
                onClick={() => {
                    setPhase('rinse');
                    setPumpState('waiting');
                }}
                className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform active:scale-95"
            >
                ورود به مرحله آبکشی
            </button>
          </div>
        )}

        {/* Active Phases: Detergent or Rinse */}
        {(phase === 'detergent' || phase === 'rinse') && (
            <div className="w-full max-w-md flex flex-col gap-6">
                {/* Progress Indicator */}
                <div className="w-full flex justify-between px-2">
                    {Array.from({ length: getTotalCycles() }).map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-500 ${
                                idx + 1 < currentCycle 
                                    ? 'bg-cyan-500 w-full mx-0.5' 
                                    : idx + 1 === currentCycle 
                                        ? (pumpState !== 'waiting' ? 'bg-yellow-400 w-full mx-0.5 animate-pulse' : 'bg-gray-600 w-full mx-0.5') 
                                        : 'bg-gray-700 w-full mx-0.5'
                            }`}
                        />
                    ))}
                </div>

                {/* Central Visual */}
                <div className={`relative h-64 w-full bg-gray-800/50 rounded-3xl border flex items-center justify-center overflow-hidden shadow-inner transition-colors duration-500 ${
                    pumpState === 'on' ? 'border-red-500/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'border-gray-700'
                }`}>
                    {/* Animation Container */}
                    <div className={`transition-all duration-500 flex flex-col items-center w-full h-full relative ${pumpState === 'on' ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        
                        {/* Dripping Animation */}
                        <div className="relative w-full h-full overflow-hidden">
                            {pumpState === 'on' && (
                                <>
                                    <div className="absolute left-1/2 -translate-x-1/2 w-2 h-full bg-red-500/10 blur-md"></div>
                                    {/* Multiple drips for better effect */}
                                    <div className="animate-drip-1 absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
                                        <div className="w-3 h-4 bg-red-500 rounded-full rounded-tr-none -rotate-45"></div>
                                    </div>
                                    <div className="animate-drip-2 absolute top-[-50px] left-1/2 -translate-x-1/2 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
                                        <div className="w-4 h-5 bg-red-600 rounded-full rounded-tr-none -rotate-45"></div>
                                    </div>
                                    <div className="animate-drip-3 absolute top-[-30px] left-1/2 -translate-x-1/2 text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
                                         <div className="w-2 h-3 bg-red-400 rounded-full rounded-tr-none -rotate-45"></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Status Overlay Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                         <h4 className="text-gray-300 text-sm uppercase tracking-widest mb-4 font-bold bg-gray-900/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            {phase === 'detergent' ? 'شستشو با مواد' : 'آبکشی نهایی'}
                         </h4>
                         
                         {pumpState === 'waiting' ? (
                             <div className="text-3xl font-bold text-cyan-400 mt-2 animate-pulse">آماده شروع</div>
                         ) : (
                             <div className={`text-7xl font-mono-digital font-bold transition-colors ${
                                 pumpState === 'on' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'text-cyan-400'
                             }`}>
                                 {timer}
                                 <span className="text-2xl text-gray-500 ml-2 align-top">s</span>
                             </div>
                         )}
                         
                         <div className="mt-6 px-6 py-2 bg-black/60 rounded-full border border-gray-600 backdrop-blur-md shadow-xl">
                             <span className={`text-lg font-bold ${
                                 pumpState === 'on' ? 'text-red-400 animate-pulse' : 
                                 pumpState === 'off' ? 'text-cyan-400' : 'text-gray-400'
                             }`}>
                                 {pumpState === 'on' ? 'پمپ روشن' : 
                                  pumpState === 'off' ? 'استراحت (پمپ خاموش)' : 
                                  'دکمه شروع را بزنید'}
                             </span>
                         </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {pumpState === 'waiting' && (
                        <button
                            onClick={startPhaseSequence}
                            className="w-full bg-green-600 text-white font-bold py-5 rounded-2xl hover:bg-green-500 shadow-[0_0_25px_rgba(22,163,74,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-3 text-xl"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            شروع عملیات
                        </button>
                    )}

                    {pumpState !== 'waiting' && (
                         <button
                            onClick={stopSequence}
                            className={`w-full font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-colors hover:bg-red-900/50 ${
                                pumpState === 'on' ? 'bg-gray-800 text-gray-400 border border-gray-600' : 'bg-gray-800 text-gray-400 border border-gray-600'
                            }`}
                        >
                             <Square className="w-5 h-5 fill-current" />
                             توقف عملیات
                        </button>
                    )}
                    
                    {/* Skip Button */}
                    <button 
                        onClick={skipToNextPhase}
                        className="w-full py-3 text-gray-500 hover:text-cyan-400 flex items-center justify-center gap-2 transition-colors"
                    >
                        <SkipForward className="w-4 h-4" />
                        <span className="text-sm font-bold">رد شدن و رفتن به مرحله بعد</span>
                    </button>

                    <div className="text-center pt-2">
                         <span className="text-sm text-gray-500 font-mono-digital">
                             CYCLE {currentCycle} / {getTotalCycles()}
                         </span>
                    </div>
                </div>
            </div>
        )}

        {/* Phase: Soak Intro */}
        {phase === 'soak_intro' && (
            <div className="text-center space-y-6 animate-fade-in w-full">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <Coffee className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">خیساندن قطعات</h3>
                    <p className="text-gray-300 leading-relaxed">
                        نیم اسکوپ پودر را در یک ظرف آب داغ حل کنید.
                        <br/>
                        پرتافیلتر (بجز دسته) و شاور اسکرین را درون محلول قرار دهید تا ۲۰ دقیقه خیس بخورند.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setPhase('soak_timer');
                        setTimer(SOAK_TIME);
                    }}
                    className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Clock className="w-5 h-5" />
                    شروع تایمر ۲۰ دقیقه‌ای
                </button>
                <button 
                    onClick={() => setPhase('finished')}
                    className="w-full py-3 text-gray-500 hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                    <SkipForward className="w-4 h-4" />
                    <span className="text-sm">رد شدن از این مرحله</span>
                </button>
            </div>
        )}

        {/* Phase: Soak Timer */}
        {phase === 'soak_timer' && (
            <div className="w-full max-w-md flex flex-col gap-8 animate-fade-in">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">خیساندن قطعات</h3>
                    <p className="text-gray-400 text-sm">لطفاً صبر کنید...</p>
                </div>
                
                <div className="relative h-64 w-64 mx-auto bg-gray-800 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin-slow opacity-50"></div>
                    <div className="text-center">
                        <Clock className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                        <div className="text-5xl font-mono-digital font-bold text-white">
                            {formatTime(timer)}
                        </div>
                    </div>
                </div>

                <button
                    onClick={skipToNextPhase}
                    className="w-full bg-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    اتمام عملیات
                </button>
            </div>
        )}

        {/* Phase: Finished */}
        {phase === 'finished' && (
             <div className="text-center space-y-6 animate-fade-in w-full">
                <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <CheckCircle className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">پایان عملیات!</h2>
                <p className="text-gray-400 leading-relaxed">
                    بک‌واش و شستشو با موفقیت انجام شد.
                    <br/>
                    قطعات را با آب تمیز بشویید و دوباره ببندید.
                    <br/>
                    <span className="text-amber-400 text-sm block mt-2">پیشنهاد: یک شات اسپرسو بگیرید و دور بریزید.</span>
                </p>
                <button
                    onClick={onBack}
                    className="w-full bg-gray-700 text-white font-bold py-4 rounded-xl hover:bg-gray-600 transition-colors"
                >
                    بازگشت به منو
                </button>
             </div>
        )}
      </div>
      
      {/* CSS for drip animation and spin */}
      <style>{`
        @keyframes drip {
          0% { transform: translateY(-20px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(250px) scale(1); opacity: 0; }
        }
        .animate-drip-1 { animation: drip 1.2s infinite linear; }
        .animate-drip-2 { animation: drip 1.5s infinite linear 0.5s; }
        .animate-drip-3 { animation: drip 1.0s infinite linear 0.2s; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .font-mono-digital { font-family: 'Orbitron', monospace; }
      `}</style>
    </div>
  );
};