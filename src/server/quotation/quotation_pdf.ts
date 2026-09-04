import PDFDocument from 'pdfkit';
import { Quotation } from '../../types/marketplace';

function formatMoney(amount: number, currency: string = 'INR'): string {
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export async function generateQuotationPdf(quotation: Quotation): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Wholesale Quotation - ${quotation.quotationNumber}`,
          Author: quotation.seller.brandName || quotation.seller.businessName || 'KRIVIO Artisan',
          Subject: 'Wholesale B2B Craft Quotation',
          Creator: 'KRIVIO AI Platform',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const emerald = '#0F5132';
      const gold = '#D4AF37';
      const charcoal = '#1C1917';
      const muted = '#57534E';
      const lightBg = '#F5F5F4';
      const borderCol = '#E7E5E4';

      const startX = 40;
      let currentY = 40;
      const contentWidth = 515;

      // 1. Top Decorative Bar
      doc.rect(startX, currentY, contentWidth, 4).fill(emerald);
      currentY += 15;

      // 2. Header Section: Seller Branding & Monogram
      const brandName = quotation.seller.brandName || quotation.seller.businessName || 'Artisan Craft Enterprise';
      const businessName = quotation.seller.businessName || '';
      const monogramText = brandName.slice(0, 2).toUpperCase();

      // Monogram Circle Fallback
      doc.circle(startX + 22, currentY + 22, 22).fillAndStroke(lightBg, gold);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(emerald);
      doc.text(monogramText, startX + 10, currentY + 14, { width: 24, align: 'center' });

      // Seller Details
      doc.font('Helvetica-Bold').fontSize(16).fillColor(emerald);
      doc.text(brandName, startX + 55, currentY + 4, { width: 280 });

      doc.font('Helvetica').fontSize(9).fillColor(muted);
      let sellerDetails = '';
      if (businessName && businessName !== brandName) sellerDetails += `${businessName}\n`;
      if (quotation.seller.ownerName) sellerDetails += `Contact: ${quotation.seller.ownerName} | `;
      if (quotation.seller.phone) sellerDetails += `Phone: ${quotation.seller.phone}\n`;
      if (quotation.seller.email) sellerDetails += `Email: ${quotation.seller.email} | `;
      if (quotation.seller.state) sellerDetails += `Location: ${quotation.seller.district ? quotation.seller.district + ', ' : ''}${quotation.seller.state}\n`;
      if (quotation.seller.gstNumber) sellerDetails += `GSTIN: ${quotation.seller.gstNumber}`;

      doc.text(sellerDetails.trim(), startX + 55, currentY + 24, { width: 280 });

      // Quotation Title & Meta Box (Right-aligned)
      doc.rect(startX + 345, currentY, 170, 78).fillAndStroke('#FAFAF9', borderCol);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(emerald);
      doc.text('WHOLESALE QUOTATION', startX + 355, currentY + 8, { width: 150, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(9).fillColor(charcoal);
      doc.text(`Quote No: ${quotation.quotationNumber}`, startX + 355, currentY + 24, { width: 150, align: 'right' });

      doc.font('Helvetica').fontSize(8.5).fillColor(muted);
      doc.text(`Issue Date: ${quotation.createdAt.slice(0, 10)}`, startX + 355, currentY + 38, { width: 150, align: 'right' });
      doc.text(`Valid Until: ${quotation.validUntil}`, startX + 355, currentY + 50, { width: 150, align: 'right' });
      doc.text(`Currency: ${quotation.currency}`, startX + 355, currentY + 62, { width: 150, align: 'right' });

      currentY += 92;

      // 3. Buyer Information Card
      doc.rect(startX, currentY, contentWidth, 54).fillAndStroke('#F0FDF4', '#86EFAC');
      doc.font('Helvetica-Bold').fontSize(9).fillColor(emerald);
      doc.text('PREPARED FOR (BUYER):', startX + 12, currentY + 8);

      doc.font('Helvetica-Bold').fontSize(11).fillColor(charcoal);
      doc.text(quotation.buyer.name + (quotation.buyer.company ? ` — ${quotation.buyer.company}` : ''), startX + 12, currentY + 20);

      doc.font('Helvetica').fontSize(8.5).fillColor(muted);
      const buyerContact = [
        quotation.buyer.email ? `Email: ${quotation.buyer.email}` : '',
        quotation.buyer.phone ? `Phone: ${quotation.buyer.phone}` : '',
        quotation.buyer.gstNumber ? `GST: ${quotation.buyer.gstNumber}` : '',
        quotation.buyer.address ? `Address: ${quotation.buyer.address}` : '',
      ].filter(Boolean).join(' | ');

      doc.text(buyerContact || 'Direct Wholesale Inquirer', startX + 12, currentY + 35, { width: contentWidth - 24 });

      currentY += 68;

      // 4. Products Table
      const colX = {
        item: startX,
        sku: startX + 195,
        moq: startX + 275,
        qty: startX + 325,
        price: startX + 380,
        total: startX + 445,
      };

      // Table Header
      doc.rect(startX, currentY, contentWidth, 22).fill(emerald);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF');
      doc.text('PRODUCT & DESCRIPTION', colX.item + 8, currentY + 7);
      doc.text('SKU', colX.sku, currentY + 7);
      doc.text('MOQ', colX.moq, currentY + 7, { width: 45, align: 'center' });
      doc.text('QTY', colX.qty, currentY + 7, { width: 45, align: 'center' });
      doc.text('UNIT PRICE', colX.price, currentY + 7, { width: 60, align: 'right' });
      doc.text('TOTAL', colX.total, currentY + 7, { width: 60, align: 'right' });

      currentY += 22;

      // Items Rows
      quotation.items.forEach((item, index) => {
        // Check page overflow
        if (currentY > 660) {
          doc.addPage();
          currentY = 40;
          doc.rect(startX, currentY, contentWidth, 4).fill(emerald);
          currentY += 15;
        }

        const rowHeight = item.description || item.material ? 38 : 26;
        const rowBg = index % 2 === 1 ? '#FAFAF9' : '#FFFFFF';

        doc.rect(startX, currentY, contentWidth, rowHeight).fillAndStroke(rowBg, borderCol);

        // Title and sub-details
        doc.font('Helvetica-Bold').fontSize(9).fillColor(charcoal);
        doc.text(item.title, colX.item + 8, currentY + 6, { width: 180, lineBreak: false, ellipsis: true });

        if (item.material || item.leadTime) {
          doc.font('Helvetica').fontSize(7.5).fillColor(muted);
          const sub = [item.material ? `Mat: ${item.material}` : '', item.leadTime ? `Lead: ${item.leadTime}` : ''].filter(Boolean).join(' | ');
          doc.text(sub, colX.item + 8, currentY + 19, { width: 180 });
        }

        // SKU
        doc.font('Helvetica').fontSize(8).fillColor(muted);
        doc.text(item.sku || '-', colX.sku, currentY + 8, { width: 75 });

        // MOQ
        doc.font('Helvetica').fontSize(8.5).fillColor(charcoal);
        doc.text(String(item.moq || 1), colX.moq, currentY + 8, { width: 45, align: 'center' });

        // QTY
        doc.font('Helvetica-Bold').fontSize(9).fillColor(emerald);
        doc.text(String(item.quantity), colX.qty, currentY + 8, { width: 45, align: 'center' });

        // Unit Price
        doc.font('Helvetica').fontSize(8.5).fillColor(charcoal);
        doc.text(formatMoney(item.unitPrice, quotation.currency), colX.price, currentY + 8, { width: 60, align: 'right' });

        // Line Total
        doc.font('Helvetica-Bold').fontSize(9).fillColor(charcoal);
        doc.text(formatMoney(item.lineTotal, quotation.currency), colX.total, currentY + 8, { width: 60, align: 'right' });

        currentY += rowHeight;
      });

      currentY += 8;

      // 5. Totals Section (Right-aligned card)
      const totalsBoxWidth = 220;
      const totalsBoxX = startX + contentWidth - totalsBoxWidth;

      doc.rect(totalsBoxX, currentY, totalsBoxWidth, quotation.taxTotal > 0 ? 68 : 48).fillAndStroke(lightBg, borderCol);

      doc.font('Helvetica').fontSize(9).fillColor(muted);
      doc.text('Subtotal:', totalsBoxX + 12, currentY + 10);
      doc.font('Helvetica-Bold').fontSize(9).fillColor(charcoal);
      doc.text(formatMoney(quotation.subtotal, quotation.currency), totalsBoxX + 100, currentY + 10, { width: 108, align: 'right' });

      if (quotation.taxTotal > 0) {
        doc.font('Helvetica').fontSize(9).fillColor(muted);
        doc.text('Tax / GST:', totalsBoxX + 12, currentY + 26);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(charcoal);
        doc.text(formatMoney(quotation.taxTotal, quotation.currency), totalsBoxX + 100, currentY + 26, { width: 108, align: 'right' });
      }

      const grandTotalY = quotation.taxTotal > 0 ? currentY + 44 : currentY + 28;
      doc.rect(totalsBoxX, grandTotalY - 4, totalsBoxWidth, 24).fill('#E6F4EA');
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(emerald);
      doc.text('Grand Total:', totalsBoxX + 12, grandTotalY + 3);
      doc.text(formatMoney(quotation.grandTotal, quotation.currency), totalsBoxX + 90, grandTotalY + 3, { width: 118, align: 'right' });

      currentY += (quotation.taxTotal > 0 ? 80 : 60);

      // 6. Craft Heritage Story (If available)
      const stories = quotation.items.map((i) => i.craftStory).filter(Boolean);
      if (stories.length > 0) {
        if (currentY > 640) {
          doc.addPage();
          currentY = 40;
        }
        doc.rect(startX, currentY, contentWidth, 42).fillAndStroke('#FFFBEB', '#FDE68A');
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#B45309');
        doc.text('TRADITIONAL CRAFT & HERITAGE STORY:', startX + 10, currentY + 7);
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#78350F');
        doc.text(stories[0] || 'Handmade with authentic traditional technique.', startX + 10, currentY + 18, {
          width: contentWidth - 20,
          lineBreak: false,
          ellipsis: true,
        });
        currentY += 50;
      }

      // 7. Commercial Notes & Terms
      if (currentY > 650) {
        doc.addPage();
        currentY = 40;
      }

      doc.rect(startX, currentY, contentWidth, 54).fillAndStroke(lightBg, borderCol);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(charcoal);
      doc.text('COMMERCIAL TERMS & ORDER NOTES:', startX + 10, currentY + 8);

      doc.font('Helvetica').fontSize(7.5).fillColor(muted);
      const leadTimes = quotation.items.map((i) => i.leadTime).filter(Boolean);
      const effectiveLead = leadTimes[0] || '7-14 business days upon order confirmation';
      const shippingTerms = quotation.shippingTerms || 'Ex-Works / Standard Surface Courier. Shipping billed at actuals.';
      const paymentTerms = quotation.paymentTerms || '50% advance upon order placement, 50% prior to dispatch.';

      doc.text(`• Production Lead Time: ${effectiveLead}`, startX + 10, currentY + 21);
      doc.text(`• Delivery / Shipping: ${shippingTerms}`, startX + 10, currentY + 31);
      doc.text(`• Payment Terms: ${paymentTerms}`, startX + 10, currentY + 41);

      currentY += 66;

      // 8. Disclaimer
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(muted);
      doc.text(
        'Disclaimer: This wholesale quotation is prepared for commercial negotiation. Prices, delivery schedules, and commercial terms are subject to formal seller confirmation. This document is not a tax invoice.',
        startX,
        currentY,
        { width: contentWidth, align: 'center' }
      );

      // 9. Footer: Page numbering on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.rect(startX, 800, contentWidth, 0.5).fill(borderCol);
        doc.font('Helvetica').fontSize(7.5).fillColor(muted);
        doc.text(
          `${brandName} | Generated via KRIVIO AI Platform ("From Local Hands to Global Markets")`,
          startX,
          808,
          { width: contentWidth - 80 }
        );
        doc.text(`Page ${i + 1} of ${range.count}`, startX + contentWidth - 75, 808, { width: 75, align: 'right' });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
