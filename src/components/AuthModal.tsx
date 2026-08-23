import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon, Building, MapPin, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from './Logo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle } = useAuth();
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

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email, password);
        setSuccessMsg('Successfully authenticated! Loading dashboard...');
      } else if (mode === 'register') {
        if (!email || !password || !name) {
          throw new Error('Full name, email, and password are required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register({
          name,
          email,
          password,
          role,
          businessName: businessName || `${name}'s Business`,
          location: location || 'India',
        });
        setSuccessMsg('Account created successfully! Loading your workspace...');
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Please enter your registered email address.');
        }
        setSuccessMsg(`Password reset instructions have been sent to ${email}`);
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Signed in with Google');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#112217] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-900/10 dark:border-emerald-800/40 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-600/60 hover:text-emerald-900 dark:text-emerald-400/60 dark:hover:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <Logo variant="horizontal" size="md" showTagline={true} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-poppins mt-2">
            {mode === 'login'
              ? 'Sign In to KRIVIO AI'
              : mode === 'register'
              ? 'Create Entrepreneur Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-emerald-200/70 font-inter">
            {mode === 'login'
              ? 'Access your Voice AI mentor & product studio'
              : mode === 'register'
              ? 'Save your enterprise profile and access your business workspace'
              : 'Enter your registered email to receive reset instructions'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-emerald-50 dark:bg-[#0B1911] p-1 rounded-xl mb-5 border border-emerald-200/50 dark:border-emerald-900/40">
          <button
            type="button"
            id="tab-mode-login"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all font-poppins ${
              mode === 'login'
                ? 'bg-[#123524] text-white shadow-xs'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-mode-register"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all font-poppins ${
              mode === 'register'
                ? 'bg-[#123524] text-white shadow-xs'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            id="tab-mode-forgot"
            onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all font-poppins ${
              mode === 'forgot'
                ? 'bg-[#123524] text-white shadow-xs'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-inter flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-inter flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-600/60 dark:text-emerald-400/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
                  >
                    <option value="artisan">Artisan / Weaver</option>
                    <option value="shg">Self-Help Group (SHG)</option>
                    <option value="farmer">Small Farmer</option>
                    <option value="small_business">Small Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Location</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600/60 dark:text-emerald-400/60 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Varanasi, UP"
                      className="w-full pl-8 pr-2.5 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Business / Brand Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-emerald-600/60 dark:text-emerald-400/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Ganga Silk Handlooms"
                    className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-600/60 dark:text-emerald-400/60 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-emerald-200 font-poppins">Password *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-inter"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-600/60 dark:text-emerald-400/60 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-emerald-50/50 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2E7D32] outline-none font-inter"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#123524] hover:bg-[#1A4330] text-white font-semibold text-xs rounded-xl shadow-md transition-all mt-2 font-poppins flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                <span>{mode === 'login' ? 'Signing In...' : mode === 'register' ? 'Creating Account...' : 'Sending Link...'}</span>
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : mode === 'register' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200/60 dark:border-emerald-800/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#112217] px-2 text-slate-400 dark:text-emerald-400/60 font-semibold font-poppins">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 bg-white dark:bg-[#0B1911] hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800/60 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors font-inter"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Google One-Click Sign In</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
