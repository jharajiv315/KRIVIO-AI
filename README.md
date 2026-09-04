# KRIVIO AI

> **"From Local Hands to Global Markets."**  
> AI-assisted digital business mentor and commerce acceleration platform for rural Indian artisans, weavers, farmers, and Self-Help Groups (SHGs).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1.svg?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

Rural micro-entrepreneurs in India produce high-quality handcrafted goods, agricultural commodities, and heritage textiles, yet face systemic obstacles in the digital economy:
- **Presentation & Photography Barriers:** Inability to afford professional studio photography, clean product staging, or digital editing.
- **Cataloging & Content Deficits:** Difficulties authoring structured product descriptions, GST/HSN categorizations, technical attributes, and SEO keywords.
- **Vernacular & Digital Literacy Gaps:** Existing e-commerce tooling is predominantly text-heavy, English-centric, and complex to navigate.
- **Marketplace Readiness:** Lack of familiarity with listing standards and compliance rules across open networks like **ONDC** and marketplaces like **Amazon Saheli** or **Meesho**.
- **Financial & Institutional Access:** Limited awareness of government support schemes such as **PM Vishwakarma**, **PMEGP**, and **MUDRA**.

**KRIVIO AI** bridges this gap by acting as a context-aware digital business mentor. Rather than behaving as a generic conversational chatbot or an isolated photo editor, KRIVIO anchors every workflow to the entrepreneur's real business profile and product catalog.

```mermaid
graph LR
    A[Artisan Voice / Photo Input] --> B[KRIVIO AI Client]
    B --> C[Authenticated Application Gateway]
    C --> D[Contextual Business Engine]
    D --> E[Gemini Multimodal Vision & Audio]
    D --> F[PostgreSQL Scoped Storage]
    D --> G[Marketplace & Storefront Exports]
```

---

## Core Capabilities

- **🎙️ Voice-First Vernacular Mentorship:** Spoken-word interactions in 7 regional Indian languages with audio transcription, verification before query execution, and synthesized voice responses.
- **📸 AI Image & Creative Studio:** 8 specialized visual transformations (background cleanup, model/lifestyle context staging, seasonal & festival marketing banners, packaging mockups) with automatic aspect-ratio adjustments (1:1, 4:5, 9:16, 16:9).
- **🏷️ Product Identity Wizard:** AI extraction of materials, dimensions, heritage craft narratives, pricing suggestions, and marketplace-ready catalog tags from single product photos.
- **📊 Marketplace Readiness Auditor:** Automated compliance and quality scoring (0–100%) against ONDC, Amazon, Meesho, and Etsy standards with actionable improvement checklists.
- **🏛️ Government Scheme Advisor:** Direct discovery and eligibility matching for rural empowerment schemes (PM Vishwakarma, PMEGP, Stand-Up India, SFURTI, Mudra).
- **🌐 Public Digital Storefront:** Instant shareable web storefronts (`?store=usr_...`) enabling direct customer inquiries and orders via WhatsApp.
- **🇮🇳 Full Multilingual Interface:** Native localized UI across **English, Hindi (हिंदी), Marathi (मराठी), Gujarati (ગુજરાતી), Tamil (தமிழ்), Bengali (বাংলা), and Assamese (অসমীয়া)**.

---

## Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite 6 | Single Page Application with dynamic code splitting and Lucide React icons |
| **Styling & UI** | Tailwind CSS v4, Motion | Custom KRIVIO Design System (`#0F5132` Emerald, `#D4AF37` Gold, Dark Theme `#0B1911`) |
| **Node.js Gateway** | Express 4, Node.js, `pg` | Monolithic API + development Vite middleware (`server.ts`), compiled via esbuild for Vercel |
| **Python Backend** | FastAPI, SQLAlchemy, Uvicorn | High-performance async microservices (`backend/`) for speech processing and WhatsApp webhooks |
| **Database** | PostgreSQL | Relational storage for users, business profiles, products, activities, voice assets, subscriptions |
| **Authentication** | Supabase Auth + KRIVIO JWT | Google OAuth, email authentication, and automatic PostgreSQL user-session synchronization |
| **AI & Multimodal** | Google Gemini API | `gemini-2.5-flash-image`, `gemini-2.5-flash`, `gemini-3.1-flash-image` model router |
| **Payments** | Razorpay | Subscription ordering and webhook payment verification (`rzp_test` / live support) |
| **Deployment** | Vercel | Production static asset CDN and serverless API functions (`/api/*`) |

---

## Project Structure

```
KRIVIO-AI/
├── api/                        # Vercel serverless function entry points
│   ├── [...path].ts
│   └── index.ts
├── backend/                    # FastAPI Python application
│   ├── alembic/                # Database migrations
│   ├── crud/                   # SQLAlchemy CRUD operations
│   ├── models/                 # PostgreSQL relational entity definitions
│   ├── routes/                 # FastAPI API route controllers
│   ├── schemas/                # Pydantic validation schemas
│   ├── services/               # Voice pipeline, speech adapters, WhatsApp client
│   └── tests/                  # Unit and integration test suites
├── src/                        # React Frontend
│   ├── components/             # UI views (Dashboard, ImageStudio, VoiceMentor, etc.)
│   │   └── image-studio/       # StudioWorkspace canvas & layer operations
│   ├── config/                 # Navigation schemas and app constants
│   ├── context/                # React contexts (Auth, Theme)
│   ├── i18n/                   # Multilingual localization bundles (7 languages)
│   ├── server/                 # Image operation registries & model routers
│   ├── services/               # Frontend API client & Supabase connector
│   └── utils/                  # Canvas helpers and text formatters
├── server.ts                   # Express.js server & API monolith
├── vercel.json                 # Vercel rewrite & routing rules
├── vite.config.ts              # Vite frontend build configuration
├── package.json                # Node.js dependencies and run scripts
└── .env.example                # Canonical environment variable template
```

---

## Feature Implementation Status

| Feature Area | Status | Verification & Notes |
|---|---|---|
| **In-App Voice Mentor (Phase 1)** | ✅ Implemented | Mic recording, Gemini transcription, confirm-before-send, TTS synthesis, voice history in PostgreSQL |
| **AI Image Studio & Operations** | ✅ Implemented | 8 operational categories, prompt building, aspect ratio transforms, save-to-product workflow |
| **Product Identity Generator** | ✅ Implemented | Multimodal attribute extraction, craft storytelling, pricing calculator, JSON catalog exports |
| **Multilingual UI (7 Languages)** | ✅ Implemented | Complete locale strings for `en`, `hi`, `mr`, `gu`, `ta`, `bn`, `as` |
| **Authentication & Profile Sync** | ✅ Implemented | Supabase Google OAuth + email signup, synced to PostgreSQL `users` table |
| **Marketplace Readiness Engine** | ✅ Implemented | Automated catalog auditing against ONDC, Amazon, Meesho, and Etsy standards |
| **Government Schemes Discovery** | ✅ Implemented | Searchable registry of central/state MSME schemes with eligibility guidance |
| **Public Artisan Storefront** | ✅ Implemented | Direct shareable URL (`?store=usr_...`) with WhatsApp direct-order messaging |
| **Razorpay Subscriptions** | ✅ Implemented | Free and Pro tier management with server-side Razorpay order and verification endpoints |
| **WhatsApp Inbound Voice (Phase 2)** | 🟡 Config-Dependent | Webhook verification, signature security, and media download implemented; requires Meta credentials |
| **Google Cloud Chirp 2 Adapter** | 🟡 Config-Dependent | Service layer implemented; requires `GOOGLE_APPLICATION_CREDENTIALS` |
| **Automated ONDC Direct Listing** | 🔵 Planned | Direct ONDC network transaction protocol integration scheduled for Phase 3 |

---

## Local Development Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Python:** v3.10 or higher (for FastAPI backend & testing)
- **PostgreSQL:** v14 or higher (or cloud PostgreSQL instance)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/jharajiv315/KRIVIO-AI.git
cd KRIVIO-AI
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and supply your API keys:
```bash
cp .env.example .env
```

Key environment variables:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/krivio_db"
GEMINI_API_KEY="your_google_gemini_api_key"
JWT_SECRET="your_secure_jwt_secret"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Install Dependencies
```bash
# Install Node.js frontend & server dependencies
npm install

# (Optional) Install Python dependencies for FastAPI backend services
pip install -r backend/requirements.txt
```

### 4. Run the Development Server
```bash
# Starts Express server with integrated Vite HMR on http://localhost:3000
npm run dev
```

To run the standalone FastAPI backend service (port 8000):
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Running Tests & Quality Checks
```bash
# TypeScript compiler typecheck
npm run lint

# Production bundle build test
npm run build

# Python backend unit tests
python -m unittest discover -s backend/tests
```

---

## Deep Documentation Links

For comprehensive technical specifications, refer to the dedicated documentation files:

- 📐 **[ARCHITECTURE.md](ARCHITECTURE.md)** — Detailed dual-backend architecture, database schemas, security flows, AI pipelines, and request lifecycles.
- 🚀 **[FEATURES.md](FEATURES.md)** — In-depth breakdown of all 12 feature domains, user workflows, operational parameters, and limitations.
- 🛡️ **[SECURITY.md](SECURITY.md)** — Security policies, vulnerability reporting, credential protection, tenant isolation, and audit findings.

---

## Roadmap

- [x] **Phase 1: Vernacular Business Mentor & Studio** — Voice-first in-app assistance, 8-category Image Studio, multilingual UI, and marketplace audits.
- [x] **Phase 1.5: Production Hardening** — PostgreSQL relational migrations, dual-backend support, and Razorpay checkout flows.
- [ ] **Phase 2: WhatsApp Vernacular Channel** — End-to-end testing of Meta Cloud API inbound voice note ingestion and WhatsApp response messaging.
- [ ] **Phase 2.5: Google Cloud Chirp 2 Benchmark** — Production deployment of Chirp 2 speech models for Indian dialects.
- [ ] **Phase 3: ONDC Network Gateway** — Direct ONDC Beckn protocol adapter for automated catalog publishing.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
