import React from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { History, Bell, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const GovernmentActivity: React.FC = () => {
  const { auditLogs, notifications } = useCivicData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-[#D8D5CF] pb-4">
        <h1 className="text-2xl font-black text-[#282521] tracking-tight">
          Audit Activity & Multi-Channel Notifications
        </h1>
        <p className="text-xs text-[#716A63] mt-0.5">
          Immutable audit trail and real notification delivery statuses across Portal, SMS, WhatsApp, and Email
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Logs */}
        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EDE6DA] pb-3">
            <History className="w-4 h-4 text-[#6A5647]" />
            <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider">
              Municipal Audit Trail ({auditLogs.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-[#6A5647]">[{log.actorRole}] {log.actorName}</span>
                  <span className="font-mono text-[#716A63]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="font-semibold text-[#282521]">{log.details}</div>
                <div className="text-[10px] text-[#716A63] font-mono">
                  Action: {log.action} &bull; Target: {log.targetId}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notifications Dispatcher Logs */}
        <section className="bg-white rounded-2xl border border-[#D8D5CF] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EDE6DA] pb-3">
            <Bell className="w-4 h-4 text-[#6A5647]" />
            <h2 className="text-sm font-bold text-[#282521] uppercase tracking-wider">
              Multi-Channel Dispatch Records ({notifications.length})
            </h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {notifications.map((notif) => {
              const isDelivered = notif.status === 'DELIVERED';
              return (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#282521] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EDE6DA] text-[#3E3934] font-mono">
                        {notif.channel}
                      </span>
                      <span>{notif.title}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      isDelivered ? 'bg-[#E8F5E9] text-[#2E6B4D]' : 'bg-[#FFF8E7] text-[#B4691B]'
                    }`}>
                      {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{notif.status}</span>
                    </span>
                  </div>

                  <p className="text-[#3E3934] text-[11px]">{notif.message}</p>

                  <div className="text-[10px] text-[#716A63] border-t border-[#EDE6DA] pt-1">
                    {notif.deliveryNote}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
