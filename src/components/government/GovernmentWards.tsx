import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { Landmark, Users, CheckCircle2, Clock } from 'lucide-react';

export const GovernmentWards: React.FC = () => {
  const { wards, complaints, emergencies } = useCivicData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Municipal Wards
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Electoral boundaries, population demographics, and ward resolution metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wards.map((ward) => {
          const wardShort = ward.name.split(' ')[0] + ' ' + ward.name.split(' ')[1];
          const activeWardComplaints = complaints.filter(
            c => (c.ward === wardShort || c.ward === ward.name) && c.status !== 'RESOLVED' && c.status !== 'CLOSED'
          ).length;
          const resolvedWardComplaints = complaints.filter(
            c => (c.ward === wardShort || c.ward === ward.name) && (c.status === 'RESOLVED' || c.status === 'CLOSED')
          ).length;
          const wardEmergencies = emergencies.filter(
            e => (e.ward === wardShort || e.ward === ward.name) && e.status !== 'RESOLVED'
          ).length;

          return (
            <div
              key={ward.id}
              className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between border-b border-[#EDE6DA] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-[#282521]">{ward.name}</h3>
                  <p className="text-xs text-[#716A63]">{ward.nameHi}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#EDE6DA] text-[#6A5647]">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
                  <div className="font-black text-sm text-[#282521]">{ward.population}</div>
                  <div className="text-[11px] text-[#716A63]">Population</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF3F0] border border-[#E8D4CD]">
                  <div className="font-black text-sm text-[#9C382A]">{activeWardComplaints}</div>
                  <div className="text-[11px] text-[#9C382A]">Active Issues</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9]">
                  <div className="font-black text-sm text-[#2E6B4D]">{resolvedWardComplaints}</div>
                  <div className="text-[11px] text-[#2E6B4D]">Resolved</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs pt-1 border-t border-[#EDE6DA]">
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Ward Councillor:</span>
                  <span className="font-semibold text-[#282521]">{ward.councillor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Active Hazards:</span>
                  <span className="font-bold text-[#8F1D1D]">{wardEmergencies} emergencies</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
