import React from 'react';
import { Droplets, Calculator, Coffee } from 'lucide-react';
import { Backflush } from './Backflush';
import { IncomeCalculator } from './IncomeCalculator';
import { Recipes } from './Recipes';

interface CoffeeMasterProps {
  setCoffeeMasterPage: (page: 'menu' | 'backflush' | 'income' | 'recipes') => void;
  coffeeMasterPage: 'menu' | 'backflush' | 'income' | 'recipes';
}

export const CoffeeMaster: React.FC<CoffeeMasterProps> = ({ setCoffeeMasterPage, coffeeMasterPage }) => {
  if (coffeeMasterPage === 'backflush') {
    return <Backflush onBack={() => setCoffeeMasterPage('menu')} />;
  }
  if (coffeeMasterPage === 'income') {
    return <IncomeCalculator onBack={() => setCoffeeMasterPage('menu')} />;
  }
  if (coffeeMasterPage === 'recipes') {
    return <Recipes onBack={() => setCoffeeMasterPage('menu')} />;
  }
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center text-cyan-400 mb-8">کافی مستر</h1>
      <div className="grid grid-cols-1 gap-4">
        <button onClick={() => setCoffeeMasterPage('backflush')} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 flex items-center gap-4">
          <Droplets className="w-6 h-6 text-cyan-500" />
          <span className="text-white font-bold">بک‌واش ماشین</span>
        </button>
        <button onClick={() => setCoffeeMasterPage('income')} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 flex items-center gap-4">
          <Calculator className="w-6 h-6 text-cyan-500" />
          <span className="text-white font-bold">محاسبه سود و درآمد</span>
        </button>
        <button onClick={() => setCoffeeMasterPage('recipes')} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 flex items-center gap-4">
          <Coffee className="w-6 h-6 text-cyan-500" />
          <span className="text-white font-bold">دستورالعمل‌ها</span>
        </button>
      </div>
    </div>
  );
};
