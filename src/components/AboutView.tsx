import {
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Send,
  ShieldAlert,
} from 'lucide-react';
import type { Language, ProviderDescriptor } from '../types/scan';
import { tOperationalState, UI_COPY } from '../i18n/translations';
import { BrandMark } from './BrandMark';
import { BinaryInspectorVisual, HeroTelemetryIllustration } from './CyberIllustrations';

interface AboutViewProps {
  lang: Language;
  providers: ProviderDescriptor[];
}

export function AboutView({ lang, providers }: AboutViewProps) {
  const stack = [
    {
      name: 'Deterministic Correlation Engine',
      role: {
        en: 'Pure rule-weighted evidence scoring & multi-signal phishing correlation (Zero AI)',
        ar: 'محرك ارتباط قواعدي حتمي لاحتساب المخاطر وكشف التصيد (بدون ذكاء اصطناعي)',
      },
    },
    {
      name: 'SSRF & DNS Pinning Guard',
      role: {
        en: 'Blocks private CIDRs, localhost, link-local, and cloud metadata IPs at every hop',
        ar: 'حظر الشبكات الداخلية وعناوين البيانات السحابية قبل وبعد كل قفزة توجيه',
      },
    },
    {
      name: 'Node TLS + IANA RDAP + DoH',
      role: {
        en: 'Direct X.509 handshake, registry RDAP lookup, and Cloudflare DoH verification',
        ar: 'فحص شهادات الخادم وبيانات التسجيل الرسمية والتحقق عبر DoH',
      },
    },
    {
      name: 'Static Cheerio DOM Inspector',
      role: {
        en: 'Analyzes credential fields, lures, scripts, and brand clones without executing JS',
        ar: 'تحليل DOM لكشف حقول السرقة وانتحال العلامات دون تنفيذ جافاسكربت',
      },
    },
    {
      name: 'In-Memory File Signature Check',
      role: {
        en: 'SHA-256 hashing and magic-byte vs MIME verification without writing binaries to disk',
        ar: 'فحص التوقيع الثنائي وبصمة SHA-256 في الذاكرة دون حفظ أو تشغيل الملفات',
      },
    },
    {
      name: 'React 19 + Express + Helmet',
      role: {
        en: 'Bilingual EN/AR RTL interface with strict CSP headers and backend secret isolation',
        ar: 'واجهة ثنائية اللغة مع ترويسات حماية CSP وعزل كامل للمفاتيح على الخادم',
      },
    },
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5 space-y-4">
          <BrandMark className="h-12 w-auto max-w-[230px]" />
          <div>
            <h1 className="font-display text-3xl font-extrabold text-zinc-950 dark:text-white">
              {UI_COPY.about.title[lang]}
            </h1>
            <p className="mt-1 text-xs font-bold text-[#FF263F]">{UI_COPY.brand.tagline[lang]}</p>
          </div>
          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
            {UI_COPY.about.description[lang]}
          </p>
        </div>
        <div className="lg:col-span-7">
          <HeroTelemetryIllustration lang={lang} />
        </div>
      </div>

      {/* Principles, Proprietary Status & Developer Attribution */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#202020] dark:bg-[#0D0D0D]">
          <div className="flex items-center gap-2 text-[#FF263F]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
              {UI_COPY.about.missionTitle[lang]}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {UI_COPY.about.missionBody[lang]}
          </p>
        </div>

        {/* Proprietary Closed-Source Protection */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#202020] dark:bg-[#0D0D0D]">
          <div className="flex items-center gap-2 text-[#FF263F]">
            <Code2 className="h-5 w-5" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
              {UI_COPY.about.proprietaryTitle[lang]}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {UI_COPY.about.proprietaryBody[lang]}
          </p>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-[#F7F7F7] px-3.5 py-2.5 text-xs font-mono text-zinc-600 dark:border-[#202020] dark:bg-black dark:text-zinc-400">
            {UI_COPY.about.proprietaryBadge[lang]}
          </div>
        </div>

        {/* Developer Identity: Mohamed Abu AlSaud SM */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
            {UI_COPY.about.developerTitle[lang]}
          </h2>
          <p className="mt-2 text-base font-bold text-[#FF263F]">
            {UI_COPY.about.developerName[lang]}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <a
              href="https://t.me/A_Y_TR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] px-3.5 py-2 font-semibold text-zinc-900 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-black dark:text-zinc-200 transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-[#FF263F]" aria-hidden="true" />
              <span dir="ltr">Telegram @A_Y_TR</span>
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
            </a>
            <a
              href="https://mohamed-abualsaud.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] px-3.5 py-2 font-semibold text-zinc-900 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-black dark:text-zinc-200 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-[#FF263F]" aria-hidden="true" />
              <span>{lang === 'en' ? 'Developer Website' : 'موقع المطور'}</span>
              <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Architecture Stack */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#202020] dark:bg-[#0D0D0D]">
        <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
          {UI_COPY.about.methodologyTitle[lang]}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {stack.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-4 dark:border-[#202020] dark:bg-black"
              >
                <p className="font-mono text-xs font-bold text-[#FF263F]">{item.name}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.role[lang]}
                </p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-5">
            <BinaryInspectorVisual lang={lang} />
          </div>
        </div>
      </div>

      {/* Live Providers Snapshot */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 dark:border-[#202020] dark:bg-[#0D0D0D]">
        <h2 className="font-display text-lg font-bold text-zinc-950 dark:text-white">
          {UI_COPY.homeSections.providersTitle[lang]}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {providers.map((p) => {
            const ok = p.operationalState === 'active' || p.operationalState === 'configured';
            return (
              <div
                key={p.id}
                className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-3.5 text-xs dark:border-[#202020] dark:bg-black"
              >
                <p className="font-bold text-zinc-950 dark:text-white">{p.name}</p>
                <p className="mt-0.5 text-zinc-500">{p.category}</p>
                <p
                  className={`mt-2 inline-flex items-center gap-1 font-semibold ${
                    ok ? 'text-[#16A34A]' : 'text-[#F59E0B]'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tOperationalState(p.operationalState, lang)}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
