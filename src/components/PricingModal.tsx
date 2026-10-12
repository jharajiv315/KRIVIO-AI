import React, { useState } from 'react';
import { paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { PLAN_CATALOGUE, Plan } from '../config/plans';
import {
  X,
  Sparkles,
  CheckCircle2,
  Package,
  FileText,
  Users,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { Logo } from './Logo';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activatedPeriod, setActivatedPeriod] = useState<{ startDate?: string; endDate?: string } | null>(null);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    orgName: '',
    contactName: user?.name || user?.full_name || '',
    phone: user?.phone || user?.phone_number || '',
    memberCount: '5-15',
  });

  if (!isOpen) return null;

  const isPro = user?.subscriptionPlan === 'artisan_pro' || user?.subscriptionPlan === 'pro';

  const handlePayPro = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setPaymentSuccess(false);

    try {
      const orderData = await paymentsApi.createOrder('artisan_pro');

      const isLiveRazorpay =
        Boolean((window as any).Razorpay) &&
        Boolean(orderData.keyId) &&
        !orderData.keyId.includes('rzp_test_krivio123') &&
        !orderData.keyId.includes('dummy');

      if (isLiveRazorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'KRIVIO AI',
          description: 'Artisan Pro 30-Day Access Pass',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              setErrorMessage('Incomplete payment response received from gateway.');
              setSubmitting(false);
              return;
            }

            try {
              const verifyRes = await paymentsApi.verifyPayment({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id || orderData.orderId,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                setPaymentSuccess(true);
                setActivatedPeriod({
                  startDate: verifyRes.startDate,
                  endDate: verifyRes.endDate,
                });
                await refreshUser();
              } else {
                setErrorMessage('Payment verification could not be completed.');
              }
            } catch (vErr: any) {
              setErrorMessage(vErr.message || 'Payment verification failed');
            }
            setSubmitting(false);
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
            },
          },
          prefill: {
            name: user?.name || user?.full_name || '',
            email: user?.email || '',
            contact: user?.phone || user?.phone_number || '',
          },
          theme: {
            color: '#0F5132',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        setSubmitting(false);
        setErrorMessage(
          'Online payment gateway is in test mode. A valid merchant configuration is required for live transactions.'
        );
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setErrorMessage(err.message || 'Failed to initiate checkout.');
      setSubmitting(false);
    }
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        className="bg-white dark:bg-[#13251B] rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl border border-stone-200 dark:border-emerald-800/60 relative space-y-6 max-h-[92vh] overflow-y-auto font-inter"
      >
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-stone-400 dark:text-emerald-400/60 hover:text-stone-700 dark:hover:text-emerald-100 hover:bg-stone-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="text-center py-6 sm:py-8 space-y-5 animate-in zoom-in-95 duration-200 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#D4AF37]/20 text-[#8C6D1F] dark:text-[#E6C65C] tracking-wide uppercase">
                Access Activated
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-poppins">
                Welcome to Artisan Pro
              </h2>
              <p className="text-xs text-stone-600 dark:text-emerald-200/80 font-inter">
                Your prepaid 30-day access period is now active. All entitlements have been updated server-side.
              </p>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-[#0E2016] rounded-2xl border border-stone-200 dark:border-emerald-900/40 text-left space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>Plan:</span>
                <span className="font-semibold text-stone-900 dark:text-white">Artisan Pro</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>Access Period:</span>
                <span className="font-semibold text-stone-900 dark:text-white">
                  30 Days (Renew Manually)
                </span>
              </div>
              {activatedPeriod?.endDate && (
                <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                  <span>Valid Until:</span>
                  <span className="font-semibold text-stone-900 dark:text-white">
                    {new Date(activatedPeriod.endDate).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer"
            >
              Continue to Workspace
            </button>
          </div>
        ) : showEnquiryForm ? (
          /* SHG Growth Group Enquiry Form */
          <div className="max-w-lg mx-auto space-y-5 py-4">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setShowEnquiryForm(false)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:text-emerald-300/70 dark:hover:text-white flex items-center gap-1 cursor-pointer mb-2"
              >
                ← Back to Plans
              </button>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white font-poppins">
                SHG Growth & Group Onboarding
              </h2>
              <p className="text-xs text-stone-600 dark:text-emerald-200/80">
                For artisan collectives and self-help groups managing products together. Team functionality is currently offered with dedicated assisted onboarding.
              </p>
            </div>

            {enquirySent ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 dark:text-emerald-300 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  Enquiry Received
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  Our team will contact {enquiryData.contactName || 'you'} within 1-2 business days to set up your collective workspace.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 px-6 py-2.5 bg-[#0F5132] text-white text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1">
                    Organization / SHG Name
                  </label>
                  <input
                    type="text"
                    required
                    value={enquiryData.orgName}
                    onChange={(e) => setEnquiryData({ ...enquiryData, orgName: e.target.value })}
                    placeholder="e.g. Gramin Hastkala Vikas Sangh"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-emerald-800 bg-white dark:bg-[#0E2016] text-stone-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1">
                      Lead Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryData.contactName}
                      onChange={(e) => setEnquiryData({ ...enquiryData, contactName: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-emerald-800 bg-white dark:bg-[#0E2016] text-stone-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={enquiryData.phone}
                      onChange={(e) => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-emerald-800 bg-white dark:bg-[#0E2016] text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-emerald-200 mb-1">
                    Estimated Artisan Members
                  </label>
                  <select
                    value={enquiryData.memberCount}
                    onChange={(e) => setEnquiryData({ ...enquiryData, memberCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-emerald-800 bg-white dark:bg-[#0E2016] text-stone-900 dark:text-white"
                  >
                    <option value="3-5">3 - 5 Artisans</option>
                    <option value="5-15">5 - 15 Artisans</option>
                    <option value="15-50">15 - 50 Artisans</option>
                    <option value="50+">50+ Artisans (Large Collective)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer font-poppins"
                >
                  Submit Group Inquiry
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Normal Pricing Catalogue Grid */
          <>
            <div className="flex flex-col items-center text-center space-y-2">
              <Logo variant="horizontal" size="md" showTagline={true} />
              <h2 id="pricing-modal-title" className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white font-poppins">
                Plans & Commercial Capacity
              </h2>
              <p className="text-xs text-stone-600 dark:text-emerald-200/70 font-inter max-w-lg">
                Prepaid 30-day access with clear allowances and predictable manual renewal. No hidden auto-charges.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl text-xs bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Three-Column Plan Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 pt-2">
              {/* 1. Artisan Free */}
              <div className="bg-stone-50 dark:bg-[#0E2016] p-5 rounded-2xl border border-stone-200 dark:border-emerald-900/40 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                      {PLAN_CATALOGUE.free.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-emerald-300/70 min-h-8">
                      {PLAN_CATALOGUE.free.subtitle}
                    </p>
                  </div>

                  <div className="text-2xl font-bold font-poppins text-stone-900 dark:text-white">
                    ₹0 <span className="text-xs font-normal text-stone-400 font-inter">/ 30-day period</span>
                  </div>

                  <ul className="space-y-2 text-xs text-stone-600 dark:text-emerald-200/90 font-inter">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Up to 5 stored products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>10 AI text & mentor requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Studio composition canvas tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Basic catalogue export</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Quotation trial (2 quotes)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 text-center text-xs font-medium text-stone-500 dark:text-emerald-400/60 bg-stone-100 dark:bg-emerald-950/40 rounded-xl">
                    {!isPro ? 'Current Plan' : 'Free Tier'}
                  </div>
                </div>
              </div>

              {/* 2. Artisan Pro */}
              <div className="bg-[#0F5132] text-white p-5 rounded-2xl border-2 border-[#D4AF37] shadow-lg flex flex-col justify-between space-y-4 relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white font-poppins">
                        {PLAN_CATALOGUE.artisan_pro.name}
                      </h3>
                      <p className="text-[11px] text-emerald-100/80 min-h-8">
                        {PLAN_CATALOGUE.artisan_pro.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="text-2xl font-bold font-poppins text-[#D4AF37]">
                    ₹299 <span className="text-xs font-normal text-emerald-100/70 font-inter">/ 30-day pass</span>
                  </div>

                  <ul className="space-y-2 text-xs text-emerald-100/90 font-inter">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>Prepare up to 100 products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>75 AI text & mentor requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>5 paid AI image generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>Professional quotations & PDFs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>Destination-specific exports</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handlePayPro}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#C29F2B] text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all font-poppins cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>{isPro ? 'Renew 30-Day Pass (₹299)' : 'Choose Artisan Pro (₹299)'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. SHG Growth */}
              <div className="bg-stone-50 dark:bg-[#0E2016] p-5 rounded-2xl border border-stone-200 dark:border-emerald-900/40 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
                      {PLAN_CATALOGUE.shg_growth.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-emerald-300/70 min-h-8">
                      {PLAN_CATALOGUE.shg_growth.subtitle}
                    </p>
                  </div>

                  <div className="text-2xl font-bold font-poppins text-stone-900 dark:text-white">
                    ₹999 <span className="text-xs font-normal text-stone-400 font-inter">/ proposed 30 days</span>
                  </div>

                  <ul className="space-y-2 text-xs text-stone-600 dark:text-emerald-200/90 font-inter">
                    <li className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Up to 3 authorized member seats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>300 organization-owned products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>250 shared AI text & mentor requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>20 shared AI product image generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>Assisted group setup & onboarding</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryForm(true)}
                    className="w-full py-2.5 bg-stone-200 hover:bg-stone-300 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-stone-800 dark:text-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer font-poppins text-center"
                  >
                    Enquire About Group Access
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-emerald-900/40 text-center text-[11px] text-stone-500 dark:text-emerald-400/60 font-inter space-y-1">
              <p>
                All paid passes provide 30 days of prepaid access. Early manual renewal extends your existing period without losing remaining days.
              </p>
              <p>
                Secure payments processed by Razorpay. Prices exclude separately applicable GST.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
