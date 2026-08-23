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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900">
              Subscription Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              {isPro ? 'Pro Member Workspace Active' : 'Free Artisan Plan'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isPro
                ? 'Enjoy unlimited Voice AI mentor sessions, AI product studio generation, camera photo enhancements, and priority ONDC syndication.'
                : 'Unlock full AI capabilities for your rural business including unlimited voice mentor chats and automated product cataloging.'}
            </p>
          </div>

          {!isPro && (
            <button
              onClick={openPricingModal}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b8972e] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 shrink-0 transition-all font-poppins"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro (₹299/mo)</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Plans Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border shadow-xs space-y-6 ${!isPro ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Free Starter Plan</h3>
              <p className="text-xs text-slate-500">For newly onboarding rural artisans & weavers</p>
            </div>
            {!isPro && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                Current Plan
              </span>
            )}
          </div>

          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            ₹0 <span className="text-xs font-normal text-slate-400">/ forever</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Up to 5 AI-assisted product listings</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>10 Voice AI Mentor queries per month</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Basic photo lighting guidance</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ONDC & Amazon Saheli readiness checklist</span>
            </li>
          </ul>

          {isPro && (
            <button
              disabled
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Default Starter Tier
            </button>
          )}
        </div>

        {/* Pro Entrepreneur Plan */}
        <div className={`bg-gradient-to-b from-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/50 shadow-xl space-y-6 relative overflow-hidden ${isPro ? 'ring-2 ring-amber-400' : ''}`}>
          <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#1A1A1A] font-extrabold text-[10px] px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            RECOMMENDED FOR GROWING SHGs
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-display text-white">Pro Entrepreneur Plan</h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Full AI suite for maximum sales expansion</p>
            </div>
            {isPro && (
              <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full uppercase">
                Active Plan
              </span>
            )}
          </div>

          <div className="text-3xl font-extrabold font-display text-amber-300">
            ₹299 <span className="text-xs font-normal text-slate-300">/ month</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-200">
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Unlimited Voice & Text AI Mentor in Hindi/English</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Unlimited Product Studio listings with auto AI details</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Advanced smartphone camera image background cleanup</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Priority ONDC & GeM channel onboarding support</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>PostgreSQL data backup & export</span>
            </li>
          </ul>

          {!isPro ? (
            <button
              onClick={openPricingModal}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#b8972e] text-[#1A1A1A] font-extrabold text-xs rounded-xl shadow-md transition-all font-poppins"
            >
              Upgrade Now via Razorpay (₹299)
            </button>
          ) : (
            <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-500/40 text-center text-xs font-bold text-emerald-300">
              ✓ Pro Membership Active on PostgreSQL Account
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
