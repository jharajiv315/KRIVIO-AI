import type { IncomingMessage, ServerResponse } from 'http';

function extractApp(mod: any) {
  if (!mod) return null;
  if (typeof mod === 'function') return mod;
  if (mod.default && typeof mod.default === 'function') return mod.default;
  if (mod.default?.default && typeof mod.default.default === 'function') return mod.default.default;
  if (mod.app && typeof mod.app === 'function') return mod.app;
  if (mod.default?.app && typeof mod.default.app === 'function') return mod.default.app;
  return null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '';

  // 1. Production Health & Environment Diagnostic Route (No heavy imports needed)
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
        },
      })
    );
    return;
  }

  // 2. Delegate to main Express application with robust error isolation
  try {
    let app: any = null;
    const errors: Record<string, string> = {};

    // Primary: Co-located server.cjs inside api/ (guaranteed zero path resolution & ESM directory issues)
    try {
      // @ts-ignore
      const mod = await import('./server.cjs');
      app = extractApp(mod);
    } catch (e: any) {
      errors['./server.cjs'] = e?.message || String(e);
    }

    // Fallback 1: Pre-bundled CommonJS in dist/
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../dist/server.cjs');
        app = extractApp(mod);
      } catch (e: any) {
        errors['../dist/server.cjs'] = e?.message || String(e);
      }
    }

    // Fallback 2: Direct source TypeScript/ESM
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../server');
        app = extractApp(mod);
      } catch (e: any) {
        errors['../server'] = e?.message || String(e);
      }
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
          error: 'SERVERLESS_MODULE_NOT_RESOLVED',
          details: 'Could not extract Express application function in serverless runtime',
          resolutionErrors: errors,
        })
      );
      return;
    }
  } catch (fatalErr: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'SERVERLESS_INVOCATION_CRASH',
        message: fatalErr?.message || String(fatalErr),
        stack: fatalErr?.stack,
      })
    );
  }
}
