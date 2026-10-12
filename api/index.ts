import type { IncomingMessage, ServerResponse } from 'http';
import app, { ensureDbInitialized } from '../server';

let dbInitPromise: Promise<void> | null = null;

function ensureDb() {
  if (!dbInitPromise && typeof ensureDbInitialized === 'function') {
    dbInitPromise = ensureDbInitialized().catch((err: any) => {
      console.warn('[Vercel Serverless DB Warmup Warning]:', err?.message || err);
    });
  }
  return dbInitPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || '';

  // 1. Production Health & Environment Diagnostic Route (Fast ping)
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

  // 2. Ensure DB tables initialized once per serverless instance
  try {
    ensureDb();
  } catch (dbErr) {
    console.warn('[Vercel Serverless DB Warmup Warning]:', dbErr);
  }

  // 3. Delegate to main Express application
  try {
    if (typeof app === 'function') {
      return (app as any)(req, res);
    } else if (app && typeof (app as any).handle === 'function') {
      return (app as any).handle(req, res);
    } else {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_APP_NOT_CALLABLE',
          message: 'The Express application instance could not be invoked.',
        })
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
        })
      );
    }
  }
}

