# KRIVIO AI — Oracle Cloud Always Free (OCI) Deployment Guide

**Target Hardware**: Oracle Cloud Infrastructure (OCI) Ampere A1 (ARM64) or AMD E2.1.Micro Always-Free VM  
**Operating System**: Ubuntu 22.04 LTS / 24.04 LTS (aarch64 / x86_64)  
**Process Manager**: PM2  
**Reverse Proxy**: Nginx + Certbot (Let's Encrypt SSL)  

---

## 1. ARM64 Architecture Compatibility Audit

Before deploying Node.js to an ARM64 (Ampere A1) architecture, every package in `package.json` was audited:

| Package | Type | Native C++ Addon? | ARM64 (aarch64) Compatibility | Verification Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Node.js 20+** | Runtime | N/A | **100% Native** | Pre-compiled official Node.js binaries available for `linux-arm64`. |
| **`esbuild`** | Build tool | Go binary | **100% Native** | `@esbuild/linux-arm64` binary is automatically downloaded by npm. |
| **`pdfkit`** | PDF engine | None | **100% Pure JS** | Zero native dependencies; generates PDF binary vectors purely in JavaScript. |
| **`exceljs`** | Spreadsheet engine | None | **100% Pure JS** | Generates `.xlsx` zipped XML archives purely in JavaScript. |
| **`pg` (node-postgres)** | DB client | None | **100% Pure JS** | Uses JavaScript wire protocol for PostgreSQL (does not require `libpq`). |
| **`@google/genai`** | AI SDK | None | **100% Pure TS** | Standard HTTP REST/streaming client for Google Gemini API. |
| **`bcryptjs`** | Password hashing | None | **100% Pure JS** | Pure JavaScript implementation of bcrypt (bypasses `node-gyp` C++ compilation). |
| **`jsonwebtoken`** | JWT library | None | **100% Pure JS** | HMAC SHA256 cryptographic signing handled by Node.js built-in `crypto`. |
| **`express`** | Web framework | None | **100% Pure JS** | Standard Node.js HTTP framework. |

**Audit Result**: **100% of KRIVIO Node.js dependencies run out-of-the-box on Oracle Ampere A1 ARM64 without compilation errors.**

---

## 2. Security & Network Architecture

```
[ Internet Traffic ]
        │
   HTTPS (Port 443)
        ▼
[ Oracle VCN Security List ] ──> Ingress Rule: Allow 0.0.0.0/0 on Ports 80, 443
        │
[ Host Firewall (UFW / iptables) ] ──> Allow 80, 443, 22 (Reject all else)
        │
[ Nginx Reverse Proxy ] ──> Let's Encrypt TLS Termination, OWASP Security Headers
        │
   HTTP (Localhost only)
        ▼
[ Node.js Express App (127.0.0.1:3000) ] ──> Supervised by PM2 daemon
        │
   HTTPS (Outgoing)
        ▼
[ Supabase PostgreSQL 15 ] + [ Google Gemini API ]
```

---

## 3. Server Provisioning & Setup (Step-by-Step)

### Step 1: Oracle Cloud Security List Setup
1. Log into your **Oracle Cloud Console**.
2. Navigate to: **Networking → Virtual Cloud Networks → Your VCN → Security Lists → Default Security List**.
3. Under **Ingress Rules**, click **Add Ingress Rules**:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `80, 443`
   - **Description**: `Allow HTTP and HTTPS traffic for KRIVIO backend`

---

### Step 2: System Update & Host Firewall Configuration
SSH into your Oracle Cloud VM:
```bash
ssh -i /path/to/private_key ubuntu@YOUR_INSTANCE_PUBLIC_IP
```

Oracle Cloud Ubuntu images ship with restrictive default `iptables` rules. Update them to allow web traffic:
```bash
# Update Ubuntu package indices
sudo apt update && sudo apt upgrade -y

# Configure Ubuntu UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Ensure Oracle iptables allows HTTP/HTTPS forwarding
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

### Step 3: Install Node.js 20 LTS & PM2
```bash
# Install NodeSource repository for Node.js 20 (ARM64 and x86_64 compatible)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify versions
node -v  # Expected: v20.x.x
npm -v   # Expected: 10.x.x

# Install PM2 process manager globally
sudo npm install -g pm2
```

---

### Step 4: Clone & Build KRIVIO Backend
```bash
# Create application directory
sudo mkdir -p /var/www/krivio-backend
sudo chown -R ubuntu:ubuntu /var/www/krivio-backend
cd /var/www/krivio-backend

# Clone your repository
git clone https://github.com/jharajiv315/KRIVIO-AI.git .

# Install dependencies and compile server bundle
npm ci
npm run build:server

# Create production .env file
nano .env
```
Paste all production secrets from Section 2 of [`.env.example`](file:///c:/Users/admin/OneDrive/Documents/KRIVIO/KRIVIO-AI/.env.example):
```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
GEMINI_API_KEY="AIzaSyYourProductionGeminiApiKey"
SUPABASE_URL="https://mvbpxcsyyasckzymjyjb.supabase.co"
SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_JWT_SECRET="your_supabase_jwt_secret"
JWT_SECRET="your_jwt_secret_min_32_chars"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
ALLOWED_ORIGINS="https://krivio-ai.vercel.app"
APP_URL="https://krivio-ai.vercel.app"
```

---

### Step 5: Launch & Supervise with PM2
```bash
# Start backend server under PM2 supervision
pm2 start dist/server.cjs --name "krivio-api"

# Configure PM2 to restart automatically on system reboot
pm2 startup
# (Run the sudo env PATH=... command printed by PM2)
pm2 save

# Verify status
pm2 status
curl http://127.0.0.1:3000/health
```

---

### Step 6: Configure Nginx Reverse Proxy & SSL (Certbot)
```bash
# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx site
sudo nano /etc/nginx/sites-available/krivio-api
```

Paste the following Nginx configuration (replace `api.yourdomain.com` with your domain):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Maximum payload size for 4K artisan photo uploads
    client_max_body_size 25M;

    # Reverse proxy to local Node.js process
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Generous timeout for Gemini AI image generation & vision analysis
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/krivio-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Obtain free Let's Encrypt SSL certificate
sudo certbot --nginx -d api.yourdomain.com
```

---

## 4. Verification & Switchover

Test your HTTPS domain:
```bash
curl -s https://api.yourdomain.com/health
curl -s https://api.yourdomain.com/health/db
```

Update Vercel Environment Variables:
- Set `VITE_API_URL=https://api.yourdomain.com` in Vercel.
- Trigger a redeployment in Vercel. Your frontend now communicates with your dedicated Oracle Always Free backend!
