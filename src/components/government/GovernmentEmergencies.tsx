import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { EmergencyIncident, EmergencyStatus } from '../../types';
import {
  AlertOctagon,
  ShieldAlert,
  Navigation,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  Camera,
  MapPin,
  X
} from 'lucide-react';

export const GovernmentEmergencies: React.FC = () => {
  const { emergencies, fieldWorkers, updateEmergencyStatus } = useCivicData();

  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyIncident | null>(
    emergencies[0] || null
  );
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: EmergencyStatus) => {
    setIsUpdating(true);
    setFeedback(null);
    const success = await updateEmergencyStatus(id, { status });
    if (success) {
      setFeedback(`Status updated to ${status.replace('_', ' ')}`);
      setSelectedEmergency(prev => prev && prev.id === id ? { ...prev, status } : prev);
    }
    setIsUpdating(false);
  };

  const handleAssignSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmergency || !selectedWorkerId) return;

    setIsUpdating(true);
    const worker = fieldWorkers.find(w => w.workerId === selectedWorkerId || w.id === selectedWorkerId);

    const success = await updateEmergencyStatus(selectedEmergency.id, {
      status: 'TEAM_ASSIGNED',
      assignedWorkerId: selectedWorkerId,
      assignedWorkerName: worker?.name || 'Emergency Rapid Response Unit',
      governmentInstructions: instructions.trim() || selectedEmergency.governmentInstructions
    });

    if (success) {
      setFeedback(`Rapid response squad ${worker?.name || selectedWorkerId} dispatched.`);
      setSelectedEmergency(prev => prev ? {
        ...prev,
        status: 'TEAM_ASSIGNED',
        assignedWorkerId: selectedWorkerId,
        assignedWorkerName: worker?.name || 'Emergency Rapid Response Unit',
        governmentInstructions: instructions.trim() || prev.governmentInstructions
      } : null);
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CF] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8F1D1D] text-white text-[11px] font-bold uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            Civic Emergency Center
          </div>
          <h1 className="text-2xl font-black text-[#282521] tracking-tight">
            Active Emergency Incidents
          </h1>
          <p className="text-xs text-[#716A63]">
            High-hazard incidents with prioritized municipal dispatch and rapid resolution protocols
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Emergencies */}
        <div className="lg:col-span-5 space-y-3">
          {emergencies.map((em) => {
            const isSelected = selectedEmergency?.id === em.id;
            const isResolved = em.status === 'RESOLVED';
            return (
              <div
                key={em.id}
                onClick={() => {
                  setSelectedEmergency(em);
                  setFeedback(null);
                  setSelectedWorkerId(em.assignedWorkerId || '');
                  setInstructions(em.governmentInstructions || '');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8F1D1D] bg-[#FAF3F0] ring-2 ring-[#8F1D1D]/20 shadow-xs'
                    : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-black text-[#8F1D1D]">
                    {em.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isResolved ? 'bg-[#E8F5E9] text-[#2E6B4D]' : 'bg-[#8F1D1D] text-white'
                  }`}>
                    {em.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#282521] line-clamp-1">{em.title}</h3>
                <div className="text-xs text-[#716A63] line-clamp-2 mt-1">{em.hazardDescription}</div>
                <div className="flex items-center justify-between text-[11px] text-[#716A63] border-t border-[#EDE6DA] pt-2 mt-3">
                  <span className="font-semibold text-[#3E3934]">{em.ward}</span>
                  <span>{new Date(em.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Emergency Inspection & Rapid Dispatch */}
        <div className="lg:col-span-7">
          {selectedEmergency ? (
            <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-6 shadow-xs">
              <div className="border-b border-[#EDE6DA] pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-black text-[#8F1D1D]">
                    EMERGENCY INCIDENT {selectedEmergency.id}
                  </span>
                  <span className="text-xs text-[#716A63]">
                    Reported {new Date(selectedEmergency.reportedAt).toLocaleTimeString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#282521]">{selectedEmergency.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8F1D1D] text-white">
                    {selectedEmergency.status.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDE6DA] text-[#3E3934]">
                    {selectedEmergency.ward}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EFE8] text-[#716A63]">
                    {selectedEmergency.department}
                  </span>
                </div>
              </div>

              {/* Hazard description & location */}
              <div className="p-4 rounded-xl bg-[#FAF3F0] border border-[#E8D4CD] space-y-2 text-xs">
                <div>
                  <span className="font-bold text-[#8F1D1D] block">Hazard Assessment:</span>
                  <p className="text-[#3E3934] mt-0.5">{selectedEmergency.hazardDescription}</p>
                </div>
                <div className="pt-2 border-t border-[#E8D4CD]/60 flex items-center gap-1.5 text-[#3E3934]">
                  <MapPin className="w-3.5 h-3.5 text-[#8F1D1D] shrink-0" />
                  <span><strong>Site Location:</strong> {selectedEmergency.location.address}</span>
                </div>
              </div>

              {selectedEmergency.photo && (
                <div>
                  <span className="text-xs font-semibold text-[#716A63] block mb-1">Citizen Evidence Photo:</span>
                  <div className="h-44 rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${selectedEmergency.photo})` }} />
                </div>
              )}

              {/* Action Pipeline: ACKNOWLEDGE -> ASSIGN TEAM -> MARK RESPONDING -> ON SITE -> RESOLVE */}
              <div className="space-y-3 border-t border-[#EDE6DA] pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#282521]">
                  Emergency Command Action Bar
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedEmergency.id, 'ACKNOWLEDGED')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedEmergency.status === 'ACKNOWLEDGED'
                        ? 'bg-[#3E3934] text-white'
                        : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
                    }`}
                  >
                    Acknowledge
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedEmergency.id, 'RESPONDING')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedEmergency.status === 'RESPONDING'
                        ? 'bg-[#B4691B] text-white'
                        : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
                    }`}
                  >
                    Mark Responding
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedEmergency.id, 'ON_SITE')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedEmergency.status === 'ON_SITE'
                        ? 'bg-[#6A5647] text-white'
                        : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
                    }`}
                  >
                    Mark On Site
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(selectedEmergency.id, 'RESOLVED')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedEmergency.status === 'RESOLVED'
                        ? 'bg-[#2E6B4D] text-white'
                        : 'bg-[#2E6B4D]/15 text-[#2E6B4D] hover:bg-[#2E6B4D]/25'
                    }`}
                  >
                    Resolve Emergency
                  </button>
                </div>
              </div>

              {/* Assign Squad & Instructions Form */}
              <form onSubmit={handleAssignSquad} className="space-y-3 bg-[#F8F7F3] p-4 rounded-xl border border-[#EDE6DA]">
                <h4 className="text-xs font-bold text-[#282521]">
                  Dispatch Rapid Response Field Team
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#716A63] mb-1">
                      Select Authorized Worker
                    </label>
                    <select
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-white text-xs"
                    >
                      <option value="">-- Choose Field Worker --</option>
                      {fieldWorkers.map((w) => (
                        <option key={w.workerId} value={w.workerId}>
                          {w.name} ({w.workerId} &bull; {w.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#716A63] mb-1">
                      Assigned Squad Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={selectedEmergency.assignedWorkerName || 'Unassigned'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-[#F3EFE8] text-xs font-semibold text-[#3E3934]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#716A63] mb-1">
                    Emergency Work Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Cordon off live wire perimeter. Isolate substation feeder #12."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {feedback ? (
                    <span className="text-xs font-bold text-[#2E6B4D]">{feedback}</span>
                  ) : <span />}
                  <button
                    type="submit"
                    disabled={isUpdating || !selectedWorkerId}
                    className="px-4 py-2 bg-[#8F1D1D] hover:bg-[#721515] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Dispatch Team Now
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
              Select an emergency incident to view detail and issue dispatch commands.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
