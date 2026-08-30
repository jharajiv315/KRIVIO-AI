import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { PublicStorefront } from './components/PublicStorefront';

// Lazily imported studio and heavy feature components for optimized initial loading performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-[#0F5132] dark:text-[#34D399] py-12">
    <div className="w-10 h-10 border-3 border-[#0F5132]/30 border-t-[#0F5132] dark:border-[#34D399]/30 dark:border-t-[#34D399] rounded-full animate-spin" />
    <span className="text-xs font-semibold tracking-wide uppercase font-poppins text-stone-500 dark:text-emerald-200/80">
      Loading KRIVIO AI Workspace...
    </span>
  </div>
);

const MainContent: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [pricingModalOpen, setPricingModalOpen] = useState<boolean>(false);
  const [publicStoreId, setPublicStoreId] = useState<string | null>(null);

  // Check URL query parameters for public storefront links (?store=usr_demo_1 or ?storefront=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeParam = params.get('store') || params.get('storefront') || params.get('artisan');
    if (storeParam) {
      setPublicStoreId(storeParam);
      setCurrentTab('public-store');
    }
  }, []);

  if (currentTab === 'public-store') {
    return (
      <PublicStorefront
        userId={publicStoreId || 'usr_demo_1'}
        onNavigateHome={() => {
          // Clear search params cleanly
          window.history.pushState({}, '', window.location.pathname);
          setCurrentTab('landing');
        }}
        onOpenAuth={openAuthModal}
      />
    );
  }

  const isWorkspace = currentTab !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F5] dark:bg-[#0B1911] text-[#1A1A1A] dark:text-[#E2F1E7] transition-colors font-inter selection:bg-[#0F5132] selection:text-white">
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

