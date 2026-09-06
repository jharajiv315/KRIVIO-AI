import {
  BrandSuggestionResponse,
  PhotoDiagnosisResponse,
  ProductAnalysisResponse,
  ProductIdentityResponse,
} from './types';

export class DomainValidator {
  /**
   * Validate and sanitize ProductAnalysisResponse
   */
  public static validateProductAnalysis(data: any): { valid: boolean; error?: string; sanitized?: ProductAnalysisResponse } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Product analysis must be an object' };
    }

    const productType = typeof data.productType === 'string' && data.productType.trim() ? data.productType.trim() : 'Handicraft Item';
    const category = typeof data.category === 'string' && data.category.trim() ? data.category.trim() : 'General Crafts';
    const visibleMaterials = Array.isArray(data.visibleMaterials) && data.visibleMaterials.length > 0
      ? data.visibleMaterials.map((m: any) => String(m).trim()).filter(Boolean)
      : ['Natural Material'];
    const colors = Array.isArray(data.colors) ? data.colors.map((c: any) => String(c).trim()).filter(Boolean) : [];
    const shape = typeof data.shape === 'string' ? data.shape.trim() : '';
    const craftCharacteristics = Array.isArray(data.craftCharacteristics) ? data.craftCharacteristics.map((c: any) => String(c).trim()).filter(Boolean) : [];
    const visualStyle = typeof data.visualStyle === 'string' ? data.visualStyle.trim() : 'Traditional / Artisan';
    const possibleUseCases = Array.isArray(data.possibleUseCases) ? data.possibleUseCases.map((u: any) => String(u).trim()).filter(Boolean) : [];

    const imgQuality = data.imageQualityAssessment || {};
    const imageQualityAssessment = {
      lighting: typeof imgQuality.lighting === 'string' ? imgQuality.lighting : 'Adequate',
      sharpness: typeof imgQuality.sharpness === 'string' ? imgQuality.sharpness : 'Adequate',
      composition: typeof imgQuality.composition === 'string' ? imgQuality.composition : 'Centered',
      backgroundQuality: typeof imgQuality.backgroundQuality === 'string' ? imgQuality.backgroundQuality : 'Neutral',
      recommendations: Array.isArray(imgQuality.recommendations) ? imgQuality.recommendations.map((r: any) => String(r).trim()).filter(Boolean) : [],
    };

    const conf = data.confidenceScores || {};
    const categoryConfidence = typeof conf.categoryConfidence === 'number' && conf.categoryConfidence >= 0 && conf.categoryConfidence <= 1
      ? conf.categoryConfidence
      : 0.85;
    const materialConfidence = typeof conf.materialConfidence === 'number' && conf.materialConfidence >= 0 && conf.materialConfidence <= 1
      ? conf.materialConfidence
      : 0.80;

    const uncertainAttributes = Array.isArray(data.uncertainAttributes) ? data.uncertainAttributes.map((a: any) => String(a).trim()).filter(Boolean) : [];
    const clarificationQuestions = Array.isArray(data.clarificationQuestions) ? data.clarificationQuestions.map((q: any) => String(q).trim()).filter(Boolean) : [];

    // Domain check: detect hardcoded static placeholder
    if (productType.toLowerCase() === 'handcrafted product' && category.toLowerCase() === 'handicrafts' && visibleMaterials.length === 1 && visibleMaterials[0].toLowerCase() === 'handicraft material') {
      return { valid: false, error: 'Model returned generic static placeholder product analysis' };
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
        clarificationQuestions,
      },
    };
  }

  /**
   * Validate and sanitize PhotoDiagnosisResponse
   */
  public static validatePhotoDiagnosis(data: any): { valid: boolean; error?: string; sanitized?: PhotoDiagnosisResponse } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Photo diagnosis must be an object' };
    }

    const overallScore = typeof data.overallScore === 'number'
      ? Math.max(0, Math.min(100, Math.round(data.overallScore)))
      : 70;

    const parseDimension = (dim: any, fallbackName: string) => {
      if (!dim || typeof dim !== 'object') {
        return { score: 70, status: 'fair' as const, feedback: `${fallbackName} is acceptable.` };
      }
      const score = typeof dim.score === 'number' ? Math.max(0, Math.min(100, Math.round(dim.score))) : 70;
      const status = dim.status === 'good' || dim.status === 'fair' || dim.status === 'poor' ? dim.status : (score >= 75 ? 'good' : score >= 50 ? 'fair' : 'poor');
      const feedback = typeof dim.feedback === 'string' && dim.feedback.trim() ? dim.feedback.trim() : `${fallbackName} score is ${score}.`;
      return { score, status, feedback };
    };

    const dimensions = {
      lighting: parseDimension(data.dimensions?.lighting, 'Lighting'),
      background: parseDimension(data.dimensions?.background, 'Background'),
      framing: parseDimension(data.dimensions?.framing, 'Framing'),
      sharpness: parseDimension(data.dimensions?.sharpness, 'Sharpness'),
      productVisibility: parseDimension(data.dimensions?.productVisibility, 'Product Visibility'),
    };

    const keyIssues = Array.isArray(data.keyIssues) ? data.keyIssues.map((i: any) => String(i).trim()).filter(Boolean) : [];
    const actionableImprovements = Array.isArray(data.actionableImprovements) ? data.actionableImprovements.map((i: any) => String(i).trim()).filter(Boolean) : [];

    const mc = data.marketplaceCompliance || {};
    const marketplaceCompliance = {
      amazonReady: Boolean(mc.amazonReady ?? (overallScore >= 80)),
      flipkartReady: Boolean(mc.flipkartReady ?? (overallScore >= 75)),
      meeshoReady: Boolean(mc.meeshoReady ?? (overallScore >= 65)),
      ondcReady: Boolean(mc.ondcReady ?? (overallScore >= 70)),
      issuesToFix: Array.isArray(mc.issuesToFix) ? mc.issuesToFix.map((i: any) => String(i).trim()).filter(Boolean) : [],
    };

    return {
      valid: true,
      sanitized: {
        overallScore,
        dimensions,
        keyIssues,
        actionableImprovements,
        marketplaceCompliance,
      },
    };
  }

  /**
   * Validate and sanitize BrandSuggestionResponse
   */
  public static validateBrandSuggestions(data: any): { valid: boolean; error?: string; sanitized?: BrandSuggestionResponse } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Brand suggestion must be an object' };
    }

    const suggestions: any[] = Array.isArray(data.suggestions) ? data.suggestions : [];
    if (suggestions.length === 0) {
      return { valid: false, error: 'At least one brand suggestion is required' };
    }

    const sanitizedSuggestions = suggestions.map((s, idx) => ({
      name: typeof s.name === 'string' && s.name.trim() ? s.name.trim() : `CraftBrand ${idx + 1}`,
      tagline: typeof s.tagline === 'string' ? s.tagline.trim() : 'Artisanal Excellence',
      meaning: typeof s.meaning === 'string' ? s.meaning.trim() : 'Rooted in authentic tradition',
      culturalRelevance: typeof s.culturalRelevance === 'string' ? s.culturalRelevance.trim() : 'Indian Heritage',
      targetAppeal: typeof s.targetAppeal === 'string' ? s.targetAppeal.trim() : 'Art & Quality Lovers',
    }));

    // Detect canned static brand list
    const staticNames = ['kalagram', 'hastkraft', 'mittimool', 'bharathast'];
    const namesLower = sanitizedSuggestions.map(s => s.name.toLowerCase());
    const isCanned = staticNames.every(n => namesLower.includes(n));
    if (isCanned) {
      return { valid: false, error: 'Model returned canned static brand list' };
    }

    return {
      valid: true,
      sanitized: {
        suggestions: sanitizedSuggestions,
        personality: typeof data.personality === 'string' ? data.personality : 'Authentic',
        craftHeritage: typeof data.craftHeritage === 'string' ? data.craftHeritage : 'Indian Crafts',
        language: typeof data.language === 'string' ? data.language : 'en',
      },
    };
  }

  /**
   * Validate and sanitize ProductIdentityResponse
   */
  public static validateProductIdentity(data: any): { valid: boolean; error?: string; sanitized?: ProductIdentityResponse } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Product identity must be an object' };
    }

    const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : '';
    if (!title) {
      return { valid: false, error: 'Product title is required' };
    }

    const shortDescription = typeof data.shortDescription === 'string' ? data.shortDescription.trim() : '';
    const detailedDescription = typeof data.detailedDescription === 'string' ? data.detailedDescription.trim() : '';
    const story = typeof data.story === 'string' ? data.story.trim() : '';
    const bulletFeatures = Array.isArray(data.bulletFeatures) ? data.bulletFeatures.map((f: any) => String(f).trim()).filter(Boolean) : [];
    const specifications = data.specifications && typeof data.specifications === 'object' ? data.specifications : {};
    const careInstructions = typeof data.careInstructions === 'string' ? data.careInstructions.trim() : '';
    const keywords = Array.isArray(data.keywords) ? data.keywords.map((k: any) => String(k).trim()).filter(Boolean) : [];
    const tags = Array.isArray(data.tags) ? data.tags.map((t: any) => String(t).trim()).filter(Boolean) : [];
    const targetAudience = typeof data.targetAudience === 'string' ? data.targetAudience.trim() : 'Art & Craft Enthusiasts';
    const suggestedPriceRationale = typeof data.suggestedPriceRationale === 'string' ? data.suggestedPriceRationale.trim() : undefined;
    const language = typeof data.language === 'string' ? data.language : 'en';

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
        language,
      },
    };
  }
}
