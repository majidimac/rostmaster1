import React from 'react';
import { Save, Upload } from 'lucide-react';

interface SettingsPageProps {}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const handleExport = () => {
    const roastProfiles = localStorage.getItem('roastProfiles');
    const priceListBusinessInfo = localStorage.getItem('priceListBusinessInfo');
    const priceListProducts = localStorage.getItem('priceListProducts');

    const dataToExport = {
      roastProfiles: roastProfiles ? JSON.parse(roastProfiles) : [],
      priceListBusinessInfo: priceListBusinessInfo ? JSON.parse(priceListBusinessInfo) : {},
      priceListProducts: priceListProducts ? JSON.parse(priceListProducts) : {},
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `roast_master_backup_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (
      !window.confirm(
        'آیا مطمئن هستید؟ با وارد کردن داده‌ها، تمام اطلاعات فعلی شما بازنویسی خواهد شد. این عمل قابل بازگشت نیست.'
      )
    ) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          const data = JSON.parse(text);
          let importedSomething = false;
          if (data.roastProfiles && Array.isArray(data.roastProfiles)) {
            localStorage.setItem('roastProfiles', JSON.stringify(data.roastProfiles));
            importedSomething = true;
          }
          if (data.priceListBusinessInfo && typeof data.priceListBusinessInfo === 'object') {
            localStorage.setItem('priceListBusinessInfo', JSON.stringify(data.priceListBusinessInfo));
            importedSomething = true;
          }
          if (data.priceListProducts && typeof data.priceListProducts === 'object') {
            localStorage.setItem('priceListProducts', JSON.stringify(data.priceListProducts));
            importedSomething = true;
          }

          if (importedSomething) {
            alert('داده‌ها با موفقیت وارد شد. برنامه مجدداً بارگذاری می‌شود.');
            window.location.reload();
          } else {
            alert('فایل پشتیبان معتبر نبود یا داده‌ای برای وارد کردن نداشت.');
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('خطا در پردازش فایل. لطفاً مطمئن شوید فایل معتبر است.');
        } finally {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-center text-amber-400">تنظیمات</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-lg font-semibold text-amber-300 mb-4">مدیریت داده‌ها</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          در اینجا می‌توانید از تمام اطلاعات برنامه (شامل پروفایل‌های رُست و لیست قیمت‌ها) پشتیبان بگیرید و یا فایل پشتیبان قبلی را بازگردانی کنید.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Save className="w-5 h-5" />
            <span>دانلود فایل پشتیبان (Backup)</span>
          </button>

          <div className="relative">
            <input
              type="file"
              id="import-file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
            />
            <label
              htmlFor="import-file"
              className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-green-700 transition-colors cursor-pointer shadow-lg shadow-green-600/20"
            >
              <Upload className="w-5 h-5" />
              <span>بازگردانی اطلاعات (Import)</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-600 pt-8">
          <p>Roast Master PWA - v1.1.0</p>
      </div>
    </div>
  );
};