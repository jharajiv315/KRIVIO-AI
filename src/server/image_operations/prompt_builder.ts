import { GenerateImageRequest, ImageOperation } from './types';

export interface ComposedPrompt {
  fullPrompt: string;
  summaryNote: string;
  preservationDirectives: string[];
}

export function buildPrompt(
  operation: ImageOperation,
  request: GenerateImageRequest,
  detectedSubject?: string
): ComposedPrompt {
  const subjectName = detectedSubject || 'handcrafted artisan product';
  const brand = request.brandContext;

  // 1. Core Subject Definition
  const subjectSection = `SUBJECT: The authentic ${subjectName} shown in the provided source image. Retain its true physical geometry, hand-crafted motifs, proportions, raw material texture, and genuine color palette with extreme fidelity.`;

  // 2. User Intent & Action
  let intentSection = `GOAL: ${operation.description}`;
  if (request.userInstruction && request.userInstruction.trim()) {
    intentSection += ` Specific entrepreneur refinement: "${request.userInstruction.trim()}".`;
  }

  // 3. Environment & Context
  let contextSection = `ENVIRONMENT: ${operation.promptTemplate.replace('{SUBJECT}', subjectName)}`;
  if (brand?.brandName) {
    contextSection = contextSection.replace('{BRAND_NAME}', brand.brandName);
  }
  if (brand?.craftType) {
    contextSection = contextSection.replace('{CRAFT_TYPE}', brand.craftType);
  }
  if (brand?.region) {
    contextSection = contextSection.replace('{REGION}', brand.region);
  }
  if (brand?.brandColors && brand.brandColors.length > 0) {
    contextSection = contextSection.replace('{BRAND_COLORS}', brand.brandColors.join(', '));
  }
  if (request.festivalOrOccasion) {
    contextSection = contextSection.replace('{OCCASION}', request.festivalOrOccasion);
  }
  if (request.userInstruction) {
    contextSection = contextSection.replace('{USER_INSTRUCTION}', request.userInstruction);
  }

  // 4. Style & Composition
  const compositionSection = `COMPOSITION & FRAMING: Centered eye-level commercial e-commerce composition with balanced margins, clean negative space, and realistic depth of field. High-end retail catalog presentation adhering strictly to commercial product standards.`;

  // 5. Positive Semantic Negative Directives
  const semanticCleanliness = `VISUAL CLEANLINESS: Pristine, uncluttered environment where the product is prominently isolated and celebrated. Seamless, smooth background surfaces with realistic soft ambient contact shadow grounding the product naturally.`;

  // 6. Marketing Copy Directives (Strict: No Hallucinations)
  let textDirectives = '';
  if (request.marketingText?.headline || request.marketingText?.subheadline || request.marketingText?.cta) {
    const lines: string[] = [];
    if (request.marketingText.headline) lines.push(`"${request.marketingText.headline}"`);
    if (request.marketingText.subheadline) lines.push(`"${request.marketingText.subheadline}"`);
    if (request.marketingText.cta) lines.push(`"${request.marketingText.cta}"`);
    if (request.marketingText.price) lines.push(`"₹${request.marketingText.price}"`);

    textDirectives = `TEXT OVERLAY REQUIREMENT: If typography is incorporated, render ONLY the following user-specified words in clean, elegant, legible typography: ${lines.join(' | ')}. STRICT RULE: Do not invent, fabricate or guess any unprovided dates, phone numbers, website URLs, certifications, discounts or fake awards.`;
  }

  // 7. Preservation Directives
  const preservationDirectives = [
    'Preserve exact product geometry, materials, stitches, painted details, and structural proportions.',
    'Do not alter the product color palette or invent imaginary redesigns.',
    'Only modify the surrounding background, lighting, and contextual framing.',
    ...operation.preservationRules,
  ];

  const preservationSection = `STRICT PRESERVATION LOCK:\n- ${preservationDirectives.join('\n- ')}`;

  // Assemble the unified Gemini Prompt
  const fullPrompt = [
    subjectSection,
    intentSection,
    contextSection,
    compositionSection,
    semanticCleanliness,
    textDirectives,
    preservationSection,
  ]
    .filter(Boolean)
    .join('\n\n');

  const summaryNote = `${operation.label}: Prepared for ${operation.humanCategory.toLowerCase()} with product identity preservation.`;

  return {
    fullPrompt,
    summaryNote,
    preservationDirectives,
  };
}
