import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { FieldWorkerTaskDetail } from './FieldWorkerTaskDetail';
import { Complaint } from '../../types';
import { ListOrdered, MapPin } from 'lucide-react';

export const FieldWorkerAssignments: React.FC = () => {
  const { complaints, refreshData } = useCivicData();
  const [activeTask, setActiveTask] = useState<Complaint | null>(complaints[0] || null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Assigned Tasks Queue
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          All routine municipal work orders assigned to your personnel ID
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          {complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              No work assignments currently in your queue.
            </div>
          ) : (
            complaints.map((c) => {
              const isSelected = activeTask?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveTask(c)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3E3934] bg-white ring-2 ring-[#3E3934]/15 shadow-xs'
                      : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-[#6A5647]">#{c.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDE6DA] text-[#3E3934]">
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#282521] line-clamp-1">{c.title}</h3>
                  <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#6A5647] shrink-0" />
                    <span className="truncate">{c.location.address}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7">
          {activeTask ? (
            <FieldWorkerTaskDetail
              task={activeTask}
              isEmergency={Boolean(activeTask.isEmergency)}
              onRefresh={refreshData}
            />
          ) : (
            <div className="p-12 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              Select an assignment to view location and work details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
