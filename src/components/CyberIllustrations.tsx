import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Language } from '../types/scan';
import cyberLabImg from '../assets/images/cyber_lab_telemetry_1794960253167.jpg';
import threatIntelImg from '../assets/images/threat_intel_nodes_1794960254388.jpg';
import binaryInspectorImg from '../assets/images/binary_inspector_optics_1794960255072.jpg';
import vaultArchiveImg from '../assets/images/security_vault_archive_1794960255137.jpg';

function StudioVisualFrame({
  src,
  alt,
  caption,
  aspectClass = 'aspect-video',
}: {
  src: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex ${aspectClass} w-full flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F7F7F7] p-6 text-center dark:border-[#202020] dark:bg-[#080808]`}
      >
        <ShieldCheck className="h-10 w-10 text-[#FF263F]" aria-hidden="true" />
        <p className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">{alt}</p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-black dark:border-[#202020]">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${aspectClass} w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]`}
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-3">
          <p className="text-xs font-medium text-white/95">{caption}</p>
        </div>
      )}
    </div>
  );
}

export function HeroTelemetryIllustration({ lang }: { lang: Language }) {
  return (
    <StudioVisualFrame
      src={cyberLabImg}
      aspectClass="aspect-[16/9]"
      alt={
        lang === 'ar'
          ? 'مختبر الفحص السيبراني المتعدد الطبقات لمنصة Scan Link SM'
          : 'Scan Link SM multi-layer cybersecurity inspection laboratory'
      }
      caption={
        lang === 'ar'
          ? 'مختبر الفحص الحتمي · DNS و TLS و DOM وملفات الذاكرة واستخبارات التهديدات'
          : 'Deterministic Inspection Lab · SSRF Guard · TLS · Static DOM · Threat Feeds'
      }
    />
  );
}

export function ThreatIntelNetworkVisual({ lang }: { lang: Language }) {
  return (
    <StudioVisualFrame
      src={threatIntelImg}
      aspectClass="aspect-[16/9]"
      alt={
        lang === 'ar'
          ? 'شبكة عقد استخبارات التهديدات السيبرانية والتشفير'
          : 'Global threat intelligence network nodes and cryptographic inspection'
      }
      caption={
        lang === 'ar'
          ? 'ربط فوري بمزودي استخبارات التهديدات العالميين مع عزل كامل للمفاتيح'
          : 'Live External Threat Intelligence Matrix · Zero Client Secret Exposure'
      }
    />
  );
}

export function BinaryInspectorVisual({ lang }: { lang: Language }) {
  return (
    <StudioVisualFrame
      src={binaryInspectorImg}
      aspectClass="aspect-[4/3]"
      alt={
        lang === 'ar'
          ? 'فحص التوقيع الثنائي للملفات والشهادات بالذاكرة دون تشغيل'
          : 'Optical in-memory binary signature and certificate packet inspection'
      }
      caption={
        lang === 'ar'
          ? 'تحليل التوقيع الثنائي بالذاكرة فقط · دون تنفيذ أي ملفات أو سكربتات'
          : 'In-Memory Magic-Byte & SHA-256 Inspection · Zero Execution Sandbox'
      }
    />
  );
}

export function EmptyHistoryIllustration({ lang = 'en' }: { lang?: Language }) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <StudioVisualFrame
        src={vaultArchiveImg}
        aspectClass="aspect-[4/3]"
        alt={
          lang === 'ar'
            ? 'خزنة سجل الفحوصات الآمنة المحلية'
            : 'Encrypted local scan history archive vault'
        }
      />
    </div>
  );
}

export function ScanningRadarPulse() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-16 w-16 shrink-0" aria-hidden="true">
      <circle cx="60" cy="60" r="54" className="stroke-zinc-200 dark:stroke-[#222222]" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="38" className="stroke-zinc-300 dark:stroke-[#2A2A2A]" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="60" cy="60" r="20" stroke="#FF263F" strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M60 60 L98 32" stroke="#FF263F" strokeWidth="2.2" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 60 60"
          to="360 60 60"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="60" cy="60" r="5" fill="#FF263F" />
    </svg>
  );
}
