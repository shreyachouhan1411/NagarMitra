import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCivicData } from '../../context/CivicDataContext';
import { User, Mail, MapPin, Globe, Shield, LogOut } from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const { complaints } = useCivicData();

  const totalSubmitted = complaints.length;
  const verifiedFixed = complaints.filter(c => c.citizenVerification === 'VERIFIED_FIXED').length;

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-6 pb-24 md:pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#282521]">Citizen Profile</h1>
        <p className="text-xs text-[#716A63] mt-1">Your NagarMitra resident account</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-4 border-b border-[#EDE6DA] pb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE6DA] text-[#6A5647] flex items-center justify-center font-bold text-xl">
            {user?.name?.slice(0, 2).toUpperCase() || 'CI'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#282521]">{user?.name}</h2>
            <div className="text-xs text-[#716A63] flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </div>
            <div className="text-xs text-[#716A63] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#6A5647]" />
              <span>Registered to {user?.ward || 'Ward 12'}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#EDE6DA]">
            <div className="text-2xl font-bold text-[#282521]">{totalSubmitted}</div>
            <div className="text-xs text-[#716A63]">Complaints Submitted</div>
          </div>
          <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#EDE6DA]">
            <div className="text-2xl font-bold text-[#2E6B4D]">{verifiedFixed}</div>
            <div className="text-xs text-[#716A63]">Verified Resolutions</div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="space-y-2 border-t border-[#EDE6DA] pt-4">
          <label className="text-xs font-bold text-[#282521] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#6A5647]" />
            Language Preference / भाषा प्राथमिकता
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

        {/* Privacy & Role Notice */}
        <div className="p-3.5 rounded-xl bg-[#F3EFE8] text-xs text-[#716A63] flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#6A5647] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#3E3934]">Citizen Privacy Protected:</span> Your telephone and email details are never published to community members or public feeds.
          </div>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-[#D8D5CF] text-xs font-bold text-[#9C382A] hover:bg-[#FAF3F0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of NagarMitra</span>
          </button>
        </div>
      </div>
    </div>
  );
};
