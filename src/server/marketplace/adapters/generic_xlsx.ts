import ExcelJS from 'exceljs';
import { CanonicalProduct } from '../../../types/marketplace';

const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function sanitizeCellForExcel(val: any): any {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  const str = String(val);
  const trimmed = str.trimStart();
  if (trimmed.length > 0 && FORMULA_PREFIXES.some((p) => trimmed.startsWith(p))) {
    return `'${str}`;
  }
  return str;
}

export async function exportGenericXlsx(products: CanonicalProduct[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'KRIVIO AI — Rural Entrepreneur Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Product Catalog', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const columns = [
    { header: 'SKU', key: 'sku', width: 16 },
    { header: 'Product Title', key: 'title', width: 32 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Brand / Artisan', key: 'brand', width: 24 },
    { header: 'Material', key: 'material', width: 18 },
    { header: 'Color', key: 'color', width: 14 },
    { header: 'Selling Price (INR)', key: 'price', width: 20 },
    { header: 'MRP (INR)', key: 'mrp', width: 16 },
    { header: 'Wholesale Price (INR)', key: 'wholesalePrice', width: 22 },
    { header: 'Stock Units', key: 'stock', width: 14 },
    { header: 'MOQ', key: 'moq', width: 12 },
    { header: 'Lead Time', key: 'leadTime', width: 20 },
    { header: 'Weight', key: 'weight', width: 14 },
    { header: 'Dimensions', key: 'dimensions', width: 18 },
    { header: 'HSN Code', key: 'hsnCode', width: 16 },
    { header: 'GST Rate (%)', key: 'gstRate', width: 14 },
    { header: 'Primary Image URL', key: 'primaryImageUrl', width: 35 },
    { header: 'Description', key: 'description', width: 45 },
    { header: 'Craft Heritage Story', key: 'craftStory', width: 40 },
    { header: 'Origin State', key: 'originState', width: 18 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  worksheet.columns = columns;

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F5132' }, // KRIVIO Emerald
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: false,
    };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFD4AF37' } }, // KRIVIO Gold accent
    };
  });

  // Populate Data Rows
  products.forEach((p, idx) => {
    const row = worksheet.addRow({
      sku: sanitizeCellForExcel(p.sku),
      title: sanitizeCellForExcel(p.title),
      category: sanitizeCellForExcel(p.category),
      brand: sanitizeCellForExcel(p.brand),
      material: sanitizeCellForExcel(p.material || ''),
      color: sanitizeCellForExcel(p.color || ''),
      price: typeof p.price === 'number' ? p.price : 0,
      mrp: typeof p.mrp === 'number' ? p.mrp : '',
      wholesalePrice: typeof p.wholesalePrice === 'number' ? p.wholesalePrice : '',
      stock: typeof p.stock === 'number' ? p.stock : 0,
      moq: p.moq,
      leadTime: sanitizeCellForExcel(p.leadTime),
      weight: sanitizeCellForExcel(p.weight),
      dimensions: sanitizeCellForExcel(p.dimensions),
      hsnCode: sanitizeCellForExcel(p.hsnCode || ''),
      gstRate: typeof p.gstRate === 'number' ? p.gstRate : '',
      primaryImageUrl: sanitizeCellForExcel(p.primaryImageUrl || ''),
      description: sanitizeCellForExcel(p.description),
      craftStory: sanitizeCellForExcel(p.craftStory || ''),
      originState: sanitizeCellForExcel(p.originState || 'India'),
      status: sanitizeCellForExcel(p.status),
    });

    row.height = 22;

    // Alternating zebra row shading
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FBF9' },
        };
      });
    }

    // Number formats
    const priceCell = row.getCell('price');
    priceCell.numFmt = '₹#,##0.00';
    priceCell.alignment = { horizontal: 'right', vertical: 'middle' };

    const mrpCell = row.getCell('mrp');
    if (typeof p.mrp === 'number') {
      mrpCell.numFmt = '₹#,##0.00';
      mrpCell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    const wholesaleCell = row.getCell('wholesalePrice');
    if (typeof p.wholesalePrice === 'number') {
      wholesaleCell.numFmt = '₹#,##0.00';
      wholesaleCell.alignment = { horizontal: 'right', vertical: 'middle' };
    }

    const stockCell = row.getCell('stock');
    stockCell.numFmt = '#,##0';
    stockCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const moqCell = row.getCell('moq');
    moqCell.numFmt = '#,##0';
    moqCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
