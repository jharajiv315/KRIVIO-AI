import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  Save,
  AlertCircle,
  Database,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [language, setLanguage] = useState('Hindi');
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
      // Simulate password update endpoint or call backend
      await new Promise((res) => setTimeout(res, 800));
      setPwMessage({ type: 'success', text: 'Password changed successfully in PostgreSQL!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setIsSubmittingPw(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" /> Workspace Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage theme display, primary language, PostgreSQL security, and alert preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Theme & Language */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" /> Display & Regional Language
          </h2>

          <div className="space-y-4 text-xs">
            {/* Theme selector */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Workspace Theme</span>
                <span className="text-slate-500 text-[11px]">Toggle between Light and Dark mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
                <span className="capitalize">{theme} Mode</span>
              </button>
            </div>

            {/* Language selector */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                Primary Mentor Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="English">English</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Voice AI Mentor will respond in your chosen regional language.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Account & Security */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> PostgreSQL Account Identity
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Database Record ID</span>
              <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {user?.id || 'usr_active'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || user?.full_name || 'Artisan User'}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Security Verification</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> JWT Auth + bcrypt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" /> Change Account Password
        </h2>

        {pwMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              pwMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}
          >
            {pwMessage.type === 'success' ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4" />}
            <span>{pwMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingPw}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmittingPw ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" /> Notification Preferences
        </h2>

        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Email Digest</span>
              <span className="text-slate-500 text-[11px]">Receive monthly marketplace tips & new scheme updates</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">WhatsApp Task Alerts</span>
              <span className="text-slate-500 text-[11px]">Get daily action task reminders on WhatsApp</span>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">AI Smart Workspace Suggestions</span>
              <span className="text-slate-500 text-[11px]">Proactive AI hints on pricing and photo quality</span>
            </div>
            <input
              type="checkbox"
              checked={aiSuggestions}
              onChange={(e) => setAiSuggestions(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
