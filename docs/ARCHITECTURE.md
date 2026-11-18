# Scan Link SM — Architecture & Deployment Guide

## System Topology
1. **Frontend (`src/`)**: React 19 + TypeScript + Tailwind CSS SPA providing bilingual (English LTR / Arabic RTL) views, pure-black Dark Mode & Light Mode, URL path routing (`/`, `/scanner`, `/providers`, `/about`, `/privacy`, `/terms`, `/history`, `/report/:scanId`, plus 404/500 error views), interactive evidence analytics, Providers status dashboard, and consented local history. Contains zero secrets or AI models.
2. **Backend API & Deterministic Engine (`server.ts` + `server/`)**: Express server hardened with Helmet CSP, `express-rate-limit`, strict CORS, Origin/CSRF check on `POST /api/scans`, path-traversal & dotfile/backup blocking, Zod payload validation, atomic scan persistence (`.scanlink-data/`), and pinned-IP SSRF protection (`ssrfGuard.ts`). Streams stage completion events via Server-Sent Events (`/api/scans/:id/stream`).
3. **Visual Capture Gateway (`SCREENSHOTNEO_ACCESS_KEY`)**: Backend-only ScreenshotNeo integration capturing live website snapshots with SSRF and sensitive-parameter filtering.
4. **SEO & Indexing Controls**: Dynamic `/robots.txt` and `/sitemap.xml` for public pages (`/`, `/scanner`, `/providers`, `/about`, `/privacy`, `/terms`) paired with `X-Robots-Tag: noindex, nofollow` and `<meta name="robots" content="noindex, nofollow">` on private/session/API/404 routes.
