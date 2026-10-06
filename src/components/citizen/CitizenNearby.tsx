import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { CitizenMap } from '../maps/CitizenMap';
import { Complaint } from '../../types';
import { MapPin, Info } from 'lucide-react';

export const CitizenNearby: React.FC = () => {
  const { nearbyComplaints } = useCivicData();
  const { t } = useLanguage();
  const [selectedNearby, setSelectedNearby] = useState<Complaint | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-6 pb-24 md:pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#282521]">
          {t('nearby_issues')}
        </h1>
        <p className="text-xs text-[#716A63] mt-1">
          {t('nearby_issues_desc')} &bull; Community civic awareness
        </p>
      </div>

      {/* Interactive Map */}
      <div className="h-[360px] w-full">
        <CitizenMap
          complaints={nearbyComplaints}
          selectedComplaintId={selectedNearby?.id}
          onSelectComplaint={(c) => setSelectedNearby(c)}
        />
      </div>

      {/* Detail or list */}
      <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-3">
          <h2 className="text-sm font-bold text-[#282521]">
            Verified Neighbourhood Civic Reports ({nearbyComplaints.length})
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#716A63]">
            <Info className="w-3.5 h-3.5 text-[#6A5647]" />
            <span>Public Civic Awareness</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nearbyComplaints.map((item) => {
            const isResolved = item.status === 'RESOLVED' || item.status === 'CLOSED';
            const isSelected = selectedNearby?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedNearby(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#3E3934] bg-[#F8F7F3] ring-1 ring-[#3E3934]'
                    : 'border-[#D8D5CF] hover:bg-[#F8F7F3]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#6A5647]">{item.category}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isResolved
                        ? 'bg-[#E8F5E9] text-[#2E6B4D]'
                        : 'bg-[#EDE6DA] text-[#3E3934]'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#282521] line-clamp-1">{item.title}</div>
                <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-[#6A5647] shrink-0" />
                  <span className="truncate">{item.location.address}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
