import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, EmergencyIncident } from '../../types';

interface GovernmentMapFullProps {
  complaints: Complaint[];
  emergencies: EmergencyIncident[];
  onSelectIncident: (incident: { type: 'complaint' | 'emergency'; data: Complaint | EmergencyIncident }) => void;
}

export const GovernmentMapFull: React.FC<GovernmentMapFullProps> = ({
  complaints,
  emergencies,
  onSelectIncident,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [filter, setFilter] = useState<'ALL' | 'NORMAL' | 'HIGH' | 'CRITICAL' | 'EMERGENCY'>('ALL');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6200, 77.2150],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Municipal Geospatial Feed',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update incident markers based on filter
  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    // 1. Add Emergencies
    if (filter === 'ALL' || filter === 'EMERGENCY') {
      emergencies.forEach((em) => {
        if (!em.location || !em.location.lat || !em.location.lng) return;

        const pulseMarker = L.divIcon({
          className: 'emergency-pulse-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px;">
              <div style="
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: rgba(143, 29, 29, 0.4);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                position: relative;
                width: 28px;
                height: 28px;
                margin: 2px;
                border-radius: 50%;
                background: #8F1D1D;
                border: 2px solid #FFFFFF;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #FFFFFF;
                font-size: 13px;
                font-weight: 800;
                box-shadow: 0 4px 10px rgba(143, 29, 29, 0.5);
              ">⚡</div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([em.location.lat, em.location.lng], { icon: pulseMarker })
          .bindPopup(`
            <div style="font-family: inherit; font-size: 13px; width: 220px; line-height: 1.4;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="background: #8F1D1D; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">EMERGENCY ${em.id}</span>
                <span style="color: #716A63; font-size: 11px;">${em.ward}</span>
              </div>
              <div style="font-weight: 600; color: #282521; margin-bottom: 4px;">${em.title}</div>
              <div style="color: #3E3934; font-size: 11px; margin-bottom: 6px;">${em.location.address}</div>
              <div style="color: #8F1D1D; font-size: 11px; font-weight: 600;">Status: ${em.status.replace('_', ' ')}</div>
            </div>
          `);

        marker.on('click', () => {
          onSelectIncident({ type: 'emergency', data: em });
        });

        layerGroup.addLayer(marker);
      });
    }

    // 2. Add Complaints
    complaints.forEach((comp) => {
      if (!comp.location || !comp.location.lat || !comp.location.lng) return;

      // Filter check
      if (filter === 'EMERGENCY') return;
      if (filter === 'CRITICAL' && comp.priority !== 'CRITICAL') return;
      if (filter === 'HIGH' && comp.priority !== 'HIGH') return;
      if (filter === 'NORMAL' && (comp.priority === 'CRITICAL' || comp.priority === 'HIGH')) return;

      let pinColor = '#6A5647';
      if (comp.priority === 'CRITICAL') pinColor = '#9C382A';
      else if (comp.priority === 'HIGH') pinColor = '#B4691B';
      else if (comp.status === 'RESOLVED' || comp.status === 'CLOSED') pinColor = '#2E6B4D';

      const customIcon = L.divIcon({
        className: 'gov-complaint-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 700;
          ">
            ${comp.priority === 'CRITICAL' ? '!' : '●'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([comp.location.lat, comp.location.lng], { icon: customIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 13px; width: 230px; line-height: 1.4;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #282521;">#${comp.id}</span>
              <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: #EDE6DA; color: #3E3934;">${comp.priority}</span>
            </div>
            <div style="font-weight: 600; color: #282521; margin-bottom: 2px;">${comp.title}</div>
            <div style="color: #716A63; font-size: 11px; margin-bottom: 4px;">${comp.ward} • ${comp.department}</div>
            <div style="color: #3E3934; font-size: 11px;">Status: <strong>${comp.status}</strong></div>
          </div>
        `);

      marker.on('click', () => {
        onSelectIncident({ type: 'complaint', data: comp });
      });

      layerGroup.addLayer(marker);
    });
  }, [complaints, emergencies, filter, onSelectIncident]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden border border-[#D8D5CF] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Filter Bar overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#F8F7F3]/95 backdrop-blur-xs p-2 rounded-xl border border-[#D8D5CF] shadow-sm flex flex-wrap gap-1.5 items-center">
        <span className="text-xs font-bold text-[#6A5647] px-2 uppercase tracking-wider">Severity Filter:</span>
        {(['ALL', 'EMERGENCY', 'CRITICAL', 'HIGH', 'NORMAL'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              filter === opt
                ? 'bg-[#3E3934] text-white shadow-xs'
                : 'bg-[#F3EFE8] text-[#3E3934] hover:bg-[#EDE6DA]'
            }`}
          >
            {opt === 'EMERGENCY' ? '⚡ Emergency' : opt}
          </button>
        ))}
      </div>

      {/* Map Legend overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-[#F8F7F3]/95 backdrop-blur-xs p-3 rounded-xl border border-[#D8D5CF] shadow-sm text-xs text-[#3E3934] space-y-1.5">
        <div className="font-semibold text-[#282521] border-b border-[#D8D5CF] pb-1 mb-1">Operational Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#8F1D1D] ring-2 ring-[#8F1D1D]/30"></span>
          <span>Active Emergency Incident (⚡)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9C382A]"></span>
          <span>Critical Civic Priority (!)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#B4691B]"></span>
          <span>High Priority Issue</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6A5647]"></span>
          <span>Moderate / Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2E6B4D]"></span>
          <span>Resolved / Verified</span>
        </div>
      </div>
    </div>
  );
};
