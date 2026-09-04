import ExcelJS from 'exceljs';
import { CanonicalProduct } from '../../../types/marketplace';

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeCell(val: any): any {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  const str = String(val);
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES.some((p) => trimmed.startsWith(p))) {
    return `'${str}`;
  }
  return str;
}

function mapAmazonProductType(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('textile') || cat.includes('handloom') || cat.includes('cloth') || cat.includes('apparel')) {
    return 'apparel';
  }
  if (cat.includes('pottery') || cat.includes('ceramic')) {
    return 'kitchen';
  }
  if (cat.includes('jewelry') || cat.includes('necklace') || cat.includes('ornament')) {
    return 'fashionjewelry';
  }
  if (cat.includes('art') || cat.includes('painting')) {
    return 'fineart';
  }
  return 'home-decor';
}

export async function exportAmazonXlsx(products: CanonicalProduct[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KRIVIO AI Amazon Adapter (Schema v2026.1)';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Template', {
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  // Amazon Flat File Headers
  // Row 1: Technical Field Keys
  // Row 2: Human-readable Field Labels
  worksheet.columns = [
    { key: 'feed_product_type', width: 20 },
    { key: 'item_sku', width: 18 },
    { key: 'brand_name', width: 22 },
    { key: 'item_name', width: 35 },
    { key: 'standard_price', width: 16 },
    { key: 'list_price', width: 16 },
    { key: 'currency', width: 12 },
    { key: 'quantity', width: 14 },
    { key: 'main_image_url', width: 35 },
    { key: 'other_image_url1', width: 35 },
    { key: 'bullet_point1', width: 30 },
    { key: 'bullet_point2', width: 30 },
    { key: 'product_description', width: 45 },
    { key: 'item_type_keyword', width: 22 },
    { key: 'material_type', width: 18 },
    { key: 'item_weight', width: 14 },
    { key: 'item_weight_unit_of_measure', width: 16 },
    { key: 'item_length', width: 14 },
    { key: 'item_width', width: 14 },
    { key: 'item_height', width: 14 },
    { key: 'item_dimensions_unit_of_measure', width: 16 },
    { key: 'country_of_origin', width: 18 },
  ];

  // Row 1: Amazon Technical Headers
  worksheet.addRow({
    feed_product_type: 'feed_product_type',
    item_sku: 'item_sku',
    brand_name: 'brand_name',
    item_name: 'item_name',
    standard_price: 'standard_price',
    list_price: 'list_price',
    currency: 'currency',
    quantity: 'quantity',
    main_image_url: 'main_image_url',
    other_image_url1: 'other_image_url1',
    bullet_point1: 'bullet_point1',
    bullet_point2: 'bullet_point2',
    product_description: 'product_description',
    item_type_keyword: 'item_type_keyword',
    material_type: 'material_type',
    item_weight: 'item_weight',
    item_weight_unit_of_measure: 'item_weight_unit_of_measure',
    item_length: 'item_length',
    item_width: 'item_width',
    item_height: 'item_height',
    item_dimensions_unit_of_measure: 'item_dimensions_unit_of_measure',
    country_of_origin: 'country_of_origin',
  });

  // Row 2: Human-readable Sub-headers
  worksheet.addRow({
    feed_product_type: 'Product Type',
    item_sku: 'Seller SKU',
    brand_name: 'Brand Name',
    item_name: 'Product Title',
    standard_price: 'Selling Price',
    list_price: 'Maximum Retail Price (MRP)',
    currency: 'Currency Code',
    quantity: 'Quantity In Stock',
    main_image_url: 'Main Image URL',
    other_image_url1: 'Other Image URL 1',
    bullet_point1: 'Key Feature / Bullet 1',
    bullet_point2: 'Craft Story / Bullet 2',
    product_description: 'Product Description',
    item_type_keyword: 'Item Type Keyword',
    material_type: 'Material',
    item_weight: 'Package Weight',
    item_weight_unit_of_measure: 'Weight Unit',
    item_length: 'Package Length',
    item_width: 'Package Width',
    item_height: 'Package Height',
    item_dimensions_unit_of_measure: 'Dimensions Unit',
    country_of_origin: 'Country of Origin',
  });

  // Style Header Row 1 (Amazon Navy)
  const row1 = worksheet.getRow(1);
  row1.height = 24;
  row1.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF232F3E' }, // Amazon Navy
    };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Style Header Row 2 (Amazon Orange Accent)
  const row2 = worksheet.getRow(2);
  row2.height = 22;
  row2.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2E6' },
    };
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFD46B08' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Add Product Rows
  products.forEach((p) => {
    const row = worksheet.addRow({
      feed_product_type: mapAmazonProductType(p.category),
      item_sku: sanitizeCell(p.sku),
      brand_name: sanitizeCell(p.brand),
      item_name: sanitizeCell(p.title),
      standard_price: p.price,
      list_price: p.mrp || p.price,
      currency: p.currency || 'INR',
      quantity: p.stock,
      main_image_url: sanitizeCell(p.primaryImageUrl || ''),
      other_image_url1: sanitizeCell(p.imageUrls[1] || ''),
      bullet_point1: sanitizeCell(p.bulletPoints?.[0] || p.material || 'Authentic handmade craft'),
      bullet_point2: sanitizeCell(p.craftStory || p.description.slice(0, 150)),
      product_description: sanitizeCell(p.description),
      item_type_keyword: sanitizeCell(p.category.toLowerCase()),
      material_type: sanitizeCell(p.material || 'Handcrafted Natural Material'),
      item_weight: p.weightKg,
      item_weight_unit_of_measure: 'KG',
      item_length: p.lengthCm || 15,
      item_width: p.widthCm || 10,
      item_height: p.heightCm || 5,
      item_dimensions_unit_of_measure: 'CM',
      country_of_origin: 'IN',
    });

    row.height = 20;

    const priceCell = row.getCell('standard_price');
    priceCell.numFmt = '#,##0.00';
    const listPriceCell = row.getCell('list_price');
    listPriceCell.numFmt = '#,##0.00';
    const qtyCell = row.getCell('quantity');
    qtyCell.numFmt = '#,##0';
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
