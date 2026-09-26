# KRIVIO AI — Comprehensive Free-Tier Cloud Hosting Evaluation

**Auditor**: Principal Cloud Architect & Senior DevOps Engineer  
**Date**: September 2026  
**Evaluated Providers**:
1. Google Cloud Run
2. Oracle Cloud Infrastructure (OCI) Always Free
3. Render Free Web Service
4. Railway (Comparative Reference)

---

## 1. Provider Comparison Matrix

| Evaluation Dimension | Google Cloud Run (Recommended) | Oracle Cloud Always Free (OCI) | Render Free Tier | Railway (Comparative) |
| :--- | :--- | :--- | :--- | :--- |
| **Official Free Tier Quota** | **2,000,000 requests/month**<br>**360,000 GiB-seconds RAM**<br>**180,000 vCPU-seconds**<br>**1 GB egress/month** | **4 OCPUs & 24 GB RAM** (Ampere A1 ARM64)<br>+ 2 AMD Micro VMs (1 GB RAM each)<br>200 GB Storage, 10 TB Egress | **750 hours/month** (1 service)<br>Spins down after 15m idle<br>100 GB egress/month | **NO perpetual free tier**.<br>One-time $5 trial credit for 30 days only; requires $5/mo Hobby plan thereafter. |
| **RAM Allocation** | 512 MB to 32 GB (configurable) | Up to 24 GB RAM | Exactly 512 MB | Up to 8 GB (Paid) |
| **CPU Allocation** | 1 to 8 vCPUs | 4 OCPU (Ampere) or 1/8 vCPU (AMD) | 0.1 vCPU | Up to 8 vCPUs (Paid) |
| **Cold Starts** | **Low (1.5 – 2.5s)** on scale-to-zero | **ZERO (0 seconds)** Always-on VM | **Severe (50 – 70 seconds)** | Low |
| **Persistent Runtime** | Scale-to-zero (or `min-instances=1`) | **100% Persistent 24/7/365 VM** | None (Shuts off after 15m idle) | Persistent while credit lasts |
| **HTTPS & Custom Domain** | Built-in Google-managed SSL (`*.run.app`) + custom domains | Manual setup via Nginx + Certbot | Built-in Render SSL (`*.onrender.com`) | Built-in SSL (`*.up.railway.app`) |
| **Node.js Compatibility** | Native Node 20 runtime or Dockerfile | Native Linux x86_64 / aarch64 | Native Node runtime | Native Node runtime |
| **GitHub Deployment** | Native Cloud Build / GitHub triggers | Requires manual `git pull` or CI runner | Native GitHub push triggers | Native GitHub push triggers |
| **Logging & Telemetry** | Google Cloud Logging (Stackdriver) | Linux `/var/log` or PM2 logs | Render Web Dashboard logs | Railway Dashboard logs |
| **Billing Card Requirement** | **Credit card required** for Google Cloud account setup | **Credit card required** for verification (Strict anti-fraud filters) | **No credit card required** | Credit card required after trial |
| **Risk of Unexpected Cost** | **Near Zero** if `--max-instances 1` or `2` and budget alerts set | **Zero** if kept strictly inside Always Free shapes | **Zero** (Free tier cannot bill) | **High** (Auto-charges card after $5 trial) |
| **Deployment Complexity** | **Very Low** (1 command or GitHub push) | **High** (Linux sysadmin, firewall, Nginx) | **Very Low** (Connect repo & go) | Very Low |
| **WhatsApp Webhook SLA** | **Compliant** (<2.5s cold start or pre-warmed) | **Flawless** (Sub-10ms response) | **FAILS** (Meta drops after 15s) | Compliant |
| **Image & AI API Suitability** | **Excellent** (Configurable 60m timeout) | **Excellent** (Huge RAM, 0 timeout limits) | **Poor** (512MB OOM risk, 100s limit) | Good |

---

## 2. In-Depth Provider Analysis

### 1. Google Cloud Run (Principal Architect Recommendation)
- **Why It Fits KRIVIO AI**:
  - KRIVIO’s primary operational headache on Vercel is the **10-second serverless timeout** when Gemini processes multi-aspect ratio image generations, background removals, or long Indic audio transcriptions. Cloud Run allows timeouts up to **3,600 seconds (60 minutes)**.
  - **Free Tier Calculation**: With 2 million requests and 360,000 GiB-seconds free per month, a Node.js container provisioned with 1 GB RAM can handle approximately 100,000 active execution seconds (nearly 28 hours of continuous CPU processing) without incurring a single cent. For a rural entrepreneur portfolio / accelerator demo, this is **100% free indefinitely**.
  - **Cold Start Behavior**: Because Node.js boots in under 100ms and the container image is only ~130MB, cold start delay is merely **1.5 to 2.5 seconds**—substantially faster than Render's 50–70 second sleep penalty.
  - **Safety Mechanism**: By passing `--max-instances 1` (or `2`), Google Cloud Run will never spawn runaway instances during bot crawls or traffic spikes, guaranteeing zero surprise charges.

### 2. Oracle Cloud Always Free (The Bare-Metal Alternative)
- **Why It Is Powerful**:
  - Oracle Cloud provides the most generous free compute hardware in the world: **4 OCPU cores and 24 GB RAM on Ampere A1 (ARM64)**, running 24/7/365 with zero cold starts.
  - All KRIVIO Node.js dependencies (`esbuild`, `pdfkit`, `exceljs`, `pg`, `@google/genai`, `bcryptjs`) were audited and verified to run natively on Linux ARM64 (aarch64).
- **Why It Is Secondary to Cloud Run for Immediate Deployment**:
  1. **Strict Credit Card / Account Approval**: Oracle's sign-up fraud verification frequently declines valid debit and virtual credit cards across India and international regions.
  2. **Capacity Constraints**: The Ampere A1 shapes (`VM.Standard.A1.Flex`) are frequently "Out of host capacity" in popular regions (e.g. Mumbai, Hyderabad, Frankfurt, US East).
  3. **Operational Overhead**: Requires manually configuring Ubuntu Linux, opening Oracle VCN Security Lists, adjusting Linux `iptables`, setting up PM2 process manager, Nginx reverse proxying, and Certbot Let's Encrypt SSL certificates.

### 3. Render Free Web Service (Why It Is Rejected)
- **Memory Limit (512 MB)**:
  - Base memory consumption for Node.js + Express is ~65 MB.
  - Processing concurrent 5–10 MB base64 smartphone photos adds 45–60 MB per payload.
  - Concurrent PDF vector generation or Excel catalog generation under 2–3 simultaneous requests easily approaches 400–480 MB, risking Linux Out-Of-Memory (OOM) killer events (`Exit Code 137`).
- **Sleep / Cold Start Penalty (50–70s)**:
  - Shuts down after 15 minutes of inactivity.
  - When an artisan sends a voice message or clicks "Generate Details", waiting 50+ seconds feels completely broken.
  - WhatsApp Cloud API webhooks require a 200 OK acknowledgment within 5–15 seconds; Render Free will cause dropped messages and failed verification challenges.

### 4. Railway (Not Truly Free)
- Railway deprecated its perpetual free tier in 2023.
- It only offers a $5 one-time credit lasting 30 days. After that, it requires an active credit card charging $5/month minimum. It cannot be considered for a strictly free, permanent deployment.

---

## 3. Final Recommendation: Google Cloud Run

**Google Cloud Run is selected as the immediate production hosting platform for the KRIVIO AI Node/Express backend.**

### Key Factors in Decision:
1. **Zero Cost**: Within Google's permanent free tier (2M requests/mo, 360k GiB-s).
2. **Eliminates Vercel Timeouts**: Supports up to 60-minute execution limits for AI generation.
3. **No Sysadmin Overhead**: Fully managed container with automatic Google-signed HTTPS.
4. **Fast Cold Starts (<2s)**: 25x faster than Render Free.
5. **Cost Safety**: Hard instance capping (`--max-instances 1` or `2`) prevents any financial risk.
