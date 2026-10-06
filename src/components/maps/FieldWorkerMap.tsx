import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationCoordinates } from '../../types';
import { ExternalLink, Navigation } from 'lucide-react';

interface FieldWorkerMapProps {
  location: LocationCoordinates;
  isEmergency?: boolean;
}

export const FieldWorkerMap: React.FC<FieldWorkerMapProps> = ({ location, isEmergency }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = location?.lat || 28.6750;
    const lng = location?.lng || 77.2200;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const pinColor = isEmergency ? '#8F1D1D' : '#6A5647';
    const markerIcon = L.divIcon({
      className: 'worker-target-pin',
      html: `
        <div style="
          background-color: ${pinColor};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: #FFFFFF;
            font-size: 13px;
            font-weight: bold;
          ">📍</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    L.marker([lat, lng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<b>${location.address}</b><br/>${location.ward}`)
      .openPopup();

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [location, isEmergency]);

  const openNavigation = () => {
    const lat = location?.lat || 28.6750;
    const lng = location?.lng || 77.2200;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-[#D8D5CF]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
      <div className="flex items-center justify-between text-xs text-[#716A63] bg-[#F3EFE8] p-2.5 rounded-lg border border-[#EDE6DA]">
        <div>
          <span className="font-semibold text-[#3E3934]">GPS:</span> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
        <button
          type="button"
          onClick={openNavigation}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E3934] text-white font-medium rounded-md hover:bg-[#282521] transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-[#EDE6DA]" />
          <span>Launch Turn-by-Turn GPS</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </button>
      </div>
    </div>
  );
};
