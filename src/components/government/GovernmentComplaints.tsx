import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { Complaint, Priority, ComplaintStatus } from '../../types';
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  X,
  Send,
  Building,
  User
} from 'lucide-react';

interface GovComplaintsProps {
  onSelectComplaint?: (c: Complaint) => void;
}

export const GovernmentComplaints: React.FC<GovComplaintsProps> = () => {
  const { complaints, departments, fieldWorkers, updateGovernmentComplaint } = useCivicData();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected complaint for drawer/inspection
  const [inspectComplaint, setInspectComplaint] = useState<Complaint | null>(null);

  // Drawer action form states
  const [newPriority, setNewPriority] = useState<Priority>('MODERATE');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('ASSIGNED');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Open drawer and preload state
  const handleOpenInspect = (c: Complaint) => {
    setInspectComplaint(c);
    setNewPriority(c.priority);
    setNewStatus(c.status);
    setSelectedDept(c.department);
    setSelectedWorkerId(c.assignedWorkerId || '');
    setInternalNote('');
    setActionMessage(null);
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (wardFilter !== 'ALL' && c.ward !== wardFilter) return false;
    if (deptFilter !== 'ALL' && c.department !== deptFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchLoc = c.location.address.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchLoc) return false;
    }

    return true;
  });

  const handleApplyChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectComplaint) return;

    setIsUpdating(true);
    setActionMessage(null);

    const worker = fieldWorkers.find(w => w.workerId === selectedWorkerId || w.id === selectedWorkerId);

    const success = await updateGovernmentComplaint(inspectComplaint.id, {
      priority: newPriority,
      status: newStatus,
      department: selectedDept || inspectComplaint.department,
      assignedWorkerId: selectedWorkerId || undefined,
      assignedWorkerName: worker?.name || inspectComplaint.assignedWorkerName,
      internalNote: internalNote.trim() || undefined,
    });

    if (success) {
      setActionMessage('Operational update logged and dispatched to field worker.');
      // Refresh local inspectComplaint
      setInspectComplaint(prev => prev ? {
        ...prev,
        priority: newPriority,
        status: newStatus,
        department: selectedDept || prev.department,
        assignedWorkerId: selectedWorkerId || prev.assignedWorkerId,
        assignedWorkerName: worker?.name || prev.assignedWorkerName,
        internalNotes: internalNote.trim() ? [...(prev.internalNotes || []), internalNote.trim()] : prev.internalNotes
      } : null);
    } else {
      setActionMessage('Failed to update complaint.');
    }

    setIsUpdating(false);
  };

  const handleEscalateToEmergency = async () => {
    if (!inspectComplaint) return;
    setIsUpdating(true);
    const success = await updateGovernmentComplaint(inspectComplaint.id, {
      priority: 'CRITICAL',
      isEmergency: true,
      internalNote: 'ESCALATED TO EMERGENCY BY OFFICER.'
    });
    if (success) {
      setActionMessage('Escalated to Emergency Incident Queue.');
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CF] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#282521] tracking-tight">
            Municipal Complaints Queue
          </h1>
          <p className="text-xs text-[#716A63] mt-0.5">
            Operational triage, department assignment, and field squad dispatching
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EDE6DA] text-[#3E3934] self-start sm:self-auto">
          {filtered.length} complaints matching active filters
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8D5CF] shadow-xs space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#716A63] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Complaint ID (NM-xxxx), location, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521] focus:outline-hidden focus:border-[#3E3934]"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#716A63] mb-1">Ward</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521]"
            >
              <option value="ALL">All Wards</option>
              <option value="Ward 12">Ward 12</option>
              <option value="Ward 8">Ward 8</option>
              <option value="Ward 9">Ward 9</option>
              <option value="Ward 11">Ward 11</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#716A63] mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#716A63] mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#716A63] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-[#D8D5CF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F7F3] border-b border-[#D8D5CF] text-[#6A5647] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Issue Title</th>
                <th className="py-3 px-4">Ward</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Worker</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE6DA] text-[#282521]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#716A63]">
                    No complaints match the specified filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[#F8F7F3]/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#6A5647] whitespace-nowrap">
                        #{c.id}
                      </td>
                      <td className="py-3 px-4 font-semibold max-w-[200px] truncate" title={c.title}>
                        {c.title}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#716A63]">{c.ward}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#716A63]">{c.category}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          c.priority === 'CRITICAL'
                            ? 'bg-[#9C382A] text-white'
                            : c.priority === 'HIGH'
                            ? 'bg-[#B4691B] text-white'
                            : 'bg-[#EDE6DA] text-[#3E3934]'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isResolved
                            ? 'bg-[#E8F5E9] text-[#2E6B4D]'
                            : 'bg-[#EDE6DA] text-[#3E3934]'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#716A63]">{c.department}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#3E3934] font-medium">
                        {c.assignedWorkerName || (
                          <span className="text-[#9C382A] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[#716A63]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenInspect(c)}
                          className="px-2.5 py-1 bg-[#3E3934] hover:bg-[#282521] text-white font-semibold rounded-md text-[11px] transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION & ASSIGNMENT MODAL/DRAWER */}
      {inspectComplaint && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D8D5CF] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#6A5647]">
                  Incident Management &bull; #{inspectComplaint.id}
                </span>
                <h2 className="text-lg font-bold text-[#282521]">{inspectComplaint.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectComplaint(null)}
                className="p-1 rounded-lg hover:bg-[#F3EFE8] text-[#716A63]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaint details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F8F7F3] p-4 rounded-xl border border-[#EDE6DA]">
              <div>
                <span className="font-semibold text-[#716A63] block">Location:</span>
                <span className="text-[#282521]">{inspectComplaint.location.address}</span>
              </div>
              <div>
                <span className="font-semibold text-[#716A63] block">Ward:</span>
                <span className="text-[#282521]">{inspectComplaint.ward}</span>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-[#716A63] block">Citizen Description:</span>
                <span className="text-[#282521]">{inspectComplaint.description}</span>
              </div>
            </div>

            {inspectComplaint.citizenPhoto && (
              <div>
                <span className="text-xs font-semibold text-[#716A63] block mb-1">Citizen Attached Photo:</span>
                <div className="h-40 rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${inspectComplaint.citizenPhoto})` }} />
              </div>
            )}

            {/* Operational Management Form */}
            <form onSubmit={handleApplyChanges} className="space-y-4 border-t border-[#EDE6DA] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3E3934]">
                Assignment & Operational Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#3E3934] mb-1">Assign Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3E3934] mb-1">Dispatch Field Worker</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3]"
                  >
                    <option value="">-- Select Field Worker --</option>
                    {fieldWorkers.map((w) => (
                      <option key={w.workerId} value={w.workerId}>
                        {w.name} ({w.workerId} &bull; {w.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3E3934] mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3]"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3E3934] mb-1">Operational Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3]"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E3934] mb-1">
                  Add Government Internal Officer Note (Audit Logged)
                </label>
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Dispatched patch vehicle #4. Priority escalated due to rain forecast."
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521]"
                />
              </div>

              {actionMessage && (
                <div className="p-2.5 rounded-lg bg-[#E8F5E9] text-[#2E6B4D] text-xs font-bold">
                  {actionMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleEscalateToEmergency}
                  className="px-3 py-2 rounded-xl bg-[#8F1D1D]/10 hover:bg-[#8F1D1D]/20 text-[#8F1D1D] text-xs font-bold border border-[#8F1D1D]/30 transition-colors cursor-pointer"
                >
                  Escalate to Emergency Incident
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectComplaint(null)}
                    className="px-3 py-2 rounded-xl border border-[#D8D5CF] text-xs font-bold text-[#716A63] hover:bg-[#F8F7F3] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-[#3E3934] hover:bg-[#282521] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {isUpdating ? 'Updating...' : 'Save & Dispatch'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
