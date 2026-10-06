import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Home, PlusCircle, FileText, MapPin, User, LogOut } from 'lucide-react';

interface CitizenNavProps {
  activeTab: 'home' | 'report' | 'complaints' | 'nearby' | 'profile';
  setActiveTab: (tab: 'home' | 'report' | 'complaints' | 'nearby' | 'profile') => void;
}

export const CitizenNavigation: React.FC<CitizenNavProps> = ({ activeTab, setActiveTab }) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();

  const navItems: Array<{
    id: 'home' | 'report' | 'complaints' | 'nearby' | 'profile';
    label: string;
    icon: any;
    isHighlight?: boolean;
  }> = [
    { id: 'home', label: t('nav_home'), icon: Home },
    { id: 'report', label: t('nav_report'), icon: PlusCircle, isHighlight: true },
    { id: 'complaints', label: t('nav_my_complaints'), icon: FileText },
    { id: 'nearby', label: t('nav_nearby'), icon: MapPin },
    { id: 'profile', label: t('nav_profile'), icon: User },
  ];

  return (
    <>
      {/* Desktop Left Navigation — Spacious, warm and calm */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#F3EFE8] border-r border-[#D8D5CF] p-6 h-screen sticky top-0 shrink-0">
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#3E3934] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              NM
            </div>
            <div>
              <div className="font-bold text-[#282521] text-base leading-tight">
                {t('brand_name')}
              </div>
              <div className="text-xs text-[#716A63]">
                Citizen Portal
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3E3934] text-white shadow-xs'
                      : item.isHighlight
                      ? 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#E2D9CB]'
                      : 'text-[#3E3934] hover:bg-[#EDE6DA]/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6A5647]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area & Language Toggle */}
        <div className="pt-6 border-t border-[#D8D5CF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#716A63]">Language:</span>
            <div className="flex items-center gap-1 bg-[#EDE6DA] p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  lang === 'en' ? 'bg-[#3E3934] text-white' : 'text-[#3E3934]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  lang === 'hi' ? 'bg-[#3E3934] text-white' : 'text-[#3E3934]'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#EDE6DA]/60">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-[#282521] truncate">{user?.name}</div>
              <div className="text-[11px] text-[#716A63] truncate">{user?.ward || 'Ward 12'}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-[#D8D5CF] text-[#6A5647] hover:text-[#282521] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F3EFE8]/95 backdrop-blur-md border-t border-[#D8D5CF] px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-[#3E3934]'
                  : 'text-[#716A63] hover:text-[#282521]'
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? 'bg-[#EDE6DA]' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3E3934]' : 'text-[#716A63]'}`} />
              </div>
              <span className="truncate max-w-[54px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
