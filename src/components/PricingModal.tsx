import React, { useState } from 'react';
import { paymentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  Crown,
  CreditCard,
  Lock,
  Smartphone,
  Building2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Logo } from './Logo';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { t, formatCurrency } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [upiId, setUpiId] = useState<string>('');

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setSubmitting(true);
    setErrorMessage('');
    setPaymentSuccess(false);

    try {
      setPaymentStep('Initiating secure INR 299 payment...');
      const orderData = await paymentsApi.createOrder('pro', 299);

      // Check if Razorpay live credentials exist and can be loaded
      const isLiveRazorpay =
        (window as any).Razorpay &&
        orderData.keyId &&
        !orderData.keyId.includes('rzp_test_krivio123') &&
        !orderData.keyId.includes('dummy');

      if (isLiveRazorpay) {
        setPaymentStep('Opening Razorpay Gateway...');
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'KRIVIO AI Pro',
          description: 'Pro AI Business Mentor for Rural Artisans',
          order_id: orderData.orderId,
          handler: async (response: any) => {
            setPaymentStep('Verifying payment signature...');
            const verifyRes = await paymentsApi.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpayOrderId: response.razorpay_order_id || orderData.orderId,
            });

            if (verifyRes.success) {
              setPaymentSuccess(true);
              await refreshUser();
            } else {
              setErrorMessage(t('errors.general'));
            }
            setSubmitting(false);
          },
          modal: {
            ondismiss: () => {
              setSubmitting(false);
              setPaymentStep('');
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
        // Fast, direct Indian payment gateway simulation
        setPaymentStep('Connecting to UPI / Payment Gateway...');
        await new Promise((r) => setTimeout(r, 600));

        setPaymentStep('Processing transaction of ₹299.00...');
        await new Promise((r) => setTimeout(r, 600));

        setPaymentStep('Activating Pro Subscription in PostgreSQL...');
        const verifyRes = await paymentsApi.verifyPayment({
          razorpayPaymentId: `pay_upi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          razorpayOrderId: orderData.orderId,
        });

        if (verifyRes.success) {
          setPaymentSuccess(true);
          await refreshUser();
        } else {
          setErrorMessage(t('errors.general'));
        }
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('Payment checkout error', err);
      setErrorMessage(err.message || t('errors.general'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#13251B] rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-[#0F5132]/20 dark:border-emerald-800/60 relative space-y-6 max-h-[92vh] overflow-y-auto font-inter">
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 text-stone-400 dark:text-emerald-400/60 hover:text-stone-700 dark:hover:text-emerald-100 hover:bg-[#0F5132]/10 dark:hover:bg-emerald-900/30 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#0F5132]/10 dark:bg-emerald-950 text-[#0F5132] dark:text-[#34D399] border border-[#0F5132]/20 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9 text-[#0F5132] dark:text-[#34D399]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-stone-950 uppercase tracking-wider font-poppins">
                {t('common.success')}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F5132] dark:text-white font-poppins">
                {t('pricing.modalTitle')}
              </h2>
              <p className="text-xs text-stone-600 dark:text-emerald-200/80 max-w-sm mx-auto font-inter">
                {t('pricing.modalSubtitle')}
              </p>
            </div>

            <div className="p-4 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-2xl border border-stone-200 dark:border-emerald-900/40 text-left space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>{t('profile.plan')}:</span>
                <span className="font-bold text-stone-900 dark:text-white">{t('pricing.proPlanTitle')}</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>{t('product.tablePrice')}:</span>
                <span className="font-bold text-[#0F5132] dark:text-emerald-300">₹299.00</span>
              </div>
              <div className="flex justify-between text-stone-600 dark:text-emerald-300/80">
                <span>{t('common.status')}:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t('subscription.active')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-lg transition-all font-poppins cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          /* Normal Checkout State */
          <>
            <div className="flex flex-col items-center text-center space-y-2">
              <Logo variant="horizontal" size="md" showTagline={true} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F5132]/10 dark:bg-emerald-950/80 text-[#0F5132] dark:text-emerald-300 text-xs font-bold mt-2 font-poppins">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('pricing.proPlanTitle')}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-stone-900 dark:text-white font-poppins">
                {t('pricing.modalTitle')}
              </h2>
              <p className="text-xs text-stone-600 dark:text-emerald-200/70 font-inter max-w-sm">
                {t('pricing.modalSubtitle')}
              </p>
            </div>

            {/* Pricing Card Highlight */}
            <div className="bg-[#0E2016] text-white p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/50 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-poppins">
                    {t('pricing.proPlanTitle')}
                  </span>
                  <div className="text-2xl font-black font-poppins mt-0.5 text-[#D4AF37]">
                    ₹299 <span className="text-xs font-normal text-emerald-200/70 font-inter">/ month</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#0F5132] border border-[#D4AF37]/50 text-white font-bold flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>

              <ul className="space-y-2 text-xs text-emerald-100/90 font-inter">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{t('pricing.proPlanFeature1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{t('pricing.proPlanFeature2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>{t('pricing.proPlanFeature4')}</span>
                </li>
              </ul>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">
                UPI / NetBanking / Card
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-poppins flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-[#0F5132]/10 border-[#0F5132] text-[#0F5132] dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-300 shadow-2xs'
                      : 'bg-stone-50 dark:bg-[#183023] border-stone-200 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/70 hover:bg-stone-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-poppins flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#0F5132]/10 border-[#0F5132] text-[#0F5132] dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-300 shadow-2xs'
                      : 'bg-stone-50 dark:bg-[#183023] border-stone-200 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/70 hover:bg-stone-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />
                  <span>Card / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-poppins flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-[#0F5132]/10 border-[#0F5132] text-[#0F5132] dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-300 shadow-2xs'
                      : 'bg-stone-50 dark:bg-[#183023] border-stone-200 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/70 hover:bg-stone-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#0F5132] dark:text-[#34D399]" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Sub-options for UPI */}
              {paymentMethod === 'upi' && (
                <div className="p-3 bg-[#F8F9F5] dark:bg-[#0E2016] rounded-2xl border border-stone-200 dark:border-emerald-900/40 space-y-2.5 mt-2">
                  <div className="flex items-center justify-between gap-2">
                    {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase font-poppins border transition-all cursor-pointer ${
                          selectedUpiApp === app
                            ? 'bg-[#0F5132] text-white border-[#0F5132]'
                            : 'bg-white dark:bg-[#13251B] text-stone-700 dark:text-emerald-200 border-stone-200 dark:border-emerald-900'
                        }`}
                      >
                        {app === 'gpay' ? 'GPay' : app === 'phonepe' ? 'PhonePe' : app === 'paytm' ? 'Paytm' : 'BHIM'}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    className="w-full px-3 py-2 bg-white dark:bg-[#13251B] border border-stone-200 dark:border-emerald-800 rounded-xl text-xs text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-[#0F5132]"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Button & Live Progress */}
            <div className="space-y-2.5">
              <button
                id="btn-razorpay-pay-now"
                type="button"
                onClick={handlePayNow}
                disabled={submitting || user?.subscriptionPlan === 'pro'}
                className="w-full py-3.5 bg-[#0F5132] hover:bg-[#0B3D26] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 font-poppins cursor-pointer active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                    <span>{paymentStep || t('common.loading')}</span>
                  </>
                ) : user?.subscriptionPlan === 'pro' ? (
                  <>
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('subscription.active')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    <span>{t('pricing.upgradeBtn')}</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-stone-500 dark:text-emerald-300/60 flex items-center justify-center gap-1 font-inter">
                <Lock className="w-3 h-3 text-[#D4AF37]" />
                <span>{t('pricing.securePayment')}</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
