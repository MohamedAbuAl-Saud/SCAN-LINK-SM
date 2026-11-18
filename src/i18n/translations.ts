import type {
  CheckStatus,
  FinalVerdict,
  Language,
  ProviderOperationalState,
  RiskClassification,
  RiskSeverity,
} from '../types/scan';

export const UI_COPY = {
  brand: {
    name: { en: 'Scan Link SM', ar: 'Scan Link SM' },
    tagline: { en: 'Scan Smart. Stay Safe.', ar: 'افحص بذكاء. ابقَ آمناً.' },
  },
  nav: {
    home: { en: 'Home', ar: 'الرئيسية' },
    scanner: { en: 'URL Scanner', ar: 'فاحص الروابط' },
    providers: { en: 'Providers', ar: 'مزودو البيانات' },
    history: { en: 'Scan History', ar: 'سجل الفحوصات' },
    about: { en: 'About', ar: 'عن المنصة' },
    privacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    terms: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
  },
  hero: {
    headline: {
      en: 'Deterministic Website & URL Threat Intelligence',
      ar: 'استخبارات أمنية حتمية لفحص المواقع والروابط',
    },
    description: {
      en: 'Inspect suspicious links, trace hidden redirects, detect credential-harvesting pages, verify brand impersonation, inspect certificates, and correlate verified threat feeds.',
      ar: 'افحص الروابط المشبوهة، وتتبع سلاسل التوجيه المخفية، واكشف صفحات سرقة البيانات وانتحال العلامات، وتحقق من الشهادات وقواعد التهديدات الموثقة.',
    },
    inputPlaceholder: {
      en: 'Enter any HTTP/HTTPS URL or domain to analyze (e.g. https://example.com)',
      ar: 'أدخل رابط HTTP/HTTPS أو اسم نطاق للفحص (مثال: https://example.com)',
    },
    paste: { en: 'Paste', ar: 'لصق' },
    clear: { en: 'Clear', ar: 'مسح' },
    scan: { en: 'Analyze URL', ar: 'فحص الرابط' },
    scanning: { en: 'Analyzing...', ar: 'جارٍ الفحص...' },
    optionsToggle: { en: 'Scan Options', ar: 'خيارات الفحص' },
    viewportLabel: { en: 'Screenshot Viewport', ar: 'منظور لقطة الشاشة' },
    viewportDesktop: { en: 'Desktop (1280×800)', ar: 'سطح المكتب (1280×800)' },
    viewportMobile: { en: 'Mobile (390×844)', ar: 'الجوال (390×844)' },
    viewportFull: { en: 'Full Page', ar: 'الصفحة كاملة' },
    securityNotice: {
      en: 'Only submit URLs you are authorized to inspect. Never paste private URLs containing session tokens, API keys, or personal credentials.',
      ar: 'افحص فقط الروابط المصرح لك بتحليلها. لا تُدخل روابط خاصة تتضمن رموز جلسات أو مفاتيح سرية أو كلمات مرور.',
    },
    examplesLabel: { en: 'Test targets:', ar: 'روابط اختبار:' },
    recentScansLabel: { en: 'Recent Local Scans', ar: 'أحدث الفحوصات المحلية' },
    clipboardDenied: {
      en: 'Clipboard permission was denied by your browser. Paste the URL manually.',
      ar: 'رفض المتصفح إذن الحافظة. يرجى لصق الرابط يدوياً.',
    },
    invalidUrl: {
      en: 'Please enter a valid HTTP or HTTPS URL or public domain name.',
      ar: 'يرجى إدخال رابط HTTP أو HTTPS أو اسم نطاق عام صحيح.',
    },
  },
  homeSections: {
    labTitle: {
      en: 'Thirteen-Layer Deterministic Inspection Pipeline',
      ar: 'محرك فحص حتمي من ثلاث عشرة طبقة أمنية',
    },
    labSubtitle: {
      en: 'No AI guesswork. Every classification stems from SSRF-guarded network telemetry, HTML inspection, rule correlation, and live threat feeds.',
      ar: 'بدون تخمين أو نماذج ذكاء اصطناعي. يعتمد كل تصنيف على بيانات الشبكة المحمية وفحص المحتوى وقواعد الارتباط ومزودي التهديدات.',
    },
    providersTitle: {
      en: 'Threat Intelligence Providers & Runtime Capabilities',
      ar: 'حالة مزودي استخبارات التهديدات وقدرات بيئة التشغيل',
    },
    providersSubtitle: {
      en: 'Unavailable or authentication-gated feeds are disclosed transparently and never treated as clean checks.',
      ar: 'يتم عرض حالة كل مزود بشفافية تامة؛ ولا يُحتسب المزود غير المتاح أو غير المهيأ كدليل على الأمان أبداً.',
    },
  },
  providersPage: {
    title: { en: 'Interactive Website & Security Layers Map', ar: 'الخريطة التفاعلية لطبقات الموقع والأمان' },
    subtitle: {
      en: 'Explore every architectural tier, security guard, inspection module, and live data-flow path across Scan Link SM.',
      ar: 'استكشف جميع الطبقات المعمارية وجدران الحماية ووحدات الفحص ومسار تدفق البيانات التفاعلي داخل منصة Scan Link SM.',
    },
    refresh: { en: 'Reset View', ar: 'إعادة ضبط الخريطة' },
    lastLookup: { en: 'Layer Status', ar: 'حالة الطبقة' },
    neverRun: { en: 'Ready', ar: 'جاهزة' },
    envKeyLabel: { en: 'Module Scope', ar: 'نطاق الوحدة' },
    noKeyNeeded: { en: 'Active', ar: 'نشطة' },
    sessionToggle: { en: 'Active in Pipeline', ar: 'مفعّلة في المسار' },
    privacyBanner: {
      en: 'All security keys and upstream inspections remain isolated on the backend server.',
      ar: 'تبقى جميع المفاتيح السرية وعمليات الفحص معزولة بالكامل على الخادم الخلفي.',
    },
  },
  progress: {
    title: { en: 'Live Security Pipeline Execution', ar: 'تنفيذ مراحل الفحص الأمني المباشر' },
    subtitle: {
      en: 'Stage indicators reflect real backend completion events via Server-Sent Events.',
      ar: 'تعكس المؤشرات حالة إتمام الوحدات الخلفية فعلياً لحظة بلحظة.',
    },
    target: { en: 'Target URL', ar: 'الرابط قيد الفحص' },
    cancelReturn: { en: 'New Scan', ar: 'فحص جديد' },
    stageStatus: {
      pending: { en: 'Queued', ar: 'في الانتظار' },
      running: { en: 'Running', ar: 'قيد التنفيذ' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      warning: { en: 'Observations', ar: 'ملاحظات' },
      failed: { en: 'Alert / Failed', ar: 'تنبيه / فشل' },
      unavailable: { en: 'Unavailable', ar: 'غير متاح' },
    },
  },
  report: {
    title: { en: 'Website Security Intelligence Report', ar: 'تقرير الاستخبارات الأمنية للموقع' },
    pageTitle: { en: 'Website Title', ar: 'عنوان الموقع' },
    noPageTitle: { en: 'No <title> element present', ar: 'لا يوجد وسم <title> في الصفحة' },
    riskScore: { en: 'Risk Score', ar: 'درجة المخاطر' },
    classification: { en: 'Classification', ar: 'مستوى التصنيف' },
    verdict: { en: 'Final Verdict', ar: 'الحكم النهائي' },
    confidence: { en: 'Analysis Confidence', ar: 'موثوقية التحليل' },
    recommendation: { en: 'Security Recommendation', ar: 'التوصية الأمنية' },
    topReasonsHeading: { en: 'Top Factors Driving This Score', ar: 'أبرز الأسباب المؤثرة في التقييم' },
    correlationHeading: { en: 'Multi-Signal Risk Correlation', ar: 'تحليل الارتباط الأمني بين المؤشرات' },
    submittedUrl: { en: 'Submitted URL', ar: 'الرابط المُدخل' },
    finalUrl: { en: 'Final Destination', ar: 'الوجهة النهائية' },
    scanDuration: { en: 'Duration', ar: 'مدة الفحص' },
    rescan: { en: 'Re-Scan', ar: 'إعادة الفحص' },
    exportJson: { en: 'Export JSON', ar: 'تصدير JSON' },
    newScan: { en: 'Scan Another URL', ar: 'فحص رابط آخر' },
    screenshotStatus: { en: 'Screenshot Status', ar: 'حالة المعاينة البصرية' },
    captureMethod: { en: 'Capture Method', ar: 'طريقة الالتقاط' },
    viewport: { en: 'Viewport', ar: 'الأبعاد' },
    stats: {
      total: { en: 'Total Checks', ar: 'إجمالي الفحوصات' },
      passed: { en: 'Passed', ar: 'ناجح' },
      warning: { en: 'Warnings', ar: 'تحذيرات' },
      failed: { en: 'Failed', ar: 'فشل' },
      critical: { en: 'Critical / High', ar: 'حرج / مرتفع' },
      providers: { en: 'Available Providers', ar: 'المزودون المتاحون' },
      incomplete: { en: 'Incomplete / Unknown', ar: 'غير مكتمل / مجهول' },
    },
    charts: {
      distribution: { en: 'Check Outcomes Distribution', ar: 'توزيع نتائج الفحوصات' },
      sectionProfile: { en: 'Security Layer Breakdown', ar: 'ملخص الطبقات الأمنية الثلاث عشرة' },
    },
    table: {
      title: { en: 'Detailed Security Evidence Table', ar: 'جدول الأدلة والفحوصات التفصيلي' },
      searchPlaceholder: { en: 'Filter by test, evidence, or source...', ar: 'ابحث في اسم الفحص أو الدليل أو المصدر...' },
      allStatuses: { en: 'All Statuses', ar: 'كل الحالات' },
      allSections: { en: 'All 13 Sections', ar: 'كل الأقسام' },
      colTest: { en: 'Test', ar: 'الفحص' },
      colResult: { en: 'Result', ar: 'النتيجة' },
      colStatus: { en: 'Status', ar: 'الحالة' },
      colSeverity: { en: 'Severity', ar: 'الشدة' },
      colEvidence: { en: 'Evidence', ar: 'الدليل التقني' },
      colSource: { en: 'Source', ar: 'المصدر' },
      colTime: { en: 'Timestamp', ar: 'الوقت' },
      noMatches: { en: 'No findings match the current filter.', ar: 'لا توجد نتائج تطابق التصفية الحالية.' },
      expandDetails: { en: 'Inspect', ar: 'تفاصيل' },
      recommendedAction: { en: 'Recommended Action', ar: 'الإجراء الموصى به' },
      whereDetected: { en: 'Where Detected', ar: 'موقع الرصد' },
      whyRisky: { en: 'Why It Is Risky', ar: 'لماذا يُعد خطراً' },
      howExploited: { en: 'How Attackers Exploit It', ar: 'كيف يُستغل هجومياً' },
      userImpact: { en: 'Potential User Impact', ar: 'التأثير المحتمل على المستخدم' },
      notProvenAlone: { en: 'What This Alone Does NOT Prove', ar: 'ما لا يثبته هذا المؤشر بمفرده' },
    },
    sectionsHeading: { en: 'Thirteen-Section Forensic Breakdown', ar: 'التحليل الجنائي الموزع على ١٣ قسماً' },
    sandboxNoticeTitle: { en: 'Isolation & Non-Execution Disclosure', ar: 'إفصاح بيئة العزل وعدم التنفيذ' },
    deceptionDetails: { en: 'Domain Deception & Identity Analysis', ar: 'تحليل خداع النطاق والانتحال البصري' },
    redirectChain: { en: 'Redirect Chain Telemetry', ar: 'تتبع سلسلة إعادة التوجيه' },
    domainDetails: { en: 'Domain, Registration & DNS Intelligence', ar: 'بيانات النطاق والتسجيل وسجلات DNS' },
    tlsDetails: { en: 'SSL/TLS Certificate Telemetry', ar: 'تفاصيل شهادة SSL/TLS' },
    contentDetails: { en: 'Website Content & Brand Impersonation', ar: 'محتوى الموقع وانتحال العلامات' },
    fileDetails: { en: 'File & Download Inspection', ar: 'فحص الملفات وروابط التنزيل' },
    threatFeeds: { en: 'External Threat Intelligence Feeds', ar: 'مزودو استخبارات التهديدات الخارجية' },
    screenshotSection: { en: 'Website Visual Evidence', ar: 'المعاينة البصرية للموقع' },
    zoomScreenshot: { en: 'Enlarge Screenshot', ar: 'تكبير الصورة' },
    closeZoom: { en: 'Close Preview', ar: 'إغلاق المعاينة' },
  },
  history: {
    title: { en: 'Local Scan History', ar: 'سجل الفحوصات المحلي' },
    subtitle: {
      en: 'Stored exclusively inside your browser when local storage consent is granted. Never uploaded or linked to accounts.',
      ar: 'يُحفظ السجل محلياً داخل متصفحك فقط عند منح الموافقة، ولا يُرفع لأي خادم خارجي.',
    },
    consentDisabled: {
      en: 'Local scan history storage is currently paused. Enable consented storage to persist reports across sessions.',
      ar: 'حفظ السجل المحلي متوقف حالياً. فعّل الموافقة لحفظ التقارير بين الجلسات.',
    },
    enableConsent: { en: 'Enable Local History Storage', ar: 'تفعيل حفظ السجل محلياً' },
    searchPlaceholder: { en: 'Filter saved URLs or classifications...', ar: 'ابحث في الروابط أو التصنيف...' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل' },
    openReport: { en: 'Open Report', ar: 'فتح التقرير' },
    delete: { en: 'Delete', ar: 'حذف' },
    emptyTitle: { en: 'No Saved Scan Reports', ar: 'لا توجد تقارير محفوظة بعد' },
    emptyDesc: {
      en: 'Scan any website from the URL Scanner to review its deterministic report here.',
      ar: 'افحص أي موقع من فاحص الروابط للاحتفاظ بتقريره الكامل هنا.',
    },
    goToScanner: { en: 'Open URL Scanner', ar: 'فتح فاحص الروابط' },
    screenshotYes: { en: 'Screenshot Ready', ar: 'توجد لقطة شاشة' },
    screenshotNo: { en: 'No Screenshot', ar: 'بدون لقطة شاشة' },
  },
  about: {
    title: { en: 'About Scan Link SM', ar: 'حول منصة Scan Link SM' },
    description: {
      en: 'Scan Link SM is a deterministic website and URL threat-intelligence platform built to detect phishing infrastructure, deceptive credential lures, brand impersonation, dangerous redirects, and malicious downloads without guesswork.',
      ar: 'Scan Link SM هي منصة استخبارات أمنية حتمية لتحليل الروابط والمواقع، مصممة لكشف التصيد الاحتيالي وانتحال العلامات وسلاسل التوجيه الخطرة والتنزيلات الضارة بدقة وشفافية.',
    },
    missionTitle: { en: 'Zero-Guesswork Security Principles', ar: 'مبادئ الأمان والشفافية' },
    missionBody: {
      en: 'Scan Link SM relies strictly on deterministic structural rules, live telemetry, and verifiable threat feeds—with zero AI models. It never claims a site is 100% safe, never marks unreachable targets as clean, and keeps all provider keys server-side.',
      ar: 'تعتمد منصة Scan Link SM كلياً على قواعد تحليل حتمية وبيانات شبكة حقيقية دون استخدام أي نماذج ذكاء اصطناعي. لا تدعي المنصة أبداً أمان أي موقع بنسبة 100%، ولا تعتبر نقص البيانات دليلاً على السلامة.',
    },
    methodologyTitle: { en: 'Thirteen Inspection Layers', ar: 'منهجية التحليل من ثلاث عشرة طبقة' },
    developerTitle: { en: 'Architect & Maintainer', ar: 'المطور والمشرف على المشروع' },
    developerName: { en: 'Mohamed Abu AlSaud SM', ar: 'محمد أبو السعود SM' },
    proprietaryTitle: { en: 'Proprietary & Protected Platform', ar: 'منصة محمية ومملوكة بالكامل' },
    proprietaryBody: {
      en: 'Scan Link SM is proprietary, closed-source cybersecurity software developed and owned exclusively by Mohamed Abu AlSaud SM (AlQeyadah AlZaeem). All analysis rules, backend services, and UI assets are protected intellectual property.',
      ar: 'منصة Scan Link SM هي برمجية أمن سيبراني مغلقة المصدر ومملوكة حصرياً للمطور محمد أبو السعود SM (القيادة الزعيم). جميع محركات التحليل والخدمات الخلفية وواجهات الاستخدام محمية بحقوق الملكية الفكرية.',
    },
    proprietaryBadge: {
      en: 'Closed-Source Proprietary Engine · All Rights Reserved',
      ar: 'محرك مغلق المصدر محمي · جميع الحقوق محفوظة',
    },
  },
  consent: {
    title: { en: 'Privacy & Local Storage Controls', ar: 'إعدادات الخصوصية والتخزين المحلي' },
    body: {
      en: 'Necessary storage remembers your theme and language preferences. Optional local storage saves your scan history inside this browser. No third-party tracking cookies or external analytics are enabled.',
      ar: 'يُستخدم التخزين الضروري لحفظ المظهر واللغة فقط. ويُستخدم التخزين الاختياري لحفظ سجل الفحوصات محلياً في متصفحك دون أي تتبع أو تحليلات خارجية.',
    },
    acceptHistory: { en: 'Enable Optional History Storage', ar: 'تفعيل حفظ السجل الاختياري' },
    essentialOnly: { en: 'Necessary Only', ar: 'الضروري فقط' },
    manageSettings: { en: 'Privacy Settings', ar: 'إعدادات الخصوصية' },
  },
  footer: {
    rights: {
      en: '© 2026 Scan Link SM · Mohamed Abu AlSaud SM',
      ar: '© 2026 Scan Link SM · محمد أبو السعود SM',
    },
    proprietaryTag: {
      en: 'Proprietary Cybersecurity Platform · Closed-Source',
      ar: 'منصة أمن سيبراني محمية · مغلقة المصدر',
    },
    protectedSlot: {
      en: 'All Rights Reserved · Unauthorized Redistribution Prohibited',
      ar: 'جميع الحقوق محفوظة · يُحظر النسخ أو إعادة التوزيع',
    },
    disclaimer: {
      en: 'Automated telemetry assists security decisions but does not guarantee absolute safety against zero-day threats.',
      ar: 'النتائج استخباراتية مساعدة لاتخاذ القرار الأمني ولا تضمن الأمان المطلق ضد التهديدات المستجدة.',
    },
  },
} as const;

export function tStatus(status: CheckStatus | string | undefined, lang: Language = 'en'): string {
  const map: Record<string, { en: string; ar: string }> = {
    pass: { en: 'Pass', ar: 'سليم' },
    warning: { en: 'Warning', ar: 'تحذير' },
    failed: { en: 'Failed', ar: 'فشل' },
    unknown: { en: 'Unknown', ar: 'غير معروف' },
  };
  const targetLang = lang === 'ar' ? 'ar' : 'en';
  const key = status ? String(status).toLowerCase() : 'unknown';
  const item = map[key] || map.unknown;
  return item[targetLang] || item.en || String(status || 'Unknown');
}

export function tSeverity(sev: RiskSeverity | string | undefined, lang: Language = 'en'): string {
  const legacyMap: Record<string, RiskSeverity> = {
    none: 'informational',
    guarded: 'low',
    moderate: 'medium',
  };
  const rawKey = sev ? String(sev).toLowerCase() : 'unknown';
  const key = legacyMap[rawKey] || rawKey;
  const map: Record<string, { en: string; ar: string }> = {
    critical: { en: 'Critical', ar: 'حرج' },
    high: { en: 'High', ar: 'مرتفع' },
    medium: { en: 'Medium', ar: 'متوسط' },
    low: { en: 'Low', ar: 'منخفض' },
    informational: { en: 'Informational', ar: 'معلوماتي' },
    unknown: { en: 'Unknown', ar: 'غير معروف' },
  };
  const targetLang = lang === 'ar' ? 'ar' : 'en';
  const item = map[key] || map.unknown;
  return item[targetLang] || item.en || String(sev || 'Unknown');
}

export function tClassification(cls: RiskClassification | string | undefined, lang: Language = 'en'): string {
  const legacyMap: Record<string, RiskClassification> = {
    'Critical Risk': 'CRITICAL',
    'High Risk': 'HIGH',
    'Moderate Risk': 'MEDIUM',
    Guarded: 'LOW',
    'Low Risk': 'LOW',
    INFORMATIONAL: 'SAFE_INDICATORS',
  };
  const upper = cls ? String(cls).toUpperCase() : '';
  const key = (cls && (legacyMap[cls as string] || legacyMap[upper] || upper)) as RiskClassification;
  const map: Record<string, { en: string; ar: string }> = {
    CRITICAL: { en: 'CRITICAL', ar: 'حرج (CRITICAL)' },
    HIGH: { en: 'HIGH', ar: 'مرتفع (HIGH)' },
    MEDIUM: { en: 'MEDIUM', ar: 'متوسط (MEDIUM)' },
    LOW: { en: 'LOW', ar: 'منخفض (LOW)' },
    SAFE_INDICATORS: { en: 'SAFE INDICATORS', ar: 'مؤشرات إيجابية' },
    INFORMATIONAL: { en: 'SAFE INDICATORS', ar: 'مؤشرات إيجابية' },
    UNKNOWN: { en: 'INCONCLUSIVE', ar: 'غير حاسم (UNKNOWN)' },
    INCONCLUSIVE: { en: 'INCONCLUSIVE', ar: 'غير حاسم (UNKNOWN)' },
  };
  const targetLang = lang === 'ar' ? 'ar' : 'en';
  const item = map[key] || map.UNKNOWN;
  if (!item) return targetLang === 'ar' ? 'غير حاسم (UNKNOWN)' : 'INCONCLUSIVE';
  return item[targetLang] || item.en || String(cls || 'INCONCLUSIVE');
}

export function tVerdict(verdict: FinalVerdict | string | undefined, lang: Language = 'en'): string {
  const map: Record<string, { en: string; ar: string }> = {
    Critical: { en: 'Critical', ar: 'خطورة حرجة' },
    'Malicious Indicators Detected': { en: 'Critical', ar: 'تم رصد مؤشرات خبيثة' },
    'High Risk': { en: 'High Risk', ar: 'خطورة مرتفعة' },
    Suspicious: { en: 'Suspicious', ar: 'مشبوه' },
    'Low Risk': { en: 'Low Risk', ar: 'مخاطر منخفضة' },
    'Safe Indicators Found': { en: 'Safe Indicators Found', ar: 'توجد مؤشرات أمان إيجابية' },
    'No Known Threats Detected': { en: 'Safe Indicators Found', ar: 'لم يتم رصد تهديدات معروفة' },
    Inconclusive: { en: 'Inconclusive', ar: 'نتيجة غير حاسمة' },
    'Incomplete Analysis': { en: 'Inconclusive', ar: 'تحليل غير مكتمل' },
  };
  const targetLang = lang === 'ar' ? 'ar' : 'en';
  const key = verdict ? String(verdict) : 'Inconclusive';
  const item = map[key] || map.Inconclusive;
  return item[targetLang] || item.en || key;
}

export function tOperationalState(state: ProviderOperationalState | string | undefined, lang: Language = 'en'): string {
  const legacyMap: Record<string, ProviderOperationalState> = {
    unconfigured: 'auth_required',
    error: 'unavailable',
  };
  const rawKey = state ? String(state).toLowerCase() : 'unavailable';
  const key = legacyMap[rawKey] || rawKey;
  const map: Record<string, { en: string; ar: string }> = {
    active: { en: 'Active', ar: 'نشط' },
    configured: { en: 'Configured', ar: 'مهيأ' },
    disabled: { en: 'Disabled', ar: 'معطل' },
    rate_limited: { en: 'Rate Limited', ar: 'محدود المعدل' },
    unavailable: { en: 'Unavailable', ar: 'غير متاح' },
    auth_required: { en: 'Authentication Required', ar: 'يتطلب مفتاح توثيق' },
  };
  const targetLang = lang === 'ar' ? 'ar' : 'en';
  const item = map[key] || map.unavailable;
  return item[targetLang] || item.en || String(state || 'Unavailable');
}
