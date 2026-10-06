import React, { useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { FieldWorkerMap } from '../maps/FieldWorkerMap';
import { Complaint, EmergencyIncident } from '../../types';
import {
  Navigation,
  CheckCircle2,
  AlertOctagon,
  Camera,
  MapPin,
  Clock,
  Send,
  Loader2,
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface FieldWorkerTaskDetailProps {
  task: Complaint | EmergencyIncident;
  isEmergency?: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
}

export const FieldWorkerTaskDetail: React.FC<FieldWorkerTaskDetailProps> = ({
  task,
  isEmergency = false,
  onClose,
  onRefresh,
}) => {
  const { t } = useLanguage();
  const { updateFieldWorkerTask, updateEmergencyStatus } = useCivicData();

  const [currentStatus, setCurrentStatus] = useState<string>(task.status);
  const [resolutionNote, setResolutionNote] = useState(
    'resolutionNotes' in task ? task.resolutionNotes || '' : ''
  );
  const [afterPhoto, setAfterPhoto] = useState(
    'resolutionPhoto' in task ? task.resolutionPhoto || '' : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const SAMPLE_AFTER_PHOTOS = [
    { label: 'Repaired Cable', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Asphalt Pave', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80' },
    { label: 'New LED Light', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
  ];

  const handleUpdateStatus = async (status: string) => {
    setIsSubmitting(true);
    setActionNotice(null);

    let success = false;
    if (isEmergency) {
      success = await updateEmergencyStatus(task.id, {
        status: status as any
      });
    } else {
      success = await updateFieldWorkerTask(task.id, {
        status: status as any
      });
    }

    if (success) {
      setCurrentStatus(status);
      setActionNotice(`Status marked as ${status.replace('_', ' ')}.`);
      if (onRefresh) onRefresh();
    }
    setIsSubmitting(false);
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionNotice(null);

    let success = false;
    if (isEmergency) {
      success = await updateEmergencyStatus(task.id, {
        status: 'RESOLVED',
        resolutionNotes: resolutionNote.trim() || 'Emergency field crew completed onsite containment and resolution.',
        resolutionPhoto: afterPhoto || undefined
      });
    } else {
      success = await updateFieldWorkerTask(task.id, {
        status: 'RESOLVED',
        resolutionNotes: resolutionNote.trim() || 'Work executed according to municipal standard procedures.',
        resolutionPhoto: afterPhoto || undefined
      });
    }

    if (success) {
      setCurrentStatus('RESOLVED');
      setActionNotice('Task completed! Resolution photo and summary submitted to Municipal Command Center.');
      if (onRefresh) onRefresh();
    } else {
      setActionNotice('Failed to submit completion.');
    }
    setIsSubmitting(false);
  };

  const citizenDescription = 'description' in task ? task.description : task.hazardDescription;
  const citizenPhoto = 'citizenPhoto' in task ? task.citizenPhoto : 'photo' in task ? task.photo : undefined;
  const governmentInstructions = 'governmentInstructions' in task
    ? task.governmentInstructions
    : ('internalNotes' in task && task.internalNotes && task.internalNotes[0]) || 'Execute municipal resolution according to safety protocols.';

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 space-y-6 shadow-xs ${
      isEmergency ? 'bg-[#FAF3F0] border-[#8F1D1D]/40' : 'bg-white border-[#D8D5CF]'
    }`}>
      {/* Header */}
      <div className="border-b border-[#EDE6DA] pb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono font-black ${isEmergency ? 'text-[#8F1D1D]' : 'text-[#6A5647]'}`}>
              TASK #{task.id}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
              isEmergency
                ? 'bg-[#8F1D1D] text-white animate-pulse'
                : 'bg-[#EDE6DA] text-[#3E3934]'
            }`}>
              {isEmergency ? 'EMERGENCY TASK' : task.status.replace('_', ' ')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#282521] tracking-tight">
            {task.title}
          </h2>
          <div className="text-xs text-[#716A63] mt-1 flex items-center gap-2">
            <span>{task.ward}</span>
            <span>&bull;</span>
            <span>{task.department}</span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-2 py-1 rounded-md bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]"
          >
            Close
          </button>
        )}
      </div>

      {/* Task Location & Interactive Field Worker Map */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3E3934] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#6A5647]" />
          <span>Site Location & Navigation</span>
        </h3>
        <FieldWorkerMap location={task.location} isEmergency={isEmergency} />
      </div>

      {/* Citizen Description & Photo Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#716A63]">
            Citizen Description
          </h4>
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#EDE6DA] text-xs text-[#282521] leading-relaxed">
            {citizenDescription}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#716A63]">
            Government Work Instructions
          </h4>
          <div className="p-3.5 rounded-xl bg-[#F3EFE8] border border-[#EDE6DA] text-xs font-semibold text-[#3E3934] leading-relaxed">
            {governmentInstructions}
          </div>
        </div>
      </div>

      {/* Citizen Photo */}
      {citizenPhoto && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#716A63] flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Citizen Photo Evidence
          </h4>
          <div className="h-44 w-full rounded-xl bg-cover bg-center border border-[#D8D5CF]" style={{ backgroundImage: `url(${citizenPhoto})` }} />
        </div>
      )}

      {/* Primary Action Buttons: ACKNOWLEDGE / START RESPONSE / ON SITE */}
      <div className="space-y-2.5 border-t border-[#EDE6DA] pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E3934]">
          Quick Field Progression Actions
        </h4>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleUpdateStatus('ACKNOWLEDGED')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              currentStatus === 'ACKNOWLEDGED'
                ? 'bg-[#3E3934] text-white'
                : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
            }`}
          >
            {t('acknowledge_btn')}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleUpdateStatus('RESPONDING')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              currentStatus === 'RESPONDING'
                ? 'bg-[#B4691B] text-white'
                : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
            }`}
          >
            {t('start_response_btn')}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleUpdateStatus('ON_SITE')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              currentStatus === 'ON_SITE'
                ? 'bg-[#6A5647] text-white'
                : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
            }`}
          >
            {t('on_site_btn')}
          </button>
        </div>
      </div>

      {/* WORK COMPLETION FORM: Upload After-Photo, Notes, MARK COMPLETE */}
      <form onSubmit={handleCompleteTask} className="space-y-4 bg-[#F8F7F3] p-4 sm:p-5 rounded-2xl border border-[#D8D5CF]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E6B4D]">
          <CheckCircle2 className="w-4 h-4" />
          <span>Work Completion & Resolution Proof</span>
        </div>

        {/* Upload After-Photo / Choose sample */}
        <div>
          <label className="block text-xs font-bold text-[#282521] mb-1.5 flex items-center justify-between">
            <span>{t('upload_photo_btn')} (Required for Citizen Verification)</span>
            <span className="text-[10px] text-[#716A63]">Select test sample or paste URL</span>
          </label>

          <div className="grid grid-cols-3 gap-2 mb-2">
            {SAMPLE_AFTER_PHOTOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAfterPhoto(sample.url)}
                className={`p-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all cursor-pointer ${
                  afterPhoto === sample.url
                    ? 'border-[#3E3934] bg-[#EDE6DA] text-[#282521]'
                    : 'border-[#D8D5CF] bg-white text-[#716A63] hover:bg-[#EDE6DA]/50'
                }`}
              >
                <div className="h-10 w-full rounded bg-cover bg-center mb-1" style={{ backgroundImage: `url(${sample.url})` }} />
                <span className="truncate block">{sample.label}</span>
              </button>
            ))}
          </div>

          {afterPhoto && (
            <div className="text-xs text-[#2E6B4D] font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Completion after-photo attached</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-[#282521] mb-1">
            {t('add_note_btn')}
          </label>
          <input
            type="text"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="e.g. Replaced faulty 120W LED fixture. Tested circuit breaker on site."
            className="w-full px-3 py-2 rounded-xl border border-[#D8D5CF] bg-white text-xs text-[#282521]"
          />
        </div>

        {actionNotice && (
          <div className="p-2.5 rounded-lg bg-[#E8F5E9] text-[#2E6B4D] text-xs font-bold">
            {actionNotice}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || currentStatus === 'RESOLVED'}
          className="w-full py-3 px-4 rounded-xl bg-[#2E6B4D] hover:bg-[#25573E] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{currentStatus === 'RESOLVED' ? 'Task Already Marked Complete' : t('mark_complete_btn')}</span>
        </button>
      </form>
    </div>
  );
};
