
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Plus, Clock, Coffee, Droplets, Play, Pause, RotateCcw, Edit2, Trash2, ChevronRight, Check, StopCircle } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

interface BrewStep {
  time: number; // seconds from start
  description: string;
  waterAmount?: number; // cumulative water amount target
}

interface BrewRecipe {
  id: string;
  title: string;
  method: 'V60' | 'Chemex' | 'Aeropress' | 'French Press' | 'Espresso' | 'Other';
  coffeeWeight: number; // grams
  waterWeight: number; // grams
  grindSize: string; // e.g., "Medium-Fine"
  temp: number; // Celsius
  steps: BrewStep[];
}

// Define comprehensive default recipes
const defaultRecipes: BrewRecipe[] = [
  {
    id: 'espresso-double',
    title: 'اسپرسو دبل شات حرفه‌ای',
    method: 'Espresso',
    coffeeWeight: 19,
    waterWeight: 38,
    grindSize: 'بسیار ریز (Fine)',
    temp: 93,
    steps: [
      { time: 0, description: 'شروع پمپ (Pre-infusion) - چک کردن فشار', waterAmount: 0 },
      { time: 5, description: 'ظهور اولین قطرات عصاره (First Drip)', waterAmount: 2 },
      { time: 15, description: 'جریان یکنواخت (دم موشی) و تغییر رنگ به عسلی', waterAmount: 20 },
      { time: 25, description: 'تغییر رنگ به زرد کمرنگ (Blonding) - آماده قطع کردن', waterAmount: 32 },
      { time: 30, description: 'قطع کامل عصاره‌گیری', waterAmount: 38 },
    ],
  },
  {
    id: 'v60-standard',
    title: 'V60 - تکنیک هاریو',
    method: 'V60',
    coffeeWeight: 20,
    waterWeight: 320,
    grindSize: 'متوسط رو به ریز (Medium-Fine)',
    temp: 93,
    steps: [
      { time: 0, description: 'بلومینگ: خیساندن تمام قهوه با ۶۰ گرم آب برای خروج گاز', waterAmount: 60 },
      { time: 45, description: 'ریزش اول: اضافه کردن آب تا ۲۰۰ گرم با حرکات چرخشی آرام', waterAmount: 200 },
      { time: 105, description: 'ریزش دوم: اضافه کردن باقی آب تا ۳۲۰ گرم (مرکز به بیرون)', waterAmount: 320 },
      { time: 180, description: 'پایان دم‌آوری: اجازه دهید آب کاملاً از بستر قهوه عبور کند', waterAmount: 320 },
    ],
  },
  {
    id: 'chemex-classic',
    title: 'کمکس کلاسیک (۳ کاپ)',
    method: 'Chemex',
    coffeeWeight: 30,
    waterWeight: 500,
    grindSize: 'متوسط رو به درشت (Medium-Coarse)',
    temp: 94,
    steps: [
      { time: 0, description: 'بلومینگ: ریختن ۶۰ گرم آب و هم زدن ملایم', waterAmount: 60 },
      { time: 45, description: 'ریزش مارپیچی: اضافه کردن آب تا ۳۰۰ گرم', waterAmount: 300 },
      { time: 105, description: 'ریزش نهایی: اضافه کردن آب تا ۵۰۰ گرم (از مرکز)', waterAmount: 500 },
      { time: 240, description: 'برداشتن فیلتر و سرو', waterAmount: 500 },
    ],
  },
  {
    id: 'aeropress-inverted',
    title: 'ائروپرس (روش معکوس)',
    method: 'Aeropress',
    coffeeWeight: 18,
    waterWeight: 200,
    grindSize: 'متوسط (Medium)',
    temp: 90,
    steps: [
      { time: 0, description: 'اضافه کردن ۱۰۰ گرم آب و ۵ بار هم زدن', waterAmount: 100 },
      { time: 30, description: 'اضافه کردن باقی آب تا ۲۰۰ گرم', waterAmount: 200 },
      { time: 60, description: 'بستن فیلتر و خارج کردن هوای اضافی', waterAmount: 200 },
      { time: 90, description: 'برگرداندن و پرس کردن با فشار یکنواخت (۳۰ ثانیه)', waterAmount: 200 },
    ],
  },
  {
    id: 'french-press-full',
    title: 'فرنچ پرس (فول بادی)',
    method: 'French Press',
    coffeeWeight: 30,
    waterWeight: 500,
    grindSize: 'درشت (Coarse)',
    temp: 95,
    steps: [
      { time: 0, description: 'ریختن تمام آب روی قهوه به صورت سریع', waterAmount: 500 },
      { time: 240, description: 'شکستن لایه رویی (Crust) و برداشتن کف روی قهوه', waterAmount: 500 },
      { time: 300, description: 'گذاشتن درب (بدون پرس) برای ته‌نشینی ذرات', waterAmount: 500 },
      { time: 480, description: 'پرس ملایم تا سطح قهوه و سرو', waterAmount: 500 },
    ],
  },
];

const emptyRecipe: BrewRecipe = {
  id: '',
  title: '',
  method: 'V60',
  coffeeWeight: 0,
  waterWeight: 0,
  grindSize: '',
  temp: 93,
  steps: [],
};

interface RecipesProps {
  onBack: () => void;
}

export const Recipes: React.FC<RecipesProps> = ({ onBack }) => {
  const [recipes, setRecipes] = useLocalStorage<BrewRecipe[]>('brewRecipes', defaultRecipes);
  const [view, setView] = useState<'list' | 'detail' | 'edit' | 'brew'>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<BrewRecipe | null>(null);
  
  // Editor State
  const [editRecipe, setEditRecipe] = useState<BrewRecipe>(emptyRecipe);

  // Brewer State
  const [brewTime, setBrewTime] = useState(0);
  const [isBrewing, setIsBrewing] = useState(false);
  const [brewFinished, setBrewFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const playBeep = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // --- Timer Logic ---
  useEffect(() => {
    if (isBrewing) {
      timerRef.current = window.setInterval(() => {
        setBrewTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBrewing]);

  // Check steps for audio feedback
  useEffect(() => {
    if (isBrewing && selectedRecipe) {
      const currentStep = selectedRecipe.steps.find((s) => s.time === brewTime);
      if (currentStep && brewTime > 0) {
        playBeep();
      }
    }
  }, [brewTime, isBrewing, selectedRecipe]);

  // --- Handlers ---

  const handleSaveRecipe = () => {
    if (!editRecipe.title) return alert('لطفاً نام دستورالعمل را وارد کنید');
    
    setRecipes((prev) => {
      const idx = prev.findIndex((r) => r.id === editRecipe.id);
      if (idx >= 0) {
        const newRecipes = [...prev];
        newRecipes[idx] = editRecipe;
        return newRecipes;
      }
      return [...prev, editRecipe];
    });
    setView('list');
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('آیا از حذف این دستورالعمل اطمینان دارید؟')) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setView('list');
    }
  };

  const handleStartBrew = () => {
    setBrewTime(0);
    setBrewFinished(false);
    setIsBrewing(true);
    setView('brew');
  };

  const toggleTimer = () => setIsBrewing(!isBrewing);
  
  const resetTimer = () => {
    setIsBrewing(false);
    setBrewTime(0);
    setBrewFinished(false);
  };

  const addStep = () => {
    const lastTime = editRecipe.steps.length > 0 
        ? editRecipe.steps[editRecipe.steps.length - 1].time + 10 
        : 0;
    setEditRecipe({
        ...editRecipe,
        steps: [...editRecipe.steps, { time: lastTime, description: '', waterAmount: 0 }]
    });
  };

  const updateStep = (index: number, field: keyof BrewStep, value: any) => {
      const newSteps = [...editRecipe.steps];
      newSteps[index] = { ...newSteps[index], [field]: value };
      setEditRecipe({ ...editRecipe, steps: newSteps });
  };

  const removeStep = (index: number) => {
      const newSteps = editRecipe.steps.filter((_, i) => i !== index);
      setEditRecipe({ ...editRecipe, steps: newSteps });
  };

  // --- Renders ---

  const renderList = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400">دستورالعمل‌ها</h2>
        <button
          onClick={() => {
            const newId = Date.now().toString();
            setEditRecipe({ ...emptyRecipe, id: newId });
            setView('edit');
          }}
          className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid gap-3">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => {
              setSelectedRecipe(recipe);
              setView('detail');
            }}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 active:scale-95 group shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">{recipe.title}</h3>
                <span className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded-md mt-1 inline-block border border-gray-700">
                  {recipe.method}
                </span>
              </div>
              <div className="text-left">
                <div className="text-cyan-400 font-mono-digital font-bold">
                  1:{Math.round(recipe.waterWeight / (recipe.coffeeWeight || 1))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(recipe.steps[recipe.steps.length - 1]?.time || 0)}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span>{recipe.coffeeWeight}g</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>{recipe.waterWeight}ml</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedRecipe) return null;
    const ratio = Math.round(selectedRecipe.waterWeight / selectedRecipe.coffeeWeight);

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
          
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedRecipe.title}</h2>
                <span className="text-cyan-400 text-sm font-mono px-2 py-0.5 bg-cyan-900/30 rounded border border-cyan-500/30">
                  {selectedRecipe.method}
                </span>
             </div>
             <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setEditRecipe(selectedRecipe);
                        setView('edit');
                    }}
                    className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
             <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                <Coffee className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{selectedRecipe.coffeeWeight}<span className="text-xs text-gray-500 ml-1">g</span></div>
                <div className="text-xs text-gray-400">قهوه</div>
             </div>
             <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{selectedRecipe.waterWeight}<span className="text-xs text-gray-500 ml-1">ml</span></div>
                <div className="text-xs text-gray-400">آب</div>
             </div>
             <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                <div className="w-6 h-6 flex items-center justify-center mx-auto mb-2 text-purple-400 font-bold">:</div>
                <div className="text-xl font-bold text-white">1:{ratio}</div>
                <div className="text-xs text-gray-400">نسبت</div>
             </div>
          </div>

          <div className="space-y-2 bg-gray-900/30 p-4 rounded-xl border border-gray-700/50 mb-6">
             <div className="flex justify-between text-sm">
                 <span className="text-gray-400">درجه آسیاب:</span>
                 <span className="text-white font-medium">{selectedRecipe.grindSize}</span>
             </div>
             <div className="flex justify-between text-sm">
                 <span className="text-gray-400">دمای آب:</span>
                 <span className="text-white font-medium font-mono-digital">{selectedRecipe.temp}°C</span>
             </div>
             <div className="flex justify-between text-sm">
                 <span className="text-gray-400">زمان کل:</span>
                 <span className="text-white font-medium font-mono-digital">
                     {formatTime(selectedRecipe.steps[selectedRecipe.steps.length-1]?.time || 0)}
                 </span>
             </div>
          </div>

          <button
             onClick={handleStartBrew}
             className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl hover:bg-cyan-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 text-lg active:scale-95"
          >
             <Play className="w-6 h-6 fill-current" />
             شروع دم‌آوری
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-4 font-bold border-b border-gray-700 pb-2">مراحل کار</h3>
            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-gray-700"></div>

                {selectedRecipe.steps.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4 pr-2">
                        <div className="relative z-10 w-8 h-8 bg-gray-900 rounded-full border-2 border-cyan-500 flex items-center justify-center shrink-0 text-xs font-mono-digital text-cyan-400 font-bold shadow-md">
                            {idx + 1}
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-lg flex-grow border border-gray-600/50">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-mono-digital text-amber-400 font-bold text-sm">
                                    {formatTime(step.time)}
                                </span>
                                {step.waterAmount ? (
                                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                                        تا {step.waterAmount} گرم
                                    </span>
                                ) : null}
                            </div>
                            <p className="text-sm text-gray-200">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  };

  const renderEditor = () => (
    <div className="space-y-4 animate-fade-in pb-24">
        <h2 className="text-xl font-bold text-amber-400 mb-4">
            {editRecipe.id.includes('default') || editRecipe.title === '' ? 'رسپی جدید' : 'ویرایش رسپی'}
        </h2>
        
        <div className="space-y-3 bg-gray-800 p-4 rounded-xl border border-gray-700">
            <input
                type="text"
                placeholder="نام رسپی"
                value={editRecipe.title}
                onChange={(e) => setEditRecipe({...editRecipe, title: e.target.value})}
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
                <select
                    value={editRecipe.method}
                    onChange={(e) => setEditRecipe({...editRecipe, method: e.target.value as any})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none"
                >
                    <option value="V60">V60</option>
                    <option value="Chemex">کمکس (Chemex)</option>
                    <option value="Aeropress">ائروپرس (Aeropress)</option>
                    <option value="French Press">فرنچ پرس</option>
                    <option value="Espresso">اسپرسو</option>
                    <option value="Other">سایر</option>
                </select>
                <input
                    type="text"
                    placeholder="درجه آسیاب"
                    value={editRecipe.grindSize}
                    onChange={(e) => setEditRecipe({...editRecipe, grindSize: e.target.value})}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-3 gap-3">
                 <div className="relative">
                     <input
                        type="number"
                        placeholder="قهوه"
                        value={editRecipe.coffeeWeight || ''}
                        onChange={(e) => setEditRecipe({...editRecipe, coffeeWeight: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none text-center"
                    />
                    <span className="absolute left-2 top-3.5 text-xs text-gray-500 pointer-events-none">g</span>
                 </div>
                 <div className="relative">
                     <input
                        type="number"
                        placeholder="آب"
                        value={editRecipe.waterWeight || ''}
                        onChange={(e) => setEditRecipe({...editRecipe, waterWeight: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none text-center"
                    />
                    <span className="absolute left-2 top-3.5 text-xs text-gray-500 pointer-events-none">ml</span>
                 </div>
                 <div className="relative">
                     <input
                        type="number"
                        placeholder="دما"
                        value={editRecipe.temp || ''}
                        onChange={(e) => setEditRecipe({...editRecipe, temp: Number(e.target.value)})}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-cyan-500 outline-none text-center"
                    />
                    <span className="absolute left-2 top-3.5 text-xs text-gray-500 pointer-events-none">°C</span>
                 </div>
            </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white">مراحل</h3>
                <button onClick={addStep} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> افزودن مرحله
                </button>
            </div>
            {editRecipe.steps.map((step, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded-xl border border-gray-700 flex gap-2 items-start">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0 text-gray-500 text-xs mt-1">
                        {idx + 1}
                    </div>
                    <div className="flex-grow space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="زمان (ثانیه)"
                                value={step.time}
                                onChange={(e) => updateStep(idx, 'time', Number(e.target.value))}
                                className="w-1/3 bg-gray-700 text-white p-2 rounded-lg text-sm font-mono-digital text-center focus:border-cyan-500 border border-gray-600 outline-none"
                            />
                            <input
                                type="number"
                                placeholder="وزن آب (تجمعی)"
                                value={step.waterAmount || ''}
                                onChange={(e) => updateStep(idx, 'waterAmount', Number(e.target.value))}
                                className="w-2/3 bg-gray-700 text-white p-2 rounded-lg text-sm text-center focus:border-cyan-500 border border-gray-600 outline-none"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="توضیحات مرحله"
                            value={step.description}
                            onChange={(e) => updateStep(idx, 'description', e.target.value)}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg text-sm focus:border-cyan-500 border border-gray-600 outline-none"
                        />
                    </div>
                    <button 
                        onClick={() => removeStep(idx)}
                        className="p-2 text-gray-600 hover:text-red-500 mt-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        <div className="flex gap-3 pt-4">
            <button
                onClick={handleSaveRecipe}
                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 shadow-lg shadow-green-600/20"
            >
                ذخیره
            </button>
            <button
                onClick={() => handleDeleteRecipe(editRecipe.id)}
                className="bg-red-600/20 text-red-400 p-3 rounded-xl hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
            >
                <Trash2 className="w-6 h-6" />
            </button>
        </div>
    </div>
  );

  const renderBrew = () => {
    if (!selectedRecipe) return null;
    const currentStepIdx = selectedRecipe.steps.findIndex((s) => s.time > brewTime);
    const currentStep = currentStepIdx === -1 ? selectedRecipe.steps[selectedRecipe.steps.length - 1] : selectedRecipe.steps[Math.max(0, currentStepIdx - 1)];
    const nextStep = currentStepIdx === -1 ? null : selectedRecipe.steps[currentStepIdx];

    return (
        <div className="flex flex-col min-h-[80vh] justify-between animate-fade-in pb-32">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">{selectedRecipe.title}</h2>
                <div className="flex justify-center gap-4 text-sm text-gray-400">
                    <span>{selectedRecipe.coffeeWeight}g قهوه</span>
                    <span>{selectedRecipe.waterWeight}ml آب</span>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
                <div className={`relative w-64 h-64 rounded-full flex items-center justify-center border-8 transition-all duration-500 ${isBrewing ? 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]' : 'border-gray-700'}`}>
                    <div className="text-center z-10">
                        <div className="text-7xl font-mono-digital font-bold text-white tracking-wider">
                            {formatTime(brewTime)}
                        </div>
                        <div className="text-gray-500 mt-2 font-bold uppercase tracking-widest">زمان کل</div>
                    </div>
                    {isBrewing && (
                        <div className="absolute inset-0 rounded-full border-t-4 border-white/50 animate-spin" style={{ animationDuration: '3s' }}></div>
                    )}
                </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex-grow mb-6 flex flex-col justify-center">
                <div className="text-center mb-4">
                    <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">مرحله فعلی</span>
                    <h3 className="text-xl font-bold text-white mt-2 leading-relaxed">{currentStep.description}</h3>
                    {currentStep.waterAmount ? (
                        <div className="mt-3 inline-block bg-blue-900/40 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 font-bold shadow-inner">
                            وزن هدف: {currentStep.waterAmount}g
                        </div>
                    ) : null}
                </div>
                {nextStep && (
                    <div className="text-center border-t border-gray-700 pt-4 opacity-60">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">مرحله بعد در {formatTime(nextStep.time)}</span>
                        <p className="text-gray-300 mt-1">{nextStep.description}</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="w-full max-w-lg bg-gray-900 border-t border-gray-800 p-4 pointer-events-auto flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={toggleTimer}
                        className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg transition-all active:scale-95 ${
                            isBrewing 
                            ? 'bg-amber-600 text-white hover:bg-amber-500' 
                            : 'bg-green-600 text-white hover:bg-green-500'
                        }`}
                    >
                        {isBrewing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
                        {isBrewing ? 'توقف' : 'شروع / ادامه'}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="bg-gray-700 text-gray-300 p-4 rounded-xl hover:bg-gray-600 transition-colors"
                    >
                        <RotateCcw className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 max-w-lg mx-auto h-full">
      {view !== 'list' && (
        <button 
            onClick={() => {
                if (view === 'brew' && isBrewing) {
                    if (window.confirm('تایمر در حال اجراست. آیا می‌خواهید خارج شوید؟')) {
                        setIsBrewing(false);
                        setView('list');
                    }
                } else {
                    setView(view === 'edit' ? 'list' : 'list');
                }
            }}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
        >
            <ArrowRight className="w-5 h-5 ml-1" /> بازگشت
        </button>
      )}

      {view === 'list' && renderList()}
      {view === 'detail' && renderDetail()}
      {view === 'edit' && renderEditor()}
      {view === 'brew' && renderBrew()}
    </div>
  );
};
