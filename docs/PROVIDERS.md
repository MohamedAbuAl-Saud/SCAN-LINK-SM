# Threat Intelligence Providers & Limits

| Provider | Key Required | Env Variable | Free Tier Notes |
| --- | --- | --- | --- |
| OpenPhish Community Feed | No | — | Live community phishing feed cached locally for 30 minutes |
| URLScan.io Public Search | Optional | `URLSCAN_API_KEY` | Public search endpoint; upstream rate limits apply without key |
| AlienVault OTX | Optional | `OTX_API_KEY` | Domain and IPv4 pulse lookup with validation allowlist filtering |
| Shodan InternetDB | No | — | Open public IP telemetry for exposed ports, CVEs, and threat tags |
| Feodo Tracker C2 (`abuse.ch`) | No | — | Live botnet Command & Control IP blocklist cached every 30 minutes |
| IANA / Registry RDAP & WHOIS | No | — | Direct registry RDAP lookup via IANA bootstrap, ARIN IP RDAP & port-43 WHOIS |
| Cloudflare DoH & OS DNS | No | — | Dual DNS validation via `1.1.1.1/dns-query` (`DO=1` DNSSEC/TTL) & Node DNS |
| Certificate Transparency (`crt.sh`) | No | — | Public CT log queries; sensitive to upstream timeouts |
| URLhaus (`abuse.ch`) | Yes | `URLHAUS_AUTH_KEY` | Free Auth-Key available from abuse.ch |
| VirusTotal API v3 | Yes | `VIRUSTOTAL_API_KEY` | Free personal tier: 4 requests/min, 500/day (URL / Domain / IP) |
| ScreenshotNeo Visual Gateway | Yes | `SCREENSHOTNEO_ACCESS_KEY` | Backend-only live website visual capture gateway |
