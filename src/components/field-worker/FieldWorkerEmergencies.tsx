import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { FieldWorkerTaskDetail } from './FieldWorkerTaskDetail';
import { EmergencyIncident } from '../../types';
import { AlertOctagon, MapPin } from 'lucide-react';

export const FieldWorkerEmergencies: React.FC = () => {
  const { emergencies, refreshData } = useCivicData();
  const [activeEmergency, setActiveEmergency] = useState<EmergencyIncident | null>(
    emergencies[0] || null
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="border-b border-[#D8D5CF] pb-4">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#8F1D1D] text-white text-[10px] font-bold uppercase tracking-wider mb-1">
          <AlertOctagon className="w-3.5 h-3.5" />
          Urgent Hazard Protocol
        </div>
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Emergency Field Incidents
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Priority dispatch calls requiring immediate cordon, power shutoff, or leak isolation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          {emergencies.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              No active emergency dispatches for your sector.
            </div>
          ) : (
            emergencies.map((em) => {
              const isSelected = activeEmergency?.id === em.id;
              return (
                <div
                  key={em.id}
                  onClick={() => setActiveEmergency(em)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#8F1D1D] bg-[#FAF3F0] ring-2 ring-[#8F1D1D]/20 shadow-xs'
                      : 'border-[#E8D4CD] bg-white hover:bg-[#FAF3F0]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-black text-[#8F1D1D]">#{em.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8F1D1D] text-white">
                      {em.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-[#282521] line-clamp-1">{em.title}</h3>
                  <p className="text-xs text-[#716A63] line-clamp-2 mt-1">{em.hazardDescription}</p>

                  <div className="text-xs text-[#716A63] flex items-center gap-1 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8F1D1D] shrink-0" />
                    <span className="truncate">{em.location.address}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {activeEmergency ? (
            <FieldWorkerTaskDetail
              task={activeEmergency}
              isEmergency={true}
              onRefresh={refreshData}
            />
          ) : (
            <div className="p-12 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              Select an emergency dispatch to initiate response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
