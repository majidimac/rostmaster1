import React from 'react';
import { Trash2, Coffee } from 'lucide-react';
import { RoastProfile } from '../../types';

interface RoastProfileListProps {
  profiles: RoastProfile[];
  onSelectProfile: (profile: RoastProfile) => void;
  onNewProfile: () => void;
  onDeleteProfile: (id: string) => void;
}

export const RoastProfileList: React.FC<RoastProfileListProps> = ({
  profiles,
  onSelectProfile,
  onNewProfile,
  onDeleteProfile,
}) => {
  return (
    <div className="p-4 max-w-lg mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-amber-400">پروفایل‌های رُست</h1>
        </div>
        <button
          onClick={onNewProfile}
          className="bg-amber-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          پروفایل جدید +
        </button>
      </div>
      <div className="space-y-3">
        {profiles.length > 0 ? (
          [...profiles]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((profile) => (
              <div
                key={profile.id}
                className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700 hover:border-gray-600 transition-all flex justify-between items-center group"
              >
                <div onClick={() => onSelectProfile(profile)} className="cursor-pointer flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {profile.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(profile.createdAt).toLocaleDateString('fa-IR')} <span className="mx-1">•</span>{' '}
                    {profile.greenBeanWeight} گرم
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProfile(profile.id);
                  }}
                  className="text-gray-500 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
            <Coffee className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">هنوز پروفایلی ذخیره نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
};