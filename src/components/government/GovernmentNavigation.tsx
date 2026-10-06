import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  AlertOctagon,
  Map,
  Building,
  Landmark,
  BarChart3,
  History,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

interface GovNavProps {
  activeTab: 'overview' | 'complaints' | 'emergencies' | 'map' | 'departments' | 'wards' | 'analytics' | 'activity' | 'settings';
  setActiveTab: (tab: any) => void;
  activeEmergenciesCount: number;
}

export const GovernmentNavigation: React.FC<GovNavProps> = ({
  activeTab,
  setActiveTab,
  activeEmergenciesCount,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: 'overview' | 'complaints' | 'emergencies' | 'map' | 'departments' | 'wards' | 'analytics' | 'activity' | 'settings';
    label: string;
    icon: any;
    badge?: number;
    isEmergency?: boolean;
  }> = [
    { id: 'overview', label: t('gov_overview'), icon: LayoutDashboard },
    { id: 'emergencies', label: t('gov_emergencies'), icon: AlertOctagon, badge: activeEmergenciesCount, isEmergency: true },
    { id: 'complaints', label: t('gov_complaints'), icon: FileSpreadsheet },
    { id: 'map', label: t('gov_map'), icon: Map },
    { id: 'departments', label: t('gov_departments'), icon: Building },
    { id: 'wards', label: t('gov_wards'), icon: Landmark },
    { id: 'analytics', label: t('gov_analytics'), icon: BarChart3 },
    { id: 'activity', label: t('gov_activity'), icon: History },
    { id: 'settings', label: t('gov_settings'), icon: Settings },
  ];

  return (
    <>
      {/* Desktop Command Center Sidebar — High density, professional */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#282521] text-[#F8F7F3] h-screen sticky top-0 shrink-0 border-r border-[#3E3934]">
        <div>
          {/* Top Officer Badge */}
          <div className="p-5 border-b border-[#3E3934]">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#8F1D1D] text-white flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Municipal Authority
              </span>
              <span className="text-[11px] font-mono text-[#D8D5CF]">
                {user?.employeeId || 'GOV-101'}
              </span>
            </div>
            <div className="text-base font-bold text-white tracking-tight">
              {t('command_center_title')}
            </div>
            <div className="text-xs text-[#D8D5CF] truncate">
              {user?.department || 'Municipal Administration'}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3E3934] text-white shadow-xs'
                      : 'text-[#D8D5CF] hover:bg-[#3E3934]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      item.isEmergency && item.badge && item.badge > 0
                        ? 'text-[#F87171] animate-pulse'
                        : isActive
                        ? 'text-white'
                        : 'text-[#D8D5CF]'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8F1D1D] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Officer Status & Language Switcher */}
        <div className="p-4 border-t border-[#3E3934] bg-[#221F1B] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A8A29E]">Language:</span>
            <div className="flex items-center gap-1 bg-[#3E3934] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                  lang === 'en' ? 'bg-[#EDE6DA] text-[#282521]' : 'text-[#D8D5CF]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                  lang === 'hi' ? 'bg-[#EDE6DA] text-[#282521]' : 'text-[#D8D5CF]'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-[#A8A29E] truncate">{user?.ward || 'Ward 12 Officer'}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-[#3E3934] text-[#D8D5CF] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top & Compact Bar */}
      <div className="lg:hidden bg-[#282521] text-white p-3 border-b border-[#3E3934] sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8F1D1D] animate-ping" />
            <span className="text-xs font-bold tracking-tight uppercase">Command Center &bull; {user?.employeeId}</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs text-[#D8D5CF] flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>

        {/* Scrollable horizontal navigation for mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#3E3934] text-white shadow-xs'
                    : 'text-[#D8D5CF] hover:bg-[#3E3934]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1 rounded text-[10px] bg-[#8F1D1D] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
