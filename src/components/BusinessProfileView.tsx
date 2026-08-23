import React, { useEffect, useState } from 'react';
import { businessProfileApi } from '../services/api';
import { BusinessProfile } from '../types';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  Languages,
  Store,
} from 'lucide-react';

export const BusinessProfileView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    businessName: '',
    businessCategory: 'Handicrafts & Rural Craft',
    businessDescription: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    state: 'Bihar',
    district: 'Madhubani',
    villageCity: '',
    pinCode: '',
    primaryLanguage: 'Hindi',
    businessLogo: '',
    yearsInBusiness: 2,
    website: '',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '',
    },
    gstNumber: '',
    businessRegistration: '',
  });

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      const res = await businessProfileApi.get();
      if (res.businessProfile && res.businessProfile.businessName) {
        setProfile({
          ...res.businessProfile,
          socialMediaLinks: res.businessProfile.socialMediaLinks || { facebook: '', instagram: '', whatsapp: '' },
        });
      }
    } catch (err: any) {
      console.error('Failed to load business profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.businessName?.trim()) {
      setErrorMsg('Business Name is required.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await businessProfileApi.create(profile);
      if (res.businessProfile) {
        setProfile(res.businessProfile);
        setSuccessMsg('Business Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update business profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-2xl font-display border border-emerald-200 dark:border-emerald-800 shrink-0">
            {profile.businessLogo ? (
              <img src={profile.businessLogo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Store className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              {profile.businessName || 'Your Business Profile'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage core enterprise identity, location, owner contacts, and official registration details.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-102 active:scale-98 disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-xs text-red-800 dark:text-red-300 font-medium">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Business Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Enterprise Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.businessName || ''}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                placeholder="e.g. Devi Handlooms & Terracotta"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Business Category
              </label>
              <select
                value={profile.businessCategory || 'Handicrafts & Rural Craft'}
                onChange={(e) => setProfile({ ...profile, businessCategory: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Handicrafts & Rural Craft">Handicrafts & Rural Craft</option>
                <option value="Textiles, Weaving & Handlooms">Textiles, Weaving & Handlooms</option>
                <option value="Pottery, Clay & Home Decor">Pottery, Clay & Home Decor</option>
                <option value="Organic Agriculture & Spices">Organic Agriculture & Spices</option>
                <option value="Food Products & Preserves">Food Products & Preserves</option>
                <option value="Jewelry & Traditional Ornaments">Jewelry & Traditional Ornaments</option>
                <option value="Woodcraft & Furniture">Woodcraft & Furniture</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Business Story & Description
              </label>
              <textarea
                rows={3}
                value={profile.businessDescription || ''}
                onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                placeholder="Describe your heritage craft, specialty products, or artisan team background..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Years in Business
              </label>
              <input
                type="number"
                min="0"
                value={profile.yearsInBusiness || 1}
                onChange={(e) => setProfile({ ...profile, yearsInBusiness: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Operating Language
              </label>
              <select
                value={profile.primaryLanguage || 'Hindi'}
                onChange={(e) => setProfile({ ...profile, primaryLanguage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="English">English</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Business Logo Image URL
              </label>
              <input
                type="text"
                value={profile.businessLogo || ''}
                onChange={(e) => setProfile({ ...profile, businessLogo: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Owner & Location Contacts */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Owner Details & Location
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Owner / Representative Name
              </label>
              <input
                type="text"
                value={profile.ownerName || ''}
                onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phoneNumber || ''}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="business@krivio.ai"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                State
              </label>
              <input
                type="text"
                value={profile.state || ''}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                placeholder="e.g. Bihar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                District
              </label>
              <input
                type="text"
                value={profile.district || ''}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                placeholder="e.g. Madhubani"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Village / City
              </label>
              <input
                type="text"
                value={profile.villageCity || ''}
                onChange={(e) => setProfile({ ...profile, villageCity: e.target.value })}
                placeholder="e.g. Ranti Village"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                PIN Code
              </label>
              <input
                type="text"
                value={profile.pinCode || ''}
                onChange={(e) => setProfile({ ...profile, pinCode: e.target.value })}
                placeholder="847211"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Optional Business Registrations & Web */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Official Registrations & Web Links (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                GST Number (Optional)
              </label>
              <input
                type="text"
                value={profile.gstNumber || ''}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                placeholder="e.g. 10AAAAA0000A1Z5"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Udyam / SHG Registration ID (Optional)
              </label>
              <input
                type="text"
                value={profile.businessRegistration || ''}
                onChange={(e) => setProfile({ ...profile, businessRegistration: e.target.value })}
                placeholder="UDYAM-BR-00-1234567"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Website URL (Optional)
              </label>
              <input
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://www.devihandlooms.in"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                WhatsApp Business Number (Optional)
              </label>
              <input
                type="text"
                value={profile.socialMediaLinks?.whatsapp || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialMediaLinks: { ...profile.socialMediaLinks, whatsapp: e.target.value },
                  })
                }
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Business Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
