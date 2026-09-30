import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ResetPasswordProps {
  onNavigateHome: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onNavigateHome }) => {
  const { openAuthModal } = useAuth();

  const [token, setToken] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string>('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawToken = params.get('token') || params.get('reset_token') || '';
    setToken(rawToken);

    if (!rawToken) {
      setVerifying(false);
      setTokenValid(false);
      setVerifyError('No password reset token was provided in the link.');
      return;
    }

    const verify = async () => {
      try {
        setVerifying(true);
        const res = await authApi.verifyResetToken(rawToken);
        if (res.valid) {
          setTokenValid(true);
          setMaskedEmail(res.maskedEmail || '');
        } else {
          setTokenValid(false);
          setVerifyError('This password reset link is invalid, expired, or has already been used.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setVerifyError(err.message || 'This password reset link is invalid or expired.');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newPassword || newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setResetSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToSignIn = () => {
    // Clear URL parameters
    window.history.pushState({}, '', '/');
    onNavigateHome();
    setTimeout(() => {
      openAuthModal('login');
    }, 100);
  };

  const handleRequestNewLink = () => {
    window.history.pushState({}, '', '/');
    onNavigateHome();
    setTimeout(() => {
      openAuthModal('forgot');
    }, 100);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#13251B] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 font-inter">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo variant="horizontal" size="md" showTagline={false} />
          <h1 className="text-xl font-bold text-stone-900 dark:text-white font-poppins pt-2">
            Set New Password
          </h1>
          <p className="text-xs text-stone-600 dark:text-emerald-200/70">
            {verifying
              ? 'Verifying security token...'
              : tokenValid
              ? `Choose a secure new password for ${maskedEmail || 'your account'}.`
              : 'Password Recovery'}
          </p>
        </div>

        {/* Verifying Spinner */}
        {verifying && (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#0F5132] dark:text-[#34D399] animate-spin" />
            <span className="text-xs text-stone-500 dark:text-emerald-400">
              Validating reset token...
            </span>
          </div>
        )}

        {/* Invalid or Expired Token State */}
        {!verifying && !tokenValid && !resetSuccess && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-red-800 dark:text-red-300 font-poppins">
                  Link Expired or Invalid
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300/80 font-inter">
                  {verifyError || 'For your security, reset links expire after 1 hour and can only be used once.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleRequestNewLink}
              className="w-full min-h-[44px] py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-xs transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Request a New Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reset Successful State */}
        {resetSuccess && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0F5132]/10 dark:bg-emerald-950/60 border border-[#0F5132]/25 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0F5132] dark:text-[#34D399] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#0F5132] dark:text-emerald-300 font-poppins">
                  Password Reset Complete
                </h3>
                <p className="text-xs text-stone-700 dark:text-emerald-200/90 font-inter">
                  Your password has been successfully updated. You can now sign in using your new credentials.
                </p>
              </div>
            </div>

            <button
              id="btn-goto-signin"
              onClick={handleGoToSignIn}
              className="w-full min-h-[44px] py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-xs transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Valid Token Form */}
        {!verifying && tokenValid && !resetSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] font-inter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-emerald-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-emerald-200 mb-1 font-poppins">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 dark:text-emerald-500 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-[#F8F9F5] dark:bg-[#0E2016] border border-[#0F5132]/20 dark:border-emerald-800/60 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132] font-inter"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-emerald-300 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-2.5 bg-[#0F5132] hover:bg-[#0B3D26] disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs transition-all font-poppins flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
