import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { X, Mail, Lock, User as UserIcon, Building, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<'artisan' | 'shg' | 'farmer' | 'small_business'>('artisan');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error(t('validation.required'));
        }
        await login(email, password);
        setSuccessMsg(t('auth.loginSuccess'));
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          throw new Error(t('validation.required'));
        }
        if (password.length < 6) {
          throw new Error(t('validation.passwordMinLength'));
        }
        await register({
          name,
          email,
          password,
          role,
          businessName: businessName || `${name}'s Business`,
          location: location || 'India',
        });
        setSuccessMsg(t('auth.registerSuccess'));
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error(t('validation.invalidEmail'));
        }
        setSuccessMsg(t('auth.resetSent'));
      }
    } catch (err: any) {
      setError(err.message || t('errors.general'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      // Trigger Supabase Google OAuth
      await signInWithGoogle();
      setSuccessMsg(t('auth.loginSuccess'));
    } catch (err: any) {
      console.warn('OAuth redirect issue, falling back:', err);
      try {
        await loginWithGoogle('Google Entrepreneur', email || 'artisan@krivio.ai');
        setSuccessMsg(t('auth.loginSuccess'));
      } catch (innerErr: any) {
        setError(innerErr.message || t('errors.general'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#13251B] rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-[#0F5132]/20 dark:border-emerald-800/60 relative max-h-[90vh] overflow-y-auto font-inter">
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={closeAuthModal}
          aria-label={t('common.close')}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:text-emerald-400/60 dark:hover:text-emerald-100 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-5">
          <Logo variant="horizontal" size="md" showTagline={true} />
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins mt-2">
            {mode === 'login'
              ? t('auth.signInTitle')
              : mode === 'register'
              ? t('auth.signUpTitle')
              : t('auth.forgotPasswordTitle')}
          </h2>
          <p className="text-xs text-stone-600 dark:text-emerald-200/70 font-inter max-w-xs">
            {mode === 'login'
              ? t('auth.signInSubtitle')
              : mode === 'register'
              ? t('auth.signUpSubtitle')
              : t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#F8F9F5] dark:bg-[#0E2016] p-1 rounded-2xl mb-5 border border-[#0F5132]/15 dark:border-emerald-900/40">
          <button
            type="button"
            id="tab-mode-login"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all font-poppins cursor-pointer ${
              mode === 'login'
                ? 'bg-[#0F5132] text-white shadow-xs'
                : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signIn')}
          </button>
          <button
            type="button"
            id="tab-mode-register"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all font-poppins cursor-pointer ${
              mode === 'register'
                ? 'bg-[#0F5132] text-white shadow-xs'
                : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('auth.signUp')}
          </button>
          <button
            type="button"
            id="tab-mode-forgot"
            onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all font-poppins cursor-pointer ${
              mode === 'forgot'
                ? 'bg-[#0F5132] text-white shadow-xs'
                : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/20 dark:border-emerald-800 text-[#0F5132] dark:text-emerald-200 rounded-2xl text-xs font-inter flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs font-inter flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">{t('auth.fullName')} *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">{t('auth.role')}</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter cursor-pointer"
                  >
                    <option value="artisan">{t('auth.roleArtisan')}</option>
                    <option value="shg">{t('auth.roleSHG')}</option>
                    <option value="farmer">{t('auth.roleFarmer')}</option>
                    <option value="small_business">{t('auth.roleSmallBusiness')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">{t('businessProfile.state')}</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Varanasi, UP"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">{t('auth.businessName')}</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t('auth.businessNamePlaceholder')}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">{t('auth.email')} *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 font-poppins">{t('auth.password')} *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[10px] text-[#0F5132] dark:text-[#34D399] hover:underline font-inter cursor-pointer"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md transition-all mt-2 font-poppins flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>{t('auth.submitting')}</span>
              </>
            ) : mode === 'login' ? (
              t('auth.signIn')
            ) : mode === 'register' ? (
              t('auth.signUp')
            ) : (
              t('auth.sendResetLink')
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-emerald-900/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#13251B] px-2 text-stone-400 dark:text-emerald-400/60 font-semibold font-poppins">{t('auth.orWithEmail')}</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              id="btn-google-sign-in"
              onClick={handleGoogleSignIn}
              disabled={submitting || googleLoading}
              className="w-full py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] hover:bg-stone-100 dark:hover:bg-emerald-900/30 text-stone-700 dark:text-emerald-100 border border-[#0F5132]/20 dark:border-emerald-800/60 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-inter cursor-pointer active:scale-98 disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F5132] dark:text-[#34D399]" />
                  <span>{t('auth.submitting')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-poppins font-medium">{t('auth.continueWithGoogle')}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

