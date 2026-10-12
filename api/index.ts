import type { IncomingMessage, ServerResponse } from 'http';

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

  // 2. Load Express application with full error diagnostic capture
  try {
    let app: any = null;
    let loadErr: any = null;

    try {
      // @ts-ignore
      const mod = await import('../server');
      app = mod.default || mod.app || (typeof mod === 'function' ? mod : null);
      if (app && app.default && typeof app.default === 'function') {
        app = app.default;
      }
      if (mod.ensureDbInitialized && typeof mod.ensureDbInitialized === 'function') {
        mod.ensureDbInitialized().catch((e: any) => {
          console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e);
        });
      }
    } catch (e: any) {
      loadErr = { message: e?.message, name: e?.name, stack: e?.stack };
    }

    if (!app && loadErr) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVER_BOOT_CRASH',
          details: loadErr,
        }, null, 2)
      );
      return;
    }

    if (typeof app === 'function') {
      return app(req, res);
    } else if (app && typeof app.handle === 'function') {
      return app.handle(req, res);
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_APP_NOT_EXTRACTED',
          message: 'The Express application instance could not be extracted.',
          appType: typeof app,
        }, null, 2)
      );
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

