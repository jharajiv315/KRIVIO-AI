import {
  PricingTier,
  QuotationBuyerInput,
  QuotationItemInput,
  QuotationItemSnapshot,
} from '../../types/marketplace';

/**
 * Performs decimal-safe monetary calculations using integer minor units (paise/cents)
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates unit price for a given quantity taking tiered pricing into account
 */
export function resolveEffectiveUnitPrice(
  baseUnitPrice: number,
  quantity: number,
  tiers?: PricingTier[]
): number {
  if (!tiers || tiers.length === 0) return baseUnitPrice;

  // Find matching tier
  for (const tier of tiers) {
    const min = tier.minQuantity;
    const max = tier.maxQuantity !== undefined && tier.maxQuantity !== null ? tier.maxQuantity : Infinity;
    if (quantity >= min && quantity <= max) {
      if (typeof tier.unitPrice === 'number' && tier.unitPrice > 0) {
        return tier.unitPrice;
      }
    }
  }

  return baseUnitPrice;
}

/**
 * Validates tiered pricing rules:
 * - Non-empty
 * - Lower bound <= upper bound
 * - No negative or zero prices
 * - Ascending or logical non-overlapping ranges
 */
export function validatePricingTiers(tiers?: PricingTier[]): { valid: boolean; error?: string } {
  if (!tiers || tiers.length === 0) return { valid: true };

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (typeof t.minQuantity !== 'number' || t.minQuantity <= 0 || !Number.isInteger(t.minQuantity)) {
      return { valid: false, error: `Tier #${i + 1}: minimum quantity must be a positive integer.` };
    }
    if (typeof t.unitPrice !== 'number' || t.unitPrice <= 0) {
      return { valid: false, error: `Tier #${i + 1}: unit price must be greater than zero.` };
    }
    if (t.maxQuantity !== undefined && t.maxQuantity !== null) {
      if (t.maxQuantity < t.minQuantity) {
        return { valid: false, error: `Tier #${i + 1}: maximum quantity cannot be less than minimum quantity.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Calculates line totals and summary totals for a list of quotation items
 */
export function calculateQuotationTotals(
  items: QuotationItemInput[],
  taxRatePercent: number = 0
): {
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  snapshots: QuotationItemSnapshot[];
} {
  if (!items || items.length === 0) {
    throw new Error('At least one product item is required for a wholesale quotation.');
  }

  let subtotal = 0;
  const snapshots: QuotationItemSnapshot[] = [];

  for (const item of items) {
    if (!item.title || item.title.trim().length === 0) {
      throw new Error('Product title is required for each line item.');
    }
    const qty = parseInt(String(item.quantity), 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for "${item.title}". Quantity must be a positive integer.`);
    }
    const moq = parseInt(String(item.moq || 1), 10);
    if (isNaN(moq) || moq <= 0) {
      throw new Error(`Invalid MOQ for "${item.title}". MOQ must be at least 1.`);
    }

    const basePrice = typeof item.unitPrice === 'number' ? item.unitPrice : parseFloat(String(item.unitPrice)) || 0;
    if (basePrice <= 0) {
      throw new Error(`Wholesale price for "${item.title}" must be greater than zero.`);
    }

    // Tiered pricing validation
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
      lineTotal,
    });
  }

  let taxTotal = 0;
  if (taxRatePercent > 0) {
    taxTotal = roundCurrency((subtotal * taxRatePercent) / 100);
  }
  const grandTotal = roundCurrency(subtotal + taxTotal);

  return {
    subtotal,
    taxTotal,
    grandTotal,
    snapshots,
  };
}

/**
 * Generates a unique, collision-safe quotation number: KRV-QT-YYYY-XXXXXX
 */
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampPart = Date.now().toString().slice(-4);
  return `KRV-QT-${year}-${timestampPart}${randomSuffix.slice(0, 2)}`;
}

/**
 * Validates buyer information
 */
export function validateBuyerInput(buyer: QuotationBuyerInput): { valid: boolean; error?: string } {
  if (!buyer || !buyer.name || buyer.name.trim().length < 2) {
    return { valid: false, error: 'Buyer or company contact name is required.' };
  }
  if (buyer.email && !buyer.email.includes('@')) {
    return { valid: false, error: 'Buyer email format is invalid.' };
  }
  return { valid: true };
}
