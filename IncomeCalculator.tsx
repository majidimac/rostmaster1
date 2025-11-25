import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, DollarSign, Briefcase, Coffee, Package } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

interface IncomeData {
  // Variable Costs (COGS)
  beanPricePerKg: number;
  dosePerCup: number; // grams
  milkCostPerCup: number;
  suppliesCostPerCup: number; // Cup, lid, sugar, etc.
  otherVariableCost: number;

  // Sales
  avgPricePerCup: number;
  avgDailyCups: number;
  workDaysPerMonth: number;

  // Fixed Expenses (Monthly)
  fixedExpenses: ExpenseItem[];
}

const initialData: IncomeData = {
  beanPricePerKg: 800000,
  dosePerCup: 18,
  milkCostPerCup: 5000,
  suppliesCostPerCup: 3000,
  otherVariableCost: 0,
  avgPricePerCup: 60000,
  avgDailyCups: 50,
  workDaysPerMonth: 30,
  fixedExpenses: [
    { id: '1', name: 'اجاره مغازه', amount: 10000000 },
    { id: '2', name: 'حقوق پرسنل', amount: 15000000 },
    { id: '3', name: 'برق و آب و گاز', amount: 2000000 },
  ],
};

export const IncomeCalculator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [data, setData] = useLocalStorage<IncomeData>('incomeData', initialData);
  const [activeTab, setActiveTab] = useState<'costs' | 'sales' | 'expenses' | 'results'>('results');

  const calculations = useMemo(() => {
    // 1. COGS Calculation
    const beanCostPerGram = data.beanPricePerKg / 1000;
    const coffeeCostPerCup = beanCostPerGram * data.dosePerCup;
    const totalCostPerCup = coffeeCostPerCup + data.milkCostPerCup + data.suppliesCostPerCup + data.otherVariableCost;

    // 2. Gross Profit
    const grossProfitPerCup = data.avgPricePerCup - totalCostPerCup;
    const dailyRevenue = data.avgPricePerCup * data.avgDailyCups;
    const dailyCOGS = totalCostPerCup * data.avgDailyCups;
    const dailyGrossProfit = dailyRevenue - dailyCOGS;
    
    const monthlyRevenue = dailyRevenue * data.workDaysPerMonth;
    const monthlyCOGS = dailyCOGS * data.workDaysPerMonth;
    const monthlyGrossProfit = dailyGrossProfit * data.workDaysPerMonth;

    // 3. Fixed Expenses
    const totalFixedExpenses = data.fixedExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // 4. Net Profit
    const netMonthlyProfit = monthlyGrossProfit - totalFixedExpenses;
    const netDailyProfit = netMonthlyProfit / data.workDaysPerMonth;
    
    // Break-even
    const breakEvenCupsMonthly = grossProfitPerCup > 0 ? Math.ceil(totalFixedExpenses / grossProfitPerCup) : 0;
    const breakEvenCupsDaily = data.workDaysPerMonth > 0 ? Math.ceil(breakEvenCupsMonthly / data.workDaysPerMonth) : 0;

    return {
      coffeeCostPerCup,
      totalCostPerCup,
      grossProfitPerCup,
      dailyRevenue,
      monthlyRevenue,
      monthlyCOGS,
      monthlyGrossProfit,
      totalFixedExpenses,
      netMonthlyProfit,
      netDailyProfit,
      breakEvenCupsMonthly,
      breakEvenCupsDaily
    };
  }, [data]);

  const updateData = (field: keyof IncomeData, value: number) => {
    setData({ ...data, [field]: value });
  };

  const addExpense = () => {
    const newExpense = { id: Date.now().toString(), name: '', amount: 0 };
    setData({ ...data, fixedExpenses: [...data.fixedExpenses, newExpense] });
  };

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    const updated = data.fixedExpenses.map(ex => ex.id === id ? { ...ex, [field]: value } : ex);
    setData({ ...data, fixedExpenses: updated });
  };

  const removeExpense = (id: string) => {
    setData({ ...data, fixedExpenses: data.fixedExpenses.filter(ex => ex.id !== id) });
  };

  const formatCurrency = (val: number) => val.toLocaleString('fa-IR');

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Calculator className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-100">محاسبه سود و درآمد</h2>
        </div>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">بازگشت</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('costs')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'costs' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
          >
            هزینه مواد
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'sales' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
          >
            فروش
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'bg-gray-700 text-white shadow' : 'text-gray-400'}`}
          >
            مخارج ثابت
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${activeTab === 'results' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400'}`}
          >
            نتایج
          </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        
        {/* Tab: Variable Costs */}
        {activeTab === 'costs' && (
            <div className="space-y-4 animate-slide-up">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <Coffee className="w-4 h-4" /> هزینه قهوه
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">قیمت خرید قهوه (کیلوگرم)</label>
                            <input 
                                type="number" 
                                value={data.beanPricePerKg} 
                                onChange={(e) => updateData('beanPricePerKg', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">عصاره‌گیری برای هر کاپ (گرم)</label>
                            <input 
                                type="number" 
                                value={data.dosePerCup} 
                                onChange={(e) => updateData('dosePerCup', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                            />
                        </div>
                        <div className="bg-gray-900/50 p-2 rounded text-center text-sm text-gray-300">
                            قیمت قهوه هر شات: <span className="text-emerald-400 font-bold font-mono-digital">{formatCurrency(calculations.coffeeCostPerCup)}</span> تومان
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4" /> سایر مواد مصرفی (میانگین هر کاپ)
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">هزینه شیر (میانگین)</label>
                            <input 
                                type="number" 
                                value={data.milkCostPerCup} 
                                onChange={(e) => updateData('milkCostPerCup', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">هزینه لیوان/درب/نی/شکر</label>
                            <input 
                                type="number" 
                                value={data.suppliesCostPerCup} 
                                onChange={(e) => updateData('suppliesCostPerCup', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">سایر هزینه‌های متغیر</label>
                            <input 
                                type="number" 
                                value={data.otherVariableCost} 
                                onChange={(e) => updateData('otherVariableCost', Number(e.target.value))}
                                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-emerald-100 text-sm">هزینه تمام شده (مواد) هر کاپ:</span>
                    <span className="text-xl font-bold text-white font-mono-digital">{formatCurrency(calculations.totalCostPerCup)}</span>
                </div>
            </div>
        )}

        {/* Tab: Sales */}
        {activeTab === 'sales' && (
             <div className="space-y-4 animate-slide-up">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
                     <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> اطلاعات فروش
                    </h3>
                     <div>
                        <label className="text-xs text-gray-400 block mb-1">میانگین قیمت فروش هر کاپ</label>
                        <input 
                            type="number" 
                            value={data.avgPricePerCup} 
                            onChange={(e) => updateData('avgPricePerCup', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">میانگین تعداد فروش روزانه</label>
                        <input 
                            type="number" 
                            value={data.avgDailyCups} 
                            onChange={(e) => updateData('avgDailyCups', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">تعداد روز کاری در ماه</label>
                        <input 
                            type="number" 
                            value={data.workDaysPerMonth} 
                            onChange={(e) => updateData('workDaysPerMonth', Number(e.target.value))}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-emerald-500 outline-none font-mono-digital"
                        />
                    </div>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-xl">
                     <div className="flex justify-between mb-2">
                         <span className="text-gray-300 text-sm">درآمد ناخالص روزانه:</span>
                         <span className="font-bold text-blue-200 font-mono-digital">{formatCurrency(calculations.dailyRevenue)}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-gray-300 text-sm">درآمد ناخالص ماهانه:</span>
                         <span className="font-bold text-blue-200 font-mono-digital">{formatCurrency(calculations.monthlyRevenue)}</span>
                     </div>
                </div>
             </div>
        )}

        {/* Tab: Expenses */}
        {activeTab === 'expenses' && (
             <div className="space-y-4 animate-slide-up">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> هزینه‌های ثابت ماهانه</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-white font-mono-digital">{formatCurrency(calculations.totalFixedExpenses)}</span>
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                        {data.fixedExpenses.map((expense) => (
                            <div key={expense.id} className="flex gap-2 items-center bg-gray-900/50 p-2 rounded-lg border border-gray-700/50">
                                <input 
                                    type="text" 
                                    placeholder="نام هزینه"
                                    value={expense.name}
                                    onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                    className="flex-grow bg-transparent text-white text-sm outline-none placeholder-gray-600"
                                />
                                <input 
                                    type="number" 
                                    placeholder="مبلغ"
                                    value={expense.amount}
                                    onChange={(e) => updateExpense(expense.id, 'amount', Number(e.target.value))}
                                    className="w-24 bg-transparent text-emerald-400 font-bold text-sm text-center outline-none font-mono-digital"
                                />
                                <button onClick={() => removeExpense(expense.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={addExpense} className="w-full py-3 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-emerald-400 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> افزودن هزینه جدید
                    </button>
                </div>
                <p className="text-xs text-gray-500 px-2">
                    هزینه‌هایی مانند اجاره، حقوق، قبوض، اینترنت، استهلاک دستگاه و ...
                </p>
             </div>
        )}

        {/* Tab: Results */}
        {activeTab === 'results' && (
            <div className="space-y-4 animate-slide-up">
                {/* Net Profit Card */}
                <div className={`p-6 rounded-2xl border-2 shadow-lg relative overflow-hidden ${calculations.netMonthlyProfit > 0 ? 'bg-emerald-900/20 border-emerald-500/50 shadow-emerald-900/20' : 'bg-red-900/20 border-red-500/50 shadow-red-900/20'}`}>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm font-bold mb-1">سود خالص ماهانه</h3>
                        <div className={`text-4xl font-bold font-mono-digital tracking-tight mb-2 ${calculations.netMonthlyProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(calculations.netMonthlyProfit)}
                            <span className="text-sm font-vazir mr-2 opacity-70 text-gray-400">تومان</span>
                        </div>
                        
                        <div className="h-px bg-gray-700/50 my-3"></div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">سود خالص روزانه</span>
                            <span className={`font-bold font-mono-digital ${calculations.netDailyProfit > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                {formatCurrency(Math.round(calculations.netDailyProfit))}
                            </span>
                        </div>
                    </div>
                    {/* Bg Icon */}
                    <div className="absolute -bottom-6 -left-6 opacity-10">
                        {calculations.netMonthlyProfit > 0 ? <TrendingUp className="w-32 h-32" /> : <TrendingDown className="w-32 h-32" />}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">سود ناخالص هر کاپ</span>
                        <span className="text-lg font-bold text-white font-mono-digital">{formatCurrency(calculations.grossProfitPerCup)}</span>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">هزینه مواد (COGS)</span>
                        <span className="text-lg font-bold text-red-300 font-mono-digital">{formatCurrency(calculations.totalCostPerCup)}</span>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">فروش ماهانه</span>
                        <span className="text-lg font-bold text-blue-300 font-mono-digital">{formatCurrency(calculations.monthlyRevenue)}</span>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">هزینه ثابت ماهانه</span>
                        <span className="text-lg font-bold text-orange-300 font-mono-digital">{formatCurrency(calculations.totalFixedExpenses)}</span>
                    </div>
                </div>

                {/* Break Even */}
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-gray-200 text-sm">نقطه سر به سر</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            شما باید <span className="text-amber-400 font-bold">روزانه</span> حداقل <span className="text-white font-bold font-mono-digital text-sm">{calculations.breakEvenCupsDaily.toLocaleString()}</span> کاپ قهوه بفروشید تا هزینه‌های ثابت را پوشش دهید.
                            <span className="block mt-1 opacity-70 text-[10px]">(معادل {calculations.breakEvenCupsMonthly.toLocaleString()} کاپ در ماه)</span>
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setActiveTab('costs')}
                    className="w-full py-3 text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                    ویرایش ورودی‌ها و محاسبه مجدد
                </button>
            </div>
        )}
      </div>
    </div>
  );
};