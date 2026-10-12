import type { IncomingMessage, ServerResponse } from 'http';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const nodeRequire = createRequire(import.meta.url);

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
let dbInitPromise: Promise<void> | null = null;

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
    if (dbInitPromise && !url.includes('/api/ping') && !url.endsWith('/ping')) {
      try {
        await dbInitPromise;
      } catch (err: any) {
        console.warn('[Vercel DB Init Await Warning]:', err?.message || err);
      }
    }
    if (typeof cachedApp === 'function') {
      return cachedApp(req, res);
    } else if (cachedApp && typeof cachedApp.handle === 'function') {
      return cachedApp.handle(req, res);
    }
  }

  // 3. Load Express application with deterministic multi-strategy loading
  try {
    let app: any = null;
    const internalAttempts: Record<string, any> = {};

    // Strategy 1: nodeRequire on candidate file paths
    const candidatePaths: string[] = [
      path.join(process.cwd(), 'api', 'server.cjs'),
      path.join(process.cwd(), 'server.cjs'),
      path.join(process.cwd(), 'dist', 'server.cjs'),
      path.resolve('api/server.cjs'),
    ];

    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      candidatePaths.unshift(path.join(currentDir, 'server.cjs'));
    } catch {}

    for (const candPath of candidatePaths) {
      if (app) break;
      try {
        if (fs.existsSync(candPath)) {
          const mod = nodeRequire(candPath);
          app = extractExpress(mod) || extractExpress(mod.default);
          if (app) {
            cachedApp = app;
            const dbInit = mod.ensureDbInitialized || mod.default?.ensureDbInitialized;
            if (typeof dbInit === 'function' && !dbInitPromise) {
              dbInitPromise = dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
            }
            break;
          }
        }
      } catch (err: any) {
        internalAttempts[`nodeRequire(${candPath})`] = { message: err?.message, name: err?.name };
      }
    }

    // Strategy 2: Co-located server.cjs inside api/ via dynamic import
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('./server.cjs');
        app = extractExpress(mod) || extractExpress(mod.default);
        if (app) {
          cachedApp = app;
          const dbInit = mod.ensureDbInitialized || mod.default?.ensureDbInitialized;
          if (typeof dbInit === 'function' && !dbInitPromise) {
            dbInitPromise = dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
          }
        }
      } catch (e: any) {
        internalAttempts['import(./server.cjs)'] = { message: e?.message, name: e?.name };
      }
    }

    // Strategy 3: Pre-bundled dist/server.cjs fallback
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../dist/server.cjs');
        app = extractExpress(mod) || extractExpress(mod.default);
        if (app) {
          cachedApp = app;
          const dbInit = mod.ensureDbInitialized || mod.default?.ensureDbInitialized;
          if (typeof dbInit === 'function' && !dbInitPromise) {
            dbInitPromise = dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
          }
        }
      } catch (e: any) {
        internalAttempts['import(../dist/server.cjs)'] = { message: e?.message, name: e?.name };
      }
    }

    // Strategy 4: Direct TypeScript source fallback
    if (!app) {
      try {
        // @ts-ignore
        const mod = await import('../server.js').catch(async () => import('../server'));
        app = extractExpress(mod) || extractExpress(mod.default);
        if (app) {
          cachedApp = app;
          const dbInit = (mod as any).ensureDbInitialized || (mod as any).default?.ensureDbInitialized;
          if (typeof dbInit === 'function' && !dbInitPromise) {
            dbInitPromise = dbInit().catch((e: any) => console.warn('[Vercel DB Init Warmup Warning]:', e?.message || e));
          }
        }
      } catch (e: any) {
        internalAttempts['import(../server)'] = { message: e?.message, name: e?.name };
      }
    }

    if (!app) {
      console.error('[Serverless Loader Resolution Failure]:', internalAttempts);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'SERVERLESS_MODULE_NOT_RESOLVED',
          message: 'Could not resolve server application instance in serverless runtime.',
          diagnostics: internalAttempts,
        })
      );
      return;
    }

    // Ensure database initialization finishes before processing live business requests
    if (dbInitPromise && !url.includes('/api/ping') && !url.endsWith('/ping')) {
      try {
        await dbInitPromise;
      } catch (err: any) {
        console.warn('[Vercel DB Init Await Warning]:', err?.message || err);
      }
    }

    if (typeof app === 'function') {
      return app(req, res);
    } else if (app && typeof app.handle === 'function') {
      return app.handle(req, res);
    }
  } catch (fatalErr: any) {
    console.error('[Serverless Fatal Error]:', fatalErr?.message || fatalErr, fatalErr?.stack);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected runtime error occurred.',
        })
      );
    }
  }
}
