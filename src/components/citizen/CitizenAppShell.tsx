import React, { useState } from 'react';
import { CitizenNavigation } from './CitizenNavigation';
import { CitizenHome } from './CitizenHome';
import { CitizenReport } from './CitizenReport';
import { CitizenComplaints } from './CitizenComplaints';
import { CitizenNearby } from './CitizenNearby';
import { CitizenProfile } from './CitizenProfile';

export const CitizenAppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'report' | 'complaints' | 'nearby' | 'profile'>('home');
  const [initialEmergencyMode, setInitialEmergencyMode] = useState(false);

  const handleOpenEmergency = () => {
    setInitialEmergencyMode(true);
    setActiveTab('report');
  };

  const handleReportSuccess = () => {
    setInitialEmergencyMode(false);
    setActiveTab('complaints');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col md:flex-row antialiased">
      {/* Desktop sidebar navigation */}
      <CitizenNavigation activeTab={activeTab} setActiveTab={(tab) => {
        if (tab !== 'report') setInitialEmergencyMode(false);
        setActiveTab(tab);
      }} />

      {/* Main spacious calm consumer workspace */}
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        {activeTab === 'home' && (
          <CitizenHome
            onNavigate={(tab) => {
              if (tab !== 'report') setInitialEmergencyMode(false);
              setActiveTab(tab);
            }}
            onOpenEmergency={handleOpenEmergency}
          />
        )}
        {activeTab === 'report' && (
          <CitizenReport
            onSuccess={handleReportSuccess}
            initialIsEmergency={initialEmergencyMode}
          />
        )}
        {activeTab === 'complaints' && <CitizenComplaints />}
        {activeTab === 'nearby' && <CitizenNearby />}
        {activeTab === 'profile' && <CitizenProfile />}
      </main>
    </div>
  );
};
