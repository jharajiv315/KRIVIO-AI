import { Pool } from 'pg';
import {
  Quotation,
  QuotationBuyerInput,
  QuotationItemInput,
  QuotationSellerSnapshot,
} from '../../types/marketplace';
import {
  calculateQuotationTotals,
  generateQuotationNumber,
  validateBuyerInput,
} from './quotation_calculator';
import { generateQuotationPdf } from './quotation_pdf';

export interface CreateQuotationDto {
  buyer: QuotationBuyerInput;
  items: QuotationItemInput[];
  validDays?: number;
  commercialNotes?: string;
  shippingTerms?: string;
  paymentTerms?: string;
  currency?: string;
  taxRatePercent?: number;
}

export class QuotationService {
  constructor(private pool: Pool) {}

  /**
   * Creates a new quotation record with immutable snapshots of seller profile and products
   */
  async createQuotation(userId: string, dto: CreateQuotationDto): Promise<Quotation> {
    const buyerValidation = validateBuyerInput(dto.buyer);
    if (!buyerValidation.valid) {
      throw new Error(buyerValidation.error || 'Invalid buyer details');
    }

    // 1. Fetch user's business profile to snapshot seller details
    const profileRes = await this.pool.query(
      `SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const userRes = await this.pool.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [userId]);
    const profile = profileRes.rows[0] || {};
    const user = userRes.rows[0] || {};

    const sellerSnapshot: QuotationSellerSnapshot = {
      businessName: profile.business_name || user.full_name || 'Artisan Craft Enterprise',
      brandName: profile.brand_name || profile.business_name || user.full_name || 'Artisan Enterprise',
      ownerName: user.full_name || 'Artisan Proprietor',
      phone: profile.phone_number || user.phone_number || '',
      email: user.email || '',
      state: profile.state || 'India',
      district: profile.district || '',
      village: profile.village || '',
      pinCode: profile.pin_code || '',
      gstNumber: profile.gst_number || '',
      businessRegistration: profile.business_registration || '',
      website: profile.website || '',
      logoUrl: user.profile_image || '',
    };

    // 2. Validate items & calculate totals
    const totals = calculateQuotationTotals(dto.items, dto.taxRatePercent || 0);

    const quotationId = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const quotationNumber = generateQuotationNumber();

    // Validity date
    const validDays = dto.validDays && dto.validDays > 0 ? dto.validDays : 30;
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + validDays);
    const validUntilStr = validDate.toISOString().slice(0, 10);

    const currency = (dto.currency || 'INR').toUpperCase();

    // 3. Insert into database
    const insertQuery = `
      INSERT INTO quotations (
        id, user_id, quotation_number, buyer_name, buyer_company, buyer_email, buyer_phone,
        buyer_address, buyer_gst, currency, subtotal, tax_total, grand_total, valid_until,
        commercial_notes, shipping_terms, payment_terms, status, items_snapshot, seller_snapshot,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
      ) RETURNING *
    `;

    const res = await this.pool.query(insertQuery, [
      quotationId,
      userId,
      quotationNumber,
      dto.buyer.name.trim(),
      dto.buyer.company?.trim() || null,
      dto.buyer.email?.trim() || null,
      dto.buyer.phone?.trim() || null,
      dto.buyer.address?.trim() || null,
      dto.buyer.gstNumber?.trim() || null,
      currency,
      totals.subtotal,
      totals.taxTotal,
      totals.grandTotal,
      validUntilStr,
      dto.commercialNotes?.trim() || null,
      dto.shippingTerms?.trim() || null,
      dto.paymentTerms?.trim() || null,
      'generated',
      JSON.stringify(totals.snapshots),
      JSON.stringify(sellerSnapshot),
    ]);

    return this.mapRowToQuotation(res.rows[0]);
  }

  /**
   * Retrieves all quotations owned by the authenticated user
   */
  async getQuotations(userId: string): Promise<Quotation[]> {
    const res = await this.pool.query(
      `SELECT * FROM quotations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map(this.mapRowToQuotation);
  }

  /**
   * Retrieves a single quotation with strict ownership enforcement
   */
  async getQuotationById(userId: string, quotationId: string): Promise<Quotation | null> {
    const res = await this.pool.query(
      `SELECT * FROM quotations WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [quotationId, userId]
    );
    if (!res.rows[0]) return null;
    return this.mapRowToQuotation(res.rows[0]);
  }

  /**
   * Deletes a quotation with ownership check
   */
  async deleteQuotation(userId: string, quotationId: string): Promise<boolean> {
    const res = await this.pool.query(
      `DELETE FROM quotations WHERE id = $1 AND user_id = $2`,
      [quotationId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Generates a downloadable PDF buffer for a quotation
   */
  async renderPdf(userId: string, quotationId: string): Promise<{ buffer: Buffer; filename: string }> {
    const quotation = await this.getQuotationById(userId, quotationId);
    if (!quotation) {
      throw new Error('Quotation not found or you do not have permission to access it.');
    }

    const buffer = await generateQuotationPdf(quotation);
    const filename = `krivio_quotation_${quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    return { buffer, filename };
  }

  private mapRowToQuotation(row: any): Quotation {
    const items = Array.isArray(row.items_snapshot)
      ? row.items_snapshot
      : typeof row.items_snapshot === 'string'
      ? JSON.parse(row.items_snapshot)
      : [];

    const seller = typeof row.seller_snapshot === 'string'
      ? JSON.parse(row.seller_snapshot)
      : row.seller_snapshot || {};

    return {
      id: row.id,
      userId: row.user_id,
      quotationNumber: row.quotation_number,
      buyer: {
        name: row.buyer_name,
        company: row.buyer_company || undefined,
        email: row.buyer_email || undefined,
        phone: row.buyer_phone || undefined,
        address: row.buyer_address || undefined,
        gstNumber: row.buyer_gst || undefined,
      },
      seller,
      currency: row.currency || 'INR',
      subtotal: parseFloat(row.subtotal) || 0,
      taxTotal: parseFloat(row.tax_total) || 0,
      grandTotal: parseFloat(row.grand_total) || 0,
      validUntil: row.valid_until ? (row.valid_until instanceof Date ? row.valid_until.toISOString().slice(0, 10) : String(row.valid_until).slice(0, 10)) : '',
      commercialNotes: row.commercial_notes || undefined,
      shippingTerms: row.shipping_terms || undefined,
      paymentTerms: row.payment_terms || undefined,
      status: row.status || 'draft',
      items,
      createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)) : new Date().toISOString(),
      updatedAt: row.updated_at ? (row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at)) : new Date().toISOString(),
    };
  }
}
