import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSearch,
  Globe,
  Layers,
  Lock,
  Network,
  Pause,
  Play,
  RotateCcw,
  ScanSearch,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Waypoints,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Language } from '../types/scan';
import { UI_COPY } from '../i18n/translations';
import { cyberAudio } from '../utils/cyberAudio';

interface ProvidersViewProps {
  lang: Language;
  onNavigateScanner?: () => void;
}

type LayerTierId = 'client' | 'gateway' | 'network' | 'content' | 'verdict';

interface SiteLayerNode {
  id: string;
  tier: LayerTierId;
  code: string;
  xPercent: number;
  yPercent: number;
  title: { en: string; ar: string };
  summary: { en: string; ar: string };
  role: { en: string; ar: string };
  inputs: { en: string; ar: string };
  outputs: { en: string; ar: string };
  controls: { en: string[]; ar: string[] };
  upstreamIds: string[];
  downstreamIds: string[];
  iconKey:
    | 'globe'
    | 'database'
    | 'lock'
    | 'shield'
    | 'server'
    | 'search'
    | 'waypoints'
    | 'network'
    | 'file'
    | 'camera'
    | 'layers';
}

const TIERS: {
  id: LayerTierId;
  order: string;
  label: { en: string; ar: string };
  description: { en: string; ar: string };
}[] = [
  {
    id: 'client',
    order: '01',
    label: { en: 'Client & Privacy Edge', ar: 'طبقة الواجهة والخصوصية' },
    description: {
      en: 'Bilingual RTL/LTR workspace, consent control, and forensic report presentation.',
      ar: 'الواجهة التفاعلية ثنائية اللغة، وإدارة الموافقة، وعرض التقارير الجنائية.',
    },
  },
  {
    id: 'gateway',
    order: '02',
    label: { en: 'Backend Gateway & Guards', ar: 'بوابة الخادم وجدران الحماية' },
    description: {
      en: 'Path/CSRF hardening, strict SSRF boundary enforcement, SSE streaming, and atomic storage.',
      ar: 'حماية المسارات وCSRF، وحارس SSRF الصارم، والبث الحي والتخزين الذرّي.',
    },
  },
  {
    id: 'network',
    order: '03',
    label: { en: 'Network, DNS & Transport', ar: 'طبقات الشبكة والنطاق والتشفير' },
    description: {
      en: 'IDN deception, redirect chains, RDAP/DNSSEC lookup, and SSL/TLS certificate inspection.',
      ar: 'كشف خداع النطاقات، وتتبع التوجيه، وسجلات DNS/RDAP، وفحص شهادات SSL/TLS.',
    },
  },
  {
    id: 'content',
    order: '04',
    label: { en: 'Content, Source & Visual Sandbox', ar: 'المحتوى والمصدر والمعاينة البصرية' },
    description: {
      en: 'Static DOM/phishing detection, supply-chain scripts, binary signatures, and ScreenshotNeo.',
      ar: 'تحليل DOM الساكن، وكشف انتحال العلامات، وتواقيع الملفات، والتقاط اللقطات عبر ScreenshotNeo.',
    },
  },
  {
    id: 'verdict',
    order: '05',
    label: { en: 'Correlation & Verdict Core', ar: 'طبقة الارتباط والحكم الحتمي' },
    description: {
      en: 'Deterministic multi-signal correlation, risk scoring (0–100), and final report generation.',
      ar: 'الربط المنطقي متعدد الإشارات، واحتساب المخاطر الحتمية (0–100)، وتوليد التقرير.',
    },
  },
];

const SITE_LAYERS: SiteLayerNode[] = [
  {
    id: 'spa-shell',
    tier: 'client',
    code: 'L-01',
    xPercent: 11,
    yPercent: 28,
    iconKey: 'globe',
    title: { en: 'Interactive Web Interface', ar: 'الواجهة التفاعلية للمنصة' },
    summary: {
      en: 'Responsive React SPA with instant Arabic RTL / English LTR switching and Dark/Light themes.',
      ar: 'واجهة SPA سريعة الاستجابة تدعم العربية والإنجليزية والوضعين الداكن والفاتح.',
    },
    role: {
      en: 'Validates URL syntax locally, submits scan jobs via JSON POST, and renders 404/500 error boundaries cleanly.',
      ar: 'تتحقق مبدئياً من صيغة الرابط، وترسل مهام الفحص عبر JSON، وتعالج حالات الأخطاء 404/500 بسلاسة.',
    },
    inputs: { en: 'User URL, viewport choice, language & theme state', ar: 'الرابط المدخل، أبعاد المعاينة، اللغة والمظهر' },
    outputs: { en: 'Sanitized POST /api/scans request & route state', ar: 'طلب فحص منقّح إلى الخادم وإدارة المسارات' },
    controls: {
      en: ['No external API keys bundled in frontend JS', 'Strict CSP & XSS-safe React rendering', 'Client URL scheme pre-validation'],
      ar: ['عدم تضمين أي مفاتيح سرية في كود المتصفح', 'سياسة CSP صارمة ومنع حقن XSS', 'تحقق مبدئي من بروتوكول الرابط قبل الإرسال'],
    },
    upstreamIds: [],
    downstreamIds: ['http-hardening', 'consent-history'],
  },
  {
    id: 'consent-history',
    tier: 'client',
    code: 'L-02',
    xPercent: 11,
    yPercent: 72,
    iconKey: 'database',
    title: { en: 'Consent & Local History Vault', ar: 'حارس الخصوصية وسجل الفحوصات' },
    summary: {
      en: 'Opt-in browser history storage with privacy controls and noindex search protection.',
      ar: 'حفظ اختياري لسجل الفحوصات في المتصفح مع حماية الصفحات الخاصة من الأرشفة.',
    },
    role: {
      en: 'Stores recent scan snapshots locally only after explicit user consent and blocks search crawlers from private routes.',
      ar: 'يحفظ التقارير محلياً بعد موافقة صريحة فقط، ويمنع محركات البحث من فهرسة السجل والتقارير.',
    },
    inputs: { en: 'Completed ScanReport JSON & user consent preference', ar: 'التقرير المكتمل وتفضيل موافقة المستخدم' },
    outputs: { en: 'Local scan history list & report deep-link replay', ar: 'قائمة السجل المحلي وإعادة فتح التقارير' },
    controls: {
      en: ['noindex, nofollow on /history and /report/*', 'One-click full local history purge', 'Zero third-party tracking cookies'],
      ar: ['وسم noindex, nofollow لصفحات السجل والتقارير', 'حذف فوري وكامل للسجل المحلي', 'انعدام ملفات التتبع الإعلانية'],
    },
    upstreamIds: ['spa-shell', 'scoring-verdict'],
    downstreamIds: [],
  },
  {
    id: 'http-hardening',
    tier: 'gateway',
    code: 'L-03',
    xPercent: 31,
    yPercent: 20,
    iconKey: 'lock',
    title: { en: 'Edge Security & Path Guard', ar: 'جدار المسارات والأمان الطرفي' },
    summary: {
      en: 'Blocks Path Traversal, dotfiles (.env), backups, DB files, bad Origins, and enforces rate limits.',
      ar: 'يصد محاولات اجتياز المسار والوصول إلى ملفات .env وقواعد البيانات ويفعل CORS/Rate-Limit.',
    },
    role: {
      en: 'Inspects every incoming HTTP request before static or API routing to reject malformed payloads and CSRF origins.',
      ar: 'يفحص كل طلب وارد قبل توجيهه لحظر المسارات المحظورة وطلبات CSRF وتجاوز الحد المسموح.',
    },
    inputs: { en: 'Raw HTTP headers, Origin, method, path, JSON body', ar: 'ترويسات HTTP والأصل والمسار وحمولة JSON' },
    outputs: { en: 'Verified request or HTTP 400 / 403 / 413 / 415 / 429', ar: 'طلب موثق أو رفض أمني برمز الحالة المناسب' },
    controls: {
      en: ['Helmet CSP & X-Content-Type-Options: nosniff', 'Exact Origin host equality CSRF check', '64KB JSON limit & 403 block for .env/DB/source files'],
      ar: ['ترويسات Helmet CSP ومنع التخمين nosniff', 'مطابقة تامة لاسم النطاق لمنع CSRF', 'حد 64KB للـ JSON وحظر تام لملفات .env والمصدر'],
    },
    upstreamIds: ['spa-shell'],
    downstreamIds: ['ssrf-guard', 'sse-store'],
  },
  {
    id: 'ssrf-guard',
    tier: 'gateway',
    code: 'L-04',
    xPercent: 31,
    yPercent: 50,
    iconKey: 'shield',
    title: { en: 'SSRF & DNS Rebinding Boundary', ar: 'حارس SSRF وعزل الشبكة الداخلية' },
    summary: {
      en: 'Blocks localhost, RFC1918, CGNAT, cloud metadata (169.254.169.254), and obfuscated IPv6.',
      ar: 'يحظر العناوين المحلية، والشبكات الخاصة، ونقاط بيانات السحابة، وعناوين IPv6 المموّهة.',
    },
    role: {
      en: 'Resolves target hostnames before every network hop and blocks internal IPs to prevent server-side request forgery.',
      ar: 'يتحقق من عنوان IP الحقيقي قبل كل اتصال شبكي لمنع استغلال الخادم في الوصول للشبكة الداخلية.',
    },
    inputs: { en: 'Normalized target URL & DNS resolution results', ar: 'الرابط المطبّع ونتائج استعلام DNS' },
    outputs: { en: 'Pinned public IP target or immediate SSRF Guard block', ar: 'عنوان IP عام موثق أو حظر فوري بالرفض' },
    controls: {
      en: ['Blocks IPv4/IPv6 loopback, ULA, NAT64 & ::0:ffff:*', 'Re-validates every HTTP redirect hop', 'Enforces HTTP/HTTPS schemes only'],
      ar: ['حظر Loopback وULA وNAT64 و::0:ffff:*', 'إعادة فحص كل قفزة إعادة توجيه', 'السماح ببروتوكول HTTP/HTTPS فقط'],
    },
    upstreamIds: ['http-hardening'],
    downstreamIds: ['url-deception', 'redirect-tracer', 'domain-dns', 'tls-inspector', 'screenshot-neo'],
  },
  {
    id: 'sse-store',
    tier: 'gateway',
    code: 'L-05',
    xPercent: 31,
    yPercent: 80,
    iconKey: 'server',
    title: { en: 'Pipeline Orchestrator & Disk Store', ar: 'منسّق المهام والتخزين الذرّي' },
    summary: {
      en: 'Drives the 12-stage live SSE pipeline and persists finished reports safely in .scanlink-data.',
      ar: 'يدير خط الفحص ذو الـ 12 مرحلة بالبث الحي SSE ويحفظ التقارير بأمان عبر إعادة التشغيل.',
    },
    role: {
      en: 'Emits stage-by-stage progress over Server-Sent Events and writes atomic JSON snapshots with strict 0600 permissions.',
      ar: 'يبث تقدم كل مرحلة فورياً عبر SSE ويحفظ النتائج بكتابة ذرية آمنة دون فقدان البيانات.',
    },
    inputs: { en: 'Stage completion events & completed ScanReport', ar: 'أحداث إتمام المراحل والتقرير النهائي' },
    outputs: { en: 'SSE live stream & persisted /api/scans/:scanId JSON', ar: 'بث SSE حي واسترجاع مستمر للتقارير' },
    controls: {
      en: ['UUID format enforcement on :scanId routes', 'Cache-Control: no-store on all API responses', '0700/0600 atomic write protected from HTTP access'],
      ar: ['التحقق من صيغة UUID لمعرّف الفحص', 'تعطيل التخزين المؤقت لاستجابات API', 'تخزين محمي لا يمكن الوصول إليه عبر الويب'],
    },
    upstreamIds: ['http-hardening', 'scoring-verdict'],
    downstreamIds: [],
  },
  {
    id: 'url-deception',
    tier: 'network',
    code: 'L-06',
    xPercent: 52,
    yPercent: 16,
    iconKey: 'search',
    title: { en: 'URL & IDN Deception Analyzer', ar: 'محلل بنية الرابط وخداع النطاق' },
    summary: {
      en: 'Detects Cyrillic homographs, Punycode skeletons, Bidi overrides, @ masking & typosquatting.',
      ar: 'يكشف الحروف المتشابهة بصرياً، وPunycode، ورموز الاتجاه المخفية، وانتحال النطاقات الفرعية.',
    },
    role: {
      en: 'Analyzes lexical structure, unicode confusables, open-redirect query parameters, and brand-impersonating subdomains.',
      ar: 'يحلل البنية اللغوية للرابط والرموز المضللة ومعاملات التوجيه المفتوح وانتحال النطاقات.',
    },
    inputs: { en: 'Submitted URL & final destination host', ar: 'الرابط الأصلي واسم المضيف النهائي' },
    outputs: { en: 'Deception telemetry & unicode confusable evidence', ar: 'بيانات الخداع والأدلة الحرفية المكتشفة' },
    controls: {
      en: ['UTS-39 style confusable character skeleton mapping', 'Zero-width & Bidi character detection', 'No network execution required'],
      ar: ['رسم الهيكل البصري للحروف المتشابهة', 'رصد الرموز الصفرية وعكس الاتجاه Bidi', 'تحليل حتمي ساكن عالي الدقة'],
    },
    upstreamIds: ['ssrf-guard'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'redirect-tracer',
    tier: 'network',
    code: 'L-07',
    xPercent: 52,
    yPercent: 39,
    iconKey: 'waypoints',
    title: { en: 'Safe Redirect Chain Tracer', ar: 'متتبع سلاسل إعادة التوجيه' },
    summary: {
      en: 'Follows HTTP 3xx, meta-refresh, and static JS redirects with SSRF checks on every hop.',
      ar: 'يتتبع تحويلات HTTP 3xx وMeta وJS الساكن مع فحص SSRF عند كل انتقال.',
    },
    role: {
      en: 'Traces cross-domain jumps, HTTPS-to-HTTP downgrades, URL shorteners, and confirmed open-redirect relays.',
      ar: 'يرصد الانتقال بين النطاقات وخفض التشفير من HTTPS إلى HTTP ومختصرات الروابط.',
    },
    inputs: { en: 'SSRF-validated URL & raw HTTP redirect headers', ar: 'الرابط المفحوص وترويسات التوجيه الأولية' },
    outputs: { en: 'Full hop-by-hop telemetry & final response buffer', ar: 'سجل القفزات الكامل ومحتوى الوجهة النهائية' },
    controls: {
      en: ['Hop limit & timeout guard against redirect loops', 'SSRF re-validation per Location header', 'Bounded response byte cap'],
      ar: ['حد أقصى لعدد القفزات لمنع الحلقات اللانهائية', 'فحص SSRF قبل كل انتقال جديد', 'تحديد سقف حجم الاستجابة'],
    },
    upstreamIds: ['ssrf-guard'],
    downstreamIds: ['content-phishing', 'source-pages', 'file-analyzer', 'scoring-verdict'],
  },
  {
    id: 'domain-dns',
    tier: 'network',
    code: 'L-08',
    xPercent: 52,
    yPercent: 62,
    iconKey: 'network',
    title: { en: 'Domain RDAP & DNS Intelligence', ar: 'استخبارات النطاق وDNS وRDAP' },
    summary: {
      en: 'Inspects domain age, registrar, DoH records, DNSSEC validation, SPF/DMARC & Fast-Flux TTL.',
      ar: 'يفحص عمر النطاق والمسجل وسجلات DoH وتوثيق DNSSEC وSPF/DMARC ومؤشرات Fast-Flux.',
    },
    role: {
      en: 'Correlates registration recency, multi-tenant PaaS hosting, and DNS health without trusting spoofed headers.',
      ar: 'يربط حداثة تسجيل النطاق بالاستضافة السحابية المشتركة وصحة سجلات البريد والشبكة.',
    },
    inputs: { en: 'Registrable eTLD+1 domain & resolved IP', ar: 'النطاق المسجل وعنوان IP المحلول' },
    outputs: { en: 'Domain age, ASN/country, DNS & DNSSEC profile', ar: 'ملف عمر النطاق والشبكة وتكوين DNS' },
    controls: {
      en: ['DNS-over-HTTPS verification', 'Newly registered domain high-risk flagging', 'Independent availability status'],
      ar: ['تحقق مستقل عبر DNS-over-HTTPS', 'رفع مستوى التنبيه للنطاقات حديثة الإنشاء', 'إبلاغ صادق عند تعذر السجلات'],
    },
    upstreamIds: ['ssrf-guard'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'tls-inspector',
    tier: 'network',
    code: 'L-09',
    xPercent: 52,
    yPercent: 85,
    iconKey: 'lock',
    title: { en: 'SSL/TLS & CT Log Inspector', ar: 'فاحص شهادات SSL/TLS والشفافية' },
    summary: {
      en: 'Inspects TLS protocol, cipher strength, certificate trust chain, SANs & crt.sh transparency logs.',
      ar: 'يفحص إصدار TLS وقوة التشفير وسلسلة الثقة وقائمة SANs وسجلات الشفافية crt.sh.',
    },
    role: {
      en: 'Connects via controlled TLS socket to detect expired, self-signed, mismatched, or weak-cipher certificates.',
      ar: 'يفحص الشهادة مباشرة لاكتشاف الشهادات المنتهية أو الموقعة ذاتياً أو الضعيفة.',
    },
    inputs: { en: 'Target HTTPS host & port 443 socket', ar: 'اسم المضيف النهائي ومنفذ التشفير' },
    outputs: { en: 'Certificate chain, cipher audit & CT history', ar: 'تفاصيل الشهادة والتشفير وسجلات الإصدار' },
    controls: {
      en: ['Strict socket timeout enforcement', 'Distinguishes valid HTTPS from site legitimacy', 'Weak TLS 1.0/1.1 detection'],
      ar: ['مهلة اتصال صارمة للمقبس', 'عدم الخلط بين وجود HTTPS وسلامة المحتوى', 'رصد بروتوكولات التشفير القديمة'],
    },
    upstreamIds: ['ssrf-guard'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'content-phishing',
    tier: 'content',
    code: 'L-10',
    xPercent: 72,
    yPercent: 18,
    iconKey: 'shield',
    title: { en: 'Static DOM, Phishing & Brand Engine', ar: 'تحليل المحتوى وكشف التصيد والانتحال' },
    summary: {
      en: 'Parses HTML without execution to flag cross-origin password forms, fake alerts & brand impersonation.',
      ar: 'يحلل HTML دون تنفيذ لكشف نماذج سرقة كلمات المرور والتحذيرات المزيفة وانتحال العلامات.',
    },
    role: {
      en: 'Uses Cheerio static parsing to locate credential harvesters, hidden elements, brand lookalikes, and lure text.',
      ar: 'يستخرج حقول الإدخال الحساسة والعناصر المخفية والنصوص الخادعة دون تشغيل أي سكربت.',
    },
    inputs: { en: 'Final destination HTML buffer & page headers', ar: 'كود HTML النهائي وترويسات الصفحة' },
    outputs: { en: 'Phishing indicators, brand match & DOM risk weight', ar: 'مؤشرات التصيد وانتحال العلامة ووزن المخاطرة' },
    controls: {
      en: ['Zero headless browser JS execution in DOM analyzer', 'Sanitized favicon SVG extraction', 'Visible link vs href mismatch check'],
      ar: ['عدم تنفيذ جافاسكربت الصفحة محلياً', 'تعقيم أيقونات SVG من أي أكواد ضارة', 'كشف تعارض النص الظاهر مع الوجهة الفعلية'],
    },
    upstreamIds: ['redirect-tracer'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'source-pages',
    tier: 'content',
    code: 'L-11',
    xPercent: 72,
    yPercent: 41,
    iconKey: 'layers',
    title: { en: 'Source Intelligence & Page Discovery', ar: 'استخبارات المصدر واستكشاف الصفحات' },
    summary: {
      en: 'Audits inline/external scripts, supply-chain hosts, security headers & key internal pages.',
      ar: 'يدقق السكربتات ومصادر التوريد الخارجية وترويسات الأمان والصفحات الداخلية الحساسة.',
    },
    role: {
      en: 'Inspects third-party script dependencies, CSP/HSTS presence, and linked login/policy pages safely.',
      ar: 'يفحص الاعتماديات البرمجية الخارجية وترويسات الحماية وروابط صفحات الدخول والسياسات.',
    },
    inputs: { en: 'HTML source & discovered same-origin routes', ar: 'شيفرة المصدر والروابط الداخلية المكتشفة' },
    outputs: { en: 'Supply-chain external hosts & multi-page findings', ar: 'قائمة نطاقات التوريد ونتائج الصفحات الفرعية' },
    controls: {
      en: ['SSRF guard applied on every discovered link', 'Hard cap on crawled subpage count & depth', 'No form submission or state mutation'],
      ar: ['تطبيق حارس SSRF على كل صفحة فرعية', 'سقف صارم لعدد وعمق الصفحات المفحوصة', 'قراءة فقط دون إرسال أي نماذج'],
    },
    upstreamIds: ['redirect-tracer'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'file-analyzer',
    tier: 'content',
    code: 'L-12',
    xPercent: 72,
    yPercent: 64,
    iconKey: 'file',
    title: { en: 'In-Memory File & Signature Inspector', ar: 'فاحص الملفات والتوقيع الثنائي' },
    summary: {
      en: 'Reads leading magic bytes in RAM to catch executables (MZ/ELF/Mach-O) disguised as PDFs or docs.',
      ar: 'يفحص البايتات الأولى في الذاكرة لاكتشاف الملفات التنفيذية المتخفية بصيغ PDF أو مستندات.',
    },
    role: {
      en: 'Computes SHA-256 hashes and compares MIME headers against binary signatures without saving or executing files.',
      ar: 'يحسب بصمة SHA-256 ويطابق نوع الملف المعلن مع التوقيع الفعلي دون تخزين أو تشغيل.',
    },
    inputs: { en: 'Download response bytes & Content-Disposition links', ar: 'بايتات التحميل وروابط الملفات المباشرة' },
    outputs: { en: 'MIME mismatch alerts, SHA-256 & binary classification', ar: 'تنبيهات تزوير الامتداد وبصمة SHA-256' },
    controls: {
      en: ['Strictly in-memory inspection (zero disk write)', 'Zero binary execution sandbox guarantee', 'Flags double extensions & executable lures'],
      ar: ['فحص في الذاكرة فقط دون كتابة على القرص', 'ضمان عدم تشغيل أي ملف تنفيذي', 'كشف الامتدادات المزدوجة الخادعة'],
    },
    upstreamIds: ['redirect-tracer'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'screenshot-neo',
    tier: 'content',
    code: 'L-13',
    xPercent: 72,
    yPercent: 87,
    iconKey: 'camera',
    title: { en: 'ScreenshotNeo Visual Capture Gateway', ar: 'بوابة ScreenshotNeo للتصوير المعزول' },
    summary: {
      en: 'Backend-only remote WebP/PNG capture supporting Desktop, Mobile, and Full-Page modes.',
      ar: 'التقاط صور حية للمواقع عبر الخادم بصيغة WebP/PNG مع دعم سطح المكتب والجوال والصفحة الكاملة.',
    },
    role: {
      en: 'Captures live visual evidence safely via ScreenshotNeo v1 without exposing your browser or leaking API keys.',
      ar: 'يلتقط معاينة بصرية آمنة للموقع عبر الخادم دون زيارة الرابط من جهازك أو كشف مفتاح الخدمة.',
    },
    inputs: { en: 'SSRF-verified URL (scrubbed of credentials) & viewport mode', ar: 'رابط عام خالٍ من الأسرار + أبعاد الشاشة' },
    outputs: { en: 'Base64 WebP/PNG snapshot rendered inside Security Report', ar: 'صورة معاينة حية مدمجة في التقرير الأمني' },
    controls: {
      en: ['Blocks URLs carrying tokens or passwords', 'SCREENSHOTNEO_ACCESS_KEY isolated on backend .env', 'Validates image MIME & 6MB size cap'],
      ar: ['منع إرسال روابط تحوي رموز دخول أو كلمات مرور', 'عزل مفتاح SCREENSHOTNEO_ACCESS_KEY في الخادم فقط', 'التحقق من نوع الصورة والحد الأقصى للحجم'],
    },
    upstreamIds: ['ssrf-guard'],
    downstreamIds: ['scoring-verdict'],
  },
  {
    id: 'scoring-verdict',
    tier: 'verdict',
    code: 'L-14',
    xPercent: 91,
    yPercent: 50,
    iconKey: 'layers',
    title: { en: 'Deterministic Correlation & Verdict Core', ar: 'محرك الارتباط والتقييم الحتمي' },
    summary: {
      en: 'Correlates all findings + threat intelligence feeds to compute transparent Risk Score & Verdict.',
      ar: 'يربط مخرجات كل الطبقات مع الاستخبارات الخارجية لإصدار درجة المخاطر (0–100) والحكم النهائي.',
    },
    role: {
      en: 'Applies deterministic anti-contradiction rules (never trusting HTTPS alone) and downgrades incomplete data to UNKNOWN.',
      ar: 'يطبق قواعد ارتباط حتمية تمنع التقييم الإيجابي عند غياب الأدلة أو تعارض المؤشرات.',
    },
    inputs: { en: 'All 13 layer findings + external threat feed telemetry', ar: 'نتائج الطبقات الـ 13 ومؤشرات التهديدات' },
    outputs: { en: 'Final Classification, Confidence %, Top Reasons & Report', ar: 'التصنيف النهائي، نسبة الموثوقية، والأدلة الكاملة' },
    controls: {
      en: ['Unconfigured/failed feeds never treated as clean', 'Unreachable DOM blocks SAFE_INDICATORS verdict', 'Zero generative AI hallucinations'],
      ar: ['المصادر غير المتاحة لا تُحتسب دليلاً على الأمان', 'تعذر جلب الصفحة يمنع إعطاء تصنيف آمن', 'تقييم منطقي حتمي 100% دون تخمين'],
    },
    upstreamIds: [
      'url-deception',
      'redirect-tracer',
      'domain-dns',
      'tls-inspector',
      'content-phishing',
      'source-pages',
      'file-analyzer',
      'screenshot-neo',
    ],
    downstreamIds: ['sse-store', 'consent-history'],
  },
];

const EDGES: { from: string; to: string }[] = [
  { from: 'spa-shell', to: 'http-hardening' },
  { from: 'http-hardening', to: 'ssrf-guard' },
  { from: 'http-hardening', to: 'sse-store' },
  { from: 'ssrf-guard', to: 'url-deception' },
  { from: 'ssrf-guard', to: 'redirect-tracer' },
  { from: 'ssrf-guard', to: 'domain-dns' },
  { from: 'ssrf-guard', to: 'tls-inspector' },
  { from: 'ssrf-guard', to: 'screenshot-neo' },
  { from: 'redirect-tracer', to: 'content-phishing' },
  { from: 'redirect-tracer', to: 'source-pages' },
  { from: 'redirect-tracer', to: 'file-analyzer' },
  { from: 'url-deception', to: 'scoring-verdict' },
  { from: 'redirect-tracer', to: 'scoring-verdict' },
  { from: 'domain-dns', to: 'scoring-verdict' },
  { from: 'tls-inspector', to: 'scoring-verdict' },
  { from: 'content-phishing', to: 'scoring-verdict' },
  { from: 'source-pages', to: 'scoring-verdict' },
  { from: 'file-analyzer', to: 'scoring-verdict' },
  { from: 'screenshot-neo', to: 'scoring-verdict' },
  { from: 'scoring-verdict', to: 'sse-store' },
  { from: 'scoring-verdict', to: 'consent-history' },
];

const TRACE_SEQUENCE = [
  'spa-shell',
  'http-hardening',
  'ssrf-guard',
  'url-deception',
  'redirect-tracer',
  'domain-dns',
  'tls-inspector',
  'content-phishing',
  'source-pages',
  'file-analyzer',
  'screenshot-neo',
  'scoring-verdict',
  'sse-store',
  'consent-history',
];

function LayerIcon({ kind, className }: { kind: SiteLayerNode['iconKey']; className?: string }) {
  switch (kind) {
    case 'globe':
      return <Globe className={className} aria-hidden="true" />;
    case 'database':
      return <Database className={className} aria-hidden="true" />;
    case 'lock':
      return <Lock className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'server':
      return <Server className={className} aria-hidden="true" />;
    case 'search':
      return <ScanSearch className={className} aria-hidden="true" />;
    case 'waypoints':
      return <Waypoints className={className} aria-hidden="true" />;
    case 'network':
      return <Network className={className} aria-hidden="true" />;
    case 'file':
      return <FileSearch className={className} aria-hidden="true" />;
    case 'camera':
      return <Camera className={className} aria-hidden="true" />;
    default:
      return <Layers className={className} aria-hidden="true" />;
  }
}

export function ProvidersView({ lang, onNavigateScanner }: ProvidersViewProps) {
  const [selectedId, setSelectedId] = useState<string>('ssrf-guard');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<LayerTierId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [traceActive, setTraceActive] = useState(false);
  const [traceIndex, setTraceIndex] = useState(0);

  const focusedId = hoveredId || selectedId;
  const selectedLayer = useMemo(
    () => SITE_LAYERS.find((l) => l.id === selectedId) || SITE_LAYERS[0],
    [selectedId]
  );

  // Step-by-step live trace player
  useEffect(() => {
    if (!traceActive) return;
    const timer = window.setInterval(() => {
      setTraceIndex((prev) => {
        const next = prev + 1;
        if (next >= TRACE_SEQUENCE.length) {
          setTraceActive(false);
          return prev;
        }
        setSelectedId(TRACE_SEQUENCE[next]);
        return next;
      });
    }, 1150);
    return () => window.clearInterval(timer);
  }, [traceActive]);

  const matchingIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return new Set(
      SITE_LAYERS.filter((layer) => {
        if (tierFilter !== 'all' && layer.tier !== tierFilter) return false;
        if (!q) return true;
        return (
          layer.title.en.toLowerCase().includes(q) ||
          layer.title.ar.toLowerCase().includes(q) ||
          layer.summary.en.toLowerCase().includes(q) ||
          layer.summary.ar.toLowerCase().includes(q) ||
          layer.code.toLowerCase().includes(q)
        );
      }).map((l) => l.id)
    );
  }, [tierFilter, searchQuery]);

  const connectedSet = useMemo(() => {
    const target = SITE_LAYERS.find((l) => l.id === focusedId);
    const set = new Set<string>();
    if (!target) return set;
    set.add(target.id);
    for (const u of target.upstreamIds) set.add(u);
    for (const d of target.downstreamIds) set.add(d);
    return set;
  }, [focusedId]);

  const handleSelectLayer = (id: string) => {
    cyberAudio.playRefresh();
    setSelectedId(id);
    const idx = TRACE_SEQUENCE.indexOf(id);
    if (idx !== -1) setTraceIndex(idx);
  };

  const handleStartTrace = () => {
    cyberAudio.playRefresh();
    if (traceActive) {
      setTraceActive(false);
      return;
    }
    setTierFilter('all');
    setSearchQuery('');
    const startIdx = traceIndex >= TRACE_SEQUENCE.length - 1 ? 0 : traceIndex;
    setTraceIndex(startIdx);
    setSelectedId(TRACE_SEQUENCE[startIdx]);
    setTraceActive(true);
  };

  const handleStepTrace = () => {
    cyberAudio.playRefresh();
    setTraceActive(false);
    setTierFilter('all');
    const next = (traceIndex + 1) % TRACE_SEQUENCE.length;
    setTraceIndex(next);
    setSelectedId(TRACE_SEQUENCE[next]);
  };

  const handleResetView = () => {
    cyberAudio.playRefresh();
    setTraceActive(false);
    setTraceIndex(0);
    setTierFilter('all');
    setSearchQuery('');
    setZoom(1);
    setSelectedId('ssrf-guard');
  };

  const layerById = useMemo(() => {
    const map = new Map<string, SiteLayerNode>();
    for (const l of SITE_LAYERS) map.set(l.id, l);
    return map;
  }, []);

  const selectedTier = TIERS.find((t) => t.id === selectedLayer.tier);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF263F]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {lang === 'ar' ? 'الخريطة المعمارية التفاعلية · 5 مستويات · 14 طبقة' : 'Interactive Architecture Map · 5 Tiers · 14 Layers'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-950 dark:text-white sm:text-3xl text-balance">
            {UI_COPY.providersPage.title[lang]}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {UI_COPY.providersPage.subtitle[lang]}
          </p>
        </div>

        {/* Interactive Flow Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartTrace}
            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263F] ${
              traceActive
                ? 'border border-[#FF263F] bg-[#FF263F]/10 text-[#FF263F]'
                : 'bg-[#FF263F] text-white hover:bg-[#E01E35]'
            }`}
          >
            {traceActive ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === 'ar' ? 'إيقاف المحاكاة' : 'Pause Trace'}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{lang === 'ar' ? 'تتبّع مسار الفحص' : 'Trace Request Flow'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepTrace}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-zinc-800 hover:border-[#FF263F]/60 hover:text-[#FF263F] dark:border-[#202020] dark:bg-[#0D0D0D] dark:text-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263F]"
          >
            <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              {lang === 'ar' ? `الخطوة (${traceIndex + 1}/${TRACE_SEQUENCE.length})` : `Step (${traceIndex + 1}/${TRACE_SEQUENCE.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-zinc-800 hover:border-[#FF263F]/60 hover:text-[#FF263F] dark:border-[#202020] dark:bg-[#0D0D0D] dark:text-zinc-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263F]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{UI_COPY.providersPage.refresh[lang]}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs + Search + Zoom Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F7F7] p-3 dark:border-[#202020] dark:bg-[#080808] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              tierFilter === 'all'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-black'
                : 'text-zinc-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-[#141414]'
            }`}
          >
            {lang === 'ar' ? `كل الطبقات (${SITE_LAYERS.length})` : `All Layers (${SITE_LAYERS.length})`}
          </button>
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setTierFilter(tier.id)}
              className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                tierFilter === tier.id
                  ? 'bg-[#FF263F] text-white'
                  : 'text-zinc-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-[#141414]'
              }`}
            >
              {tier.order}. {tier.label[lang]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 ${
                lang === 'ar' ? 'right-3' : 'left-3'
              }`}
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث في طبقات الموقع...' : 'Filter site layers...'}
              aria-label={lang === 'ar' ? 'ابحث في طبقات الموقع' : 'Filter site layers'}
              className={`h-9 w-full sm:w-52 rounded-lg border border-[#E5E7EB] bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF263F] focus:outline-none dark:border-[#202020] dark:bg-[#0D0D0D] dark:text-white ${
                lang === 'ar' ? 'pr-8 pl-3' : 'pl-8 pr-3'
              }`}
            />
          </div>

          <div className="hidden md:flex items-center rounded-lg border border-[#E5E7EB] bg-white dark:border-[#202020] dark:bg-[#0D0D0D]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
              aria-label={lang === 'ar' ? 'تصغير الخريطة' : 'Zoom out'}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600 hover:text-[#FF263F] dark:text-zinc-300"
            >
              <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(1))))}
              aria-label={lang === 'ar' ? 'تكبير الخريطة' : 'Zoom in'}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600 hover:text-[#FF263F] dark:text-zinc-300"
            >
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split View: Interactive Map Topology + Live Layer Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* LEFT / TOP: Interactive Spatial Map */}
        <div className="lg:col-span-8 rounded-2xl border border-[#E5E7EB] bg-white dark:border-[#202020] dark:bg-[#0A0A0A] overflow-hidden">
          {/* Map Legend Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-4 py-3 text-[11px] text-zinc-600 dark:border-[#202020] dark:text-zinc-400">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-[#FF263F]" aria-hidden="true" />
                <span>{lang === 'ar' ? 'مسار نشط / مخرجات' : 'Active Flow / Downstream'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-amber-500" aria-hidden="true" />
                <span>{lang === 'ar' ? 'مدخلات مرتبطة' : 'Connected Upstream'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden="true" />
                <span>{lang === 'ar' ? 'اعتماد معماري' : 'Static Dependency'}</span>
              </span>
            </div>
            <span className="font-mono tabular-nums">
              {matchingIds.size}/{SITE_LAYERS.length}{' '}
              {lang === 'ar' ? 'طبقة ظاهرة' : 'visible'}
            </span>
          </div>

          {/* Desktop Interactive Spatial Topology Canvas (Always LTR coordinates for clean flow left->right) */}
          <div className="hidden md:block relative overflow-auto bg-[#FAFAFA] dark:bg-[#050505]">
            <div
              dir="ltr"
              className="relative min-w-[780px] transition-transform duration-200 origin-top-left"
              style={{
                height: '640px',
                transform: zoom === 1 ? undefined : `scale(${zoom})`,
                width: zoom > 1 ? `${100 / zoom}%` : '100%',
              }}
            >
              {/* Subtle Precision Grid Background */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(161, 161, 170, 0.35) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Tier Column Header Guides */}
              <div className="pointer-events-none absolute inset-x-0 top-3 grid grid-cols-5 px-4 text-center">
                {TIERS.map((tier) => (
                  <div key={tier.id} className="px-1">
                    <p className="font-mono text-[10px] font-semibold text-[#FF263F] tabular-nums">
                      TIER {tier.order}
                    </p>
                    <p className="truncate text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {tier.label[lang]}
                    </p>
                  </div>
                ))}
              </div>

              {/* SVG Directional Connections Layer */}
              <svg
                viewBox="0 0 1000 640"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="arrow-muted"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(161,161,170,0.45)" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FF263F" />
                  </marker>
                  <marker
                    id="arrow-upstream"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
                  </marker>
                </defs>

                {EDGES.map((edge) => {
                  const fromNode = layerById.get(edge.from);
                  const toNode = layerById.get(edge.to);
                  if (!fromNode || !toNode) return null;

                  const x1 = fromNode.xPercent * 10;
                  const y1 = fromNode.yPercent * 6.4;
                  const x2 = toNode.xPercent * 10;
                  const y2 = toNode.yPercent * 6.4;
                  const midX = (x1 + x2) / 2;
                  const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                  const isOutgoing = edge.from === focusedId;
                  const isIncoming = edge.to === focusedId;
                  const isVisible =
                    matchingIds.has(edge.from) && matchingIds.has(edge.to);

                  const stroke = isOutgoing
                    ? '#FF263F'
                    : isIncoming
                      ? '#F59E0B'
                      : 'rgba(161,161,170,0.32)';
                  const strokeWidth = isOutgoing || isIncoming ? 2.4 : 1.3;
                  const markerEnd = isOutgoing
                    ? 'url(#arrow-active)'
                    : isIncoming
                      ? 'url(#arrow-upstream)'
                      : 'url(#arrow-muted)';

                  return (
                    <path
                      key={`${edge.from}->${edge.to}`}
                      d={pathD}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isOutgoing || isIncoming ? '6 4' : undefined}
                      opacity={isVisible ? (isOutgoing || isIncoming ? 1 : 0.75) : 0.15}
                      markerEnd={markerEnd}
                      className={isOutgoing || isIncoming ? 'transition-all duration-200' : ''}
                    />
                  );
                })}
              </svg>

              {/* Interactive Layer Nodes */}
              {SITE_LAYERS.map((layer) => {
                const isSelected = layer.id === selectedId;
                const isConnected = connectedSet.has(layer.id);
                const isMatch = matchingIds.has(layer.id);
                const isTracedCurrent = traceActive && TRACE_SEQUENCE[traceIndex] === layer.id;

                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => handleSelectLayer(layer.id)}
                    onMouseEnter={() => setHoveredId(layer.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-pressed={isSelected}
                    style={{
                      left: `${layer.xPercent}%`,
                      top: `${layer.yPercent}%`,
                    }}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 w-[150px] rounded-xl border p-2.5 text-start transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263F] ${
                      isSelected || isTracedCurrent
                        ? 'z-20 border-[#FF263F] bg-white shadow-lg ring-2 ring-[#FF263F]/25 dark:bg-[#121212]'
                        : isConnected
                          ? 'z-10 border-amber-500/60 bg-white dark:bg-[#0F0F0F]'
                          : 'z-10 border-[#E5E7EB] bg-white/95 hover:border-zinc-400 dark:border-[#242424] dark:bg-[#0C0C0C]/95 dark:hover:border-zinc-600'
                    } ${!isMatch ? 'opacity-25' : focusedId && !isConnected ? 'opacity-55 hover:opacity-100' : 'opacity-100'}`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? 'bg-[#FF263F] text-white'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-[#1A1A1A] dark:text-zinc-300'
                        }`}
                      >
                        <LayerIcon kind={layer.iconKey} className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {layer.code}
                      </span>
                    </div>
                    <p
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-snug text-zinc-950 dark:text-white"
                    >
                      {layer.title[lang]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile & Small Tablet Interactive Tier Map */}
          <div className="md:hidden divide-y divide-[#E5E7EB] dark:divide-[#202020]">
            {TIERS.map((tier) => {
              const tierLayers = SITE_LAYERS.filter(
                (l) => l.tier === tier.id && matchingIds.has(l.id)
              );
              if (tierLayers.length === 0) return null;
              return (
                <div key={tier.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-sm font-bold text-zinc-950 dark:text-white">
                      {tier.order}. {tier.label[lang]}
                    </h2>
                    <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                      {tierLayers.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tierLayers.map((layer) => {
                      const isSelected = layer.id === selectedId;
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          onClick={() => handleSelectLayer(layer.id)}
                          aria-pressed={isSelected}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-start transition-colors ${
                            isSelected
                              ? 'border-[#FF263F] bg-[#FF263F]/[0.06]'
                              : 'border-[#E5E7EB] bg-[#F7F7F7] dark:border-[#202020] dark:bg-[#0D0D0D]'
                          }`}
                        >
                          <span
                            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? 'bg-[#FF263F] text-white'
                                : 'bg-white text-zinc-700 dark:bg-black dark:text-zinc-300'
                            }`}
                          >
                            <LayerIcon kind={layer.iconKey} className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500 tabular-nums">
                              {layer.code}
                            </p>
                            <p className="text-xs font-bold text-zinc-950 dark:text-white">
                              {layer.title[lang]}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT / BOTTOM: Layer Forensic Inspector Panel */}
        <aside
          aria-live="polite"
          className="lg:col-span-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-[#202020] dark:bg-[#0D0D0D] space-y-5"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4 dark:border-[#202020]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF263F]/10 text-[#FF263F]">
                <LayerIcon kind={selectedLayer.iconKey} className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-xs font-semibold text-[#FF263F] tabular-nums">
                  {selectedLayer.code} · {selectedTier?.label[lang]}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-zinc-950 dark:text-white">
                  {selectedLayer.title[lang]}
                </h2>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {selectedLayer.summary[lang]}
          </p>

          <div className="space-y-3 border-t border-[#E5E7EB] pt-4 text-xs dark:border-[#202020]">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'الدور الوظيفي في البنية' : 'Architectural Role'}
              </p>
              <p className="mt-1 leading-relaxed text-zinc-600 dark:text-zinc-400">
                {selectedLayer.role[lang]}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-3 dark:border-[#202020] dark:bg-black">
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {lang === 'ar' ? 'المدخلات' : 'Inputs'}
                </p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedLayer.inputs[lang]}
                </p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-3 dark:border-[#202020] dark:bg-black">
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {lang === 'ar' ? 'المخرجات' : 'Outputs'}
                </p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedLayer.outputs[lang]}
                </p>
              </div>
            </div>
          </div>

          {/* Enforced Security Controls */}
          <div className="border-t border-[#E5E7EB] pt-4 dark:border-[#202020]">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-950 dark:text-white">
              <ShieldAlert className="h-3.5 w-3.5 text-[#FF263F]" aria-hidden="true" />
              <span>{lang === 'ar' ? 'الضوابط الأمنية المفروضة' : 'Enforced Security Controls'}</span>
            </p>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {selectedLayer.controls[lang].map((ctrl) => (
                <li key={ctrl} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF263F]" aria-hidden="true" />
                  <span>{ctrl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Connected Dependencies Traversal */}
          <div className="space-y-3 border-t border-[#E5E7EB] pt-4 dark:border-[#202020]">
            {selectedLayer.upstreamIds.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {lang === 'ar' ? 'يعتمد على (الطبقات المغذّية):' : 'Receives From (Upstream):'}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedLayer.upstreamIds.map((uid) => {
                    const up = layerById.get(uid);
                    if (!up) return null;
                    return (
                      <button
                        key={uid}
                        type="button"
                        onClick={() => handleSelectLayer(uid)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F7F7F7] px-2.5 py-1 text-[11px] font-medium text-zinc-800 hover:border-amber-500 hover:text-amber-600 dark:border-[#242424] dark:bg-black dark:text-zinc-200 dark:hover:text-amber-400 transition-colors"
                      >
                        <span className="font-mono text-[10px] text-zinc-500">{up.code}</span>
                        <span>{up.title[lang]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedLayer.downstreamIds.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-[#FF263F]">
                  {lang === 'ar' ? 'يمرّر البيانات إلى (الطبقات التالية):' : 'Feeds Into (Downstream):'}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedLayer.downstreamIds.map((did) => {
                    const down = layerById.get(did);
                    if (!down) return null;
                    return (
                      <button
                        key={did}
                        type="button"
                        onClick={() => handleSelectLayer(did)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F7F7F7] px-2.5 py-1 text-[11px] font-medium text-zinc-800 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#242424] dark:bg-black dark:text-zinc-200 transition-colors"
                      >
                        <span className="font-mono text-[10px] text-zinc-500">{down.code}</span>
                        <span>{down.title[lang]}</span>
                        {lang === 'ar' ? (
                          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="h-3 w-3" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Direct Action to Test in Scanner */}
          {onNavigateScanner && (
            <div className="border-t border-[#E5E7EB] pt-4 dark:border-[#202020]">
              <button
                type="button"
                onClick={onNavigateScanner}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FF263F] px-4 text-xs font-bold text-white hover:bg-[#E01E35] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263F]"
              >
                <span>{lang === 'ar' ? 'جرّب فحص رابط عبر هذه الطبقات' : 'Test URL Through These Layers'}</span>
                <ArrowRight className={`h-3.5 w-3.5 ${lang === 'ar' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
