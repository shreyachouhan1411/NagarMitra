import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GovernmentMapFull } from '../maps/GovernmentMapFull';
import {
  AlertOctagon,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Users,
  Activity,
  ChevronRight
} from 'lucide-react';

interface GovOverviewProps {
  onNavigate: (tab: any) => void;
  onSelectIncident: (incident: any) => void;
}

export const GovernmentOverview: React.FC<GovOverviewProps> = ({ onNavigate, onSelectIncident }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { complaints, emergencies, analytics, auditLogs } = useCivicData();

  // Metrics
  const activeEmergencies = emergencies.filter(e => e.status !== 'RESOLVED');
  const criticalQueue = complaints.filter(c => c.priority === 'CRITICAL' && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const highQueue = complaints.filter(c => c.priority === 'HIGH' && c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const moderateQueue = complaints.filter(c => c.priority === 'MODERATE' && c.status !== 'RESOLVED' && c.status !== 'CLOSED');

  const assignedCount = complaints.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const awaitingCount = complaints.filter(c => c.status === 'SUBMITTED' || c.status === 'VERIFIED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header: Operational question and date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CF] pb-4">
        <div>
          <div className="text-xs font-mono font-bold text-[#6A5647] uppercase tracking-wider">
            Municipal Operations Desk &bull; {user?.ward || 'Ward 12'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#282521] tracking-tight mt-0.5">
            {t('what_needs_attention')}
          </h1>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-[#716A63]">{todayDate}</div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2E6B4D]/10 text-[#2E6B4D] text-xs font-bold mt-1">
            <span className="w-2 h-2 rounded-full bg-[#2E6B4D] animate-pulse" />
            <span>Civic Incident Feed: Live</span>
          </div>
        </div>
      </div>

      {/* EMERGENCY ATTENTION BANNER — Highest priority */}
      {activeEmergencies.length > 0 && (
        <section className="bg-[#FAF3F0] border-2 border-[#8F1D1D]/40 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8D4CD] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#8F1D1D] text-white">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#8F1D1D] tracking-tight uppercase">
                  {t('emergency_attention')}
                </h2>
                <p className="text-xs text-[#716A63]">
                  {activeEmergencies.length} critical emergency incidents requiring immediate dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('emergencies')}
              className="text-xs font-bold text-[#8F1D1D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Emergency Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeEmergencies.map((em) => (
              <div
                key={em.id}
                onClick={() => {
                  onSelectIncident({ type: 'emergency', data: em });
                  onNavigate('emergencies');
                }}
                className="bg-white p-4 rounded-xl border border-[#E8D4CD] hover:border-[#8F1D1D] transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-black text-[#8F1D1D]">
                      {em.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8F1D1D] text-white">
                      {em.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#282521] line-clamp-1">{em.title}</h3>
                  <p className="text-xs text-[#716A63] line-clamp-1 mt-1">{em.hazardDescription}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#716A63] border-t border-[#EDE6DA] pt-2.5 mt-3">
                  <span>{em.ward} &bull; {em.department}</span>
                  <span className="font-semibold text-[#8F1D1D]">{em.assignedWorkerName || 'Awaiting Squad'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRIORITY QUEUE & TODAY'S STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRIORITY QUEUE */}
        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
            <h2 className="text-sm font-black text-[#282521] uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#9C382A]" />
              <span>{t('priority_queue')}</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('complaints')}
              className="text-xs font-semibold text-[#6A5647] hover:text-[#282521] cursor-pointer"
            >
              Inspect Queue
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#FAF3F0] border border-[#E8D4CD]">
              <div className="text-2xl font-black text-[#9C382A]">{criticalQueue.length}</div>
              <div className="text-xs font-semibold text-[#9C382A]">Critical</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF8E7] border border-[#F0DC9F]">
              <div className="text-2xl font-black text-[#B4691B]">{highQueue.length}</div>
              <div className="text-xs font-semibold text-[#B4691B]">High Priority</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <div className="text-2xl font-black text-[#3E3934]">{moderateQueue.length}</div>
              <div className="text-xs font-semibold text-[#716A63]">Moderate</div>
            </div>
          </div>
        </section>

        {/* TODAY'S MUNICIPAL NUMBERS */}
        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
            <h2 className="text-sm font-black text-[#282521] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6A5647]" />
              <span>{t('today_stats')}</span>
            </h2>
            <span className="text-xs text-[#716A63] font-mono">Ward-wide Summary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <div className="text-xl font-black text-[#282521]">{complaints.length}</div>
              <div className="text-[11px] text-[#716A63]">{t('active_complaints')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <div className="text-xl font-black text-[#3E3934]">{assignedCount}</div>
              <div className="text-[11px] text-[#716A63]">{t('assigned_count')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <div className="text-xl font-black text-[#B4691B]">{awaitingCount}</div>
              <div className="text-[11px] text-[#716A63]">{t('awaiting_action')}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9]">
              <div className="text-xl font-black text-[#2E6B4D]">{resolvedCount}</div>
              <div className="text-[11px] text-[#2E6B4D]">{t('resolved_count')}</div>
            </div>
          </div>
        </section>
      </div>

      {/* OPERATIONAL INTERACTIVE MAP */}
      <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
          <div>
            <h2 className="text-sm font-black text-[#282521] uppercase tracking-wider">
              Municipal Geospatial Issue Map
            </h2>
            <p className="text-xs text-[#716A63]">
              Real-time map showing complaints, emergency incidents, and field assignments
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="text-xs font-semibold text-[#6A5647] hover:text-[#282521] cursor-pointer"
          >
            Full Map View
          </button>
        </div>

        <div className="h-[440px] w-full">
          <GovernmentMapFull
            complaints={complaints}
            emergencies={emergencies}
            onSelectIncident={onSelectIncident}
          />
        </div>
      </section>

      {/* RECENT MUNICIPAL AUDIT ACTIVITY */}
      <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
          <h2 className="text-sm font-black text-[#282521] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6A5647]" />
            <span>Audit Trail & Recent Operational Activity</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-[#6A5647] hover:text-[#282521] cursor-pointer"
          >
            View all logs
          </button>
        </div>

        <div className="divide-y divide-[#EDE6DA]">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-[#282521]">
                  <span className="font-mono text-[#6A5647]">[{log.actorRole}]</span> {log.actorName}: {log.details}
                </div>
                <div className="text-[11px] text-[#716A63]">
                  Target: {log.targetId} &bull; Action: {log.action}
                </div>
              </div>
              <span className="text-[11px] text-[#716A63] shrink-0 font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
