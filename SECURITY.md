# Security Architecture — Scan Link SM

## Built-In Security Boundaries
1. **Zero AI / Zero Fake Verdicts**: All risk scores and classifications (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `SAFE_INDICATORS`, `UNKNOWN`) are computed deterministically from verified telemetry. Missing or unavailable services never count as safe.
2. **SSRF & DNS Rebinding Guard**: `server/security/ssrfGuard.ts` allows only `http:` and `https:`, blocks loopback/private/link-local CIDRs and cloud metadata endpoints (`169.254.169.254`), pins resolved IPs per socket connection, and re-validates every redirect hop.
3. **Non-Executing Inspection**: HTML is parsed statically with Cheerio without JavaScript execution on the server. Downloaded file headers are hashed and inspected in memory only (never executed or persisted to disk).
4. **Backend-Only Secrets**: External provider keys (`VIRUSTOTAL_API_KEY`, `URLHAUS_AUTH_KEY`, `URLSCAN_API_KEY`, `OTX_API_KEY`, `SCREENSHOTNEO_ACCESS_KEY`) stay strictly in server environment variables and are never sent to browser code.
5. **Path & Storage Isolation**: Restricted dotfiles (`.env*`, `.git*`, `.scanlink-data/`), database/backup extensions, and server source files are blocked from HTTP access.
