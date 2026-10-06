import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCivicData } from '../../context/CivicDataContext';
import { PlusCircle, AlertTriangle, ArrowRight, CheckCircle2, Clock, MapPin, PhoneCall } from 'lucide-react';

interface CitizenHomeProps {
  onNavigate: (tab: 'home' | 'report' | 'complaints' | 'nearby' | 'profile') => void;
  onOpenEmergency: () => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ onNavigate, onOpenEmergency }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { complaints, nearbyComplaints } = useCivicData();

  // Active complaints for this citizen
  const activeComplaints = complaints.slice(0, 3);
  const recentNearby = nearbyComplaints.slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-8 pb-20 md:pb-8">
      {/* Friendly greeting */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6A5647]">
          NagarMitra &bull; {user?.ward || 'Ward 12'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#282521] mt-1">
          {t('citizen_greeting')}, {user?.name?.split(' ')[0] || 'Citizen'}.
        </h1>
        <p className="text-base text-[#716A63] mt-1 font-medium">
          {t('how_can_we_help')}
        </p>
      </div>

      {/* Primary Hero Actions: Report & Emergency */}
      <div className="space-y-3">
        {/* Large Primary Action */}
        <button
          type="button"
          onClick={() => onNavigate('report')}
          className="w-full p-5 sm:p-6 bg-[#3E3934] hover:bg-[#282521] text-white rounded-2xl shadow-sm transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#EDE6DA] flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Civic Resolution
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              {t('report_a_problem')}
            </div>
            <p className="text-xs text-[#D8D5CF]">
              Potholes, broken streetlights, water pipeline leaks, or overflowing waste
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 ml-4 transition-colors">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Secondary: Immediate Danger */}
        <div className="bg-[#FAF3F0] border border-[#E8D4CD] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8F1D1D]/10 text-[#8F1D1D] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#8F1D1D]">
                {t('immediate_danger')}
              </div>
              <p className="text-xs text-[#716A63] mt-0.5">
                {t('immediate_danger_subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenEmergency}
            className="px-3.5 py-2 bg-[#8F1D1D] hover:bg-[#721515] text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            Emergency Alert
          </button>
        </div>
      </div>

      {/* Your Complaints */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#282521]">
            {t('your_complaints')}
          </h2>
          {complaints.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('complaints')}
              className="text-xs font-semibold text-[#6A5647] hover:text-[#282521] cursor-pointer"
            >
              View all ({complaints.length})
            </button>
          )}
        </div>

        {activeComplaints.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-[#D8D5CF] text-center text-xs text-[#716A63]">
            {t('no_complaints_yet')}
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeComplaints.map((c) => {
              const isResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
              return (
                <div
                  key={c.id}
                  onClick={() => onNavigate('complaints')}
                  className="p-4 bg-white hover:bg-[#FDFDFB] rounded-xl border border-[#D8D5CF] transition-all flex items-center justify-between gap-3 cursor-pointer shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-[#716A63]">#{c.id}</span>
                      <span className="text-[11px] text-[#716A63]">&bull; {c.category}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#282521] truncate">
                      {c.title}
                    </div>
                    <div className="text-xs text-[#716A63] mt-0.5 truncate">
                      {c.location.address}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isResolved
                          ? 'bg-[#E8F5E9] text-[#2E6B4D]'
                          : 'bg-[#EDE6DA] text-[#3E3934]'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-3 h-3 text-[#2E6B4D]" />
                      ) : (
                        <Clock className="w-3 h-3 text-[#6A5647]" />
                      )}
                      <span>{c.status.replace('_', ' ')}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#D8D5CF]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nearby Civic Issues Card */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#282521]">
            {t('nearby_issues')}
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('nearby')}
            className="text-xs font-semibold text-[#6A5647] hover:text-[#282521] cursor-pointer"
          >
            Open neighbourhood map
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#D8D5CF] p-4 divide-y divide-[#EDE6DA]">
          {recentNearby.length === 0 ? (
            <div className="text-xs text-[#716A63] py-2 text-center">
              No recent civic issues reported in your immediate vicinity.
            </div>
          ) : (
            recentNearby.map((item) => (
              <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#282521] truncate">{item.title}</div>
                  <div className="text-[11px] text-[#716A63] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#6A5647]" />
                    <span className="truncate">{item.location.address}</span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F3EFE8] text-[#3E3934] shrink-0">
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Municipal Ward Contact Card */}
      <div className="p-4 rounded-xl bg-[#F3EFE8] border border-[#D8D5CF] flex items-center justify-between text-xs text-[#3E3934]">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="w-4 h-4 text-[#6A5647]" />
          <div>
            <span className="font-bold">{t('municipal_contact')}</span>
            <span className="text-[#716A63] block">Ward 12 Municipal Control Desk: 011-2309100</span>
          </div>
        </div>
        <span className="px-2 py-1 bg-white rounded-md text-[11px] font-semibold text-[#6A5647]">
          24/7 Active
        </span>
      </div>
    </div>
  );
};
