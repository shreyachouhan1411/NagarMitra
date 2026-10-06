import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { GovernmentMapFull } from '../maps/GovernmentMapFull';
import { Complaint, EmergencyIncident } from '../../types';
import { MapPin, X, AlertTriangle } from 'lucide-react';

export const GovernmentMap: React.FC = () => {
  const { complaints, emergencies } = useCivicData();
  const [selectedIncident, setSelectedIncident] = useState<{
    type: 'complaint' | 'emergency';
    data: Complaint | EmergencyIncident;
  } | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8D5CF] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#282521] tracking-tight">
            Operational Municipal GIS Map
          </h1>
          <p className="text-xs text-[#716A63] mt-0.5">
            Geospatial tracking of civic incidents, emergency hazards, and active field squads
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EDE6DA] text-[#3E3934]">
          {emergencies.filter(e => e.status !== 'RESOLVED').length} Active Emergencies &bull; {complaints.length} Total Issues
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GovernmentMapFull
            complaints={complaints}
            emergencies={emergencies}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* Selected Incident Drawer */}
        <div className="lg:col-span-4">
          {selectedIncident ? (
            <div className="bg-white rounded-2xl border border-[#D8D5CF] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedIncident.type === 'emergency' ? 'bg-[#8F1D1D] text-white' : 'bg-[#EDE6DA] text-[#3E3934]'
                }`}>
                  {selectedIncident.type === 'emergency' ? 'EMERGENCY INCIDENT' : 'CIVIC COMPLAINT'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 text-[#716A63] hover:text-[#282521]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#6A5647]">#{selectedIncident.data.id}</span>
                <h3 className="text-sm font-bold text-[#282521] mt-0.5">{selectedIncident.data.title}</h3>
                <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#6A5647] shrink-0" />
                  <span>{selectedIncident.data.location.address}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F7F3] rounded-xl border border-[#EDE6DA] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Ward:</span>
                  <span className="font-semibold text-[#282521]">{selectedIncident.data.ward}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Department:</span>
                  <span className="font-semibold text-[#282521]">{selectedIncident.data.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Status:</span>
                  <span className="font-semibold text-[#8F1D1D]">{selectedIncident.data.status.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716A63]">Assigned To:</span>
                  <span className="font-semibold text-[#3E3934]">{selectedIncident.data.assignedWorkerName || 'Unassigned'}</span>
                </div>
              </div>

              {'citizenPhoto' in selectedIncident.data && selectedIncident.data.citizenPhoto && (
                <div>
                  <span className="text-xs font-semibold text-[#716A63] block mb-1">Citizen Evidence:</span>
                  <div className="h-32 rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${selectedIncident.data.citizenPhoto})` }} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 text-center text-xs text-[#716A63] shadow-xs">
              <MapPin className="w-8 h-8 text-[#D8D5CF] mx-auto mb-2" />
              Click any incident marker on the map to inspect its details and coordinates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
