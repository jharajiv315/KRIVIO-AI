import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionsApi } from '../services/api';
import { useI18n } from '../i18n/LanguageContext';
import { PLAN_CATALOGUE } from '../config/plans';
import { UsageSnapshot } from '../server/billing/entitlement_service';
import {
  Package,
  Sparkles,
  Camera,
  FileText,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface SubscriptionViewProps {
  openPricingModal: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ openPricingModal }) => {
  const { user } = useAuth();
  const { t, formatCurrency } = useI18n();
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsage = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionsApi.getUsage();
      setUsage(data);
    } catch (err: any) {
      console.warn('Failed to load usage snapshot:', err.message || err);
      setError('Unable to load current usage details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const isPro = usage?.subscription.isPro ?? (user?.subscriptionPlan === 'artisan_pro' || user?.subscriptionPlan === 'pro');
  const planName = isPro ? 'Artisan Pro' : 'Artisan Free';

  const periodEndFormatted = usage?.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const periodStartFormatted = usage?.periodStart
    ? new Date(usage.periodStart).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Account Overview Card */}
      <div className="bg-[#0F5132] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#D4AF37]/20 text-[#E6C65C] border border-[#D4AF37]/30 font-poppins">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Current Subscription</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-poppins">
              {planName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl">
              {isPro
                ? 'Your 30-day professional access pass is active with increased business capacity and AI studio tools.'
                : 'Essential tools for getting your handmade craft online. Upgrade to Artisan Pro for increased capacity.'}
            </p>
            {periodEndFormatted && (
              <div className="flex items-center gap-2 pt-1 text-xs text-emerald-200/90 font-medium">
                <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>
                  Access Period: {periodStartFormatted} – {periodEndFormatted} (Prepaid pass, renews manually)
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={openPricingModal}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isPro ? 'Renew 30-Day Access (₹299)' : 'Upgrade to Artisan Pro (₹299)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Usage Meter Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white font-poppins">
              Current Usage & Allowances
            </h2>
            <p className="text-xs text-stone-500 dark:text-emerald-300/70">
              Authoritative server-measured quota for your current 30-day allowance cycle.
            </p>
          </div>
          <button
            onClick={loadUsage}
            disabled={loading}
            title="Refresh usage"
            className="p-2 text-stone-400 hover:text-stone-700 dark:text-emerald-400/60 dark:hover:text-white rounded-xl hover:bg-stone-100 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-white dark:bg-[#13251B] rounded-2xl border border-stone-200 dark:border-emerald-800/60 flex items-center justify-center gap-2 text-xs text-stone-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#0F5132]" />
            <span>Loading authoritative usage snapshot...</span>
          </div>
        ) : error ? (
          <div className="p-5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadUsage}
              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-900 dark:text-white rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        ) : usage ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Products Card */}
            <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">
                  Products Stored
                </span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-poppins text-stone-900 dark:text-white">
                  {usage.products.current} <span className="text-xs font-normal text-stone-400 font-inter">of {usage.products.max}</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-[#0E2016] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0F5132] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (usage.products.current / usage.products.max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">
                {usage.products.remaining} creations remaining.
              </p>
            </div>

            {/* AI Text Assistance Card */}
            <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">
                  AI Text Assistance
                </span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-poppins text-stone-900 dark:text-white">
                  {usage.aiText.committed} <span className="text-xs font-normal text-stone-400 font-inter">of {usage.aiText.allowance}</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-[#0E2016] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0F5132] h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (usage.aiText.committed / usage.aiText.allowance) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">
                {usage.aiText.remaining} requests left this period.
              </p>
            </div>

            {/* AI Image Generation Card */}
            <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">
                  AI Image Studio
                </span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-poppins text-stone-900 dark:text-white">
                  {usage.aiImage.committed} <span className="text-xs font-normal text-stone-400 font-inter">of {usage.aiImage.allowance}</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-[#0E2016] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0F5132] h-full rounded-full transition-all duration-300"
                    style={{
                      width: usage.aiImage.allowance > 0
                        ? `${Math.min(100, (usage.aiImage.committed / usage.aiImage.allowance) * 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">
                {isPro
                  ? `${usage.aiImage.remaining} generations left.`
                  : 'Included on Artisan Pro.'}
              </p>
            </div>

            {/* Wholesale Quotations Card */}
            <div className="bg-white dark:bg-[#13251B] p-5 rounded-2xl border border-stone-200 dark:border-emerald-800/60 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 dark:text-emerald-200/80">
                  B2B Quotations
                </span>
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#0E2016] text-[#0F5132] dark:text-emerald-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-poppins text-stone-900 dark:text-white">
                  {usage.quotations.unlimited
                    ? 'Unlimited'
                    : `${usage.quotations.currentCount} of ${usage.quotations.trialLimit}`}
                </div>
                <div className="w-full bg-stone-100 dark:bg-[#0E2016] h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#0F5132] h-full rounded-full transition-all duration-300"
                    style={{
                      width: usage.quotations.unlimited
                        ? '100%'
                        : `${Math.min(100, (usage.quotations.currentCount / (usage.quotations.trialLimit || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70">
                {usage.quotations.unlimited
                  ? 'Unlimited invoices & PDF exports.'
                  : `${Math.max(0, usage.quotations.trialLimit - usage.quotations.currentCount)} trial quotes left.`}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Plan Capabilities & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
        {/* Artisan Free Overview */}
        <div className={`bg-white dark:bg-[#13251B] p-6 rounded-3xl border shadow-xs space-y-5 ${!isPro ? 'border-[#0F5132] ring-2 ring-[#0F5132]/20' : 'border-stone-200 dark:border-emerald-800/60'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                Artisan Free
              </h3>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">
                Essential baseline for digital onboarding
              </p>
            </div>
            {!isPro && (
              <span className="px-3 py-1 bg-stone-100 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase">
                Active
              </span>
            )}
          </div>

          <div className="text-2xl font-bold font-poppins text-stone-900 dark:text-white">
            ₹0 <span className="text-xs font-normal text-stone-400 font-inter">/ month</span>
          </div>

          <ul className="space-y-2.5 text-xs text-stone-600 dark:text-emerald-200/90 font-inter">
            {PLAN_CATALOGUE.free.featureList.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Artisan Pro Overview */}
        <div className={`bg-[#0F5132] text-white p-6 rounded-3xl border-2 border-[#D4AF37] shadow-xl space-y-5 ${isPro ? 'ring-2 ring-[#D4AF37]' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-poppins">
                Artisan Pro
              </h3>
              <p className="text-xs text-emerald-100/80">
                Comprehensive toolset for professional selling
              </p>
            </div>
            {isPro && (
              <span className="px-3 py-1 bg-[#D4AF37] text-stone-950 text-[10px] font-bold rounded-full uppercase">
                Active Pass
              </span>
            )}
          </div>

          <div className="text-2xl font-bold font-poppins text-[#D4AF37]">
            ₹299 <span className="text-xs font-normal text-emerald-100/70 font-inter">/ 30-day access</span>
          </div>

          <ul className="space-y-2.5 text-xs text-emerald-100/90 font-inter">
            {PLAN_CATALOGUE.artisan_pro.featureList.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              onClick={openPricingModal}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer text-center"
            >
              {isPro ? 'Extend Access Pass by 30 Days (₹299)' : 'Choose Artisan Pro (₹299)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
