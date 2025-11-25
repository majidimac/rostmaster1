import React, { useState } from 'react';
import { Flame, Coffee, ClipboardList, Settings, Store, ArrowRight, Home } from 'lucide-react';
import { RoastProfiler } from './modules/RoastProfiler';
import { MixCalculator } from './modules/MixCalculator';
import { PriceListGenerator } from './modules/PriceListGenerator';
import { SettingsPage } from './modules/Settings';
import { CoffeeMaster } from './modules/CoffeeMaster';

type Page = 'roast' | 'calculator' | 'pricelist' | 'settings';
type AppSection = 'portal' | 'roast-master' | 'coffee-master';

const App: React.FC = () => {
  const [appSection, setAppSection] = useState<AppSection>('portal');
  const [activePage, setActivePage] = useState<Page>('roast');

  const renderRoastMasterPage = () => {
    switch (activePage) {
      case 'roast':
        return <RoastProfiler />;
      case 'calculator':
        return <MixCalculator />;
      case 'pricelist':
        return <PriceListGenerator />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <RoastProfiler />;
    }
  };

  const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode }> = ({ page, label, icon }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-colors duration-200 ${
        activePage === page ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );

  // Common Home Button Component
  const HomeButton = () => (
    <button 
        onClick={() => setAppSection('portal')}
        className="absolute top-4 right-4 z-50 flex flex-col items-center justify-center text-gray-400 hover:text-amber-400 transition-colors group"
        title="بازگشت به خانه"
    >
        <div className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl border border-gray-700 group-hover:border-amber-500/50 shadow-lg transition-all">
            <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">خانه</span>
    </button>
  );

  // Coffee Master Specific Home Button (Cyan Theme)
  const CoffeeHomeButton = () => (
    <button 
        onClick={() => setAppSection('portal')}
        className="absolute top-4 right-4 z-50 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors group"
        title="بازگشت به خانه"
    >
        <div className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl border border-gray-700 group-hover:border-cyan-500/50 shadow-lg transition-all">
            <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold mt-1 opacity-70 group-hover:opacity-100 transition-opacity">خانه</span>
    </button>
  );

  if (appSection === 'portal') {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-6 font-vazir relative overflow-hidden">
         {/* Decorative backgrounds */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[100px]"></div>
         </div>

         <div className="relative z-10 w-full max-w-md space-y-10">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 mb-3 font-mono-digital tracking-tighter">
                  MASTER SUITE
                </h1>
                <p className="text-gray-400 text-lg tracking-wide">دستیار حرفه‌ای صنعت قهوه</p>
            </div>

            <div className="grid gap-5">
                <button 
                    onClick={() => setAppSection('roast-master')}
                    className="group relative w-full text-right overflow-hidden bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-3xl p-1 transition-all duration-300 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] hover:-translate-y-1"
                >
                    <div className="bg-gray-900/50 rounded-[20px] p-6 relative z-10 flex items-center gap-5 h-full">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 rounded-2xl group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300 shadow-inner">
                             <Flame className="w-10 h-10 text-amber-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold text-gray-100 group-hover:text-amber-400 transition-colors">رُست مستر</h2>
                            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-400">پروفایلینگ، میکس و قیمت‌گذاری</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-amber-400 group-hover:translate-x-[-4px] transition-all" />
                    </div>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
                </button>

                <button 
                    onClick={() => setAppSection('coffee-master')}
                    className="group relative w-full text-right overflow-hidden bg-gray-800 border border-gray-700 hover:border-cyan-500/50 rounded-3xl p-1 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:-translate-y-1"
                >
                    <div className="bg-gray-900/50 rounded-[20px] p-6 relative z-10 flex items-center gap-5 h-full">
                        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-4 rounded-2xl group-hover:from-cyan-500 group-hover:to-cyan-600 transition-all duration-300 shadow-inner">
                             <Store className="w-10 h-10 text-cyan-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-2xl font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">کافی مستر</h2>
                            <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-400">ابزارهای باریستا و مدیریت بار</p>
                        </div>
                         <ArrowRight className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-[-4px] transition-all" />
                    </div>
                     {/* Hover Glow */}
                     <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
                </button>
            </div>
            
            <footer className="absolute bottom-4 left-0 w-full text-center text-gray-600 text-xs font-mono">
                v1.2.0
            </footer>
         </div>
      </div>
    );
  }

  if (appSection === 'coffee-master') {
      return (
        <div className="relative">
          <CoffeeHomeButton />
          <CoffeeMaster />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-vazir relative">
      <HomeButton />
      <main className="flex-grow pb-24 pt-14">
        {renderRoastMasterPage()}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 shadow-lg z-40">
        <nav className="flex justify-around max-w-lg mx-auto px-2">
          <NavItem page="roast" label="رُست" icon={<Flame className="w-6 h-6" />} />
          <NavItem page="calculator" label="میکس" icon={<Coffee className="w-6 h-6" />} />
          <NavItem page="pricelist" label="لیست قیمت" icon={<ClipboardList className="w-6 h-6" />} />
          <NavItem page="settings" label="تنظیمات" icon={<Settings className="w-6 h-6" />} />
        </nav>
      </footer>
    </div>
  );
};

export default App;