import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppPage,
  Language,
  ProviderDescriptor,
  SavedHistoryEntry,
  ScanJobState,
  ScanReport,
  ScreenshotViewport,
  ThemeMode,
} from './types/scan';
import { Navbar } from './components/Navbar';
import { ScannerHero } from './components/ScannerHero';
import { ScanProgressView } from './components/ScanProgressView';
import { SecurityReportView } from './components/SecurityReportView';
import { ProvidersView } from './components/ProvidersView';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';
import { PrivacyView } from './components/PrivacyView';
import { TermsView } from './components/TermsView';
import { ErrorView } from './components/ErrorView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConsentBanner } from './components/ConsentBanner';
import { Footer } from './components/Footer';
import { cyberAudio } from './utils/cyberAudio';

async function safeJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    await response.text();
    throw new Error(
      `Expected JSON response but received ${contentType || 'unknown content type'} (HTTP ${response.status}).`
    );
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `HTTP error ${response.status}`);
  }
  return data;
}

const THEME_KEY = 'scanlink_theme';
const LANG_KEY = 'scanlink_lang';
const CONSENT_KEY = 'scanlink_history_consent';
const HISTORY_KEY = 'scanlink_scan_history';

const PAGE_PATHS: Record<Exclude<AppPage, 'not_found'>, string> = {
  home: '/',
  scanner: '/scanner',
  providers: '/providers',
  history: '/history',
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',
};

function resolveRouteFromPath(pathname: string): { page: AppPage; reportId?: string } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return { page: 'home' };
  if (clean === '/scanner') return { page: 'scanner' };
  if (clean === '/providers') return { page: 'providers' };
  if (clean === '/history') return { page: 'history' };
  if (clean === '/about') return { page: 'about' };
  if (clean === '/privacy') return { page: 'privacy' };
  if (clean === '/terms') return { page: 'terms' };

  const reportMatch = clean.match(/^\/report\/([0-9a-f-]{36})$/i);
  if (reportMatch) {
    return { page: 'scanner', reportId: reportMatch[1] };
  }
  return { page: 'not_found' };
}

function getPageSeoMeta(
  page: AppPage,
  lang: Language,
  hasActiveReportOrJob: boolean
): { title: string; description: string; robots: string } {
  if (page === 'not_found') {
    return {
      title: lang === 'ar' ? 'الصفحة غير موجودة (404) — Scan Link SM' : 'Page Not Found (404) — Scan Link SM',
      description: 'Requested page could not be found on Scan Link SM.',
      robots: 'noindex, nofollow',
    };
  }
  if (page === 'history' || hasActiveReportOrJob) {
    return {
      title:
        page === 'history'
          ? lang === 'ar'
            ? 'سجل الفحوصات المحلي — Scan Link SM'
            : 'Local Scan History — Scan Link SM'
          : lang === 'ar'
            ? 'تقرير الفحص الأمني — Scan Link SM'
            : 'Security Scan Report — Scan Link SM',
      description: 'Private user scan workspace and local session results.',
      robots: 'noindex, nofollow',
    };
  }

  switch (page) {
    case 'scanner':
      return {
        title: lang === 'ar' ? 'فاحص الروابط والمواقع — Scan Link SM' : 'URL & Website Scanner — Scan Link SM',
        description:
          'Analyze suspicious URLs, trace hidden redirects, inspect SSL/TLS certificates, and correlate live threat intelligence feeds.',
        robots: 'index, follow',
      };
    case 'providers':
      return {
        title:
          lang === 'ar'
            ? 'الخريطة التفاعلية لطبقات الموقع — Scan Link SM'
            : 'Interactive Site Layers Map — Scan Link SM',
        description:
          'Interactive architectural map of Scan Link SM security layers, SSRF boundaries, network analyzers, ScreenshotNeo gateway, and deterministic risk scoring.',
        robots: 'index, follow',
      };
    case 'about':
      return {
        title: lang === 'ar' ? 'عن منصة Scan Link SM' : 'About — Scan Link SM',
        description:
          'Learn about Scan Link SM’s deterministic multi-layer security inspection architecture, SSRF protection, and zero-AI telemetry principles.',
        robots: 'index, follow',
      };
    case 'privacy':
      return {
        title: lang === 'ar' ? 'سياسة الخصوصية — Scan Link SM' : 'Privacy Policy — Scan Link SM',
        description:
          'Privacy policy detailing local-only scan history controls, minimal essential storage, and third-party threat intelligence queries.',
        robots: 'index, follow',
      };
    case 'terms':
      return {
        title: lang === 'ar' ? 'شروط الاستخدام — Scan Link SM' : 'Terms of Use — Scan Link SM',
        description:
          'Terms of use governing authorized security auditing and responsible use of the Scan Link SM threat intelligence platform.',
        robots: 'index, follow',
      };
    case 'home':
    default:
      return {
        title: 'Scan Link SM — Scan Smart. Stay Safe.',
        description:
          'Deterministic website and URL threat intelligence platform for phishing detection, domain intelligence, TLS inspection, redirect tracing, and security analysis.',
        robots: 'index, follow',
      };
  }
}

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // ignore
  }
  return 'dark';
}

function getInitialLang(): Language {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

function getInitialConsent(): 'granted' | 'denied' | 'unset' {
  try {
    const val = localStorage.getItem(CONSENT_KEY);
    if (val === 'granted' || val === 'denied') return val;
  } catch {
    // ignore
  }
  return 'unset';
}

function normalizeLegacyClassification(raw: string | undefined): ScanReport['classification'] {
  const legacyMap: Record<string, ScanReport['classification']> = {
    'Critical Risk': 'CRITICAL',
    'High Risk': 'HIGH',
    'Moderate Risk': 'MEDIUM',
    Guarded: 'LOW',
    'Low Risk': 'LOW',
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    INFORMATIONAL: 'SAFE_INDICATORS',
    SAFE_INDICATORS: 'SAFE_INDICATORS',
    UNKNOWN: 'UNKNOWN',
  };
  return (raw && legacyMap[raw]) || 'UNKNOWN';
}

function normalizeLegacySeverity(raw: string | undefined): ScanReport['findings'][number]['severity'] {
  const legacyMap: Record<string, ScanReport['findings'][number]['severity']> = {
    none: 'informational',
    guarded: 'low',
    moderate: 'medium',
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
    informational: 'informational',
    unknown: 'unknown',
  };
  return (raw && legacyMap[raw]) || 'unknown';
}

function normalizeSavedEntry(entry: any): SavedHistoryEntry | null {
  if (!entry || typeof entry !== 'object' || !entry.report || !entry.scanId) return null;
  const r = entry.report;
  const providers = Array.isArray(r.threatProviders) ? r.threatProviders : [];
  const findings = Array.isArray(r.findings)
    ? r.findings.map((f: any) => ({
        ...f,
        severity: normalizeLegacySeverity(f.severity || f.risk),
        recommendedAction: f.recommendedAction || {
          en: 'Review the finding details and technical evidence carefully.',
          ar: 'راجع تفاصيل الفحص والأدلة التقنية بعناية.',
        },
      }))
    : [];

  const normalizedReport: ScanReport = {
    ...r,
    classification: normalizeLegacyClassification(r.classification),
    topReasons: Array.isArray(r.topReasons) ? r.topReasons : [],
    correlationNotes: Array.isArray(r.correlationNotes) ? r.correlationNotes : [],
    findings,
    summaryStats: {
      totalChecks: r.summaryStats?.totalChecks ?? findings.length,
      passedChecks: r.summaryStats?.passedChecks ?? 0,
      warningChecks: r.summaryStats?.warningChecks ?? 0,
      failedChecks: r.summaryStats?.failedChecks ?? 0,
      criticalFindings: r.summaryStats?.criticalFindings ?? 0,
      incompleteChecks: r.summaryStats?.incompleteChecks ?? 0,
      availableProviders:
        r.summaryStats?.availableProviders ??
        providers.filter((p: any) => p.status === 'clean' || p.status === 'flagged').length,
      totalProviders: r.summaryStats?.totalProviders ?? providers.length,
    },
    threatProviders: providers.map((p: any) => ({
      ...p,
      operationalState:
        p.operationalState ||
        (p.status === 'clean' || p.status === 'flagged'
          ? 'active'
          : p.status === 'unconfigured'
            ? 'auth_required'
            : 'unavailable'),
    })),
    sandboxCapabilities: r.sandboxCapabilities || {
      fullJsExecution: false,
      binaryExecution: false,
      disclosure: {
        en: 'Static HTML, DOM, redirect, DNS, TLS, and threat-feed inspection only. No scanned JavaScript or binaries are executed.',
        ar: 'فحص ساكن للبنية والشبكة والشهادات دون تنفيذ أكواد جافاسكربت أو تشغيل ملفات.',
      },
    },
    fileAnalysis: r.fileAnalysis || {
      isDirectDownload: false,
      discoveredDownloads: [],
      sandboxNote: {
        en: 'Static signature inspection only; no files executed.',
        ar: 'فحص توقيع ساكن فقط دون تشغيل أي ملفات.',
      },
    },
    recommendation: r.recommendation || {
      en: 'Review the report findings before interacting with this URL.',
      ar: 'راجع نتائج الفحص قبل التعامل مع هذا الرابط.',
    },
    sections: Array.isArray(r.sections) ? r.sections : [],
    redirects: Array.isArray(r.redirects) ? r.redirects : [],
    screenshot: {
      ...r.screenshot,
      viewport: r.screenshot?.viewport || 'desktop',
      finalDestinationUrl: r.screenshot?.finalDestinationUrl || r.finalDestinationUrl,
    },
  };

  return {
    ...entry,
    classification: normalizeLegacyClassification(entry.classification || normalizedReport.classification),
    siteFaviconDataUrl: entry.siteFaviconDataUrl || normalizedReport.siteFaviconDataUrl,
    report: normalizedReport,
  };
}

function loadSavedHistory(): SavedHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSavedEntry)
      .filter((item): item is SavedHistoryEntry => item !== null);
  } catch {
    return [];
  }
}

export default function App() {
  const initialRoute = resolveRouteFromPath(window.location.pathname);

  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [page, setPage] = useState<AppPage>(initialRoute.page);
  const [consentState, setConsentState] = useState<'granted' | 'denied' | 'unset'>(getInitialConsent);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [providers, setProviders] = useState<ProviderDescriptor[]>([]);
  const [disabledProviders, setDisabledProviders] = useState<string[]>([]);
  const [activeJob, setActiveJob] = useState<ScanJobState | null>(null);
  const [activeReport, setActiveReport] = useState<ScanReport | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedHistoryEntry[]>(() =>
    getInitialConsent() === 'granted' ? loadSavedHistory() : []
  );

  const eventSourceRef = useRef<EventSource | null>(null);

  const navigateTo = useCallback((nextPage: AppPage, customPath?: string, replace = false) => {
    setPage(nextPage);
    const targetPath =
      customPath || (nextPage === 'not_found' ? window.location.pathname : PAGE_PATHS[nextPage]);
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ page: nextPage }, '', targetPath);
      } else {
        window.history.pushState({ page: nextPage }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    const seo = getPageSeoMeta(page, lang, Boolean(activeReport || activeJob));
    document.title = seo.title;

    const updateMeta = (selector: string, attr: string, content: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (attr === 'name') el.name = selector.match(/name="([^"]+)"/)?.[1] || '';
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('meta[name="description"]', 'name', seo.description);
    updateMeta('meta[name="robots"]', 'name', seo.robots);
    updateMeta('meta[property="og:title"]', 'property', seo.title);
    updateMeta('meta[property="og:description"]', 'property', seo.description);
    updateMeta('meta[name="twitter:title"]', 'name', seo.title);
    updateMeta('meta[name="twitter:description"]', 'name', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;
  }, [page, lang, activeReport, activeJob]);

  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveRouteFromPath(window.location.pathname);
      setPage(resolved.page);
      if (!resolved.reportId) {
        setActiveJob(null);
        setActiveReport(null);
        setScanError(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchProviders = useCallback(() => {
    fetch('/api/providers')
      .then(async (res) => {
        const data = await safeJsonResponse(res);
        if (data?.providers && Array.isArray(data.providers)) {
          setProviders(data.providers);
        }
      })
      .catch(() => {
        // Non-blocking
      });
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Support deep link /report/:scanId
  useEffect(() => {
    if (!initialRoute.reportId) return;
    const scanId = initialRoute.reportId;
    const localMatch = loadSavedHistory().find((item) => item.scanId === scanId);
    if (localMatch?.report) {
      setActiveReport(localMatch.report);
      return;
    }

    fetch(`/api/scans/${encodeURIComponent(scanId)}`)
      .then(async (res) => {
        const job: ScanJobState = await safeJsonResponse(res);
        setActiveJob(job);
        if (job.status === 'completed' && job.report) {
          setActiveReport(job.report);
        }
      })
      .catch((err) => {
        setScanError((err as Error).message || 'Scan report not found or expired.');
      });
  }, [initialRoute.reportId]);

  useEffect(() => {
    if (consentState !== 'unset') return;
    const timer = setTimeout(() => setShowConsentModal(true), 1200);
    return () => clearTimeout(timer);
  }, [consentState]);

  const toggleProvider = useCallback((id: string) => {
    setDisabledProviders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const saveReportToHistory = useCallback(
    (report: ScanReport) => {
      if (consentState !== 'granted') return;
      const entry: SavedHistoryEntry = {
        scanId: report.scanId,
        submittedUrl: report.submittedUrl,
        finalDestinationUrl: report.finalDestinationUrl,
        completedAt: report.completedAt,
        riskScore: report.riskScore,
        classification: report.classification,
        verdict: report.verdict,
        screenshotAvailable: report.screenshot.status === 'captured',
        siteFaviconDataUrl: report.siteFaviconDataUrl,
        status: report.status,
        report,
      };
      setHistory((prev) => {
        const next = [entry, ...prev.filter((h) => h.scanId !== report.scanId)].slice(0, 30);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [consentState]
  );

  const cleanupStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  useEffect(() => () => cleanupStream(), []);

  const pollUntilDone = async (scanId: string) => {
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`/api/scans/${encodeURIComponent(scanId)}`);
        const job: ScanJobState = await safeJsonResponse(res);
        setActiveJob(job);
        if (job.status === 'completed' && job.report) {
          setActiveReport(job.report);
          saveReportToHistory(job.report);
          fetchProviders();
          cyberAudio.playScanComplete(
            job.report.classification === 'CRITICAL' || job.report.classification === 'HIGH'
          );
          break;
        }
        if (job.status === 'failed') break;
      } catch {
        break;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  const handleStartScan = async (options: {
    url: string;
    viewport: ScreenshotViewport;
    disabledProviders: string[];
  }) => {
    cleanupStream();
    setScanError(null);
    setActiveReport(null);
    navigateTo('scanner', '/scanner');
    cyberAudio.playScanStart();

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const json = await safeJsonResponse(res);

      const initialJob: ScanJobState = {
        scanId: json.scanId,
        submittedUrl: options.url,
        status: json.status,
        progressPercent: json.progressPercent ?? 0,
        startedAt: new Date().toISOString(),
        stages: json.stages ?? [],
      };
      setActiveJob(initialJob);

      const es = new EventSource(`/api/scans/${encodeURIComponent(json.scanId)}/stream`);
      eventSourceRef.current = es;

      es.onmessage = (ev) => {
        try {
          const updated: ScanJobState = JSON.parse(ev.data);
          setActiveJob(updated);
          if (updated.status === 'completed' && updated.report) {
            setActiveReport(updated.report);
            saveReportToHistory(updated.report);
            fetchProviders();
            window.history.replaceState({ page: 'scanner' }, '', `/report/${updated.scanId}`);
            cyberAudio.playScanComplete(
              updated.report.classification === 'CRITICAL' || updated.report.classification === 'HIGH'
            );
            es.close();
            eventSourceRef.current = null;
          } else if (updated.status === 'failed') {
            cyberAudio.playScanComplete(true);
            es.close();
            eventSourceRef.current = null;
          }
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        void pollUntilDone(json.scanId);
      };
    } catch (err) {
      setScanError((err as Error).message || 'Network failure starting scan.');
    }
  };

  const handleResetScanner = () => {
    cleanupStream();
    setActiveJob(null);
    setActiveReport(null);
    setScanError(null);
    navigateTo('scanner', '/scanner');
  };

  const handleAcceptHistoryConsent = () => {
    setConsentState('granted');
    setShowConsentModal(false);
    try {
      localStorage.setItem(CONSENT_KEY, 'granted');
      if (activeReport) {
        saveReportToHistory(activeReport);
      }
    } catch {
      // ignore
    }
  };

  const handleEssentialOnlyConsent = () => {
    setConsentState('denied');
    setShowConsentModal(false);
    setHistory([]);
    try {
      localStorage.setItem(CONSENT_KEY, 'denied');
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  const handleDeleteHistoryEntry = (scanId: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.scanId !== scanId);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  const handleNavigate = (nextPage: AppPage) => {
    if (nextPage === 'home' || nextPage === 'scanner') {
      cleanupStream();
      setActiveJob(null);
      setActiveReport(null);
      setScanError(null);
    }
    navigateTo(nextPage);
  };

  const isScanning = Boolean(activeJob && (activeJob.status === 'queued' || activeJob.status === 'running'));

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 dark:bg-black dark:text-white transition-colors duration-200">
      <Navbar
        currentPage={page}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      <main className="flex-1">
        <ErrorBoundary
          lang={lang}
          onResetHome={() => {
            setActiveJob(null);
            setActiveReport(null);
            setScanError(null);
            navigateTo('home');
          }}
        >
          {(page === 'home' || page === 'scanner') && (
            <>
              {scanError && (
                <div className="mx-auto mt-6 max-w-3xl px-4">
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
                  >
                    {scanError}
                  </div>
                </div>
              )}

              {!activeJob && !activeReport ? (
                <ScannerHero
                  lang={lang}
                  isScanning={isScanning}
                  providers={providers}
                  disabledProviders={disabledProviders}
                  onToggleProvider={toggleProvider}
                  recentHistory={history}
                  onOpenReport={(report) => {
                    setActiveJob(null);
                    setActiveReport(report);
                    setScanError(null);
                    navigateTo('scanner', `/report/${report.scanId}`);
                  }}
                  onStartScan={handleStartScan}
                  showLandingSections={page === 'home'}
                />
              ) : null}

              {activeJob && !activeReport && (
                <ScanProgressView job={activeJob} lang={lang} onReset={handleResetScanner} />
              )}

              {activeReport && (
                <SecurityReportView
                  report={activeReport}
                  lang={lang}
                  onRescan={(url) =>
                    handleStartScan({
                      url,
                      viewport: activeReport.screenshot.viewport || 'desktop',
                      disabledProviders,
                    })
                  }
                  onNewScan={handleResetScanner}
                />
              )}
            </>
          )}

          {page === 'providers' && (
            <ProvidersView
              lang={lang}
              onNavigateScanner={() => handleNavigate('scanner')}
            />
          )}

          {page === 'history' && (
            <HistoryView
              history={history}
              consentGranted={consentState === 'granted'}
              lang={lang}
              onEnableConsent={handleAcceptHistoryConsent}
              onOpenReport={(report) => {
                setActiveJob(null);
                setActiveReport(report);
                setScanError(null);
                navigateTo('scanner', `/report/${report.scanId}`);
              }}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearAll={handleClearHistory}
              onGoToScanner={handleResetScanner}
            />
          )}

          {page === 'about' && <AboutView lang={lang} providers={providers} />}

          {page === 'privacy' && <PrivacyView lang={lang} />}

          {page === 'terms' && <TermsView lang={lang} />}

          {page === 'not_found' && (
            <ErrorView
              lang={lang}
              code="404"
              onGoHome={() => handleNavigate('home')}
              onGoScanner={() => handleNavigate('scanner')}
            />
          )}
        </ErrorBoundary>
      </main>

      <Footer
        lang={lang}
        onNavigate={handleNavigate}
        onOpenPrivacy={() => setShowConsentModal(true)}
      />

      <ConsentBanner
        visible={showConsentModal}
        lang={lang}
        onAcceptHistory={handleAcceptHistoryConsent}
        onEssentialOnly={handleEssentialOnlyConsent}
      />
    </div>
  );
}
