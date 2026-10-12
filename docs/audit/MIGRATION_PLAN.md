# KRIVIO AI — User & Data Migration Plan
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** Principal Software Engineer & Database Reliability Engineer  
**Scope:** Safe Transition of Existing Free Users, Simulated Subscriptions & Historical Product Records  

---

## 1. Context & Objectives

Prior to this implementation, subscriptions were partially tracked in a simple `subscriptions` table and simulated in browser state. As KRIVIO launches production monetization, existing users must experience zero disruption, zero surprise data loss, and zero retroactive charges.

### Core Migration Tenets
1. **Never Delete Products on Downgrade:** If an existing user has 12 products created during testing, their 12 products remain 100% visible, editable, and exportable. They are merely prevented from creating a 13th product until their plan is upgraded or count falls below 5.
2. **Never Retroactively Bill Unmetered Usage:** Past AI requests cannot and will not be back-charged.
3. **Graceful Default for Unsubscribed Users:** Every user without an active, verified Razorpay payment record is mapped cleanly to `artisan_free` with a fresh monthly allowance.
4. **Non-Destructive DDL:** All database migrations use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING / UPDATE`, and nullable/default column additions.

---

## 2. Database Schema Migration Sequence

Executed automatically in `ensureDbInitialized()` during server startup:

1. **Phase 1: Table Creation**
   - Creates `plans`, `payment_orders`, `payment_events`, `usage_periods`, `usage_ledger`, `credit_packs`, `organizations`, `organization_members`.
2. **Phase 2: Index Creation**
   - Creates indexes on foreign keys and lookups: `idx_payment_orders_user`, `idx_usage_periods_owner`, `idx_usage_ledger_owner`, etc.
3. **Phase 3: Canonical Plan Seeding**
   - Seeds `free` (₹0), `artisan_pro` (₹299), `shg_growth` (₹999) into `plans` table with upsert semantics.
4. **Phase 4: Backward-Compatible Column Extensions**
   - Checks existing `subscriptions` table for `renewal_mode` and `plan_version`, adding them via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

---

## 3. Account State Resolution Workflow

When an existing user logs in or makes an API request:
```
User makes request (e.g. GET /api/subscriptions/usage)
             │
             ▼
Check PostgreSQL `subscriptions` table for `user_id`:
             │
   ┌─────────┴─────────┐
   │                   │
Exists & Active       Does Not Exist OR Expired
   │                   │
   ▼                   ▼
Plan = 'artisan_pro'  Plan = 'free'
Entitlements = Pro    Entitlements = Free (5 products, 10 AI, 0 AI images)
```

---

## 4. Rollback Strategy

If any deployment regression occurs:
- The schema migrations are additive; rolling back backend code to the previous commit leaves all historical user products and profiles completely intact.
- The `subscriptions` table continues to function with standard columns (`id`, `user_id`, `plan`, `status`).
