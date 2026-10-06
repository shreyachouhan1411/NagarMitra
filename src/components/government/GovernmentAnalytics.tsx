import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

export const GovernmentAnalytics: React.FC = () => {
  const { analytics, complaints, emergencies, wards } = useCivicData();

  const total = complaints.length;
  const verifiedFixed = complaints.filter(c => c.citizenVerification === 'VERIFIED_FIXED').length;
  const disputedCount = complaints.filter(c => c.citizenVerification === 'DISPUTED_STILL_EXISTS').length;
  const activeEmergencies = emergencies.filter(e => e.status !== 'RESOLVED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Municipal Operations Analytics
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Resolution performance, ward load distribution, recurring civic issues, and citizen verification rates
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
        <div className="bg-white p-4 rounded-2xl border border-[#D8D5CF] shadow-xs">
          <div className="text-2xl font-black text-[#282521]">{total}</div>
          <div className="text-xs font-semibold text-[#716A63] mt-0.5">Total Civic Reports</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D5CF] shadow-xs">
          <div className="text-2xl font-black text-[#2E6B4D]">14.5 hrs</div>
          <div className="text-xs font-semibold text-[#716A63] mt-0.5">Avg Resolution Time</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D5CF] shadow-xs">
          <div className="text-2xl font-black text-[#2E6B4D]">{verifiedFixed}</div>
          <div className="text-xs font-semibold text-[#716A63] mt-0.5">Citizen Verified Fixed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D8D5CF] shadow-xs">
          <div className="text-2xl font-black text-[#9C382A]">{disputedCount}</div>
          <div className="text-xs font-semibold text-[#9C382A] mt-0.5">Citizen Reopened / Disputed</div>
        </div>
      </div>

      {/* Ward-by-Ward Breakdown */}
      <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider">
          Ward-by-Ward Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wards.map((ward) => {
            const wardShort = ward.name.split(' ')[0] + ' ' + ward.name.split(' ')[1];
            const wComplaints = complaints.filter(c => c.ward === wardShort || c.ward === ward.name);
            const highPri = wComplaints.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length;
            const emCount = emergencies.filter(e => e.ward === wardShort || e.ward === ward.name).length;
            const resCount = wComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
            const rate = wComplaints.length > 0 ? Math.round((resCount / wComplaints.length) * 100) : 100;

            return (
              <div key={ward.id} className="p-4 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#282521]">{ward.name}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EDE6DA] text-[#3E3934]">
                    {rate}% Resolved
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-[#EDE6DA]">
                    <span className="font-bold block text-sm text-[#282521]">{wComplaints.length}</span>
                    <span className="text-[10px] text-[#716A63]">Complaints</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EDE6DA]">
                    <span className="font-bold block text-sm text-[#B4691B]">{highPri}</span>
                    <span className="text-[10px] text-[#716A63]">High Priority</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#EDE6DA]">
                    <span className="font-bold block text-sm text-[#8F1D1D]">{emCount}</span>
                    <span className="text-[10px] text-[#716A63]">Emergencies</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recurring Issues & Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider">
            Detected Recurring Civic Patterns
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-[#FAF3F0] rounded-xl border border-[#E8D4CD] text-[#8F1D1D]">
              <span className="font-bold block">Pothole Cluster — Ward 12 Main Avenue</span>
              <span className="text-[11px] text-[#716A63]">3 separate citizen reports within 200m radius following water main works.</span>
            </div>
            <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#EDE6DA] text-[#3E3934]">
              <span className="font-bold block">Street Light Feeder Tripping — Ward 8 Sector 2</span>
              <span className="text-[11px] text-[#716A63]">Repeated breaker fault reported after heavy rain. Substation inspection ordered.</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider">
            Citizen Verification Metric
          </h2>
          <p className="text-xs text-[#716A63]">
            Citizen closed-loop feedback verifies whether completed municipal repairs were satisfactory.
          </p>
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA] space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#2E6B4D]">Confirmed Fixed by Resident:</span>
              <span className="font-bold">{verifiedFixed}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#9C382A]">Disputed / Reopened:</span>
              <span className="font-bold">{disputedCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#716A63]">Awaiting Citizen Response:</span>
              <span className="font-bold">{complaints.filter(c => (c.status === 'RESOLVED' || c.status === 'CLOSED') && c.citizenVerification === 'PENDING').length}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
