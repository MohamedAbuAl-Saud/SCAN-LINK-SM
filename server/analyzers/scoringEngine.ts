import type {
  BilingualText,
  CheckFinding,
  CheckStatus,
  FinalVerdict,
  RiskClassification,
  RiskSeverity,
  TechnicalSectionId,
  TechnicalSectionSummary,
  ThreatProviderResult,
} from '../types.ts';

const SECTION_TITLES: Record<TechnicalSectionId, BilingualText> = {
  url_intelligence: { en: '1. URL Intelligence', ar: '١. استخبارات بنية الرابط' },
  domain_deception: { en: '2. Domain Deception & Identity', ar: '٢. خداع النطاق والانتحال البصري' },
  redirect_analysis: { en: '3. Redirect Analysis', ar: '٣. تحليل إعادة التوجيه' },
  domain_intelligence: { en: '4. Domain & Registration Intel', ar: '٤. استخبارات النطاق والتسجيل' },
  dns_analysis: { en: '5. DNS & Network Resolution', ar: '٥. تحليل سجلات DNS والشبكة' },
  ssl_tls_analysis: { en: '6. SSL/TLS Certificate', ar: '٦. تحليل شهادة SSL/TLS' },
  website_content: { en: '7. Website Content & Structure', ar: '٧. فحص محتوى الموقع وبنيته' },
  source_intelligence: { en: '8. Website Source Intelligence', ar: '٨. استخبارات مصدر الموقع الأمني' },
  page_discovery: { en: '9. Multi-Page Discovery & Inspection', ar: '٩. استكشاف وفحص الصفحات المتعددة' },
  phishing_detection: { en: '10. Phishing & Lure Detection', ar: '١٠. كشف التصيد وأساليب الخداع' },
  brand_impersonation: { en: '11. Brand Impersonation', ar: '١١. كشف انتحال العلامات' },
  javascript_analysis: { en: '12. JavaScript Static Analysis', ar: '١٢. التحليل الساكن للجافاسكربت' },
  supply_chain_analysis: { en: '13. Supply Chain & External Resources', ar: '١٣. سلسلة التوريد والموارد الخارجية' },
  file_download_analysis: { en: '14. File & Download Analysis', ar: '١٤. تحليل الملفات والتنزيلات' },
  external_threat_intel: { en: '15. External Threat Intelligence', ar: '١٥. استخبارات التهديدات الخارجية' },
  screenshot_evidence: { en: '16. Screenshot Evidence', ar: '١٦. المعاينة البصرية للموقع' },
};

const SECTION_ORDER: TechnicalSectionId[] = [
  'url_intelligence',
  'domain_deception',
  'redirect_analysis',
  'domain_intelligence',
  'dns_analysis',
  'ssl_tls_analysis',
  'website_content',
  'source_intelligence',
  'page_discovery',
  'phishing_detection',
  'brand_impersonation',
  'javascript_analysis',
  'supply_chain_analysis',
  'file_download_analysis',
  'external_threat_intel',
  'screenshot_evidence',
];

function worstSeverity(findings: CheckFinding[]): RiskSeverity {
  const rank: Record<RiskSeverity, number> = {
    informational: 0,
    unknown: 1,
    low: 2,
    medium: 3,
    high: 4,
    critical: 5,
  };
  let max: RiskSeverity = 'informational';
  for (const f of findings) {
    if (rank[f.severity] > rank[max]) max = f.severity;
  }
  return max;
}

function sectionStatus(findings: CheckFinding[]): CheckStatus {
  if (findings.length === 0) return 'unknown';
  if (findings.some((f) => f.status === 'failed')) return 'failed';
  if (findings.some((f) => f.status === 'warning')) return 'warning';
  if (findings.every((f) => f.status === 'unknown')) return 'unknown';
  return 'pass';
}

export function computeRiskAndSections(
  findings: CheckFinding[],
  providers: ThreatProviderResult[]
): {
  riskScore: number;
  classification: RiskClassification;
  verdict: FinalVerdict;
  confidenceScore: number;
  confidenceLabel: 'High' | 'Medium' | 'Low';
  recommendation: BilingualText;
  topReasons: BilingualText[];
  correlationNotes: BilingualText[];
  summaryStats: {
    totalChecks: number;
    passedChecks: number;
    warningChecks: number;
    failedChecks: number;
    criticalFindings: number;
    incompleteChecks: number;
    availableProviders: number;
    totalProviders: number;
  };
  sections: TechnicalSectionSummary[];
} {
  let rawScore = 0;
  let passedChecks = 0;
  let warningChecks = 0;
  let failedChecks = 0;
  let criticalFindings = 0;
  let incompleteChecks = 0;
  let confidenceSum = 0;

  for (const f of findings) {
    const reliabilityFactor = f.confidence >= 80 ? 1.0 : f.confidence >= 55 ? 0.85 : 0.7;
    rawScore += Math.max(0, f.weight) * reliabilityFactor;
    confidenceSum += f.confidence;

    if (f.status === 'pass') passedChecks++;
    else if (f.status === 'warning') warningChecks++;
    else if (f.status === 'failed') failedChecks++;
    else incompleteChecks++;

    if (f.severity === 'critical' || (f.status === 'failed' && f.severity === 'high')) {
      criticalFindings++;
    }
  }

  // =========================================================================
  // DEDUPLICATION AGAINST DOUBLE COUNTING ACROSS OVERLAPPING MODULES
  // =========================================================================
  const byId = new Map(findings.map((f) => [f.id, f]));
  const homographFinding = byId.get('deception-homograph-confusables');
  const subdomainDeceptionFinding = byId.get('deception-subdomain-identity-mismatch');
  const openRedirectFinding = byId.get('deception-open-redirect-relays');
  const brandFinding = byId.get('brand-impersonation');

  const hasDomainDeceptionFailed =
    homographFinding?.status === 'failed' ||
    subdomainDeceptionFinding?.status === 'failed' ||
    openRedirectFinding?.status === 'failed';
  const hasBrandImpersonation = brandFinding?.status === 'failed';

  // If both Domain Deception and Brand Impersonation detect brand spoofing,
  // avoid blindly summing both domain weights and keep only the stronger signal + small corroboration margin.
  if (
    hasBrandImpersonation &&
    (homographFinding?.status === 'failed' || subdomainDeceptionFinding?.status === 'failed')
  ) {
    const deceptionDomainWeight = Math.max(
      homographFinding?.status === 'failed' ? homographFinding.weight : 0,
      subdomainDeceptionFinding?.status === 'failed' ? subdomainDeceptionFinding.weight : 0
    );
    const overlapDeduction = Math.round(Math.min(brandFinding?.weight || 0, deceptionDomainWeight) * 0.6);
    rawScore = Math.max(0, rawScore - overlapDeduction);
  }

  // =========================================================================
  // DETERMINISTIC MULTI-SIGNAL CORRELATION RULES
  // =========================================================================
  const correlationNotes: BilingualText[] = [];
  let minScoreFloor = 0;

  const hasExternalFlag = findings.some(
    (f) => f.section === 'external_threat_intel' && f.status === 'failed'
  );
  const hasExternalSuspicious = findings.some(
    (f) => f.section === 'external_threat_intel' && f.status === 'warning'
  );
  const credFinding = byId.get('phishing-credential-harvesting');
  const socialFinding = byId.get('phishing-social-engineering');
  const structFinding = byId.get('content-structure');
  const paasFinding = byId.get('url-subdomain-paas');
  const lexicalFinding = byId.get('url-lexical-extensions');
  const redirectFinding = byId.get('redirect-chain-analysis');
  const fileDirectFinding = byId.get('file-direct-download');
  const fileLinkedFinding = byId.get('file-linked-downloads');
  const tlsStrengthFinding = byId.get('tls-cipher-strength');

  const hasCredentialRisk = credFinding?.status === 'failed';
  const hasUnwrappedPassword =
    Boolean(credFinding?.evidence.includes('unwrapped in <div>:')) &&
    !/unwrapped in <div>:\s*0\b/.test(credFinding?.evidence || '');
  const hasAnyPasswordInput =
    hasUnwrappedPassword ||
    (Boolean(credFinding?.evidence) && !/Password fields:\s*0\b/.test(credFinding?.evidence || ''));
  const hasSensitiveFields =
    credFinding?.status === 'warning' || credFinding?.status === 'failed';
  const hasCrossOriginForm =
    Boolean(credFinding?.evidence) && !/Cross-origin actions:\s*\[none\]/.test(credFinding?.evidence || '');
  const hasFakeUpdateAlert =
    /Fake software update|system security warning/i.test(socialFinding?.evidence || '');
  const hasExplicitPhishingLure =
    socialFinding?.status === 'failed' || socialFinding?.status === 'warning';
  const hasPhishingPageArtifact =
    /Explicit social-engineering \/ phishing page markers/i.test(socialFinding?.evidence || '');
  const hasMissingTitleCreds =
    structFinding?.status === 'warning' && (structFinding?.evidence || '').includes('Title: NONE');
  const hasPhishingLexical =
    lexicalFinding?.status === 'warning' || lexicalFinding?.status === 'failed';
  const isPaasHosted =
    Boolean(paasFinding?.evidence) && !/Shared PaaS:\s*No/i.test(paasFinding?.evidence || '');
  const isYoungDomain = byId.get('domain-age')?.status === 'failed';
  const hasHttpsDowngrade = (redirectFinding?.evidence || '').includes('HTTPS->HTTP');
  const hasTlsInvalid =
    byId.get('tls-chain-trust')?.status === 'failed' ||
    byId.get('tls-availability')?.status === 'failed' ||
    tlsStrengthFinding?.status === 'failed';
  const hasDangerousFile =
    fileDirectFinding?.status === 'failed' || fileLinkedFinding?.status === 'failed';
  const hasContentUnreachable = byId.has('content-unavailable');

  // Rule 1: Confirmed external threat-intelligence hit
  if (hasExternalFlag) {
    rawScore += 25;
    minScoreFloor = Math.max(minScoreFloor, 84);
    correlationNotes.push({
      en: 'External Threat Feed Hit: One or more active threat-intelligence providers flagged this URL/domain/IP, elevating risk to Critical.',
      ar: 'بلاغ استخبارات تهديدات: أبلغ مزود أو أكثر عن خطورة هذا الرابط أو النطاق أو عنوان IP، مما يرفع التصنيف إلى حرج.',
    });
  } else if (hasExternalSuspicious) {
    rawScore += 8;
    minScoreFloor = Math.max(minScoreFloor, 36);
  }

  // Rule 2: Domain deception / homograph / open redirect + credential or social-engineering signals
  if (
    hasDomainDeceptionFailed &&
    (hasAnyPasswordInput || hasExplicitPhishingLure || hasBrandImpersonation || isYoungDomain || isPaasHosted)
  ) {
    rawScore += 20;
    minScoreFloor = Math.max(minScoreFloor, hasAnyPasswordInput || hasBrandImpersonation ? 82 : 70);
    correlationNotes.push({
      en: 'Deceptive Domain Identity + Exploitation Signal: Visual spoofing, homoglyphs, subdomain masking, or open redirect co-occurs with credential or phishing lures.',
      ar: 'تطابق تمويه الهوية مع مؤشرات الاستغلال: تمويه النطاق أو الأحرف المتشابهة أو التوجيه المفتوح يترافق مع استدراج بيانات أو علامات تصيد.',
    });
  }

  // Rule 3: Unwrapped password input (outside <form>) + deceptive / social-engineering / missing-title / PaaS indicators
  if (
    hasUnwrappedPassword &&
    (hasFakeUpdateAlert || hasExplicitPhishingLure || hasMissingTitleCreds || hasPhishingLexical || isPaasHosted)
  ) {
    rawScore += 24;
    minScoreFloor = Math.max(minScoreFloor, 74);
    correlationNotes.push({
      en: 'Correlated Phishing Pattern: Password input outside a standard <form> co-occurs with deceptive lures, missing <title>, or shared PaaS hosting.',
      ar: 'ترابط مؤشرات التصيد: وجود حقل كلمة مرور خارج نموذج <form> قياسي بالتزامن مع مؤشرات خداع أو غياب <title> أو استضافة تشاركية.',
    });
  }

  // Rule 4: Password or sensitive credential collection + fake alert / social engineering / cross-origin submission
  if (
    (hasAnyPasswordInput || hasSensitiveFields) &&
    (hasFakeUpdateAlert || hasExplicitPhishingLure || hasCrossOriginForm || hasBrandImpersonation)
  ) {
    const comboCount = [
      hasFakeUpdateAlert,
      hasExplicitPhishingLure,
      hasCrossOriginForm,
      hasBrandImpersonation,
      hasMissingTitleCreds,
    ].filter(Boolean).length;

    rawScore += 18 + comboCount * 5;
    minScoreFloor = Math.max(minScoreFloor, comboCount >= 2 ? 82 : 68);
    correlationNotes.push({
      en: 'Credential Harvesting Correlation: Login or sensitive inputs appear alongside deceptive lures, fake alerts, impersonation, or third-party endpoints.',
      ar: 'ارتباط حصد بيانات الاعتماد: حقول كلمات المرور مقترنة بعبارات تضليل أو تحذيرات مزيفة أو انتحال.',
    });
  }

  // Rule 5: Explicit phishing artifact / lure on PaaS or phishing-lexical URL (catches test/kit phishing pages even without GSB or password input)
  if (hasPhishingPageArtifact || (socialFinding?.status === 'failed' && (isPaasHosted || hasPhishingLexical))) {
    rawScore += 26;
    minScoreFloor = Math.max(minScoreFloor, 76);
    correlationNotes.push({
      en: 'Phishing Lure & Infrastructure Correlation: Explicit social-engineering content detected alongside shared PaaS hosting or phishing path indicators.',
      ar: 'ارتباط محتوى التصيد بالبنية المستضيفة: تم رصد نصوص خداع وتصيد صريحة على استضافة تشاركية أو مسار رابط مشبوه.',
    });
  }

  // Rule 6: Brand impersonation + newly registered domain or PaaS hosting
  if (hasBrandImpersonation && (isYoungDomain || isPaasHosted || hasPhishingLexical)) {
    rawScore += 16;
    minScoreFloor = Math.max(minScoreFloor, 74);
    correlationNotes.push({
      en: 'Impersonation Infrastructure Correlation: Brand similarity detected on an unverified young domain or shared multi-tenant PaaS subdomain.',
      ar: 'انتحال هوية مع بنية استضافة غير موثقة: تشابه مع علامة تجارية معروفة على نطاق حديث أو استضافة تشاركية.',
    });
  }

  // Rule 7: Credential form over downgraded HTTP or invalid TLS
  if ((hasAnyPasswordInput || hasCredentialRisk) && (hasHttpsDowngrade || hasTlsInvalid)) {
    rawScore += 14;
    minScoreFloor = Math.max(minScoreFloor, 64);
    correlationNotes.push({
      en: 'Insecure Credential Transport: Login fields detected where HTTPS was downgraded or TLS validation failed.',
      ar: 'نقل غير آمن لبيانات الدخول: حقول تسجيل دخول على اتصال تم تخفيضه أو بشهادة غير صالحة.',
    });
  }

  // Rule 8: Dangerous executable or MIME-masqueraded download
  if (hasDangerousFile) {
    rawScore += 12;
    minScoreFloor = Math.max(minScoreFloor, 64);
    correlationNotes.push({
      en: 'High-Risk Binary / Masqueraded Download: Executable installer or mismatched file signature detected.',
      ar: 'خطر ملفات تنفيذية: رصد ملف قابل للتنفيذ أو تلاعب بامتداد الملف ونوعه الحقيقي.',
    });
  }

  // Rule 9: Multi-tenant PaaS + password field notice
  if (isPaasHosted && hasAnyPasswordInput) {
    minScoreFloor = Math.max(minScoreFloor, 60);
    correlationNotes.push({
      en: 'Shared Multi-Tenant PaaS Warning: Underlying platform domain age and wildcard TLS belong to the hosting provider, not the hosted credential page.',
      ar: 'تنبيه استضافة تشاركية: عمر النطاق الأساسي وشهادة TLS التلقائية تعود لمزود الاستضافة وليس لموثوقية صفحة تسجيل الدخول.',
    });
  }

  // Rule 10: Drive-by auto-download, malvertising, or invasive permissions combo
  const autoDownloadFinding = byId.get('content-auto-download');
  const malAdsFinding = byId.get('content-malicious-ads');
  const permFinding = byId.get('content-permissions-audit');
  if (autoDownloadFinding?.status === 'failed') {
    rawScore += 18;
    minScoreFloor = Math.max(minScoreFloor, 72);
    correlationNotes.push({
      en: 'Drive-By Download / HTML Smuggling Signal: Page triggers automatic file downloads or assembles payloads client-side without explicit user consent.',
      ar: 'محفز تنزيل تلقائي أو تهريب ملفات: تحتوي الصفحة على آلية لبدء تنزيل ملفات تلقائياً أو بناء حمولات عبر المتصفح.',
    });
  }
  if (malAdsFinding?.status === 'failed' || (malAdsFinding?.status === 'warning' && permFinding?.status !== 'pass')) {
    rawScore += 12;
    minScoreFloor = Math.max(minScoreFloor, 56);
    correlationNotes.push({
      en: 'Malvertising / Intrusive Permission Correlation: Deceptive ad/popunder triggers co-occur with aggressive browser permission requests.',
      ar: 'ارتباط الإعلانات الخبيثة والأذونات: تزامن مؤشرات الإعلانات المنبثقة/خطف النقرات مع طلب أذونات متصفح حساسة.',
    });
  }

  const riskScore = Math.min(100, Math.max(minScoreFloor, Math.round(rawScore)));

  const totalChecks = findings.length;
  const authoritativeRatio = totalChecks > 0 ? (totalChecks - incompleteChecks) / totalChecks : 0;
  const avgConfidence = totalChecks > 0 ? confidenceSum / totalChecks : 0;
  const confidenceScore = Math.round(avgConfidence * (0.45 + 0.55 * authoritativeRatio));
  const confidenceLabel: 'High' | 'Medium' | 'Low' =
    confidenceScore >= 75 ? 'High' : confidenceScore >= 50 ? 'Medium' : 'Low';

  const availableProviders = providers.filter(
    (p) => p.status === 'clean' || p.status === 'flagged' || p.status === 'suspicious'
  ).length;
  const totalProviders = providers.length;

  // Deterministic RiskClassification (never marks incomplete/unverified targets as SAFE_INDICATORS)
  let classification: RiskClassification;
  if (
    hasExternalFlag ||
    riskScore >= 80 ||
    (hasBrandImpersonation && hasAnyPasswordInput && hasFakeUpdateAlert)
  ) {
    classification = 'CRITICAL';
  } else if (
    riskScore >= 58 ||
    (hasAnyPasswordInput && (hasFakeUpdateAlert || hasExplicitPhishingLure || hasUnwrappedPassword))
  ) {
    classification = 'HIGH';
  } else if (riskScore >= 30 || failedChecks >= 2) {
    classification = 'MEDIUM';
  } else if (hasContentUnreachable || authoritativeRatio < 0.48 || (availableProviders === 0 && riskScore < 12)) {
    classification = 'UNKNOWN';
  } else if (riskScore >= 12 || warningChecks > 0 || failedChecks > 0) {
    classification = 'LOW';
  } else {
    classification = 'SAFE_INDICATORS';
  }

  let verdict: FinalVerdict;
  if (classification === 'CRITICAL') {
    verdict = 'Critical';
  } else if (classification === 'HIGH') {
    verdict = 'High Risk';
  } else if (classification === 'MEDIUM') {
    verdict = 'Suspicious';
  } else if (classification === 'UNKNOWN') {
    verdict = 'Inconclusive';
  } else if (classification === 'LOW') {
    verdict = 'Low Risk';
  } else {
    verdict = 'Safe Indicators Found';
  }

  const recommendation: BilingualText =
    classification === 'CRITICAL'
      ? {
          en: 'Do not visit, sign in, grant permissions, or download files. Critical malicious, credential-harvesting, or confirmed threat indicators were detected.',
          ar: 'لا تفتح الرابط ولا تُدخل أي بيانات أو توافق على أي أذونات أو تنزيلات. تم رصد مؤشرات تهديد حرجة أو تصيد مؤكد.',
        }
      : classification === 'HIGH'
        ? {
            en: 'Avoid submitting credentials or interacting with prompts on this page. High-risk phishing, deceptive identity, or fake update lures were detected.',
            ar: 'تجنب إدخال أي بيانات أو التفاعل مع النوافذ في هذه الصفحة. توجد مؤشرات خطورة عالية لاحتمال التصيد أو الخداع.',
          }
        : classification === 'MEDIUM'
          ? {
              en: 'Proceed only after independent domain verification. Suspicious infrastructure, form behavior, or deceptive patterns were identified.',
              ar: 'توخَّ الحذر وتحقق من الموقع عبر مصدر رسمي مستقل. تم رصد مؤشرات بنية أو نماذج مشبوهة.',
            }
          : classification === 'UNKNOWN'
            ? {
                en: 'Inspection could not retrieve sufficient telemetry (unreachable content or missing threat-feed checks). Unverified links must never be assumed safe.',
                ar: 'لم تكتمل بيانات الفحص بالقدر الكافي (تعذر جلب المحتوى أو نقص الفحوصات). عدم اكتمال الفحص لا يعني الأمان.',
              }
            : classification === 'LOW'
              ? {
                  en: 'Minor technical or posture warnings were observed without confirmed threat hits. Verify the domain spelling carefully before signing in.',
                  ar: 'تم رصد ملاحظات فنية طفيفة دون مؤشرات تهديد مؤكدة. تأكد من صحة اسم النطاق قبل تسجيل الدخول.',
                }
              : {
                  en: 'Safe indicators observed across completed deterministic checks and active threat feeds at scan time. Continue standard vigilance against zero-day threats.',
                  ar: 'المؤشرات المكتملة وقت التحليل إيجابية عبر الفحوصات الحتمية ومزودي التهديدات النشطين. احرص دائماً على التحقق اليدوي من الرابط.',
                };

  // Build concise, evidence-backed Top Reasons driving the final score & verdict
  const sevRank: Record<RiskSeverity, number> = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    unknown: 1,
    informational: 0,
  };
  const prioritized = [...findings]
    .filter((f) => f.status === 'failed' || f.status === 'warning' || f.status === 'unknown')
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return sevRank[b.severity] - sevRank[a.severity];
    });

  const topReasons: BilingualText[] = [];
  for (const cn of correlationNotes.slice(0, 2)) {
    topReasons.push(cn);
  }
  for (const f of prioritized) {
    if (topReasons.length >= 5) break;
    if (f.status === 'unknown' && f.weight === 0 && classification !== 'UNKNOWN') continue;
    topReasons.push({
      en: `${f.test.en}: ${f.result.en}`,
      ar: `${f.test.ar}: ${f.result.ar}`,
    });
  }
  if (topReasons.length === 0) {
    topReasons.push({
      en: `All ${passedChecks} completed deterministic checks passed with ${availableProviders}/${totalProviders} active threat-intel providers returning 0 hits.`,
      ar: `اجتازت الفحوصات المكتملة (${passedChecks}) التحقق دون مؤشرات خطرة مع استجابة ${availableProviders}/${totalProviders} من مزودي التهديدات.`,
    });
  }

  const sections: TechnicalSectionSummary[] = SECTION_ORDER.map((sectionId) => {
    const secFindings = findings.filter((f) => f.section === sectionId);
    const st = sectionStatus(secFindings);
    const passed = secFindings.filter((f) => f.status === 'pass').length;
    const warn = secFindings.filter((f) => f.status === 'warning').length;
    const failed = secFindings.filter((f) => f.status === 'failed').length;
    const unk = secFindings.filter((f) => f.status === 'unknown').length;

    let summary: BilingualText;
    if (secFindings.length === 0) {
      summary = {
        en: 'No observations recorded for this module.',
        ar: 'لم تُسجل ملاحظات لهذا القسم.',
      };
    } else if (failed > 0) {
      summary = {
        en: `${failed} failed check(s) requiring attention.`,
        ar: `تم رصد ${failed} فحصاً فاشلاً يتطلب الانتباه.`,
      };
    } else if (warn > 0) {
      summary = {
        en: `${warn} warning indicator(s) observed.`,
        ar: `تم رصد ${warn} مؤشر تحذير.`,
      };
    } else if (unk === secFindings.length) {
      summary = {
        en: 'Telemetry unavailable or not applicable in current runtime.',
        ar: 'البيانات غير متاحة أو تعذر إتمام الفحص في البيئة الحالية.',
      };
    } else {
      summary = {
        en: `All ${passed} completed check(s) passed without anomaly.`,
        ar: `اجتازت الفحوصات المكتملة (${passed}) التحقق دون مؤشرات شاذة.`,
      };
    }

    return {
      id: sectionId,
      title: SECTION_TITLES[sectionId],
      status: st,
      severity: worstSeverity(secFindings),
      summary,
      findingsCount: secFindings.length,
      passedCount: passed,
      warningCount: warn,
      failedCount: failed,
      unknownCount: unk,
    };
  });

  return {
    riskScore,
    classification,
    verdict,
    confidenceScore,
    confidenceLabel,
    recommendation,
    topReasons,
    correlationNotes,
    summaryStats: {
      totalChecks,
      passedChecks,
      warningChecks,
      failedChecks,
      criticalFindings,
      incompleteChecks,
      availableProviders,
      totalProviders,
    },
    sections,
  };
}
