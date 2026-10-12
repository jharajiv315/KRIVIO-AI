/**
 * KRIVIO AI — Server-Side Entitlement, Metering & Quota Enforcement Engine
 * 
 * Production standard:
 * - Centralized authorization, quota verification, transactional reservation, and usage accounting.
 * - Concurrency-safe: Atomically reserves quota BEFORE calling external AI providers.
 * - Commits quota only on verified output delivery.
 * - Releases reservation on provider failure or canvas fallback (zero charge for fallback compositions).
 * - Early manual renewal preserves remaining access days (GREATEST(end_date, NOW()) + 30 days).
 * - Enforces product limit, quotation limits, and AI text/image quotas server-side.
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import { PLAN_CATALOGUE, PlanCode, Plan, getPlan } from '../../config/plans';

export interface QuotaErrorDetails {
  error: string;
  limitCode: 'PRODUCT_LIMIT_REACHED' | 'QUOTA_EXHAUSTED' | 'FEATURE_NOT_PERMITTED' | 'PAYMENT_REQUIRED';
  resourceType: 'product' | 'ai_text' | 'ai_image' | 'quotation';
  currentPlan: PlanCode;
  limit?: number;
  currentCount?: number;
  allowance?: number;
  used?: number;
  resetDate?: string;
  upgradeAvailable: boolean;
}

export class QuotaExceededError extends Error {
  details: QuotaErrorDetails;
  constructor(details: QuotaErrorDetails) {
    super(details.error);
    this.name = 'QuotaExceededError';
    this.details = details;
  }
}

export interface EffectiveSubscription {
  id: string;
  userId: string;
  plan: PlanCode;
  status: 'active' | 'expired' | 'pending_payment';
  startDate: string;
  endDate: string | null;
  renewalMode: 'manual' | 'recurring';
  razorpayPaymentId?: string;
  isPro: boolean;
  isExpired: boolean;
}

export interface UsageSnapshot {
  plan: Plan;
  subscription: EffectiveSubscription;
  periodStart: string;
  periodEnd: string;
  products: {
    current: number;
    max: number;
    remaining: number;
    canCreate: boolean;
  };
  aiText: {
    committed: number;
    reserved: number;
    allowance: number;
    remaining: number;
    canUse: boolean;
  };
  aiImage: {
    committed: number;
    reserved: number;
    allowance: number;
    extraCredits: number;
    remaining: number;
    canUse: boolean;
  };
  quotations: {
    currentCount: number;
    trialLimit: number;
    unlimited: boolean;
    canCreate: boolean;
  };
}

export class EntitlementService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Resolves the authoritative subscription for a user.
   * If an active Pro subscription has passed its end_date, it is treated as expired.
   */
  async getEffectiveSubscription(userId: string): Promise<EffectiveSubscription> {
    try {
      const res = await this.pool.query(
        `SELECT id, user_id, plan, status, start_date, end_date, renewal_mode, razorpay_payment_id
         FROM subscriptions
         WHERE user_id = $1
         LIMIT 1`,
        [userId]
      );

      const now = new Date();

      if (res.rows.length === 0) {
        return {
          id: `sub_free_${userId}`,
          userId,
          plan: 'free',
          status: 'active',
          startDate: now.toISOString(),
          endDate: null,
          renewalMode: 'manual',
          isPro: false,
          isExpired: false,
        };
      }

      const row = res.rows[0];
      const rawPlan = (row.plan || 'free').toLowerCase();
      const planCode: PlanCode = rawPlan === 'pro' || rawPlan === 'artisan_pro' ? 'artisan_pro' : 'free';
      const endDate = row.end_date ? new Date(row.end_date) : null;
      const isExpired = endDate ? endDate.getTime() <= now.getTime() : false;

      // When Pro pass expires, server-enforced access drops back to Free entitlements
      const effectivePlan: PlanCode = (planCode === 'artisan_pro' && !isExpired && row.status === 'active')
        ? 'artisan_pro'
        : 'free';

      return {
        id: row.id,
        userId: row.user_id,
        plan: effectivePlan,
        status: isExpired ? 'expired' : (row.status || 'active'),
        startDate: row.start_date ? new Date(row.start_date).toISOString() : now.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        renewalMode: row.renewal_mode || 'manual',
        razorpayPaymentId: row.razorpay_payment_id || undefined,
        isPro: effectivePlan === 'artisan_pro',
        isExpired,
      };
    } catch (err: any) {
      console.warn('[EntitlementService] Subscription lookup error, falling back to free:', err.message);
      const now = new Date();
      return {
        id: `sub_fallback_${userId}`,
        userId,
        plan: 'free',
        status: 'active',
        startDate: now.toISOString(),
        endDate: null,
        renewalMode: 'manual',
        isPro: false,
        isExpired: false,
      };
    }
  }

  /**
   * Retrieves or lazily initializes the active 30-day usage quota period for the user.
   */
  async getOrCreateCurrentUsagePeriod(userId: string, planCode: PlanCode): Promise<any> {
    const plan = getPlan(planCode);
    const now = new Date();

    // Find current active usage period covering 'now'
    const existing = await this.pool.query(
      `SELECT * FROM usage_periods
       WHERE user_id = $1 AND period_start <= NOW() AND period_end > NOW()
       ORDER BY period_end DESC
       LIMIT 1`,
      [userId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Otherwise create a new 30-day usage quota cycle
    const periodId = `period_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const periodStart = now;
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const insertRes = await this.pool.query(
      `INSERT INTO usage_periods (
        id, user_id, billing_owner_id, plan_code, period_start, period_end,
        ai_text_allowance, ai_text_committed, ai_text_reserved,
        ai_image_allowance, ai_image_committed, ai_image_reserved
      ) VALUES ($1, $2, $2, $3, $4, $5, $6, 0, 0, $7, 0, 0)
      RETURNING *`,
      [
        periodId,
        userId,
        planCode,
        periodStart.toISOString(),
        periodEnd.toISOString(),
        plan.limits.aiTextOperations,
        plan.limits.aiImageOperations,
      ]
    );

    return insertRes.rows[0];
  }

  /**
   * Gets an authoritative, real-time snapshot of the user's entitlements and quota consumption.
   */
  async getUsageSnapshot(userId: string): Promise<UsageSnapshot> {
    const sub = await this.getEffectiveSubscription(userId);
    const plan = getPlan(sub.plan);
    const period = await this.getOrCreateCurrentUsagePeriod(userId, sub.plan);

    // Current product count
    const prodRes = await this.pool.query(
      `SELECT COUNT(*)::int as count FROM products WHERE user_id = $1`,
      [userId]
    );
    const prodCount = prodRes.rows[0]?.count || 0;

    // Current quotation count
    const quoteRes = await this.pool.query(
      `SELECT COUNT(*)::int as count FROM quotations WHERE user_id = $1`,
      [userId]
    );
    const quoteCount = quoteRes.rows[0]?.count || 0;

    // Optional purchased extra image credits
    const creditRes = await this.pool.query(
      `SELECT COALESCE(SUM(quantity_granted - quantity_consumed - quantity_reserved), 0)::int as available
       FROM credit_packs
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    ).catch(() => ({ rows: [{ available: 0 }] }));
    const extraImageCredits = creditRes.rows[0]?.available || 0;

    const aiTextRemaining = Math.max(
      0,
      period.ai_text_allowance - (period.ai_text_committed + period.ai_text_reserved)
    );
    const aiImageRemaining = Math.max(
      0,
      period.ai_image_allowance - (period.ai_image_committed + period.ai_image_reserved)
    ) + extraImageCredits;

    const canCreateProduct = prodCount < plan.limits.maxProducts;
    const canUseAiText = aiTextRemaining > 0;
    const canUseAiImage = aiImageRemaining > 0;
    const canCreateQuotation = plan.limits.quotationsTrialLimit === -1 || quoteCount < plan.limits.quotationsTrialLimit;

    return {
      plan,
      subscription: sub,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      products: {
        current: prodCount,
        max: plan.limits.maxProducts,
        remaining: Math.max(0, plan.limits.maxProducts - prodCount),
        canCreate: canCreateProduct,
      },
      aiText: {
        committed: period.ai_text_committed,
        reserved: period.ai_text_reserved,
        allowance: period.ai_text_allowance,
        remaining: aiTextRemaining,
        canUse: canUseAiText,
      },
      aiImage: {
        committed: period.ai_image_committed,
        reserved: period.ai_image_reserved,
        allowance: period.ai_image_allowance,
        extraCredits: extraImageCredits,
        remaining: aiImageRemaining,
        canUse: canUseAiImage,
      },
      quotations: {
        currentCount: quoteCount,
        trialLimit: plan.limits.quotationsTrialLimit,
        unlimited: plan.limits.quotationsTrialLimit === -1,
        canCreate: canCreateQuotation,
      },
    };
  }

  /**
   * Enforces product creation quota server-side.
   * Throws QuotaExceededError if the user is at or above their plan limit.
   */
  async assertCanCreateProduct(userId: string): Promise<void> {
    const sub = await this.getEffectiveSubscription(userId);
    const plan = getPlan(sub.plan);

    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int as count FROM products WHERE user_id = $1`,
      [userId]
    );
    const count = countRes.rows[0]?.count || 0;

    if (count >= plan.limits.maxProducts) {
      throw new QuotaExceededError({
        error: `Product limit reached for ${plan.name}. You have stored ${count} of ${plan.limits.maxProducts} allowed products.`,
        limitCode: 'PRODUCT_LIMIT_REACHED',
        resourceType: 'product',
        currentPlan: sub.plan,
        limit: plan.limits.maxProducts,
        currentCount: count,
        upgradeAvailable: sub.plan === 'free',
      });
    }
  }

  /**
   * Enforces quotation trial quota server-side.
   */
  async assertCanCreateQuotation(userId: string): Promise<void> {
    const sub = await this.getEffectiveSubscription(userId);
    const plan = getPlan(sub.plan);

    if (plan.limits.quotationsTrialLimit === -1) {
      return; // Unlimited on Pro
    }

    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int as count FROM quotations WHERE user_id = $1`,
      [userId]
    );
    const count = countRes.rows[0]?.count || 0;

    if (count >= plan.limits.quotationsTrialLimit) {
      throw new QuotaExceededError({
        error: `Quotation trial limit reached (${plan.limits.quotationsTrialLimit} quotes). Upgrade to Artisan Pro for unlimited professional quotations.`,
        limitCode: 'QUOTA_EXHAUSTED',
        resourceType: 'quotation',
        currentPlan: sub.plan,
        limit: plan.limits.quotationsTrialLimit,
        currentCount: count,
        upgradeAvailable: true,
      });
    }
  }

  /**
   * Transactional Reservation Step:
   * Atomically checks quota and increments reserved count before invoking external AI provider.
   * Prevents race conditions and double-spending.
   */
  async reserveUsage(
    userId: string,
    resourceType: 'ai_text' | 'ai_image',
    operationType: string,
    idempotencyKey?: string
  ): Promise<{ reservationId: string; periodId: string; isCreditPack?: boolean; creditPackId?: string }> {
    const sub = await this.getEffectiveSubscription(userId);
    const plan = getPlan(sub.plan);
    const period = await this.getOrCreateCurrentUsagePeriod(userId, sub.plan);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const colCommitted = resourceType === 'ai_text' ? 'ai_text_committed' : 'ai_image_committed';
      const colReserved = resourceType === 'ai_text' ? 'ai_text_reserved' : 'ai_image_reserved';
      const colAllowance = resourceType === 'ai_text' ? 'ai_text_allowance' : 'ai_image_allowance';

      // Atomic lock and check on usage_periods row
      const updateRes = await client.query(
        `UPDATE usage_periods
         SET ${colReserved} = ${colReserved} + 1, updated_at = NOW()
         WHERE id = $1 AND (${colCommitted} + ${colReserved} + 1) <= ${colAllowance}
         RETURNING id, ${colCommitted} as committed, ${colAllowance} as allowance, period_end`,
        [period.id]
      );

      let reservationId = idempotencyKey || `res_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      let isCreditPack = false;
      let creditPackId: string | undefined = undefined;

      if (updateRes.rows.length === 0) {
        // If monthly allowance in period is exhausted and resource is ai_image, check credit packs
        if (resourceType === 'ai_image') {
          const packRes = await client.query(
            `SELECT id, quantity_granted, quantity_consumed, quantity_reserved
             FROM credit_packs
             WHERE user_id = $1 AND status = 'active' AND (quantity_granted - quantity_consumed - quantity_reserved) > 0
             ORDER BY created_at ASC
             LIMIT 1
             FOR UPDATE`,
            [userId]
          );

          if (packRes.rows.length > 0) {
            isCreditPack = true;
            creditPackId = packRes.rows[0].id;

            // Atomically lock and reserve from credit pack balance
            await client.query(
              `UPDATE credit_packs
               SET quantity_reserved = quantity_reserved + 1
               WHERE id = $1`,
              [creditPackId]
            );

            // Record reservation in ledger linked to credit_pack_id
            await client.query(
              `INSERT INTO usage_ledger (
                id, user_id, billing_owner_id, usage_period_id, credit_pack_id, resource_type,
                operation_type, request_id, units_reserved, units_committed, units_released,
                status, created_at, updated_at
              ) VALUES ($1, $2, $2, $3, $4, $5, $6, $1, 1, 0, 0, 'reserved', NOW(), NOW())`,
              [reservationId, userId, period.id, creditPackId, resourceType, operationType]
            );
            await client.query('COMMIT');
            return { reservationId, periodId: period.id, isCreditPack, creditPackId };
          }
        }

        // Quota is completely exhausted
        await client.query('ROLLBACK');

        const periodRow = await this.pool.query(`SELECT * FROM usage_periods WHERE id = $1`, [period.id]);
        const pData = periodRow.rows[0] || period;

        throw new QuotaExceededError({
          error: resourceType === 'ai_text'
            ? `You have reached your 30-day AI text assistance limit (${plan.limits.aiTextOperations} requests). Your allowance resets on ${new Date(pData.period_end).toLocaleDateString()}.`
            : `You have used your ${sub.plan === 'free' ? 'free' : 'included'} AI image generation allowance. Upgrade to Artisan Pro for 5 monthly AI studio images or use Free Studio Canvas composition.`,
          limitCode: 'QUOTA_EXHAUSTED',
          resourceType,
          currentPlan: sub.plan,
          allowance: resourceType === 'ai_text' ? plan.limits.aiTextOperations : plan.limits.aiImageOperations,
          used: resourceType === 'ai_text' ? pData.ai_text_committed : pData.ai_image_committed,
          resetDate: pData.period_end,
          upgradeAvailable: sub.plan === 'free',
        });
      }

      // Record reservation in ledger
      await client.query(
        `INSERT INTO usage_ledger (
          id, user_id, billing_owner_id, usage_period_id, resource_type,
          operation_type, request_id, units_reserved, units_committed, units_released,
          status, created_at, updated_at
        ) VALUES ($1, $2, $2, $3, $4, $5, $1, 1, 0, 0, 'reserved', NOW(), NOW())`,
        [reservationId, userId, period.id, resourceType, operationType]
      );

      await client.query('COMMIT');
      return { reservationId, periodId: period.id };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Finalize Step: Commit reserved quota exactly once upon verified output delivery.
   */
  async commitUsage(
    reservationId: string,
    modelUsed?: string,
    estimatedCostUsd: number = 0
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const ledgerRes = await client.query(
        `SELECT * FROM usage_ledger WHERE id = $1 FOR UPDATE`,
        [reservationId]
      );

      if (ledgerRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return;
      }

      const ledger = ledgerRes.rows[0];
      if (ledger.status === 'committed') {
        // Idempotent: already committed
        await client.query('ROLLBACK');
        return;
      }

      const resourceType = ledger.resource_type;
      const periodId = ledger.usage_period_id;
      const creditPackId = ledger.credit_pack_id;

      if (creditPackId) {
        // Commit against credit pack balance, leaving included monthly period untouched
        await client.query(
          `UPDATE credit_packs
           SET quantity_reserved = GREATEST(0, quantity_reserved - 1),
               quantity_consumed = quantity_consumed + 1
           WHERE id = $1`,
          [creditPackId]
        );
      } else {
        // Commit against included monthly usage period
        if (resourceType === 'ai_text') {
          await client.query(
            `UPDATE usage_periods
             SET ai_text_reserved = GREATEST(0, ai_text_reserved - 1),
                 ai_text_committed = ai_text_committed + 1,
                 updated_at = NOW()
             WHERE id = $1`,
            [periodId]
          );
        } else if (resourceType === 'ai_image') {
          await client.query(
            `UPDATE usage_periods
             SET ai_image_reserved = GREATEST(0, ai_image_reserved - 1),
                 ai_image_committed = ai_image_committed + 1,
                 updated_at = NOW()
             WHERE id = $1`,
            [periodId]
          );
        }
      }

      await client.query(
        `UPDATE usage_ledger
         SET status = 'committed',
             units_committed = 1,
             model_used = $2,
             estimated_cost_usd = $3,
             updated_at = NOW()
         WHERE id = $1`,
        [reservationId, modelUsed || 'gemini', estimatedCostUsd]
      );

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('[EntitlementService] Commit usage error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Finalize Step: Release reserved quota on definitive failure or non-AI fallback.
   * Guarantees that users are never charged for studio canvas compositions or failed API calls.
   */
  async releaseUsage(reservationId: string, reason: string = 'operation_failed_or_fallback'): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const ledgerRes = await client.query(
        `SELECT * FROM usage_ledger WHERE id = $1 FOR UPDATE`,
        [reservationId]
      );

      if (ledgerRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return;
      }

      const ledger = ledgerRes.rows[0];
      if (ledger.status === 'released' || ledger.status === 'committed') {
        await client.query('ROLLBACK');
        return;
      }

      const resourceType = ledger.resource_type;
      const periodId = ledger.usage_period_id;
      const creditPackId = ledger.credit_pack_id;

      if (creditPackId) {
        // Release from credit pack balance
        await client.query(
          `UPDATE credit_packs
           SET quantity_reserved = GREATEST(0, quantity_reserved - 1)
           WHERE id = $1`,
          [creditPackId]
        );
      } else {
        // Release from included monthly usage period
        if (resourceType === 'ai_text') {
          await client.query(
            `UPDATE usage_periods
             SET ai_text_reserved = GREATEST(0, ai_text_reserved - 1),
                 updated_at = NOW()
             WHERE id = $1`,
            [periodId]
          );
        } else if (resourceType === 'ai_image') {
          await client.query(
            `UPDATE usage_periods
             SET ai_image_reserved = GREATEST(0, ai_image_reserved - 1),
                 updated_at = NOW()
             WHERE id = $1`,
            [periodId]
          );
        }
      }

      await client.query(
        `UPDATE usage_ledger
         SET status = 'released',
             units_released = 1,
             model_used = $2,
             updated_at = NOW()
         WHERE id = $1`,
        [reservationId, `released:${reason}`]
      );

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.warn('[EntitlementService] Release usage notice:', err.message);
    } finally {
      client.release();
    }
  }

  /**
   * Authoritative Payment Activation & Renewal Extension:
   * Extends subscription by 30 days.
   * If customer renews early before current access period expires:
   * new_end_date = GREATEST(current_end_date, NOW()) + 30 days.
   * Customer never loses paid days remaining.
   * Usage quota periods are scheduled sequentially to prevent conflicting overlapping cycles.
   */
  async applyPaymentEntitlement(
    userId: string,
    orderId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string
  ): Promise<{ plan: PlanCode; startDate: string; endDate: string }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Authoritative Stored Order Verification with Row Locking
      const orderRes = await client.query(
        `SELECT * FROM payment_orders
         WHERE (id = $1 OR razorpay_order_id = $2) AND user_id = $3
         FOR UPDATE`,
        [orderId, razorpayOrderId, userId]
      );

      if (orderRes.rows.length === 0) {
        throw new Error(`ORDER_NOT_FOUND: No stored payment order matches ID ${orderId} or Razorpay order ${razorpayOrderId} for user ${userId}.`);
      }

      const storedOrder = orderRes.rows[0];

      // Replay/idempotency check on order
      if (storedOrder.status === 'paid' && storedOrder.razorpay_payment_id === razorpayPaymentId) {
        // Already paid and processed: return existing subscription duration idempotently
        const existingSub = await client.query(
          `SELECT start_date, end_date FROM subscriptions WHERE user_id = $1`,
          [userId]
        );
        await client.query('COMMIT');
        if (existingSub.rows.length > 0) {
          return {
            plan: 'artisan_pro',
            startDate: new Date(existingSub.rows[0].start_date).toISOString(),
            endDate: new Date(existingSub.rows[0].end_date).toISOString(),
          };
        }
      }

      if (storedOrder.status !== 'created') {
        throw new Error(`ORDER_INVALID_STATE: Order is in non-payable state '${storedOrder.status}'.`);
      }

      if (storedOrder.plan_code !== 'artisan_pro' || storedOrder.amount_paise !== 29900) {
        throw new Error(`ORDER_PLAN_MISMATCH: Order is for plan ${storedOrder.plan_code} (${storedOrder.amount_paise} paise), expected artisan_pro.`);
      }

      // 2. Atomically transition payment order to paid
      const updateOrder = await client.query(
        `UPDATE payment_orders
         SET status = 'paid', razorpay_payment_id = $1, updated_at = NOW()
         WHERE id = $2 AND status = 'created'
         RETURNING id`,
        [razorpayPaymentId, storedOrder.id]
      );

      if (updateOrder.rowCount !== 1) {
        throw new Error('CONCURRENT_ACTIVATION: Order was updated concurrently.');
      }

      // 3. Compute Subscription End Date (Access Duration)
      const curSub = await client.query(
        `SELECT end_date, plan, status FROM subscriptions WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      let targetEndDate: Date;
      let isEarlyRenewal = false;
      if (curSub.rows.length > 0 && curSub.rows[0].end_date) {
        const curEnd = new Date(curSub.rows[0].end_date);
        if (curEnd.getTime() > Date.now()) {
          isEarlyRenewal = true;
          targetEndDate = new Date(curEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else {
          targetEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      } else {
        targetEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      const subRes = await client.query(
        `INSERT INTO subscriptions (
          id, user_id, plan, status, razorpay_payment_id, razorpay_order_id,
          amount, start_date, end_date, renewal_mode, plan_version, updated_at
        ) VALUES (
          $1, $2, 'artisan_pro', 'active', $3, $4, 299.00,
          NOW(), $5, 'manual', 1, NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          plan = 'artisan_pro',
          status = 'active',
          razorpay_payment_id = $3,
          razorpay_order_id = $4,
          amount = 299.00,
          end_date = $5,
          updated_at = NOW()
        RETURNING start_date, end_date`,
        [`sub_${Date.now()}`, userId, razorpayPaymentId, razorpayOrderId, targetEndDate]
      );

      const activatedPeriod = subRes.rows[0];

      // 4. Non-Overlapping Quota Usage Period Allocation (Stage C1)
      const proPlan = getPlan('artisan_pro');
      if (isEarlyRenewal) {
        // Find latest existing usage period to chain subsequent 30-day allowance period
        const latestPeriodRes = await client.query(
          `SELECT period_end FROM usage_periods
           WHERE user_id = $1
           ORDER BY period_end DESC
           LIMIT 1`,
          [userId]
        );
        let periodStart = new Date();
        if (latestPeriodRes.rows.length > 0 && new Date(latestPeriodRes.rows[0].period_end).getTime() > Date.now()) {
          periodStart = new Date(latestPeriodRes.rows[0].period_end);
        }
        const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        const periodId = `period_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        await client.query(
          `INSERT INTO usage_periods (
            id, user_id, billing_owner_id, plan_code, period_start, period_end,
            ai_text_allowance, ai_text_committed, ai_text_reserved,
            ai_image_allowance, ai_image_committed, ai_image_reserved
          ) VALUES ($1, $2, $2, 'artisan_pro', $3, $4, $5, 0, 0, $6, 0, 0)`,
          [
            periodId,
            userId,
            periodStart.toISOString(),
            periodEnd.toISOString(),
            proPlan.limits.aiTextOperations,
            proPlan.limits.aiImageOperations,
          ]
        );
      } else {
        // First-time Pro activation or renewal after expiration: start new active 30-day period immediately
        const periodId = `period_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const periodStart = new Date();
        const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
        await client.query(
          `INSERT INTO usage_periods (
            id, user_id, billing_owner_id, plan_code, period_start, period_end,
            ai_text_allowance, ai_text_committed, ai_text_reserved,
            ai_image_allowance, ai_image_committed, ai_image_reserved
          ) VALUES ($1, $2, $2, 'artisan_pro', $3, $4, $5, 0, 0, $6, 0, 0)`,
          [
            periodId,
            userId,
            periodStart.toISOString(),
            periodEnd.toISOString(),
            proPlan.limits.aiTextOperations,
            proPlan.limits.aiImageOperations,
          ]
        );
      }

      await client.query('COMMIT');
      return {
        plan: 'artisan_pro',
        startDate: new Date(activatedPeriod.start_date).toISOString(),
        endDate: new Date(activatedPeriod.end_date).toISOString(),
      };
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      console.error('[EntitlementService] applyPaymentEntitlement error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }
}
