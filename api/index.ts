import type { IncomingMessage, ServerResponse } from 'http';

function extractExpress(candidate: any) {
  if (!candidate) return null;
  if (typeof candidate === 'function') return candidate;
  if (candidate.default && typeof candidate.default === 'function') return candidate.default;
  if (candidate.app && typeof candidate.app === 'function') return candidate.app;
  if (candidate.default?.app && typeof candidate.default.app === 'function') return candidate.default.app;
  if (candidate.default?.default && typeof candidate.default.default === 'function') return candidate.default.default;
  if (candidate.handle && typeof candidate.handle === 'function') return candidate;
  if (candidate.default?.handle && typeof candidate.default.handle === 'function') return candidate.default;
  return null;
}

let cachedApp: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '';

  // 1. Fast Diagnostic Route (Guaranteed to succeed independently of database or heavy dependencies)
  if (url.includes('/api/ping') || url.endsWith('/ping')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'ok',
        runtime: 'vercel-serverless',
        node: process.version,
        timestamp: new Date().toISOString(),
        env: {
          VERCEL: Boolean(process.env.VERCEL),
          HAS_DATABASE_URL: Boolean(process.env.DATABASE_URL),
          HAS_GEMINI_KEY: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
          HAS_SUPABASE_URL: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
          HAS_SUPABASE_KEY: Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
          HAS_RAZORPAY_KEY: Boolean(process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID),
          HAS_JWT_SECRET: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32),
        },
      })
    );
    return;
  }

  // 2. Return cached instance if available
  if (cachedApp) {
    if (typeof cachedApp === 'function') {
      return cachedApp(req, res);
    } else if (cachedApp && typeof cachedApp.handle === 'function') {
      return cachedApp.handle(req, res);
    }
  }

  // 3. Load Express application with full diagnostic capture
  try {
    let app: any = null;
    const attempts: Record<string, any> = {};

    // Attempt 1: Co-located server.cjs inside api/
    try {
      // @ts-ignore
      const mod = await import('./server.cjs');
      app = extractExpress(mod) || extractExpress(mod.default);
      if (app) {
        cachedApp = app;
        const dbInit = mod.ensureDbInitialized || mod.default?.ensureDbInitialized;
        if (typeof dbInit === 'function') {
          dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
        }
      }
    } catch (e: any) {
      attempts['./server.cjs'] = { message: e?.message, name: e?.name, stack: e?.stack };
    }

    // Attempt 2: Pre-bundled dist/server.cjs fallback
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../dist/server.cjs');
        app = extractExpress(mod) || extractExpress(mod.default);
        if (app) {
          cachedApp = app;
          const dbInit = mod.ensureDbInitialized || mod.default?.ensureDbInitialized;
          if (typeof dbInit === 'function') {
            dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
          }
        }
      } catch (e: any) {
        attempts['../dist/server.cjs'] = { message: e?.message, name: e?.name, stack: e?.stack };
      }
    }

    // Attempt 3: Direct TypeScript source fallback
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../server.js').catch(async () => import('../server'));
        app = extractExpress(mod) || extractExpress(mod.default);
        if (app) {
          cachedApp = app;
          const dbInit = (mod as any).ensureDbInitialized || (mod as any).default?.ensureDbInitialized;
          if (typeof dbInit === 'function') {
            dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
          }
        }
      } catch (e: any) {
        attempts['../server'] = { message: e?.message, name: e?.name, stack: e?.stack };
      }
    }

    if (!app) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_MODULE_NOT_RESOLVED',
          message: 'Could not resolve server application instance in serverless runtime.',
          attempts,
        }, null, 2)
      );
      return;
    }

    if (typeof app === 'function') {
      return app(req, res);
    } else if (app && typeof app.handle === 'function') {
      return app.handle(req, res);
    }
  } catch (fatalErr: any) {
    console.error('[Serverless Fatal Error]:', fatalErr?.message || fatalErr);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'INTERNAL_SERVER_ERROR',
          message: fatalErr?.message || 'An unexpected runtime error occurred.',
          stack: fatalErr?.stack,
        }, null, 2)
      );
    }
  }
}

