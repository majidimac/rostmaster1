import React, { useState } from 'react';
import { Droplets, Settings, Coffee, BookOpen, Calculator } from 'lucide-react';
import { Backflush } from './Backflush';
import { Recipes } from './Recipes';
import { IncomeCalculator } from './IncomeCalculator';

interface CoffeeMasterProps {}

type CoffeePage = 'dashboard' | 'backflush' | 'recipes' | 'calculator' | 'settings';

export const CoffeeMaster: React.FC<CoffeeMasterProps> = () => {
  const [activePage, setActivePage] = useState<CoffeePage>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'backflush':
        return <Backflush onBack={() => setActivePage('dashboard')} />;
      case 'recipes':
        return <Recipes onBack={() => setActivePage('dashboard')} />;
      case 'calculator':
        return <IncomeCalculator onBack={() => setActivePage('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <div className="p-4 max-w-lg mx-auto space-y-6 pt-8">
             <div className="text-center mb-8">
                 <div className="inline-block p-3 bg-cyan-900/30 rounded-2xl border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                     <Coffee className="w-10 h-10 text-cyan-400" />
                 </div>
                 <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-500">
                     کافی مستر
                 </h1>
                 <p className="text-gray-400 text-sm mt-2">جعبه ابزار باریستا</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 {/* Backflush Button */}
                 <button 
                    onClick={() => setActivePage('backflush')}
                    className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-cyan-500/50 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg hover:-translate-y-1"
                 >
                     <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                        <Droplets className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
                     </div>
                     <span className="font-bold text-gray-200 group-hover:text-cyan-100 text-sm">بک‌واش</span>
                 </button>

                 {/* Recipes Button */}
                 <button 
                    onClick={() => setActivePage('recipes')}
                    className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg hover:-translate-y-1"
                 >
                     <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <BookOpen className="w-6 h-6 text-amber-400 group-hover:text-amber-300" />
                     </div>
                     <span className="font-bold text-gray-200 group-hover:text-amber-100 text-sm">دستورالعمل‌ها</span>
                 </button>

                 {/* Income Calculator Button */}
                 <button 
                    onClick={() => setActivePage('calculator')}
                    className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg hover:-translate-y-1"
                 >
                     <div className="w-12 h-12 bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <Calculator className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300" />
                     </div>
                     <span className="font-bold text-gray-200 group-hover:text-emerald-100 text-sm">محاسبه سود</span>
                 </button>

                 {/* Placeholder */}
                 <div className="bg-gray-800/50 border border-gray-700/50 p-5 rounded-2xl flex flex-col items-center justify-center gap-3 opacity-60">
                     <div className="w-12 h-12 bg-gray-700/20 rounded-full flex items-center justify-center">
                        <Settings className="w-6 h-6 text-gray-500" />
                     </div>
                     <span className="font-bold text-gray-500 text-sm">تنظیمات</span>
                 </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-vazir relative overflow-x-hidden">
       {/* Background Theme for Coffee Master (Cyan) */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[80px]"></div>
       </div>
       
       <div className="relative z-10 pb-24">
         {renderPage()}
       </div>
    </div>
  );
};