import React, { useState, useMemo } from 'react';
import { Trash2, PlusCircle } from 'lucide-react';
import { Ingredient } from '../types';

export const MixCalculator: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: Date.now().toString(), name: '', percentage: 100, weight: 1000, pricePerKg: 0 },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', percentage: 0, weight: 0, pricePerKg: 0 },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(
      ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const { priceByPercentage, priceByWeight } = useMemo(() => {
    const totalPercentage = ingredients.reduce((sum, ing) => sum + Number(ing.percentage), 0);
    const totalWeight = ingredients.reduce((sum, ing) => sum + Number(ing.weight), 0);

    let costByPercentage = 0;
    if (totalPercentage > 0) {
      costByPercentage = ingredients.reduce((sum, ing) => {
        return sum + Number(ing.pricePerKg) * (Number(ing.percentage) / totalPercentage);
      }, 0);
    }

    let costByWeight = 0;
    if (totalWeight > 0) {
      const totalCost = ingredients.reduce((sum, ing) => {
        return sum + Number(ing.pricePerKg) * (Number(ing.weight) / 1000);
      }, 0);
      costByWeight = (totalCost / totalWeight) * 1000;
    }

    return {
      priceByPercentage: costByPercentage,
      priceByWeight: costByWeight,
    };
  }, [ingredients]);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-center text-amber-400">محاسبه‌گر میکس قهوه</h1>

      <div className="space-y-4">
        {ingredients.map((ing, index) => (
          <div key={ing.id} className="bg-gray-800 p-4 rounded-xl shadow-md space-y-3 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-amber-300 font-semibold">ماده {index + 1}</span>
              {ingredients.length > 1 && (
                <button onClick={() => removeIngredient(ing.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="نام قهوه (اختیاری)"
              value={ing.name}
              onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">درصد (%)</label>
                <input
                  type="number"
                  value={ing.percentage || ''}
                  onChange={(e) =>
                    updateIngredient(ing.id, 'percentage', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-500 outline-none text-center"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">وزن (g)</label>
                <input
                  type="number"
                  value={ing.weight || ''}
                  onChange={(e) =>
                    updateIngredient(ing.id, 'weight', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-500 outline-none text-center"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">قیمت (Kg)</label>
                <input
                  type="number"
                  value={ing.pricePerKg || ''}
                  onChange={(e) =>
                    updateIngredient(ing.id, 'pricePerKg', parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-amber-500 outline-none text-center"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addIngredient}
        className="w-full flex items-center justify-center gap-2 bg-gray-700 text-amber-400 font-semibold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors border border-dashed border-gray-500"
      >
        <PlusCircle className="w-5 h-5" />
        <span>افزودن ماده جدید</span>
      </button>

      <div className="bg-gray-800 p-5 rounded-xl shadow-lg text-center space-y-4 border border-gray-700">
        <h2 className="text-lg font-bold text-amber-400">نتایج محاسبه</h2>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-1">قیمت تمام شده (بر اساس درصد)</p>
          <p className="text-2xl font-bold text-white">
            {priceByPercentage.toLocaleString('fa-IR', { maximumFractionDigits: 0 })} <span className="text-sm text-gray-500">تومان</span>
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-1">قیمت تمام شده (بر اساس وزن)</p>
          <p className="text-2xl font-bold text-white">
            {priceByWeight.toLocaleString('fa-IR', { maximumFractionDigits: 0 })} <span className="text-sm text-gray-500">تومان / کیلوگرم</span>
          </p>
        </div>
      </div>
    </div>
  );
};