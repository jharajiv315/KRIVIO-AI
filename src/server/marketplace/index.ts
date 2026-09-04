import {
  CanonicalProduct,
  ExportReport,
  MarketplaceDestination,
  ValidationResult,
} from '../../types/marketplace';
import { exportAmazonXlsx } from './adapters/amazon';
import { exportFlipkartCsv } from './adapters/flipkart';
import { exportGenericCsv } from './adapters/generic_csv';
import { exportGenericXlsx } from './adapters/generic_xlsx';
import { exportMeeshoCsv } from './adapters/meesho';
import { exportOndcJson } from './adapters/ondc';
import { toCanonicalProduct, RawDbProduct, BusinessProfileContext } from './canonical';
import { MARKETPLACE_DESTINATIONS } from './destinations';
import { validateForDestination } from './validation';

export * from './destinations';
export * from './canonical';
export * from './validation';
export * from './adapters/csv_safety';
export * from './adapters/generic_csv';
export * from './adapters/generic_xlsx';
export * from './adapters/amazon';
export * from './adapters/meesho';
export * from './adapters/flipkart';
export * from './adapters/ondc';

export interface ExportExecutionResult {
  status: 'completed' | 'partial' | 'blocked';
  destination: MarketplaceDestination;
  data: Buffer | string;
  contentType: string;
  filename: string;
  report: ExportReport;
}

function sanitizeFilenamePart(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/__+/g, '_')
    .slice(0, 30);
}

/**
 * Orchestrates listing readiness checks and file generation for any destination
 */
export async function executeMarketplaceExport(
  products: CanonicalProduct[],
  destination: MarketplaceDestination,
  options?: {
    allowPartial?: boolean; // if true, exports only the ready products
    providerInfo?: {
      providerId?: string;
      providerName?: string;
      phone?: string;
      email?: string;
    };
  }
): Promise<ExportExecutionResult> {
  if (!products || products.length === 0) {
    throw new Error('Cannot export: No products provided for export.');
  }

  const meta = MARKETPLACE_DESTINATIONS[destination] || MARKETPLACE_DESTINATIONS.generic_csv;
  const allowPartial = options?.allowPartial ?? false;

  // Run validation on all requested products
  const validations: { product: CanonicalProduct; validation: ValidationResult }[] = products.map((p) => ({
    product: p,
    validation: validateForDestination(p, destination),
  }));

  const readyItems = validations.filter((v) => v.validation.ready);
  const unreadyItems = validations.filter((v) => !v.validation.ready);

  const excludedReasons = unreadyItems.map((u) => ({
    productId: u.product.id,
    productTitle: u.product.title,
    reason: u.validation.errors.map((e) => e.message).join('; ') || 'Listing validation failed',
  }));

  const totalWarnings = validations.reduce((sum, v) => sum + v.validation.warnings.length, 0);
  const totalErrors = validations.reduce((sum, v) => sum + v.validation.errors.length, 0);

  // Determine items to actually export
  let itemsToExport: CanonicalProduct[] = [];
  if (unreadyItems.length === 0) {
    itemsToExport = products;
  } else if (allowPartial && readyItems.length > 0) {
    itemsToExport = readyItems.map((r) => r.product);
  } else {
    // If there are blocking errors and allowPartial is false, throw structured error
    throw new Error(
      `Cannot export: ${unreadyItems.length} product(s) have blocking errors for ${meta.name}. ${unreadyItems[0].validation.errors[0]?.message || 'Please fix missing required fields before export.'}`
    );
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const safeDest = sanitizeFilenamePart(destination);
  let filename = `krivio_${safeDest}_catalog_${dateStr}.${meta.format}`;
  let data: Buffer | string = '';
  let contentType = 'text/plain';

  switch (destination) {
    case 'amazon': {
      data = await exportAmazonXlsx(itemsToExport);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `krivio_amazon_inventory_${dateStr}.xlsx`;
      break;
    }
    case 'meesho': {
      data = exportMeeshoCsv(itemsToExport);
      contentType = 'text/csv; charset=utf-8';
      filename = `krivio_meesho_catalog_${dateStr}.csv`;
      break;
    }
    case 'flipkart': {
      data = exportFlipkartCsv(itemsToExport);
      contentType = 'text/csv; charset=utf-8';
      filename = `krivio_flipkart_feed_${dateStr}.csv`;
      break;
    }
    case 'generic_xlsx': {
      data = await exportGenericXlsx(itemsToExport);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `krivio_product_catalog_${dateStr}.xlsx`;
      break;
    }
    case 'ondc': {
      const ondcPayload = exportOndcJson(itemsToExport, options?.providerInfo);
      data = JSON.stringify(ondcPayload, null, 2);
      contentType = 'application/json; charset=utf-8';
      filename = `krivio_ondc_beckn_catalog_${dateStr}.json`;
      break;
    }
    case 'generic_csv':
    default: {
      data = exportGenericCsv(itemsToExport);
      contentType = 'text/csv; charset=utf-8';
      filename = `krivio_catalog_${dateStr}.csv`;
      break;
    }
  }

  const report: ExportReport = {
    destination,
    destinationName: meta.name,
    format: meta.format,
    schemaVersion: meta.schemaVersion,
    generatedAt: new Date().toISOString(),
    totalRequested: products.length,
    totalExported: itemsToExport.length,
    totalExcluded: unreadyItems.length,
    warningsCount: totalWarnings,
    errorsCount: totalErrors,
    downloadFilename: filename,
    excludedReasons: excludedReasons.length > 0 ? excludedReasons : undefined,
  };

  return {
    status: unreadyItems.length === 0 ? 'completed' : 'partial',
    destination,
    data,
    contentType,
    filename,
    report,
  };
}
