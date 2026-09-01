import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../services/api';
import { useI18n } from '../i18n/LanguageContext';
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SubscriptionViewProps {
  openPricingModal: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ openPricingModal }) => {
  const { user, refreshUser } = useAuth();
  const { t, formatCurrency } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSimulateUpgrade = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const order = await paymentsApi.createOrder('pro', 299);
      // Simulate successful payment verification
      const verifyRes = await paymentsApi.verifyPayment({
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpayOrderId: order.orderId,
      });

      if (verifyRes.success) {
        await refreshUser();
        setStatusMessage(t('subscription.active'));
      }
    } catch (err: any) {
      setStatusMessage(err.message || t('errors.general'));
    } finally {
      setIsProcessing(false);
    }
  };

  const isPro = user?.subscriptionPlan === 'pro';

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 font-inter">
      {/* Header Banner */}
      <div className="bg-[#0F5132] text-white p-5 sm:p-8 rounded-3xl shadow-xl border border-[#2E7D32]/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-stone-950 font-poppins">
              {t('subscription.title')}
            </span>
            <h1 className="text-xl sm:text-3xl font-bold font-poppins">
              {isPro ? `${t('subscription.proPlan')} — ${t('subscription.active')}` : t('subscription.freePlan')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl font-inter">
              {isPro
                ? t('pricing.proSubtitle')
                : t('pricing.freeSubtitle')}
            </p>
          </div>

          {!isPro && (
            <button
              onClick={openPricingModal}
              className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 shrink-0 transition-all font-poppins cursor-pointer active:scale-98"
            >
              <Crown className="w-4 h-4" />
              <span>{t('subscription.upgradeToPro')} ({formatCurrency(299)}/{t('pricing.perMonth')})</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl text-xs font-semibold bg-[#0F5132]/10 dark:bg-emerald-950 border border-[#0F5132]/20 dark:border-emerald-800 text-[#0F5132] dark:text-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Plans Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Free Plan */}
        <div className={`bg-white dark:bg-[#13251B] p-5 sm:p-8 rounded-3xl border shadow-xs space-y-6 ${!isPro ? 'border-[#0F5132] ring-2 ring-[#0F5132]/20' : 'border-[#0F5132]/15 dark:border-emerald-800/60'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-poppins">{t('subscription.freePlan')}</h3>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">{t('pricing.freeSubtitle')}</p>
            </div>
            {!isPro && (
              <span className="px-3 py-1 bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase font-poppins">
                {t('subscription.active')}
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-poppins">
            ₹0 <span className="text-xs font-normal text-stone-400 font-inter">/ {t('pricing.perMonth')}</span>
          </div>

          <ul className="space-y-3 text-xs text-stone-600 dark:text-emerald-200/80 font-inter">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>{t('pricing.freeFeature1')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>{t('pricing.freeFeature2')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>{t('pricing.freeFeature3')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>{t('pricing.freeFeature4')}</span>
            </li>
          </ul>

          {isPro && (
            <button
              disabled
              className="w-full py-3 bg-stone-100 dark:bg-[#183023] text-stone-400 text-xs font-bold rounded-xl cursor-not-allowed font-poppins"
            >
              {t('subscription.freePlan')}
            </button>
          )}
        </div>

        {/* Pro Entrepreneur Plan */}
        <div className={`bg-[#0E2016] text-white p-5 sm:p-8 rounded-3xl border border-[#D4AF37]/50 shadow-xl space-y-6 relative overflow-hidden ${isPro ? 'ring-2 ring-[#D4AF37]' : ''}`}>
          <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[10px] px-4 py-1 rounded-bl-xl uppercase tracking-wider font-poppins">
            {t('pricing.recommendedBadge')}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base sm:text-lg font-bold font-poppins text-white">{t('subscription.proPlan')}</h3>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">{t('pricing.proSubtitle')}</p>
            </div>
            {isPro && (
              <span className="px-3 py-1 bg-[#D4AF37] text-stone-950 text-[10px] font-bold rounded-full uppercase font-poppins">
                {t('subscription.active')}
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold font-poppins text-[#D4AF37]">
            {formatCurrency(299)} <span className="text-xs font-normal text-emerald-200/70 font-inter">/ {t('pricing.perMonth')}</span>
          </div>

          <ul className="space-y-3 text-xs text-emerald-100/90 font-inter">
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('pricing.proFeature1')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('pricing.proFeature2')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('pricing.proFeature3')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('pricing.proFeature4')}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>{t('pricing.proFeature5')}</span>
            </li>
          </ul>

          {!isPro ? (
            <button
              onClick={openPricingModal}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer active:scale-98"
            >
              {t('subscription.upgradeToPro')} ({formatCurrency(299)}/{t('pricing.perMonth')})
            </button>
          ) : (
            <div className="p-3 bg-[#0F5132]/60 rounded-xl border border-[#2E7D32]/60 text-center text-xs font-bold text-emerald-200 font-poppins">
              ✓ {t('subscription.active')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

