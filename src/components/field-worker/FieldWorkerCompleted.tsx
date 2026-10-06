import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { CheckCircle2, Camera, ShieldCheck, MapPin } from 'lucide-react';

export const FieldWorkerCompleted: React.FC = () => {
  const { complaints } = useCivicData();

  const completed = complaints.filter(
    c => c.status === 'RESOLVED' || c.status === 'CLOSED'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Completed Field Tasks
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Archived records with uploaded resolution evidence and citizen verification status
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8D5CF] p-8 text-center text-xs text-[#716A63]">
          No completed tasks in your operational history yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completed.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-2">
                <span className="text-xs font-mono font-bold text-[#6A5647]">#{task.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E6B4D] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolved
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#282521]">{task.title}</h3>

              <div className="text-xs text-[#716A63] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#6A5647] shrink-0" />
                <span className="truncate">{task.location.address} ({task.ward})</span>
              </div>

              {task.resolutionNotes && (
                <div className="text-xs text-[#3E3934] bg-[#F8F7F3] p-3 rounded-xl border border-[#EDE6DA]">
                  <span className="font-semibold block text-[#282521]">Submitted Resolution Summary:</span>
                  {task.resolutionNotes}
                </div>
              )}

              {task.resolutionPhoto && (
                <div>
                  <span className="text-[11px] font-semibold text-[#716A63] block mb-1">
                    Uploaded After-Photo Evidence:
                  </span>
                  <div className="h-32 rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${task.resolutionPhoto})` }} />
                </div>
              )}

              <div className="pt-2 border-t border-[#EDE6DA] flex items-center justify-between text-xs">
                <span className="text-[#716A63]">Citizen Verification:</span>
                <span className={`font-bold ${
                  task.citizenVerification === 'VERIFIED_FIXED'
                    ? 'text-[#2E6B4D]'
                    : task.citizenVerification === 'DISPUTED_STILL_EXISTS'
                    ? 'text-[#9C382A]'
                    : 'text-[#B4691B]'
                }`}>
                  {task.citizenVerification ? task.citizenVerification.replace('_', ' ') : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
