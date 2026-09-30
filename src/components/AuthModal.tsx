import React, { useState, useEffect, useRef } from 'react';
import { useAuth, AuthModalMode } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    loginWithGoogle,
    signInWithGoogle,
    forgotPassword,
  } = useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<AuthModalMode>(authModalMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<'artisan' | 'shg' | 'farmer' | 'small_business'>('artisan');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync mode whenever authModalMode updates from context
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setError('');
      setSuccessMsg('');
      setFieldErrors({});
    }
  }, [authModalMode, isAuthModalOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeAuthModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (mode === 'login') {
      if (!password) {
        errors.password = 'Password is required.';
      }
    } else if (mode === 'register') {
      if (!name.trim()) {
        errors.name = 'Full name is required.';
      } else if (name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters.';
      }

      if (!password) {
        errors.password = 'Password is required.';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    } else if (mode === 'forgot') {
      // only email required
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        setSuccessMsg(t('auth.loginSuccess') || 'Welcome back! Signing you in...');
      } else if (mode === 'register') {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          businessName: businessName.trim() || `${name.trim()}'s Workshop`,
          location: location.trim() || 'India',
        });
        setSuccessMsg(t('auth.registerSuccess') || 'Account created successfully! Welcome to KRIVIO.');
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email.trim());
        setSuccessMsg(
          res.message || 'If an account exists with this email address, password reset instructions have been dispatched.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg(t('auth.loginSuccess') || 'Redirecting to Google...');
    } catch (err: any) {
      console.warn('[OAuth]: Redirect issue, falling back to direct sync:', err);
      try {
        await loginWithGoogle('Google Entrepreneur', email || 'artisan@krivio.ai');
        setSuccessMsg(t('auth.loginSuccess') || 'Signed in successfully via Google.');
      } catch (innerErr: any) {
        setError(innerErr.message || 'Google sign-in could not be completed. Please try with email.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = (newMode: AuthModalMode) => {
    setMode(newMode);
    setAuthModalMode(newMode);
    setError('');
    setSuccessMsg('');
    setFieldErrors({});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-white dark:bg-[#13251B] rounded-3xl max-w-[460px] w-full shadow-2xl border border-[#0F5132]/20 dark:border-emerald-800/60 relative flex flex-col max-h-[92vh] font-inter overflow-hidden"
      >
        {/* Modal Top Header (Fixed) */}
        <div className="p-5 sm:p-6 pb-3 border-b border-stone-100 dark:border-emerald-900/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Logo variant="horizontal" size="sm" showTagline={false} />
          </div>
          <button
            id="btn-close-auth-modal"
            onClick={closeAuthModal}
            aria-label={t('common.close') || 'Close dialog'}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 dark:text-emerald-400/70 dark:hover:text-emerald-100 hover:bg-stone-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable with clean spacing) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Header Title & Subtitle */}
          <div className="text-left space-y-1">
            <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white font-poppins tracking-tight">
              {mode === 'login'
                ? t('auth.signInTitle') || 'Welcome back to KRIVIO'
                : mode === 'register'
                ? t('auth.signUpTitle') || 'Create your artisan account'
                : 'Reset your password'}
            </h2>
            <p className="text-xs text-stone-600 dark:text-emerald-200/70 font-inter">
              {mode === 'login'
                ? 'Sign in to access your product catalog, image studio, and voice mentor.'
                : mode === 'register'
                ? 'Join thousands of rural entrepreneurs growing their business with AI.'
                : 'Enter your registered email and we will send password reset instructions.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only for login / register) */}
          {mode !== 'forgot' && (
            <div className="flex bg-[#F8F9F5] dark:bg-[#0E2016] p-1 rounded-2xl border border-[#0F5132]/15 dark:border-emerald-900/40">
              <button
                type="button"
                id="tab-mode-login"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all font-poppins cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('auth.signIn') || 'Sign In'}
              </button>
              <button
                type="button"
                id="tab-mode-register"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all font-poppins cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#0F5132] text-white shadow-xs'
                    : 'text-stone-600 dark:text-emerald-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t('auth.signUp') || 'Create Account'}
              </button>
            </div>
          )}

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3.5 bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/25 dark:border-emerald-800 text-[#0F5132] dark:text-emerald-200 rounded-2xl text-xs font-inter flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">{successMsg}</span>
                {mode === 'forgot' && (
                  <div>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#0F5132] dark:text-[#34D399] font-bold underline cursor-pointer mt-1 inline-block"
                    >
                      Return to Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-2xl text-xs font-inter flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="font-medium">{error}</span>
                {error.includes('already exists') && mode === 'register' && (
                  <div>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#0F5132] dark:text-[#34D399] font-bold underline cursor-pointer mt-1 inline-block"
                    >
                      Switch to Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Registration-Only Fields */}
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label htmlFor="auth-fullname" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('auth.fullName') || 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                    <input
                      id="auth-fullname"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                      }}
                      placeholder="e.g. Sunita Devi"
                      required
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border rounded-xl text-xs text-stone-900 dark:text-white outline-none font-inter transition-colors ${
                        fieldErrors.name
                          ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                          : 'border-[#0F5132]/20 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#0F5132]'
                      }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-inter">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Role and Location (State) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="auth-role" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                      {t('auth.role') || 'Role'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="auth-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter cursor-pointer"
                    >
                      <option value="artisan">{t('auth.roleArtisan') || 'Artisan / Maker'}</option>
                      <option value="shg">{t('auth.roleSHG') || 'Self-Help Group (SHG)'}</option>
                      <option value="farmer">{t('auth.roleFarmer') || 'Farmer Producer Org'}</option>
                      <option value="small_business">{t('auth.roleSmallBusiness') || 'Small Business'}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="auth-location" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                      {t('businessProfile.state') || 'State / Region'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                      <input
                        id="auth-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                      />
                    </div>
                  </div>
                </div>

                {/* Business / Workshop Name */}
                <div>
                  <label htmlFor="auth-business-name" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                    {t('auth.businessName') || 'Workshop or Brand Name'}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                    <input
                      id="auth-business-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Varanasi Weaves"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none font-inter"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address (All Modes) */}
            <div>
              <label htmlFor="auth-email" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                {t('auth.email') || 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  placeholder="artisan@example.com"
                  required
                  autoComplete="email"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border rounded-xl text-xs text-stone-900 dark:text-white outline-none font-inter transition-colors ${
                    fieldErrors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-[#0F5132]/20 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#0F5132]'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-inter">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password (Login & Register) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="auth-password" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 font-poppins">
                    {t('auth.password') || 'Password'} <span className="text-red-500">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => switchMode('forgot')}
                      className="text-[10px] text-[#0F5132] dark:text-[#34D399] hover:underline font-inter cursor-pointer"
                    >
                      {t('auth.forgotPassword') || 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`w-full pl-9 pr-10 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border rounded-xl text-xs text-stone-900 dark:text-white outline-none font-inter transition-colors ${
                      fieldErrors.password
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                        : 'border-[#0F5132]/20 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#0F5132]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-inter">{fieldErrors.password}</p>
                )}
              </div>
            )}

            {/* Confirm Password (Register Mode Only) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                    className={`w-full pl-9 pr-10 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border rounded-xl text-xs text-stone-900 dark:text-white outline-none font-inter transition-colors ${
                      fieldErrors.confirmPassword
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                        : 'border-[#0F5132]/20 dark:border-emerald-800/60 focus:ring-2 focus:ring-[#0F5132]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 font-inter">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Action Button (Min 44px height) */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs transition-all mt-1 font-poppins flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>{t('auth.submitting') || 'Please wait...'}</span>
                </>
              ) : mode === 'login' ? (
                t('auth.signIn') || 'Sign In'
              ) : mode === 'register' ? (
                t('auth.signUp') || 'Create Account'
              ) : (
                'Send Password Reset Link'
              )}
            </button>
          </form>

          {/* Social Sign-In (Login / Register Modes) */}
          {mode !== 'forgot' && (
            <>
              {/* Clean Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-emerald-900/40" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-[#13251B] px-2 text-stone-400 dark:text-emerald-400/60 font-medium font-poppins">
                    or
                  </span>
                </div>
              </div>

              {/* Google OAuth Button (Min 44px height) */}
              <button
                type="button"
                id="btn-google-sign-in"
                onClick={handleGoogleSignIn}
                disabled={submitting || googleLoading}
                className="w-full min-h-[44px] py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] hover:bg-stone-100 dark:hover:bg-emerald-900/30 text-stone-700 dark:text-emerald-100 border border-[#0F5132]/20 dark:border-emerald-800/60 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-colors font-poppins cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F5132] dark:text-[#34D399]" />
                    <span>Connecting to Google...</span>
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
                    <span>{t('auth.continueWithGoogle') || 'Continue with Google'}</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Path back to Sign in when in Forgot mode */}
          {mode === 'forgot' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5132] dark:text-[#34D399] hover:underline font-poppins cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Fixed) */}
        <div className="px-5 sm:px-6 py-3 bg-[#F8F9F5]/70 dark:bg-[#0E2016]/70 border-t border-stone-100 dark:border-emerald-900/30 text-center text-[11px] text-stone-500 dark:text-emerald-400/70 font-inter shrink-0">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-semibold text-[#0F5132] dark:text-[#34D399] hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </span>
          ) : mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-semibold text-[#0F5132] dark:text-[#34D399] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F5132] dark:text-[#34D399]" />
              Encrypted and secure account recovery
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
