import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../../types';

interface CitizenMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const CitizenMap: React.FC<CitizenMapProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center around Ward 12 / central coordinates
    const defaultLat = complaints[0]?.location?.lat || 28.6750;
    const defaultLng = complaints[0]?.location?.lng || 77.2200;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after small timeout to handle layout render
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    complaints.forEach((comp) => {
      if (!comp.location || !comp.location.lat || !comp.location.lng) return;

      const isEmergency = comp.isEmergency || comp.priority === 'CRITICAL';
      const isResolved = comp.status === 'RESOLVED' || comp.status === 'CLOSED';
      const bgColor = isEmergency ? '#8F1D1D' : isResolved ? '#2E6B4D' : '#6A5647';
      const isSelected = selectedComplaintId === comp.id;

      const customIcon = L.divIcon({
        className: 'custom-citizen-pin',
        html: `
          <div style="
            background-color: ${bgColor};
            width: ${isSelected ? '28px' : '22px'};
            height: ${isSelected ? '28px' : '22px'};
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            transition: transform 0.2s;
            cursor: pointer;
          ">
            ${isEmergency ? '!' : '●'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([comp.location.lat, comp.location.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 13px; max-width: 200px;">
            <div style="font-weight: 600; color: #282521; margin-bottom: 2px;">${comp.title}</div>
            <div style="color: #716A63; font-size: 11px; margin-bottom: 4px;">${comp.ward} • ${comp.category}</div>
            <div style="display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${isResolved ? '#E8F5E9' : '#EDE6DA'}; color: ${isResolved ? '#2E6B4D' : '#3E3934'};">
              ${comp.status.replace('_', ' ')}
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectComplaint) {
          onSelectComplaint(comp);
        }
      });

      markersRef.current[comp.id] = marker;
    });
  }, [complaints, selectedComplaintId, onSelectComplaint]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-[#D8D5CF] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] bg-[#F8F7F3]/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#D8D5CF] text-xs font-medium text-[#3E3934] shadow-xs flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8F1D1D]"></span>
          <span>Emergency / Critical</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6A5647]"></span>
          <span>In Progress</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E6B4D]"></span>
          <span>Resolved</span>
        </span>
      </div>
    </div>
  );
};
