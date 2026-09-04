import { CanonicalProduct } from '../../../types/marketplace';
import { serializeToCsv } from './csv_safety';

export const FLIPKART_CSV_HEADERS = [
  'Seller SKU ID',
  'Listing Status',
  'MRP',
  'Your Selling Price',
  'Procurement SLA (Days)',
  'Stock',
  'Shipping Provider',
  'Package Length (cm)',
  'Package Breadth (cm)',
  'Package Height (cm)',
  'Package Weight (kg)',
  'HSN',
  'Tax Code',
  'Main Image URL',
  'Product Title',
  'Description',
];

export function exportFlipkartCsv(products: CanonicalProduct[]): string {
  const rows = products.map((p) => [
    p.sku,
    'ACTIVE',
    p.mrp || Math.round(p.price * 1.25),
    p.price,
    '3', // SLA in days
    p.stock,
    'FLIPKART',
    p.lengthCm || 15,
    p.widthCm || 10,
    p.heightCm || 5,
    p.weightKg,
    p.hsnCode || '6913',
    `GST_${p.gstRate || 12}`,
    p.primaryImageUrl || '',
    p.title,
    p.description,
  ]);

  return serializeToCsv(FLIPKART_CSV_HEADERS, rows);
}
