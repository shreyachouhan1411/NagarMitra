import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { GovernmentNavigation } from './GovernmentNavigation';
import { GovernmentOverview } from './GovernmentOverview';
import { GovernmentComplaints } from './GovernmentComplaints';
import { GovernmentEmergencies } from './GovernmentEmergencies';
import { GovernmentMap } from './GovernmentMap';
import { GovernmentDepartments } from './GovernmentDepartments';
import { GovernmentWards } from './GovernmentWards';
import { GovernmentAnalytics } from './GovernmentAnalytics';
import { GovernmentActivity } from './GovernmentActivity';
import { GovernmentSettings } from './GovernmentSettings';

export const GovernmentAppShell: React.FC = () => {
  const { emergencies } = useCivicData();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'complaints' | 'emergencies' | 'map' | 'departments' | 'wards' | 'analytics' | 'activity' | 'settings'
  >('overview');

  const activeEmergenciesCount = emergencies.filter(e => e.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col lg:flex-row antialiased">
      {/* Dedicated Command Center Sidebar */}
      <GovernmentNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeEmergenciesCount={activeEmergenciesCount}
      />

      {/* Main Command Center Operational Workspace */}
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        {activeTab === 'overview' && (
          <GovernmentOverview
            onNavigate={setActiveTab}
            onSelectIncident={() => {}}
          />
        )}
        {activeTab === 'complaints' && <GovernmentComplaints />}
        {activeTab === 'emergencies' && <GovernmentEmergencies />}
        {activeTab === 'map' && <GovernmentMap />}
        {activeTab === 'departments' && <GovernmentDepartments />}
        {activeTab === 'wards' && <GovernmentWards />}
        {activeTab === 'analytics' && <GovernmentAnalytics />}
        {activeTab === 'activity' && <GovernmentActivity />}
        {activeTab === 'settings' && <GovernmentSettings />}
      </main>
    </div>
  );
};
