import { AspectRatioType, ModelTier } from './types';
import { IMAGE_OPERATIONS } from './registry';

export interface ClassificationResult {
  operationId: string;
  recommendedModel: ModelTier;
  aspectRatio: AspectRatioType;
  preservationRules: string[];
  inferredDetails: {
    cleanBackground: boolean;
    isMarketplace: boolean;
    isFestive: boolean;
    festivalName?: string;
    isSocial: boolean;
    socialPlatform?: string;
    isRemoval: boolean;
    targetToRemove?: string;
    isBranded: boolean;
  };
}

export function classifyUserIntent(
  userInstruction?: string,
  explicitOperationId?: string,
  festivalOrOccasion?: string,
  preferredAspectRatio?: AspectRatioType
): ClassificationResult {
  // 1. If explicit operation provided and exists in registry, use it as baseline
  if (explicitOperationId && IMAGE_OPERATIONS[explicitOperationId]) {
    const op = IMAGE_OPERATIONS[explicitOperationId];
    return {
      operationId: op.id,
      recommendedModel: op.modelPreference,
      aspectRatio: preferredAspectRatio || op.aspectRatioRules,
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: op.category === 'photo_cleanup',
        isMarketplace: op.id === 'MARKETPLACE_PRIMARY_IMAGE' || op.id === 'WHITE_BACKGROUND',
        isFestive: op.category === 'seasonal_cultural',
        festivalName: festivalOrOccasion,
        isSocial: op.id.includes('INSTAGRAM') || op.id.includes('WHATSAPP') || op.id.includes('FACEBOOK'),
        isRemoval: op.id.includes('REMOVE'),
        isBranded: op.category === 'branding',
      },
    };
  }

  const text = (userInstruction || '').toLowerCase().trim();

  // 2. Intelligent pattern classification from natural text
  // Marketplace patterns
  if (text.includes('amazon') || text.includes('flipkart') || text.includes('meesho') || text.includes('ondc') || text.includes('white background')) {
    const op = IMAGE_OPERATIONS['MARKETPLACE_PRIMARY_IMAGE'];
    return {
      operationId: op.id,
      recommendedModel: 'fast',
      aspectRatio: '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: true,
        isMarketplace: true,
        isFestive: false,
        isSocial: false,
        isRemoval: false,
        isBranded: false,
      },
    };
  }

  // Festival patterns
  if (text.includes('diwali') || festivalOrOccasion === 'diwali') {
    const op = IMAGE_OPERATIONS['DIWALI'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || (text.includes('story') ? '9:16' : text.includes('insta') ? '4:5' : '1:1'),
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: false,
        isMarketplace: false,
        isFestive: true,
        festivalName: 'Diwali',
        isSocial: text.includes('insta') || text.includes('story'),
        isRemoval: false,
        isBranded: false,
      },
    };
  }

  if (text.includes('holi') || festivalOrOccasion === 'holi') {
    const op = IMAGE_OPERATIONS['HOLI'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: 'Holi', isSocial: false, isRemoval: false, isBranded: false },
    };
  }

  if (text.includes('navratri') || text.includes('durga') || festivalOrOccasion === 'navratri') {
    const op = IMAGE_OPERATIONS['NAVRATRI'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: 'Navratri', isSocial: false, isRemoval: false, isBranded: false },
    };
  }

  if (text.includes('eid') || festivalOrOccasion === 'eid') {
    const op = IMAGE_OPERATIONS['EID'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: true, festivalName: 'Eid', isSocial: false, isRemoval: false, isBranded: false },
    };
  }

  // Removal patterns
  if (text.includes('remove') || text.includes('delete') || text.includes('erase')) {
    const op = IMAGE_OPERATIONS['OBJECT_REMOVE'];
    const targetMatch = text.replace(/.*(remove|delete|erase)\s+(the\s+)?/i, '').trim();
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: {
        cleanBackground: false,
        isMarketplace: false,
        isFestive: false,
        isSocial: false,
        isRemoval: true,
        targetToRemove: targetMatch || undefined,
        isBranded: false,
      },
    };
  }

  // Social media patterns
  if (text.includes('story') || text.includes('reel') || text.includes('status')) {
    const op = IMAGE_OPERATIONS['INSTAGRAM_STORY'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: '9:16',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: 'Instagram Story', isRemoval: false, isBranded: false },
    };
  }

  if (text.includes('whatsapp') || text.includes('chat')) {
    const op = IMAGE_OPERATIONS['WHATSAPP_CATALOG'];
    return {
      operationId: op.id,
      recommendedModel: 'fast',
      aspectRatio: '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: 'WhatsApp', isRemoval: false, isBranded: false },
    };
  }

  if (text.includes('instagram') || text.includes('post') || text.includes('social')) {
    const op = IMAGE_OPERATIONS['INSTAGRAM_POST'];
    return {
      operationId: op.id,
      recommendedModel: 'production',
      aspectRatio: preferredAspectRatio || '4:5',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: true, socialPlatform: 'Instagram Post', isRemoval: false, isBranded: false },
    };
  }

  // Lighting / Quality patterns
  if (text.includes('light') || text.includes('dark') || text.includes('bright') || text.includes('sun')) {
    const op = IMAGE_OPERATIONS['LIGHTING_IMPROVEMENT'];
    return {
      operationId: op.id,
      recommendedModel: 'fast',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: false, isMarketplace: false, isFestive: false, isSocial: false, isRemoval: false, isBranded: false },
    };
  }

  // Background / Surface patterns
  if (text.includes('wood') || text.includes('table')) {
    const op = IMAGE_OPERATIONS['WOODEN_SURFACE'];
    return {
      operationId: op.id,
      recommendedModel: 'fast',
      aspectRatio: preferredAspectRatio || '1:1',
      preservationRules: op.preservationRules,
      inferredDetails: { cleanBackground: true, isMarketplace: false, isFestive: false, isSocial: false, isRemoval: false, isBranded: false },
    };
  }

  // Default fallback: Clean Studio
  const defaultOp = IMAGE_OPERATIONS['CLEAN_STUDIO'];
  return {
    operationId: defaultOp.id,
    recommendedModel: 'fast',
    aspectRatio: preferredAspectRatio || '1:1',
    preservationRules: defaultOp.preservationRules,
    inferredDetails: {
      cleanBackground: true,
      isMarketplace: false,
      isFestive: false,
      isSocial: false,
      isRemoval: false,
      isBranded: false,
    },
  };
}
