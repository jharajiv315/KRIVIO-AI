# KRIVIO AI — Project Context & Architecture

## Project Overview
KRIVIO AI is a **voice-first AI business mentor platform** for rural entrepreneurs in India (artisans, SHGs, farmers, weavers). It helps them with pricing, product photography, marketplace listings (ONDC/Amazon/Meesho/Etsy), government schemes, and AI-powered mentoring.

**Production URL**: https://krivio-ai.vercel.app  
**GitHub Repository**: https://github.com/jharajiv315/KRIVIO-AI.git  
**Branch**: `main`

---

## Tech Stack
- **Frontend**: React + TypeScript + Vite (NOT Next.js)
- **Styling**: Tailwind CSS with custom KRIVIO design system (emerald green `#0F5132`, gold `#D4AF37`)
- **Backend**: Dual backend architecture:
  - `server.ts` — Express/Node.js monolith (deployed on Vercel via esbuild)
  - `backend/` — FastAPI Python backend (PostgreSQL via SQLAlchemy)
- **Database**: PostgreSQL (local + Supabase)
- **Authentication**: Supabase Auth (Google OAuth) + custom JWT tokens synced to PostgreSQL
- **AI**: Google Gemini API (gemini-2.5-flash) for mentor chat, product generation, image analysis
- **Payments**: Razorpay integration
- **Deployment**: Vercel (frontend + serverless API)

---

## Key Architecture Decisions

### Authentication Flow
1. User clicks "Continue with Google" → Supabase OAuth redirect → Google consent → callback to Supabase
2. Supabase session detected via `onAuthStateChange` in `AuthContext.tsx`
3. User synced to PostgreSQL via `/api/auth/supabase-sync` endpoint
4. JWT token issued and stored in localStorage
5. **Important**: No Supabase mentions in user-facing UI. Button says "Continue with Google".

### Environment Variables (Custom Domain Ready)
- `VITE_SITE_URL` / `NEXT_PUBLIC_SITE_URL` — Application base URL for OAuth redirects
- `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key
- `getSiteUrl()` helper in `src/services/supabase.ts` dynamically resolves the site URL

### File Structure Highlights
- `src/services/supabase.ts` — Supabase client, OAuth helper, site URL resolver
- `src/services/api.ts` — All API calls (auth, products, AI mentor, images, marketplace, payments)
- `src/context/AuthContext.tsx` — Auth state management, session sync, Google OAuth flow
- `src/components/AuthModal.tsx` — Login/Register/Forgot password + Google OAuth button
- `src/components/Dashboard.tsx` — Main entrepreneur dashboard
- `src/components/ProductIdentityWizard.tsx` — AI product identity generation wizard
- `src/components/VoiceMentor.tsx` — Voice-first AI mentor chat
- `src/components/ImageStudio.tsx` — Product photography AI analysis
- `src/components/LandingPage.tsx` — Public landing page
- `src/components/Logo.tsx` — Official KRIVIO AI emblem (SVG)
- `server.ts` — Express backend with JWT auth, PostgreSQL queries, Gemini AI integration
- `backend/` — FastAPI Python backend (routes, models, schemas, CRUD, security)

### Design System
- **Primary Green**: `#0F5132` (dark) / `#34D399` (light/dark mode)
- **Gold Accent**: `#D4AF37`
- **Fonts**: Poppins (headings), Inter (body)
- **Theme**: Dark emerald green with gold accents, glassmorphism effects

### Supabase Project
- **Project ID**: `mvbpxcsyyasckzymjyjb`
- **Project URL**: `https://mvbpxcsyyasckzymjyjb.supabase.co`
- **OAuth Callback**: `https://mvbpxcsyyasckzymjyjb.supabase.co/auth/v1/callback`

---

## Important Rules
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or database passwords in frontend code
- Keep "Continue with Google" as the user-facing OAuth button text (never "Login with Supabase")
- Use environment variables for all URLs — no hardcoded production domains in components
- The `.env` file is gitignored; only `.env.example` is committed
- Supabase anon key is a public client-safe key — it's fine in frontend builds
