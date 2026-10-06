import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { HardHat, Phone, Building, MapPin, Globe, LogOut } from 'lucide-react';

export const FieldWorkerProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLanguage();

  return (
    <div className="max-w-xl mx-auto py-6 px-4 sm:px-6 space-y-6 pb-24 md:pb-8">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521]">Field Worker Roster Profile</h1>
        <p className="text-xs text-[#716A63] mt-0.5">Municipal operational personnel credentials</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-4 border-b border-[#EDE6DA] pb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#3E3934] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            <HardHat className="w-7 h-7 text-[#EDE6DA]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#282521]">{user?.name}</h2>
            <div className="text-xs font-mono font-bold text-[#6A5647]">
              Worker ID: {user?.workerId || 'FW-401'}
            </div>
            <div className="text-xs text-[#716A63] mt-0.5">
              {user?.department}
            </div>
          </div>
        </div>

        <div className="space-y-2.5 text-xs bg-[#F8F7F3] p-4 rounded-xl border border-[#EDE6DA]">
          <div className="flex items-center justify-between">
            <span className="text-[#716A63] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Department
            </span>
            <span className="font-semibold text-[#282521]">{user?.department}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#716A63] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Assigned Ward
            </span>
            <span className="font-semibold text-[#282521]">{user?.ward}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#716A63] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Duty Contact Phone
            </span>
            <span className="font-mono font-semibold text-[#282521]">{user?.phone || '+91 98765 43210'}</span>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2 border-t border-[#EDE6DA] pt-4">
          <label className="text-xs font-bold text-[#282521] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#6A5647]" />
            Language Preference / भाषा
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#3E3934] text-white border-[#3E3934]'
                  : 'bg-white text-[#3E3934] border-[#D8D5CF] hover:bg-[#F8F7F3]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                lang === 'hi'
                  ? 'bg-[#3E3934] text-white border-[#3E3934]'
                  : 'bg-white text-[#3E3934] border-[#D8D5CF] hover:bg-[#F8F7F3]'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-[#D8D5CF] text-xs font-bold text-[#9C382A] hover:bg-[#FAF3F0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Field Operations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
