import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { Building, Users, PhoneCall, FileText } from 'lucide-react';

export const GovernmentDepartments: React.FC = () => {
  const { departments, complaints } = useCivicData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Municipal Departments
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Workforce allocation, active complaint queues, and departmental escalation contacts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptComplaints = complaints.filter(c => c.department === dept.name);
          const unresolved = deptComplaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between border-b border-[#EDE6DA] pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#282521]">{dept.name}</h3>
                  <p className="text-xs text-[#716A63]">{dept.nameHi}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#EDE6DA] text-[#6A5647]">
                  <Building className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Officer-in-Charge:</span>
                  <span className="font-semibold text-[#282521]">{dept.officerInCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Active Field Staff:</span>
                  <span className="font-semibold text-[#3E3934]">{dept.activeStaff} officers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Open Complaints:</span>
                  <span className="font-bold text-[#B4691B]">{unresolved} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Emergency Contact:</span>
                  <span className="font-mono font-semibold text-[#8F1D1D]">{dept.emergencyContact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
