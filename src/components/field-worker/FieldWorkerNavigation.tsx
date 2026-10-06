import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, ListOrdered, AlertOctagon, CheckCircle2, User, LogOut, HardHat } from 'lucide-react';

interface FieldWorkerNavProps {
  activeTab: 'today' | 'assignments' | 'emergencies' | 'completed' | 'profile';
  setActiveTab: (tab: any) => void;
  emergencyCount: number;
}

export const FieldWorkerNavigation: React.FC<FieldWorkerNavProps> = ({
  activeTab,
  setActiveTab,
  emergencyCount,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: 'today' | 'assignments' | 'emergencies' | 'completed' | 'profile';
    label: string;
    icon: any;
    badge?: number;
  }> = [
    { id: 'today', label: t('worker_today'), icon: CheckSquare },
    { id: 'emergencies', label: t('worker_emergencies'), icon: AlertOctagon, badge: emergencyCount },
    { id: 'assignments', label: t('worker_assignments'), icon: ListOrdered },
    { id: 'completed', label: t('worker_completed'), icon: CheckCircle2 },
    { id: 'profile', label: t('worker_profile'), icon: User },
  ];

  return (
    <>
      {/* Desktop Field Operations Navigation — Practical, task-oriented */}
      <aside className="hidden md:flex flex-col justify-between w-60 bg-[#EDE6DA] border-r border-[#D8D5CF] p-5 h-screen sticky top-0 shrink-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#D8D5CF]">
            <div className="w-10 h-10 rounded-xl bg-[#3E3934] text-white flex items-center justify-center font-bold shadow-xs">
              <HardHat className="w-5 h-5 text-[#EDE6DA]" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#282521] leading-tight">
                Field Operations
              </div>
              <div className="text-[11px] font-mono text-[#6A5647]">
                {user?.workerId || 'FW-401'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#3E3934] text-white shadow-xs'
                      : 'text-[#3E3934] hover:bg-[#D8D5CF]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      item.id === 'emergencies' && item.badge && item.badge > 0
                        ? 'text-[#8F1D1D]'
                        : isActive
                        ? 'text-white'
                        : 'text-[#6A5647]'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#8F1D1D] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Worker Status & Language */}
        <div className="pt-4 border-t border-[#D8D5CF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#716A63]">Language:</span>
            <div className="flex items-center gap-1 bg-[#D8D5CF] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  lang === 'en' ? 'bg-[#3E3934] text-white' : 'text-[#3E3934]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${
                  lang === 'hi' ? 'bg-[#3E3934] text-white' : 'text-[#3E3934]'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#D8D5CF]/50">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-[#282521] truncate">{user?.name}</div>
              <div className="text-[10px] text-[#716A63] truncate">{user?.department}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-[#D8D5CF] text-[#6A5647] hover:text-[#282521]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar for Worker */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EDE6DA]/95 backdrop-blur-md border-t border-[#D8D5CF] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-colors relative ${
                isActive ? 'text-[#282521]' : 'text-[#716A63]'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-[#D8D5CF]' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#282521]' : 'text-[#716A63]'}`} />
              </div>
              <span className="truncate max-w-[56px]">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#8F1D1D]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
