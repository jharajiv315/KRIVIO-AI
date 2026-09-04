import { CanonicalProduct } from '../../../types/marketplace';
import { serializeToCsv } from './csv_safety';

export const GENERIC_CSV_HEADERS = [
  'SKU',
  'Product Title',
  'Category',
  'Subcategory',
  'Brand',
  'Material',
  'Color',
  'Selling Price',
  'MRP',
  'Wholesale Price',
  'Currency',
  'Stock Quantity',
  'Minimum Order Qty (MOQ)',
  'Lead Time',
  'Weight',
  'Dimensions',
  'HSN Code',
  'GST Rate (%)',
  'Primary Image URL',
  'Secondary Image URL',
  'Description',
  'Craft Story / Heritage',
  'Keywords',
  'Status',
  'Origin State',
];

export function exportGenericCsv(products: CanonicalProduct[]): string {
  const rows = products.map((p) => [
    p.sku,
    p.title,
    p.category,
    p.subcategory || '',
    p.brand,
    p.material || '',
    p.color || '',
    p.price,
    p.mrp || '',
    p.wholesalePrice || '',
    p.currency,
    p.stock,
    p.moq,
    p.leadTime,
    p.weight,
    p.dimensions,
    p.hsnCode || '',
    p.gstRate !== undefined ? p.gstRate : '',
    p.primaryImageUrl || '',
    p.imageUrls[1] || '',
    p.description,
    p.craftStory || '',
    p.keywords.join(', '),
    p.status,
    p.originState || 'India',
  ]);

  return serializeToCsv(GENERIC_CSV_HEADERS, rows);
}
