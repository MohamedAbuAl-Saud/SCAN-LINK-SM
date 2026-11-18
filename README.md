# Scan Link SM — Scan Smart. Stay Safe.

**Scan Link SM** is a deterministic, proprietary, bilingual (English / Arabic RTL) website and URL security intelligence platform developed by **Mohamed Abu AlSaud SM (AlQeyadah AlZaeem)**. It contains **zero AI/LLM models** and relies exclusively on verified network telemetry, static inspection, rule correlation, and live threat-intelligence feeds.

## Deterministic Security Modules
- **URL Structure & Obfuscation**: Checks HTTP/HTTPS syntax, raw IPs, embedded parameter payloads, Base64 strings, double encoding, double extensions, multi-tenant PaaS hosting, and link shorteners.
- **Domain Deception & Identity Intelligence**: Detects Unicode Confusables (Cyrillic/Greek/Latin skeleton mapping with codepoints), Punycode/IDN, typosquatting, subdomain spoofing, `@` authority masking, visible anchor vs actual href mismatches, and confirmed Open Redirect relays.
- **SSRF-Guarded Redirect Tracer**: Traces redirect chains hop-by-hop with pinned DNS resolution while validating every resolved IP against private IPv4/IPv6 ranges, localhost, and cloud metadata endpoints (`169.254.169.254`). Flags HTTPS-to-HTTP downgrades and cross-domain bounces.
- **Domain & DNS Intelligence**: Queries authoritative IANA RDAP bootstrap servers with port-43 WHOIS fallback, OS DNS + Cloudflare DoH (`DO=1` for DNSSEC validation & TTL Fast Flux checks), SOA/PTR records, DNS/CDN reverse-proxy detection, IP geolocation/ASN, SPF/DMARC posture, and PaaS tenant caveats.
- **SSL/TLS Inspection**: Direct TLS socket inspection verifying X.509 certificate trust chains, depth, key bits, signature algorithm, weak protocol/cipher detection, expiration, SAN coverage, and Certificate Transparency (`crt.sh`) records. Distinguishes encrypted transport from website trustworthiness.
- **Content, Phishing & Brand Impersonation**: Non-executing DOM parsing (`cheerio`) catching password inputs inside `<form>` AND unwrapped `<div>` containers, missing `<title>` + password fields, fake software-update alerts, popups, auto-redirects, obfuscated JS, and brand lookalikes.
- **Source Intelligence & Multi-Page Discovery**: Analyzes external scripts/styles/iframes, form targets, outdated libraries, and inspects linked public sub-pages on the same eTLD+1 domain.
- **File & Download Intelligence**: Bounded in-memory inspection (`512 KB` slice), SHA-256 hashing, and magic-byte vs declared MIME mismatch detection without writing or executing files.
- **External Threat Feeds & Multi-Signal Correlation**: Integrates VirusTotal v3 (URL/Domain/IP), URLhaus (`abuse.ch`), OpenPhish, AlienVault OTX, URLScan.io, Shodan InternetDB, and Feodo Tracker C2 with deterministic correlation rules (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `SAFE_INDICATORS`, `UNKNOWN`).
- **Screenshot Engine**: Supports live visual preview capture via the backend `ScreenshotNeo` gateway (`SCREENSHOTNEO_ACCESS_KEY`) with strict SSRF and sensitive-URL parameter guards.

## Quick Start
```bash
cp .env.example .env
npm install
npm run dev
```

## Production Build
```bash
npm run build
NODE_ENV=production npm start
```

## Documentation & Owner
- Architecture: `docs/ARCHITECTURE.md`
- API Contract: `docs/API.md`
- Threat Providers: `docs/PROVIDERS.md`
- Threat Model: `docs/THREAT_MODEL.md`
- Owner & Developer: **Mohamed Abu AlSaud SM** — [Telegram @A_Y_TR](https://t.me/A_Y_TR) · [mohamed-abualsaud.vercel.app](https://mohamed-abualsaud.vercel.app)

## Proprietary Notice
© 2026 Scan Link SM · Mohamed Abu AlSaud SM (AlQeyadah AlZaeem). All Rights Reserved. Closed-source proprietary software; unauthorized redistribution is prohibited.
