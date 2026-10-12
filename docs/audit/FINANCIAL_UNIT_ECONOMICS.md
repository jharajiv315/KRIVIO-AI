# KRIVIO AI — Financial Unit Economics & Provider Cost Analysis
**Document Version:** 1.0.0 (Production Release Candidate)  
**Author:** SaaS Monetization Engineer & Financial Architect  
**Scope:** Direct Provider Costs, Contribution Margins, and Pricing Risk Assessment  

---

## 1. Provider Cost Assumptions (Google Gemini, Imagen, Razorpay)

| Service / Resource | Provider Rate (Standard API) | Estimated Cost per Operation (INR) |
| :--- | :--- | :--- |
| **Gemini 2.5 Flash / 1.5 Flash (AI Text/Mentor)** | ~\$0.075 / 1M input tokens<br>\$0.30 / 1M output tokens | ~₹0.08 per request (avg 1,500 tokens) |
| **Gemini 1.5 Pro (Complex Multi-modal / Reasoning)** | ~\$1.25 / 1M input tokens<br>\$5.00 / 1M output tokens | ~₹0.85 per request (avg 3,000 tokens) |
| **Imagen 3 (AI Product Image Generation)** | ~\$0.030 per image | ~₹2.60 per generated image |
| **Razorpay Payment Gateway Fee** | 2% + 18% GST on fee = 2.36% | ₹7.06 on ₹299 transaction |
| **Server / PostgreSQL compute overhead** | Pooled serverless | ~₹3.50 per user / month |

---

## 2. Artisan Pro (₹299 / 30 Days) Contribution Margin Model

### 2.1 Maximum Theoretical Allowance Consumption (Worst-Case Cost)
Assuming a subscriber utilizes 100% of their included allowance:
- 75 AI Text/Mentor requests (Flash/Pro blended avg ₹0.15):
  $$75 \times ₹0.15 = ₹11.25$$
- 5 AI Image requests (Imagen 3 @ ₹2.60):
  $$5 \times ₹2.60 = ₹13.00$$
- Razorpay gateway fee (2.36% on ₹299):
  $$₹7.06$$
- Infrastructure / Database allocation:
  $$₹4.00$$
- **Total Maximum Direct Cost:** $₹11.25 + ₹13.00 + ₹7.06 + ₹4.00 = ₹35.31$
- **Contribution Margin (Worst Case):**
  $$₹299.00 - ₹35.31 = ₹263.69 \quad (88.2\% \text{ Gross Margin})$$

### 2.2 Expected Median Consumption Profile (Typical Artisan)
- 30 AI Text requests: $30 \times ₹0.12 = ₹3.60$
- 3 AI Images: $3 \times ₹2.60 = ₹7.80$
- Payment processing: $₹7.06$
- Infrastructure: $₹4.00$
- **Total Expected Direct Cost:** $₹22.46$
- **Contribution Margin (Expected):**
  $$₹299.00 - ₹22.46 = ₹276.54 \quad (92.5\% \text{ Gross Margin})$$

---

## 3. Artisan Free (₹0) Cost Sustainability & Fair-Use Cap

- 10 AI Text requests: $10 \times ₹0.08 = ₹0.80$
- 0 Paid AI Images: ₹0.00 (canvas compositions run in browser / local engine)
- Direct AI cost per active Free user per month: $\approx ₹0.80$
- At 10,000 active Free artisans, total direct model spend is $\approx ₹8,000 / \text{month}$ (\$95 USD), which is comfortably sustainable through paid conversions and grant allocations.

---

## 4. Staged Credit Packs Unit Economics (Post-Launch)

| Credit Pack | Proposed Price | Direct Model Cost (Imagen 3) | Gateway & Tax | Net Contribution |
| :--- | :--- | :--- | :--- | :--- |
| **Pack 5 Images** | ₹129.00 | $5 \times ₹2.60 = ₹13.00$ | ₹3.04 | **₹112.96 (87.5%)** |
| **Pack 15 Images**| ₹329.00 | $15 \times ₹2.60 = ₹39.00$| ₹7.76 | **₹282.24 (85.8%)** |

*Policy: Credit pack purchases remain disabled in UI until production telemetry confirms actual Imagen retry rates and error margins in Indian network environments.*
