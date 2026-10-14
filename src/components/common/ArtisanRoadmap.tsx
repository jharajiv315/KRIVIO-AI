import React from 'react';
import { Check, ArrowRight, Package, Camera, Store, UserCheck } from 'lucide-react';

export interface ArtisanRoadmapProps {
  completedSteps: {
    profile: boolean;
    product: boolean;
    photo: boolean;
    storefront: boolean;
  };
  onNavigateTab: (tab: string) => void;
}

export const ArtisanRoadmap: React.FC<ArtisanRoadmapProps> = ({
  completedSteps,
  onNavigateTab,
}) => {
  const steps = [
    {
      id: 'profile',
      title: 'Artisan Profile',
      desc: 'Verify craft origin & name',
      icon: UserCheck,
      completed: completedSteps.profile,
      tab: 'profile',
    },
    {
      id: 'product',
      title: 'Product Catalog',
      desc: 'Add authentic craft story',
      icon: Package,
      completed: completedSteps.product,
      tab: 'products',
    },
    {
      id: 'photo',
      title: 'Studio Quality',
      desc: 'Clean background & lighting',
      icon: Camera,
      completed: completedSteps.photo,
      tab: 'images',
    },
    {
      id: 'storefront',
      title: 'Go Live on ONDC',
      desc: 'Share storefront with buyers',
      icon: Store,
      completed: completedSteps.storefront,
      tab: 'storefront',
    },
  ];

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-white dark:bg-[#13251B] p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-emerald-800/60 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-stone-100 dark:border-emerald-900/40">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] font-poppins">
            Artisan Commercial Milestone Roadmap
          </span>
          <h3 className="text-base font-bold text-stone-900 dark:text-white font-poppins">
            Pathway from Local Workshop to National Buyers
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0F5132] dark:text-[#34D399] font-poppins">
            {completedCount} of 4 Milestones Reached ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Track Line */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => onNavigateTab(step.tab)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                step.completed
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60'
                  : 'bg-stone-50/70 dark:bg-[#0E2016] border-stone-200 dark:border-emerald-900/40 hover:border-[#0F5132] dark:hover:border-emerald-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    step.completed
                      ? 'bg-[#0F5132] text-white shadow-xs'
                      : 'bg-stone-200 dark:bg-emerald-900/40 text-stone-700 dark:text-emerald-200'
                  }`}
                >
                  {step.completed ? <Check className="w-4 h-4 text-[#D4AF37]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] font-bold text-stone-400 dark:text-emerald-400/60 font-mono">
                  Step 0{idx + 1}
                </span>
              </div>

              <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins flex items-center justify-between">
                <span>{step.title}</span>
                <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#0F5132] group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-emerald-300/70 font-inter mt-0.5">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
