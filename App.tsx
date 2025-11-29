import React, { useState } from 'react';
import { Flame, Coffee, ClipboardList, Settings, Store, ArrowRight, Home, Calculator, Droplets } from 'lucide-react';
import { RoastControlPanel } from './RoastControlPanel';
import useLocalStorage from './hooks/useLocalStorage';
import { RoastProfile } from './types';
import { RoastProfileList } from './RoastProfileList';
import { MixCalculator } from './MixCalculator';
import { PriceListGenerator } from './PriceListGenerator';
import { SettingsPage } from './Settings';
import { CoffeeMaster } from './CoffeeMaster';

/**
 * Defines the available pages within the Roast Master section.
 */
type Page = 'roast' | 'calculator' | 'pricelist' | 'settings';

/**
 * Defines the main sections of the application.
 */
type AppSection = 'portal' | 'roast-master' | 'coffee-master';

/**
 * The main application component. It acts as a router to navigate between the main portal,
 * the Roast Master section, and the Coffee Master section.
 * @returns {JSX.Element} The rendered application.
 */
const App: React.FC = () => {
  /**
   * State to manage the currently active application section.
   * 'portal' is the main landing page.
   * 'roast-master' is the section for roast profiling, mix calculation, and price lists.
   * 'coffee-master' is the section for barista tools and cafe management.
   */
  const [appSection, setAppSection] = useState<AppSection>('portal');

  /**
   * State to manage the currently active page within the Roast Master section.
   * Defaults to 'roast'.
   */
  const [activePage, setActivePage] = useState<Page>('roast');
  const [coffeeMasterPage, setCoffeeMasterPage] = useState<'menu' | 'backflush' | 'income' | 'recipes'>('menu');

  const [profiles, setProfiles] = useLocalStorage<RoastProfile[]>('roastProfiles', []);
  const [selectedProfile, setSelectedProfile] = useState<RoastProfile | undefined>(undefined);
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list');

  const handleSelectProfile = (profile: RoastProfile) => {
    setSelectedProfile(profile);
    setView('edit');
  };

  const handleBack = () => {
    setSelectedProfile(undefined);
    setView('list');
  };

  const handleSaveProfile = (profileToSave: RoastProfile) => {
    const existingIndex = profiles.findIndex(p => p.id === profileToSave.id);
    if (existingIndex > -1) {
      const updatedProfiles = [...profiles];
      updatedProfiles[existingIndex] = profileToSave;
      setProfiles(updatedProfiles);
    } else {
      setProfiles([...profiles, profileToSave]);
    }
    setView('list');
    setSelectedProfile(undefined);
  };

  const handleNewProfile = () => {
    setSelectedProfile(undefined);
    setView('new');
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('آیا از حذف این پروفایل اطمینان دارید؟')) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  /**
   * Renders the appropriate component for the active page in the Roast Master section.
   * @returns {JSX.Element} The component for the active page.
   */
  const renderRoastMasterPage = () => {
    if (activePage === 'roast') {
      if (view === 'new') {
        return <RoastControlPanel onBack={handleBack} onSave={handleSaveProfile} />;
      }
      if (view === 'edit' && selectedProfile) {
        return <RoastControlPanel profileToLoad={selectedProfile} onBack={handleBack} onSave={handleSaveProfile} />;
      }
      return <RoastProfileList profiles={profiles} onSelectProfile={handleSelectProfile} onNewProfile={handleNewProfile} onDeleteProfile={handleDeleteProfile} />;
    }

    switch (activePage) {
      case 'calculator':
        return <MixCalculator />;
      case 'pricelist':
        return <PriceListGenerator />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <RoastProfileList profiles={profiles} onSelectProfile={handleSelectProfile} onNewProfile={handleNewProfile} onDeleteProfile={handleDeleteProfile} />;
    }
  };

  /**
   * A navigation item component for the bottom navigation bar in the Roast Master section.
   * @param {object} props - The component props.
   * @param {Page} props.page - The page this item navigates to.
   * @param {string} props.label - The text label for the navigation item.
   * @param {React.ReactNode} props.icon - The icon for the navigation item.
   * @returns {JSX.Element} A button element that acts as a navigation link.
   */
  const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode; [key: string]: any }> = ({ page, label, icon, ...rest }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-colors duration-200 ${
        activePage === page ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'
      }`}
      {...rest}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );

  /**
   * A reusable home button component that navigates back to the main portal.
   * This version is themed for the Roast Master section.
   * @returns {JSX.Element} A button element that navigates to the portal.
   */
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

  /**
   * A reusable home button component that navigates back to the main portal.
   * This version is themed for the Coffee Master section with a cyan color scheme.
   * @returns {JSX.Element} A button element that navigates to the portal.
   */
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
          <CoffeeMaster setCoffeeMasterPage={setCoffeeMasterPage} coffeeMasterPage={coffeeMasterPage} />
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
          <NavItem data-testid="settings-button" page="settings" label="تنظیمات" icon={<Settings className="w-6 h-6" />} />
        </nav>
      </footer>
    </div>
  );
};

export default App;