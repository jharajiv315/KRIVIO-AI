import {
  CanonicalProduct,
  MarketplaceDestination,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from '../../types/marketplace';
import { MARKETPLACE_DESTINATIONS } from './destinations';

export interface ValidationRule {
  id: string;
  field: string;
  destinations: MarketplaceDestination[];
  severity: ValidationSeverity;
  evaluate: (product: CanonicalProduct) => boolean; // returns true if PASS, false if FAIL
  message: string;
  remediation: string;
}

export const MARKETPLACE_VALIDATION_RULES: ValidationRule[] = [
  // 1. Universal Title
  {
    id: 'rule_title_exists',
    field: 'title',
    destinations: ['amazon', 'meesho', 'flipkart', 'generic_csv', 'generic_xlsx', 'ondc'],
    severity: 'ERROR',
    evaluate: (p) => Boolean(p.title && p.title.trim().length >= 3),
    message: 'Product title is required and must have at least 3 characters.',
    remediation: 'Provide a clear descriptive title for this item in the Product Studio.',
  },
  {
    id: 'rule_title_length_amazon',
    field: 'title',
    destinations: ['amazon'],
    severity: 'WARNING',
    evaluate: (p) => Boolean(p.title && p.title.length <= 200),
    message: 'Amazon recommends product titles under 200 characters to prevent mobile truncation.',
    remediation: 'Shorten your product title if it exceeds 200 characters.',
  },

  // 2. Price
  {
    id: 'rule_price_valid',
    field: 'price',
    destinations: ['amazon', 'meesho', 'flipkart', 'generic_csv', 'generic_xlsx', 'ondc'],
    severity: 'ERROR',
    evaluate: (p) => typeof p.price === 'number' && p.price > 0,
    message: 'Product selling price must be greater than zero.',
    remediation: 'Specify an active selling price in the Product Studio.',
  },
  {
    id: 'rule_mrp_higher',
    field: 'mrp',
    destinations: ['flipkart', 'meesho', 'amazon'],
    severity: 'WARNING',
    evaluate: (p) => !p.mrp || p.mrp >= p.price,
    message: 'Maximum Retail Price (MRP) cannot be lower than the selling price.',
    remediation: 'Adjust MRP to be equal to or higher than the selling price.',
  },

  // 3. SKU
  {
    id: 'rule_sku_exists',
    field: 'sku',
    destinations: ['amazon', 'flipkart', 'meesho', 'ondc'],
    severity: 'ERROR',
    evaluate: (p) => Boolean(p.sku && p.sku.trim().length >= 3),
    message: 'An alphanumeric Seller SKU is required for inventory synchronization.',
    remediation: 'Assign a unique SKU code to this item.',
  },

  // 4. Images
  {
    id: 'rule_primary_image',
    field: 'imageUrls',
    destinations: ['amazon', 'flipkart', 'meesho', 'ondc'],
    severity: 'ERROR',
    evaluate: (p) => Boolean(p.primaryImageUrl && p.primaryImageUrl.startsWith('http')),
    message: 'At least one publicly accessible product image URL (HTTP/HTTPS) is required.',
    remediation: 'Upload and publish photos with public URLs via Image Studio or Product Editor.',
  },
  {
    id: 'rule_multiple_images',
    field: 'imageUrls',
    destinations: ['amazon', 'flipkart'],
    severity: 'INFO',
    evaluate: (p) => p.imageUrls.length >= 2,
    message: 'Marketplaces recommend 2 or more lifestyle and angle shots for higher buyer conversion.',
    remediation: 'Generate additional lifestyle background shots in the Image Studio.',
  },

  // 5. Weight & Dimensions
  {
    id: 'rule_weight_meesho',
    field: 'weight',
    destinations: ['meesho', 'amazon', 'flipkart'],
    severity: 'ERROR',
    evaluate: (p) => typeof p.weightKg === 'number' && p.weightKg > 0,
    message: 'Package weight is required for automated courier and logistics calculations.',
    remediation: 'Enter package shipping weight (e.g. 0.5 kg or 500g).',
  },
  {
    id: 'rule_dimensions_flipkart',
    field: 'dimensions',
    destinations: ['flipkart', 'amazon'],
    severity: 'WARNING',
    evaluate: (p) => Boolean(p.lengthCm && p.widthCm && p.heightCm),
    message: 'Package dimensions (Length x Width x Height cm) are recommended for accurate volumetric shipping.',
    remediation: 'Add dimensions in format "15x10x5 cm".',
  },

  // 6. Tax / HSN Code
  {
    id: 'rule_hsn_meesho',
    field: 'hsnCode',
    destinations: ['meesho'],
    severity: 'WARNING',
    evaluate: (p) => Boolean(p.hsnCode && p.hsnCode.trim().length >= 4),
    message: 'Meesho requires an HSN Code (Harmonized System of Nomenclature) for tax filing.',
    remediation: 'Add your 4-to-8 digit HSN code for this craft category.',
  },

  // 7. Material & Description
  {
    id: 'rule_material_amazon',
    field: 'material',
    destinations: ['amazon', 'meesho'],
    severity: 'WARNING',
    evaluate: (p) => Boolean(p.material && p.material.trim().length > 0),
    message: 'Material specification helps search filtering on Amazon and Meesho.',
    remediation: 'Add primary crafting material (e.g., Terracotta, Brass, Silk, Bamboo).',
  },
  {
    id: 'rule_description_detail',
    field: 'description',
    destinations: ['amazon', 'flipkart', 'ondc'],
    severity: 'WARNING',
    evaluate: (p) => Boolean(p.description && p.description.trim().length >= 30),
    message: 'Detailed product descriptions (>30 characters) improve marketplace search indexing.',
    remediation: 'Enhance your craft story and item description.',
  },

  // 8. Stock
  {
    id: 'rule_stock_active',
    field: 'stock',
    destinations: ['amazon', 'flipkart', 'meesho', 'ondc'],
    severity: 'ERROR',
    evaluate: (p) => typeof p.stock === 'number' && p.stock >= 0,
    message: 'Stock inventory quantity must be a non-negative number.',
    remediation: 'Set available unit stock in the Product Studio.',
  },
];

/**
 * Validates a CanonicalProduct against the specified destination's requirements
 */
export function validateForDestination(
  product: CanonicalProduct,
  destination: MarketplaceDestination
): ValidationResult {
  const meta = MARKETPLACE_DESTINATIONS[destination] || MARKETPLACE_DESTINATIONS.generic_csv;
  const applicableRules = MARKETPLACE_VALIDATION_RULES.filter((rule) =>
    rule.destinations.includes(destination)
  );

  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const infos: ValidationIssue[] = [];
  const checkedFields = new Set<string>();

  for (const rule of applicableRules) {
    checkedFields.add(rule.field);
    const passed = rule.evaluate(product);
    if (!passed) {
      const issue: ValidationIssue = {
        field: rule.field,
        severity: rule.severity,
        message: rule.message,
        remediation: rule.remediation,
        source: meta.name,
      };

      if (rule.severity === 'ERROR') {
        errors.push(issue);
      } else if (rule.severity === 'WARNING') {
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
    schemaVersion: meta.schemaVersion,
  };
}

/**
 * Validates a batch of products for a destination
 */
export function validateBatch(
  products: CanonicalProduct[],
  destination: MarketplaceDestination
): {
  destination: MarketplaceDestination;
  totalProducts: number;
  readyProductsCount: number;
  unreadyProductsCount: number;
  results: { productId: string; productTitle: string; validation: ValidationResult }[];
} {
  const results = products.map((p) => ({
    productId: p.id,
    productTitle: p.title,
    validation: validateForDestination(p, destination),
  }));

  const readyCount = results.filter((r) => r.validation.ready).length;

  return {
    destination,
    totalProducts: products.length,
    readyProductsCount: readyCount,
    unreadyProductsCount: products.length - readyCount,
    results,
  };
}
