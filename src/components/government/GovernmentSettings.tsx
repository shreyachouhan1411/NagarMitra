import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Bell, Key, LogOut } from 'lucide-react';

export const GovernmentSettings: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Command Center Settings
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Municipal credentials, operational configurations, and notification dispatch setup
        </p>
      </div>

      <div className="space-y-6">
        {/* Officer Profile Card */}
        <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6A5647]" />
            <span>Authenticated Municipal Officer</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8F7F3] p-4 rounded-xl border border-[#EDE6DA]">
            <div>
              <span className="text-[#716A63] block font-medium">Officer Name:</span>
              <span className="font-bold text-[#282521] text-sm">{user?.name}</span>
            </div>
            <div>
              <span className="text-[#716A63] block font-medium">Employee Identifier:</span>
              <span className="font-mono font-bold text-[#6A5647]">{user?.employeeId}</span>
            </div>
            <div>
              <span className="text-[#716A63] block font-medium">Department:</span>
              <span className="text-[#282521]">{user?.department}</span>
            </div>
            <div>
              <span className="text-[#716A63] block font-medium">Assigned Zone:</span>
              <span className="text-[#282521]">{user?.ward}</span>
            </div>
          </div>
        </div>

        {/* Real Notification Environment Status */}
        <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#6A5647]" />
            <span>Emergency Notification Providers</span>
          </h2>

          <p className="text-xs text-[#716A63]">
            NagarMitra uses real provider configuration from environment variables (.env.example). Real delivery requires provider credentials; in-portal notification is active by default.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <span className="font-semibold text-[#282521]">In-Portal Realtime Feed:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E6B4D]">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <span className="font-semibold text-[#282521]">SMS Gateway (SMS_GATEWAY_URL):</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDE6DA] text-[#716A63]">Environment Dependent</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <span className="font-semibold text-[#282521]">WhatsApp Cloud API (WHATSAPP_API_TOKEN):</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDE6DA] text-[#716A63]">Environment Dependent</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA]">
              <span className="font-semibold text-[#282521]">Email / SMTP Gateway (SMTP_HOST):</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDE6DA] text-[#716A63]">Environment Dependent</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full py-3 px-4 rounded-xl border border-[#D8D5CF] text-xs font-bold text-[#9C382A] hover:bg-[#FAF3F0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Civic Command Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
