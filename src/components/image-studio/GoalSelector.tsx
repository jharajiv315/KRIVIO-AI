import React from 'react';
import { Camera, Palette, Sun, Store, HeartHandshake, Crown, Package, Share2, Wand2, Eye, Columns2, Trash2, Lock, Flame, Moon, Image as ImageIcon } from 'lucide-react';

export type StudioMainGoal = 'improve_photo' | 'create_marketing';
export type StudioInputMode = 'preset' | 'advanced';

export interface GoalSelectorProps {
  mainGoal: StudioMainGoal;
  onMainGoalChange: (goal: StudioMainGoal) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedOperationId: string;
  onOperationSelect: (opId: string) => void;
  inputMode: StudioInputMode;
  onInputModeChange: (mode: StudioInputMode) => void;
  customInstruction: string;
  onCustomInstructionChange: (text: string) => void;
}

export const CATEGORY_PRESETS: Record<string, Array<{ id: string; label: string; desc: string; icon: any; badge?: string }>> = {
  photo_cleanup: [
    { id: 'CLEAN_STUDIO', label: 'Clean Studio Photo', desc: 'Neutral smooth background with soft diffused lighting', icon: Sun, badge: 'Popular' },
    { id: 'WHITE_BACKGROUND', label: 'Pure White Background', desc: 'Crisp solid white for Amazon, Flipkart & ONDC compliance', icon: ImageIcon, badge: 'Marketplace' },
    { id: 'NATURAL_CRAFT', label: 'Natural Craft Setting', desc: 'Handloom linen cloth surface celebrating organic raw materials', icon: HeartHandshake },
    { id: 'WOODEN_SURFACE', label: 'Warm Wooden Table', desc: 'Rich weathered teakwood surface with warm daylight', icon: Store },
    { id: 'BACKGROUND_CLEANUP', label: 'Remove Clutter', desc: 'Erase surrounding domestic mess and isolate product cleanly', icon: Wand2, badge: 'Essential' },
  ],
  image_quality: [
    { id: 'MARKETPLACE_PRIMARY_IMAGE', label: 'Amazon / ONDC Standard', desc: 'Strict 85% frame isolation, pure white, commercial sharpness', icon: Store, badge: '1-Click' },
    { id: 'LIGHTING_IMPROVEMENT', label: 'Natural Lighting Boost', desc: 'Lift dark shadows, balance highlights without overexposure', icon: Sun },
    { id: 'COLOR_BALANCE', label: 'True Color Correction', desc: 'Neutralize camera tint and reveal genuine vegetable dye tones', icon: Palette },
    { id: 'DETAIL_PRESERVATION', label: 'Emphasize Craft Detail', desc: 'Raking light highlighting intricate carving, weave or painting', icon: Eye },
  ],
  lifestyle_context: [
    { id: 'HOME_DECOR_CONTEXT', label: 'Living Room Credenza', desc: 'Believable modern home setting with natural ambient bokeh', icon: Store, badge: 'Lifestyle' },
    { id: 'HANDMADE_CRAFT_CONTEXT', label: 'Artisan Workshop Studio', desc: 'Traditional craftsman worktable with natural raw fibers', icon: HeartHandshake, badge: 'Heritage' },
    { id: 'PREMIUM_BOUTIQUE_CONTEXT', label: 'Luxury Boutique Gallery', desc: 'Exclusive gallery plinth with museum spotlighting', icon: Crown, badge: 'Luxury' },
    { id: 'TABLETOP_CONTEXT', label: 'Tabletop Dining Runner', desc: 'Handloom runner over light wood with afternoon side-light', icon: Sun },
  ],
  marketing_assets: [
    { id: 'WHATSAPP_CATALOG', label: 'WhatsApp Product Card', desc: 'Clean, punchy visual for direct customer chat orders', icon: Share2, badge: 'WhatsApp' },
    { id: 'INSTAGRAM_POST', label: 'Instagram Feed Post (4:5)', desc: 'High-engagement aesthetic social composition', icon: Share2, badge: 'Social' },
    { id: 'INSTAGRAM_STORY', label: 'Mobile Story Format (9:16)', desc: 'Full-screen mobile story with clear header space', icon: Columns2 },
    { id: 'PRODUCT_PROMO_BANNER', label: 'Promotional Banner (16:9)', desc: 'Hero layout with clean space for title messaging', icon: Store },
    { id: 'B2B_PROMOTION', label: 'Wholesale / B2B Showcase', desc: 'Professional card emphasizing bulk craft reliability', icon: Package, badge: 'B2B' },
  ],
  seasonal_cultural: [
    { id: 'DIWALI', label: 'Diwali Festive Splendor', desc: 'Warm terracotta diyas & golden marigold bokeh', icon: Flame, badge: 'Diwali' },
    { id: 'HOLI', label: 'Holi Colors Celebration', desc: 'Earthy organic gulal powders in decorative bowls', icon: Crown, badge: 'Holi' },
    { id: 'NAVRATRI', label: 'Navratri & Durga Puja', desc: 'Auspicious festive red and gold traditional ambience', icon: Crown, badge: 'Navratri' },
    { id: 'EID', label: 'Eid Festive Elegance', desc: 'Royal emerald & warm gold filigree lanterns', icon: Moon, badge: 'Eid' },
    { id: 'WEDDING_GIFTING', label: 'Royal Wedding Gifting', desc: 'Rich raw silk fabric and scattered fresh rose petals', icon: HeartHandshake, badge: 'Wedding' },
  ],
  branding: [
    { id: 'BRAND_COLORS_APPLIED', label: 'Apply Brand Palette', desc: 'Harmonize background tones with your business colors', icon: Palette, badge: 'Branded' },
    { id: 'PACKAGING_MOCKUP', label: 'Eco-Packaging Box Concept', desc: 'Showcase beside craft unboxing box or cotton pouch', icon: Package },
    { id: 'THANK_YOU_CARD', label: 'Artisan Thank You Card', desc: 'Personal card celebrating your handmade story', icon: HeartHandshake },
  ],
};

export const GoalSelector: React.FC<GoalSelectorProps> = ({
  mainGoal,
  onMainGoalChange,
  selectedCategory,
  onCategoryChange,
  selectedOperationId,
  onOperationSelect,
  inputMode,
  onInputModeChange,
  customInstruction,
  onCustomInstructionChange,
}) => {
  const currentPresets = CATEGORY_PRESETS[selectedCategory] || [];

  return (
    <div className="space-y-4 font-inter">
      {/* 2 Primary Goals */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => {
            onMainGoalChange('improve_photo');
            onCategoryChange('photo_cleanup');
            onOperationSelect('CLEAN_STUDIO');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            mainGoal === 'improve_photo'
              ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-xs'
              : 'bg-white dark:bg-[#13251B] text-stone-800 dark:text-emerald-100 border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0F5132]/60'
          }`}
        >
          <Camera className={`w-4 h-4 mb-1.5 ${mainGoal === 'improve_photo' ? 'text-[#D4AF37]' : 'text-[#0F5132] dark:text-emerald-400'}`} />
          <div className="text-xs font-bold font-poppins">Improve Photo</div>
          <div className={`text-[11px] leading-snug mt-0.5 ${mainGoal === 'improve_photo' ? 'text-emerald-100/90' : 'text-stone-500 dark:text-emerald-400/70'}`}>
            Clean studio, white background, lighting fix
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onMainGoalChange('create_marketing');
            onCategoryChange('marketing_assets');
            onOperationSelect('WHATSAPP_CATALOG');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            mainGoal === 'create_marketing'
              ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-xs'
              : 'bg-white dark:bg-[#13251B] text-stone-800 dark:text-emerald-100 border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0F5132]/60'
          }`}
        >
          <Share2 className={`w-4 h-4 mb-1.5 ${mainGoal === 'create_marketing' ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
          <div className="text-xs font-bold font-poppins">Marketing Creative</div>
          <div className={`text-[11px] leading-snug mt-0.5 ${mainGoal === 'create_marketing' ? 'text-emerald-100/90' : 'text-stone-500 dark:text-emerald-400/70'}`}>
            WhatsApp cards, social posts, festive campaigns
          </div>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="space-y-1.5 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {(mainGoal === 'improve_photo'
            ? [
                { id: 'photo_cleanup', label: 'Photo Cleanup' },
                { id: 'image_quality', label: 'Lighting & Detail' },
                { id: 'lifestyle_context', label: 'Lifestyle Setting' },
              ]
            : [
                { id: 'marketing_assets', label: 'Social & WhatsApp' },
                { id: 'seasonal_cultural', label: 'Festive & Occasions' },
                { id: 'branding', label: 'Branding & Identity' },
              ]
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onCategoryChange(cat.id);
                const first = CATEGORY_PRESETS[cat.id]?.[0];
                if (first) onOperationSelect(first.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0F5132] text-white font-bold font-poppins shadow-2xs'
                  : 'bg-stone-100 dark:bg-[#0E2016] text-stone-600 dark:text-emerald-300 hover:bg-stone-200 dark:hover:bg-emerald-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets vs Custom Mode Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-emerald-900/40">
        <span className="text-xs font-bold text-stone-700 dark:text-emerald-200 font-poppins">
          Preset Style
        </span>
        <div className="flex bg-stone-100 dark:bg-[#0E2016] p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => onInputModeChange('preset')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              inputMode === 'preset' ? 'bg-[#0F5132] text-white font-bold' : 'text-stone-600 dark:text-emerald-300'
            }`}
          >
            Quick Presets
          </button>
          <button
            type="button"
            onClick={() => onInputModeChange('advanced')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              inputMode === 'advanced' ? 'bg-[#0F5132] text-white font-bold' : 'text-stone-600 dark:text-emerald-300'
            }`}
          >
            Custom Prompt
          </button>
        </div>
      </div>

      {/* Preset List */}
      {inputMode === 'preset' ? (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {currentPresets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedOperationId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onOperationSelect(preset.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-[#0F5132]/8 dark:bg-emerald-950/70 border-[#0F5132] dark:border-emerald-400'
                    : 'bg-white dark:bg-[#0E2016]/60 border-stone-200/80 dark:border-emerald-900/40 hover:border-[#0F5132]/40'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${isSelected ? 'bg-[#0F5132] text-[#D4AF37]' : 'bg-stone-100 dark:bg-emerald-950 text-stone-600 dark:text-emerald-300'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white font-poppins truncate">
                      {preset.label}
                    </h4>
                    {preset.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#D4AF37]/20 text-[#8B6E10] dark:text-[#D4AF37] shrink-0 font-poppins">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-emerald-400/80 line-clamp-2 mt-0.5 font-inter leading-relaxed">
                    {preset.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Prompt Input */
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 dark:text-emerald-200">
            Describe your desired setting in simple words:
          </label>
          <textarea
            value={customInstruction}
            onChange={(e) => onCustomInstructionChange(e.target.value)}
            placeholder="e.g. Place this wooden carved craft on a rustic teakwood table with warm natural morning window light."
            className="w-full p-3 bg-stone-50 dark:bg-[#0E2016] border border-stone-200 dark:border-emerald-900/40 rounded-2xl text-xs text-stone-900 dark:text-white focus:ring-2 focus:ring-[#0F5132] outline-none h-20 resize-none font-inter"
          />
        </div>
      )}
    </div>
  );
};
