import React from 'react';
import { Compass, ArrowLeft, Home, Mic, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';

interface NotFoundProps {
  onNavigate: (tab: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 font-inter">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#13251B] p-8 sm:p-10 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xl">
        {/* Brand Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-[#34D399] flex items-center justify-center mx-auto shadow-inner border border-[#0F5132]/15">
          <Compass className="w-8 h-8 text-[#0F5132] dark:text-[#34D399]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider font-poppins">
            Error 404 — Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-stone-900 dark:text-white">
            We couldn’t find that page
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed max-w-sm mx-auto">
            The link you followed may be incorrect, expired, or the feature may have moved to a different workspace studio.
          </p>
        </div>

        {/* Helpful Primary Action Links */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="w-full py-3 px-5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-md transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span>{user ? 'Return to Workspace Dashboard' : 'Return to Home'}</span>
          </button>

          <button
            onClick={() => onNavigate('mentor')}
            className="w-full py-3 px-5 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-200 font-semibold text-xs rounded-xl border border-stone-200 dark:border-emerald-800/60 transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
            <span>Ask Voice Mentor for Help</span>
          </button>
        </div>

        {/* Direct human support */}
        <div className="pt-4 border-t border-stone-100 dark:border-emerald-900/40 text-xs text-stone-500 dark:text-emerald-300/70 space-y-1">
          <p>Need guidance or found a broken button?</p>
          <a
            href="mailto:support@krivio.ai?subject=Broken%20Link%20Report%20-%20KRIVIO%20AI"
            className="text-[#0F5132] dark:text-emerald-300 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Email our Artisan Support Team</span>
          </a>
        </div>
      </div>
    </div>
  );
};
