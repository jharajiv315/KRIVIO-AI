import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { authApi } from '../services/api';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsSubmittingPw(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPwMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err.message || t('errors.general') });
    } finally {
      setIsSubmittingPw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-emerald-900/40 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-poppins text-stone-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0F5132] dark:text-emerald-400" /> {t('settings.title')}
          </h1>
          <p className="text-xs text-stone-500 dark:text-emerald-300/70 mt-1">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1: Theme & Language */}
        <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> {t('settings.language')}
          </h2>

          <div className="space-y-4 text-xs">
            {/* Theme selector */}
            <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-emerald-900/40">
              <div>
                <span className="font-semibold text-stone-800 dark:text-emerald-100 block font-poppins">{t('settings.theme')}</span>
                <span className="text-stone-500 dark:text-emerald-300/60 text-[11px]">{t('settings.themeSubtitle')}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-2.5 bg-stone-100 dark:bg-[#183023] hover:bg-stone-200 dark:hover:bg-emerald-900/40 text-stone-800 dark:text-emerald-200 font-bold rounded-xl flex items-center gap-2 transition-all font-poppins cursor-pointer active:scale-98"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#0F5132]" />}
                <span className="capitalize">{theme === 'dark' ? t('settings.dark') : t('settings.light')}</span>
              </button>
            </div>

            {/* Language selector */}
            <div className="space-y-2">
              <label className="font-semibold text-stone-800 dark:text-emerald-100 block font-poppins">
                {t('settings.language')}
              </label>
              <LanguageSelector variant="inline" />
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70 pt-0.5">
                {t('settings.languageSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Account & Security */}
        <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> {t('profile.title')}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-stone-100 dark:border-emerald-900/40">
              <span className="text-stone-500 dark:text-emerald-300/60">Enterprise ID</span>
              <span className="font-mono text-[11px] font-semibold text-stone-800 dark:text-emerald-200">
                {user?.id || 'usr_active'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-stone-100 dark:border-emerald-900/40">
              <span className="text-stone-500 dark:text-emerald-300/60">{t('profile.fullName')}</span>
              <span className="font-semibold text-stone-800 dark:text-emerald-200">
                {user?.name || user?.full_name || 'Artisan User'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-stone-100 dark:border-emerald-900/40">
              <span className="text-stone-500 dark:text-emerald-300/60">{t('profile.email')}</span>
              <span className="font-semibold text-stone-800 dark:text-emerald-200">{user?.email}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-stone-500 dark:text-emerald-300/60">Security Verification</span>
              <span className="text-[#0F5132] dark:text-[#34D399] font-bold flex items-center gap-1 font-poppins">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bank-Grade Security Enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-white dark:bg-[#13251B] p-5 sm:p-8 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6 font-inter">
        <h2 className="text-sm font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> Change Account Password
        </h2>

        {pwMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              pwMessage.type === 'success'
                ? 'bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-200 border border-[#0F5132]/20 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {pwMessage.type === 'success' ? <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" /> : <AlertCircle className="w-4 h-4" />}
            <span>{pwMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div className="space-y-1">
            <label className="block font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingPw}
            className="w-full sm:w-auto px-5 py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-poppins cursor-pointer active:scale-98"
          >
            <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            <span>{isSubmittingPw ? t('common.loading') : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white dark:bg-[#13251B] p-5 sm:p-8 rounded-3xl border border-[#0F5132]/15 dark:border-emerald-800/60 shadow-xs space-y-6 font-inter">
        <h2 className="text-sm font-bold text-stone-900 dark:text-white font-poppins flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" /> {t('settings.notifications')}
        </h2>

        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-stone-100 dark:border-emerald-900/40">
            <div>
              <span className="font-semibold text-stone-800 dark:text-emerald-100 block font-poppins">Email Digest</span>
              <span className="text-stone-500 dark:text-emerald-300/70 text-[11px]">{t('settings.notificationsSubtitle')}</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#0F5132] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-stone-100 dark:border-emerald-900/40">
            <div>
              <span className="font-semibold text-stone-800 dark:text-emerald-100 block font-poppins">WhatsApp Task Alerts</span>
              <span className="text-stone-500 dark:text-emerald-300/70 text-[11px]">Get daily action task reminders on WhatsApp</span>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#0F5132] rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="font-semibold text-stone-800 dark:text-emerald-100 block font-poppins">AI Smart Workspace Suggestions</span>
              <span className="text-stone-500 dark:text-emerald-300/70 text-[11px]">Proactive AI hints on pricing and photo quality</span>
            </div>
            <input
              type="checkbox"
              checked={aiSuggestions}
              onChange={(e) => setAiSuggestions(e.target.checked)}
              className="w-4 h-4 accent-[#0F5132] rounded cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

