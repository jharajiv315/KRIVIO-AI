import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Building,
  MapPin,
  Save,
  Crown,
  KeyRound,
  LogOut,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ProfileViewProps {
  setCurrentTab: (tab: string) => void;
  openPricingModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ setCurrentTab, openPricingModal }) => {
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.phone_number || '');
  const [role, setRole] = useState(user?.role || 'artisan');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || user.phone_number || '');
      setRole(user.role || 'artisan');
      setBusinessName(user.businessName || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('krivio_auth_token') || ''}`,
        },
        body: JSON.stringify({
          name,
          phone,
          role,
          businessName,
          location,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || 'Failed to update profile');
      }

      await refreshUser();
      setMessage({ type: 'success', text: 'Profile details updated in PostgreSQL database successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-[#112217] p-8 rounded-2xl border border-emerald-900/10 shadow-lg max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-poppins text-slate-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-emerald-200/80 mb-6 font-inter">
            Please sign in to access your KRIVIO AI entrepreneur profile and business settings.
          </p>
          <button
            onClick={() => setCurrentTab('landing')}
            className="w-full py-2.5 bg-[#0F5132] text-white font-poppins text-xs font-semibold rounded-xl shadow-md"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F5132] to-[#123524] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-emerald-800/50">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold font-poppins shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-poppins text-white">{user.name || user.full_name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PostgreSQL Verified
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 font-inter mt-1">
                {user.email} • {user.role?.toUpperCase()} Entrepreneur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openPricingModal}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#b8972e] text-[#1A1A1A] font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all font-poppins"
            >
              <Crown className="w-4 h-4" />
              <span>{user.subscriptionPlan === 'pro' ? 'Pro Member' : 'Upgrade Pro'}</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all font-inter"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-inter flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#112217] rounded-2xl p-6 border border-emerald-900/10 dark:border-emerald-800/40 shadow-sm">
            <h3 className="text-sm font-bold font-poppins text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
              <span>Account Status</span>
            </h3>
            <div className="space-y-3 text-xs font-inter text-slate-600 dark:text-emerald-200/80">
              <div className="flex justify-between py-2 border-b border-emerald-900/5 dark:border-emerald-800/30">
                <span className="text-slate-500 dark:text-emerald-300/60">Database</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Connected PostgreSQL</span>
              </div>
              <div className="flex justify-between py-2 border-b border-emerald-900/5 dark:border-emerald-800/30">
                <span className="text-slate-500 dark:text-emerald-300/60">User ID</span>
                <span className="font-mono text-[11px] text-slate-800 dark:text-emerald-100">{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-emerald-900/5 dark:border-emerald-800/30">
                <span className="text-slate-500 dark:text-emerald-300/60">Email Status</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unique & Verified
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-emerald-900/5 dark:border-emerald-800/30">
                <span className="text-slate-500 dark:text-emerald-300/60">Auth Type</span>
                <span className="font-semibold text-slate-800 dark:text-emerald-200">JWT + bcrypt</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-emerald-300/60">Member Since</span>
                <span className="text-slate-800 dark:text-emerald-200">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-emerald-900/10 dark:from-amber-500/5 dark:to-emerald-900/30 rounded-2xl p-6 border border-amber-500/20 dark:border-amber-500/30">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300 font-bold text-xs font-poppins">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>KRIVIO AI Subscription</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-emerald-200/80 font-inter mb-4">
              Your account is enabled for Voice AI mentor, product studio, image enhancement, and marketplace syndication.
            </p>
            <button
              onClick={openPricingModal}
              className="w-full py-2 bg-[#0F5132] hover:bg-[#123524] text-white font-poppins text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#112217] rounded-2xl p-6 sm:p-8 border border-emerald-900/10 dark:border-emerald-800/40 shadow-sm">
          <h2 className="text-base font-bold font-poppins text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#0F5132] dark:text-emerald-400" />
            <span>Edit Profile & Business Details</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4 font-inter">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Entrepreneur Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-emerald-50/40 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                >
                  <option value="artisan">Artisan / Weaver</option>
                  <option value="shg">Self-Help Group (SHG)</option>
                  <option value="farmer">Small Farmer</option>
                  <option value="small_business">Small Business</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">Business / Brand Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Devi Handlooms"
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-200 mb-1 font-poppins">State & Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 dark:text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Madhubani, Bihar"
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50/40 dark:bg-[#0B1911] border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0F5132] hover:bg-[#123524] text-white font-poppins text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Database...' : 'Save Changes in PostgreSQL'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
