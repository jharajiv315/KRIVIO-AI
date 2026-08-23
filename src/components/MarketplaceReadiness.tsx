import React, { useEffect, useState } from 'react';
import { marketplaceApi } from '../services/api';
import { ChannelRecommendation } from '../types';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';

export const MarketplaceReadiness: React.FC = () => {
  const [channels, setChannels] = useState<ChannelRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await marketplaceApi.getRecommendations();
      setChannels(res.channels);
    } catch (err) {
      console.error('Failed to fetch marketplace channels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const ondOnboardingSteps = [
    { title: 'Create Udyam / GST Registration', desc: 'Free micro-enterprise registration for artisans and SHGs.', status: 'done' },
    { title: 'Prepare 3 Studio Product Listings', desc: 'Photos with clear lighting and auto-generated Gemini descriptions.', status: 'done' },
    { title: 'Choose ONDC Seller App', desc: 'Select Mystore, Paytm Seller, or Plotch to host your catalog.', status: 'next' },
    { title: 'Link Bank Account for Direct Payouts', desc: 'Verify IFSC code for immediate customer payments.', status: 'pending' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              Marketplace Channel Advisor
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full">
              ONDC Network
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare national selling networks, verify channel eligibility, and complete step-by-step onboarding for direct sales.
          </p>
        </div>
      </div>

      {/* ONDC Onboarding Step-by-Step Checklist */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg">
              🌐
            </div>
            <div>
              <h3 className="text-base font-bold font-display">
                ONDC (Open Network for Digital Commerce) Fast-Track
              </h3>
              <p className="text-xs text-emerald-300">
                Government-backed network connecting rural craftspeople to buyers across India
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-800/80 text-emerald-200 rounded-full text-xs font-semibold hidden sm:inline">
            75% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {ondOnboardingSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                step.status === 'done'
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-100'
                  : step.status === 'next'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-100 ring-2 ring-amber-400/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Step 0{idx + 1}
                </span>
                {step.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <h4 className="text-xs font-bold">{step.title}</h4>
              <p className="text-[11px] opacity-80 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selling Channels Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Recommended Selling Channels
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((ch) => (
              <div
                key={ch.channelId}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-2xl flex items-center justify-center shrink-0">
                      {ch.logo}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {ch.channelName}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{ch.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Fit Score</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-display">
                      {ch.fitScore}%
                    </span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Key Channel Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {ch.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px]">
                    Channel Onboarding Requirements:
                  </span>
                  <p className="text-slate-500 dark:text-slate-400">
                    {ch.requirements.join(' • ')}
                  </p>
                </div>

                {/* Eligibility & CTA */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {ch.isEligible ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> Eligible to Apply
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Needs 1 More Listing
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => alert(`Starting application process for ${ch.channelName}`)}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Start Onboarding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
