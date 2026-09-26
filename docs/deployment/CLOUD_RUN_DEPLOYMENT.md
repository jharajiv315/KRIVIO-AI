# KRIVIO AI — Google Cloud Run Production Deployment Guide

**Target Architecture**: Vercel Frontend → Google Cloud Run (Node/Express Monolith) → Supabase PostgreSQL  
**Free-Tier Category**: Perpetual Monthly Free Tier (2M requests, 360k GiB-s RAM)  
**Zero Cost Guarantee**: Verified with `--min-instances 0` and `--max-instances 2`  

---

## 1. Cloud Run Readiness Checklist

| Requirement | Audit Status | Implementation Details |
| :--- | :---: | :--- |
| **Port Binding** | **VERIFIED** | Binds to `0.0.0.0:$PORT` (reads `$PORT` dynamically from Cloud Run environment). |
| **Liveness Health Check** | **VERIFIED** | `GET /health` returns immediate HTTP 200 without DB dependency. |
| **Readiness Health Check** | **VERIFIED** | `GET /health/db` executes `SELECT 1` ping against Supabase PostgreSQL. |
| **Database Connection** | **VERIFIED** | Connects to existing Supabase PostgreSQL via connection pooler (`sslmode=require`). |
| **Ephemeral Filesystem** | **VERIFIED** | Zero reliance on local disk. Quotations, images, and catalogs are held in memory or PostgreSQL. |
| **No Hardcoded Localhost** | **VERIFIED** | All URLs are environment-variable driven. Localhost exists only in fallback defaults for local testing. |
| **Zero Client Secrets** | **VERIFIED** | `GEMINI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, and `RAZORPAY_KEY_SECRET` are kept strictly in Cloud Run. |

---

## 2. Prerequisites

1. **Install Google Cloud SDK (`gcloud`)**:
   Download and install from: `https://cloud.google.com/sdk/docs/install`
2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```
3. **Set Active Project**:
   ```bash
   gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
   ```
4. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable run.googleapis.com \
                          cloudbuild.googleapis.com \
                          artifactregistry.googleapis.com
   ```

---

## 3. Deployment Commands

### Option A: Direct Source Deployment via Cloud Build (Recommended — 1 Command)
Run this single command from your repository root directory. Google Cloud will automatically build your container using [`Dockerfile`](file:///c:/Users/admin/OneDrive/Documents/KRIVIO/KRIVIO-AI/Dockerfile) and deploy it to Cloud Run:

```bash
gcloud run deploy krivio-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300s \
  --set-env-vars "NODE_ENV=production,APP_URL=https://krivio-ai.vercel.app,ALLOWED_ORIGINS=https://krivio-ai.vercel.app" \
  --set-env-vars "DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require" \
  --set-env-vars "GEMINI_API_KEY=AIzaSyYourProductionGeminiApiKey" \
  --set-env-vars "SUPABASE_URL=https://mvbpxcsyyasckzymjyjb.supabase.co" \
  --set-env-vars "SUPABASE_ANON_KEY=your_supabase_anon_key_here" \
  --set-env-vars "SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here" \
  --set-env-vars "JWT_SECRET=your_long_secure_jwt_secret_min_32_chars" \
  --set-env-vars "RAZORPAY_KEY_ID=your_razorpay_key_id" \
  --set-env-vars "RAZORPAY_KEY_SECRET=your_razorpay_key_secret"
```

### Option B: Using Google Cloud Secret Manager (Best Security Practice)
Store sensitive keys securely in Secret Manager so they never appear in plain text:

```bash
# 1. Create secrets
echo -n "postgresql://..." | gcloud secrets create krivio-db-url --data-file=-
echo -n "AIzaSy..." | gcloud secrets create krivio-gemini-key --data-file=-

# 2. Deploy referencing secrets
gcloud run deploy krivio-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --memory 1Gi \
  --timeout 300s \
  --set-secrets "DATABASE_URL=krivio-db-url:latest,GEMINI_API_KEY=krivio-gemini-key:latest" \
  --set-env-vars "NODE_ENV=production,ALLOWED_ORIGINS=https://krivio-ai.vercel.app"
```

---

## 4. Free-Tier Safety & Cost Capping

To guarantee that your deployment **never incurs unexpected charges**:

1. **Keep `--min-instances 0`**:
   - The container scales to zero when no traffic is present, consuming 0 memory and 0 CPU.
2. **Cap `--max-instances 2`**:
   - Prevents traffic spikes or crawlers from spawning dozens of containers.
3. **Memory Allocation**:
   - Provisioned at **1 GiB RAM** (within the 360,000 GiB-seconds free tier = ~100 hours of active execution time per month).
4. **Set Up a Google Cloud Budget Alert ($1.00)**:
   - Go to: **Google Cloud Console → Billing → Budgets & alerts → Create Budget**.
   - Target Amount: `$1.00 USD`.
   - Thresholds: `50%`, `90%`, `100%`.
   - Notifications: Send email alerts to your account if any billing occurs.

---

## 5. Verification & Health Probing

Once the deployment completes, `gcloud` will output your Service URL:
`https://krivio-backend-<random-hash>-uc.a.run.app`

Test the endpoints immediately:

```bash
# 1. Test Process Liveness
curl -s https://krivio-backend-<hash>-uc.a.run.app/health
# Expected: {"status":"healthy","process":"alive","service":"krivio-ai-node-backend",...}

# 2. Test PostgreSQL Database Connectivity
curl -s https://krivio-backend-<hash>-uc.a.run.app/health/db
# Expected: {"status":"healthy","database":"connected","query_result":1,...}
```

---

## 6. Vercel Switchover

1. Open your Vercel Dashboard: `https://vercel.com` → Project **`KRIVIO-AI`** → **Settings** → **Environment Variables**.
2. Add / Update:
   ```env
   VITE_API_URL=https://krivio-backend-<hash>-uc.a.run.app
   ```
3. Go to **Deployments** → Click **Redeploy** on the latest deployment.
4. Open `https://krivio-ai.vercel.app` in your browser. All API requests now route seamlessly through Google Cloud Run!
