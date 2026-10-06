import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Complaint } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Camera,
  Check
} from 'lucide-react';

export const CitizenComplaints: React.FC = () => {
  const { complaints, verifyComplaint } = useCivicData();
  const { t } = useLanguage();

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleVerify = async (id: string, state: 'VERIFIED_FIXED' | 'DISPUTED_STILL_EXISTS') => {
    setIsVerifying(true);
    setVerificationFeedback(null);
    const ok = await verifyComplaint(id, state);
    if (ok) {
      setVerificationFeedback(
        state === 'VERIFIED_FIXED'
          ? 'Thank you! You have confirmed the municipal fix.'
          : 'Issue reopened for re-inspection by municipal field supervisor.'
      );
    }
    setIsVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-6 pb-24 md:pb-12">
      <div>
        <h1 className="text-2xl font-bold text-[#282521]">
          {t('your_complaints')}
        </h1>
        <p className="text-xs text-[#716A63] mt-1">
          Track the status of your reported civic issues and verify municipal resolutions
        </p>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8D5CF] p-8 text-center text-[#716A63] text-sm">
          {t('no_complaints_yet')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left list of complaints */}
          <div className="md:col-span-5 space-y-2.5">
            {complaints.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;
              const isResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedComplaint(c);
                    setVerificationFeedback(null);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3E3934] bg-white ring-2 ring-[#3E3934]/10 shadow-xs'
                      : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-[#716A63]">#{c.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isResolved
                          ? 'bg-[#E8F5E9] text-[#2E6B4D]'
                          : 'bg-[#EDE6DA] text-[#3E3934]'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#282521] line-clamp-1">{c.title}</h3>
                  <div className="text-xs text-[#716A63] flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-[#6A5647] shrink-0" />
                    <span className="truncate">{c.location.address}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right complaint details & Citizen Verification */}
          <div className="md:col-span-7">
            {selectedComplaint ? (
              <div className="bg-white rounded-2xl border border-[#D8D5CF] p-6 space-y-6 shadow-xs">
                {/* Header */}
                <div className="border-b border-[#EDE6DA] pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#6A5647]">
                      Complaint #{selectedComplaint.id}
                    </span>
                    <span className="text-xs text-[#716A63]">
                      Reported {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#282521]">
                    {selectedComplaint.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EDE6DA] text-[#3E3934]">
                      {selectedComplaint.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3EFE8] text-[#716A63]">
                      {selectedComplaint.ward}
                    </span>
                    {selectedComplaint.isEmergency && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF3F0] text-[#8F1D1D] border border-[#E8D4CD]">
                        Emergency Escalated
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-[#716A63] uppercase tracking-wider mb-1.5">
                    Your Description
                  </h4>
                  <p className="text-sm text-[#3E3934] leading-relaxed bg-[#F8F7F3] p-3.5 rounded-xl border border-[#EDE6DA]">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Location details */}
                <div className="flex items-start gap-2.5 text-xs text-[#716A63]">
                  <MapPin className="w-4 h-4 text-[#6A5647] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#3E3934]">Location:</span> {selectedComplaint.location.address}
                    {selectedComplaint.location.landmark && (
                      <span className="block text-[#716A63]">Landmark: {selectedComplaint.location.landmark}</span>
                    )}
                  </div>
                </div>

                {/* Citizen Photo attached */}
                {selectedComplaint.citizenPhoto && (
                  <div>
                    <h4 className="text-xs font-bold text-[#716A63] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Original Photo Evidence
                    </h4>
                    <div className="h-44 w-full rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${selectedComplaint.citizenPhoto})` }} />
                  </div>
                )}

                {/* Resolution Section & Citizen Verification */}
                {(selectedComplaint.status === 'RESOLVED' || selectedComplaint.status === 'CLOSED' || selectedComplaint.resolutionPhoto) && (
                  <div className="p-5 rounded-xl bg-[#F8F7F3] border border-[#D8D5CF] space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#2E6B4D]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Municipal Resolution Submitted</span>
                    </div>

                    {selectedComplaint.resolutionNotes && (
                      <div className="text-xs text-[#3E3934] bg-white p-3 rounded-lg border border-[#EDE6DA]">
                        <span className="font-bold block text-[#282521] mb-1">Field Completion Summary:</span>
                        {selectedComplaint.resolutionNotes}
                      </div>
                    )}

                    {selectedComplaint.resolutionPhoto && (
                      <div>
                        <span className="text-xs font-semibold text-[#716A63] block mb-1.5">
                          Field Worker After-Photo:
                        </span>
                        <div className="h-44 w-full rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${selectedComplaint.resolutionPhoto})` }} />
                      </div>
                    )}

                    {/* Citizen Verification Buttons */}
                    <div className="pt-2 border-t border-[#EDE6DA]">
                      <h4 className="text-xs font-bold text-[#282521] mb-2">
                        {t('verify_resolution')}
                      </h4>

                      {selectedComplaint.citizenVerification === 'VERIFIED_FIXED' ? (
                        <div className="p-3 bg-[#E8F5E9] text-[#2E6B4D] text-xs font-bold rounded-lg flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Resolution Verified by You</span>
                        </div>
                      ) : selectedComplaint.citizenVerification === 'DISPUTED_STILL_EXISTS' ? (
                        <div className="p-3 bg-[#FAF3F0] text-[#9C382A] text-xs font-bold rounded-lg flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          <span>Marked as Still Existing &bull; Pending Re-inspection</span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <button
                            type="button"
                            disabled={isVerifying}
                            onClick={() => handleVerify(selectedComplaint.id, 'VERIFIED_FIXED')}
                            className="flex-1 py-2.5 px-3 bg-[#2E6B4D] hover:bg-[#25573E] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{t('btn_fixed')}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isVerifying}
                            onClick={() => handleVerify(selectedComplaint.id, 'DISPUTED_STILL_EXISTS')}
                            className="flex-1 py-2.5 px-3 bg-white hover:bg-[#FAF3F0] text-[#9C382A] border border-[#9C382A]/40 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>{t('btn_still_exists')}</span>
                          </button>
                        </div>
                      )}

                      {verificationFeedback && (
                        <div className="mt-2 text-xs text-[#282521] font-medium">
                          {verificationFeedback}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#716A63] bg-white rounded-2xl border border-[#D8D5CF]">
                Select a complaint from the list to view tracking details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
