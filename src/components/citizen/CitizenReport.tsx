import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCivicData } from '../../context/CivicDataContext';
import { AIAnalysisResult } from '../../types';
import {
  Camera,
  Mic,
  MicOff,
  Sparkles,
  AlertTriangle,
  Check,
  Send,
  Loader2,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

interface CitizenReportProps {
  onSuccess: () => void;
  initialIsEmergency?: boolean;
}

export const CitizenReport: React.FC<CitizenReportProps> = ({ onSuccess, initialIsEmergency = false }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { createComplaint, createEmergency } = useCivicData();

  // Mode: standard reporting vs emergency
  const [isEmergencyMode, setIsEmergencyMode] = useState(initialIsEmergency);
  const [dangerChoice, setDangerChoice] = useState<'YES' | 'NO' | 'NOT_SURE' | null>(
    initialIsEmergency ? 'YES' : null
  );

  // Input states
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('Main Market Road, Ward 12');
  const [selectedWard, setSelectedWard] = useState(user?.ward || 'Ward 12');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Voice recording simulation
  const [isListening, setIsListening] = useState(false);

  // AI Advisory state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [hasConfirmedAI, setHasConfirmedAI] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sample photos for quick civic evidence testing
  const SAMPLE_PHOTOS = [
    { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Live Wire', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80' },
    { label: 'Broken Light', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
    { label: 'Water Leak', url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80' },
  ];

  // Quick Hinglish prompt suggestions
  const QUICK_PROMPTS = [
    'Road pe bahut bada pothole hai near Main Market, gaadi fisal rahi hai',
    'Streetlight broken for 4 days on 5th cross road, complete darkness',
    'Main water pipe burst and water flooding the residential lane',
    'Exposed live wire dangling near city bus stand puddle',
    'हमारे घर के सामने नाली टूट गई है और कचरा भर गया है',
  ];

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate speech input
      setTimeout(() => {
        setDescription('Road pe bahut bada pothole hai near Main Market');
        setIsListening(false);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!description.trim()) {
      setStatusMessage('Please enter or speak a description first.');
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description,
          isEmergencyCheck: isEmergencyMode || dangerChoice === 'YES'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.result);
        setHasConfirmedAI(false);
      } else {
        setStatusMessage('AI assessment temporarily unavailable. You can still submit directly.');
      }
    } catch {
      setStatusMessage('AI assessment error. You can still submit directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const title = aiAnalysis?.issue || description.slice(0, 60);
    const category = aiAnalysis?.category || 'Road Infrastructure';
    const severity = aiAnalysis?.severity || (isEmergencyMode ? 'CRITICAL' : 'HIGH');
    const department = aiAnalysis?.suggestedDepartment || 'Road Infrastructure';

    if (isEmergencyMode || dangerChoice === 'YES') {
      const res = await createEmergency({
        title,
        hazardDescription: description,
        ward: selectedWard,
        location: {
          address: locationAddress,
          lat: 28.6750 + (Math.random() - 0.5) * 0.01,
          lng: 77.2200 + (Math.random() - 0.5) * 0.01,
          ward: selectedWard
        },
        department,
        photo: photoUrl || undefined,
        governmentInstructions: 'Direct emergency incident reported by citizen.'
      });

      if (res.success) {
        setSubmissionSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setStatusMessage(res.error || 'Failed to submit emergency alert.');
      }
    } else {
      const res = await createComplaint({
        title,
        description,
        category,
        priority: severity,
        ward: selectedWard,
        department,
        location: {
          address: locationAddress,
          lat: 28.6750 + (Math.random() - 0.5) * 0.01,
          lng: 77.2200 + (Math.random() - 0.5) * 0.01,
          ward: selectedWard
        },
        citizenPhoto: photoUrl || undefined,
        riskAssessment: aiAnalysis?.possibleRisk
      });

      if (res.success) {
        setSubmissionSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setStatusMessage(res.error || 'Failed to submit complaint.');
      }
    }

    setIsSubmitting(false);
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E6B4D] mx-auto flex items-center justify-center">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#282521]">
          {isEmergencyMode ? t('emergency_sent_success') : 'Civic Complaint Registered'}
        </h2>
        <p className="text-sm text-[#716A63]">
          Municipal dispatch team and local ward engineers have received your report. You can track progress in My Complaints.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#282521]">
            {isEmergencyMode ? 'Emergency Civic Alert' : t('report_new_issue')}
          </h1>
          <p className="text-xs text-[#716A63] mt-1">
            {isEmergencyMode
              ? 'Urgent municipal dispatch for dangerous civic conditions'
              : 'Submit problems with photos, bilingual speech, or text'}
          </p>
        </div>

        {/* Toggle between standard and emergency */}
        <button
          type="button"
          onClick={() => {
            setIsEmergencyMode(!isEmergencyMode);
            setAiAnalysis(null);
            setHasConfirmedAI(false);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isEmergencyMode
              ? 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
              : 'bg-[#8F1D1D]/10 text-[#8F1D1D] hover:bg-[#8F1D1D]/20 border border-[#8F1D1D]/30'
          }`}
        >
          {isEmergencyMode ? 'Switch to Standard Report' : '⚡ Immediate Danger?'}
        </button>
      </div>

      {/* Emergency Question Prompt if in Emergency mode */}
      {isEmergencyMode && (
        <div className="p-4 rounded-2xl bg-[#FAF3F0] border border-[#E8D4CD] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#8F1D1D]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t('danger_question')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['YES', 'NO', 'NOT_SURE'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setDangerChoice(choice)}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                  dangerChoice === choice
                    ? 'bg-[#8F1D1D] text-white border-[#8F1D1D] shadow-xs'
                    : 'bg-white text-[#3E3934] border-[#D8D5CF] hover:bg-[#F8F7F3]'
                }`}
              >
                {choice === 'YES' ? t('btn_yes') : choice === 'NO' ? t('btn_no') : t('btn_not_sure')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-[#D8D5CF] shadow-xs">
        {/* Description Label & Quick suggestions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#282521]">
              {t('issue_description_label')}
            </label>
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                isListening
                  ? 'bg-[#8F1D1D] text-white animate-pulse'
                  : 'bg-[#EDE6DA] text-[#3E3934] hover:bg-[#D8D5CF]'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? t('listening') : t('or_voice')}</span>
            </button>
          </div>

          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('issue_description_placeholder')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
          />

          {/* Quick Hinglish Suggestions */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-[#716A63] self-center mr-1">Quick examples:</span>
            {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(prompt)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F3EFE8] text-[#6A5647] hover:bg-[#EDE6DA] transition-colors truncate max-w-xs cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* AI Advisory Assessment Button */}
        <div>
          <button
            type="button"
            onClick={handleAnalyzeWithAI}
            disabled={isAnalyzing || !description.trim()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EDE6DA] hover:bg-[#E2D9CB] text-[#3E3934] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#6A5647]" />
            )}
            <span>{isAnalyzing ? t('analyzing_ai') : 'Analyze with NagarMitra AI (Bilingual)'}</span>
          </button>
        </div>

        {/* AI Advisory Analysis Result Display */}
        {aiAnalysis && (
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#D8D5CF] space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE6DA] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E3934]">
                <Sparkles className="w-3.5 h-3.5 text-[#6A5647]" />
                <span>{t('ai_advisory_title')}</span>
              </div>
              <span className="text-[10px] text-[#716A63] italic">
                {t('ai_advisory_disclaimer')}
              </span>
            </div>

            {aiAnalysis.isPotentialHazard && (
              <div className="p-2.5 rounded-lg bg-[#FAF3F0] border border-[#E8D4CD] text-xs text-[#8F1D1D] font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('hazard_detected')} ({aiAnalysis.hazardType || 'Public hazard'})</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#716A63] block font-medium">{t('detected_issue')}:</span>
                <span className="font-semibold text-[#282521]">{aiAnalysis.issue}</span>
              </div>
              <div>
                <span className="text-[#716A63] block font-medium">{t('category')}:</span>
                <span className="font-semibold text-[#282521]">{aiAnalysis.category}</span>
              </div>
              <div>
                <span className="text-[#716A63] block font-medium">{t('severity')}:</span>
                <span className="font-semibold text-[#8F1D1D]">{aiAnalysis.severity}</span>
              </div>
              <div>
                <span className="text-[#716A63] block font-medium">{t('assigned_dept')}:</span>
                <span className="font-semibold text-[#282521]">{aiAnalysis.suggestedDepartment}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#716A63] block font-medium">{t('possible_risk')}:</span>
                <span className="text-[#3E3934]">{aiAnalysis.possibleRisk}</span>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div className="pt-2 border-t border-[#EDE6DA] flex items-center gap-2">
              <input
                type="checkbox"
                id="confirmAi"
                checked={hasConfirmedAI}
                onChange={(e) => setHasConfirmedAI(e.target.checked)}
                className="rounded border-[#D8D5CF] text-[#3E3934] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="confirmAi" className="text-xs font-medium text-[#3E3934] cursor-pointer">
                I verify that this AI civic assessment accurately describes the situation.
              </label>
            </div>
          </div>
        )}

        {/* Location & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#282521] mb-1">
              Location Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#716A63] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521] focus:outline-hidden focus:border-[#3E3934]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282521] mb-1">
              Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D8D5CF] bg-[#F8F7F3] text-xs text-[#282521] focus:outline-hidden focus:border-[#3E3934]"
            >
              <option value="Ward 12">Ward 12 — Central Civil Lines</option>
              <option value="Ward 8">Ward 8 — Green Park Sector</option>
              <option value="Ward 9">Ward 9 — Market Complex</option>
              <option value="Ward 11">Ward 11 — South Industrial</option>
            </select>
          </div>
        </div>

        {/* Photo Evidence Upload / Selection */}
        <div>
          <label className="block text-xs font-bold text-[#282521] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#6A5647]" />
              {t('upload_photo')}
            </span>
            <span className="text-[10px] text-[#716A63]">Select test sample or paste URL</span>
          </label>

          <div className="grid grid-cols-4 gap-2 mb-2">
            {SAMPLE_PHOTOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPhotoUrl(sample.url)}
                className={`p-1.5 rounded-lg border text-left text-[11px] font-semibold transition-all cursor-pointer ${
                  photoUrl === sample.url
                    ? 'border-[#3E3934] bg-[#EDE6DA] text-[#282521]'
                    : 'border-[#D8D5CF] bg-[#F8F7F3] text-[#716A63] hover:bg-[#EDE6DA]/50'
                }`}
              >
                <div className="h-12 w-full rounded bg-cover bg-center mb-1" style={{ backgroundImage: `url(${sample.url})` }} />
                <span className="truncate block">{sample.label}</span>
              </button>
            ))}
          </div>

          {photoUrl && (
            <div className="text-xs text-[#2E6B4D] font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Photo evidence attached</span>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className="text-xs text-[#9C382A] font-semibold">
            {statusMessage}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              isEmergencyMode || dangerChoice === 'YES'
                ? 'bg-[#8F1D1D] hover:bg-[#721515]'
                : 'bg-[#3E3934] hover:bg-[#282521]'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {isEmergencyMode || dangerChoice === 'YES'
                ? t('send_emergency_alert')
                : t('submit_complaint')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
