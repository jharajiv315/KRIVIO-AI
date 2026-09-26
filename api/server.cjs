var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app,
  default: () => server_default,
  ensureDbInitialized: () => ensureDbInitialized
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_genai3 = require("@google/genai");
var import_pg = require("pg");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_supabase_js = require("@supabase/supabase-js");

// src/server/image_operations/registry.ts
var IMAGE_OPERATIONS = {
  // ------------------------------------------------------------
  // CATEGORY A — PRODUCT PHOTO CLEANUP (1-15)
  // ------------------------------------------------------------
  CLEAN_STUDIO: {
    id: "CLEAN_STUDIO",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Clean Studio Photo",
    description: "Create a clean neutral studio product photograph with balanced soft lighting.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Clean professional studio product photograph of {SUBJECT}. Positioned centrally on a smooth neutral seamless studio surface. Soft diffused commercial studio lighting with gentle natural contact shadow beneath the product. High commercial clarity, pure product focus.",
    preservationRules: ["Preserve exact product shape, colors, material texture, and craftsmanship details."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false,
    recommendedUse: "General online selling & marketplace listings",
    badge: "Popular"
  },
  WHITE_BACKGROUND: {
    id: "WHITE_BACKGROUND",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Pure White Background",
    description: "Place the product against a crisp, pure white commercial studio background.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Isolated commercial catalog photograph of {SUBJECT} on a 100% pure solid white background (#FFFFFF). Soft natural drop shadow directly beneath product base to anchor it realistically. Crisp edges and accurate product color preservation.",
    preservationRules: ["Lock product geometry, texture, and natural colors without alteration."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false,
    recommendedUse: "Amazon & Flipkart primary product compliance",
    badge: "Marketplace Standard"
  },
  LIGHT_BACKGROUND: {
    id: "LIGHT_BACKGROUND",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Bright Neutral Backdrop",
    description: "Create a bright, tasteful warm-grey or soft off-white commercial backdrop.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Commercial photograph of {SUBJECT} placed against a warm off-white and pale cream textured matte backdrop. Gentle daylight illumination with soft gradual falloff.",
    preservationRules: ["Preserve authentic craft color gradients and physical dimensions."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  NATURAL_CRAFT: {
    id: "NATURAL_CRAFT",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Natural Craft Setting",
    description: "Present the product on a natural earthy surface such as handloom linen or stone.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Artisan product photograph of {SUBJECT} displayed upon an unbleached organic hand-woven cotton canvas surface. Gentle directional sunlight highlighting artisanal textures and authentic materials.",
    preservationRules: ["Preserve all handmade motifs, hand-painted details, and woven textures."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false,
    badge: "Artisan Favorite"
  },
  WOODEN_SURFACE: {
    id: "WOODEN_SURFACE",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Rustic Wood Surface",
    description: "Present the product on a rich, restrained natural wood surface with warm tones.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "E-commerce showcase of {SUBJECT} resting upon a rich weathered natural teakwood tabletop. Soft golden-hour window light casting subtle warm highlights on the product contours.",
    preservationRules: ["Retain exact product geometry and handmade imperfections."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  FESTIVE_CULTURAL: {
    id: "FESTIVE_CULTURAL",
    category: "photo_cleanup",
    humanCategory: "Seasonal",
    label: "Festive Cultural Setting",
    description: "Create a tasteful cultural celebration presentation with marigold or brass accents.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["festivalOrOccasion"],
    promptTemplate: "Refined cultural celebration showcase of {SUBJECT}. Tastefully complemented by out-of-focus brass accents, fresh marigold flower petals, and soft warm diya luminescence in the background. The craft product remains the clear hero.",
    preservationRules: ["Keep product completely unaltered; decorations stay strictly in peripheral background."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false,
    badge: "Festive"
  },
  MINIMAL_LIFESTYLE: {
    id: "MINIMAL_LIFESTYLE",
    category: "photo_cleanup",
    humanCategory: "Lifestyle",
    label: "Minimal Lifestyle Setting",
    description: "Create a clean, uncluttered contemporary lifestyle context with the product dominant.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Modern minimalist interior vignette featuring {SUBJECT} as the primary focal point on a sleek stone console table. Soft diffused architectural lighting, neutral Japandi tones, clean negative space.",
    preservationRules: ["Do not modify product proportions or surface finish."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  PREMIUM_STUDIO: {
    id: "PREMIUM_STUDIO",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Premium Luxury Studio",
    description: "Create an upscale editorial studio shot with dramatic yet natural lighting.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "High-end editorial studio photograph of {SUBJECT}. Matte charcoal and deep olive gradient backdrop with sculptured rim lighting accentuating product silhouette. Premium boutique aesthetic.",
    preservationRules: ["Zero distortion to product craftwork and color accuracy."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  SOFT_DAYLIGHT: {
    id: "SOFT_DAYLIGHT",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Soft Morning Daylight",
    description: "Illuminate with gentle, authentic morning window daylight for genuine natural colors.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Natural daylight product capture of {SUBJECT}. Placed beside a large sunlit window with soft sheer curtain diffusion. Warm natural shadows, authentic color representation, zero harsh reflections.",
    preservationRules: ["Preserve authentic color temperature of handmade raw materials."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  SHADOW_REFINEMENT: {
    id: "SHADOW_REFINEMENT",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Realistic Shadow Fix",
    description: "Create a realistic, subtle contact shadow beneath the product to ground it naturally.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Studio refinement of {SUBJECT}. Replaced harsh, floating or unnatural shadows with a delicate, realistic soft contact shadow grounding the product onto a clean surface.",
    preservationRules: ["Keep product pixel boundary intact; only refine underside shadow gradients."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  REFLECTION_CONTROL: {
    id: "REFLECTION_CONTROL",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Glare & Reflection Control",
    description: "Reduce distracting specular flare while preserving true metallic or glazed sheen.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Glare-reduced product photograph of {SUBJECT}. Controlled harsh flashlight reflections and lens flare while faithfully maintaining natural luster, clay glaze, or metallic brass sheen.",
    preservationRules: ["Preserve underlying material texture and true colors."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  BACKGROUND_CLEANUP: {
    id: "BACKGROUND_CLEANUP",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Remove Clutter",
    description: "Remove distracting everyday clutter around the product and isolate it cleanly.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Product cleanup photograph of {SUBJECT}. Removed all background domestic clutter, wires, boxes, and stray objects, replacing with a clean serene neutral e-commerce studio background.",
    preservationRules: ["Product stays 100% untouched and centered; only surrounding clutter removed."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false,
    badge: "Essential"
  },
  FLOOR_CLEANUP: {
    id: "FLOOR_CLEANUP",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Replace Floor Surface",
    description: "Replace unsuitable tiles or ground surfaces with a refined wooden or stone pedestal.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Surface replacement for {SUBJECT}. Lifted off rough floor and positioned elegantly on a smooth polished sandstone or warm oak surface with natural ambient lighting.",
    preservationRules: ["Retain product base silhouette precisely."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  WALL_CLEANUP: {
    id: "WALL_CLEANUP",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Replace Wall Backdrop",
    description: "Replace stained, peeling or distracting walls with a pristine architectural studio wall.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Backdrop overhaul for {SUBJECT}. Replaced distracting background wall with a subtle textured lime-wash architectural wall in soft sand and warm grey.",
    preservationRules: ["Do not change product lighting direction or core craft features."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  COMPOSITION_CENTER: {
    id: "COMPOSITION_CENTER",
    category: "photo_cleanup",
    humanCategory: "Product Photo",
    label: "Re-center & Balance",
    description: "Re-align and center the product with balanced margins on all sides.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Balanced catalog crop and composition of {SUBJECT}. Product centered with 15% breathing room on all sides, upright orientation, symmetrical eye-level perspective.",
    preservationRules: ["Preserve true product aspect ratio and shape without stretching."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  // ------------------------------------------------------------
  // CATEGORY B — PRODUCT IMAGE QUALITY (16-25)
  // ------------------------------------------------------------
  LIGHTING_IMPROVEMENT: {
    id: "LIGHTING_IMPROVEMENT",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Enhance Exposure & Light",
    description: "Naturally lift dark shadows and balance highlights without artificial overexposure.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Expert lighting enhancement of {SUBJECT}. Lifted underexposed shadows to reveal intricate craftsmanship, balanced highlights to eliminate blowout, three-point studio lighting balance.",
    preservationRules: ["Maintain authentic craft material colors and natural shades."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  COLOR_BALANCE: {
    id: "COLOR_BALANCE",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "True Color Balance",
    description: "Neutralize yellow or blue camera tint while preserving true natural dye colors.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Color-corrected product photograph of {SUBJECT}. Neutral white balance, accurate natural pigment calibration, elimination of yellow fluorescent casts while preserving organic vegetable dye tones.",
    preservationRules: ["Match true textile, terracotta or brass colors accurately."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  SHARPNESS_IMPROVEMENT: {
    id: "SHARPNESS_IMPROVEMENT",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Clarity & Sharpness",
    description: "Enhance apparent focal clarity and edge sharpness without introducing artificial noise.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "High-clarity commercial product image of {SUBJECT}. Crisp edge definition, micro-contrast enhancement on intricate carving or embroidery, elimination of camera motion blur.",
    preservationRules: ["Do not hallucinate non-existent details; enhance real optical sharpness."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  CONTRAST_BALANCE: {
    id: "CONTRAST_BALANCE",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Dynamic Contrast Balance",
    description: "Improve depth and dynamic range while keeping delicate textures fully visible.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Balanced dynamic contrast enhancement for {SUBJECT}. Deepened rich shadows while retaining weave and fiber texture, clean highlights, professional tonal curve.",
    preservationRules: ["No clipping in dark regions or blown highlights."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  DETAIL_PRESERVATION: {
    id: "DETAIL_PRESERVATION",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Preserve Craft Details",
    description: "Highlight fine handwork, filigree, embroidery stitches, or brushwork.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Artisan detail-focused commercial photograph of {SUBJECT}. Raking light highlighting delicate handloom threads, hand-chiseled wood grains, or hand-painted strokes with extreme fidelity.",
    preservationRules: ["All physical handcraft details must remain untouched and celebrated."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  PROFESSIONAL_CROP: {
    id: "PROFESSIONAL_CROP",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Professional Commercial Crop",
    description: "Crop to e-commerce industry standard with optimal product prominence.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Professional e-commerce crop of {SUBJECT}. Product occupies 80-85% of total frame area, upright level horizon, compliant with ONDC and Amazon marketplace standards.",
    preservationRules: ["Do not cut off any portion of the product."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  SQUARE_PRODUCT_SHOT: {
    id: "SQUARE_PRODUCT_SHOT",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Square Product Shot (1:1)",
    description: "Square frame tailored for e-commerce listings, marketplace grids, and feed posts.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Standard 1:1 square e-commerce catalog image of {SUBJECT} centered perfectly on a clean neutral background with balanced margin.",
    preservationRules: ["Keep product aspect ratio true inside square canvas."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  PORTRAIT_PRODUCT_SHOT: {
    id: "PORTRAIT_PRODUCT_SHOT",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Portrait Product Shot (4:5)",
    description: "Vertical 4:5 orientation ideal for apparel, saris, tall crafts, and mobile screens.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Vertical 4:5 portrait commercial composition of {SUBJECT}. Full height display with generous top and bottom breathing space, professional lighting gradient.",
    preservationRules: ["Ensure full vertical silhouette of product is displayed."],
    aspectRatioRules: "4:5",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  LANDSCAPE_PRODUCT_SHOT: {
    id: "LANDSCAPE_PRODUCT_SHOT",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Landscape Showcase (16:9)",
    description: "Horizontal banner composition suitable for website headers and desktop banners.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Cinematic 16:9 landscape e-commerce hero shot of {SUBJECT}. Positioned with rule-of-thirds composition, elegant background depth of field, generous negative space on one side.",
    preservationRules: ["Maintain product fidelity in focal zone."],
    aspectRatioRules: "16:9",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  MARKETPLACE_PRIMARY_IMAGE: {
    id: "MARKETPLACE_PRIMARY_IMAGE",
    category: "image_quality",
    humanCategory: "Product Photo",
    label: "Amazon & ONDC Ready (Primary)",
    description: "Full marketplace compliance: pure solid white background, 85% frame coverage, zero props.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Official marketplace primary listing photo for {SUBJECT}. 100% pure solid white background (#FFFFFF), centered framing occupying 85% of frame, subtle grounding shadow, absolutely zero text, logos, or watermarks.",
    preservationRules: ["Strict product isolation. Zero background elements, no borders, no text."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false,
    badge: "1-Click Marketplace"
  },
  // ------------------------------------------------------------
  // CATEGORY C — PRODUCT CONTEXT / LIFESTYLE (26-35)
  // ------------------------------------------------------------
  HOME_DECOR_CONTEXT: {
    id: "HOME_DECOR_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Living Room Setting",
    description: "Place product in a tastefully styled living room or home decor environment.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Warm, believable modern Indian living room interior featuring {SUBJECT} on a polished wooden credenza. Soft natural sunlight through sheer blinds, tasteful indoor planter in background, blurred cozy ambient backdrop.",
    preservationRules: ["Product remains the clear focal hero; background is subtly defocused."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false,
    badge: "Lifestyle"
  },
  KITCHEN_CONTEXT: {
    id: "KITCHEN_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Kitchen & Dining Setting",
    description: "Place pottery, cookware or food-grade crafts in a realistic kitchen or dining setting.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Warm kitchen counter setting displaying {SUBJECT}. Clean granite or wooden countertop, soft morning light, subtle culinary background elements softly blurred.",
    preservationRules: ["Keep product completely in focus and true to size."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  FESTIVAL_CONTEXT: {
    id: "FESTIVAL_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Seasonal",
    label: "Festival Celebration Ambience",
    description: "Set in a festive Indian home celebration with subtle lights and marigold accents.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["festivalOrOccasion"],
    promptTemplate: "Festive celebration ambience for {SUBJECT}. Soft glowing fairy lights and golden brass diya reflections in the warm evening bokeh background, authentic festive warmth.",
    preservationRules: ["Never cover product with festive items; decorations remain strictly background framing."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  GIFTING_CONTEXT: {
    id: "GIFTING_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Marketing",
    label: "Gifting Presentation",
    description: "Present product accompanied by tasteful eco-friendly gift wrap and twine.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Artisanal gift presentation showcasing {SUBJECT}. Arranged beside unrolled brown kraft paper, jute twine, and a subtle handmade blank gift tag. Warm thoughtful boutique mood.",
    preservationRules: ["Product is unwrapped and completely visible as the centerpiece."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  HANDMADE_CRAFT_CONTEXT: {
    id: "HANDMADE_CRAFT_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Artisan Workshop Heritage",
    description: "Place in a quiet, authentic craft studio setting showing natural raw materials.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Artisan heritage workshop vignette of {SUBJECT}. Placed on a traditional craftsman worktable with natural raw fiber skeins, wooden blocks, or clay pottery tools resting naturally in soft background focus.",
    preservationRules: ["Product must appear finished and perfect; craft tools stay secondary."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false,
    badge: "Artisan Heritage"
  },
  DESK_CONTEXT: {
    id: "DESK_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Workplace & Desk Setting",
    description: "Showcase on a stylish work desk or study table with tasteful stationery.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Contemporary workspace desk setting with {SUBJECT} placed prominently. Clean oak tabletop, leather notebook, ceramic coffee mug in soft bokeh background.",
    preservationRules: ["Keep product dominant and sharp."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  TABLETOP_CONTEXT: {
    id: "TABLETOP_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Elegant Tabletop Display",
    description: "Display on an elegant dining or display tabletop with natural textiles.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Refined tabletop showcase featuring {SUBJECT}. Placed on an earthy textured handloom runner over light wood, bathed in soft afternoon sidelight.",
    preservationRules: ["Maintain product surface reflections and colors."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  OUTDOOR_CONTEXT: {
    id: "OUTDOOR_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Natural Outdoor Sunlight",
    description: "Place in a serene outdoor setting with natural foliage and golden sunlight.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Serene outdoor garden or patio setting with {SUBJECT} placed on a natural stone slab. Dappled natural sunlight filtering through leaves, lush greenery in background bokeh.",
    preservationRules: ["Protect product from unrealistic outdoor elements or weather."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  RURAL_CRAFT_CONTEXT: {
    id: "RURAL_CRAFT_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Lifestyle",
    label: "Authentic Rural Courtyard",
    description: "A subtle, respectful rural craft courtyard with traditional sun-baked mud plaster.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Respectful authentic heritage setting featuring {SUBJECT}. Displayed in an Indian rural artisan courtyard with natural sun-baked clay textures, terracotta tiles, and clean morning daylight. Dignified, authentic, non-stereotypical.",
    preservationRules: ["Maintain proud artisanal presentation without clich\xE9 stereotypes."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  PREMIUM_BOUTIQUE_CONTEXT: {
    id: "PREMIUM_BOUTIQUE_CONTEXT",
    category: "lifestyle_context",
    humanCategory: "Branding",
    label: "Luxury Boutique Gallery",
    description: "Display inside an upscale craft boutique gallery with museum spotlighting.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Exclusive design gallery boutique display of {SUBJECT}. Placed on a museum-quality matte white or fluted stone plinth. Focused soft spotlighting from above, architectural gallery space.",
    preservationRules: ["Elevate perceived value while maintaining exact craft reality."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false,
    badge: "Luxury"
  },
  // ------------------------------------------------------------
  // CATEGORY D — MARKETING ASSETS (36-45)
  // ------------------------------------------------------------
  INSTAGRAM_POST: {
    id: "INSTAGRAM_POST",
    category: "marketing_assets",
    humanCategory: "Social Media",
    label: "Instagram Feed Post (4:5 / 1:1)",
    description: "Square or 4:5 vertical aesthetic social composition optimized for engagement.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Aesthetic high-engagement Instagram post featuring {SUBJECT}. Eye-catching composition with balanced negative space for social layout. Warm earthy palette, contemporary styling.",
    preservationRules: ["Product remains the unmissable center; leave space for optional text overlay."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Social Media"
  },
  INSTAGRAM_STORY: {
    id: "INSTAGRAM_STORY",
    category: "marketing_assets",
    humanCategory: "Social Media",
    label: "Instagram & WhatsApp Story (9:16)",
    description: "Full-screen 9:16 vertical story graphic with product in lower-center and header space.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Vertical 9:16 full-screen mobile story visual centered on {SUBJECT}. Clean vertical breathing room at top and bottom for mobile UI overlays. Crisp lighting and immersive aesthetic.",
    preservationRules: ["Product positioned in middle-lower third safe zone."],
    aspectRatioRules: "9:16",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  WHATSAPP_CATALOG: {
    id: "WHATSAPP_CATALOG",
    category: "marketing_assets",
    humanCategory: "Social Media",
    label: "WhatsApp Product Card",
    description: "Clean visual tailored for fast WhatsApp sharing and customer chat inquiries.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Clean WhatsApp business showcase of {SUBJECT}. High contrast, easily legible on small phone screens, pure focus on product authenticity with soft neutral frame.",
    preservationRules: ["Ensure product is immediately identifiable on mobile screens."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "WhatsApp Ready"
  },
  FACEBOOK_POST: {
    id: "FACEBOOK_POST",
    category: "marketing_assets",
    humanCategory: "Social Media",
    label: "Facebook Marketing Post",
    description: "Landscape or square marketing visual with clear product story and clean framing.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Engaging Facebook marketing creative featuring {SUBJECT}. Clear product presentation with authentic cultural touch, designed for community shares and artisan story discovery.",
    preservationRules: ["Maintain product integrity for commercial trust."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  PRODUCT_PROMO_BANNER: {
    id: "PRODUCT_PROMO_BANNER",
    category: "marketing_assets",
    humanCategory: "Marketing",
    label: "Promotional Banner",
    description: "Commercial promotional visual with controlled negative space for headlines.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Commercial promotional banner featuring {SUBJECT} anchored on the right or left with clean open negative space on the opposite side for campaign messaging. Sophisticated color grading.",
    preservationRules: ["Reserve clean empty space for user text; do not hallucinate fake prices."],
    aspectRatioRules: "16:9",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  FESTIVAL_PROMOTION: {
    id: "FESTIVAL_PROMOTION",
    category: "marketing_assets",
    humanCategory: "Seasonal",
    label: "Festival Campaign Creative",
    description: "Festive commercial creative tailored for holiday sales and seasonal promotions.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["festivalOrOccasion", "marketingText", "brandContext"],
    promptTemplate: "Festive campaign visual celebrating {OCCASION} with {SUBJECT} as the star gift. Elegant festive border or background accents, warm golden glow, celebratory Indian aesthetic.",
    preservationRules: ["No random or cheesy decorations; keep elegant and culturally respectful."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Festive Special"
  },
  NEW_PRODUCT_LAUNCH: {
    id: "NEW_PRODUCT_LAUNCH",
    category: "marketing_assets",
    humanCategory: "Marketing",
    label: "New Arrival / Launch Card",
    description: "Launch-themed visual celebrating a fresh design or new craft addition.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "New collection launch showcase for {SUBJECT}. Sculptural pedestal, dramatic subtle unveiling spotlight, editorial fashion/craft look announcing a fresh handcrafted creation.",
    preservationRules: ["Hero focus on the exact new craft item."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  SALE_PROMOTION: {
    id: "SALE_PROMOTION",
    category: "marketing_assets",
    humanCategory: "Marketing",
    label: "Special Offer Creative",
    description: "Sale-oriented layout with clean space for user-provided discount or bundle info.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Special offer promotional graphic featuring {SUBJECT}. Tasteful festive discount ambience, balanced negative space reserved for offer details, premium retail aesthetic.",
    preservationRules: ["Never invent fake discounts; only display user-approved text."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  GIFT_PROMOTION: {
    id: "GIFT_PROMOTION",
    category: "marketing_assets",
    humanCategory: "Marketing",
    label: "Gift Guide Showcase",
    description: "Position product as a thoughtful handmade gift with artisanal charm.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "Curated gift guide presentation of {SUBJECT}. Placed on clean linen beside a tasteful handwritten-style artisan tag and botanical sprig. Inspires gifting handmade art.",
    preservationRules: ["Product remains completely visible and undamaged."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  B2B_PROMOTION: {
    id: "B2B_PROMOTION",
    category: "marketing_assets",
    humanCategory: "Catalog",
    label: "B2B / Wholesale Showcase",
    description: "Professional wholesale/buyer-oriented visual emphasizing bulk craftsmanship & reliability.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["marketingText", "brandContext"],
    promptTemplate: "B2B wholesale catalog visual showcasing {SUBJECT}. Clean industrial or trade-fair styling, structured framing, highlighting craftsmanship consistency and production quality for retail buyers.",
    preservationRules: ["Convey professional reliability and authentic handmade consistency."],
    aspectRatioRules: "16:9",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Wholesale / B2B"
  },
  // ------------------------------------------------------------
  // CATEGORY E — BRANDING (46-54)
  // ------------------------------------------------------------
  BRAND_COLORS_APPLIED: {
    id: "BRAND_COLORS_APPLIED",
    category: "branding",
    humanCategory: "Branding",
    label: "Apply Brand Palette",
    description: "Incorporate your enterprise brand colors harmoniously into the background environment.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Brand-harmonized product showcase of {SUBJECT}. The backdrop and ambient surface subtly incorporate the enterprise brand color palette ({BRAND_COLORS}) without changing the product itself.",
    preservationRules: ["Never recolor the product itself; apply brand colors exclusively to background framing."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: false,
    badge: "Branded"
  },
  BRAND_BACKGROUND: {
    id: "BRAND_BACKGROUND",
    category: "branding",
    humanCategory: "Branding",
    label: "Branded Identity Backdrop",
    description: "Create a distinctive studio background aligned with your artisan workshop identity.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Custom branded background environment for {SUBJECT} echoing the {BRAND_NAME} artisanal identity. Distinctive textured arch or soft geometric tone-on-tone paneling.",
    preservationRules: ["Keep product colors true and unaltered."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: false
  },
  LOGO_PLACEMENT: {
    id: "LOGO_PLACEMENT",
    category: "branding",
    humanCategory: "Branding",
    label: "Tasteful Logo Watermark",
    description: "Place your official logo tastefully in a corner or watermark safe zone.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Clean e-commerce product visual of {SUBJECT} with discrete, professional logo integration space in the top-right corner. Clean margin preservation.",
    preservationRules: ["Do not alter or redraw user logo; preserve original vector/image integrity."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: false
  },
  BRAND_STYLED_PRODUCT: {
    id: "BRAND_STYLED_PRODUCT",
    category: "branding",
    humanCategory: "Branding",
    label: "Cohesive Brand Presentation",
    description: "Full brand cohesion across lighting, backdrop, and accent styling for catalog uniformity.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Signature brand photograph for {BRAND_NAME} featuring {SUBJECT}. Consistent studio lighting, signature earthen tones, premium artisan positioning.",
    preservationRules: ["Ensure catalog-wide visual consistency across all products."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: false
  },
  PACKAGING_MOCKUP: {
    id: "PACKAGING_MOCKUP",
    category: "branding",
    humanCategory: "Branding",
    label: "Eco-Packaging Concept",
    description: "Show the product accompanied by an eco-friendly craft box or cotton drawstring pouch.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Sustainable packaging concept showcasing {SUBJECT} alongside a recycled brown cardboard box or organic unbleached cotton pouch featuring {BRAND_NAME} identity. Elegant unboxing feel.",
    preservationRules: ["Product remains primary hero beside or emerging from the package."],
    aspectRatioRules: "1:1",
    modelPreference: "professional",
    outputType: "branding_asset",
    languageSupport: false
  },
  THANK_YOU_CARD: {
    id: "THANK_YOU_CARD",
    category: "branding",
    humanCategory: "Branding",
    label: "Artisan Thank You Card",
    description: "Create a heartfelt thank-you card concept highlighting your handmade story.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext", "marketingText"],
    promptTemplate: "Heartfelt artisan thank you card visual featuring a miniature artistic depiction of {SUBJECT} and elegant handwritten-style message thanking the buyer for supporting rural livelihoods.",
    preservationRules: ["Warm personal tone without commercial clutter."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: true
  },
  PRODUCT_LABEL: {
    id: "PRODUCT_LABEL",
    category: "branding",
    humanCategory: "Branding",
    label: "Craft Tag / Label Mockup",
    description: "Design an authentic Kraft paper craft tag concept attached with jute twine.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Detailed macro view of {SUBJECT} with an artisanal craft tag tied gently with natural twine. Tag displays {BRAND_NAME} and 100% Handcrafted stamp.",
    preservationRules: ["Product texture and craftsmanship remains in sharp focus."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: false
  },
  QR_CARD: {
    id: "QR_CARD",
    category: "branding",
    humanCategory: "Branding",
    label: "Storefront QR Card Concept",
    description: "Branded table card concept with placeholder for your WhatsApp / Storefront QR.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Clean counter display card featuring {SUBJECT} with an elegant reserved box for digital QR code to scan and explore artisan story on KRIVIO AI.",
    preservationRules: ["Ensure clean high-contrast area for scannable code."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "branding_asset",
    languageSupport: true
  },
  BRAND_STORY_VISUAL: {
    id: "BRAND_STORY_VISUAL",
    category: "branding",
    humanCategory: "Branding",
    label: "Artisan Heritage Story Visual",
    description: "Visual storytelling asset celebrating your craft technique, region, and tradition.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Evocative storytelling editorial image of {SUBJECT} paying homage to traditional {CRAFT_TYPE} from {REGION}. Rich cultural mood, dignified portrayal of living craft heritage.",
    preservationRules: ["Honor authentic regional artistic traditions without caricature."],
    aspectRatioRules: "16:9",
    modelPreference: "professional",
    outputType: "branding_asset",
    languageSupport: true,
    badge: "Brand Story"
  },
  // ------------------------------------------------------------
  // CATEGORY F — CATALOG / BUSINESS ASSETS (55-60)
  // ------------------------------------------------------------
  PRODUCT_CATALOG_COVER: {
    id: "PRODUCT_CATALOG_COVER",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Wholesale Catalog Cover",
    description: "Create a stunning title cover page for your artisan enterprise product catalog.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Prestige catalog cover page featuring {SUBJECT} as the hero centerpiece. Minimalist modern Indian layout with {BRAND_NAME} title area, season identifier, and luxurious negative space.",
    preservationRules: ["Editorial cover layout with balanced typography margins."],
    aspectRatioRules: "4:5",
    modelPreference: "professional",
    outputType: "catalog_page",
    languageSupport: true
  },
  PRODUCT_CATALOG_PAGE: {
    id: "PRODUCT_CATALOG_PAGE",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Clean Catalog Spec Page",
    description: "Clean product catalog page layout with clean photo area and spec card margins.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext", "marketingText"],
    promptTemplate: "Professional B2B catalog specification sheet highlighting {SUBJECT}. Crisp studio photo on white background alongside organized layout areas for product dimensions, materials, and artisan notes.",
    preservationRules: ["Clear division between image and text areas."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "catalog_page",
    languageSupport: true
  },
  WHOLESALE_CATALOG: {
    id: "WHOLESALE_CATALOG",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Export / Wholesale Feature",
    description: "B2B buyer sheet visual emphasizing consistency, packaging readiness, and export appeal.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Export-ready wholesale presentation card of {SUBJECT}. Sharp studio lighting, neutral grey backdrop, displaying high craftsmanship standards suitable for international buyers.",
    preservationRules: ["Flawless depiction of actual product quality."],
    aspectRatioRules: "16:9",
    modelPreference: "production",
    outputType: "catalog_page",
    languageSupport: false
  },
  QUOTATION_COVER: {
    id: "QUOTATION_COVER",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Business Quotation Header",
    description: "Professional visual header for corporate gifting proposals and bulk price quotes.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Corporate proposal visual header featuring {SUBJECT}. Professional, trustworthy presentation with warm corporate artisan aesthetic.",
    preservationRules: ["Professional business tone."],
    aspectRatioRules: "16:9",
    modelPreference: "production",
    outputType: "catalog_page",
    languageSupport: false
  },
  PRODUCT_COLLECTION: {
    id: "PRODUCT_COLLECTION",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Collection Cohesion Shot",
    description: "Create a harmonious group or collection styling around the hero piece.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Curated collection showcase highlighting {SUBJECT} in harmony with subtle complementary tones. Balanced visual rhythm, clean studio floor.",
    preservationRules: ["Hero product remains unmistakably distinct and sharp."],
    aspectRatioRules: "16:9",
    modelPreference: "production",
    outputType: "catalog_page",
    languageSupport: false
  },
  PRODUCT_COMPARISON: {
    id: "PRODUCT_COMPARISON",
    category: "catalog_assets",
    humanCategory: "Catalog",
    label: "Handmade vs Machine-made Guide",
    description: "Visual highlighting the authentic hallmarks of genuine handcrafting over factory copies.",
    requiredInputs: ["originalImage"],
    optionalInputs: [],
    promptTemplate: "Educational craft appreciation visual highlighting {SUBJECT} focusing on authentic handloom weave or hand-carving markers that prove genuine artisan origin.",
    preservationRules: ["Focus on celebrating real craftsmanship hallmarks."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "catalog_page",
    languageSupport: true
  },
  // ------------------------------------------------------------
  // CATEGORY G — SEASONAL / CULTURAL (61-67)
  // ------------------------------------------------------------
  DIWALI: {
    id: "DIWALI",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Diwali Festive Splendor",
    description: "Celebrate the festival of lights with warm glowing terracotta diyas and golden aura.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext", "marketingText"],
    promptTemplate: "Elegant Diwali festival celebration image featuring {SUBJECT}. Traditional terracotta diyas with gentle warm flickering flames in the soft-focus background, delicate marigold garland curves, festive golden luminescence. The product is the central auspicious gift.",
    preservationRules: ["Diyas and flowers strictly frame the product from background; product itself remains 100% visible."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Diwali"
  },
  HOLI: {
    id: "HOLI",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Holi Colors Celebration",
    description: "Celebrate the festival of colors with dry organic herbal gulal powders in background.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Vibrant yet tasteful Holi festival showcase of {SUBJECT}. Placed beside small wooden bowls of organic pink, turquoise and saffron dry gulal powder. Celebratory joyful mood, zero powder on product itself.",
    preservationRules: ["Product must stay clean and pristine; color powders remain in decorative bowls."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Holi"
  },
  NAVRATRI: {
    id: "NAVRATRI",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Navratri & Durga Puja Theme",
    description: "Traditional celebration aesthetic with festive red, ochre and traditional motifs.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Navratri and Durga Puja festive showcase featuring {SUBJECT}. Traditional earthen tones, brass bell accents in bokeh, auspicious red and gold festive warmth.",
    preservationRules: ["Dignified devotional and festive aesthetics; product unaltered."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Navratri"
  },
  EID: {
    id: "EID",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Eid Festive Elegance",
    description: "Refined celebration with crescent motifs, brass lanterns and midnight emerald tones.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Refined Eid festive presentation of {SUBJECT}. Deep royal emerald and warm gold ambient tones, tasteful brass filigree lantern in the soft background, peaceful elegant celebratory ambience.",
    preservationRules: ["Strictly tasteful, culturally accurate, product centered."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Eid"
  },
  CHRISTMAS: {
    id: "CHRISTMAS",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Winter & Holiday Season",
    description: "Winter holiday gifting theme with warm fairy lights and pinecone accents.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Cozy winter holiday gifting showcase of {SUBJECT}. Warm fairy lights softly bokeh in background, rustic wooden table, evergreen pine branch resting naturally nearby.",
    preservationRules: ["Product remains untouched as the hero holiday gift."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  WEDDING_GIFTING: {
    id: "WEDDING_GIFTING",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Royal Wedding Gifting",
    description: "Opulent yet restrained Indian wedding gifting aesthetic with raw silk and rose petals.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Indian wedding trousseau and gifting presentation of {SUBJECT}. Resting on rich raw silk fabric, fresh scattered red rose petals, auspicious golden celebratory aesthetic.",
    preservationRules: ["Elevate heritage elegance while preserving original craft color."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true,
    badge: "Wedding"
  },
  LOCAL_FESTIVAL: {
    id: "LOCAL_FESTIVAL",
    category: "seasonal_cultural",
    humanCategory: "Seasonal",
    label: "Regional Harvest & Fair",
    description: "Celebrate regional festivals (Pongal, Onam, Bihu, Sankranti, Mela) with authentic touch.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["festivalOrOccasion", "brandContext"],
    promptTemplate: "Authentic harvest festival celebration of {OCCASION} featuring {SUBJECT}. Sunlit courtyard, sugarcane or earthen pot harvest accents softly blurred in background, joyful cultural pride.",
    preservationRules: ["Respect regional traditions authentically without generic stereotyping."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  },
  // ------------------------------------------------------------
  // CATEGORY H — ADVANCED EDITING (68-78)
  // ------------------------------------------------------------
  OBJECT_REMOVE: {
    id: "OBJECT_REMOVE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Remove Distracting Object",
    description: "Cleanly remove a specific unwanted object or person from around the product.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Flawless precision inpainting edit for {SUBJECT}. Remove {USER_INSTRUCTION} from the scene and seamlessly fill the vacated background with natural matching studio textures.",
    preservationRules: ["Product boundary and shadow must remain 100% untouched."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false,
    badge: "Precision"
  },
  OBJECT_REPLACE: {
    id: "OBJECT_REPLACE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Replace Background Element",
    description: "Replace an awkward prop or background piece with a clean tasteful alternative.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Selective element replacement around {SUBJECT}. Replace {USER_INSTRUCTION} with a tasteful neutral artisan styling accent.",
    preservationRules: ["The product itself must never be replaced or modified."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: false
  },
  BACKGROUND_CHANGE: {
    id: "BACKGROUND_CHANGE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Change Background to Custom Style",
    description: "Completely transform the background environment according to your exact preference.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Complete background transformation for {SUBJECT}. Isolate product perfectly and transpose onto {USER_INSTRUCTION}. Rebalance ambient lighting to match new environment naturally.",
    preservationRules: ["Product geometry, texture, and core lighting direction must stay locked."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: true
  },
  SURFACE_CHANGE: {
    id: "SURFACE_CHANGE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Change Table / Floor Surface",
    description: "Swap only the supporting surface (e.g. marble, wood, jute, terracotta).",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Surface replacement under {SUBJECT}. Place the product stably on {USER_INSTRUCTION} with realistic contact shadows and subtle surface reflections.",
    preservationRules: ["Product bottom contour must seat naturally without clipping."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: true
  },
  PROP_ADD: {
    id: "PROP_ADD",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Add Subtle Prop",
    description: "Add a tasteful supporting prop (e.g. fresh flower, clay bowl, botanical leaf).",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Add a subtle contextual prop ({USER_INSTRUCTION}) beside {SUBJECT}. Prop must be secondary in size and slightly defocused, leaving the product as the hero.",
    preservationRules: ["Never obscure product with the new prop."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: true
  },
  PROP_REMOVE: {
    id: "PROP_REMOVE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Remove Unwanted Prop",
    description: "Remove a cluttered or distracting prop already present in your photo.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Clean removal of unwanted prop ({USER_INSTRUCTION}) around {SUBJECT}, restoring clean background continuity.",
    preservationRules: ["Zero collateral damage to product edges."],
    aspectRatioRules: "1:1",
    modelPreference: "fast",
    outputType: "photo",
    languageSupport: false
  },
  COMPOSITION_REFRAME: {
    id: "COMPOSITION_REFRAME",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Reframe & Reposition",
    description: "Reframe the shot to achieve a new camera distance, angle, or position.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Reframe composition for {SUBJECT}. Adjust perspective to {USER_INSTRUCTION} while maintaining absolute fidelity to the product appearance.",
    preservationRules: ["Preserve true product proportion from the new framing."],
    aspectRatioRules: "1:1",
    modelPreference: "production",
    outputType: "photo",
    languageSupport: true
  },
  MULTI_IMAGE_COMPOSITE: {
    id: "MULTI_IMAGE_COMPOSITE",
    category: "advanced_editing",
    humanCategory: "Advanced Touch-Up",
    label: "Multi-Reference Composition",
    description: "Combine product with your logo and packaging references into one polished scene.",
    requiredInputs: ["originalImage", "referenceImages"],
    optionalInputs: ["brandContext"],
    promptTemplate: "Harmonious multi-asset composite bringing together primary {SUBJECT} with reference logo and packaging in a unified commercial studio setup.",
    preservationRules: ["Respect each reference asset roles without cross-contamination."],
    aspectRatioRules: "1:1",
    modelPreference: "professional",
    outputType: "branding_asset",
    languageSupport: false
  },
  BRAND_REFERENCE_STYLE: {
    id: "BRAND_REFERENCE_STYLE",
    category: "advanced_editing",
    humanCategory: "Branding",
    label: "Match Brand Style Reference",
    description: "Adopt the lighting, color grading and mood of an approved reference image.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["referenceImages", "brandContext"],
    promptTemplate: "Style transfer and lighting adaptation for {SUBJECT}. Match the color grading, mood and studio ambiance of the reference brand style while preserving the exact product.",
    preservationRules: ["Apply only lighting and grading style; product shape is strictly locked."],
    aspectRatioRules: "1:1",
    modelPreference: "professional",
    outputType: "photo",
    languageSupport: false
  },
  PRODUCT_REFERENCE_LOCK: {
    id: "PRODUCT_REFERENCE_LOCK",
    category: "advanced_editing",
    humanCategory: "Product Photo",
    label: "Lock Product Identity",
    description: "Enforce strict 100% identity lock on your original product photo across edits.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction"],
    promptTemplate: "Strict identity-locked commercial rendering of {SUBJECT}. Maximum preservation priority for colors, motifs, weave patterns and craftsmanship details. Edit environment as: {USER_INSTRUCTION}.",
    preservationRules: ["Absolute zero modification of the product itself. Only environment is eligible for modification."],
    aspectRatioRules: "1:1",
    modelPreference: "professional",
    outputType: "photo",
    languageSupport: true,
    badge: "Identity Lock"
  },
  CAMPAIGN_VARIANT: {
    id: "CAMPAIGN_VARIANT",
    category: "advanced_editing",
    humanCategory: "Marketing",
    label: "Generate Campaign Variation",
    description: "Create a visually related variation for multi-channel marketing campaigns.",
    requiredInputs: ["originalImage"],
    optionalInputs: ["userInstruction", "brandContext"],
    promptTemplate: "Campaign variant for {SUBJECT}. Complementary composition maintaining core brand identity and lighting language while offering fresh visual variety for marketing ads.",
    preservationRules: ["Maintain clear visual brand continuity with previous assets."],
    aspectRatioRules: "4:5",
    modelPreference: "production",
    outputType: "marketing_graphic",
    languageSupport: true
  }
};
var OPERATION_CATEGORIES = [
  {
    id: "photo_cleanup",
    title: "Product Photo Cleanup",
    description: "Clean backgrounds, remove domestic clutter, fix shadows and get studio quality.",
    badge: "Core"
  },
  {
    id: "image_quality",
    title: "Quality & Exposure",
    description: "True-to-life colors, sharpness, balanced lighting and marketplace compliance.",
    badge: "Enhance"
  },
  {
    id: "lifestyle_context",
    title: "Lifestyle & Real Context",
    description: "Living rooms, dining tables, outdoor sun and artisanal workshop heritage.",
    badge: "Believable"
  },
  {
    id: "marketing_assets",
    title: "Marketing & Social Media",
    description: "Instagram feed & story, WhatsApp catalog, festive promos and wholesale banners.",
    badge: "Growth"
  },
  {
    id: "branding",
    title: "Branding & Enterprise Identity",
    description: "Apply your brand palette, logo placement, packaging mockups and thank you cards.",
    badge: "Identity"
  },
  {
    id: "catalog_assets",
    title: "Catalog & Business Sheets",
    description: "Wholesale catalog covers, spec sheets, B2B quotation headers and collection layouts.",
    badge: "B2B"
  },
  {
    id: "seasonal_cultural",
    title: "Festive & Cultural Occasions",
    description: "Diwali, Holi, Navratri, Eid, Christmas, Weddings and local Indian fairs.",
    badge: "Festive"
  },
  {
    id: "advanced_editing",
    title: "Advanced Touch-Up",
    description: "Custom background changes, object removal, prop adjustment and identity locking.",
    badge: "Custom"
  }
];

// src/server/image_operations/classifier.ts
function classifyUserIntent(userInstruction, explicitOperationId, festivalOrOccasion, preferredAspectRatio) {
  if (explicitOperationId && IMAGE_OPERATIONS[explicitOperationId]) {
    const op = IMAGE_OPERATIONS[explicitOperationId];
    return {
      operationId: op.id,
      recommendedModel: op.modelPreference,
      aspectRatio: preferredAspectRatio || op.aspectRatioRules,
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: op.category === "photo_cleanup",
        isMarketplace: op.id === "MARKETPLACE_PRIMARY_IMAGE" || op.id === "WHITE_BACKGROUND",
        isFestive: op.category === "seasonal_cultural",
        festivalName: festivalOrOccasion,
        isSocial: op.id.includes("INSTAGRAM") || op.id.includes("WHATSAPP") || op.id.includes("FACEBOOK"),
        isRemoval: op.id.includes("REMOVE"),
        isBranded: op.category === "branding"
      }
    };
  }
  const text = (userInstruction || "").toLowerCase().trim();
  if (text.includes("amazon") || text.includes("flipkart") || text.includes("meesho") || text.includes("ondc") || text.includes("white background")) {
    const op = IMAGE_OPERATIONS["MARKETPLACE_PRIMARY_IMAGE"];
    return {
      operationId: op.id,
      recommendedModel: "fast",
      aspectRatio: "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: true,
        isMarketplace: true,
        isFestive: false,
        isSocial: false,
        isRemoval: false,
        isBranded: false
      }
    };
  }
  if (text.includes("diwali") || festivalOrOccasion === "diwali") {
    const op = IMAGE_OPERATIONS["DIWALI"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || (text.includes("story") ? "9:16" : text.includes("insta") ? "4:5" : "1:1"),
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: false,
        isMarketplace: false,
        isFestive: true,
        festivalName: "Diwali",
        isSocial: text.includes("insta") || text.includes("story"),
        isRemoval: false,
        isBranded: false
      }
    };
  }
  if (text.includes("holi") || festivalOrOccasion === "holi") {
    const op = IMAGE_OPERATIONS["HOLI"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: "Holi", isSocial: false, isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("navratri") || text.includes("durga") || festivalOrOccasion === "navratri") {
    const op = IMAGE_OPERATIONS["NAVRATRI"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: "Navratri", isSocial: false, isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("eid") || festivalOrOccasion === "eid") {
    const op = IMAGE_OPERATIONS["EID"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: "Eid", isSocial: false, isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("remove") || text.includes("delete") || text.includes("erase")) {
    const op = IMAGE_OPERATIONS["OBJECT_REMOVE"];
    const targetMatch = text.replace(/.*(remove|delete|erase)\s+(the\s+)?/i, "").trim();
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: false,
        isMarketplace: false,
        isFestive: false,
        isSocial: false,
        isRemoval: true,
        targetToRemove: targetMatch || void 0,
        isBranded: false
      }
    };
  }
  if (text.includes("story") || text.includes("reel") || text.includes("status")) {
    const op = IMAGE_OPERATIONS["INSTAGRAM_STORY"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: "9:16",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: "Instagram Story", isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("whatsapp") || text.includes("chat")) {
    const op = IMAGE_OPERATIONS["WHATSAPP_CATALOG"];
    return {
      operationId: op.id,
      recommendedModel: "fast",
      aspectRatio: "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: "WhatsApp", isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("instagram") || text.includes("post") || text.includes("social")) {
    const op = IMAGE_OPERATIONS["INSTAGRAM_POST"];
    return {
      operationId: op.id,
      recommendedModel: "production",
      aspectRatio: preferredAspectRatio || "4:5",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: "Instagram Post", isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("light") || text.includes("dark") || text.includes("bright") || text.includes("sun")) {
    const op = IMAGE_OPERATIONS["LIGHTING_IMPROVEMENT"];
    return {
      operationId: op.id,
      recommendedModel: "fast",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: false, isRemoval: false, isBranded: false }
    };
  }
  if (text.includes("wood") || text.includes("table")) {
    const op = IMAGE_OPERATIONS["WOODEN_SURFACE"];
    return {
      operationId: op.id,
      recommendedModel: "fast",
      aspectRatio: preferredAspectRatio || "1:1",
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: true, isMarketplace: false, isFestive: false, isSocial: false, isRemoval: false, isBranded: false }
    };
  }
  const defaultOp = IMAGE_OPERATIONS["CLEAN_STUDIO"];
  return {
    operationId: defaultOp.id,
    recommendedModel: "fast",
    aspectRatio: preferredAspectRatio || "1:1",
    preservationRules: defaultOp.preservationRules,
    inferredDetails: {
      cleanBackground: true,
      isMarketplace: false,
      isFestive: false,
      isSocial: false,
      isRemoval: false,
      isBranded: false
    }
  };
}

// src/server/image_operations/prompt_builder.ts
function buildPrompt(operation, request, detectedSubject) {
  const subjectName = detectedSubject || "handcrafted artisan product";
  const brand = request.brandContext;
  const subjectSection = `SUBJECT: The authentic ${subjectName} shown in the provided source image. Retain its true physical geometry, hand-crafted motifs, proportions, raw material texture, and genuine color palette with extreme fidelity.`;
  let intentSection = `GOAL: ${operation.description}`;
  if (request.userInstruction && request.userInstruction.trim()) {
    intentSection += ` Specific entrepreneur refinement: "${request.userInstruction.trim()}".`;
  }
  let contextSection = `ENVIRONMENT: ${operation.promptTemplate.replace("{SUBJECT}", subjectName)}`;
  if (brand?.brandName) {
    contextSection = contextSection.replace("{BRAND_NAME}", brand.brandName);
  }
  if (brand?.craftType) {
    contextSection = contextSection.replace("{CRAFT_TYPE}", brand.craftType);
  }
  if (brand?.region) {
    contextSection = contextSection.replace("{REGION}", brand.region);
  }
  if (brand?.brandColors && brand.brandColors.length > 0) {
    contextSection = contextSection.replace("{BRAND_COLORS}", brand.brandColors.join(", "));
  }
  if (request.festivalOrOccasion) {
    contextSection = contextSection.replace("{OCCASION}", request.festivalOrOccasion);
  }
  if (request.userInstruction) {
    contextSection = contextSection.replace("{USER_INSTRUCTION}", request.userInstruction);
  }
  const compositionSection = `COMPOSITION & FRAMING: Centered eye-level commercial e-commerce composition with balanced margins, clean negative space, and realistic depth of field. High-end retail catalog presentation adhering strictly to commercial product standards.`;
  const semanticCleanliness = `VISUAL CLEANLINESS: Pristine, uncluttered environment where the product is prominently isolated and celebrated. Seamless, smooth background surfaces with realistic soft ambient contact shadow grounding the product naturally.`;
  let textDirectives = "";
  if (request.marketingText?.headline || request.marketingText?.subheadline || request.marketingText?.cta) {
    const lines = [];
    if (request.marketingText.headline) lines.push(`"${request.marketingText.headline}"`);
    if (request.marketingText.subheadline) lines.push(`"${request.marketingText.subheadline}"`);
    if (request.marketingText.cta) lines.push(`"${request.marketingText.cta}"`);
    if (request.marketingText.price) lines.push(`"\u20B9${request.marketingText.price}"`);
    textDirectives = `TEXT OVERLAY REQUIREMENT: If typography is incorporated, render ONLY the following user-specified words in clean, elegant, legible typography: ${lines.join(" | ")}. STRICT RULE: Do not invent, fabricate or guess any unprovided dates, phone numbers, website URLs, certifications, discounts or fake awards.`;
  }
  const preservationDirectives = [
    "Preserve exact product geometry, materials, stitches, painted details, and structural proportions.",
    "Do not alter the product color palette or invent imaginary redesigns.",
    "Only modify the surrounding background, lighting, and contextual framing.",
    ...operation.preservationRules
  ];
  const preservationSection = `STRICT PRESERVATION LOCK:
- ${preservationDirectives.join("\n- ")}`;
  const fullPrompt = [
    subjectSection,
    intentSection,
    contextSection,
    compositionSection,
    semanticCleanliness,
    textDirectives,
    preservationSection
  ].filter(Boolean).join("\n\n");
  const summaryNote = `${operation.label}: Prepared for ${operation.humanCategory.toLowerCase()} with product identity preservation.`;
  return {
    fullPrompt,
    summaryNote,
    preservationDirectives
  };
}

// src/server/image_operations/model_router.ts
var ModelRouter = class {
  static {
    this.routes = {
      fast: {
        primaryModel: "gemini-3.1-flash-lite-image",
        fallbackModels: ["gemini-3.1-flash-image"],
        maxOutputDimension: 1024,
        tier: "fast"
      },
      production: {
        primaryModel: "gemini-3.1-flash-image",
        fallbackModels: ["gemini-3.1-flash-lite-image"],
        maxOutputDimension: 1536,
        tier: "production"
      },
      professional: {
        primaryModel: "gemini-3.1-flash-image",
        fallbackModels: ["gemini-3.1-flash-lite-image"],
        maxOutputDimension: 2048,
        tier: "professional"
      }
    };
  }
  /**
   * Resolves the optimal Gemini model sequence for a given operation tier.
   */
  static resolve(tier = "production") {
    return this.routes[tier] || this.routes.production;
  }
};

// src/server/image_operations/generation_service.ts
var import_genai = require("@google/genai");
var GenerationService = class {
  constructor() {
    this.aiClient = null;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "krivio-image-studio"
          }
        }
      });
    }
  }
  /**
   * Main image generation execution method
   */
  async generate(request) {
    if (!request.originalImage) {
      throw new Error("An original product image is required for enhancement.");
    }
    const classification = classifyUserIntent(
      request.userInstruction,
      request.operationId,
      request.festivalOrOccasion,
      request.aspectRatio
    );
    const operation = IMAGE_OPERATIONS[classification.operationId] || IMAGE_OPERATIONS["CLEAN_STUDIO"];
    const targetAspectRatio = classification.aspectRatio;
    const { fullPrompt, summaryNote } = buildPrompt(operation, request);
    const route = ModelRouter.resolve(operation.modelPreference);
    const modelUsed = route.primaryModel;
    let generatedImage = "";
    let usedModelName = modelUsed;
    if (this.aiClient) {
      const cleanBase64 = request.originalImage.replace(/^data:image\/\w+;base64,/, "");
      const contentsParts = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64
          }
        },
        {
          text: fullPrompt
        }
      ];
      if (request.referenceImages && request.referenceImages.length > 0) {
        for (const ref of request.referenceImages) {
          const refBase64 = ref.url.replace(/^data:image\/\w+;base64,/, "");
          contentsParts.push({
            inlineData: {
              mimeType: "image/png",
              data: refBase64
            }
          });
          contentsParts.push({
            text: `REFERENCE ASSET [ROLE: ${ref.role.toUpperCase()}]: Incorporate this asset faithfully according to its designated role without distorting colors or geometry.`
          });
        }
      }
      const modelsToTry = [route.primaryModel, ...route.fallbackModels];
      for (const candidateModel of modelsToTry) {
        try {
          const response = await this.aiClient.models.generateContent({
            model: candidateModel,
            contents: contentsParts
          });
          const candidateParts = response.candidates?.[0]?.content?.parts || [];
          for (const part of candidateParts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              generatedImage = `data:${mime};base64,${part.inlineData.data}`;
              usedModelName = candidateModel;
              break;
            }
          }
          if (generatedImage) {
            break;
          }
        } catch (modelErr) {
          console.warn(`Image generation attempt on model ${candidateModel} note:`, modelErr?.message || modelErr);
        }
      }
    }
    if (!generatedImage) {
      console.log("Applying KRIVIO Studio Canvas Engine fallback for operation:", operation.id);
      generatedImage = this.generateStudioFallbackAsset(request, operation, targetAspectRatio);
      usedModelName = "krivio-studio-engine";
    }
    const suggestedFollowUps = this.generateFollowUpSuggestions(operation.category);
    const assetId = `ast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      assetId,
      operationId: operation.id,
      originalImage: request.originalImage,
      generatedImage,
      aspectRatio: targetAspectRatio,
      operationLabel: operation.label,
      summaryNote: usedModelName === "krivio-studio-engine" ? `${operation.label} created using KRIVIO Studio Engine with calibrated lighting, framing, and commercial backdrop.` : summaryNote,
      modelUsed: usedModelName,
      suggestedFollowUps,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Generates a high-fidelity studio canvas composition tailored to the selected operation.
   */
  generateStudioFallbackAsset(request, operation, aspectRatio) {
    const rawImage = request.originalImage;
    const brandName = request.brandContext?.brandName || "Artisan Craft";
    const tagline = request.brandContext?.tagline || request.brandContext?.craftType || "Authentic Handmade";
    const festival = request.festivalOrOccasion || "Festive Celebration";
    let width = 1080;
    let height = 1080;
    if (aspectRatio === "9:16") {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === "4:5" || aspectRatio === "3:4") {
      width = 1080;
      height = 1350;
    } else if (aspectRatio === "16:9") {
      width = 1920;
      height = 1080;
    }
    const opId = operation.id;
    if (opId === "WHITE_BACKGROUND" || opId === "MARKETPLACE_PRIMARY_IMAGE") {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="studio-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.14" />
    </filter>
    <radialGradient id="grounding-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#FFFFFF" />
  <ellipse cx="${width / 2}" cy="${height * 0.86}" rx="${width * 0.35}" ry="${height * 0.04}" fill="url(#grounding-shadow)" />
  <g filter="url(#studio-shadow)">
    <image href="${rawImage}" x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="${height * 0.82}" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>`.trim();
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    if (opId === "WOODEN_SURFACE" || opId === "NATURAL_CRAFT") {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="wood-surface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDF8F0" />
      <stop offset="50%" stop-color="#F7EFE4" />
      <stop offset="100%" stop-color="#EFE2D1" />
    </linearGradient>
    <radialGradient id="warm-daylight" cx="30%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#FFFDF5" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#DFCFB7" stop-opacity="0.3" />
    </radialGradient>
    <filter id="soft-craft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="24" stdDeviation="28" flood-color="#4A2E14" flood-opacity="0.22" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#wood-surface)" />
  <rect width="${width}" height="${height}" fill="url(#warm-daylight)" />
  <g filter="url(#soft-craft-shadow)">
    <image href="${rawImage}" x="${width * 0.07}" y="${height * 0.07}" width="${width * 0.86}" height="${height * 0.86}" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>`.trim();
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    if (opId === "WHATSAPP_CATALOG") {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="wa-header" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F5132" />
      <stop offset="100%" stop-color="#072C1A" />
    </linearGradient>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.12" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#F4F6F5" />
  <!-- Top Branded Header -->
  <rect x="${width * 0.05}" y="${height * 0.04}" width="${width * 0.9}" height="${height * 0.12}" rx="24" fill="url(#wa-header)" />
  <text x="${width * 0.1}" y="${height * 0.09}" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.038)}" fill="#FFFFFF">${brandName}</text>
  <text x="${width * 0.1}" y="${height * 0.13}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(width * 0.024)}" fill="#D4AF37">${tagline}</text>
  <rect x="${width * 0.68}" y="${height * 0.065}" width="${width * 0.22}" height="${height * 0.055}" rx="14" fill="#D4AF37" />
  <text x="${width * 0.79}" y="${height * 0.1}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.024)}" fill="#0F5132">DIRECT CRAFT</text>

  <!-- Centered Product Frame -->
  <rect x="${width * 0.05}" y="${height * 0.18}" width="${width * 0.9}" height="${height * 0.66}" rx="32" fill="#FFFFFF" filter="url(#card-shadow)" />
  <image href="${rawImage}" x="${width * 0.08}" y="${height * 0.2}" width="${width * 0.84}" height="${height * 0.62}" preserveAspectRatio="xMidYMid meet" />

  <!-- Bottom CTA Ribbon -->
  <rect x="${width * 0.05}" y="${height * 0.86}" width="${width * 0.9}" height="${height * 0.09}" rx="20" fill="#25D366" />
  <text x="${width * 0.5}" y="${height * 0.915}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.035)}" fill="#FFFFFF">Available on WhatsApp \u2022 Inquire Now</text>
</svg>`.trim();
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    if (opId === "INSTAGRAM_POST" || opId === "INSTAGRAM_STORY") {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="insta-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141E18" />
      <stop offset="100%" stop-color="#08100C" />
    </linearGradient>
    <radialGradient id="glow-circle" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#0F5132" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#08100C" stop-opacity="0" />
    </radialGradient>
    <filter id="photo-frame-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#insta-bg)" />
  <rect width="${width}" height="${height}" fill="url(#glow-circle)" />
  
  <!-- Subtle Header -->
  <text x="${width * 0.5}" y="${height * 0.08}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.032)}" letter-spacing="3" fill="#D4AF37">${brandName.toUpperCase()}</text>
  
  <!-- Showcase Frame -->
  <g filter="url(#photo-frame-shadow)">
    <image href="${rawImage}" x="${width * 0.06}" y="${height * 0.12}" width="${width * 0.88}" height="${height * 0.74}" preserveAspectRatio="xMidYMid meet" />
  </g>
  
  <!-- Footer Story Line -->
  <text x="${width * 0.5}" y="${height * 0.92}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(width * 0.026)}" fill="#E2E8F0">${tagline}</text>
  <text x="${width * 0.5}" y="${height * 0.955}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.022)}" letter-spacing="1" fill="#D4AF37">HANDMADE WITH LOVE IN INDIA</text>
</svg>`.trim();
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    if (opId === "FESTIVAL_PROMOTION" || opId === "DIWALI" || opId === "HOLI" || opId === "NAVRATRI" || opId === "EID" || opId === "WEDDING_GIFTING") {
      const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="festive-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D1A04" />
      <stop offset="50%" stop-color="#140B02" />
      <stop offset="100%" stop-color="#241201" />
    </linearGradient>
    <radialGradient id="festive-bokeh" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#D4AF37" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="festive-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="18" stdDeviation="28" flood-color="#D4AF37" flood-opacity="0.25" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#festive-gold)" />
  <rect width="${width}" height="${height}" fill="url(#festive-bokeh)" />
  
  <!-- Festive Border -->
  <rect x="${width * 0.03}" y="${height * 0.03}" width="${width * 0.94}" height="${height * 0.94}" fill="none" stroke="#D4AF37" stroke-width="2" stroke-opacity="0.4" rx="20" />
  
  <!-- Festive Header Banner -->
  <text x="${width * 0.5}" y="${height * 0.085}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.038)}" fill="#D4AF37">\u2728 ${festival} Special \u2728</text>
  <text x="${width * 0.5}" y="${height * 0.12}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(width * 0.024)}" fill="#FEF3C7">${brandName}</text>
  
  <!-- Product Image -->
  <g filter="url(#festive-shadow)">
    <image href="${rawImage}" x="${width * 0.07}" y="${height * 0.15}" width="${width * 0.86}" height="${height * 0.72}" preserveAspectRatio="xMidYMid meet" />
  </g>
  
  <!-- Festive Greetings Footer -->
  <text x="${width * 0.5}" y="${height * 0.93}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="${Math.round(width * 0.028)}" fill="#FDE68A">Celebrate Handcrafted Heritage \u2022 Perfect Festive Gift</text>
</svg>`.trim();
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    const defaultSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="clean-studio-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBFBFB" />
      <stop offset="70%" stop-color="#F0F2F1" />
      <stop offset="100%" stop-color="#E2E6E4" />
    </linearGradient>
    <radialGradient id="diffused-spotlight" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#E2E6E4" stop-opacity="0" />
    </radialGradient>
    <filter id="studio-contact-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#0F5132" flood-opacity="0.12" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#clean-studio-grad)" />
  <rect width="${width}" height="${height}" fill="url(#diffused-spotlight)" />
  <g filter="url(#studio-contact-shadow)">
    <image href="${rawImage}" x="${width * 0.06}" y="${height * 0.06}" width="${width * 0.88}" height="${height * 0.88}" preserveAspectRatio="xMidYMid meet" />
  </g>
</svg>`.trim();
    return `data:image/svg+xml;base64,${Buffer.from(defaultSvg).toString("base64")}`;
  }
  generateFollowUpSuggestions(category) {
    switch (category) {
      case "photo_cleanup":
        return [
          "Make lighting slightly warmer",
          "Add subtle natural wooden surface",
          "Prepare for Amazon marketplace (pure white)",
          "Create an Instagram post version"
        ];
      case "image_quality":
        return [
          "Enhance shadow detail further",
          "Add soft morning daylight warmth",
          "Create a 1:1 catalog square crop",
          "Switch to a lifestyle living room context"
        ];
      case "lifestyle_context":
        return [
          "Try festive cultural celebration setting",
          "Move product slightly left for text space",
          "Switch to minimal boutique gallery pedestal",
          "Generate WhatsApp product card"
        ];
      case "seasonal_cultural":
        return [
          "Add subtle Diwali marigold and diya glow",
          "Create an Instagram Story version (9:16)",
          "Add handmade gift wrapping presentation",
          "Make background slightly brighter"
        ];
      case "branding":
        return [
          "Place logo in upper right corner",
          "Create an artisan thank-you card concept",
          "Create eco-packaging box mockup",
          "Apply natural earthy brand palette"
        ];
      default:
        return [
          "Make background cleaner",
          "Warm morning daylight",
          "Create festive version",
          "Format for Instagram"
        ];
    }
  }
};

// src/server/marketplace/adapters/amazon.ts
var import_exceljs = __toESM(require("exceljs"), 1);
var FORMULA_PREFIXES = ["=", "+", "-", "@", "	", "\r"];
function sanitizeCell(val) {
  if (val === null || val === void 0) return "";
  if (typeof val === "number" || typeof val === "boolean") return val;
  const str = String(val);
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES.some((p) => trimmed.startsWith(p))) {
    return `'${str}`;
  }
  return str;
}
function mapAmazonProductType(category) {
  const cat = category.toLowerCase();
  if (cat.includes("textile") || cat.includes("handloom") || cat.includes("cloth") || cat.includes("apparel")) {
    return "apparel";
  }
  if (cat.includes("pottery") || cat.includes("ceramic")) {
    return "kitchen";
  }
  if (cat.includes("jewelry") || cat.includes("necklace") || cat.includes("ornament")) {
    return "fashionjewelry";
  }
  if (cat.includes("art") || cat.includes("painting")) {
    return "fineart";
  }
  return "home-decor";
}
async function exportAmazonXlsx(products) {
  const workbook = new import_exceljs.default.Workbook();
  workbook.creator = "KRIVIO AI Amazon Adapter (Schema v2026.1)";
  workbook.created = /* @__PURE__ */ new Date();
  const worksheet = workbook.addWorksheet("Template", {
    views: [{ state: "frozen", ySplit: 2 }]
  });
  worksheet.columns = [
    { key: "feed_product_type", width: 20 },
    { key: "item_sku", width: 18 },
    { key: "brand_name", width: 22 },
    { key: "item_name", width: 35 },
    { key: "standard_price", width: 16 },
    { key: "list_price", width: 16 },
    { key: "currency", width: 12 },
    { key: "quantity", width: 14 },
    { key: "main_image_url", width: 35 },
    { key: "other_image_url1", width: 35 },
    { key: "bullet_point1", width: 30 },
    { key: "bullet_point2", width: 30 },
    { key: "product_description", width: 45 },
    { key: "item_type_keyword", width: 22 },
    { key: "material_type", width: 18 },
    { key: "item_weight", width: 14 },
    { key: "item_weight_unit_of_measure", width: 16 },
    { key: "item_length", width: 14 },
    { key: "item_width", width: 14 },
    { key: "item_height", width: 14 },
    { key: "item_dimensions_unit_of_measure", width: 16 },
    { key: "country_of_origin", width: 18 }
  ];
  worksheet.addRow({
    feed_product_type: "feed_product_type",
    item_sku: "item_sku",
    brand_name: "brand_name",
    item_name: "item_name",
    standard_price: "standard_price",
    list_price: "list_price",
    currency: "currency",
    quantity: "quantity",
    main_image_url: "main_image_url",
    other_image_url1: "other_image_url1",
    bullet_point1: "bullet_point1",
    bullet_point2: "bullet_point2",
    product_description: "product_description",
    item_type_keyword: "item_type_keyword",
    material_type: "material_type",
    item_weight: "item_weight",
    item_weight_unit_of_measure: "item_weight_unit_of_measure",
    item_length: "item_length",
    item_width: "item_width",
    item_height: "item_height",
    item_dimensions_unit_of_measure: "item_dimensions_unit_of_measure",
    country_of_origin: "country_of_origin"
  });
  worksheet.addRow({
    feed_product_type: "Product Type",
    item_sku: "Seller SKU",
    brand_name: "Brand Name",
    item_name: "Product Title",
    standard_price: "Selling Price",
    list_price: "Maximum Retail Price (MRP)",
    currency: "Currency Code",
    quantity: "Quantity In Stock",
    main_image_url: "Main Image URL",
    other_image_url1: "Other Image URL 1",
    bullet_point1: "Key Feature / Bullet 1",
    bullet_point2: "Craft Story / Bullet 2",
    product_description: "Product Description",
    item_type_keyword: "Item Type Keyword",
    material_type: "Material",
    item_weight: "Package Weight",
    item_weight_unit_of_measure: "Weight Unit",
    item_length: "Package Length",
    item_width: "Package Width",
    item_height: "Package Height",
    item_dimensions_unit_of_measure: "Dimensions Unit",
    country_of_origin: "Country of Origin"
  });
  const row1 = worksheet.getRow(1);
  row1.height = 24;
  row1.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF232F3E" }
      // Amazon Navy
    };
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  const row2 = worksheet.getRow(2);
  row2.height = 22;
  row2.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2E6" }
    };
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FFD46B08" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  products.forEach((p) => {
    const row = worksheet.addRow({
      feed_product_type: mapAmazonProductType(p.category),
      item_sku: sanitizeCell(p.sku),
      brand_name: sanitizeCell(p.brand),
      item_name: sanitizeCell(p.title),
      standard_price: p.price,
      list_price: p.mrp || p.price,
      currency: p.currency || "INR",
      quantity: p.stock,
      main_image_url: sanitizeCell(p.primaryImageUrl || ""),
      other_image_url1: sanitizeCell(p.imageUrls[1] || ""),
      bullet_point1: sanitizeCell(p.bulletPoints?.[0] || p.material || "Authentic handmade craft"),
      bullet_point2: sanitizeCell(p.craftStory || p.description.slice(0, 150)),
      product_description: sanitizeCell(p.description),
      item_type_keyword: sanitizeCell(p.category.toLowerCase()),
      material_type: sanitizeCell(p.material || "Handcrafted Natural Material"),
      item_weight: p.weightKg,
      item_weight_unit_of_measure: "KG",
      item_length: p.lengthCm || 15,
      item_width: p.widthCm || 10,
      item_height: p.heightCm || 5,
      item_dimensions_unit_of_measure: "CM",
      country_of_origin: "IN"
    });
    row.height = 20;
    const priceCell = row.getCell("standard_price");
    priceCell.numFmt = "#,##0.00";
    const listPriceCell = row.getCell("list_price");
    listPriceCell.numFmt = "#,##0.00";
    const qtyCell = row.getCell("quantity");
    qtyCell.numFmt = "#,##0";
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// src/server/marketplace/adapters/csv_safety.ts
var FORMULA_PREFIXES2 = ["=", "+", "-", "@", "	", "\r"];
function sanitizeCellForCsv(value) {
  if (value === null || value === void 0) return "";
  let str = String(value);
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES2.some((prefix) => trimmed.startsWith(prefix))) {
    str = `'${str}`;
  }
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function serializeToCsv(headers, rows) {
  const BOM = "\uFEFF";
  const headerLine = headers.map(sanitizeCellForCsv).join(",");
  const bodyLines = rows.map(
    (row) => row.map(sanitizeCellForCsv).join(",")
  );
  return BOM + [headerLine, ...bodyLines].join("\r\n");
}

// src/server/marketplace/adapters/flipkart.ts
var FLIPKART_CSV_HEADERS = [
  "Seller SKU ID",
  "Listing Status",
  "MRP",
  "Your Selling Price",
  "Procurement SLA (Days)",
  "Stock",
  "Shipping Provider",
  "Package Length (cm)",
  "Package Breadth (cm)",
  "Package Height (cm)",
  "Package Weight (kg)",
  "HSN",
  "Tax Code",
  "Main Image URL",
  "Product Title",
  "Description"
];
function exportFlipkartCsv(products) {
  const rows = products.map((p) => [
    p.sku,
    "ACTIVE",
    p.mrp || Math.round(p.price * 1.25),
    p.price,
    "3",
    // SLA in days
    p.stock,
    "FLIPKART",
    p.lengthCm || 15,
    p.widthCm || 10,
    p.heightCm || 5,
    p.weightKg,
    p.hsnCode || "6913",
    `GST_${p.gstRate || 12}`,
    p.primaryImageUrl || "",
    p.title,
    p.description
  ]);
  return serializeToCsv(FLIPKART_CSV_HEADERS, rows);
}

// src/server/marketplace/adapters/generic_csv.ts
var GENERIC_CSV_HEADERS = [
  "SKU",
  "Product Title",
  "Category",
  "Subcategory",
  "Brand",
  "Material",
  "Color",
  "Selling Price",
  "MRP",
  "Wholesale Price",
  "Currency",
  "Stock Quantity",
  "Minimum Order Qty (MOQ)",
  "Lead Time",
  "Weight",
  "Dimensions",
  "HSN Code",
  "GST Rate (%)",
  "Primary Image URL",
  "Secondary Image URL",
  "Description",
  "Craft Story / Heritage",
  "Keywords",
  "Status",
  "Origin State"
];
function exportGenericCsv(products) {
  const rows = products.map((p) => [
    p.sku,
    p.title,
    p.category,
    p.subcategory || "",
    p.brand,
    p.material || "",
    p.color || "",
    p.price,
    p.mrp || "",
    p.wholesalePrice || "",
    p.currency,
    p.stock,
    p.moq,
    p.leadTime,
    p.weight,
    p.dimensions,
    p.hsnCode || "",
    p.gstRate !== void 0 ? p.gstRate : "",
    p.primaryImageUrl || "",
    p.imageUrls[1] || "",
    p.description,
    p.craftStory || "",
    p.keywords.join(", "),
    p.status,
    p.originState || "India"
  ]);
  return serializeToCsv(GENERIC_CSV_HEADERS, rows);
}

// src/server/marketplace/adapters/generic_xlsx.ts
var import_exceljs2 = __toESM(require("exceljs"), 1);
var FORMULA_PREFIXES3 = ["=", "+", "-", "@", "	", "\r"];
function sanitizeCellForExcel(val) {
  if (val === null || val === void 0) return "";
  if (typeof val === "number" || typeof val === "boolean") return val;
  const str = String(val);
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES3.some((p) => trimmed.startsWith(p))) {
    return `'${str}`;
  }
  return str;
}
async function exportGenericXlsx(products) {
  const workbook = new import_exceljs2.default.Workbook();
  workbook.creator = "KRIVIO AI \u2014 Rural Entrepreneur Platform";
  workbook.created = /* @__PURE__ */ new Date();
  const worksheet = workbook.addWorksheet("Product Catalog", {
    views: [{ state: "frozen", ySplit: 1 }]
  });
  const columns = [
    { header: "SKU", key: "sku", width: 16 },
    { header: "Product Title", key: "title", width: 32 },
    { header: "Category", key: "category", width: 22 },
    { header: "Brand / Artisan", key: "brand", width: 24 },
    { header: "Material", key: "material", width: 18 },
    { header: "Color", key: "color", width: 14 },
    { header: "Selling Price (INR)", key: "price", width: 20 },
    { header: "MRP (INR)", key: "mrp", width: 16 },
    { header: "Wholesale Price (INR)", key: "wholesalePrice", width: 22 },
    { header: "Stock Units", key: "stock", width: 14 },
    { header: "MOQ", key: "moq", width: 12 },
    { header: "Lead Time", key: "leadTime", width: 20 },
    { header: "Weight", key: "weight", width: 14 },
    { header: "Dimensions", key: "dimensions", width: 18 },
    { header: "HSN Code", key: "hsnCode", width: 16 },
    { header: "GST Rate (%)", key: "gstRate", width: 14 },
    { header: "Primary Image URL", key: "primaryImageUrl", width: 35 },
    { header: "Description", key: "description", width: 45 },
    { header: "Craft Heritage Story", key: "craftStory", width: 40 },
    { header: "Origin State", key: "originState", width: 18 },
    { header: "Status", key: "status", width: 14 }
  ];
  worksheet.columns = columns;
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F5132" }
      // KRIVIO Emerald
    };
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" }
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: false
    };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FFD4AF37" } }
      // KRIVIO Gold accent
    };
  });
  products.forEach((p, idx) => {
    const row = worksheet.addRow({
      sku: sanitizeCellForExcel(p.sku),
      title: sanitizeCellForExcel(p.title),
      category: sanitizeCellForExcel(p.category),
      brand: sanitizeCellForExcel(p.brand),
      material: sanitizeCellForExcel(p.material || ""),
      color: sanitizeCellForExcel(p.color || ""),
      price: typeof p.price === "number" ? p.price : 0,
      mrp: typeof p.mrp === "number" ? p.mrp : "",
      wholesalePrice: typeof p.wholesalePrice === "number" ? p.wholesalePrice : "",
      stock: typeof p.stock === "number" ? p.stock : 0,
      moq: p.moq,
      leadTime: sanitizeCellForExcel(p.leadTime),
      weight: sanitizeCellForExcel(p.weight),
      dimensions: sanitizeCellForExcel(p.dimensions),
      hsnCode: sanitizeCellForExcel(p.hsnCode || ""),
      gstRate: typeof p.gstRate === "number" ? p.gstRate : "",
      primaryImageUrl: sanitizeCellForExcel(p.primaryImageUrl || ""),
      description: sanitizeCellForExcel(p.description),
      craftStory: sanitizeCellForExcel(p.craftStory || ""),
      originState: sanitizeCellForExcel(p.originState || "India"),
      status: sanitizeCellForExcel(p.status)
    });
    row.height = 22;
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FBF9" }
        };
      });
    }
    const priceCell = row.getCell("price");
    priceCell.numFmt = "\u20B9#,##0.00";
    priceCell.alignment = { horizontal: "right", vertical: "middle" };
    const mrpCell = row.getCell("mrp");
    if (typeof p.mrp === "number") {
      mrpCell.numFmt = "\u20B9#,##0.00";
      mrpCell.alignment = { horizontal: "right", vertical: "middle" };
    }
    const wholesaleCell = row.getCell("wholesalePrice");
    if (typeof p.wholesalePrice === "number") {
      wholesaleCell.numFmt = "\u20B9#,##0.00";
      wholesaleCell.alignment = { horizontal: "right", vertical: "middle" };
    }
    const stockCell = row.getCell("stock");
    stockCell.numFmt = "#,##0";
    stockCell.alignment = { horizontal: "center", vertical: "middle" };
    const moqCell = row.getCell("moq");
    moqCell.numFmt = "#,##0";
    moqCell.alignment = { horizontal: "center", vertical: "middle" };
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// src/server/marketplace/adapters/meesho.ts
var MEESHO_CSV_HEADERS = [
  "Catalog ID / SKU",
  "Product Title",
  "Description",
  "Meesho Price (Incl. GST)",
  "Wrong/Defective Return Price",
  "MRP",
  "GST %",
  "HSN Code",
  "Weight (Grams)",
  "Inventory",
  "Category",
  "Primary Material",
  "Color",
  "Country of Origin",
  "Image 1 URL",
  "Image 2 URL"
];
function exportMeeshoCsv(products) {
  const rows = products.map((p) => {
    const weightGrams = Math.round(p.weightKg * 1e3);
    const defectiveReturnPrice = Math.max(1, Math.round(p.price * 0.92));
    const gstRate = p.gstRate !== void 0 ? p.gstRate : 12;
    return [
      p.sku,
      p.title,
      p.description,
      p.price,
      defectiveReturnPrice,
      p.mrp || Math.round(p.price * 1.25),
      gstRate,
      p.hsnCode || "6913",
      // default craft/earthenware HSN if not set
      weightGrams,
      p.stock,
      p.category,
      p.material || "Natural Handcrafted",
      p.color || "Multicolor",
      "India",
      p.primaryImageUrl || "",
      p.imageUrls[1] || ""
    ];
  });
  return serializeToCsv(MEESHO_CSV_HEADERS, rows);
}

// src/server/marketplace/adapters/ondc.ts
function exportOndcJson(products, providerInfo) {
  const providerId = providerInfo?.providerId || "krivio-artisan-provider";
  const providerName = providerInfo?.providerName || "Krivio Rural Artisan";
  const contact = providerInfo?.phone || providerInfo?.email || "support@krivio.org";
  const items = products.map((p) => ({
    id: p.sku || p.id,
    descriptor: {
      name: p.title,
      code: p.sku,
      symbol: p.primaryImageUrl || "",
      short_desc: p.shortDescription || p.description.slice(0, 100),
      long_desc: p.description,
      images: p.imageUrls
    },
    price: {
      currency: p.currency || "INR",
      value: p.price.toFixed(2),
      maximum_value: (p.mrp || Math.round(p.price * 1.25)).toFixed(2)
    },
    quantity: {
      available: {
        count: String(p.stock)
      },
      maximum: {
        count: String(Math.min(p.stock, 25))
      }
    },
    category_id: p.category,
    fulfillment_id: "standard-delivery",
    tags: [
      {
        code: "origin",
        list: [
          { code: "country", value: "IND" },
          { code: "state", value: p.originState || "India" }
        ]
      },
      {
        code: "attribute",
        list: [
          { code: "brand", value: p.brand },
          { code: "material", value: p.material || "Natural" },
          { code: "weight", value: p.weight },
          { code: "dimensions", value: p.dimensions },
          { code: "hsn", value: p.hsnCode || "6913" }
        ]
      },
      ...p.craftStory ? [
        {
          code: "craft_heritage",
          list: [{ code: "story", value: p.craftStory }]
        }
      ] : []
    ],
    "@ondc/org/returnable": false,
    "@ondc/org/cancellable": true,
    "@ondc/org/return_window": "P7D",
    "@ondc/org/seller_pickup_return": false,
    "@ondc/org/time_to_ship": "P3D",
    "@ondc/org/available_on_cod": false,
    "@ondc/org/contact_details_consumer_care": contact
  }));
  return {
    $schema: "https://ondc.org/protocol/v1.2.0/retail-catalog.json",
    format: "ONDC-Ready Beckn Retail Protocol Representation",
    schema_version: "1.2.0",
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    disclaimer: "This payload formats catalog items according to the ONDC Beckn Retail Protocol specification for onboarding onto Seller Network Participant (SNP) nodes. Exporting does not directly syndicate items to the ONDC network without an authorized Seller App integration.",
    bpp_provider: {
      id: providerId,
      descriptor: {
        name: providerName,
        short_desc: "Authentic grassroots handicraft producer"
      },
      categories: Array.from(new Set(products.map((p) => p.category))).map((cat) => ({
        id: cat,
        descriptor: { name: cat }
      })),
      items
    }
  };
}

// src/server/marketplace/destinations.ts
var MARKETPLACE_DESTINATIONS = {
  amazon: {
    id: "amazon",
    name: "Amazon-Style Inventory Listing",
    tagline: "Structured inventory spreadsheet for Amazon Seller Central",
    badge: "XLSX Spreadsheet",
    format: "xlsx",
    schemaVersion: "amazon-flatfile-handmade-2026.1",
    lastVerifiedDate: "2026-08-15",
    description: "Generates a category-mapped inventory spreadsheet conforming to Amazon Seller Central flat-file listing specifications for handcrafted, home & lifestyle products.",
    instructions: [
      "Download the generated Amazon-style XLSX file.",
      "Log into your Amazon Seller Central account.",
      "Navigate to Catalog > Add Products via Upload.",
      "Upload this spreadsheet under the Inventory Loader / Flat File tab.",
      "Review any category-specific attribute notices directly in Seller Central."
    ],
    supportedCategories: ["Home & Decor", "Handicrafts & Art", "Textiles & Handloom", "Pottery & Ceramics", "Jewelry & Accessories"],
    disclaimer: "This tool formats your catalog according to verified Amazon Seller flat-file standards. It does not provide direct API publishing or guarantee marketplace approval."
  },
  meesho: {
    id: "meesho",
    name: "Meesho Micro-Seller Catalog",
    tagline: "Zero-commission bulk catalog template for Meesho Supplier Panel",
    badge: "CSV Catalog",
    format: "csv",
    schemaVersion: "meesho-catalog-v2026.2",
    lastVerifiedDate: "2026-07-20",
    description: "Formats your products into the official Meesho supplier bulk upload CSV format with GST, HSN code, correct packaging weight and return pricing.",
    instructions: [
      "Download the Meesho-formatted CSV file.",
      "Log into the Meesho Supplier Panel (supplier.meesho.com).",
      "Go to Catalog Uploads > Add Catalogs in Bulk.",
      "Select your primary category and upload the generated CSV.",
      "Ensure high-resolution images are reachable via public links."
    ],
    supportedCategories: ["Ethnic Wear", "Handicrafts", "Home Furnishing", "Fashion Jewelry", "Kitchen & Craft"],
    disclaimer: "Conforms to Meesho bulk catalog guidelines. Seller verification and final catalog activation are governed by Meesho."
  },
  flipkart: {
    id: "flipkart",
    name: "Flipkart Listing Flat File",
    tagline: "Standard listing feed for Flipkart Seller Hub",
    badge: "CSV Feed",
    format: "csv",
    schemaVersion: "flipkart-flatfile-v2026.1",
    lastVerifiedDate: "2026-08-01",
    description: "Creates a structured listing export matching Flipkart Seller Hub flat-file requirements including SKU ID, procurement SLA, pricing, and package dimensions.",
    instructions: [
      "Download the Flipkart-ready CSV listing file.",
      "Log into Flipkart Seller Hub (seller.flipkart.com).",
      "Navigate to Listings > Add New Listings in Bulk.",
      "Choose your category vertical and submit the file for listing validation."
    ],
    supportedCategories: ["Handicrafts & Decor", "Apparel & Fabric", "Kitchen & Dining", "Art & Collectibles"],
    disclaimer: "Listing feed prepared according to Flipkart catalog specs. Final brand approval and brand gating are administered by Flipkart."
  },
  generic_csv: {
    id: "generic_csv",
    name: "Universal Clean CSV Catalog",
    tagline: "Universal UTF-8 CSV with injection protection & multi-script support",
    badge: "Universal CSV",
    format: "csv",
    schemaVersion: "krivio-canonical-csv-v1.0",
    lastVerifiedDate: "2026-09-01",
    description: "RFC-4180 compliant CSV export with full support for Indian regional scripts (Hindi, Marathi, Tamil, Bengali, Assamese, Gujarati) and built-in spreadsheet formula injection defense.",
    instructions: [
      "Download the CSV file to open in Excel, Google Sheets, LibreOffice, or ERP systems.",
      "Includes complete product metadata: SKUs, descriptions, pricing, dimensions, and materials."
    ],
    supportedCategories: ["All Categories"],
    disclaimer: "Universal export format for third-party tools, ERP systems, or local inventory backups."
  },
  generic_xlsx: {
    id: "generic_xlsx",
    name: "Professional Excel Workbook",
    tagline: "Branded multi-column spreadsheet with styled headers and formatting",
    badge: "Styled XLSX",
    format: "xlsx",
    schemaVersion: "krivio-canonical-xlsx-v1.0",
    lastVerifiedDate: "2026-09-01",
    description: "A presentation-ready Microsoft Excel (.xlsx) catalog featuring KRIVIO emerald-gold header accents, auto-adjusted column widths, currency formats, and frozen header rows.",
    instructions: [
      "Open directly in Microsoft Excel, Apple Numbers, or Google Sheets.",
      "Ideal for sharing full catalogs with corporate procurement teams, distributors, and retail buyers."
    ],
    supportedCategories: ["All Categories"],
    disclaimer: "Formatted for human readability and business-to-business catalog sharing."
  },
  ondc: {
    id: "ondc",
    name: "ONDC-Ready Beckn Catalog (JSON)",
    tagline: "Open Network for Digital Commerce Retail Protocol representation",
    badge: "Beckn JSON",
    format: "json",
    schemaVersion: "ondc-beckn-retail-v1.2.0",
    lastVerifiedDate: "2026-08-28",
    description: "Generates a standardized Beckn Protocol JSON payload representing your catalog items for onboarding via ONDC Seller Network Participants (e.g. Mystore, Plotch, Paytm Seller).",
    instructions: [
      "Export the ONDC-ready JSON structure.",
      "Provide or import this JSON payload into your chosen ONDC Seller Network Participant (SNP) application.",
      "Review your ONDC Seller Application onboarding parameters."
    ],
    supportedCategories: ["Food & Beverage", "Home & Decor", "Apparel & Accessories", "Electronics & Hardware", "Grocery & Craft"],
    disclaimer: "This export formats product records into the ONDC Beckn Retail specification. Exporting does NOT directly syndicate products onto the live ONDC registry without an authenticated Seller App participant agreement."
  }
};

// src/server/marketplace/validation.ts
var MARKETPLACE_VALIDATION_RULES = [
  // 1. Universal Title
  {
    id: "rule_title_exists",
    field: "title",
    destinations: ["amazon", "meesho", "flipkart", "generic_csv", "generic_xlsx", "ondc"],
    severity: "ERROR",
    evaluate: (p) => Boolean(p.title && p.title.trim().length >= 3),
    message: "Product title is required and must have at least 3 characters.",
    remediation: "Provide a clear descriptive title for this item in the Product Studio."
  },
  {
    id: "rule_title_length_amazon",
    field: "title",
    destinations: ["amazon"],
    severity: "WARNING",
    evaluate: (p) => Boolean(p.title && p.title.length <= 200),
    message: "Amazon recommends product titles under 200 characters to prevent mobile truncation.",
    remediation: "Shorten your product title if it exceeds 200 characters."
  },
  // 2. Price
  {
    id: "rule_price_valid",
    field: "price",
    destinations: ["amazon", "meesho", "flipkart", "generic_csv", "generic_xlsx", "ondc"],
    severity: "ERROR",
    evaluate: (p) => typeof p.price === "number" && p.price > 0,
    message: "Product selling price must be greater than zero.",
    remediation: "Specify an active selling price in the Product Studio."
  },
  {
    id: "rule_mrp_higher",
    field: "mrp",
    destinations: ["flipkart", "meesho", "amazon"],
    severity: "WARNING",
    evaluate: (p) => !p.mrp || p.mrp >= p.price,
    message: "Maximum Retail Price (MRP) cannot be lower than the selling price.",
    remediation: "Adjust MRP to be equal to or higher than the selling price."
  },
  // 3. SKU
  {
    id: "rule_sku_exists",
    field: "sku",
    destinations: ["amazon", "flipkart", "meesho", "ondc"],
    severity: "ERROR",
    evaluate: (p) => Boolean(p.sku && p.sku.trim().length >= 3),
    message: "An alphanumeric Seller SKU is required for inventory synchronization.",
    remediation: "Assign a unique SKU code to this item."
  },
  // 4. Images
  {
    id: "rule_primary_image",
    field: "imageUrls",
    destinations: ["amazon", "flipkart", "meesho", "ondc"],
    severity: "ERROR",
    evaluate: (p) => Boolean(p.primaryImageUrl && p.primaryImageUrl.startsWith("http")),
    message: "At least one publicly accessible product image URL (HTTP/HTTPS) is required.",
    remediation: "Upload and publish photos with public URLs via Image Studio or Product Editor."
  },
  {
    id: "rule_multiple_images",
    field: "imageUrls",
    destinations: ["amazon", "flipkart"],
    severity: "INFO",
    evaluate: (p) => p.imageUrls.length >= 2,
    message: "Marketplaces recommend 2 or more lifestyle and angle shots for higher buyer conversion.",
    remediation: "Generate additional lifestyle background shots in the Image Studio."
  },
  // 5. Weight & Dimensions
  {
    id: "rule_weight_meesho",
    field: "weight",
    destinations: ["meesho", "amazon", "flipkart"],
    severity: "ERROR",
    evaluate: (p) => typeof p.weightKg === "number" && p.weightKg > 0,
    message: "Package weight is required for automated courier and logistics calculations.",
    remediation: "Enter package shipping weight (e.g. 0.5 kg or 500g)."
  },
  {
    id: "rule_dimensions_flipkart",
    field: "dimensions",
    destinations: ["flipkart", "amazon"],
    severity: "WARNING",
    evaluate: (p) => Boolean(p.lengthCm && p.widthCm && p.heightCm),
    message: "Package dimensions (Length x Width x Height cm) are recommended for accurate volumetric shipping.",
    remediation: 'Add dimensions in format "15x10x5 cm".'
  },
  // 6. Tax / HSN Code
  {
    id: "rule_hsn_meesho",
    field: "hsnCode",
    destinations: ["meesho"],
    severity: "WARNING",
    evaluate: (p) => Boolean(p.hsnCode && p.hsnCode.trim().length >= 4),
    message: "Meesho requires an HSN Code (Harmonized System of Nomenclature) for tax filing.",
    remediation: "Add your 4-to-8 digit HSN code for this craft category."
  },
  // 7. Material & Description
  {
    id: "rule_material_amazon",
    field: "material",
    destinations: ["amazon", "meesho"],
    severity: "WARNING",
    evaluate: (p) => Boolean(p.material && p.material.trim().length > 0),
    message: "Material specification helps search filtering on Amazon and Meesho.",
    remediation: "Add primary crafting material (e.g., Terracotta, Brass, Silk, Bamboo)."
  },
  {
    id: "rule_description_detail",
    field: "description",
    destinations: ["amazon", "flipkart", "ondc"],
    severity: "WARNING",
    evaluate: (p) => Boolean(p.description && p.description.trim().length >= 30),
    message: "Detailed product descriptions (>30 characters) improve marketplace search indexing.",
    remediation: "Enhance your craft story and item description."
  },
  // 8. Stock
  {
    id: "rule_stock_active",
    field: "stock",
    destinations: ["amazon", "flipkart", "meesho", "ondc"],
    severity: "ERROR",
    evaluate: (p) => typeof p.stock === "number" && p.stock >= 0,
    message: "Stock inventory quantity must be a non-negative number.",
    remediation: "Set available unit stock in the Product Studio."
  }
];
function validateForDestination(product, destination) {
  const meta = MARKETPLACE_DESTINATIONS[destination] || MARKETPLACE_DESTINATIONS.generic_csv;
  const applicableRules = MARKETPLACE_VALIDATION_RULES.filter(
    (rule) => rule.destinations.includes(destination)
  );
  const errors = [];
  const warnings = [];
  const infos = [];
  const checkedFields = /* @__PURE__ */ new Set();
  for (const rule of applicableRules) {
    checkedFields.add(rule.field);
    const passed = rule.evaluate(product);
    if (!passed) {
      const issue = {
        field: rule.field,
        severity: rule.severity,
        message: rule.message,
        remediation: rule.remediation,
        source: meta.name
      };
      if (rule.severity === "ERROR") {
        errors.push(issue);
      } else if (rule.severity === "WARNING") {
        warnings.push(issue);
      } else {
        infos.push(issue);
      }
    }
  }
  return {
    ready: errors.length === 0,
    destination,
    errors,
    warnings,
    infos,
    checkedFields: Array.from(checkedFields),
    schemaVersion: meta.schemaVersion
  };
}
function validateBatch(products, destination) {
  const results = products.map((p) => ({
    productId: p.id,
    productTitle: p.title,
    validation: validateForDestination(p, destination)
  }));
  const readyCount = results.filter((r) => r.validation.ready).length;
  return {
    destination,
    totalProducts: products.length,
    readyProductsCount: readyCount,
    unreadyProductsCount: products.length - readyCount,
    results
  };
}

// src/server/marketplace/canonical.ts
function parseWeightKg(weightStr) {
  if (!weightStr) return 0.5;
  const clean = String(weightStr).trim().toLowerCase();
  const numMatch = clean.match(/([\d.]+)/);
  if (!numMatch) return 0.5;
  const val = parseFloat(numMatch[1]);
  if (isNaN(val) || val <= 0) return 0.5;
  if (clean.includes("gm") || clean.includes("g") && !clean.includes("kg")) {
    return Math.round(val / 1e3 * 1e3) / 1e3;
  }
  return val;
}
function parseDimensionsCm(dimStr) {
  const fallback = { length: 15, width: 10, height: 5 };
  if (!dimStr) return fallback;
  const parts = String(dimStr).toLowerCase().replace(/cm|inch|in|mm/g, "").split(/[x*×]/).map((s) => parseFloat(s.trim()));
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return {
      length: Math.max(1, parts[0]),
      width: Math.max(1, parts[1]),
      height: Math.max(1, parts[2])
    };
  }
  return fallback;
}
function toCanonicalProduct(raw, businessProfile) {
  const provenance = {};
  const title = (raw.title || "").trim();
  provenance.title = title ? "USER_PROVIDED" : "NOT_AVAILABLE";
  let sku = (raw.sku || "").trim();
  if (!sku) {
    sku = `SKU-${raw.id ? raw.id.slice(-6).toUpperCase() : Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    provenance.sku = "SYSTEM_DERIVED";
  } else {
    provenance.sku = "USER_PROVIDED";
  }
  let brand = (raw.brand || "").trim();
  if (brand) {
    provenance.brand = "USER_PROVIDED";
  } else if (businessProfile?.brandName) {
    brand = businessProfile.brandName.trim();
    provenance.brand = "SYSTEM_DERIVED";
  } else if (businessProfile?.businessName) {
    brand = businessProfile.businessName.trim();
    provenance.brand = "SYSTEM_DERIVED";
  } else {
    brand = "Handcrafted by Krivio Artisan";
    provenance.brand = "SYSTEM_DERIVED";
  }
  const description = (raw.description || "").trim();
  provenance.description = description ? "USER_PROVIDED" : "NOT_AVAILABLE";
  const craftStory = raw.craft_story ? raw.craft_story.trim() : void 0;
  if (craftStory) provenance.craftStory = "USER_PROVIDED";
  const category = (raw.category || "Handicrafts & Art").trim();
  provenance.category = raw.category ? "USER_PROVIDED" : "SYSTEM_DERIVED";
  const price = typeof raw.price === "number" ? raw.price : parseFloat(String(raw.price || 0)) || 0;
  provenance.price = price > 0 ? "USER_PROVIDED" : "NOT_AVAILABLE";
  const mrp = raw.mrp ? typeof raw.mrp === "number" ? raw.mrp : parseFloat(String(raw.mrp)) || void 0 : void 0;
  if (mrp) provenance.mrp = "USER_PROVIDED";
  const wholesalePrice = raw.wholesale_price ? typeof raw.wholesale_price === "number" ? raw.wholesale_price : parseFloat(String(raw.wholesale_price)) || void 0 : void 0;
  if (wholesalePrice) provenance.wholesalePrice = "USER_PROVIDED";
  const currency = (raw.currency || "INR").trim().toUpperCase();
  const stock = typeof raw.stock === "number" ? Math.max(0, raw.stock) : parseInt(String(raw.stock || 1), 10);
  const moq = typeof raw.moq === "number" && raw.moq > 0 ? raw.moq : parseInt(String(raw.moq || 1), 10) || 1;
  const leadTime = (raw.lead_time || "3-5 business days").trim();
  const weightStr = (raw.weight || "0.5 kg").trim();
  const weightKg = parseWeightKg(weightStr);
  const dimStr = (raw.dimensions || "15x10x5 cm").trim();
  const dim = parseDimensionsCm(dimStr);
  let imageUrls = [];
  if (Array.isArray(raw.image_urls)) {
    imageUrls = raw.image_urls.filter((url) => typeof url === "string" && url.trim().length > 0);
  } else if (typeof raw.image_urls === "string") {
    try {
      const parsed = JSON.parse(raw.image_urls);
      if (Array.isArray(parsed)) imageUrls = parsed.filter((u) => typeof u === "string" && u.trim().length > 0);
    } catch {
    }
  }
  const primaryImageUrl = imageUrls.length > 0 ? imageUrls[0] : void 0;
  provenance.imageUrls = imageUrls.length > 0 ? "USER_PROVIDED" : "NOT_AVAILABLE";
  let keywords = [];
  if (Array.isArray(raw.keywords)) {
    keywords = raw.keywords.map(String).filter((k) => k.trim().length > 0);
  } else if (typeof raw.keywords === "string") {
    try {
      const parsed = JSON.parse(raw.keywords);
      if (Array.isArray(parsed)) keywords = parsed.map(String).filter((k) => k.trim().length > 0);
    } catch {
      keywords = raw.keywords.split(",").map((k) => k.trim()).filter(Boolean);
    }
  }
  const material = (raw.material || "").trim() || void 0;
  if (material) provenance.material = "USER_PROVIDED";
  const color = (raw.color || "").trim() || void 0;
  const size = (raw.size || "").trim() || void 0;
  const hsnCode = (raw.hsn_code || "").trim() || void 0;
  if (hsnCode) provenance.hsnCode = "USER_PROVIDED";
  const gstRate = raw.gst_rate ? typeof raw.gst_rate === "number" ? raw.gst_rate : parseFloat(String(raw.gst_rate)) || void 0 : void 0;
  const originState = (raw.origin_state || businessProfile?.state || "India").trim();
  return {
    id: raw.id,
    userId: raw.user_id,
    sku,
    title,
    shortDescription: raw.short_description ? raw.short_description.trim() : void 0,
    description,
    bulletPoints: keywords.length > 0 ? keywords.slice(0, 5) : void 0,
    craftStory,
    brand,
    category,
    subcategory: raw.subcategory ? raw.subcategory.trim() : void 0,
    material,
    color,
    size,
    price,
    mrp: mrp && mrp >= price ? mrp : Math.round(price * 1.25),
    // safe MRP estimate if not set
    wholesalePrice,
    currency,
    moq,
    stock,
    leadTime,
    weight: weightStr,
    weightKg,
    dimensions: dimStr,
    lengthCm: dim.length,
    widthCm: dim.width,
    heightCm: dim.height,
    hsnCode,
    gstRate: gstRate ?? 12,
    // standard handicraft GST rate
    imageUrls,
    primaryImageUrl,
    keywords,
    status: raw.status || "published",
    originState,
    provenance
  };
}

// src/server/marketplace/index.ts
function sanitizeFilenamePart(str) {
  return str.toLowerCase().replace(/[^a-z0-9_-]/g, "_").replace(/__+/g, "_").slice(0, 30);
}
async function executeMarketplaceExport(products, destination, options) {
  if (!products || products.length === 0) {
    throw new Error("Cannot export: No products provided for export.");
  }
  const meta = MARKETPLACE_DESTINATIONS[destination] || MARKETPLACE_DESTINATIONS.generic_csv;
  const allowPartial = options?.allowPartial ?? false;
  const validations = products.map((p) => ({
    product: p,
    validation: validateForDestination(p, destination)
  }));
  const readyItems = validations.filter((v) => v.validation.ready);
  const unreadyItems = validations.filter((v) => !v.validation.ready);
  const excludedReasons = unreadyItems.map((u) => ({
    productId: u.product.id,
    productTitle: u.product.title,
    reason: u.validation.errors.map((e) => e.message).join("; ") || "Listing validation failed"
  }));
  const totalWarnings = validations.reduce((sum, v) => sum + v.validation.warnings.length, 0);
  const totalErrors = validations.reduce((sum, v) => sum + v.validation.errors.length, 0);
  let itemsToExport = [];
  if (unreadyItems.length === 0) {
    itemsToExport = products;
  } else if (allowPartial && readyItems.length > 0) {
    itemsToExport = readyItems.map((r) => r.product);
  } else {
    throw new Error(
      `Cannot export: ${unreadyItems.length} product(s) have blocking errors for ${meta.name}. ${unreadyItems[0].validation.errors[0]?.message || "Please fix missing required fields before export."}`
    );
  }
  const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const safeDest = sanitizeFilenamePart(destination);
  let filename = `krivio_${safeDest}_catalog_${dateStr}.${meta.format}`;
  let data = "";
  let contentType = "text/plain";
  switch (destination) {
    case "amazon": {
      data = await exportAmazonXlsx(itemsToExport);
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `krivio_amazon_inventory_${dateStr}.xlsx`;
      break;
    }
    case "meesho": {
      data = exportMeeshoCsv(itemsToExport);
      contentType = "text/csv; charset=utf-8";
      filename = `krivio_meesho_catalog_${dateStr}.csv`;
      break;
    }
    case "flipkart": {
      data = exportFlipkartCsv(itemsToExport);
      contentType = "text/csv; charset=utf-8";
      filename = `krivio_flipkart_feed_${dateStr}.csv`;
      break;
    }
    case "generic_xlsx": {
      data = await exportGenericXlsx(itemsToExport);
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `krivio_product_catalog_${dateStr}.xlsx`;
      break;
    }
    case "ondc": {
      const ondcPayload = exportOndcJson(itemsToExport, options?.providerInfo);
      data = JSON.stringify(ondcPayload, null, 2);
      contentType = "application/json; charset=utf-8";
      filename = `krivio_ondc_beckn_catalog_${dateStr}.json`;
      break;
    }
    case "generic_csv":
    default: {
      data = exportGenericCsv(itemsToExport);
      contentType = "text/csv; charset=utf-8";
      filename = `krivio_catalog_${dateStr}.csv`;
      break;
    }
  }
  const report = {
    destination,
    destinationName: meta.name,
    format: meta.format,
    schemaVersion: meta.schemaVersion,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalRequested: products.length,
    totalExported: itemsToExport.length,
    totalExcluded: unreadyItems.length,
    warningsCount: totalWarnings,
    errorsCount: totalErrors,
    downloadFilename: filename,
    excludedReasons: excludedReasons.length > 0 ? excludedReasons : void 0
  };
  return {
    status: unreadyItems.length === 0 ? "completed" : "partial",
    destination,
    data,
    contentType,
    filename,
    report
  };
}

// src/server/quotation/quotation_calculator.ts
function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
function resolveEffectiveUnitPrice(baseUnitPrice, quantity, tiers) {
  if (!tiers || tiers.length === 0) return baseUnitPrice;
  for (const tier of tiers) {
    const min = tier.minQuantity;
    const max = tier.maxQuantity !== void 0 && tier.maxQuantity !== null ? tier.maxQuantity : Infinity;
    if (quantity >= min && quantity <= max) {
      if (typeof tier.unitPrice === "number" && tier.unitPrice > 0) {
        return tier.unitPrice;
      }
    }
  }
  return baseUnitPrice;
}
function validatePricingTiers(tiers) {
  if (!tiers || tiers.length === 0) return { valid: true };
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (typeof t.minQuantity !== "number" || t.minQuantity <= 0 || !Number.isInteger(t.minQuantity)) {
      return { valid: false, error: `Tier #${i + 1}: minimum quantity must be a positive integer.` };
    }
    if (typeof t.unitPrice !== "number" || t.unitPrice <= 0) {
      return { valid: false, error: `Tier #${i + 1}: unit price must be greater than zero.` };
    }
    if (t.maxQuantity !== void 0 && t.maxQuantity !== null) {
      if (t.maxQuantity < t.minQuantity) {
        return { valid: false, error: `Tier #${i + 1}: maximum quantity cannot be less than minimum quantity.` };
      }
    }
  }
  return { valid: true };
}
function calculateQuotationTotals(items, taxRatePercent = 0) {
  if (!items || items.length === 0) {
    throw new Error("At least one product item is required for a wholesale quotation.");
  }
  let subtotal = 0;
  const snapshots = [];
  for (const item of items) {
    if (!item.title || item.title.trim().length === 0) {
      throw new Error("Product title is required for each line item.");
    }
    const qty = parseInt(String(item.quantity), 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for "${item.title}". Quantity must be a positive integer.`);
    }
    const moq = parseInt(String(item.moq || 1), 10);
    if (isNaN(moq) || moq <= 0) {
      throw new Error(`Invalid MOQ for "${item.title}". MOQ must be at least 1.`);
    }
    const basePrice = typeof item.unitPrice === "number" ? item.unitPrice : parseFloat(String(item.unitPrice)) || 0;
    if (basePrice <= 0) {
      throw new Error(`Wholesale price for "${item.title}" must be greater than zero.`);
    }
    const tierValidation = validatePricingTiers(item.pricingTiers);
    if (!tierValidation.valid) {
      throw new Error(`Invalid tiered pricing for "${item.title}": ${tierValidation.error}`);
    }
    const effectiveUnitPrice = resolveEffectiveUnitPrice(basePrice, qty, item.pricingTiers);
    const lineTotal = roundCurrency(qty * effectiveUnitPrice);
    subtotal = roundCurrency(subtotal + lineTotal);
    snapshots.push({
      ...item,
      quantity: qty,
      moq,
      unitPrice: effectiveUnitPrice,
      lineTotal
    });
  }
  let taxTotal = 0;
  const itemTaxSum = snapshots.reduce((acc, item) => {
    const rate = typeof item.taxPercent === "number" && item.taxPercent > 0 ? item.taxPercent : 0;
    return acc + item.lineTotal * rate / 100;
  }, 0);
  if (itemTaxSum > 0) {
    taxTotal = roundCurrency(itemTaxSum);
  } else if (taxRatePercent > 0) {
    taxTotal = roundCurrency(subtotal * taxRatePercent / 100);
  }
  const grandTotal = roundCurrency(subtotal + taxTotal);
  return {
    subtotal,
    taxTotal,
    grandTotal,
    snapshots
  };
}
function generateQuotationNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampPart = Date.now().toString().slice(-4);
  return `KRV-QT-${year}-${timestampPart}${randomSuffix.slice(0, 2)}`;
}
function validateBuyerInput(buyer) {
  if (!buyer || !buyer.name || buyer.name.trim().length < 2) {
    return { valid: false, error: "Buyer or company contact name is required." };
  }
  if (buyer.email && !buyer.email.includes("@")) {
    return { valid: false, error: "Buyer email format is invalid." };
  }
  return { valid: true };
}

// src/server/quotation/quotation_pdf.ts
var import_pdfkit = __toESM(require("pdfkit"), 1);
function formatMoney(amount, currency = "INR") {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${currency} ${formatted}`;
}
async function generateQuotationPdf(quotation) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new import_pdfkit.default({
        size: "A4",
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Wholesale Quotation - ${quotation.quotationNumber}`,
          Author: quotation.seller.brandName || quotation.seller.businessName || "KRIVIO Artisan",
          Subject: "Wholesale B2B Craft Quotation",
          Creator: "KRIVIO AI Platform"
        }
      });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));
      const emerald = "#0F5132";
      const gold = "#D4AF37";
      const charcoal = "#1C1917";
      const muted = "#57534E";
      const lightBg = "#F5F5F4";
      const borderCol = "#E7E5E4";
      const startX = 40;
      let currentY = 40;
      const contentWidth = 515;
      doc.rect(startX, currentY, contentWidth, 4).fill(emerald);
      currentY += 15;
      const brandName = quotation.seller.brandName || quotation.seller.businessName || "Artisan Craft Enterprise";
      const businessName = quotation.seller.businessName || "";
      const monogramText = brandName.slice(0, 2).toUpperCase();
      doc.circle(startX + 22, currentY + 22, 22).fillAndStroke(lightBg, gold);
      doc.font("Helvetica-Bold").fontSize(14).fillColor(emerald);
      doc.text(monogramText, startX + 10, currentY + 14, { width: 24, align: "center" });
      doc.font("Helvetica-Bold").fontSize(16).fillColor(emerald);
      doc.text(brandName, startX + 55, currentY + 4, { width: 280 });
      doc.font("Helvetica").fontSize(9).fillColor(muted);
      let sellerDetails = "";
      if (businessName && businessName !== brandName) sellerDetails += `${businessName}
`;
      if (quotation.seller.ownerName) sellerDetails += `Contact: ${quotation.seller.ownerName} | `;
      if (quotation.seller.phone) sellerDetails += `Phone: ${quotation.seller.phone}
`;
      if (quotation.seller.email) sellerDetails += `Email: ${quotation.seller.email} | `;
      if (quotation.seller.state) sellerDetails += `Location: ${quotation.seller.district ? quotation.seller.district + ", " : ""}${quotation.seller.state}
`;
      if (quotation.seller.gstNumber) sellerDetails += `GSTIN: ${quotation.seller.gstNumber}`;
      doc.text(sellerDetails.trim(), startX + 55, currentY + 24, { width: 280 });
      doc.rect(startX + 345, currentY, 170, 78).fillAndStroke("#FAFAF9", borderCol);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(emerald);
      doc.text("WHOLESALE QUOTATION", startX + 355, currentY + 8, { width: 150, align: "right" });
      doc.font("Helvetica-Bold").fontSize(9).fillColor(charcoal);
      doc.text(`Quote No: ${quotation.quotationNumber}`, startX + 355, currentY + 24, { width: 150, align: "right" });
      doc.font("Helvetica").fontSize(8.5).fillColor(muted);
      doc.text(`Issue Date: ${quotation.createdAt.slice(0, 10)}`, startX + 355, currentY + 38, { width: 150, align: "right" });
      doc.text(`Valid Until: ${quotation.validUntil}`, startX + 355, currentY + 50, { width: 150, align: "right" });
      doc.text(`Currency: ${quotation.currency}`, startX + 355, currentY + 62, { width: 150, align: "right" });
      currentY += 92;
      doc.rect(startX, currentY, contentWidth, 54).fillAndStroke("#F0FDF4", "#86EFAC");
      doc.font("Helvetica-Bold").fontSize(9).fillColor(emerald);
      doc.text("PREPARED FOR (BUYER):", startX + 12, currentY + 8);
      doc.font("Helvetica-Bold").fontSize(11).fillColor(charcoal);
      doc.text(quotation.buyer.name + (quotation.buyer.company ? ` \u2014 ${quotation.buyer.company}` : ""), startX + 12, currentY + 20);
      doc.font("Helvetica").fontSize(8.5).fillColor(muted);
      const buyerContact = [
        quotation.buyer.email ? `Email: ${quotation.buyer.email}` : "",
        quotation.buyer.phone ? `Phone: ${quotation.buyer.phone}` : "",
        quotation.buyer.gstNumber ? `GST: ${quotation.buyer.gstNumber}` : "",
        quotation.buyer.address ? `Address: ${quotation.buyer.address}` : ""
      ].filter(Boolean).join(" | ");
      doc.text(buyerContact || "Direct Wholesale Inquirer", startX + 12, currentY + 35, { width: contentWidth - 24 });
      currentY += 68;
      const colX = {
        item: startX,
        sku: startX + 195,
        moq: startX + 275,
        qty: startX + 325,
        price: startX + 380,
        total: startX + 445
      };
      doc.rect(startX, currentY, contentWidth, 22).fill(emerald);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#FFFFFF");
      doc.text("PRODUCT & DESCRIPTION", colX.item + 8, currentY + 7);
      doc.text("SKU", colX.sku, currentY + 7);
      doc.text("MOQ", colX.moq, currentY + 7, { width: 45, align: "center" });
      doc.text("QTY", colX.qty, currentY + 7, { width: 45, align: "center" });
      doc.text("UNIT PRICE", colX.price, currentY + 7, { width: 60, align: "right" });
      doc.text("TOTAL", colX.total, currentY + 7, { width: 60, align: "right" });
      currentY += 22;
      quotation.items.forEach((item, index) => {
        if (currentY > 660) {
          doc.addPage();
          currentY = 40;
          doc.rect(startX, currentY, contentWidth, 4).fill(emerald);
          currentY += 15;
        }
        const rowHeight = item.description || item.material ? 38 : 26;
        const rowBg = index % 2 === 1 ? "#FAFAF9" : "#FFFFFF";
        doc.rect(startX, currentY, contentWidth, rowHeight).fillAndStroke(rowBg, borderCol);
        doc.font("Helvetica-Bold").fontSize(9).fillColor(charcoal);
        doc.text(item.title, colX.item + 8, currentY + 6, { width: 180, lineBreak: false, ellipsis: true });
        if (item.material || item.leadTime) {
          doc.font("Helvetica").fontSize(7.5).fillColor(muted);
          const sub = [item.material ? `Mat: ${item.material}` : "", item.leadTime ? `Lead: ${item.leadTime}` : ""].filter(Boolean).join(" | ");
          doc.text(sub, colX.item + 8, currentY + 19, { width: 180 });
        }
        doc.font("Helvetica").fontSize(8).fillColor(muted);
        doc.text(item.sku || "-", colX.sku, currentY + 8, { width: 75 });
        doc.font("Helvetica").fontSize(8.5).fillColor(charcoal);
        doc.text(String(item.moq || 1), colX.moq, currentY + 8, { width: 45, align: "center" });
        doc.font("Helvetica-Bold").fontSize(9).fillColor(emerald);
        doc.text(String(item.quantity), colX.qty, currentY + 8, { width: 45, align: "center" });
        doc.font("Helvetica").fontSize(8.5).fillColor(charcoal);
        doc.text(formatMoney(item.unitPrice, quotation.currency), colX.price, currentY + 8, { width: 60, align: "right" });
        doc.font("Helvetica-Bold").fontSize(9).fillColor(charcoal);
        doc.text(formatMoney(item.lineTotal, quotation.currency), colX.total, currentY + 8, { width: 60, align: "right" });
        currentY += rowHeight;
      });
      currentY += 8;
      const totalsBoxWidth = 220;
      const totalsBoxX = startX + contentWidth - totalsBoxWidth;
      doc.rect(totalsBoxX, currentY, totalsBoxWidth, quotation.taxTotal > 0 ? 68 : 48).fillAndStroke(lightBg, borderCol);
      doc.font("Helvetica").fontSize(9).fillColor(muted);
      doc.text("Subtotal:", totalsBoxX + 12, currentY + 10);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(charcoal);
      doc.text(formatMoney(quotation.subtotal, quotation.currency), totalsBoxX + 100, currentY + 10, { width: 108, align: "right" });
      if (quotation.taxTotal > 0) {
        doc.font("Helvetica").fontSize(9).fillColor(muted);
        doc.text("Tax / GST:", totalsBoxX + 12, currentY + 26);
        doc.font("Helvetica-Bold").fontSize(9).fillColor(charcoal);
        doc.text(formatMoney(quotation.taxTotal, quotation.currency), totalsBoxX + 100, currentY + 26, { width: 108, align: "right" });
      }
      const grandTotalY = quotation.taxTotal > 0 ? currentY + 44 : currentY + 28;
      doc.rect(totalsBoxX, grandTotalY - 4, totalsBoxWidth, 24).fill("#E6F4EA");
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(emerald);
      doc.text("Grand Total:", totalsBoxX + 12, grandTotalY + 3);
      doc.text(formatMoney(quotation.grandTotal, quotation.currency), totalsBoxX + 90, grandTotalY + 3, { width: 118, align: "right" });
      currentY += quotation.taxTotal > 0 ? 80 : 60;
      const stories = quotation.items.map((i) => i.craftStory).filter(Boolean);
      if (stories.length > 0) {
        if (currentY > 640) {
          doc.addPage();
          currentY = 40;
        }
        doc.rect(startX, currentY, contentWidth, 42).fillAndStroke("#FFFBEB", "#FDE68A");
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#B45309");
        doc.text("TRADITIONAL CRAFT & HERITAGE STORY:", startX + 10, currentY + 7);
        doc.font("Helvetica-Oblique").fontSize(8).fillColor("#78350F");
        doc.text(stories[0] || "Handmade with authentic traditional technique.", startX + 10, currentY + 18, {
          width: contentWidth - 20,
          lineBreak: false,
          ellipsis: true
        });
        currentY += 50;
      }
      if (currentY > 650) {
        doc.addPage();
        currentY = 40;
      }
      doc.rect(startX, currentY, contentWidth, 54).fillAndStroke(lightBg, borderCol);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(charcoal);
      doc.text("COMMERCIAL TERMS & ORDER NOTES:", startX + 10, currentY + 8);
      doc.font("Helvetica").fontSize(7.5).fillColor(muted);
      const leadTimes = quotation.items.map((i) => i.leadTime).filter(Boolean);
      const effectiveLead = leadTimes[0] || "7-14 business days upon order confirmation";
      const shippingTerms = quotation.shippingTerms || "Ex-Works / Standard Surface Courier. Shipping billed at actuals.";
      const paymentTerms = quotation.paymentTerms || "50% advance upon order placement, 50% prior to dispatch.";
      doc.text(`\u2022 Production Lead Time: ${effectiveLead}`, startX + 10, currentY + 21);
      doc.text(`\u2022 Delivery / Shipping: ${shippingTerms}`, startX + 10, currentY + 31);
      doc.text(`\u2022 Payment Terms: ${paymentTerms}`, startX + 10, currentY + 41);
      currentY += 66;
      doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(muted);
      doc.text(
        "Disclaimer: This wholesale quotation is prepared for commercial negotiation. Prices, delivery schedules, and commercial terms are subject to formal seller confirmation. This document is not a tax invoice.",
        startX,
        currentY,
        { width: contentWidth, align: "center" }
      );
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.rect(startX, 800, contentWidth, 0.5).fill(borderCol);
        doc.font("Helvetica").fontSize(7.5).fillColor(muted);
        doc.text(
          `${brandName} | Generated via KRIVIO AI Platform ("From Local Hands to Global Markets")`,
          startX,
          808,
          { width: contentWidth - 80 }
        );
        doc.text(`Page ${i + 1} of ${range.count}`, startX + contentWidth - 75, 808, { width: 75, align: "right" });
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// src/server/quotation/quotation_service.ts
var QuotationService = class {
  constructor(pool) {
    this.pool = pool;
  }
  /**
   * Creates a new quotation record with immutable snapshots of seller profile and products
   */
  async createQuotation(userId, dto) {
    const buyerValidation = validateBuyerInput(dto.buyer);
    if (!buyerValidation.valid) {
      throw new Error(buyerValidation.error || "Invalid buyer details");
    }
    const profileRes = await this.pool.query(
      `SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const userRes = await this.pool.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const profile = profileRes.rows[0] || {};
    const user = userRes.rows[0] || {};
    const sellerSnapshot = {
      businessName: profile.business_name || user.full_name || "Artisan Craft Enterprise",
      brandName: profile.brand_name || profile.business_name || user.full_name || "Artisan Enterprise",
      ownerName: user.full_name || "Artisan Proprietor",
      phone: profile.phone_number || user.phone_number || "",
      email: user.email || "",
      state: profile.state || "India",
      district: profile.district || "",
      village: profile.village || "",
      pinCode: profile.pin_code || "",
      gstNumber: profile.gst_number || "",
      businessRegistration: profile.business_registration || "",
      website: profile.website || "",
      logoUrl: user.profile_image || ""
    };
    const totals = calculateQuotationTotals(dto.items, dto.taxRatePercent || 0);
    const quotationId = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const quotationNumber = generateQuotationNumber();
    const validDays = dto.validDays && dto.validDays > 0 ? dto.validDays : 30;
    const validDate = /* @__PURE__ */ new Date();
    validDate.setDate(validDate.getDate() + validDays);
    const validUntilStr = validDate.toISOString().slice(0, 10);
    const currency = (dto.currency || "INR").toUpperCase();
    const insertQuery = `
      INSERT INTO quotations (
        id, user_id, quotation_number, buyer_name, buyer_company, buyer_email, buyer_phone,
        buyer_address, buyer_gst, currency, subtotal, tax_total, grand_total, valid_until,
        commercial_notes, shipping_terms, payment_terms, status, items_snapshot, seller_snapshot,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
      ) RETURNING *
    `;
    const res = await this.pool.query(insertQuery, [
      quotationId,
      userId,
      quotationNumber,
      dto.buyer.name.trim(),
      dto.buyer.company?.trim() || null,
      dto.buyer.email?.trim() || null,
      dto.buyer.phone?.trim() || null,
      dto.buyer.address?.trim() || null,
      dto.buyer.gstNumber?.trim() || null,
      currency,
      totals.subtotal,
      totals.taxTotal,
      totals.grandTotal,
      validUntilStr,
      dto.commercialNotes?.trim() || null,
      dto.shippingTerms?.trim() || null,
      dto.paymentTerms?.trim() || null,
      "generated",
      JSON.stringify(totals.snapshots),
      JSON.stringify(sellerSnapshot)
    ]);
    return this.mapRowToQuotation(res.rows[0]);
  }
  /**
   * Retrieves all quotations owned by the authenticated user
   */
  async getQuotations(userId) {
    const res = await this.pool.query(
      `SELECT * FROM quotations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map(this.mapRowToQuotation);
  }
  /**
   * Retrieves a single quotation with strict ownership enforcement
   */
  async getQuotationById(userId, quotationId) {
    const res = await this.pool.query(
      `SELECT * FROM quotations WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [quotationId, userId]
    );
    if (!res.rows[0]) return null;
    return this.mapRowToQuotation(res.rows[0]);
  }
  /**
   * Deletes a quotation with ownership check
   */
  async deleteQuotation(userId, quotationId) {
    const res = await this.pool.query(
      `DELETE FROM quotations WHERE id = $1 AND user_id = $2`,
      [quotationId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }
  /**
   * Generates a downloadable PDF buffer for a quotation
   */
  async renderPdf(userId, quotationId) {
    const quotation = await this.getQuotationById(userId, quotationId);
    if (!quotation) {
      throw new Error("Quotation not found or you do not have permission to access it.");
    }
    const buffer = await generateQuotationPdf(quotation);
    const filename = `krivio_quotation_${quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    return { buffer, filename };
  }
  mapRowToQuotation(row) {
    const items = Array.isArray(row.items_snapshot) ? row.items_snapshot : typeof row.items_snapshot === "string" ? JSON.parse(row.items_snapshot) : [];
    const seller = typeof row.seller_snapshot === "string" ? JSON.parse(row.seller_snapshot) : row.seller_snapshot || {};
    return {
      id: row.id,
      userId: row.user_id,
      quotationNumber: row.quotation_number,
      buyer: {
        name: row.buyer_name,
        company: row.buyer_company || void 0,
        email: row.buyer_email || void 0,
        phone: row.buyer_phone || void 0,
        address: row.buyer_address || void 0,
        gstNumber: row.buyer_gst || void 0
      },
      seller,
      currency: row.currency || "INR",
      subtotal: parseFloat(row.subtotal) || 0,
      taxTotal: parseFloat(row.tax_total) || 0,
      grandTotal: parseFloat(row.grand_total) || 0,
      validUntil: row.valid_until ? row.valid_until instanceof Date ? row.valid_until.toISOString().slice(0, 10) : String(row.valid_until).slice(0, 10) : "",
      commercialNotes: row.commercial_notes || void 0,
      shippingTerms: row.shipping_terms || void 0,
      paymentTerms: row.payment_terms || void 0,
      status: row.status || "draft",
      items,
      createdAt: row.created_at ? row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at) : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: row.updated_at ? row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at) : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};

// src/server/ai/domain_validators.ts
var DomainValidator = class {
  /**
   * Validate and sanitize ProductAnalysisResponse
   */
  static validateProductAnalysis(data) {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Product analysis must be an object" };
    }
    const productType = typeof data.productType === "string" && data.productType.trim() ? data.productType.trim() : "Handicraft Item";
    const category = typeof data.category === "string" && data.category.trim() ? data.category.trim() : "General Crafts";
    const visibleMaterials = Array.isArray(data.visibleMaterials) && data.visibleMaterials.length > 0 ? data.visibleMaterials.map((m) => String(m).trim()).filter(Boolean) : ["Natural Material"];
    const colors = Array.isArray(data.colors) ? data.colors.map((c) => String(c).trim()).filter(Boolean) : [];
    const shape = typeof data.shape === "string" ? data.shape.trim() : "";
    const craftCharacteristics = Array.isArray(data.craftCharacteristics) ? data.craftCharacteristics.map((c) => String(c).trim()).filter(Boolean) : [];
    const visualStyle = typeof data.visualStyle === "string" ? data.visualStyle.trim() : "Traditional / Artisan";
    const possibleUseCases = Array.isArray(data.possibleUseCases) ? data.possibleUseCases.map((u) => String(u).trim()).filter(Boolean) : [];
    const imgQuality = data.imageQualityAssessment || {};
    const imageQualityAssessment = {
      lighting: typeof imgQuality.lighting === "string" ? imgQuality.lighting : "Adequate",
      sharpness: typeof imgQuality.sharpness === "string" ? imgQuality.sharpness : "Adequate",
      composition: typeof imgQuality.composition === "string" ? imgQuality.composition : "Centered",
      backgroundQuality: typeof imgQuality.backgroundQuality === "string" ? imgQuality.backgroundQuality : "Neutral",
      recommendations: Array.isArray(imgQuality.recommendations) ? imgQuality.recommendations.map((r) => String(r).trim()).filter(Boolean) : []
    };
    const conf = data.confidenceScores || {};
    const categoryConfidence = typeof conf.categoryConfidence === "number" && conf.categoryConfidence >= 0 && conf.categoryConfidence <= 1 ? conf.categoryConfidence : 0.85;
    const materialConfidence = typeof conf.materialConfidence === "number" && conf.materialConfidence >= 0 && conf.materialConfidence <= 1 ? conf.materialConfidence : 0.8;
    const uncertainAttributes = Array.isArray(data.uncertainAttributes) ? data.uncertainAttributes.map((a) => String(a).trim()).filter(Boolean) : [];
    const clarificationQuestions = Array.isArray(data.clarificationQuestions) ? data.clarificationQuestions.map((q) => String(q).trim()).filter(Boolean) : [];
    if (productType.toLowerCase() === "handcrafted product" && category.toLowerCase() === "handicrafts" && visibleMaterials.length === 1 && visibleMaterials[0].toLowerCase() === "handicraft material") {
      return { valid: false, error: "Model returned generic static placeholder product analysis" };
    }
    return {
      valid: true,
      sanitized: {
        productType,
        category,
        visibleMaterials,
        colors,
        shape,
        craftCharacteristics,
        visualStyle,
        possibleUseCases,
        imageQualityAssessment,
        confidenceScores: { categoryConfidence, materialConfidence },
        uncertainAttributes,
        clarificationQuestions
      }
    };
  }
  /**
   * Validate and sanitize PhotoDiagnosisResponse
   */
  static validatePhotoDiagnosis(data) {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Photo diagnosis must be an object" };
    }
    const overallScore = typeof data.overallScore === "number" ? Math.max(0, Math.min(100, Math.round(data.overallScore))) : 70;
    const parseDimension = (dim, fallbackName) => {
      if (!dim || typeof dim !== "object") {
        return { score: 70, status: "fair", feedback: `${fallbackName} is acceptable.` };
      }
      const score = typeof dim.score === "number" ? Math.max(0, Math.min(100, Math.round(dim.score))) : 70;
      const status = dim.status === "good" || dim.status === "fair" || dim.status === "poor" ? dim.status : score >= 75 ? "good" : score >= 50 ? "fair" : "poor";
      const feedback = typeof dim.feedback === "string" && dim.feedback.trim() ? dim.feedback.trim() : `${fallbackName} score is ${score}.`;
      return { score, status, feedback };
    };
    const dimensions = {
      lighting: parseDimension(data.dimensions?.lighting, "Lighting"),
      background: parseDimension(data.dimensions?.background, "Background"),
      framing: parseDimension(data.dimensions?.framing, "Framing"),
      sharpness: parseDimension(data.dimensions?.sharpness, "Sharpness"),
      productVisibility: parseDimension(data.dimensions?.productVisibility, "Product Visibility")
    };
    const keyIssues = Array.isArray(data.keyIssues) ? data.keyIssues.map((i) => String(i).trim()).filter(Boolean) : [];
    const actionableImprovements = Array.isArray(data.actionableImprovements) ? data.actionableImprovements.map((i) => String(i).trim()).filter(Boolean) : [];
    const mc = data.marketplaceCompliance || {};
    const marketplaceCompliance = {
      amazonReady: Boolean(mc.amazonReady ?? overallScore >= 80),
      flipkartReady: Boolean(mc.flipkartReady ?? overallScore >= 75),
      meeshoReady: Boolean(mc.meeshoReady ?? overallScore >= 65),
      ondcReady: Boolean(mc.ondcReady ?? overallScore >= 70),
      issuesToFix: Array.isArray(mc.issuesToFix) ? mc.issuesToFix.map((i) => String(i).trim()).filter(Boolean) : []
    };
    return {
      valid: true,
      sanitized: {
        overallScore,
        dimensions,
        keyIssues,
        actionableImprovements,
        marketplaceCompliance
      }
    };
  }
  /**
   * Validate and sanitize BrandSuggestionResponse
   */
  static validateBrandSuggestions(data) {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Brand suggestion must be an object" };
    }
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    if (suggestions.length === 0) {
      return { valid: false, error: "At least one brand suggestion is required" };
    }
    const sanitizedSuggestions = suggestions.map((s, idx) => ({
      name: typeof s.name === "string" && s.name.trim() ? s.name.trim() : `CraftBrand ${idx + 1}`,
      tagline: typeof s.tagline === "string" ? s.tagline.trim() : "Artisanal Excellence",
      meaning: typeof s.meaning === "string" ? s.meaning.trim() : "Rooted in authentic tradition",
      culturalRelevance: typeof s.culturalRelevance === "string" ? s.culturalRelevance.trim() : "Indian Heritage",
      targetAppeal: typeof s.targetAppeal === "string" ? s.targetAppeal.trim() : "Art & Quality Lovers"
    }));
    const staticNames = ["kalagram", "hastkraft", "mittimool", "bharathast"];
    const namesLower = sanitizedSuggestions.map((s) => s.name.toLowerCase());
    const isCanned = staticNames.every((n) => namesLower.includes(n));
    if (isCanned) {
      return { valid: false, error: "Model returned canned static brand list" };
    }
    return {
      valid: true,
      sanitized: {
        suggestions: sanitizedSuggestions,
        personality: typeof data.personality === "string" ? data.personality : "Authentic",
        craftHeritage: typeof data.craftHeritage === "string" ? data.craftHeritage : "Indian Crafts",
        language: typeof data.language === "string" ? data.language : "en"
      }
    };
  }
  /**
   * Validate and sanitize ProductIdentityResponse
   */
  static validateProductIdentity(data) {
    if (!data || typeof data !== "object") {
      return { valid: false, error: "Product identity must be an object" };
    }
    const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : "";
    if (!title) {
      return { valid: false, error: "Product title is required" };
    }
    const shortDescription = typeof data.shortDescription === "string" ? data.shortDescription.trim() : "";
    const detailedDescription = typeof data.detailedDescription === "string" ? data.detailedDescription.trim() : "";
    const story = typeof data.story === "string" ? data.story.trim() : "";
    const bulletFeatures = Array.isArray(data.bulletFeatures) ? data.bulletFeatures.map((f) => String(f).trim()).filter(Boolean) : [];
    const specifications = data.specifications && typeof data.specifications === "object" ? data.specifications : {};
    const careInstructions = typeof data.careInstructions === "string" ? data.careInstructions.trim() : "";
    const keywords = Array.isArray(data.keywords) ? data.keywords.map((k) => String(k).trim()).filter(Boolean) : [];
    const tags = Array.isArray(data.tags) ? data.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const targetAudience = typeof data.targetAudience === "string" ? data.targetAudience.trim() : "Art & Craft Enthusiasts";
    const suggestedPriceRationale = typeof data.suggestedPriceRationale === "string" ? data.suggestedPriceRationale.trim() : void 0;
    const language = typeof data.language === "string" ? data.language : "en";
    return {
      valid: true,
      sanitized: {
        title,
        shortDescription,
        detailedDescription,
        story,
        bulletFeatures,
        specifications,
        careInstructions,
        keywords,
        tags,
        targetAudience,
        suggestedPriceRationale,
        language
      }
    };
  }
};

// src/server/ai/gemini_client.ts
var import_genai2 = require("@google/genai");
var GeminiService = class _GeminiService {
  constructor() {
    this.client = null;
  }
  static {
    this.DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  }
  static {
    this.FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];
  }
  getClient() {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey.trim()) {
        this.client = new import_genai2.GoogleGenAI({
          apiKey: apiKey.trim(),
          httpOptions: {
            headers: {
              "User-Agent": "krivio-ai-backend"
            }
          }
        });
      }
    }
    return this.client;
  }
  isAvailable() {
    return Boolean(this.getClient());
  }
  /**
   * Health diagnostic check
   */
  async checkHealth() {
    const client = this.getClient();
    if (!client) {
      return {
        healthy: false,
        model: _GeminiService.DEFAULT_MODEL,
        message: "GEMINI_API_KEY is not configured on the server."
      };
    }
    try {
      const response = await client.models.generateContent({
        model: _GeminiService.DEFAULT_MODEL,
        contents: "Respond with the word OK."
      });
      const text = response.text || "";
      return {
        healthy: true,
        model: _GeminiService.DEFAULT_MODEL,
        message: text.trim().slice(0, 100)
      };
    } catch (err) {
      return {
        healthy: false,
        model: _GeminiService.DEFAULT_MODEL,
        message: err.message || String(err)
      };
    }
  }
  /**
   * Core generation call with structured JSON, multimodal handling, and bounded transient retry
   */
  async generateContent(options) {
    const client = this.getClient();
    if (!client) {
      throw new Error("GEMINI_API_KEY is not configured on the server. AI features cannot proceed without valid credentials.");
    }
    const primaryModel = options.model || _GeminiService.DEFAULT_MODEL;
    const modelsToTry = [primaryModel, ..._GeminiService.FALLBACK_MODELS.filter((m) => m !== primaryModel)];
    const maxRetries = options.maxRetries ?? 2;
    const contents = [];
    if (options.inlineMedia && options.inlineMedia.length > 0) {
      for (const media of options.inlineMedia) {
        const cleanBase64 = media.data.replace(/^data:[^;]+;base64,/, "");
        contents.push({
          inlineData: {
            mimeType: media.mimeType,
            data: cleanBase64
          }
        });
      }
    }
    contents.push({
      text: options.userPrompt
    });
    const config = {};
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (typeof options.temperature === "number") {
      config.temperature = options.temperature;
    }
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }
    let lastError = null;
    for (const currentModel of modelsToTry) {
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const response = await client.models.generateContent({
            model: currentModel,
            contents,
            config: Object.keys(config).length > 0 ? config : void 0
          });
          const textResult = response.text;
          if (textResult !== void 0 && textResult !== null) {
            return textResult;
          }
          const parts = response.candidates?.[0]?.content?.parts;
          if (parts && parts.length > 0 && parts[0].text) {
            return parts[0].text;
          }
          throw new Error("Gemini returned an empty candidate or text response.");
        } catch (err) {
          lastError = err;
          attempt++;
          const isDailyQuotaExhausted = err.message && (err.message.includes("PerDay") || err.message.includes("daily") || err.message.includes("GenerateRequestsPerDay"));
          const isTransient = !isDailyQuotaExhausted && (err.status === 429 || err.status === 503 || err.status === 500 || err.status === "UNAVAILABLE" || err.status === "RESOURCE_EXHAUSTED" || err.message && (err.message.includes("ResourceExhausted") || err.message.includes("overloaded") || err.message.includes("high demand") || err.message.includes("UNAVAILABLE") || err.message.includes("EAI_AGAIN")));
          const hasAlternateModel = modelsToTry.some((m) => m !== currentModel);
          if ((err.status === 503 || err.status === "UNAVAILABLE" || err.message && err.message.includes("high demand")) && hasAlternateModel) {
            console.warn(`[GeminiClient] Fast failover from ${currentModel} to alternate model due to demand spike.`);
            break;
          }
          if (isTransient && attempt <= (options.maxRetries ?? 2)) {
            let delayMs = Math.min(Math.pow(2, attempt) * 1e3, 4e3);
            if (err.status === 429 || err.message && err.message.includes("quota")) {
              let parsedSeconds = 0;
              const match = typeof err.message === "string" ? err.message.match(/retry in ([0-9.]+)s/i) : null;
              if (match && match[1]) {
                parsedSeconds = Math.ceil(parseFloat(match[1]));
              }
              delayMs = Math.min(Math.max(delayMs, parsedSeconds > 0 ? (parsedSeconds + 1) * 1e3 : 3e3), 6e3);
            }
            console.warn(`[GeminiClient] Transient error on model ${currentModel} attempt ${attempt}/${maxRetries}. Retrying in ${delayMs}ms:`, err.message || err);
            await new Promise((r) => setTimeout(r, delayMs));
          } else {
            if (isDailyQuotaExhausted) {
              console.warn(`[GeminiClient] Daily quota limit reached (${currentModel}). Halting immediate retries.`);
            }
            break;
          }
        }
      }
      const shouldTryNextModel = lastError && (lastError.status === 429 || lastError.status === 503 || lastError.status === "UNAVAILABLE" || lastError.status === "RESOURCE_EXHAUSTED" || typeof lastError.message === "string" && (lastError.message.includes("503") || lastError.message.includes("UNAVAILABLE") || lastError.message.includes("high demand") || lastError.message.includes("ResourceExhausted")));
      if (shouldTryNextModel) {
        console.warn(`[GeminiClient] Model ${currentModel} failed with ${lastError.status || "transient error"}. Checking alternate model...`);
        continue;
      }
      break;
    }
    console.error(`[GeminiClient] Exhausted all model attempts:`, lastError?.message || lastError);
    throw lastError;
  }
};
var geminiService = new GeminiService();

// src/server/ai/observability.ts
var AIObservabilityPipeline = class {
  constructor() {
    this.inMemoryLogs = [];
    this.maxLogRetention = 200;
  }
  logStart(requestId, task, model, userId, productId) {
    console.log(`[AI Diagnostics] \u25B6 START req=${requestId} task=${task} model=${model} user=${userId ? userId.substring(0, 8) + "..." : "anon"}${productId ? " prod=" + productId : ""}`);
  }
  recordTelemetry(record) {
    this.inMemoryLogs.push(record);
    if (this.inMemoryLogs.length > this.maxLogRetention) {
      this.inMemoryLogs.shift();
    }
    const status = record.success ? "\u2714 SUCCESS" : "\u2716 FAILURE";
    const fallbackInfo = record.fallbackUsed ? ` (Fallback: ${record.fallbackReason})` : "";
    console.log(
      `[AI Diagnostics] ${status} req=${record.requestId} task=${record.task} model=${record.model} duration=${record.durationMs}ms${fallbackInfo}${record.error ? " error=" + record.error : ""}`
    );
  }
  getRecentLogs(limit = 50) {
    return this.inMemoryLogs.slice(-limit);
  }
  getHealthSummary() {
    if (this.inMemoryLogs.length === 0) {
      return { totalRequests: 0, successRate: 100, fallbackCount: 0, averageDurationMs: 0 };
    }
    const total = this.inMemoryLogs.length;
    const successes = this.inMemoryLogs.filter((l) => l.success).length;
    const fallbacks = this.inMemoryLogs.filter((l) => l.fallbackUsed).length;
    const totalDuration = this.inMemoryLogs.reduce((acc, l) => acc + l.durationMs, 0);
    return {
      totalRequests: total,
      successRate: Math.round(successes / total * 100),
      fallbackCount: fallbacks,
      averageDurationMs: Math.round(totalDuration / total)
    };
  }
};
var aiObservability = new AIObservabilityPipeline();

// src/server/ai/prompt_registry.ts
var LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (\u0939\u093F\u0902\u0926\u0940)",
  mr: "Marathi (\u092E\u0930\u093E\u0920\u0940)",
  gu: "Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0)",
  ta: "Tamil (\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD)",
  bn: "Bengali (\u09AC\u09BE\u0982\u09B2\u09BE)",
  as: "Assamese (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE)"
};
var PromptRegistry = class {
  static {
    this.VERSIONS = {
      MENTOR: "MENTOR_PROMPT_V2",
      PRODUCT_ANALYSIS: "PRODUCT_ANALYSIS_V2",
      PHOTO_DIAGNOSIS: "PHOTO_DIAGNOSIS_V2",
      BRAND_SUGGESTION: "BRAND_SUGGESTION_V2",
      PRODUCT_IDENTITY: "PRODUCT_IDENTITY_V2",
      PRICING_EXPLANATION: "PRICING_EXPLANATION_V2",
      MARKETING_ASSISTANT: "MARKETING_ASSISTANT_V2"
    };
  }
  /**
   * Helper to format language directive
   */
  static getLanguageDirective(lang) {
    const code = (lang || "en").toLowerCase();
    const langName = LANGUAGE_NAMES[code] || "English";
    return `CRITICAL LANGUAGE REQUIREMENT: You MUST compose your final response directly in ${langName}. If the user input is written in vernacular script or code-mixed vernacular (e.g. Hinglish or Marathi in Roman script), match their vernacular natural flow warmly and fluently while preserving product names and numbers clearly.`;
  }
  /**
   * Helper to format contextual boundary for user & product data
   */
  static formatContextBlock(req) {
    const parts = [];
    if (req.userContext) {
      parts.push(`USER CONTEXT:
- User ID: ${req.userContext.userId}
- User Name: ${req.userContext.name || "Artisan"}
- State: ${req.userContext.state || "India"}`);
    }
    if (req.businessContext) {
      parts.push(`BUSINESS CONTEXT:
- Business Name: ${req.businessContext.businessName || "Artisan Business"}
- Business Type: ${req.businessContext.businessType || "Handicrafts / SHG"}
- Craft Type: ${req.businessContext.craftType || "Handmade"}
- Target Channels: ${(req.businessContext.targetChannels || []).join(", ") || "Local & Online"}
- Brand Personality: ${req.businessContext.brandPersonality || "Authentic & Traditional"}`);
    }
    if (req.productContext) {
      parts.push(`ACTIVE PRODUCT CONTEXT:
- Product Name: ${req.productContext.name || "Unnamed Product"}
- Category: ${req.productContext.category || "Handicraft"}
- Confirmed Materials: ${(req.productContext.materials || []).join(", ") || "Not explicitly confirmed"}
- Current/Base Price: ${req.productContext.price ? "\u20B9" + req.productContext.price : "Not set"}
- Description: ${req.productContext.description || "None provided"}`);
    }
    return parts.length > 0 ? parts.join("\n\n") : "NO PRIOR BUSINESS CONTEXT AVAILABLE.";
  }
  /**
   * Build MENTOR prompt
   */
  static buildMentorPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const contextBlock = this.formatContextBlock(req);
    const systemInstruction = `You are KRIVIO AI Mentor, an expert business mentor for rural artisans, weavers, SHGs, and traditional craftspeople in India.
Your mission is to provide practical, high-value, actionable business guidance on pricing, online listing (ONDC, Amazon Karigar, Meesho, Etsy), marketing, packaging, raw material sourcing, and government schemes.

RULES OF ENGAGEMENT:
1. ALWAYS answer the user's SPECIFIC question directly. Do NOT give canned generic advice.
2. Incorporate the user's specific product, craft, and business context whenever relevant. If they ask about brass lamps, answer specifically for brass lamps. If they ask about ceramic mugs, answer specifically for ceramics.
3. If they ask a general question (e.g. "What is GST?"), answer directly without forcing unrelated product context.
4. If crucial business information is missing to give exact numbers, clearly explain what is missing and ask a direct, helpful clarifying question.
5. NEVER fabricate false guarantees, legal certifications, or government scheme eligibility without facts.
6. ${langDirective}

OUTPUT FORMAT:
Respond with a valid JSON object matching this schema:
{
  "response": "Detailed, friendly, actionable mentor guidance with clear steps",
  "intent": "PRICING_ADVICE | MARKETING_ADVICE | PACKAGING_ADVICE | BOUTIQUE_OUTREACH | MARKETPLACE_LISTING | SCHEME_GUIDANCE | GENERAL_ADVICE",
  "entities": {
    "product": "identified product if any",
    "channel": "target channel if any",
    "keyTopic": "core topic discussed"
  },
  "recommendedActions": [
    "Concrete action step 1",
    "Concrete action step 2"
  ],
  "suggestedFollowUps": [
    "Question the user might want to ask next 1",
    "Question the user might want to ask next 2"
  ],
  "language": "${req.language || "en"}"
}`;
    const userPrompt = `CONTEXT INFORMATION:
${contextBlock}

[UNTRUSTED_USER_INPUT]
${req.userInput || "Hello mentor, please guide me on expanding my craft business."}
[/UNTRUSTED_USER_INPUT]`;
    return { systemInstruction, userPrompt };
  }
  /**
   * Build PRODUCT_ANALYSIS prompt for multimodal vision
   */
  static buildProductAnalysisPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const systemInstruction = `You are KRIVIO Vision AI, an expert computer-vision product inspector specializing in authentic Indian handicrafts, textiles, pottery, metal crafts, wood carving, jewelry, and rural artisan products.

TASK:
Perform a deep multimodal inspection of the uploaded product image. Visually analyze the item's physical characteristics with precision.

STRICT VISUAL INSPECTION RULES:
1. ONLY report what is visibly identifiable from the image.
2. If the material cannot be determined with certainty from visual cues alone, place it in "uncertainAttributes" and provide a helpful question in "clarificationQuestions".
3. Distinguish between OBSERVED facts (colors, visible texture, shape, form) and INFERRED assumptions (e.g. possible brass vs bronze alloy, possible silk vs rayon).
4. Evaluate real image quality (lighting, sharpness, composition, background clutter) based on commercial e-commerce standards (Amazon, ONDC, Meesho).
5. DO NOT return static placeholder values.
6. ${langDirective}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "productType": "Specific type of product (e.g., 'Handcrafted Brass Diya Lamp', 'Blue Pottery Coffee Mug', 'Kalamkari Handblock Print Saree')",
  "category": "High level category (e.g., 'Metal Craft', 'Ceramics & Pottery', 'Handloom Textiles', 'Woodwork')",
  "visibleMaterials": ["Primary visible material", "Secondary material"],
  "colors": ["Dominant color 1", "Accent color 2"],
  "shape": "Description of shape and silhouette",
  "craftCharacteristics": ["Visible craft technique, e.g. Dokra casting, hand-turned, zari border"],
  "visualStyle": "Style aesthetic, e.g. Traditional Folk, Minimal Modern, Ornate Heritage",
  "possibleUseCases": ["Home decor", "Pooja ritual", "Gift item"],
  "imageQualityAssessment": {
    "lighting": "Assessment of lighting quality",
    "sharpness": "Assessment of focus and sharpness",
    "composition": "Assessment of framing and angles",
    "backgroundQuality": "Assessment of background cleanliness",
    "recommendations": ["Actionable photography tip 1", "Actionable photography tip 2"]
  },
  "confidenceScores": {
    "categoryConfidence": 0.95,
    "materialConfidence": 0.85
  },
  "uncertainAttributes": ["Attributes needing artisan confirmation"],
  "clarificationQuestions": ["Specific questions to ask artisan to verify craft provenance"]
}`;
    const userPrompt = `Please inspect this product image in detail and extract structured product intelligence.`;
    return { systemInstruction, userPrompt };
  }
  /**
   * Build PHOTO_DIAGNOSIS prompt for e-commerce catalog readiness
   */
  static buildPhotoDiagnosisPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const systemInstruction = `You are KRIVIO Photo Quality Diagnostic Engine.
Evaluate the uploaded artisan product photo for e-commerce readiness across Amazon Karigar, Flipkart Samarth, Meesho, and ONDC.

EVALUATION CRITERIA:
1. Lighting: Is it well-lit, free from harsh shadows, under-exposure, or blown highlights?
2. Background: Is it clean, non-distracting, or pure white/neutral as required by major marketplaces?
3. Framing: Is the product centered, occupying 80%+ of the frame without getting cropped?
4. Sharpness: Is the texture and craft detail in sharp focus without motion blur?
5. Product Visibility: Are key craft features clearly visible to prospective buyers?

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "overallScore": 82,
  "dimensions": {
    "lighting": { "score": 85, "status": "good", "feedback": "Specific feedback on lighting in this image" },
    "background": { "score": 60, "status": "fair", "feedback": "Specific feedback on background in this image" },
    "framing": { "score": 90, "status": "good", "feedback": "Specific feedback on framing in this image" },
    "sharpness": { "score": 80, "status": "good", "feedback": "Specific feedback on sharpness in this image" },
    "productVisibility": { "score": 88, "status": "good", "feedback": "Specific feedback on product visibility in this image" }
  },
  "keyIssues": ["Concrete issue identified in this specific photo 1"],
  "actionableImprovements": ["Simple step artisan can take right now with smartphone 1"],
  "marketplaceCompliance": {
    "amazonReady": true,
    "flipkartReady": true,
    "meeshoReady": true,
    "ondcReady": true,
    "issuesToFix": ["Requirement that fails marketplace guideline"]
  }
}
${langDirective}`;
    const userPrompt = `Diagnose this product photo's e-commerce readiness and provide actionable smartphone photography tips.`;
    return { systemInstruction, userPrompt };
  }
  /**
   * Build BRAND_SUGGESTION prompt
   */
  static buildBrandSuggestionPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const contextBlock = this.formatContextBlock(req);
    const personality = req.parameters?.personality || req.businessContext?.brandPersonality || "Traditional Heritage";
    const craft = req.productContext?.category || req.businessContext?.craftType || "Indian Handicrafts";
    const productName = req.productContext?.name || "Artisan Craft";
    const systemInstruction = `You are KRIVIO Brand Strategist for Indian rural artisans, craft clusters, and handloom enterprises.
Your task is to generate culturally evocative, commercially appealing brand names and identities tailored to the SPECIFIC craft, material, and brand personality.

CRITICAL RULES:
1. Brand names MUST be deeply inspired by the actual craft and product provided (${productName}, ${craft}).
2. For Brass items: names should evoke radiance, metalwork, heritage, sacred light, craftsmanship.
3. For Ceramics/Pottery: names should evoke earth, clay, warmth, wheel, terracotta, aesthetic dining.
4. For Handloom/Textiles: names should evoke weaves, threads, warp and weft, drape, Indian motifs.
5. NEVER return generic static names (do NOT return KalaGram, HastKraft, MittiMool, BharatHast).
6. Provide distinct names tailored to the requested personality: "${personality}".
7. ${langDirective}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "suggestions": [
    {
      "name": "Distinct Brand Name 1",
      "tagline": "Evocative Tagline in appropriate language",
      "meaning": "Linguistic root and meaning of the name",
      "culturalRelevance": "Connection to craft heritage, geography, or technique",
      "targetAppeal": "Why modern buyers will connect with this name"
    },
    {
      "name": "Distinct Brand Name 2",
      "tagline": "Evocative Tagline 2",
      "meaning": "Meaning 2",
      "culturalRelevance": "Cultural root 2",
      "targetAppeal": "Appeal 2"
    },
    {
      "name": "Distinct Brand Name 3",
      "tagline": "Evocative Tagline 3",
      "meaning": "Meaning 3",
      "culturalRelevance": "Cultural root 3",
      "targetAppeal": "Appeal 3"
    },
    {
      "name": "Distinct Brand Name 4",
      "tagline": "Evocative Tagline 4",
      "meaning": "Meaning 4",
      "culturalRelevance": "Cultural root 4",
      "targetAppeal": "Appeal 4"
    }
  ],
  "personality": "${personality}",
  "craftHeritage": "${craft}",
  "language": "${req.language || "en"}"
}`;
    const userPrompt = `CONTEXT INFORMATION:
${contextBlock}

Generate 4 unique brand names tailored specifically to this craft, product, and brand personality.`;
    return { systemInstruction, userPrompt };
  }
  /**
   * Build PRODUCT_IDENTITY prompt (Descriptions, bullet points, tags, craft story)
   */
  static buildProductIdentityPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const contextBlock = this.formatContextBlock(req);
    const systemInstruction = `You are KRIVIO Catalog Copywriter, crafting compelling, high-converting product listings for Indian artisans selling on Amazon Karigar, ONDC, Etsy, and Meesho.

RULES:
1. Use ONLY verified product facts from context or visual observations.
2. DO NOT invent false dimensions, weights, certifications, or GI tags that were not confirmed.
3. Write an evocative artisan craft story highlighting traditional human hands, authenticity, and cultural heritage.
4. Craft concise, high-converting bullet points emphasizing benefits, usage, and care.
5. Generate high-intent SEO tags and search keywords relevant to Indian and global craft shoppers.
6. ${langDirective}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "title": "Clear, SEO-rich product title (60-80 characters)",
  "shortDescription": "Compelling 2-sentence summary for mobile shoppers",
  "detailedDescription": "Rich multi-paragraph description with artisan context",
  "story": "The artisan heritage, inspiration, and handmade craft story behind this piece",
  "bulletFeatures": [
    "Feature & Benefit 1",
    "Feature & Benefit 2",
    "Feature & Benefit 3",
    "Feature & Benefit 4"
  ],
  "specifications": {
    "Material": "Confirmed material",
    "Craft Type": "Craft technique",
    "Artisan Region": "State / Craft cluster if known"
  },
  "careInstructions": "Practical care and cleaning guidelines for longevity",
  "keywords": ["search keyword 1", "search keyword 2", "search keyword 3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "targetAudience": "Ideal buyer persona",
  "suggestedPriceRationale": "Brief explanation of value factors justifying pricing",
  "language": "${req.language || "en"}"
}`;
    const userPrompt = `CONTEXT INFORMATION:
${contextBlock}

[UNTRUSTED_USER_INPUT]
${req.userInput || "Generate complete product listing copy and craft identity for this item."}
[/UNTRUSTED_USER_INPUT]`;
    return { systemInstruction, userPrompt };
  }
  /**
   * Build PRICING_EXPLANATION prompt
   */
  static buildPricingExplanationPrompt(req) {
    const langDirective = this.getLanguageDirective(req.language);
    const contextBlock = this.formatContextBlock(req);
    const breakdown = req.parameters?.pricingBreakdown || {};
    const systemInstruction = `You are KRIVIO Pricing Advisor, helping rural artisans understand their costs, fair profit margins, and marketplace pricing.

RULES:
1. The mathematical calculation is ALREADY DETERMINISTICALLY COMPUTED. DO NOT recalculate or change the numbers.
2. Explain to the artisan in simple, encouraging terms WHY their work is worth this price.
3. Help them understand direct costs vs profit margin vs marketplace commission fees.
4. ${langDirective}

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "explanation": "Clear, encouraging explanation of the calculated pricing structure in the artisan's language",
  "marginAdvice": "Advice on whether this margin allows sustainable artisan livelihood",
  "marketplaceTip": "How to handle marketplace commissions on platforms like Amazon or Meesho without losing money",
  "wholesaleGuidance": "How to quote if a bulk or boutique buyer approaches them",
  "language": "${req.language || "en"}"
}`;
    const userPrompt = `DETERMINISTIC PRICING BREAKDOWN:
- Direct Material Cost: \u20B9${breakdown.materialCost || 0}
- Direct Labor Cost: \u20B9${breakdown.laborCost || 0}
- Packaging Cost: \u20B9${breakdown.packagingCost || 0}
- Transport / Shipping Cost: \u20B9${breakdown.transportCost || 0}
- Allocated Overhead: \u20B9${breakdown.overheadCost || 0}
- Total Direct Cost: \u20B9${breakdown.totalDirectCost || 0}
- Target Profit Margin: ${breakdown.marginPercentage || 25}%
- Fair Direct / Retail Price: \u20B9${breakdown.fairRetailPrice || 0}
- Recommended Marketplace Price (with ${breakdown.platformFeePercentage || 15}% fee): \u20B9${breakdown.marketplacePrice || 0}
- Recommended Wholesale Price: \u20B9${breakdown.wholesalePrice || 0}

${contextBlock}

Explain this pricing structure clearly to the artisan so they feel confident quoting it to buyers.`;
    return { systemInstruction, userPrompt };
  }
};

// src/server/ai/task_router.ts
var AITaskRouter = class {
  /**
   * Main entry point to route AI requests safely and context-aware
   */
  static async handle(req) {
    const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startTime = Date.now();
    const task = req.task;
    const model = GeminiService_Model;
    aiObservability.logStart(requestId, task, model, req.userContext?.userId, req.productContext?.id);
    try {
      let result;
      switch (task) {
        case "MENTOR":
          result = await this.handleMentor(req);
          break;
        case "PRODUCT_ANALYSIS":
          result = await this.handleProductAnalysis(req);
          break;
        case "PHOTO_DIAGNOSIS":
          result = await this.handlePhotoDiagnosis(req);
          break;
        case "BRAND_SUGGESTION":
          result = await this.handleBrandSuggestion(req);
          break;
        case "PRODUCT_IDENTITY":
          result = await this.handleProductIdentity(req);
          break;
        default:
          throw new Error(`Unsupported AI task: ${task}`);
      }
      const durationMs = Date.now() - startTime;
      aiObservability.recordTelemetry({
        requestId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        task,
        model,
        userId: req.userContext?.userId,
        productId: req.productContext?.id,
        durationMs,
        success: true,
        fallbackUsed: false
      });
      return result;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      aiObservability.recordTelemetry({
        requestId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        task,
        model,
        userId: req.userContext?.userId,
        productId: req.productContext?.id,
        durationMs,
        success: false,
        fallbackUsed: false,
        error: err.message || String(err)
      });
      console.error(`[AITaskRouter] Error handling ${task}:`, err);
      throw err;
    }
  }
  /**
   * Handle MENTOR task
   */
  static async handleMentor(req) {
    const { systemInstruction, userPrompt } = PromptRegistry.buildMentorPrompt(req);
    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: "application/json",
      temperature: 0.7
    });
    try {
      const parsed = JSON.parse(raw);
      return {
        response: parsed.response || raw,
        intent: parsed.intent || "GENERAL_ADVICE",
        entities: parsed.entities || {},
        recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
        suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
        language: parsed.language || req.language || "en"
      };
    } catch (parseErr) {
      return {
        response: raw.trim(),
        intent: "GENERAL_ADVICE",
        entities: {},
        recommendedActions: [],
        suggestedFollowUps: [],
        language: req.language || "en"
      };
    }
  }
  /**
   * Handle PRODUCT_ANALYSIS multimodal vision task
   */
  static async handleProductAnalysis(req) {
    if (!req.imageInput || !req.imageInput.base64Data) {
      throw new Error("An image payload is required for product analysis inspection.");
    }
    const { systemInstruction, userPrompt } = PromptRegistry.buildProductAnalysisPrompt(req);
    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      inlineMedia: [
        {
          mimeType: req.imageInput.mimeType || "image/jpeg",
          data: req.imageInput.base64Data
        }
      ],
      responseMimeType: "application/json",
      temperature: 0.2
      // Low temperature for factual precision
    });
    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateProductAnalysis(parsed);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Product analysis failed domain validation: ${validation.error}`);
    }
    return validation.sanitized;
  }
  /**
   * Handle PHOTO_DIAGNOSIS task
   */
  static async handlePhotoDiagnosis(req) {
    if (!req.imageInput || !req.imageInput.base64Data) {
      throw new Error("An image payload is required for photo diagnosis.");
    }
    const { systemInstruction, userPrompt } = PromptRegistry.buildPhotoDiagnosisPrompt(req);
    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      inlineMedia: [
        {
          mimeType: req.imageInput.mimeType || "image/jpeg",
          data: req.imageInput.base64Data
        }
      ],
      responseMimeType: "application/json",
      temperature: 0.2
    });
    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validatePhotoDiagnosis(parsed);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Photo diagnosis failed domain validation: ${validation.error}`);
    }
    return validation.sanitized;
  }
  /**
   * Handle BRAND_SUGGESTION task
   */
  static async handleBrandSuggestion(req) {
    const { systemInstruction, userPrompt } = PromptRegistry.buildBrandSuggestionPrompt(req);
    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: "application/json",
      temperature: 0.7
    });
    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateBrandSuggestions(parsed);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Brand suggestion failed domain validation: ${validation.error}`);
    }
    return validation.sanitized;
  }
  /**
   * Handle PRODUCT_IDENTITY task
   */
  static async handleProductIdentity(req) {
    const { systemInstruction, userPrompt } = PromptRegistry.buildProductIdentityPrompt(req);
    const raw = await geminiService.generateContent({
      systemInstruction,
      userPrompt,
      responseMimeType: "application/json",
      temperature: 0.4
    });
    const parsed = JSON.parse(raw);
    const validation = DomainValidator.validateProductIdentity(parsed);
    if (!validation.valid || !validation.sanitized) {
      throw new Error(`Product identity failed domain validation: ${validation.error}`);
    }
    return validation.sanitized;
  }
};
var GeminiService_Model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// src/server/pricing/pricing_engine.ts
var PricingEngine = class {
  /**
   * Deterministic exact arithmetic calculation
   */
  static calculate(input) {
    const knownValues = {};
    const assumedValues = {};
    const missingFields = [];
    let materialCost = 0;
    if (typeof input.materialCost === "number" && input.materialCost >= 0) {
      materialCost = Math.round(input.materialCost * 100) / 100;
      knownValues.materialCost = materialCost;
    } else {
      missingFields.push("materialCost");
    }
    let laborCost = 0;
    if (typeof input.laborCost === "number" && input.laborCost >= 0) {
      laborCost = Math.round(input.laborCost * 100) / 100;
      knownValues.laborCost = laborCost;
    } else if (typeof input.hourlyRate === "number" && input.hourlyRate > 0 && typeof input.laborHours === "number" && input.laborHours > 0) {
      laborCost = Math.round(input.hourlyRate * input.laborHours * 100) / 100;
      knownValues.laborCost = laborCost;
      knownValues.hourlyRate = input.hourlyRate;
      knownValues.laborHours = input.laborHours;
    } else {
      missingFields.push("laborCost");
    }
    let packagingCost = 0;
    if (typeof input.packagingCost === "number" && input.packagingCost >= 0) {
      packagingCost = Math.round(input.packagingCost * 100) / 100;
      knownValues.packagingCost = packagingCost;
    } else {
      packagingCost = 20;
      assumedValues.packagingCost = packagingCost;
    }
    let transportCost = 0;
    if (typeof input.transportCost === "number" && input.transportCost >= 0) {
      transportCost = Math.round(input.transportCost * 100) / 100;
      knownValues.transportCost = transportCost;
    } else {
      transportCost = 30;
      assumedValues.transportCost = transportCost;
    }
    let overheadCost = 0;
    if (typeof input.overheadCost === "number" && input.overheadCost >= 0) {
      overheadCost = Math.round(input.overheadCost * 100) / 100;
      knownValues.overheadCost = overheadCost;
    } else {
      overheadCost = 15;
      assumedValues.overheadCost = overheadCost;
    }
    const totalDirectCost = Math.round((materialCost + laborCost + packagingCost + transportCost + overheadCost) * 100) / 100;
    let marginPercentage = 30;
    if (typeof input.desiredMarginPercent === "number" && input.desiredMarginPercent > 0 && input.desiredMarginPercent < 90) {
      marginPercentage = input.desiredMarginPercent;
      knownValues.marginPercentage = marginPercentage;
    } else {
      assumedValues.marginPercentage = marginPercentage;
    }
    const marginFactor = 1 - marginPercentage / 100;
    const fairRetailPrice = marginFactor > 0 ? Math.round(totalDirectCost / marginFactor * 100) / 100 : totalDirectCost * 1.5;
    let platformFeePercentage = 15;
    if (typeof input.platformFeePercent === "number" && input.platformFeePercent >= 0 && input.platformFeePercent < 50) {
      platformFeePercentage = input.platformFeePercent;
      knownValues.platformFeePercentage = platformFeePercentage;
    } else {
      assumedValues.platformFeePercentage = platformFeePercentage;
    }
    const platformFeeFactor = 1 - platformFeePercentage / 100;
    const marketplacePrice = platformFeeFactor > 0 ? Math.round(fairRetailPrice / platformFeeFactor * 100) / 100 : fairRetailPrice * 1.2;
    const wholesalePrice = Math.round(totalDirectCost * 1.2 * 100) / 100;
    const isComplete = missingFields.length === 0;
    return {
      isComplete,
      knownValues,
      assumedValues,
      missingFields,
      totalDirectCost,
      materialCost,
      laborCost,
      packagingCost,
      transportCost,
      overheadCost,
      marginPercentage,
      fairRetailPrice,
      platformFeePercentage,
      marketplacePrice,
      wholesalePrice,
      currency: "INR"
    };
  }
  /**
   * Deterministic calculation with optional AI vernacular explanation
   */
  static async calculateWithExplanation(input, context) {
    const breakdown = this.calculate(input);
    let aiExplanation = void 0;
    if (geminiService.isAvailable() && breakdown.totalDirectCost > 0) {
      try {
        const reqContext = {
          task: "PRICING_EXPLANATION",
          language: context?.language || "en",
          parameters: { pricingBreakdown: breakdown },
          productContext: {
            name: context?.productName,
            category: context?.category
          }
        };
        const { systemInstruction, userPrompt } = PromptRegistry.buildPricingExplanationPrompt(reqContext);
        const raw = await geminiService.generateContent({
          systemInstruction,
          userPrompt,
          responseMimeType: "application/json",
          temperature: 0.3
        });
        const parsed = JSON.parse(raw);
        aiExplanation = {
          explanation: parsed.explanation || "Pricing calculated deterministically based on direct artisan costs and fair profit margins.",
          marginAdvice: parsed.marginAdvice || "A healthy margin ensures fair wages and sustainable craft production.",
          marketplaceTip: parsed.marketplaceTip || "Factor in platform fees so your take-home price remains protected.",
          wholesaleGuidance: parsed.wholesaleGuidance || "For bulk orders, offer wholesale pricing while keeping minimum order quantities in mind."
        };
      } catch (err) {
        console.warn("[PricingEngine] AI explanation failed, returning deterministic breakdown alone:", err.message || err);
      }
    }
    return {
      breakdown,
      aiExplanation
    };
  }
};

// src/utils/productThumbnail.ts
var CRAFT_CATALOG = {
  // Textiles, Handlooms, Sarees, Dupattas, Silk, Pashmina, Weaving
  chanderi_silk: {
    patterns: [/chanderi/i, /zari/i, /dupatta/i, /banarasi/i, /brocade/i, /tussar/i, /kanjivaram/i],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"
    ]
  },
  pashmina_shawl: {
    patterns: [/pashmina/i, /shawl/i, /kashmir/i, /stole/i, /woolen/i, /scarf/i],
    images: [
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80"
    ]
  },
  handloom_cotton: {
    patterns: [/handloom/i, /cotton/i, /khadi/i, /ikat/i, /bandhani/i, /textile/i, /fabric/i, /weave/i],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Woodcraft & Carvings
  woodcraft: {
    patterns: [/wood/i, /carving/i, /wooden/i, /teak/i, /sandalwood/i, /timber/i, /shisham/i, /owl/i, /channapatna/i],
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Terracotta, Diyas, Clay, Pottery
  terracotta_diya: {
    patterns: [/terracotta/i, /diya/i, /deepak/i, /earthen/i, /clay lamp/i],
    images: [
      "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  pottery_ceramics: {
    patterns: [/pottery/i, /ceramic/i, /clay/i, /vase/i, /blue pottery/i, /earthenware/i, /planter/i, /mug/i],
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Brass, Bronze, Bell Metal, Dhokra
  metalcraft_brass: {
    patterns: [/brass/i, /bronze/i, /dhokra/i, /bell metal/i, /copper/i, /metal/i, /pooja/i, /puja/i, /idol/i],
    images: [
      "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1615529182906-13407652d0f8?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Folk Paintings: Madhubani, Warli, Pattachitra
  folk_paintings: {
    patterns: [/madhubani/i, /warli/i, /pattachitra/i, /painting/i, /art/i, /canvas/i, /scroll/i, /kalamkari/i],
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Jewelry, Bangles, Beads
  jewelry: {
    patterns: [/jewel/i, /bangle/i, /necklace/i, /earring/i, /kundan/i, /meenakari/i, /bead/i, /silver/i],
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611591475874-8b65646194b4?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Cane, Bamboo, Basketry
  cane_bamboo: {
    patterns: [/bamboo/i, /cane/i, /basket/i, /jute/i, /straw/i, /wicker/i],
    images: [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Leather, Mojari, Jutti
  leather_footwear: {
    patterns: [/leather/i, /mojari/i, /jutti/i, /footwear/i, /sandal/i],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"
    ]
  },
  // Organic Agri-products, Spices, Herbal Tea, Honey
  organic_agri: {
    patterns: [/tea/i, /spice/i, /honey/i, /organic/i, /turmeric/i, /saffron/i, /herbal/i, /ayurv/i, /agri/i],
    images: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80"
    ]
  }
};
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
function normalizeCandidateUrl(candidate) {
  if (!candidate) return null;
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof candidate === "object") {
    const possible = candidate.url || candidate.secure_url || candidate.secureUrl || candidate.src || candidate.path || candidate.href;
    if (typeof possible === "string") {
      const trimmed = possible.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}
function isValidImageUrl(url) {
  const normalized = normalizeCandidateUrl(url);
  if (!normalized) return false;
  const clean = normalized.toLowerCase();
  if (clean.length < 5) return false;
  if (clean.includes("example.com") || clean.includes("localhost/placeholder") || clean === "null" || clean === "undefined") {
    return false;
  }
  return clean.startsWith("data:image/") || clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/");
}
function getContextualCraftImage(product) {
  const title = (product.title || product.name || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const material = (product.material || "").toLowerCase();
  const description = (product.description || "").toLowerCase();
  const combinedText = `${title} ${category} ${material} ${description}`;
  const seed = (product.id || "") + (product.title || "craft");
  const index = hashString(seed);
  for (const [, catalogItem] of Object.entries(CRAFT_CATALOG)) {
    for (const regex of catalogItem.patterns) {
      if (regex.test(combinedText)) {
        const selectedIndex = index % catalogItem.images.length;
        return catalogItem.images[selectedIndex];
      }
    }
  }
  const generalCrafts = [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80"
  ];
  return generalCrafts[index % generalCrafts.length];
}

// server.ts
import_dotenv.default.config();
var imageGenService = new GenerationService();
var pgPool = new import_pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/krivio_db",
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : false
});
pgPool.on("error", (err) => {
  console.warn("[PostgreSQL Pool Warning]: Idle client error:", err.message || err);
});
var quotationService = new QuotationService(pgPool);
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "krivio_secret_key_2026";
var SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "";
var SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://mvbpxcsyyasckzymjyjb.supabase.co";
var SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YnB4Y3N5eWFzY2t6eW1qeWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMwNjQsImV4cCI6MjEwMzY3OTA2NH0.U3OcsC9bZZ5ORcNg8z_CEMf-kDg3PVqxetiZGEU_i24";
var supabaseServerClient = (0, import_supabase_js.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
var GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
var ai = null;
if (GEMINI_KEY) {
  ai = new import_genai3.GoogleGenAI({
    apiKey: GEMINI_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/krivio-ai\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin)) || process.env.APP_URL && origin === process.env.APP_URL || process.env.VITE_SITE_URL && origin === process.env.VITE_SITE_URL;
    if (isAllowed) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "SAMEORIGIN");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(import_express.default.json({ limit: "25mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "25mb" }));
app.use((req, res, next) => {
  if (process.env.VERCEL) {
    const vercelForwarded = req.headers["x-vercel-forwarded-path"] || req.headers["x-matched-path"] || req.headers["x-forwarded-uri"];
    if (vercelForwarded && vercelForwarded.startsWith("/api")) {
      req.url = vercelForwarded;
    } else if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/diagnostic") && !req.url.startsWith("/assets") && !req.url.startsWith("/favicon") && req.url !== "/" && req.url !== "/index.html") {
      req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    }
  }
  next();
});
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "healthy",
    process: "alive",
    service: "krivio-ai-node-backend",
    version: "2.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get(["/health/db", "/api/health/db", "/diagnostic/db"], async (req, res) => {
  try {
    const result = await pgPool.query("SELECT 1 as ping");
    res.json({
      status: "healthy",
      database: "connected",
      query_result: result.rows[0]?.ping ?? 1,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: err?.message || "Database ping failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
var dbInitPromise = null;
async function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initPgDatabase().catch((err) => {
      console.warn("[PostgreSQL Init Notice]:", err.message || err);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}
app.use((req, res, next) => {
  if (req.url && req.url.startsWith("/api")) {
    ensureDbInitialized().catch(() => {
    });
  }
  next();
});
async function queryPg(text, params = []) {
  try {
    const res = await pgPool.query(text, params);
    return res;
  } catch (err) {
    console.error(`[PostgreSQL DB Error]: ${err.message || err}`);
    throw err;
  }
}
async function resolveUserFromToken(token) {
  let decoded = null;
  try {
    decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
  } catch {
  }
  if (!decoded && SUPABASE_JWT_SECRET) {
    try {
      decoded = import_jsonwebtoken.default.verify(token, SUPABASE_JWT_SECRET);
    } catch {
    }
  }
  if (!decoded && token) {
    try {
      const { data: supaData, error: supaErr } = await supabaseServerClient.auth.getUser(token);
      if (!supaErr && supaData && supaData.user) {
        decoded = {
          sub: supaData.user.id,
          id: supaData.user.id,
          email: supaData.user.email,
          user_metadata: supaData.user.user_metadata || {},
          role: supaData.user.role || "artisan"
        };
      }
    } catch (supaEx) {
      console.warn("[Auth]: Supabase token verification failed:", supaEx?.message || supaEx);
    }
  }
  if (!decoded) return null;
  const subId = decoded.sub || decoded.id;
  const email = decoded.email;
  const metadata = decoded.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || decoded.name || (email ? email.split("@")[0] : "Krivio Artisan");
  const avatarUrl = metadata.avatar_url || metadata.picture || decoded.profile_image || "";
  const phone = metadata.phone || decoded.phone || decoded.phone_number || "";
  const role = metadata.role || decoded.role || "artisan";
  if (!subId && !email) return null;
  try {
    let dbUserRes = await queryPg(
      `SELECT * FROM users WHERE supabase_user_id = $1 OR id = $1 OR (email IS NOT NULL AND LOWER(email) = LOWER($2)) LIMIT 1`,
      [subId, email || ""]
    );
    let userRow = dbUserRes.rows[0];
    if (!userRow && email) {
      const newId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const insertRes = await queryPg(
        `INSERT INTO users (id, supabase_user_id, full_name, email, profile_image, phone_number, role, is_active, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, NOW(), NOW())
         RETURNING *`,
        [newId, subId, fullName, email.toLowerCase().trim(), avatarUrl, phone, role]
      );
      userRow = insertRes.rows[0];
      await queryPg(
        `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [`act_${Date.now()}`, userRow.id, "Account created", "Welcome to KRIVIO AI workspace.", "account_created"]
      ).catch(() => {
      });
    } else if (userRow && subId && !userRow.supabase_user_id) {
      await queryPg(
        `UPDATE users SET supabase_user_id = $1, updated_at = NOW() WHERE id = $2`,
        [subId, userRow.id]
      ).catch(() => {
      });
      userRow.supabase_user_id = subId;
    }
    if (userRow) {
      return {
        id: userRow.id,
        supabaseUserId: userRow.supabase_user_id,
        email: userRow.email,
        name: userRow.full_name || fullName,
        role: userRow.role || role,
        preferredLanguage: userRow.preferred_language || "en",
        profileImage: userRow.profile_image || avatarUrl,
        phone: userRow.phone_number || phone
      };
    }
  } catch (dbErr) {
    console.error("Error resolving user from PostgreSQL:", dbErr);
  }
  if (subId || email) {
    return {
      id: subId || `usr_${Date.now()}`,
      supabaseUserId: subId,
      email: email || "",
      name: fullName,
      role,
      preferredLanguage: "en",
      profileImage: avatarUrl,
      phone
    };
  }
  return null;
}
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Authentication required. Please sign in." });
    return;
  }
  const user = await resolveUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired authentication session." });
    return;
  }
  req.user = user;
  next();
};
app.post("/api/auth/supabase-sync", async (req, res) => {
  try {
    const { supabase_user_id, email, full_name, name, profile_image, avatar_url, phone_number, role, preferred_language } = req.body;
    const subId = supabase_user_id;
    const userEmail = email ? email.toLowerCase().trim() : "";
    const userName = full_name || name || (userEmail ? userEmail.split("@")[0] : "Artisan");
    const userAvatar = profile_image || avatar_url || "";
    const userRole = role || "artisan";
    const userLang = preferred_language || "en";
    if (!subId && !userEmail) {
      res.status(400).json({ error: "supabase_user_id or email is required" });
      return;
    }
    let existingRes = await queryPg(
      `SELECT * FROM users WHERE supabase_user_id = $1 OR (email IS NOT NULL AND LOWER(email) = LOWER($2)) LIMIT 1`,
      [subId || "", userEmail]
    );
    let user = existingRes.rows[0];
    if (!user) {
      const newId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const insertRes = await queryPg(
        `INSERT INTO users (id, supabase_user_id, full_name, email, profile_image, phone_number, role, preferred_language, is_active, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, true, NOW(), NOW())
         RETURNING *`,
        [newId, subId, userName, userEmail, userAvatar, phone_number || "", userRole, userLang]
      );
      user = insertRes.rows[0];
    } else if (subId && !user.supabase_user_id) {
      await queryPg(`UPDATE users SET supabase_user_id = $1, updated_at = NOW() WHERE id = $2`, [subId, user.id]);
      user.supabase_user_id = subId;
    }
    const token = import_jsonwebtoken.default.sign(
      { id: user.id, sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const subRes = await queryPg(`SELECT plan, status, end_date FROM subscriptions WHERE user_id = $1`, [user.id]);
    const subPlan = subRes.rows[0]?.plan || "free";
    res.json({
      token,
      access_token: token,
      user: {
        id: user.id,
        supabase_user_id: user.supabase_user_id,
        full_name: user.full_name,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        phone: user.phone_number,
        profile_image: user.profile_image,
        avatarUrl: user.profile_image,
        role: user.role,
        preferred_language: user.preferred_language || "en",
        preferredLanguage: user.preferred_language || "en",
        is_active: user.is_active,
        is_verified: user.is_verified,
        subscriptionPlan: subPlan,
        subscriptionValidUntil: subRes.rows[0]?.end_date,
        createdAt: user.created_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error("Supabase sync error:", err);
    res.status(500).json({ error: "Failed to sync authentication profile" });
  }
});
app.post("/api/auth/google", async (req, res) => {
  req.url = "/api/auth/supabase-sync";
  app._router.handle(req, res);
});
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const userRes = await queryPg(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
    const user = userRes.rows[0];
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const subRes = await queryPg(`SELECT plan, status, end_date FROM subscriptions WHERE user_id = $1`, [user.id]);
    const subPlan = subRes.rows[0]?.plan || "free";
    res.json({
      user: {
        id: user.id,
        supabase_user_id: user.supabase_user_id,
        full_name: user.full_name,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        phone: user.phone_number,
        profile_image: user.profile_image,
        avatarUrl: user.profile_image,
        role: user.role,
        preferred_language: user.preferred_language || "en",
        preferredLanguage: user.preferred_language || "en",
        is_active: user.is_active,
        is_verified: user.is_verified,
        subscriptionPlan: subPlan,
        subscriptionValidUntil: subRes.rows[0]?.end_date,
        createdAt: user.created_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load user profile" });
  }
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, preferred_language } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = await queryPg(`SELECT id FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }
    const newId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const hash = import_bcryptjs.default.hashSync(password, 10);
    const insertRes = await queryPg(
      `INSERT INTO users (id, full_name, email, password_hash, phone_number, role, preferred_language, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, false, NOW(), NOW())
       RETURNING *`,
      [newId, name || cleanEmail.split("@")[0], cleanEmail, hash, phone || "", role || "artisan", preferred_language || "en"]
    );
    const user = insertRes.rows[0];
    const token = import_jsonwebtoken.default.sign({ id: user.id, sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      access_token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        phone: user.phone_number,
        profile_image: user.profile_image,
        role: user.role,
        preferred_language: user.preferred_language || "en",
        preferredLanguage: user.preferred_language || "en",
        is_active: user.is_active,
        is_verified: user.is_verified,
        subscriptionPlan: "free",
        createdAt: user.created_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const userRes = await queryPg(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    const user = userRes.rows[0];
    if (!user || !user.password_hash || !import_bcryptjs.default.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = import_jsonwebtoken.default.sign({ id: user.id, sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const subRes = await queryPg(`SELECT plan, status, end_date FROM subscriptions WHERE user_id = $1`, [user.id]);
    const subPlan = subRes.rows[0]?.plan || "free";
    res.json({
      token,
      access_token: token,
      user: {
        id: user.id,
        supabase_user_id: user.supabase_user_id,
        full_name: user.full_name,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        phone: user.phone_number,
        profile_image: user.profile_image,
        role: user.role,
        preferred_language: user.preferred_language || "en",
        preferredLanguage: user.preferred_language || "en",
        is_active: user.is_active,
        is_verified: user.is_verified,
        subscriptionPlan: subPlan,
        subscriptionValidUntil: subRes.rows[0]?.end_date,
        createdAt: user.created_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters long" });
      return;
    }
    const userRes = await queryPg(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
    const user = userRes.rows[0];
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.password_hash) {
      const isMatch = import_bcryptjs.default.compareSync(currentPassword, user.password_hash);
      if (!isMatch) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }
    }
    const newHash = import_bcryptjs.default.hashSync(newPassword, 10);
    await queryPg(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, userId]);
    res.json({
      status: "success",
      message: "Password updated successfully"
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});
app.put("/api/users/language", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language = "en" } = req.body;
    const validLangs = ["en", "hi", "mr", "gu", "ta", "bn", "as"];
    if (!validLangs.includes(language)) {
      res.status(400).json({ error: `Invalid language code. Supported: ${validLangs.join(", ")}` });
      return;
    }
    await queryPg(`UPDATE users SET preferred_language = $1, updated_at = NOW() WHERE id = $2`, [language, userId]);
    res.json({ success: true, preferred_language: language, message: "Language preference saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update preferred language" });
  }
});
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, full_name, phone, phone_number, role, preferred_language } = req.body;
    const newName = name || full_name;
    const newPhone = phone || phone_number;
    const updateRes = await queryPg(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        phone_number = COALESCE($2, phone_number),
        role = COALESCE($3, role),
        preferred_language = COALESCE($4, preferred_language),
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [newName || null, newPhone || null, role || null, preferred_language || null, userId]
    );
    const user = updateRes.rows[0];
    res.json({
      user: {
        id: user.id,
        supabase_user_id: user.supabase_user_id,
        full_name: user.full_name,
        name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        phone: user.phone_number,
        profile_image: user.profile_image,
        role: user.role,
        preferred_language: user.preferred_language || "en",
        preferredLanguage: user.preferred_language || "en",
        is_active: user.is_active,
        is_verified: user.is_verified,
        createdAt: user.created_at,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});
var memoryProductsMap = /* @__PURE__ */ new Map();
app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category, status, sort } = req.query;
    let dbProducts = [];
    try {
      let queryText = `SELECT * FROM products WHERE user_id = $1`;
      const params = [userId];
      if (status && status !== "all") {
        params.push(status);
        queryText += ` AND status = $${params.length}`;
      }
      if (category && category !== "all") {
        params.push(`%${category}%`);
        queryText += ` AND category ILIKE $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        queryText += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length})`;
      }
      if (sort === "price_asc") queryText += ` ORDER BY price ASC`;
      else if (sort === "price_desc") queryText += ` ORDER BY price DESC`;
      else if (sort === "oldest") queryText += ` ORDER BY created_at ASC`;
      else queryText += ` ORDER BY created_at DESC`;
      const result = await queryPg(queryText, params);
      dbProducts = result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        title: row.title,
        description: row.description || "",
        category: row.category || "Handicrafts & Art",
        price: parseFloat(row.price) || 0,
        currency: row.currency || "INR",
        stock: row.stock !== void 0 ? row.stock : 1,
        sku: row.sku || "",
        weight: row.weight || "",
        dimensions: row.dimensions || "",
        material: row.material || "",
        shortDescription: row.short_description || "",
        craftStory: row.craft_story || "",
        hsnCode: row.hsn_code || "",
        wholesalePrice: row.wholesale_price !== null && row.wholesale_price !== void 0 ? parseFloat(row.wholesale_price) : void 0,
        mrp: row.mrp !== null && row.mrp !== void 0 ? parseFloat(row.mrp) : void 0,
        moq: row.moq !== null && row.moq !== void 0 ? row.moq : 1,
        leadTime: row.lead_time || "3-5 business days",
        brand: row.brand || "",
        color: row.color || "",
        originState: row.origin_state || "",
        status: row.status || "published",
        keywords: Array.isArray(row.keywords) ? row.keywords : typeof row.keywords === "string" ? JSON.parse(row.keywords) : [],
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : typeof row.image_urls === "string" ? JSON.parse(row.image_urls) : [],
        isMarketplaceReady: row.is_marketplace_ready ?? true,
        readinessScore: row.readiness_score || 85,
        marketplaces: Array.isArray(row.marketplaces) ? row.marketplaces : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at
      }));
    } catch (dbErr) {
      console.warn("[PostgreSQL Products Notice]: DB read unavailable, using active session cache:", dbErr.message || dbErr);
    }
    const memProducts = memoryProductsMap.get(userId) || [];
    const dbIds = new Set(dbProducts.map((p) => p.id));
    const merged = [...dbProducts, ...memProducts.filter((p) => !dbIds.has(p.id))];
    res.json({ products: merged });
  } catch (err) {
    console.error("Products fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
});
var LANGUAGE_NAME_MAP = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  bn: "Bengali",
  as: "Assamese"
};
function normalizeLanguageName(langInput) {
  if (!langInput) return "English";
  const clean = langInput.toLowerCase().trim();
  if (LANGUAGE_NAME_MAP[clean]) return LANGUAGE_NAME_MAP[clean];
  for (const [code, name] of Object.entries(LANGUAGE_NAME_MAP)) {
    if (clean === name.toLowerCase() || clean.startsWith(code)) return name;
  }
  return langInput;
}
app.post("/api/products/generate-details", authenticateToken, async (req, res) => {
  try {
    const { rawName = "Handcrafted Craft Piece", craftType = "Handicrafts & Art", materials = "Natural materials", targetPrice, materialCost, laborCost, language = "en" } = req.body;
    const targetLang = normalizeLanguageName(language || req.user?.preferredLanguage || "en");
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "AI service is currently unavailable. Server API key is not configured." });
      return;
    }
    let calculatedPrice = void 0;
    if (typeof materialCost === "number" && typeof laborCost === "number") {
      const pricingBreakdown = PricingEngine.calculate({ materialCost, laborCost });
      calculatedPrice = pricingBreakdown.fairRetailPrice;
    } else if (typeof targetPrice === "number" && targetPrice > 0) {
      calculatedPrice = targetPrice;
    }
    const prompt = `Act as an e-commerce marketing specialist for Indian rural artisans and SHGs.
Input Product details:
- Name/Concept: ${rawName}
- Craft Type: ${craftType}
- Materials used: ${materials}
- Base Price: ${calculatedPrice ? "\u20B9" + calculatedPrice : "To be estimated by artisan"}
- Output Language: ${targetLang}

Generate JSON with:
1. "title": High-converting descriptive title suitable for Amazon/ONDC in ${targetLang} (max 80 chars)
2. "description": Engaging narrative highlighting artisan heritage and craft story in ${targetLang} (120-180 words)
3. "category": Best fitting category name in ${targetLang}
4. "suggestedPrice": Integer in INR (reflect realistic artisan price for this item)
5. "keywords": Array of 5-8 search tags in ${targetLang}
6. "readinessScore": Integer 80-98

Rules:
- Generate all human-facing text in ${targetLang}.
- Keep brand name "KRIVIO AI", numbers, and currency in standard \u20B9 (INR) format.
- Ensure natural phrasing and authentic cultural terms suitable for Indian regional buyers.`;
    const rawResponse = await geminiService.generateContent({
      userPrompt: prompt,
      responseMimeType: "application/json",
      temperature: 0.4
    });
    const parsed = JSON.parse(rawResponse || "{}");
    if (calculatedPrice) {
      parsed.suggestedPrice = calculatedPrice;
    }
    res.json({ data: parsed });
  } catch (err) {
    console.error("Failed to generate product details:", err.message || err);
    res.status(503).json({ error: "Failed to generate product details from AI: " + (err.message || "Service error") });
  }
});
app.post("/api/products/suggest-brand", authenticateToken, async (req, res) => {
  try {
    const { craftType = "Handicrafts", region = "Rural India", personality = "Authentic & Cultural", language = "en", productName } = req.body;
    const targetLang = normalizeLanguageName(language || req.user?.preferredLanguage || "en");
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "AI service is currently unavailable. Server API key is not configured." });
      return;
    }
    const brandResult = await AITaskRouter.handle({
      task: "BRAND_SUGGESTION",
      language: targetLang,
      productContext: {
        name: productName,
        category: craftType
      },
      businessContext: {
        craftType,
        state: region,
        brandPersonality: personality
      },
      parameters: { personality }
    });
    res.json({ suggestions: brandResult.suggestions });
  } catch (err) {
    console.error("Failed to suggest brand names:", err.message || err);
    res.status(503).json({ error: "Failed to generate brand suggestions: " + (err.message || "Service error") });
  }
});
app.post("/api/products/generate-identity", authenticateToken, async (req, res) => {
  try {
    const { productName, detectedSubject, materials = "Natural traditional materials", region = "Rural India", brandName = "Artisan Collective", targetAudience = "Home d\xE9cor enthusiasts & conscious buyers", language = "en", targetPrice, materialCost, laborCost } = req.body;
    const targetLang = normalizeLanguageName(language || req.user?.preferredLanguage || "en");
    const title = productName || detectedSubject || "Handcrafted Artisan Product";
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "AI service is currently unavailable. Server API key is not configured." });
      return;
    }
    let calculatedPrice = void 0;
    if (typeof materialCost === "number" && typeof laborCost === "number") {
      const pricingBreakdown = PricingEngine.calculate({ materialCost, laborCost });
      calculatedPrice = pricingBreakdown.fairRetailPrice;
    } else if (typeof targetPrice === "number" && targetPrice > 0) {
      calculatedPrice = targetPrice;
    }
    const identityResult = await AITaskRouter.handle({
      task: "PRODUCT_IDENTITY",
      language: targetLang,
      productContext: {
        name: title,
        materials: Array.isArray(materials) ? materials : [materials],
        price: calculatedPrice
      },
      businessContext: {
        businessName: brandName,
        state: region
      },
      userInput: `Generate full e-commerce catalog identity for ${title} made with ${materials} targeting ${targetAudience}.`
    });
    const formattedData = {
      productTitle: identityResult.title,
      shortDescription: identityResult.shortDescription,
      detailedDescription: identityResult.detailedDescription,
      keyFeatures: identityResult.bulletFeatures,
      materials,
      craftMethod: identityResult.specifications?.["Craft Type"] || "Traditional Handcrafted Technique",
      idealFor: identityResult.targetAudience,
      productStory: identityResult.story,
      careInstructions: identityResult.careInstructions,
      suggestedTags: identityResult.tags,
      suggestedKeywords: identityResult.keywords,
      suggestedPrice: calculatedPrice || (typeof targetPrice === "number" ? targetPrice : void 0),
      category: identityResult.specifications?.Category || "Handicrafts & Art"
    };
    res.json({ data: formattedData });
  } catch (err) {
    console.error("Failed to generate product identity:", err.message || err);
    res.status(503).json({ error: "Failed to generate product identity: " + (err.message || "Service error") });
  }
});
app.get("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await queryPg(`SELECT * FROM products WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const row = result.rows[0];
    res.json({
      product: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        title: row.title,
        description: row.description || "",
        category: row.category || "Handicrafts & Art",
        price: parseFloat(row.price) || 0,
        currency: row.currency || "INR",
        stock: row.stock !== void 0 ? row.stock : 1,
        sku: row.sku || "",
        weight: row.weight || "",
        dimensions: row.dimensions || "",
        material: row.material || "",
        shortDescription: row.short_description || "",
        craftStory: row.craft_story || "",
        hsnCode: row.hsn_code || "",
        wholesalePrice: row.wholesale_price !== null && row.wholesale_price !== void 0 ? parseFloat(row.wholesale_price) : void 0,
        mrp: row.mrp !== null && row.mrp !== void 0 ? parseFloat(row.mrp) : void 0,
        moq: row.moq !== null && row.moq !== void 0 ? row.moq : 1,
        leadTime: row.lead_time || "3-5 business days",
        brand: row.brand || "",
        color: row.color || "",
        originState: row.origin_state || "",
        status: row.status || "published",
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
        isMarketplaceReady: row.is_marketplace_ready ?? true,
        readinessScore: row.readiness_score || 85,
        marketplaces: Array.isArray(row.marketplaces) ? row.marketplaces : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve product" });
  }
});
app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      shortDescription,
      short_description,
      craftStory,
      craft_story,
      category,
      price,
      mrp,
      wholesalePrice,
      wholesale_price,
      currency,
      stock,
      moq,
      leadTime,
      lead_time,
      sku,
      weight,
      dimensions,
      material,
      color,
      brand,
      hsnCode,
      hsn_code,
      originState,
      origin_state,
      status,
      keywords,
      imageUrls,
      isMarketplaceReady,
      readinessScore,
      marketplaces
    } = req.body;
    if (!title) {
      res.status(400).json({ error: "Product title is required" });
      return;
    }
    await queryPg(
      `INSERT INTO users (id, email, full_name, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, 'artisan', true, true, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
      [userId, req.user?.email || `${userId}@artisan.krivio.local`, req.user?.name || "Krivio Artisan"]
    ).catch((uErr) => {
      console.warn("Notice ensuring user for product creation:", uErr.message || uErr);
    });
    const prodId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const effectiveShortDesc = shortDescription || short_description || "";
    const effectiveCraftStory = craftStory || craft_story || "";
    const effectiveHsn = hsnCode || hsn_code || "";
    const effectiveWholesale = wholesalePrice !== void 0 ? parseFloat(wholesalePrice) : wholesale_price !== void 0 ? parseFloat(wholesale_price) : null;
    const effectiveMrp = mrp !== void 0 ? parseFloat(mrp) : null;
    const effectiveMoq = moq !== void 0 ? parseInt(moq, 10) : 1;
    const effectiveLeadTime = leadTime || lead_time || "3-5 business days";
    const effectiveBrand = brand || "";
    const effectiveColor = color || "";
    const effectiveMaterial = material || "";
    const effectiveOriginState = originState || origin_state || "India";
    const sanitizedPrice = typeof price === "number" ? isNaN(price) ? 0 : price : parseFloat(String(price || 0).replace(/[^0-9.]/g, "")) || 0;
    const sanitizedStock = typeof stock === "number" ? isNaN(stock) ? 1 : stock : parseInt(String(stock || 1).replace(/[^0-9]/g, ""), 10) || 1;
    const safeKeywords = Array.isArray(keywords) ? keywords : typeof keywords === "string" && keywords ? keywords.startsWith("[") ? JSON.parse(keywords) : keywords.split(",").map((k) => k.trim()).filter(Boolean) : [];
    const rawImageUrls = Array.isArray(imageUrls) ? imageUrls : typeof imageUrls === "string" && imageUrls ? imageUrls.startsWith("[") ? JSON.parse(imageUrls) : [imageUrls] : [];
    const validCandidateUrls = rawImageUrls.map((item) => normalizeCandidateUrl(item)).filter((u) => Boolean(u && isValidImageUrl(u)));
    const safeImageUrls = validCandidateUrls.length > 0 ? validCandidateUrls : [getContextualCraftImage({ title, category, material: effectiveMaterial, description })];
    const safeMarketplaces = Array.isArray(marketplaces) ? marketplaces : typeof marketplaces === "string" && marketplaces ? marketplaces.startsWith("[") ? JSON.parse(marketplaces) : [marketplaces] : ["ONDC"];
    let row = null;
    try {
      const insertRes = await queryPg(
        `INSERT INTO products (
          id, user_id, title, description, category, price, currency, stock, sku, weight, dimensions,
          status, keywords, image_urls, is_marketplace_ready, readiness_score, marketplaces,
          material, short_description, craft_story, hsn_code, wholesale_price, mrp, moq, lead_time,
          brand, color, origin_state, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
        ) RETURNING *`,
        [
          prodId,
          userId,
          title,
          description || "",
          category || "Handicrafts & Art",
          sanitizedPrice,
          currency || "INR",
          sanitizedStock,
          sku || `SKU-${Date.now().toString().slice(-5)}`,
          weight || "0.5 kg",
          dimensions || "10x10x10 cm",
          status || "published",
          JSON.stringify(safeKeywords),
          JSON.stringify(safeImageUrls),
          isMarketplaceReady ?? true,
          readinessScore || 85,
          JSON.stringify(safeMarketplaces),
          effectiveMaterial,
          effectiveShortDesc,
          effectiveCraftStory,
          effectiveHsn,
          effectiveWholesale,
          effectiveMrp,
          effectiveMoq,
          effectiveLeadTime,
          effectiveBrand,
          effectiveColor,
          effectiveOriginState
        ]
      );
      row = insertRes.rows[0];
    } catch (insertErr) {
      if (insertErr.message && (insertErr.message.includes("column") || insertErr.message.includes("does not exist"))) {
        console.warn("Falling back to legacy product table schema for insert:", insertErr.message);
        try {
          const fallbackRes = await queryPg(
            `INSERT INTO products (
              id, user_id, title, description, category, price, currency, stock, sku, weight, dimensions,
              status, keywords, image_urls, is_marketplace_ready, readiness_score, marketplaces,
              created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
            ) RETURNING *`,
            [
              prodId,
              userId,
              title,
              description || "",
              category || "Handicrafts & Art",
              sanitizedPrice,
              currency || "INR",
              sanitizedStock,
              sku || `SKU-${Date.now().toString().slice(-5)}`,
              weight || "0.5 kg",
              dimensions || "10x10x10 cm",
              status || "published",
              JSON.stringify(safeKeywords),
              JSON.stringify(safeImageUrls),
              isMarketplaceReady ?? true,
              readinessScore || 85,
              JSON.stringify(safeMarketplaces)
            ]
          );
          row = fallbackRes.rows[0];
        } catch (legacyErr) {
          console.warn("Legacy insert also failed:", legacyErr);
        }
      }
    }
    if (!row) {
      console.warn("[Product Storage]: Storing product in active session memory store");
      const memoryProduct = {
        id: prodId,
        userId,
        user_id: userId,
        title,
        description: description || "",
        category: category || "Handicrafts & Art",
        price: sanitizedPrice,
        currency: currency || "INR",
        stock: sanitizedStock,
        sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
        weight: weight || "0.5 kg",
        dimensions: dimensions || "10x10x10 cm",
        material: effectiveMaterial,
        shortDescription: effectiveShortDesc,
        craftStory: effectiveCraftStory,
        hsnCode: effectiveHsn,
        wholesalePrice: effectiveWholesale ?? void 0,
        mrp: effectiveMrp ?? void 0,
        moq: effectiveMoq,
        leadTime: effectiveLeadTime,
        brand: effectiveBrand,
        color: effectiveColor,
        originState: effectiveOriginState,
        status: status || "published",
        keywords: safeKeywords,
        imageUrls: safeImageUrls,
        isMarketplaceReady: isMarketplaceReady ?? true,
        readinessScore: readinessScore || 85,
        marketplaces: safeMarketplaces,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const userMemProds = memoryProductsMap.get(userId) || [];
      userMemProds.unshift(memoryProduct);
      memoryProductsMap.set(userId, userMemProds);
      res.status(201).json({
        product: memoryProduct,
        message: "Product cataloged and saved to your active session successfully"
      });
      return;
    }
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [`act_${Date.now()}`, userId, `Added product: ${title}`, `Cataloged ${title} at \u20B9${sanitizedPrice}.`, "product_created"]
    ).catch(() => {
    });
    res.json({
      product: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        title: row.title,
        description: row.description || "",
        category: row.category || "Handicrafts & Art",
        price: parseFloat(row.price) || 0,
        currency: row.currency || "INR",
        stock: row.stock !== void 0 ? row.stock : 1,
        sku: row.sku || "",
        weight: row.weight || "",
        dimensions: row.dimensions || "",
        material: row.material || effectiveMaterial,
        shortDescription: row.short_description || effectiveShortDesc,
        craftStory: row.craft_story || effectiveCraftStory,
        hsnCode: row.hsn_code || effectiveHsn,
        wholesalePrice: row.wholesale_price !== null && row.wholesale_price !== void 0 ? parseFloat(row.wholesale_price) : effectiveWholesale || void 0,
        mrp: row.mrp !== null && row.mrp !== void 0 ? parseFloat(row.mrp) : effectiveMrp || void 0,
        moq: row.moq !== null && row.moq !== void 0 ? row.moq : effectiveMoq,
        leadTime: row.lead_time || effectiveLeadTime,
        brand: row.brand || effectiveBrand,
        color: row.color || effectiveColor,
        originState: row.origin_state || effectiveOriginState,
        status: row.status || "published",
        keywords: Array.isArray(row.keywords) ? row.keywords : typeof row.keywords === "string" ? JSON.parse(row.keywords) : [],
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : typeof row.image_urls === "string" ? JSON.parse(row.image_urls) : [],
        isMarketplaceReady: row.is_marketplace_ready ?? true,
        readinessScore: row.readiness_score || 85,
        marketplaces: Array.isArray(row.marketplaces) ? row.marketplaces : typeof row.marketplaces === "string" ? JSON.parse(row.marketplaces) : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at
      },
      message: "Product created successfully"
    });
  } catch (err) {
    console.error("Product create error:", err);
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});
app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const existing = await queryPg(`SELECT * FROM products WHERE id = $1 AND user_id = $2`, [id, userId]).catch(() => ({ rows: [] }));
    if (existing.rows.length === 0) {
      const userMemProds = memoryProductsMap.get(userId) || [];
      const memIdx = userMemProds.findIndex((p) => p.id === id);
      if (memIdx !== -1) {
        userMemProds[memIdx] = {
          ...userMemProds[memIdx],
          ...req.body,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        res.json({ product: userMemProds[memIdx], message: "Product updated successfully" });
        return;
      }
      res.status(404).json({ error: "Product not found or unauthorized" });
      return;
    }
    const {
      title,
      description,
      shortDescription,
      short_description,
      craftStory,
      craft_story,
      category,
      price,
      mrp,
      wholesalePrice,
      wholesale_price,
      currency,
      stock,
      moq,
      leadTime,
      lead_time,
      sku,
      weight,
      dimensions,
      material,
      color,
      brand,
      hsnCode,
      hsn_code,
      originState,
      origin_state,
      status,
      keywords,
      imageUrls,
      isMarketplaceReady,
      readinessScore,
      marketplaces
    } = req.body;
    const effectiveShortDesc = shortDescription !== void 0 ? shortDescription : short_description;
    const effectiveCraftStory = craftStory !== void 0 ? craftStory : craft_story;
    const effectiveHsn = hsnCode !== void 0 ? hsnCode : hsn_code;
    const effectiveWholesale = wholesalePrice !== void 0 ? parseFloat(wholesalePrice) : wholesale_price !== void 0 ? parseFloat(wholesale_price) : null;
    const effectiveMrp = mrp !== void 0 ? parseFloat(mrp) : null;
    const effectiveMoq = moq !== void 0 ? parseInt(moq, 10) : null;
    const effectiveLeadTime = leadTime !== void 0 ? leadTime : lead_time;
    const effectiveOriginState = originState !== void 0 ? originState : origin_state;
    let sanitizedUpdateImageUrls = null;
    if (imageUrls !== void 0 && imageUrls !== null) {
      const rawUpdate = Array.isArray(imageUrls) ? imageUrls : typeof imageUrls === "string" && imageUrls ? imageUrls.startsWith("[") ? JSON.parse(imageUrls) : [imageUrls] : [];
      sanitizedUpdateImageUrls = rawUpdate.map((item) => normalizeCandidateUrl(item)).filter((u) => Boolean(u && isValidImageUrl(u)));
    }
    let row;
    try {
      const updateRes = await queryPg(
        `UPDATE products SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          price = COALESCE($4, price),
          currency = COALESCE($5, currency),
          stock = COALESCE($6, stock),
          sku = COALESCE($7, sku),
          weight = COALESCE($8, weight),
          dimensions = COALESCE($9, dimensions),
          status = COALESCE($10, status),
          keywords = COALESCE($11, keywords),
          image_urls = COALESCE($12, image_urls),
          is_marketplace_ready = COALESCE($13, is_marketplace_ready),
          readiness_score = COALESCE($14, readiness_score),
          marketplaces = COALESCE($15, marketplaces),
          material = COALESCE($16, material),
          short_description = COALESCE($17, short_description),
          craft_story = COALESCE($18, craft_story),
          hsn_code = COALESCE($19, hsn_code),
          wholesale_price = COALESCE($20, wholesale_price),
          mrp = COALESCE($21, mrp),
          moq = COALESCE($22, moq),
          lead_time = COALESCE($23, lead_time),
          brand = COALESCE($24, brand),
          color = COALESCE($25, color),
          origin_state = COALESCE($26, origin_state),
          updated_at = NOW()
         WHERE id = $27 AND user_id = $28
         RETURNING *`,
        [
          title,
          description,
          category,
          price !== void 0 ? parseFloat(price) : null,
          currency,
          stock !== void 0 ? parseInt(stock, 10) : null,
          sku,
          weight,
          dimensions,
          status,
          keywords ? JSON.stringify(keywords) : null,
          sanitizedUpdateImageUrls ? JSON.stringify(sanitizedUpdateImageUrls) : null,
          isMarketplaceReady,
          readinessScore,
          marketplaces ? JSON.stringify(marketplaces) : null,
          material,
          effectiveShortDesc,
          effectiveCraftStory,
          effectiveHsn,
          effectiveWholesale,
          effectiveMrp,
          effectiveMoq,
          effectiveLeadTime,
          brand,
          color,
          effectiveOriginState,
          id,
          userId
        ]
      );
      row = updateRes.rows[0];
    } catch (updateErr) {
      if (updateErr.message && (updateErr.message.includes("column") || updateErr.message.includes("does not exist"))) {
        console.warn("Falling back to legacy product table schema for update:", updateErr.message);
        const fallbackRes = await queryPg(
          `UPDATE products SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            price = COALESCE($4, price),
            currency = COALESCE($5, currency),
            stock = COALESCE($6, stock),
            sku = COALESCE($7, sku),
            weight = COALESCE($8, weight),
            dimensions = COALESCE($9, dimensions),
            status = COALESCE($10, status),
            keywords = COALESCE($11, keywords),
            image_urls = COALESCE($12, image_urls),
            is_marketplace_ready = COALESCE($13, is_marketplace_ready),
            readiness_score = COALESCE($14, readiness_score),
            marketplaces = COALESCE($15, marketplaces),
            updated_at = NOW()
           WHERE id = $16 AND user_id = $17
           RETURNING *`,
          [
            title,
            description,
            category,
            price !== void 0 ? parseFloat(price) : null,
            currency,
            stock !== void 0 ? parseInt(stock, 10) : null,
            sku,
            weight,
            dimensions,
            status,
            keywords ? JSON.stringify(keywords) : null,
            imageUrls ? JSON.stringify(imageUrls) : null,
            isMarketplaceReady,
            readinessScore,
            marketplaces ? JSON.stringify(marketplaces) : null,
            id,
            userId
          ]
        );
        row = fallbackRes.rows[0];
      } else {
        throw updateErr;
      }
    }
    res.json({
      product: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        category: row.category,
        price: parseFloat(row.price),
        currency: row.currency,
        stock: row.stock,
        sku: row.sku,
        weight: row.weight,
        dimensions: row.dimensions,
        material: row.material || "",
        shortDescription: row.short_description || "",
        craftStory: row.craft_story || "",
        hsnCode: row.hsn_code || "",
        wholesalePrice: row.wholesale_price !== null && row.wholesale_price !== void 0 ? parseFloat(row.wholesale_price) : void 0,
        mrp: row.mrp !== null && row.mrp !== void 0 ? parseFloat(row.mrp) : void 0,
        moq: row.moq !== null && row.moq !== void 0 ? row.moq : 1,
        leadTime: row.lead_time || "3-5 business days",
        brand: row.brand || "",
        color: row.color || "",
        originState: row.origin_state || "",
        status: row.status,
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
        isMarketplaceReady: row.is_marketplace_ready,
        readinessScore: row.readiness_score,
        marketplaces: Array.isArray(row.marketplaces) ? row.marketplaces : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      message: "Product updated successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});
app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleteRes = await queryPg(`DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING title`, [id, userId]).catch(() => ({ rows: [] }));
    const userMemProds = memoryProductsMap.get(userId) || [];
    const memIdx = userMemProds.findIndex((p) => p.id === id);
    if (memIdx !== -1) {
      userMemProds.splice(memIdx, 1);
    }
    if (deleteRes.rows.length === 0 && memIdx === -1) {
      res.status(404).json({ error: "Product not found or unauthorized" });
      return;
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});
app.post("/api/products/:id/duplicate", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const origRes = await queryPg(`SELECT * FROM products WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (origRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const orig = origRes.rows[0];
    const newId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const dupRes = await queryPg(
      `INSERT INTO products (
        id, user_id, title, description, category, price, currency, stock, sku, weight, dimensions,
        status, keywords, image_urls, is_marketplace_ready, readiness_score, marketplaces,
        material, short_description, craft_story, hsn_code, wholesale_price, mrp, moq, lead_time,
        brand, color, origin_state, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
      ) RETURNING *`,
      [
        newId,
        userId,
        `${orig.title} (Copy)`,
        orig.description,
        orig.category,
        orig.price,
        orig.currency,
        orig.stock,
        orig.sku ? `${orig.sku}-copy` : `SKU-${Date.now().toString().slice(-5)}`,
        orig.weight,
        orig.dimensions,
        orig.status,
        JSON.stringify(orig.keywords || []),
        JSON.stringify(orig.image_urls || []),
        orig.is_marketplace_ready,
        orig.readiness_score,
        JSON.stringify(orig.marketplaces || []),
        orig.material || "",
        orig.short_description || "",
        orig.craft_story || "",
        orig.hsn_code || "",
        orig.wholesale_price,
        orig.mrp,
        orig.moq || 1,
        orig.lead_time || "3-5 business days",
        orig.brand || "",
        orig.color || "",
        orig.origin_state || ""
      ]
    );
    const row = dupRes.rows[0];
    res.json({
      product: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        category: row.category,
        price: parseFloat(row.price),
        currency: row.currency,
        stock: row.stock,
        sku: row.sku,
        weight: row.weight,
        dimensions: row.dimensions,
        material: row.material,
        shortDescription: row.short_description,
        craftStory: row.craft_story,
        hsnCode: row.hsn_code,
        wholesalePrice: row.wholesale_price !== null && row.wholesale_price !== void 0 ? parseFloat(row.wholesale_price) : void 0,
        mrp: row.mrp !== null && row.mrp !== void 0 ? parseFloat(row.mrp) : void 0,
        moq: row.moq,
        leadTime: row.lead_time,
        brand: row.brand,
        color: row.color,
        originState: row.origin_state,
        status: row.status,
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
        isMarketplaceReady: row.is_marketplace_ready,
        readinessScore: row.readiness_score,
        marketplaces: Array.isArray(row.marketplaces) ? row.marketplaces : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      message: "Product duplicated successfully"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to duplicate product" });
  }
});
app.post("/api/products/:id/archive", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const prodRes = await queryPg(`SELECT status FROM products WHERE id = $1 AND user_id = $2`, [id, userId]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const newStatus = prodRes.rows[0].status === "archived" ? "published" : "archived";
    await queryPg(`UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3`, [newStatus, id, userId]);
    res.json({ success: true, message: `Product status updated to ${newStatus}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to archive product" });
  }
});
app.get("/api/marketplace/destinations", (req, res) => {
  res.json({
    destinations: Object.values(MARKETPLACE_DESTINATIONS)
  });
});
app.post("/api/marketplace/readiness", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, productIds } = req.body;
    const destKey = (destination || "").toLowerCase();
    if (!destKey || !MARKETPLACE_DESTINATIONS[destKey]) {
      res.status(400).json({ error: `Unsupported or missing destination: ${destination}` });
      return;
    }
    let query = `SELECT * FROM products WHERE user_id = $1`;
    const params = [userId];
    if (Array.isArray(productIds) && productIds.length > 0) {
      params.push(productIds);
      query += ` AND id = ANY($2)`;
    }
    query += ` ORDER BY created_at DESC`;
    const [prodResult, profileResult] = await Promise.all([
      queryPg(query, params),
      queryPg(`SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1`, [userId])
    ]);
    const profile = profileResult.rows[0];
    const rawProducts = prodResult.rows;
    const canonicalProducts = rawProducts.map(
      (p) => toCanonicalProduct(p, {
        brandName: profile?.brand_name,
        businessName: profile?.business_name,
        state: profile?.state,
        district: profile?.district
      })
    );
    const batchResult = validateBatch(canonicalProducts, destKey);
    res.json(batchResult);
  } catch (err) {
    console.error("Marketplace readiness check error:", err);
    res.status(500).json({ error: "Failed to run marketplace readiness validation" });
  }
});
app.post("/api/marketplace/export", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { destination, productIds, allowPartial } = req.body;
    const destKey = (destination || "").toLowerCase();
    if (!destKey || !MARKETPLACE_DESTINATIONS[destKey]) {
      res.status(400).json({ error: `Unsupported destination: ${destination}` });
      return;
    }
    let query = `SELECT * FROM products WHERE user_id = $1`;
    const params = [userId];
    if (Array.isArray(productIds) && productIds.length > 0) {
      params.push(productIds);
      query += ` AND id = ANY($2)`;
    }
    query += ` ORDER BY created_at DESC`;
    const [prodResult, profileResult] = await Promise.all([
      queryPg(query, params),
      queryPg(`SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1`, [userId])
    ]);
    if (prodResult.rows.length === 0) {
      res.status(400).json({ error: "No products available for export." });
      return;
    }
    const profile = profileResult.rows[0];
    const rawProducts = prodResult.rows;
    const canonicalProducts = rawProducts.map(
      (p) => toCanonicalProduct(p, {
        brandName: profile?.brand_name,
        businessName: profile?.business_name,
        state: profile?.state,
        district: profile?.district
      })
    );
    const exportResult = await executeMarketplaceExport(canonicalProducts, destination, {
      allowPartial: Boolean(allowPartial),
      providerInfo: {
        providerId: profile?.id || userId,
        providerName: profile?.brand_name || profile?.business_name || "Krivio Rural Artisan",
        phone: profile?.phone_number || req.user.phone,
        email: req.user.email
      }
    });
    const exportId = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const exportedIds = canonicalProducts.map((p) => p.id);
    await queryPg(
      `INSERT INTO marketplace_exports (
        id, user_id, destination, schema_version, format, product_count, product_ids, status, summary, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        exportId,
        userId,
        destination,
        exportResult.report.schemaVersion,
        exportResult.report.format,
        exportResult.report.totalExported,
        JSON.stringify(exportedIds),
        exportResult.status,
        JSON.stringify(exportResult.report)
      ]
    ).catch((err) => console.warn("Failed to record export history:", err));
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        `act_${Date.now()}`,
        userId,
        `Exported Catalog: ${exportResult.report.destinationName}`,
        `Prepared ${exportResult.report.totalExported} product(s) as ${exportResult.report.format.toUpperCase()}.`,
        "marketplace_export_created"
      ]
    ).catch(() => {
    });
    res.setHeader("Content-Type", exportResult.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
    res.setHeader("X-Krivio-Export-Report", encodeURIComponent(JSON.stringify(exportResult.report)));
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, X-Krivio-Export-Report");
    if (typeof exportResult.data === "string") {
      res.send(exportResult.data);
    } else {
      res.end(exportResult.data);
    }
  } catch (err) {
    console.error("Marketplace export generation error:", err);
    res.status(400).json({ error: err.message || "Failed to generate marketplace export." });
  }
});
app.get("/api/marketplace/exports", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await queryPg(
      `SELECT * FROM marketplace_exports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    res.json({ exports: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve export history" });
  }
});
app.post("/api/quotations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const quotation = await quotationService.createQuotation(userId, req.body);
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        `act_${Date.now()}`,
        userId,
        `Generated Quotation: ${quotation.quotationNumber}`,
        `Issued wholesale quotation for ${quotation.buyer.name} (${quotation.currency} ${quotation.grandTotal}).`,
        "b2b_quotation_created"
      ]
    ).catch(() => {
    });
    res.json({ quotation });
  } catch (err) {
    console.error("Quotation creation error:", err);
    res.status(400).json({ error: err.message || "Failed to create quotation" });
  }
});
app.get("/api/quotations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const quotations = await quotationService.getQuotations(userId);
    res.json({ quotations });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve quotations" });
  }
});
app.get("/api/quotations/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const quotation = await quotationService.getQuotationById(userId, req.params.id);
    if (!quotation) {
      res.status(404).json({ error: "Quotation not found or unauthorized" });
      return;
    }
    res.json({ quotation });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve quotation" });
  }
});
app.delete("/api/quotations/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const success = await quotationService.deleteQuotation(userId, req.params.id);
    if (!success) {
      res.status(404).json({ error: "Quotation not found or unauthorized" });
      return;
    }
    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete quotation" });
  }
});
app.get("/api/quotations/:id/pdf", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { buffer, filename } = await quotationService.renderPdf(userId, req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.end(buffer);
  } catch (err) {
    console.error("Quotation PDF error:", err);
    res.status(404).json({ error: err.message || "Failed to generate quotation PDF" });
  }
});
app.get("/api/business-profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await queryPg(`SELECT * FROM business_profiles WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) {
      res.json({
        businessProfile: {
          id: "",
          userId,
          user_id: userId,
          businessName: "",
          business_name: "",
          businessCategory: "Handicrafts & Rural Craft",
          business_type: "Handicrafts & Rural Craft",
          craftType: "Handicrafts & Rural Craft",
          businessDescription: "",
          description: "",
          story: "",
          state: "Bihar",
          district: "Madhubani",
          villageCity: "",
          village: "",
          pinCode: "",
          pin_code: "",
          primaryLanguage: "Hindi",
          language: "Hindi",
          yearsInBusiness: 1,
          years_in_business: 1,
          website: "",
          socialMediaLinks: { facebook: "", instagram: "", whatsapp: "" },
          social_links: {},
          brandName: "",
          brand_name: "",
          phoneNumber: req.user.phone || "",
          phone: req.user.phone || "",
          phone_number: req.user.phone || "",
          businessRegistration: "",
          business_registration: "",
          gstNumber: "",
          gst_number: ""
        }
      });
      return;
    }
    const row = result.rows[0];
    res.json({
      businessProfile: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        businessName: row.business_name || "",
        business_name: row.business_name || "",
        businessCategory: row.business_type || "Handicrafts",
        business_type: row.business_type || "Handicrafts",
        craftType: row.business_type || "Handicrafts",
        businessDescription: row.description || "",
        description: row.description || "",
        story: row.description || "",
        state: row.state || "Bihar",
        district: row.district || "Madhubani",
        villageCity: row.village || "",
        village: row.village || "",
        pinCode: row.pin_code || "",
        pin_code: row.pin_code || "",
        primaryLanguage: row.language || "Hindi",
        language: row.language || "Hindi",
        yearsInBusiness: row.years_in_business || 1,
        years_in_business: row.years_in_business || 1,
        website: row.website || "",
        socialMediaLinks: typeof row.social_links === "string" ? JSON.parse(row.social_links) : row.social_links || {},
        social_links: typeof row.social_links === "string" ? JSON.parse(row.social_links) : row.social_links || {},
        brandName: row.brand_name || "",
        brand_name: row.brand_name || "",
        phoneNumber: row.phone_number || "",
        phone: row.phone_number || "",
        phone_number: row.phone_number || "",
        businessRegistration: row.business_registration || "",
        business_registration: row.business_registration || "",
        gstNumber: row.gst_number || "",
        gst_number: row.gst_number || "",
        ownerName: req.user?.name || "",
        owner_name: req.user?.name || "",
        email: req.user?.email || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve business profile" });
  }
});
var handleSaveBusinessProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      business_name,
      businessCategory,
      business_type,
      craftType,
      businessDescription,
      description,
      state,
      district,
      villageCity,
      village,
      pinCode,
      pin_code,
      primaryLanguage,
      language,
      yearsInBusiness,
      years_in_business,
      website,
      socialMediaLinks,
      social_links,
      brandName,
      brand_name,
      phoneNumber,
      phone_number,
      businessRegistration,
      business_registration,
      gstNumber,
      gst_number
    } = req.body;
    const bName = businessName || business_name || "My Artisan Enterprise";
    const bType = businessCategory || business_type || craftType || "Handicrafts";
    const bDesc = businessDescription || description || "";
    const bState = state || "Bihar";
    const bDist = district || "Madhubani";
    const bVill = villageCity || village || "";
    const bPin = pinCode || pin_code || "";
    const bLang = primaryLanguage || language || "Hindi";
    const bYears = yearsInBusiness || years_in_business || 1;
    const bWeb = website || "";
    const bSocial = socialMediaLinks || social_links || {};
    const bBrand = brandName || brand_name || "";
    const bPhone = phoneNumber || phone_number || req.user.phone || "";
    const bReg = businessRegistration || business_registration || "";
    const bGst = gstNumber || gst_number || "";
    const bOwner = req.body.ownerName || req.body.owner_name;
    if (bOwner) {
      await queryPg(`UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2`, [bOwner, userId]).catch(() => {
      });
    }
    const existing = await queryPg(`SELECT id FROM business_profiles WHERE user_id = $1`, [userId]);
    let row;
    if (existing.rows.length > 0) {
      const updateRes = await queryPg(
        `UPDATE business_profiles SET
          business_name = $1, business_type = $2, description = $3, state = $4, district = $5,
          village = $6, pin_code = $7, language = $8, years_in_business = $9, website = $10,
          social_links = $11, brand_name = $12, phone_number = $13, business_registration = $14,
          gst_number = $15, updated_at = NOW()
         WHERE user_id = $16 RETURNING *`,
        [bName, bType, bDesc, bState, bDist, bVill, bPin, bLang, bYears, bWeb, JSON.stringify(bSocial), bBrand, bPhone, bReg, bGst, userId]
      );
      row = updateRes.rows[0];
    } else {
      const newId = `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const insertRes = await queryPg(
        `INSERT INTO business_profiles (
          id, user_id, business_name, business_type, description, state, district, village,
          pin_code, language, years_in_business, website, social_links, brand_name, phone_number,
          business_registration, gst_number, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
        RETURNING *`,
        [newId, userId, bName, bType, bDesc, bState, bDist, bVill, bPin, bLang, bYears, bWeb, JSON.stringify(bSocial), bBrand, bPhone, bReg, bGst]
      );
      row = insertRes.rows[0];
    }
    res.json({
      businessProfile: {
        id: row.id,
        userId: row.user_id,
        user_id: row.user_id,
        businessName: row.business_name,
        business_name: row.business_name,
        businessCategory: row.business_type,
        business_type: row.business_type,
        craftType: row.business_type,
        businessDescription: row.description,
        description: row.description,
        story: row.description,
        state: row.state,
        district: row.district,
        villageCity: row.village,
        village: row.village,
        pinCode: row.pin_code,
        pin_code: row.pin_code,
        primaryLanguage: row.language,
        language: row.language,
        yearsInBusiness: row.years_in_business,
        years_in_business: row.years_in_business,
        website: row.website,
        socialMediaLinks: typeof row.social_links === "string" ? JSON.parse(row.social_links) : row.social_links || {},
        social_links: typeof row.social_links === "string" ? JSON.parse(row.social_links) : row.social_links || {},
        brandName: row.brand_name,
        brand_name: row.brand_name,
        phoneNumber: row.phone_number,
        phone: row.phone_number,
        phone_number: row.phone_number,
        businessRegistration: row.business_registration,
        business_registration: row.business_registration,
        gstNumber: row.gst_number,
        gst_number: row.gst_number,
        ownerName: bOwner || req.user?.name || "",
        owner_name: bOwner || req.user?.name || "",
        email: req.user?.email || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      message: "Business profile saved successfully"
    });
  } catch (err) {
    console.error("Business profile save error:", err);
    res.status(500).json({ error: "Failed to save business profile" });
  }
};
app.post("/api/business-profile", authenticateToken, handleSaveBusinessProfile);
app.put("/api/business-profile", authenticateToken, handleSaveBusinessProfile);
app.delete("/api/business-profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await queryPg(`DELETE FROM business_profiles WHERE user_id = $1`, [userId]);
    res.json({ success: true, message: "Business profile removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete business profile" });
  }
});
var userTasksMemoryMap = /* @__PURE__ */ new Map();
async function buildUserTasks(userId, prof, totalProducts, marketplaceReadyProducts) {
  let dbTaskMap = /* @__PURE__ */ new Map();
  try {
    const dbTaskRows = await queryPg(`SELECT task_id, completed FROM user_tasks WHERE user_id = $1`, [userId]);
    for (const row of dbTaskRows.rows) {
      dbTaskMap.set(row.task_id, Boolean(row.completed));
    }
  } catch {
  }
  const memMap = userTasksMemoryMap.get(userId);
  const getStatus = (taskId, defaultStatus) => {
    if (dbTaskMap.has(taskId)) return !!dbTaskMap.get(taskId);
    if (memMap && memMap.has(taskId)) return !!memMap.get(taskId);
    return defaultStatus;
  };
  const tasks = [
    {
      id: "task_profile",
      title: "Complete your Business Profile",
      description: "Add your enterprise name, craft story, and location to build buyer credibility.",
      category: "profile",
      completed: getStatus("task_profile", Boolean(prof && prof.business_name)),
      dueDate: "High Priority"
    },
    {
      id: "task_first_product",
      title: "Create your first Product listing",
      description: "Use the Product Studio with AI story generation to showcase your handcrafted inventory.",
      category: "product",
      completed: getStatus("task_first_product", totalProducts > 0),
      dueDate: "Today"
    },
    {
      id: "task_marketplace_ready",
      title: "Complete dimensions and weight for ONDC",
      description: "Add package specifications to make all catalog products ONDC ready.",
      category: "marketplace",
      completed: getStatus("task_marketplace_ready", totalProducts > 0 && marketplaceReadyProducts >= totalProducts),
      dueDate: "Today"
    },
    {
      id: "task_voice_mentor",
      title: "Consult AI Voice Mentor for fair pricing",
      description: "Ask your mentor in Hindi, English, or regional voice to calculate craft material and labor costs.",
      category: "mentor",
      completed: getStatus("task_voice_mentor", totalProducts > 0),
      dueDate: "Recommended"
    }
  ];
  return tasks;
}
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const prodsRes = await queryPg(`SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [userId]);
    const totalCountRes = await queryPg(`SELECT COUNT(*) as cnt FROM products WHERE user_id = $1`, [userId]);
    const readyCountRes = await queryPg(`SELECT COUNT(*) as cnt FROM products WHERE user_id = $1 AND is_marketplace_ready = true`, [userId]);
    const totalProducts = parseInt(totalCountRes.rows[0].cnt, 10) || 0;
    const marketplaceReadyProducts = parseInt(readyCountRes.rows[0].cnt, 10) || 0;
    const profRes = await queryPg(`SELECT * FROM business_profiles WHERE user_id = $1`, [userId]);
    const prof = profRes.rows[0];
    const actsRes = await queryPg(`SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [userId]);
    let healthScore = 0;
    if (prof && prof.business_name) {
      healthScore += 30;
      if (prof.description) healthScore += 10;
      if (prof.business_registration || prof.gst_number) healthScore += 10;
    }
    if (totalProducts > 0) {
      healthScore += 20;
      if (totalProducts >= 3) healthScore += 10;
      if (marketplaceReadyProducts > 0) healthScore += 20;
    }
    const revenueRes = await queryPg(`SELECT SUM(price * COALESCE(stock, 1)) as total_rev FROM products WHERE user_id = $1`, [userId]);
    const estimatedMonthlyRevenue = parseFloat(revenueRes.rows[0]?.total_rev) || 0;
    const tasks = await buildUserTasks(userId, prof, totalProducts, marketplaceReadyProducts);
    const recentProducts = prodsRes.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      price: parseFloat(row.price),
      currency: row.currency,
      stock: row.stock,
      imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
      isMarketplaceReady: row.is_marketplace_ready,
      readinessScore: row.readiness_score,
      createdAt: row.created_at
    }));
    const recentActivity = actsRes.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      eventType: row.event_type,
      createdAt: row.created_at
    }));
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        businessName: prof?.business_name || `${req.user.name}'s Enterprise`,
        location: prof?.district ? `${prof.district}, ${prof.state}` : "India",
        subscriptionPlan: "free"
      },
      stats: {
        totalProducts,
        marketplaceReadyProducts,
        marketplaceReadyCount: marketplaceReadyProducts,
        healthScore: Math.min(100, healthScore),
        estimatedMonthlyRevenue,
        monthlyViews: 0,
        inquiriesReceived: 0,
        activeOrders: 0,
        completedTasksCount: tasks.filter((t) => t.completed).length
      },
      tasks,
      recentProducts,
      recentActivity
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});
app.post("/api/tasks/toggle", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.body;
    if (!taskId) {
      res.status(400).json({ error: "taskId is required" });
      return;
    }
    const profRes = await queryPg(`SELECT * FROM business_profiles WHERE user_id = $1`, [userId]).catch(() => ({ rows: [] }));
    const totalCountRes = await queryPg(`SELECT COUNT(*) as cnt FROM products WHERE user_id = $1`, [userId]).catch(() => ({ rows: [{ cnt: "0" }] }));
    const readyCountRes = await queryPg(`SELECT COUNT(*) as cnt FROM products WHERE user_id = $1 AND is_marketplace_ready = true`, [userId]).catch(() => ({ rows: [{ cnt: "0" }] }));
    const totalProducts = parseInt(totalCountRes.rows[0]?.cnt || "0", 10) || 0;
    const marketplaceReadyProducts = parseInt(readyCountRes.rows[0]?.cnt || "0", 10) || 0;
    const currentTasks = await buildUserTasks(userId, profRes.rows[0], totalProducts, marketplaceReadyProducts);
    const targetTask = currentTasks.find((t) => t.id === taskId);
    const isCurrentlyCompleted = targetTask ? targetTask.completed : false;
    const nextCompleted = !isCurrentlyCompleted;
    await queryPg(
      `INSERT INTO user_tasks (user_id, task_id, completed, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, task_id)
       DO UPDATE SET completed = $3, updated_at = NOW()`,
      [userId, taskId, nextCompleted]
    ).catch(() => {
    });
    if (!userTasksMemoryMap.has(userId)) {
      userTasksMemoryMap.set(userId, /* @__PURE__ */ new Map());
    }
    userTasksMemoryMap.get(userId).set(taskId, nextCompleted);
    const updatedTasks = await buildUserTasks(userId, profRes.rows[0], totalProducts, marketplaceReadyProducts);
    res.json({
      success: true,
      tasks: updatedTasks
    });
  } catch (err) {
    console.error("Task toggle error:", err);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});
app.post("/api/ai/mentor", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, language = "English", conversationHistory = [] } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const profRes = await queryPg(`SELECT * FROM business_profiles WHERE user_id = $1`, [userId]);
    const prodsRes = await queryPg(`SELECT title, category, price FROM products WHERE user_id = $1 LIMIT 5`, [userId]);
    const prof = profRes.rows[0];
    const bizName = prof?.business_name || req.user.name;
    const craftType = prof?.business_type || "Rural Enterprise & Crafts";
    const prodList = prodsRes.rows.map((p) => `${p.title} (\u20B9${p.price})`).join(", ") || "No products listed yet";
    const systemPrompt = `You are KRIVIO AI, an encouraging, practical voice-first AI business mentor for rural entrepreneurs in India (artisans, SHGs, weavers, potters, farmers, micro-enterprises).
User Profile:
- Enterprise: ${bizName}
- Craft/Domain: ${craftType}
- Products: ${prodList}

Topics: pricing formulas, listing on ONDC/Amazon Karigar/Meesho/Etsy, government schemes (PM Vishwakarma, MUDRA, NABARD), taking photos with clean backgrounds.
Language: Respond in ${language}. Keep the response clear, warm, practical, and concise (under 180 words) for voice reading.`;
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "AI Mentor service is temporarily unavailable. Server API key is not configured." });
      return;
    }
    const mentorResult = await AITaskRouter.handle({
      task: "MENTOR",
      language,
      userInput: message,
      userContext: {
        userId,
        name: req.user.name,
        preferredLanguage: req.user.preferredLanguage,
        state: prof?.state
      },
      businessContext: {
        businessName: bizName,
        craftType,
        targetChannels: prof?.channels || ["Local Market", "ONDC", "Amazon"]
      },
      productContext: prodsRes.rows.length > 0 ? {
        name: prodsRes.rows[0].title,
        price: prodsRes.rows[0].price,
        category: prodsRes.rows[0].category
      } : void 0,
      conversationContext: (conversationHistory || []).slice(-6).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text || ""
      }))
    });
    const replyText = mentorResult.response;
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const convRes = await queryPg(`SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [userId]);
    if (convRes.rows.length > 0) {
      const conv = convRes.rows[0];
      const msgs = Array.isArray(conv.messages) ? conv.messages : [];
      msgs.push({ id: `msg_${Date.now()}_u`, sender: "user", text: message, timestamp, language });
      msgs.push({ id: `msg_${Date.now()}_a`, sender: "assistant", text: replyText, timestamp, language });
      await queryPg(`UPDATE conversations SET messages = $1 WHERE id = $2`, [JSON.stringify(msgs), conv.id]);
    } else {
      const newConvId = `conv_${Date.now()}`;
      const msgs = [
        { id: `msg_${Date.now()}_u`, sender: "user", text: message, timestamp, language },
        { id: `msg_${Date.now()}_a`, sender: "assistant", text: replyText, timestamp, language }
      ];
      await queryPg(
        `INSERT INTO conversations (id, user_id, title, messages, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [newConvId, userId, "AI Business Mentorship", JSON.stringify(msgs)]
      );
    }
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [`act_${Date.now()}`, userId, "Consulted AI Voice Mentor", `Asked: "${message.slice(0, 50)}..."`, "ai_mentor"]
    ).catch(() => {
    });
    res.json({
      reply: replyText,
      intent: mentorResult.intent,
      entities: mentorResult.entities,
      recommendedActions: mentorResult.recommendedActions,
      suggestedFollowUps: mentorResult.suggestedFollowUps,
      language: mentorResult.language || language,
      timestamp
    });
  } catch (err) {
    console.error("Failed to process AI mentorship request:", err.message || err);
    res.status(503).json({ error: "Failed to process AI mentorship request: " + (err.message || "Service error") });
  }
});
app.post("/api/pricing/calculate", authenticateToken, async (req, res) => {
  try {
    const {
      productId,
      productName,
      category,
      materialCost,
      laborCost,
      laborHours,
      hourlyRate,
      packagingCost,
      transportCost,
      overheadCost,
      desiredMarginPercent,
      platformFeePercent,
      language = "en"
    } = req.body;
    const result = await PricingEngine.calculateWithExplanation(
      {
        productId,
        materialCost,
        laborCost,
        laborHours,
        hourlyRate,
        packagingCost,
        transportCost,
        overheadCost,
        desiredMarginPercent,
        platformFeePercent
      },
      {
        productName,
        category,
        language: normalizeLanguageName(language || req.user?.preferredLanguage || "en"),
        artisanName: req.user?.name
      }
    );
    res.json(result);
  } catch (err) {
    console.error("Pricing calculation error:", err.message || err);
    res.status(500).json({ error: "Failed to calculate pricing: " + (err.message || "Calculation error") });
  }
});
app.get("/api/ai/health", async (req, res) => {
  const health = await geminiService.checkHealth();
  const summary = aiObservability.getHealthSummary();
  res.json({
    status: health.healthy ? "available" : "degraded",
    gemini: health,
    observability: summary,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/ai/diagnostics", authenticateToken, async (req, res) => {
  res.json({
    summary: aiObservability.getHealthSummary(),
    recentLogs: aiObservability.getRecentLogs(30)
  });
});
app.get("/api/storefront/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userRes = await queryPg(`SELECT * FROM users WHERE id = $1`, [userId]);
    const profRes = await queryPg(`SELECT * FROM business_profiles WHERE user_id = $1`, [userId]);
    const prodsRes = await queryPg(`SELECT * FROM products WHERE user_id = $1 AND status = 'published'`, [userId]);
    const user = userRes.rows[0];
    const prof = profRes.rows[0];
    const artisanName = user?.full_name || "Artisan";
    const businessName = prof?.business_name || `${artisanName}'s Craft Studio`;
    const craftType = prof?.business_type || "Handicrafts & Art";
    const story = prof?.description || `Authentic handmade creations by ${artisanName}.`;
    const phone = prof?.phone_number || user?.phone_number || "";
    const products = prodsRes.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || "",
      category: row.category || "Handicrafts & Art",
      price: parseFloat(row.price) || 0,
      currency: row.currency || "INR",
      stock: row.stock || 1,
      imageUrls: Array.isArray(row.image_urls) ? row.image_urls : [],
      isMarketplaceReady: row.is_marketplace_ready,
      createdAt: row.created_at
    }));
    res.json({
      artisan: {
        id: userId,
        name: artisanName,
        businessName,
        location: prof?.district ? `${prof.district}, ${prof.state}` : "India",
        craftType,
        story,
        phone,
        isVerified: user?.is_verified || false,
        joinedDate: user?.created_at ? new Date(user.created_at).toISOString().split("T")[0] : "2026-01-01"
      },
      products,
      totalProducts: products.length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load public storefront" });
  }
});
app.post("/api/storefront/inquiry", async (req, res) => {
  try {
    const { userId, productTitle, quantity = 1, totalAmount = 0, city = "", pincode = "", buyerName = "Buyer", inquiryType = "Direct Order" } = req.body;
    if (userId) {
      const locStr = city ? ` for delivery to ${city}${pincode ? ` (${pincode})` : ""}` : "";
      await queryPg(
        `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          `act_${Date.now()}`,
          userId,
          `WhatsApp ${inquiryType}: ${productTitle || "Artisan Craft"}`,
          `${buyerName} inquired: Qty ${quantity} (\u20B9${totalAmount})${locStr}.`,
          "whatsapp_inquiry"
        ]
      ).catch(() => {
      });
    }
    res.json({ success: true, message: "Inquiry tracked successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to track inquiry" });
  }
});
app.get("/api/subscriptions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const subRes = await queryPg(`SELECT * FROM subscriptions WHERE user_id = $1`, [userId]);
    const sub = subRes.rows[0] || {
      id: `sub_${userId}`,
      userId,
      plan: "free",
      status: "active",
      startDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json({ subscription: sub });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve subscription" });
  }
});
app.post("/api/payments/create-order", authenticateToken, async (req, res) => {
  const { plan = "pro", amount = 299 } = req.body;
  res.json({
    id: `order_${Date.now()}`,
    orderId: `order_${Date.now()}`,
    amount: amount * 100,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_krivio123",
    plan
  });
});
app.post("/api/payments/verify", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    if (!razorpayPaymentId) {
      res.status(400).json({ error: "Missing payment transaction ID" });
      return;
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && razorpaySignature && razorpayOrderId) {
      const expectedSignature = import_crypto.default.createHmac("sha256", secret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
      if (expectedSignature !== razorpaySignature) {
        res.status(400).json({ error: "Invalid payment signature. Verification failed." });
        return;
      }
    } else if (process.env.NODE_ENV === "production" && !razorpaySignature) {
      res.status(400).json({ error: "Missing payment signature for verification." });
      return;
    }
    await queryPg(
      `INSERT INTO subscriptions (id, user_id, plan, status, razorpay_payment_id, start_date, end_date)
       VALUES ($1, $2, 'pro', 'active', $3, NOW(), NOW() + INTERVAL '30 days')
       ON CONFLICT (user_id) DO UPDATE SET
        plan = 'pro', status = 'active', razorpay_payment_id = $3, start_date = NOW(), end_date = NOW() + INTERVAL '30 days'`,
      [`sub_${Date.now()}`, userId, razorpayPaymentId || ""]
    );
    res.json({
      success: true,
      subscriptionPlan: "pro",
      message: "Subscription upgraded to Pro successfully!"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify payment" });
  }
});
app.get("/api/marketplace/recommendations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const countRes = await queryPg(`SELECT COUNT(*) as cnt FROM products WHERE user_id = $1`, [userId]);
    const profRes = await queryPg(`SELECT business_registration, gst_number FROM business_profiles WHERE user_id = $1`, [userId]);
    const prodCount = parseInt(countRes.rows[0].cnt, 10) || 0;
    const prof = profRes.rows[0];
    const hasReg = Boolean(prof && (prof.business_registration || prof.gst_number));
    res.json({
      channels: [
        {
          channelId: "ondc",
          channelName: "ONDC (Open Network for Digital Commerce)",
          logo: "\u{1F310}",
          fitScore: 96,
          description: "Government-backed open commerce network connecting rural artisans directly to buyers nationwide.",
          benefits: ["0% platform lock-in fees", "Direct daily bank payouts", "National discovery via Paytm & Mystore"],
          requirements: ["Udyam / GST registration", "Bank account details", "At least 1 listed product with SKU"],
          isEligible: hasReg && prodCount > 0
        },
        {
          channelId: "amazon_karigar",
          channelName: "Amazon Karigar",
          logo: "\u{1F4E6}",
          fitScore: 92,
          description: "Dedicated storefront highlighting authentic handmade Indian crafts with subsidized fees.",
          benefits: ["Karigar verified badge", "Free onboarding assistance", "Pan-India Prime delivery"],
          requirements: ["Artisan ID / Craft Certificate", "GST details", "3 product listings with photos"],
          isEligible: prodCount >= 3
        },
        {
          channelId: "flipkart_samarth",
          channelName: "Flipkart Samarth",
          logo: "\u{1F6CD}\uFE0F",
          fitScore: 89,
          description: "Program empowering weavers and rural SHGs with 0% commission waivers for 6 months.",
          benefits: ["0% commission for 6 months", "Dedicated onboarding manager", "Fulfillment support"],
          requirements: ["SHG certificate / Udyam ID", "Clean white-background photos", "Stock count > 0"],
          isEligible: hasReg && prodCount > 0
        },
        {
          channelId: "meesho",
          channelName: "Meesho Micro-Seller",
          logo: "\u{1F3F7}\uFE0F",
          fitScore: 94,
          description: "High-volume zero-commission platform ideal for mass-selling rural crafts across Tier-2/3 cities.",
          benefits: ["0% commission fee", "Zero penalty on cancellations", "Massive regional buyer reach"],
          requirements: ["GSTIN or Enrolment ID", "Active bank account", "Basic product dimensions"],
          isEligible: prodCount > 0
        },
        {
          channelId: "etsy_india",
          channelName: "Etsy Global & India",
          logo: "\u{1F3A8}",
          fitScore: 87,
          description: "Premier global marketplace for authentic handmade art commanding premium export prices.",
          benefits: ["International buyers in USD/EUR", "Higher profit margins", "Artisan story-first storefront"],
          requirements: ["PayPal / Razorpay for payouts", "English craft story", "Safe international packaging"],
          isEligible: prodCount > 0
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load marketplace recommendations" });
  }
});
app.post("/api/images/analyze", authenticateToken, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "Vision AI service is currently unavailable. Server API key is not configured." });
      return;
    }
    let mimeType = "image/jpeg";
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(",")) {
      const parts = imageBase64.split(",", 2);
      mimeType = parts[0].replace("data:", "").split(";")[0] || "image/jpeg";
      cleanBase64 = parts[1];
    }
    const [diagnosis, prodAnalysis] = await Promise.all([
      AITaskRouter.handle({
        task: "PHOTO_DIAGNOSIS",
        imageInput: { base64Data: cleanBase64, mimeType },
        language: req.user?.preferredLanguage || "en"
      }),
      AITaskRouter.handle({
        task: "PRODUCT_ANALYSIS",
        imageInput: { base64Data: cleanBase64, mimeType },
        language: req.user?.preferredLanguage || "en"
      })
    ]);
    const analysis = {
      id: `img_${Date.now()}`,
      imageUrl: imageBase64,
      lightingScore: diagnosis.dimensions.lighting.score,
      backgroundScore: diagnosis.dimensions.background.score,
      overallScore: diagnosis.overallScore,
      lightingFeedback: diagnosis.dimensions.lighting.feedback,
      backgroundFeedback: diagnosis.dimensions.background.feedback,
      suggestions: diagnosis.actionableImprovements.length > 0 ? diagnosis.actionableImprovements.slice(0, 3) : [
        "Shoot in morning daylight near a window for natural warmth.",
        "Place a plain white paper or cloth underneath for clean contrast.",
        "Include one close-up shot showing fine texture and craftsmanship."
      ],
      detectedSubject: prodAnalysis.productType,
      category: prodAnalysis.category,
      visibleMaterials: prodAnalysis.visibleMaterials,
      colors: prodAnalysis.colors,
      craftCharacteristics: prodAnalysis.craftCharacteristics,
      marketplaceCompliance: diagnosis.marketplaceCompliance,
      uncertainAttributes: prodAnalysis.uncertainAttributes,
      clarificationQuestions: prodAnalysis.clarificationQuestions,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    res.json({ analysis });
  } catch (err) {
    console.error("Failed to analyze product image:", err.message || err);
    res.status(503).json({ error: "Failed to analyze product image with Vision AI: " + (err.message || "Service error") });
  }
});
app.get("/api/image-studio/operations", (req, res) => {
  res.json({
    operations: Object.values(IMAGE_OPERATIONS),
    categories: OPERATION_CATEGORIES
  });
});
app.post("/api/image-studio/generate", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      operationId,
      userInstruction,
      originalImage,
      referenceImages,
      aspectRatio,
      language,
      brandContext,
      festivalOrOccasion,
      marketingText
    } = req.body;
    if (!originalImage) {
      res.status(400).json({ error: "An original product image is required." });
      return;
    }
    let effectiveBrand = brandContext;
    if (!effectiveBrand) {
      const profRes = await queryPg("SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1", [userId]).catch(() => ({ rows: [] }));
      const prof = profRes.rows[0];
      if (prof) {
        effectiveBrand = {
          brandName: prof.business_name,
          tagline: prof.story,
          craftType: prof.craft_type,
          region: prof.state || prof.district
        };
      }
    }
    const result = await imageGenService.generate({
      productId,
      operationId,
      userInstruction,
      originalImage,
      referenceImages,
      aspectRatio,
      language,
      brandContext: effectiveBrand,
      festivalOrOccasion,
      marketingText
    });
    await queryPg(
      `INSERT INTO image_studio_assets (
        id, user_id, product_id, operation_id, category, original_asset, generated_asset,
        aspect_ratio, user_instruction, prompt_summary, model_used, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [
        result.assetId,
        userId,
        productId || null,
        result.operationId,
        IMAGE_OPERATIONS[result.operationId]?.category || "photo_cleanup",
        result.originalImage,
        result.generatedImage,
        result.aspectRatio,
        userInstruction || "",
        result.summaryNote,
        result.modelUsed,
        JSON.stringify({
          operationLabel: result.operationLabel,
          brandUsed: Boolean(effectiveBrand?.brandName),
          festival: festivalOrOccasion || null
        })
      ]
    ).catch((dbErr) => {
      console.warn("DB asset tracking note:", dbErr.message);
    });
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        `act_${Date.now()}`,
        userId,
        `Enhanced product image: ${result.operationLabel}`,
        `Generated ${result.operationLabel} asset using AI Image Studio.`,
        "image_generated"
      ]
    ).catch(() => {
    });
    res.json({
      success: true,
      asset: result
    });
  } catch (err) {
    console.error("Image Studio generation error:", err.message || err);
    res.status(500).json({
      error: "The enhancement could not be completed right now. Your original image is still safe."
    });
  }
});
app.post("/api/image-studio/edit", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { previousAssetId, userInstruction, currentImage, originalImage, aspectRatio } = req.body;
    if (!userInstruction || !userInstruction.trim()) {
      res.status(400).json({ error: "Please provide an instruction for how to edit the image." });
      return;
    }
    const baseImage = currentImage || originalImage;
    if (!baseImage) {
      res.status(400).json({ error: "Image source is missing for editing." });
      return;
    }
    const result = await imageGenService.generate({
      originalImage: baseImage,
      userInstruction,
      aspectRatio,
      operationId: "ADVANCED_EDITING"
    });
    await queryPg(
      `INSERT INTO image_studio_assets (
        id, user_id, operation_id, category, original_asset, generated_asset,
        aspect_ratio, user_instruction, prompt_summary, model_used, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        result.assetId,
        userId,
        "ADVANCED_EDITING",
        "advanced_editing",
        originalImage || baseImage,
        result.generatedImage,
        result.aspectRatio,
        userInstruction,
        `Iterative edit: ${userInstruction}`,
        result.modelUsed,
        JSON.stringify({ previousAssetId })
      ]
    ).catch(() => {
    });
    res.json({
      success: true,
      asset: result
    });
  } catch (err) {
    console.error("Image Studio edit error:", err.message || err);
    res.status(500).json({
      error: "Could not apply your edit right now. Your previous image is still preserved."
    });
  }
});
app.get("/api/image-studio/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const historyRes = await queryPg(
      `SELECT * FROM image_studio_assets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 40`,
      [userId]
    );
    const assets = historyRes.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      operationId: row.operation_id,
      category: row.category,
      originalAsset: row.original_asset,
      generatedAsset: row.generated_asset,
      selectedAsset: row.selected_asset,
      aspectRatio: row.aspect_ratio,
      userInstruction: row.user_instruction,
      promptSummary: row.prompt_summary,
      modelUsed: row.model_used,
      metadata: row.metadata || {},
      createdAt: row.created_at
    }));
    res.json({ assets });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve image studio history." });
  }
});
app.post("/api/image-studio/save-to-product", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId, productId, imageUrl } = req.body;
    if (!productId || !imageUrl) {
      res.status(400).json({ error: "productId and imageUrl are required." });
      return;
    }
    const prodRes = await queryPg("SELECT * FROM products WHERE id = $1 AND user_id = $2", [productId, userId]);
    if (prodRes.rows.length === 0) {
      res.status(404).json({ error: "Product not found or unauthorized." });
      return;
    }
    const currentImages = Array.isArray(prodRes.rows[0].image_urls) ? prodRes.rows[0].image_urls : [];
    const updatedImages = [imageUrl, ...currentImages.filter((u) => u !== imageUrl)];
    const updateRes = await queryPg(
      `UPDATE products SET image_urls = $1, is_marketplace_ready = true, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`,
      [JSON.stringify(updatedImages), productId, userId]
    );
    if (assetId) {
      await queryPg(
        `UPDATE image_studio_assets SET product_id = $1, selected_asset = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4`,
        [productId, imageUrl, assetId, userId]
      ).catch(() => {
      });
    }
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        `act_${Date.now()}`,
        userId,
        `Updated Product Photo for ${prodRes.rows[0].title}`,
        "Saved AI-enhanced professional image to product catalog.",
        "product_updated"
      ]
    ).catch(() => {
    });
    res.json({
      success: true,
      message: "Image saved to your product successfully!",
      product: updateRes.rows[0]
    });
  } catch (err) {
    console.error("Save to product error:", err);
    res.status(500).json({ error: "Failed to attach image to product." });
  }
});
app.delete("/api/image-studio/history/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const delRes = await queryPg("DELETE FROM image_studio_assets WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
    if (delRes.rows.length === 0) {
      res.status(404).json({ error: "Asset not found or unauthorized." });
      return;
    }
    res.json({ success: true, message: "Asset removed from studio history." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete asset from history." });
  }
});
app.post("/api/voice/transcribe", authenticateToken, async (req, res) => {
  try {
    const { audio_data, language = "Hindi", mime_type = "audio/webm" } = req.body;
    const requestId = `vreq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (!audio_data) {
      res.status(400).json({ error: "audio_data is required for voice transcription." });
      return;
    }
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "Voice transcription service is temporarily unavailable. Server API key is not configured." });
      return;
    }
    let cleanBase64 = audio_data;
    let effectiveMime = mime_type;
    if (cleanBase64.includes(",")) {
      const parts = cleanBase64.split(",", 2);
      effectiveMime = parts[0].replace("data:", "").split(";")[0];
      cleanBase64 = parts[1];
    }
    const prompt = `You are a vernacular voice-to-text transcriber for Indian rural artisans, weavers, and self-help groups.
The user is speaking in ${language}, Hinglish, or an Indian vernacular language.
Transcribe EXACTLY what was said without translating, editing, or adding commentary.
Return ONLY the raw spoken text. If the audio is completely silent or unrecognizable, return the word [INDECIPHERABLE].`;
    const rawTranscript = await geminiService.generateContent({
      userPrompt: prompt,
      inlineMedia: [
        {
          mimeType: effectiveMime,
          data: cleanBase64
        }
      ],
      temperature: 0.1
    });
    const transcript = (rawTranscript || "").trim();
    if (!transcript || transcript === "[INDECIPHERABLE]") {
      res.status(422).json({ error: "Could not clearly recognize audio. Please speak clearly into your microphone and try again." });
      return;
    }
    res.json({
      success: true,
      transcript,
      request_id: requestId,
      need_confirmation: true,
      detected_language: language,
      confidence: 0.95
    });
  } catch (err) {
    console.error("Voice transcription error:", err.message || err);
    res.status(503).json({ error: "Failed to transcribe audio with Voice AI: " + (err.message || "Service error") });
  }
});
app.post("/api/voice/respond", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { transcript, language = "Hindi", context } = req.body;
    if (!transcript || !transcript.trim()) {
      res.status(400).json({ error: "Transcript is required." });
      return;
    }
    if (!geminiService.isAvailable()) {
      res.status(503).json({ error: "Voice AI service is temporarily unavailable. Server API key is not configured." });
      return;
    }
    const profRes = await queryPg("SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1", [userId]).catch(() => ({ rows: [] }));
    const prof = profRes.rows[0];
    const bizName = prof ? prof.business_name : req.user.name;
    const craftType = prof ? prof.craft_type : "Handicrafts";
    const prodRes = await queryPg("SELECT title, price, category FROM products WHERE user_id = $1 LIMIT 5", [userId]).catch(() => ({ rows: [] }));
    const prodList = prodRes.rows.map((p) => `${p.title} (\u20B9${p.price || 0})`).join(", ");
    const sysPrompt = `You are KRIVIO AI, a voice-first business mentor for Indian artisans, weavers, and rural entrepreneurs.
User Profile:
- Business: ${bizName}
- Craft Domain: ${craftType}
- Products: ${prodList || "None listed yet"}
- Spoken Language: ${language}

User Spoken Query:
"${transcript}"

Analyze this query and respond with JSON:
{
  "intent": "PricingQuery" | "MarketingAdvice" | "CatalogHelp" | "SchemeInquiry" | "GeneralMentorship",
  "entities": {
    "product": "product name if mentioned",
    "quantity": "quantity if mentioned",
    "price": "price if mentioned",
    "material": "material if mentioned"
  },
  "reply": "Warm, respectful, practical answer in ${language}. Keep it concise (2-4 sentences max), culturally tailored, and actionable for voice playback."
}`;
    const rawResponse = await geminiService.generateContent({
      systemInstruction: "Respond only with valid JSON as requested.",
      userPrompt: sysPrompt,
      responseMimeType: "application/json",
      temperature: 0.5
    });
    const parsed = JSON.parse(rawResponse || "{}");
    const intent = parsed.intent || "GeneralMentorship";
    const entities = parsed.entities || {};
    const replyText = parsed.reply || rawResponse;
    const assetId = `vast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await queryPg(
      `INSERT INTO voice_assets (
        id, user_id, transcript, intent, entities, response_text, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [assetId, userId, transcript.trim(), intent, JSON.stringify(entities), replyText]
    ).catch((dbErr) => console.warn("DB voice asset save note:", dbErr.message));
    await queryPg(
      `INSERT INTO activities (id, user_id, title, description, event_type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        `act_${Date.now()}`,
        userId,
        `Voice Query: ${intent}`,
        `Asked: "${transcript.slice(0, 50)}..."`,
        "voice_interaction"
      ]
    ).catch(() => {
    });
    res.json({
      success: true,
      asset_id: assetId,
      intent,
      entities,
      response_text: replyText,
      response_audio: null,
      language
    });
  } catch (err) {
    console.error("Voice respond error:", err.message || err);
    res.status(503).json({ error: "Failed to process voice response: " + (err.message || "Service error") });
  }
});
app.post("/api/voice/listen", authenticateToken, (req, res) => {
  const { text, language = "Hindi" } = req.body;
  res.json({
    success: true,
    audio_data: null,
    format: "audio/mp3",
    text: text || "",
    language
  });
});
app.get("/api/voice/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await queryPg(
      "SELECT * FROM voice_assets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25",
      [userId]
    );
    res.json({
      success: true,
      interactions: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch voice interaction history." });
  }
});
app.delete("/api/voice/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await queryPg("DELETE FROM voice_assets WHERE user_id = $1", [userId]);
    res.json({ success: true, message: "Voice history cleared successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear voice history." });
  }
});
app.get("/webhook/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const configuredToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!mode || !token) {
    res.status(400).send("Missing mode or token");
    return;
  }
  if (mode !== "subscribe") {
    res.status(403).send("Invalid mode");
    return;
  }
  if (!configuredToken) {
    console.error("WHATSAPP_VERIFY_TOKEN is not configured on server");
    res.status(500).send("Webhook unconfigured on server");
    return;
  }
  if (token !== configuredToken) {
    console.warn("WhatsApp webhook verify token mismatch");
    res.status(403).send("Forbidden: Invalid verify token");
    return;
  }
  console.log("WhatsApp webhook verified successfully");
  res.status(200).send(challenge);
});
app.post("/webhook/whatsapp", async (req, res) => {
  res.status(200).json({ status: "received" });
  const payload = req.body;
  if (!payload || !payload.entry) return;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0";
  (async () => {
    try {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const messages = value.messages || [];
          for (const msg of messages) {
            const msgId = msg.id;
            const fromSender = msg.from;
            const msgType = msg.type;
            if (!msgId || !fromSender) continue;
            const checkRes = await queryPg("SELECT id FROM voice_assets WHERE whatsapp_message_id = $1 LIMIT 1", [msgId]).catch(() => ({ rows: [] }));
            if (checkRes.rows && checkRes.rows.length > 0) {
              console.log(`Duplicate WhatsApp webhook message ${msgId} ignored`);
              continue;
            }
            const assetId = `vast_wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const digits = fromSender.replace(/\D/g, "");
            const last10 = digits.slice(-10);
            const userRes = await queryPg("SELECT id, full_name, phone_number, preferred_language FROM users WHERE phone_number LIKE $1 LIMIT 1", [`%${last10}%`]).catch(() => ({ rows: [] }));
            const user = userRes.rows[0];
            let bizName = user ? user.full_name : "\u0915\u093E\u0930\u0940\u0917\u0930 \u0938\u093E\u0925\u0940";
            let craftType = "Handicrafts";
            let prodTitles = "";
            if (user) {
              const profRes = await queryPg("SELECT business_name, craft_type, business_type FROM business_profiles WHERE user_id = $1 LIMIT 1", [user.id]).catch(() => ({ rows: [] }));
              if (profRes.rows[0]) {
                bizName = profRes.rows[0].business_name || bizName;
                craftType = profRes.rows[0].craft_type || profRes.rows[0].business_type || craftType;
              }
              const prodRes = await queryPg("SELECT title, price FROM products WHERE user_id = $1 LIMIT 5", [user.id]).catch(() => ({ rows: [] }));
              prodTitles = prodRes.rows.map((p) => `${p.title} (\u20B9${p.price || 0})`).join(", ");
            }
            await queryPg(
              `INSERT INTO voice_assets (
                id, user_id, whatsapp_message_id, whatsapp_sender_id, phone_number,
                input_type, language, transcript, processing_status, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
              [
                assetId,
                user ? user.id : null,
                msgId,
                fromSender,
                fromSender,
                msgType === "audio" || msgType === "voice" ? "voice" : "text",
                "hi-IN",
                msg.text?.body || "",
                "RECEIVED"
              ]
            ).catch((err) => console.warn("Voice asset init record error:", err.message));
            let transcript = "";
            if (msgType === "audio" || msgType === "voice") {
              const mediaId = msg.audio?.id || msg.voice?.id;
              if (mediaId && accessToken) {
                try {
                  const mediaMetaRes = await fetch(`https://graph.facebook.com/${graphVersion}/${mediaId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  if (mediaMetaRes.ok) {
                    const mediaMetaData = await mediaMetaRes.json();
                    const downloadUrl = mediaMetaData.url;
                    if (downloadUrl) {
                      const audioFetch = await fetch(downloadUrl, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                      });
                      if (audioFetch.ok) {
                        const arrayBuffer = await audioFetch.arrayBuffer();
                        const b64Audio = Buffer.from(arrayBuffer).toString("base64");
                        if (ai) {
                          const transPrompt = `You are a voice-to-text transcriber for rural Indian artisans. Transcribe this audio exactly into text without translation or commentary. Language: Hindi/Vernacular. Return ONLY the spoken text.`;
                          const aiTrans = await ai.models.generateContent({
                            model: "gemini-2.5-flash-image",
                            contents: [
                              { inlineData: { mimeType: "audio/ogg", data: b64Audio } },
                              { text: transPrompt }
                            ]
                          });
                          transcript = (aiTrans.text || "").trim();
                        }
                      }
                    }
                  }
                } catch (mediaErr) {
                  console.error("Media download/transcribe error:", mediaErr.message);
                }
              }
            } else if (msgType === "text") {
              transcript = (msg.text?.body || "").trim();
            } else {
              transcript = "Hello KRIVIO";
            }
            if (!transcript) {
              transcript = "Maine 10 handmade brass diya lamps banaye hain, inka market price kya hona chahiye?";
            }
            await queryPg("UPDATE voice_assets SET transcript = $1, processing_status = $2, updated_at = NOW() WHERE id = $3", [transcript, "TRANSCRIBED", assetId]).catch(() => {
            });
            let intent = "PricingQuery";
            let entities = {};
            let replyText = "";
            if (ai) {
              try {
                const sysPrompt = `You are KRIVIO AI, a trusted business mentor for Indian rural artisans on WhatsApp.
User Status: ${user ? "Registered" : "New/Unlinked"} Artisan: ${bizName} (${craftType})
Catalog: ${prodTitles || "None yet"}
User Spoken Message: "${transcript}"

SAFETY RULES:
1. For pricing, provide an ESTIMATED RANGE based on raw materials, labor hours, and marketplace margins. Explain assumptions.
2. If destructive actions (delete, payment, bank changes) are requested, inform them to use the KRIVIO dashboard.
3. Keep reply concise (2-4 sentences max), warm, respectful in Hindi/Hinglish.
4. Output JSON:
{
  "intent": "PricingQuery" | "MarketingAdvice" | "CatalogHelp" | "SchemeInquiry" | "GeneralMentorship",
  "entities": {"product": string, "quantity": number},
  "reply": string
}`;
                const aiRes = await ai.models.generateContent({
                  model: "gemini-2.5-flash-image",
                  contents: [{ text: sysPrompt }],
                  config: { responseMimeType: "application/json" }
                });
                const parsed = JSON.parse(aiRes.text || "{}");
                intent = parsed.intent || intent;
                entities = parsed.entities || entities;
                replyText = parsed.reply || "";
              } catch (aiErr) {
                console.warn("AI understanding error:", aiErr.message);
              }
            }
            if (!replyText) {
              replyText = `\u0928\u092E\u0938\u094D\u0924\u0947 ${bizName}! \u0906\u092A\u0915\u0947 \u0939\u0938\u094D\u0924\u0936\u093F\u0932\u094D\u092A \u0909\u0924\u094D\u092A\u093E\u0926\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0915\u091A\u094D\u091A\u093E \u092E\u093E\u0932 \u0935 \u0938\u092E\u092F \u091C\u094B\u0921\u093C\u0915\u0930 \u20B9450-\u20B9550 \u092A\u094D\u0930\u0924\u093F \u092A\u0940\u0938 \u0915\u093E \u0926\u093E\u092E ONDC \u0935 \u092C\u093E\u091C\u093E\u0930 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u0940 \u0930\u0939\u0947\u0917\u093E\u0964 \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0917\u0923\u0928\u093E \u0915\u0947 \u0932\u093F\u090F KRIVIO \u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921 \u0926\u0947\u0916\u0947\u0902\u0964`;
            }
            if (accessToken && phoneId) {
              try {
                await fetch(`https://graph.facebook.com/${graphVersion}/${phoneId}/messages`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: fromSender,
                    type: "text",
                    text: { body: replyText }
                  })
                });
              } catch (sendErr) {
                console.error("Outbound WhatsApp send error:", sendErr.message);
              }
            }
            await queryPg(
              `UPDATE voice_assets
               SET intent = $1, entities = $2, response_text = $3, processing_status = 'COMPLETED', updated_at = NOW()
               WHERE id = $4`,
              [intent, JSON.stringify(entities), replyText, assetId]
            ).catch(() => {
            });
          }
        }
      }
    } catch (bgErr) {
      console.error("Background WhatsApp worker error:", bgErr.message);
    }
  })();
});
app.get("/api/whatsapp/status", (req, res) => {
  const hasToken = bool(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneId = bool(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasVerify = bool(process.env.WHATSAPP_VERIFY_TOKEN);
  const isConfigured = hasToken && hasPhoneId && hasVerify;
  function bool(v) {
    return Boolean(v && v.trim());
  }
  res.json({
    whatsapp: {
      status: isConfigured ? "configured" : "unconfigured",
      is_configured: isConfigured,
      has_access_token: hasToken,
      has_phone_number_id: hasPhoneId,
      has_verify_token: hasVerify,
      graph_api_version: process.env.WHATSAPP_GRAPH_API_VERSION || "v21.0"
    },
    speech: {
      active_provider: process.env.GOOGLE_APPLICATION_CREDENTIALS ? "chirp_2" : "gemini_audio",
      is_configured: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
    },
    webhook_endpoint: "/webhook/whatsapp",
    ready_for_credentials: true
  });
});
async function initPgDatabase() {
  try {
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        supabase_user_id VARCHAR(255) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255),
        phone_number VARCHAR(100),
        profile_image TEXT,
        role VARCHAR(50) DEFAULT 'artisan',
        preferred_language VARCHAR(10) DEFAULT 'en',
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS business_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) DEFAULT 'Handicrafts',
        description TEXT,
        state VARCHAR(100),
        district VARCHAR(100),
        village VARCHAR(100),
        pin_code VARCHAR(20),
        language VARCHAR(50) DEFAULT 'Hindi',
        years_in_business INT DEFAULT 1,
        website VARCHAR(255),
        social_links JSONB DEFAULT '{}'::jsonb,
        brand_name VARCHAR(255),
        phone_number VARCHAR(100),
        business_registration VARCHAR(255),
        gst_number VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'Handicrafts & Art',
        price NUMERIC(10, 2) DEFAULT 0.0,
        currency VARCHAR(10) DEFAULT 'INR',
        stock INT DEFAULT 1,
        sku VARCHAR(100),
        weight VARCHAR(100),
        dimensions VARCHAR(100),
        material VARCHAR(150),
        short_description TEXT,
        craft_story TEXT,
        hsn_code VARCHAR(50),
        wholesale_price NUMERIC(10, 2),
        mrp NUMERIC(10, 2),
        moq INT DEFAULT 1,
        lead_time VARCHAR(100) DEFAULT '3-5 business days',
        brand VARCHAR(150),
        color VARCHAR(100),
        origin_state VARCHAR(100),
        status VARCHAR(50) DEFAULT 'published',
        keywords JSONB DEFAULT '[]'::jsonb,
        image_urls JSONB DEFAULT '[]'::jsonb,
        is_marketplace_ready BOOLEAN DEFAULT TRUE,
        readiness_score INT DEFAULT 85,
        marketplaces JSONB DEFAULT '["ONDC"]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT 'AI Business Mentorship',
        language VARCHAR(50) DEFAULT 'English',
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(50) DEFAULT 'free',
        status VARCHAR(50) DEFAULT 'active',
        razorpay_payment_id VARCHAR(255),
        razorpay_order_id VARCHAR(255),
        amount NUMERIC(10, 2) DEFAULT 0.0,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(100) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        storage_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS image_studio_assets (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
        operation_id VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        original_asset TEXT NOT NULL,
        generated_asset TEXT NOT NULL,
        selected_asset TEXT,
        aspect_ratio VARCHAR(20) DEFAULT '1:1',
        user_instruction TEXT,
        prompt_summary TEXT,
        model_used VARCHAR(100),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS voice_assets (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        whatsapp_message_id VARCHAR(255) UNIQUE,
        whatsapp_sender_id VARCHAR(255),
        phone_number VARCHAR(50),
        input_type VARCHAR(50) DEFAULT 'voice',
        language VARCHAR(50) DEFAULT 'hi-IN',
        transcript TEXT,
        intent VARCHAR(100),
        entities JSONB DEFAULT '{}'::jsonb,
        response_text TEXT,
        response_audio TEXT,
        processing_status VARCHAR(50) DEFAULT 'RECEIVED',
        error_code VARCHAR(100),
        error_message TEXT,
        provider_metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quotation_number VARCHAR(100) UNIQUE NOT NULL,
        buyer_name VARCHAR(255) NOT NULL,
        buyer_company VARCHAR(255),
        buyer_email VARCHAR(255),
        buyer_phone VARCHAR(100),
        buyer_address TEXT,
        buyer_gst VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'INR',
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        tax_total NUMERIC(12, 2) DEFAULT 0.00,
        grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        valid_until DATE,
        commercial_notes TEXT,
        shipping_terms TEXT,
        payment_terms TEXT,
        status VARCHAR(50) DEFAULT 'generated',
        items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
        seller_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS marketplace_exports (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination VARCHAR(50) NOT NULL,
        schema_version VARCHAR(100) NOT NULL,
        format VARCHAR(20) NOT NULL,
        product_count INT NOT NULL DEFAULT 0,
        product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'completed',
        summary JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_tasks (
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id VARCHAR(100) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, task_id)
      );
    `;
    await pgPool.query(createTablesQuery);
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en'`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(150)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS craft_story TEXT`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(50)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(10, 2)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS moq INT DEFAULT 1`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time VARCHAR(100) DEFAULT '3-5 business days'`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(150)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(100)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_state VARCHAR(100)`).catch(() => {
    });
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id)`).catch(() => {
    });
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_quotations_quote_num ON quotations(quotation_number)`).catch(() => {
    });
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_mk_exports_user_id ON marketplace_exports(user_id)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ALTER COLUMN user_id DROP NOT NULL`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ALTER COLUMN transcript DROP NOT NULL`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS whatsapp_sender_id VARCHAR(255)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS input_type VARCHAR(50) DEFAULT 'voice'`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'hi-IN'`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'RECEIVED'`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS error_code VARCHAR(100)`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS error_message TEXT`).catch(() => {
    });
    await pgPool.query(`ALTER TABLE voice_assets ADD COLUMN IF NOT EXISTS provider_metadata JSONB DEFAULT '{}'::jsonb`).catch(() => {
    });
    await pgPool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_assets_wa_msg_id ON voice_assets(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL`).catch(() => {
    });
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_voice_assets_status ON voice_assets(processing_status)`).catch(() => {
    });
    await pgPool.query(`CREATE INDEX IF NOT EXISTS idx_voice_assets_sender ON voice_assets(whatsapp_sender_id)`).catch(() => {
    });
    console.log("PostgreSQL production database tables verified.");
  } catch (err) {
    console.warn("PostgreSQL initialization notice:", err.message || err);
  }
}
app.use((err, req, res, next) => {
  console.error("[Global Express Error Handler]:", err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || (err.type === "entity.too.large" ? 413 : 500);
  const message = err.type === "entity.too.large" ? "Image payload is too large. Please upload an optimized smartphone photo." : err?.message || "An unexpected error occurred. Your work is safe.";
  res.status(status).json({
    error: message
  });
});
async function startServer() {
  await initPgDatabase();
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KRIVIO AI Production Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}
var isMainModule = Boolean(process.argv[1] && (process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("server.js") || process.argv[1].endsWith("server.cjs")));
if (!process.env.VERCEL && isMainModule && process.env.NODE_ENV !== "test") {
  startServer();
}
var server_default = app;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app,
  ensureDbInitialized
});
//# sourceMappingURL=server.cjs.map
