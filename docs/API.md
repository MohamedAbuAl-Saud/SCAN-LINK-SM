# Scan Link SM — REST & SSE API Reference

## `GET /api/health`
Returns service health and active deterministic inspection capabilities.

## `GET /api/providers`
Returns configuration metadata and operational states (`active`, `configured`, `disabled`, `rate_limited`, `unavailable`, `auth_required`) plus last successful lookup timestamps without ever exposing secret values.

## `GET /api/screenshot/verify`
Performs a rate-limited backend verification against ScreenshotNeo using `https://example.com` without exposing `SCREENSHOTNEO_ACCESS_KEY`.

## `POST /api/scans`
Starts an asynchronous 12-stage deterministic scan job.

Request JSON:
```json
{
  "url": "https://example.com",
  "viewport": "desktop",
  "disabledProviders": []
}
```
- `viewport`: `"desktop" | "mobile" | "full_page"` (defaults to `"desktop"`)
- Returns HTTP `202` with `scanId`, `status`, `progressPercent`, and initial 12 `stages`.
- Rejects non-JSON requests (`415`), malformed/invalid payloads (`400`), unauthorized cross-origin submissions (`403`), and excessive requests (`429`).

## `GET /api/scans/:scanId`
Polls current `ScanJobState` and completed `ScanReport` (returns `400` on malformed UUID, `404` if not found).

## `GET /api/scans/:scanId/stream`
Server-Sent Events (`text/event-stream`) emitting live `ScanJobState` updates until `completed` or `failed`.
