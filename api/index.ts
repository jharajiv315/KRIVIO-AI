import type { IncomingMessage, ServerResponse } from 'http';

let appPromise: Promise<any> | null = null;

async function resolveApp() {
  if (!appPromise) {
    appPromise = (async () => {
      // 1. In production / built environments, load prebuilt CJS bundle for zero resolution issues
      try {
        // @ts-ignore
        const prebuilt = await import('../dist/server.cjs');
        const candidate = prebuilt.default || prebuilt.app || prebuilt;
        if (candidate && (typeof candidate === 'function' || typeof candidate.handle === 'function')) {
          return candidate;
        }
      } catch (bundleErr: any) {
        console.warn('[Vercel API Gateway]: dist/server.cjs not available, trying source server:', bundleErr?.message || bundleErr);
      }

      // 2. Direct source server module fallback
      try {
        // @ts-ignore
        const source = await import('../server.js').catch(async () => import('../server'));
        return source.default || source.app || source;
      } catch (sourceErr: any) {
        console.error('[Vercel API Gateway]: Failed to import source server:', sourceErr?.message || sourceErr);
        throw sourceErr;
      }
    })();
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await resolveApp();
    if (typeof app === 'function') {
      return app(req, res);
    }
    if (app && typeof app.handle === 'function') {
      return app.handle(req, res);
    }
    throw new Error('Express application failed to initialize correctly');
  } catch (err: any) {
    console.error('[Vercel Serverless Invocation Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'KRIVIO AI service encountered a temporary startup issue. Your items are safe.',
          details: err?.message || String(err),
        })
      );
    }
  }
}
