import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { Building2, User, HardHat, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');

  // Form states
  const [citizenName, setCitizenName] = useState('Ananya Sharma');
  const [citizenEmail, setCitizenEmail] = useState('ananya.sharma@example.com');

  const [govIdentifier, setGovIdentifier] = useState('GOV-101');
  const [govPassword, setGovPassword] = useState('admin123');

  const [workerIdentifier, setWorkerIdentifier] = useState('FW-401');
  const [workerPassword, setWorkerPassword] = useState('worker123');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let payload: Record<string, any> = {};

    if (selectedRole === 'CITIZEN') {
      if (!citizenName.trim() || !citizenEmail.trim()) {
        setErrorMessage('Please enter both your name and email address.');
        setIsSubmitting(false);
        return;
      }
      payload = { name: citizenName, email: citizenEmail };
    } else if (selectedRole === 'GOVERNMENT') {
      if (!govIdentifier.trim() || !govPassword.trim()) {
        setErrorMessage('Please enter your Employee ID and authorized password.');
        setIsSubmitting(false);
        return;
      }
      payload = { identifier: govIdentifier, password: govPassword };
    } else if (selectedRole === 'FIELD_WORKER') {
      if (!workerIdentifier.trim() || !workerPassword.trim()) {
        setErrorMessage('Please enter your Worker ID and password.');
        setIsSubmitting(false);
        return;
      }
      payload = { identifier: workerIdentifier, password: workerPassword };
    }

    const result = await login(selectedRole, payload);

    if (!result.success) {
      setErrorMessage(result.error || t('invalid_credentials'));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header with Brand & Bilingual Switcher */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#D8D5CF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3E3934] text-[#F8F7F3] flex items-center justify-center font-bold text-lg shadow-sm">
            NM
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#282521]">
              {t('brand_name')}
            </h1>
            <p className="text-xs text-[#716A63]">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-[#EDE6DA] p-1 rounded-lg border border-[#D8D5CF] text-xs">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              lang === 'en'
                ? 'bg-[#3E3934] text-white shadow-xs'
                : 'text-[#3E3934] hover:text-[#282521]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 font-semibold rounded-md transition-all ${
              lang === 'hi'
                ? 'bg-[#3E3934] text-white shadow-xs'
                : 'text-[#3E3934] hover:text-[#282521]'
            }`}
          >
            हिंदी
          </button>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#D8D5CF] shadow-sm p-6 sm:p-10">
          {/* Role selector question */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE6DA] text-[#6A5647] text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Municipal Gateway
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#282521] tracking-tight">
              {t('how_accessing')}
            </h2>
            <p className="text-sm text-[#716A63] mt-2">
              Select your authorization role to enter the dedicated application shell.
            </p>
          </div>

          {/* Three Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {/* CITIZEN */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('CITIZEN');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedRole === 'CITIZEN'
                  ? 'border-[#3E3934] bg-[#F8F7F3] ring-2 ring-[#3E3934]/15 shadow-xs'
                  : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                selectedRole === 'CITIZEN' ? 'bg-[#3E3934] text-white' : 'bg-[#EDE6DA] text-[#6A5647]'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#282521]">{t('role_citizen')}</div>
              <div className="text-xs text-[#716A63] mt-1 line-clamp-2">Public reports & tracking</div>
            </button>

            {/* GOVERNMENT EMPLOYEE */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('GOVERNMENT');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedRole === 'GOVERNMENT'
                  ? 'border-[#3E3934] bg-[#F8F7F3] ring-2 ring-[#3E3934]/15 shadow-xs'
                  : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                selectedRole === 'GOVERNMENT' ? 'bg-[#3E3934] text-white' : 'bg-[#EDE6DA] text-[#6A5647]'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#282521]">{t('role_government')}</div>
              <div className="text-xs text-[#716A63] mt-1 line-clamp-2">Civic Command Center</div>
            </button>

            {/* FIELD WORKER */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('FIELD_WORKER');
                setErrorMessage(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedRole === 'FIELD_WORKER'
                  ? 'border-[#3E3934] bg-[#F8F7F3] ring-2 ring-[#3E3934]/15 shadow-xs'
                  : 'border-[#D8D5CF] bg-white hover:bg-[#F8F7F3]/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                selectedRole === 'FIELD_WORKER' ? 'bg-[#3E3934] text-white' : 'bg-[#EDE6DA] text-[#6A5647]'
              }`}>
                <HardHat className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#282521]">{t('role_field_worker')}</div>
              <div className="text-xs text-[#716A63] mt-1 line-clamp-2">Field Operations & Tasks</div>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-lg bg-[#9C382A]/10 border border-[#9C382A]/30 text-[#9C382A] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Based on Selected Role */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === 'CITIZEN' && (
              <>
                <div className="border-b border-[#EDE6DA] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#282521]">{t('welcome_citizen')}</h3>
                  <p className="text-xs text-[#716A63] mt-0.5">{t('citizen_subtitle')}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('full_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('email_address')}
                  </label>
                  <input
                    type="email"
                    required
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="e.g. citizen@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#3E3934] text-white font-semibold text-sm hover:bg-[#282521] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : t('continue_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {selectedRole === 'GOVERNMENT' && (
              <>
                <div className="border-b border-[#EDE6DA] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#282521]">{t('gov_login_title')}</h3>
                  <p className="text-xs text-[#716A63] mt-0.5">{t('gov_login_subtitle')}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('emp_id_or_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={govIdentifier}
                    onChange={(e) => setGovIdentifier(e.target.value)}
                    placeholder="e.g. GOV-101 or Officer Sharma"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={govPassword}
                    onChange={(e) => setGovPassword(e.target.value)}
                    placeholder="Authorized password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div className="p-3 bg-[#F3EFE8] rounded-lg border border-[#EDE6DA] text-xs text-[#716A63] space-y-1">
                  <span className="font-semibold text-[#3E3934]">Authorized Staff Roster:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGovIdentifier('GOV-101');
                        setGovPassword('admin123');
                      }}
                      className="text-xs px-2 py-0.5 bg-white rounded border border-[#D8D5CF] text-[#3E3934] hover:bg-[#EDE6DA]"
                    >
                      Officer Sharma (GOV-101)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGovIdentifier('GOV-102');
                        setGovPassword('admin123');
                      }}
                      className="text-xs px-2 py-0.5 bg-white rounded border border-[#D8D5CF] text-[#3E3934] hover:bg-[#EDE6DA]"
                    >
                      Dr. Anita Verma (GOV-102)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#3E3934] text-white font-semibold text-sm hover:bg-[#282521] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{isSubmitting ? 'Verifying Authorization...' : t('gov_login_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {selectedRole === 'FIELD_WORKER' && (
              <>
                <div className="border-b border-[#EDE6DA] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#282521]">{t('worker_login_title')}</h3>
                  <p className="text-xs text-[#716A63] mt-0.5">{t('worker_login_subtitle')}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('worker_id_or_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={workerIdentifier}
                    onChange={(e) => setWorkerIdentifier(e.target.value)}
                    placeholder="e.g. FW-401 or Rajesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E3934] mb-1.5">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    required
                    value={workerPassword}
                    onChange={(e) => setWorkerPassword(e.target.value)}
                    placeholder="Worker password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D5CF] bg-[#F8F7F3] text-sm text-[#282521] focus:outline-hidden focus:border-[#3E3934] focus:ring-1 focus:ring-[#3E3934]"
                  />
                </div>

                <div className="p-3 bg-[#F3EFE8] rounded-lg border border-[#EDE6DA] text-xs text-[#716A63] space-y-1">
                  <span className="font-semibold text-[#3E3934]">Authorized Field Workers:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkerIdentifier('FW-401');
                        setWorkerPassword('worker123');
                      }}
                      className="text-xs px-2 py-0.5 bg-white rounded border border-[#D8D5CF] text-[#3E3934] hover:bg-[#EDE6DA]"
                    >
                      Rajesh Kumar (FW-401 / Electrical)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkerIdentifier('FW-402');
                        setWorkerPassword('worker123');
                      }}
                      className="text-xs px-2 py-0.5 bg-white rounded border border-[#D8D5CF] text-[#3E3934] hover:bg-[#EDE6DA]"
                    >
                      Suresh Patel (FW-402 / Roads)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#3E3934] text-white font-semibold text-sm hover:bg-[#282521] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>{isSubmitting ? 'Authenticating Field Worker...' : t('worker_login_btn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-6 border-t border-[#D8D5CF] text-xs text-[#716A63]">
        <p>NagarMitra Municipal Platform &bull; Integrated Citizen, Government & Field Operations Gateway &bull; Ward 1 to 24</p>
      </footer>
    </div>
  );
};
