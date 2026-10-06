import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CivicDataProvider } from './context/CivicDataContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { CitizenAppShell } from './components/citizen/CitizenAppShell';
import { GovernmentAppShell } from './components/government/GovernmentAppShell';
import { FieldWorkerAppShell } from './components/field-worker/FieldWorkerAppShell';

const MainRouter: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#3E3934] text-white flex items-center justify-center font-black text-lg animate-pulse shadow-sm">
          NM
        </div>
        <div className="text-xs font-semibold tracking-wider uppercase text-[#6A5647]">
          NagarMitra Municipal Platform
        </div>
      </div>
    );
  }

  // Not logged in -> Show ONLY the login screen!
  if (!user) {
    return <LoginScreen />;
  }

  // Render completely different application shells based on verified backend role
  if (user.role === 'CITIZEN') {
    return <CitizenAppShell />;
  }

  if (user.role === 'GOVERNMENT') {
    return <GovernmentAppShell />;
  }

  if (user.role === 'FIELD_WORKER') {
    return <FieldWorkerAppShell />;
  }

  // Fallback
  return <LoginScreen />;
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CivicDataProvider>
          <MainRouter />
        </CivicDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
