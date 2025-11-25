import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { RoastProfile } from '../../types';
import { RoastControlPanel } from './RoastControlPanel';
import { RoastProfileList } from './RoastProfileList';

interface RoastProfilerProps {}

export const RoastProfiler: React.FC<RoastProfilerProps> = () => {
  const [profiles, setProfiles] = useLocalStorage<RoastProfile[]>('roastProfiles', []);
  const [currentView, setCurrentView] = useState<'list' | 'panel'>('list');
  const [selectedProfile, setSelectedProfile] = useState<RoastProfile | undefined>(undefined);

  const handleSelectProfile = (profile: RoastProfile) => {
    setSelectedProfile(profile);
    setCurrentView('panel');
  };

  const handleNewProfile = () => {
    setSelectedProfile(undefined);
    setCurrentView('panel');
  };

  const handleBackToList = () => {
    setSelectedProfile(undefined);
    setCurrentView('list');
  };

  const handleSaveProfile = (profile: RoastProfile) => {
    setProfiles((prev) => {
      const index = prev.findIndex((p) => p.id === profile.id);
      if (index > -1) {
        const newProfiles = [...prev];
        newProfiles[index] = profile;
        return newProfiles;
      }
      return [...prev, profile];
    });
    setSelectedProfile(profile);
    setCurrentView('panel');
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('آیا از حذف این پروفایل مطمئن هستید؟')) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (currentView === 'panel') {
    return (
      <RoastControlPanel
        profileToLoad={selectedProfile}
        onBack={handleBackToList}
        onSave={handleSaveProfile}
      />
    );
  }

  return (
    <RoastProfileList
      profiles={profiles}
      onSelectProfile={handleSelectProfile}
      onNewProfile={handleNewProfile}
      onDeleteProfile={handleDeleteProfile}
    />
  );
};