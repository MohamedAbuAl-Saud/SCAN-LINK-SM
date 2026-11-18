import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';
import { getJobEmitter, getScanJob, startScanJob } from './server/scanManager.ts';
import { listConfiguredProviders } from './server/providers/threatIntelManager.ts';
import { testScreenshotNeoCapture } from './server/analyzers/screenshotEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

const startScanSchema = z.object({
  url: z.string().trim().min(1, 'URL is required').max(2048, 'URL exceeds 2048 character limit'),
  viewport: z.enum(['desktop', 'mobile', 'full_page']).optional().default('desktop'),
  disabledProviders: z.array(z.string().max(64)).max(20).optional().default([]),
});

const PUBLIC_SPA_ROUTES = new Set(['/', '/scanner', '/providers', '/about', '/privacy', '/terms']);

function isPrivateSpaRoute(cleanPath: string): boolean {
  return cleanPath === '/history' || /^\/report\/[0-9a-f-]{36}$/i.test(cleanPath);
}

function isKnownSpaRoute(cleanPath: string): boolean {
  return PUBLIC_SPA_ROUTES.has(cleanPath) || isPrivateSpaRoute(cleanPath);
}

function resolveBaseOrigin(req: express.Request): string {
  const configured = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configured && !configured.includes('your-domain.example')) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // fall back to request headers
    }
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(',')[0]?.trim() || req.protocol || 'https';
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost)?.split(',')[0]?.trim() || req.headers.host || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

function isOriginPermitted(
  origin: string,
  effectiveHost: string | undefined,
  allowedOrigins: string[]
): boolean {
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    return true;
  }
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  if (effectiveHost) {
    const cleanEffective = effectiveHost.split(':')[0].toLowerCase();
    const originHost = originUrl.host.toLowerCase();
    const originHostname = originUrl.hostname.toLowerCase();
    if (originHost === effectiveHost.toLowerCase() || originHostname === cleanEffective) {
      return true;
    }
  }

  if (
    process.env.NODE_ENV !== 'production' &&
    (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1')
  ) {
    return true;
  }

  return false;
}

function sanitizeUrlForAuditLog(rawUrl: string): string {
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    return `${u.protocol}//${u.hostname}${u.pathname}`;
  } catch {
    return '[invalid-url]';
  }
}

async function bootstrap() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Strict security headers via Helmet (compatible with HTTPS iframe previews & Vite dev)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          manifestSrc: ["'self'"],
          connectSrc: ["'self'", 'ws:', 'wss:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: null,
          frameAncestors: [
            "'self'",
            'https://*.google.com',
            'https://*.run.app',
            'https://*.googleusercontent.com',
            'https://*.usercontent.goog',
            'https://*.gstatic.com',
            'http://localhost:*',
            'http://127.0.0.1:*',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false,
    })
  );

  // Path Traversal, Hidden Dotfile (.env/.git/.scanlink-data), Database, Backup & Server Source Guard
  app.use((req, res, next) => {
    const rawUrl = req.originalUrl || req.url || '/';
    let decodedPath = req.path;
    try {
      decodedPath = decodeURIComponent(req.path);
    } catch {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.status(400).json({ error: 'Malformed URL encoding.' });
      return;
    }

    if (
      rawUrl.includes('\0') ||
      rawUrl.toLowerCase().includes('%00') ||
      decodedPath.includes('\\') ||
      rawUrl.toLowerCase().includes('%5c') ||
      rawUrl.toLowerCase().includes('%2e%2e') ||
      /(^|\/)\.\.($|\/)/.test(decodedPath)
    ) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.status(400).json({ error: 'Invalid path traversal sequence rejected.' });
      return;
    }

    const lowerPath = decodedPath.toLowerCase();
    const isViteDevBundle =
      process.env.NODE_ENV !== 'production' && lowerPath.startsWith('/node_modules/.vite/');

    const isDotSegment = lowerPath
      .split('/')
      .some((seg) => {
        if (!seg.startsWith('.') || seg.length <= 1) return false;
        if (seg === '.well-known') return false;
        if (isViteDevBundle && seg === '.vite') return false;
        return true;
      });

    const isBlockedServerOrBackupPath =
      /^\/(server\.ts|server\/|tests\/|docs\/|package\.json|package-lock\.json|bun\.lock|tsconfig\.json|vite\.config\.ts|metadata\.json|readme\.md|security\.md|data\/|backups?\/)/i.test(
        lowerPath
      ) ||
      /\.(db|sqlite|sqlite3|sql|bak|backup|old|orig|dump|log|tar|gz|zip|env|map)$/i.test(lowerPath);

    if (isDotSegment || isBlockedServerOrBackupPath) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.status(403).json({ error: 'Access to restricted configuration, source, or storage files is denied.' });
      return;
    }

    next();
  });

  // Strict Proxy-aware CORS policy
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const host = req.headers.host;
    const forwardedHost = req.headers['x-forwarded-host'];
    const effectiveHost = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || host;

    if (origin && isOriginPermitted(origin, effectiveHost, allowedOrigins)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // SEO: Dynamic robots.txt and sitemap.xml
  app.get('/robots.txt', (req, res) => {
    const origin = resolveBaseOrigin(req);
    const body = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /history',
      'Disallow: /report/',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
    res.status(200).type('text/plain; charset=utf-8').send(body);
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = resolveBaseOrigin(req);
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
      { loc: `${origin}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${origin}/scanner`, changefreq: 'daily', priority: '0.9' },
      { loc: `${origin}/providers`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${origin}/about`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${origin}/privacy`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${origin}/terms`, changefreq: 'monthly', priority: '0.5' },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
    res.status(200).type('application/xml; charset=utf-8').send(xml);
  });

  // Prevent search indexing of all /api endpoints
  app.use('/api', (_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use('/api', express.json({ limit: '64kb' }));

  const scanLimiter = rateLimit({
    windowMs: Number(process.env.SCAN_RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.SCAN_RATE_LIMIT_MAX || 20),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many scan requests from this client. Please wait before submitting another URL.',
    },
  });

  // Deterministic Engine Health & Capability Endpoint (no secrets, no AI)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Scan Link SM',
      engineMode: 'deterministic',
      timestamp: new Date().toISOString(),
      capabilities: {
        ssrfGuard: true,
        dnsAndRdap: true,
        tlsSocketInspection: true,
        staticHtmlAndBrandAnalysis: true,
        websiteSourceIntelligence: true,
        multiPageDiscovery: true,
        inMemoryFileHeaderCheck: true,
        screenshotNeoConfigured: Boolean(process.env.SCREENSHOTNEO_ACCESS_KEY),
      },
    });
  });

  // Threat Intelligence Provider Configuration & Operational Status (never exposes keys)
  app.get('/api/providers', (_req, res) => {
    res.json({
      providers: listConfiguredProviders(),
      screenshot: {
        provider: 'ScreenshotNeo',
        configured: Boolean(process.env.SCREENSHOTNEO_ACCESS_KEY),
      },
    });
  });

  // Safe backend verification of ScreenshotNeo infrastructure (rate-limited, never exposes keys)
  app.get('/api/screenshot/verify', scanLimiter, async (_req, res) => {
    try {
      const result = await testScreenshotNeoCapture('https://example.com');
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Start Asynchronous Deterministic Security Scan (with Origin/CSRF + JSON guard)
  app.post('/api/scans', scanLimiter, (req, res) => {
    const origin = req.headers.origin;
    const host = req.headers.host;
    const forwardedHost = req.headers['x-forwarded-host'];
    const effectiveHost = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || host;

    if (origin && !isOriginPermitted(origin, effectiveHost, allowedOrigins)) {
      res.status(403).json({ error: 'Cross-origin scan submission rejected by CSRF policy.' });
      return;
    }

    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Content-Type must be application/json.' });
      return;
    }

    const parsed = startScanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid scan request payload.',
      });
      return;
    }

    const job = startScanJob(parsed.data);
    console.info(
      `[ScanLinkSM] scan=${job.scanId} target=${sanitizeUrlForAuditLog(parsed.data.url)} viewport=${parsed.data.viewport}`
    );

    res.status(202).json({
      scanId: job.scanId,
      status: job.status,
      progressPercent: job.progressPercent,
      stages: job.stages,
    });
  });

  // Poll Scan Job / Report
  app.get('/api/scans/:scanId', (req, res) => {
    const scanId = String(req.params.scanId || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(scanId)) {
      res.status(400).json({ error: 'Invalid scanId format.' });
      return;
    }
    const job = getScanJob(scanId);
    if (!job) {
      res.status(404).json({ error: 'Scan report not found or expired from memory.' });
      return;
    }
    res.json(job);
  });

  // Server-Sent Events (SSE) for live pipeline updates
  app.get('/api/scans/:scanId/stream', (req, res) => {
    const scanId = String(req.params.scanId || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(scanId)) {
      res.status(400).json({ error: 'Invalid scanId format.' });
      return;
    }
    const job = getScanJob(scanId);
    const emitter = getJobEmitter(scanId);
    if (!job) {
      res.status(404).json({ error: 'Scan job not found.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSnapshot = (payload: typeof job) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      if (payload.status === 'completed' || payload.status === 'failed' || !emitter) {
        cleanup();
        res.end();
      }
    };

    const onUpdate = (updated: typeof job) => sendSnapshot(updated);
    const cleanup = () => {
      emitter?.off('update', onUpdate);
    };

    req.on('close', cleanup);
    emitter?.on('update', onUpdate);
    sendSnapshot(job);
  });

  app.use('/api', (_req, res) => {
    res.status(404).type('application/json').json({ error: 'API endpoint not found.' });
  });

  app.use(
    (
      err: Error & { status?: number; statusCode?: number; type?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (res.headersSent) return;
      const isMalformedJson = err.type === 'entity.parse.failed' || err instanceof SyntaxError;
      const isTooLarge = err.type === 'entity.too.large';
      const statusCode = isTooLarge ? 413 : isMalformedJson ? 400 : err.status || err.statusCode || 500;
      const message = isTooLarge
        ? 'Request payload exceeds 64KB limit.'
        : isMalformedJson
          ? 'Malformed JSON request payload.'
          : statusCode >= 500 && process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error';
      res.status(statusCode).type('application/json').json({ error: message });
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      if (req.method !== 'GET') {
        next();
        return;
      }

      const cleanPath = req.path.replace(/\/+$/, '') || '/';
      const isAssetOrViteInternal =
        cleanPath.startsWith('/@') ||
        cleanPath.startsWith('/src/') ||
        cleanPath.startsWith('/node_modules/') ||
        cleanPath.startsWith('/assets/') ||
        /\.[a-z0-9]{2,12}$/i.test(cleanPath);

      if (isAssetOrViteInternal) {
        next();
        return;
      }

      if (isPrivateSpaRoute(cleanPath)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        next();
        return;
      }

      if (!isKnownSpaRoute(cleanPath)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        if (req.accepts(['html', 'json']) === 'json') {
          res.status(404).json({ error: 'Page not found.' });
          return;
        }
        try {
          const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
          const html = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(404).type('text/html; charset=utf-8').send(html);
          return;
        } catch (err) {
          next(err);
          return;
        }
      }

      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        dotfiles: 'deny',
        index: false,
      })
    );

    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
        return;
      }
      const cleanPath = req.path.replace(/\/+$/, '') || '/';
      const indexFile = path.join(distPath, 'index.html');

      if (isPrivateSpaRoute(cleanPath)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        res.status(200).sendFile(indexFile);
        return;
      }

      if (isKnownSpaRoute(cleanPath)) {
        res.status(200).sendFile(indexFile);
        return;
      }

      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      if (req.accepts(['html', 'json']) === 'json') {
        res.status(404).json({ error: 'Page not found.' });
        return;
      }
      res.status(404).sendFile(indexFile);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scan Link SM deterministic server listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start Scan Link SM server:', err);
  process.exit(1);
});
