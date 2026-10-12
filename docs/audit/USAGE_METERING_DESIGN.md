# KRIVIO AI — Usage Metering & Quota Architecture
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** Database Reliability Engineer & Systems Architect  
**Scope:** Concurrency-Safe Quota Reservations, Commit/Release Lifecycle, and Usage Ledgers  

---

## 1. Problem Statement & Anti-Patterns Avoided

Naïve SaaS systems query balances, invoke external AI APIs, and increment counters post-hoc:
```
[Bad Pattern: Race-Prone & Vulnerable to Financial Loss]
1. Read balance from DB (e.g. 1 image credit remaining)
2. User fires 5 parallel requests
3. All 5 read balance = 1
4. All 5 call paid Imagen API (cost: 5 x ₹3.50 = ₹17.50)
5. DB balance decrements to 0
-> Result: User received 5x the allowance; business absorbed ₹14.00 loss.
```

KRIVIO AI implements a **Two-Phase Reservation Lifecycle** with atomic row-level locking:

```
[KRIVIO Standard: Safe Quota Reservation & Finalization]
1. Preflight & Reserve:
   - Check plan limits in usage_periods table.
   - Atomically increment reserved_units via SQL transaction.
   - If (committed_units + reserved_units + request_units > allowance) -> Reject 403 QUOTA_EXHAUSTED immediately.
2. External Execution:
   - Call Gemini / Imagen with timeouts and bounded retries.
   - Do NOT hold DB transaction lock during AI network call.
3. Finalization:
   - Success -> commitUsage(reservationId):
     committed_units += reserved_units; reserved_units -= reserved_units;
   - Failure or Canvas Fallback -> releaseUsage(reservationId):
     reserved_units -= reserved_units;
```

---

## 2. Database Schema for Quota Management

### 2.1 `usage_periods`
Tracks current quota cycles per billing owner:
```sql
CREATE TABLE IF NOT EXISTS usage_periods (
  id VARCHAR(255) PRIMARY KEY,
  billing_owner_id VARCHAR(255) NOT NULL,
  plan_code VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,  -- 'ai_text' | 'ai_image' | 'quotation'
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  allowance INTEGER NOT NULL,
  committed_units INTEGER DEFAULT 0,
  reserved_units INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 `usage_ledger`
Auditable event log of every reservation, commit, and release:
```sql
CREATE TABLE IF NOT EXISTS usage_ledger (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  billing_owner_id VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  operation_type VARCHAR(100) NOT NULL,
  operation_status VARCHAR(50) NOT NULL, -- 'reserved' | 'committed' | 'released'
  units INTEGER NOT NULL,
  period_id VARCHAR(255),
  provider_model VARCHAR(100),
  estimated_cost_paise INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Special Metering Rules

### 3.1 Image Studio Zero-Charge Fallback
Image Studio features both generative AI (`imagen-3.0-generate-002`) and a local composition canvas engine (`krivio-studio-engine`).
- When the generative provider fails or local canvas mode is selected, the returned metadata indicates `model: 'krivio-studio-engine'`.
- `server.ts` checks the model returned:
  ```typescript
  if (result.metadata?.model === 'krivio-studio-engine') {
    await entitlementService.releaseUsage(reservationId);
    // 0 paid credits deducted!
  } else {
    await entitlementService.commitUsage(reservationId, 'imagen-3', 350);
  }
  ```
- Protects rural artisans from being charged for non-generative canvas fallbacks.

### 3.2 Product Cap Accounting
- Evaluated via live count of active products:
  ```sql
  SELECT COUNT(*) FROM products WHERE user_id = $1
  ```
- Free tier cap is 5.
- The 6th product attempt triggers HTTP 403 `PRODUCT_LIMIT_REACHED`.
- Existing products remain accessible, editable, and exportable.
