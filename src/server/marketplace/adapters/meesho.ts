import { CanonicalProduct } from '../../../types/marketplace';
import { serializeToCsv } from './csv_safety';

export const MEESHO_CSV_HEADERS = [
  'Catalog ID / SKU',
  'Product Title',
  'Description',
  'Meesho Price (Incl. GST)',
  'Wrong/Defective Return Price',
  'MRP',
  'GST %',
  'HSN Code',
  'Weight (Grams)',
  'Inventory',
  'Category',
  'Primary Material',
  'Color',
  'Country of Origin',
  'Image 1 URL',
  'Image 2 URL',
];

export function exportMeeshoCsv(products: CanonicalProduct[]): string {
  const rows = products.map((p) => {
    // Meesho weight is strictly in grams
    const weightGrams = Math.round(p.weightKg * 1000);
    // Defective-only return price is standard discount tier (~8% less than selling price)
    const defectiveReturnPrice = Math.max(1, Math.round(p.price * 0.92));
    const gstRate = p.gstRate !== undefined ? p.gstRate : 12;

    return [
      p.sku,
      p.title,
      p.description,
      p.price,
      defectiveReturnPrice,
      p.mrp || Math.round(p.price * 1.25),
      gstRate,
      p.hsnCode || '6913', // default craft/earthenware HSN if not set
      weightGrams,
      p.stock,
      p.category,
      p.material || 'Natural Handcrafted',
      p.color || 'Multicolor',
      'India',
      p.primaryImageUrl || '',
      p.imageUrls[1] || '',
    ];
  });

  return serializeToCsv(MEESHO_CSV_HEADERS, rows);
}
