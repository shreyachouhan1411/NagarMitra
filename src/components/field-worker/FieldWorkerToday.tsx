import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FieldWorkerTaskDetail } from './FieldWorkerTaskDetail';
import { Complaint, EmergencyIncident } from '../../types';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Navigation,
  HardHat
} from 'lucide-react';

interface FieldWorkerTodayProps {
  onNavigateTab: (tab: any) => void;
}

export const FieldWorkerToday: React.FC<FieldWorkerTodayProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { complaints, emergencies, refreshData } = useCivicData();

  // Active emergency requiring worker's squad
  const emergencyTask = emergencies.find(e => e.status !== 'RESOLVED');

  // Today's regular assigned tasks
  const todayTasks = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED');

  // Currently selected task for detailed view in desktop split or mobile modal
  const [selectedTask, setSelectedTask] = useState<{
    task: Complaint | EmergencyIncident;
    isEmergency: boolean;
  } | null>(
    emergencyTask
      ? { task: emergencyTask, isEmergency: true }
      : todayTasks[0]
      ? { task: todayTasks[0], isEmergency: false }
      : null
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Top Header: "WHAT DO I NEED TO DO?" */}
      <div className="border-b border-[#D8D5CF] pb-4">
        <div className="text-xs font-mono font-bold text-[#6A5647] uppercase tracking-wider flex items-center gap-1.5">
          <HardHat className="w-3.5 h-3.5" />
          <span>Field Squad Roster &bull; {user?.workerId || 'FW-401'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#282521] tracking-tight mt-1">
          {t('what_do_i_need')}
        </h1>
        <p className="text-sm font-semibold text-[#6A5647] mt-0.5">
          {t('worker_greeting')}, {user?.name?.split(' ')[0] || 'Worker'}. You have {todayTasks.length + (emergencyTask ? 1 : 0)} tasks today.
        </p>
      </div>

      {/* Desktop Split Layout: Task list (left) + Actionable task detail workspace (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks Queue */}
        <div className="lg:col-span-5 space-y-4">
          {/* EMERGENCY TASK CARD — Visually prominent */}
          {emergencyTask && (
            <div
              onClick={() => setSelectedTask({ task: emergencyTask, isEmergency: true })}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-xs ${
                selectedTask?.task.id === emergencyTask.id
                  ? 'border-[#8F1D1D] bg-[#FAF3F0] ring-2 ring-[#8F1D1D]/30'
                  : 'border-[#8F1D1D]/60 bg-[#FAF3F0] hover:border-[#8F1D1D]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#8F1D1D] text-white flex items-center gap-1 uppercase tracking-wider">
                  <AlertOctagon className="w-3 h-3 animate-ping" />
                  EMERGENCY RESPONSE
                </span>
                <span className="text-xs font-mono font-bold text-[#8F1D1D]">
                  {emergencyTask.id}
                </span>
              </div>

              <h3 className="text-base font-black text-[#282521] leading-snug">
                {emergencyTask.title}
              </h3>

              <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8F1D1D] shrink-0" />
                <span className="truncate">{emergencyTask.location.address} ({emergencyTask.ward})</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8D4CD]">
                <span className="text-[11px] font-bold text-[#8F1D1D]">
                  Status: {emergencyTask.status.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#8F1D1D] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <span>Respond</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TODAY'S TASKS LIST */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#3E3934]">
                {t('todays_tasks')} ({todayTasks.length})
              </h2>
              <span className="text-[11px] text-[#716A63]">Prioritized Order</span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-[#D8D5CF] text-center text-xs text-[#716A63]">
                No pending regular tasks assigned for today.
              </div>
            ) : (
              todayTasks.map((task) => {
                const isSelected = selectedTask?.task.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask({ task, isEmergency: false })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#3E3934] bg-white ring-2 ring-[#3E3934]/15 shadow-xs'
                        : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#6A5647]">#{task.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDE6DA] text-[#3E3934]">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#282521] line-clamp-1">{task.title}</h3>

                    <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#6A5647] shrink-0" />
                      <span className="truncate">{task.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#716A63] border-t border-[#EDE6DA] pt-2 mt-2.5">
                      <span>{task.category}</span>
                      <span className="font-semibold text-[#3E3934]">{task.priority} Priority</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Task Detailed Workspace */}
        <div className="lg:col-span-7">
          {selectedTask ? (
            <FieldWorkerTaskDetail
              task={selectedTask.task}
              isEmergency={selectedTask.isEmergency}
              onRefresh={refreshData}
            />
          ) : (
            <div className="p-12 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              Select a task from your queue to open instructions, location map, and completion controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
