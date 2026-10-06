import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { FieldWorkerNavigation } from './FieldWorkerNavigation';
import { FieldWorkerToday } from './FieldWorkerToday';
import { FieldWorkerAssignments } from './FieldWorkerAssignments';
import { FieldWorkerEmergencies } from './FieldWorkerEmergencies';
import { FieldWorkerCompleted } from './FieldWorkerCompleted';
import { FieldWorkerProfile } from './FieldWorkerProfile';

export const FieldWorkerAppShell: React.FC = () => {
  const { emergencies } = useCivicData();
  const [activeTab, setActiveTab] = useState<
    'today' | 'assignments' | 'emergencies' | 'completed' | 'profile'
  >('today');

  const emergencyCount = emergencies.filter(e => e.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col md:flex-row antialiased">
      {/* Field Worker Navigation */}
      <FieldWorkerNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        emergencyCount={emergencyCount}
      />

      {/* Main Task-Centric Workspace */}
      <main className="flex-1 w-full min-h-screen overflow-y-auto">
        {activeTab === 'today' && <FieldWorkerToday onNavigateTab={setActiveTab} />}
        {activeTab === 'assignments' && <FieldWorkerAssignments />}
        {activeTab === 'emergencies' && <FieldWorkerEmergencies />}
        {activeTab === 'completed' && <FieldWorkerCompleted />}
        {activeTab === 'profile' && <FieldWorkerProfile />}
      </main>
    </div>
  );
};
