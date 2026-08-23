import React, { useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';

// Lazily imported studio and heavy feature components for optimized initial loading performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-emerald-800 dark:text-emerald-300 py-12">
    <div className="w-10 h-10 border-3 border-emerald-600/30 border-t-emerald-600 dark:border-emerald-400/30 dark:border-t-emerald-400 rounded-full animate-spin" />
    <span className="text-xs font-semibold tracking-wide uppercase font-poppins text-slate-500 dark:text-emerald-300/80">
      Loading Workspace...
    </span>
  </div>
);

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [pricingModalOpen, setPricingModalOpen] = useState<boolean>(false);

  const isWorkspace = currentTab !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-inter">
      {!isWorkspace && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openPricingModal={() => setPricingModalOpen(true)}
        />
      )}

      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          {isWorkspace ? (
            <Dashboard
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              openPricingModal={() => setPricingModalOpen(true)}
            />
          ) : (
            <LandingPage
              setCurrentTab={setCurrentTab}
              openPricingModal={() => setPricingModalOpen(true)}
            />
          )}
        </Suspense>
      </main>

      {!isWorkspace && <Footer setCurrentTab={setCurrentTab} />}

      <AuthModal />
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
