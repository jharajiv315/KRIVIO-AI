import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../services/api';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Zap,
  Mic,
  Package,
  Camera,
  Store,
  HelpCircle,
} from 'lucide-react';

interface SubscriptionViewProps {
  openPricingModal: () => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ openPricingModal }) => {
  const { user, refreshUser } = useAuth();
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
        setStatusMessage('Your account is now upgraded to Pro Member!');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Payment simulation failed.');
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
              Subscription Management
            </span>
            <h1 className="text-xl sm:text-3xl font-bold font-poppins">
              {isPro ? 'Pro Member Workspace Active' : 'Free Artisan Plan'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 max-w-xl font-inter">
              {isPro
                ? 'Enjoy unlimited Voice AI mentor sessions, AI product studio generation, camera photo enhancements, and priority ONDC syndication.'
                : 'Unlock full AI capabilities for your rural business including unlimited voice mentor chats and automated product cataloging.'}
            </p>
          </div>

          {!isPro && (
            <button
              onClick={openPricingModal}
              className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 shrink-0 transition-all font-poppins cursor-pointer active:scale-98"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro (₹299/mo)</span>
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
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-poppins">Free Starter Plan</h3>
              <p className="text-xs text-stone-500 dark:text-emerald-300/70">For newly onboarding rural artisans & weavers</p>
            </div>
            {!isPro && (
              <span className="px-3 py-1 bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase font-poppins">
                Current Plan
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white font-poppins">
            ₹0 <span className="text-xs font-normal text-stone-400 font-inter">/ forever</span>
          </div>

          <ul className="space-y-3 text-xs text-stone-600 dark:text-emerald-200/80 font-inter">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>Up to 5 AI-assisted product listings</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>10 Voice AI Mentor queries per month</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>Basic photo lighting guidance</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399] shrink-0" />
              <span>ONDC & Amazon Saheli readiness checklist</span>
            </li>
          </ul>

          {isPro && (
            <button
              disabled
              className="w-full py-3 bg-stone-100 dark:bg-[#183023] text-stone-400 text-xs font-bold rounded-xl cursor-not-allowed font-poppins"
            >
              Default Starter Tier
            </button>
          )}
        </div>

        {/* Pro Entrepreneur Plan */}
        <div className={`bg-[#0E2016] text-white p-5 sm:p-8 rounded-3xl border border-[#D4AF37]/50 shadow-xl space-y-6 relative overflow-hidden ${isPro ? 'ring-2 ring-[#D4AF37]' : ''}`}>
          <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[10px] px-4 py-1 rounded-bl-xl uppercase tracking-wider font-poppins">
            RECOMMENDED FOR GROWING SHGs
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base sm:text-lg font-bold font-poppins text-white">Pro Entrepreneur Plan</h3>
              </div>
              <p className="text-xs text-emerald-200/70 mt-0.5">Full AI suite for maximum sales expansion</p>
            </div>
            {isPro && (
              <span className="px-3 py-1 bg-[#D4AF37] text-stone-950 text-[10px] font-bold rounded-full uppercase font-poppins">
                Active Plan
              </span>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold font-poppins text-[#D4AF37]">
            ₹299 <span className="text-xs font-normal text-emerald-200/70 font-inter">/ month</span>
          </div>

          <ul className="space-y-3 text-xs text-emerald-100/90 font-inter">
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Unlimited Voice & Text AI Mentor in 7 Regional Languages</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Unlimited Product Studio listings with auto AI details</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Advanced smartphone camera lighting & background analysis</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Priority ONDC, Amazon Karigar & GeM fast-track</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Automated Cloud Catalog Backup & 1-Click Export</span>
            </li>
          </ul>

          {!isPro ? (
            <button
              onClick={openPricingModal}
              className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#C29F2B] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer active:scale-98"
            >
              Upgrade to Pro Plan (₹299/mo)
            </button>
          ) : (
            <div className="p-3 bg-[#0F5132]/60 rounded-xl border border-[#2E7D32]/60 text-center text-xs font-bold text-emerald-200 font-poppins">
              ✓ Pro Membership Active on Your Enterprise Account
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

