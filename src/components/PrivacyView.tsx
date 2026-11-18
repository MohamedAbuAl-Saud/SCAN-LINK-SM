import { Shield, Lock, Database, Trash2, Globe, Cpu, Cookie } from 'lucide-react';
import type { Language } from '../types/scan';

interface PrivacyViewProps {
  lang: Language;
}

export function PrivacyView({ lang }: PrivacyViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="border-b border-[#E5E7EB] pb-6 dark:border-[#202020]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF263F]/10 text-[#FF263F] border border-[#FF263F]/30">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-zinc-950 dark:text-white">
              {lang === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
            </h1>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              {lang === 'en' ? 'Scan Link SM · Last updated: November 2026' : 'Scan Link SM · آخر تحديث: نوفمبر ٢٠٢٦'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {/* Section 1 */}
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#FF263F]" />
            <span>{lang === 'en' ? '1. Information We Collect & Process' : '١. البيانات التي نجمعها ونعالجها'}</span>
          </h2>
          <p>
            {lang === 'en'
              ? 'Scan Link SM is engineered with privacy as a foundational constraint. When you submit a URL or domain for analysis, our backend processes the target strictly for security inspection (DNS resolution, certificate inspection, HTML source analysis, redirect tracing, and threat intelligence lookups). We do not collect personal identifying information (PII) unless voluntarily provided during support interactions.'
              : 'صُممت منصة Scan Link SM مع مراعاة الخصوصية كأولوية قصوى. عند إدخال رابط أو نطاق للفحص، يعالج الخادم الرابط حصراً لأغراض التحقق الأمني (فحص DNS، الشهادات، محتوى HTML، وتتبع إعادة التوجيه). لا نجمع أي بيانات شخصية تعريفية.'}
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-[#FF263F]" />
            <span>{lang === 'en' ? '2. Scan History & Local Storage' : '٢. سجل الفحوصات والتخزين المحلي'}</span>
          </h2>
          <p>
            {lang === 'en'
              ? 'Scan history reports are stored exclusively within your browser’s local storage (`scanlink_scan_history`) only after you grant optional history storage consent. Scan results are never uploaded to remote user databases or linked to user accounts. You maintain complete control and can delete individual entries or clear all saved reports instantly using the History panel.'
              : 'تُحفظ تقارير الفحص حصراً داخل التخزين المحلي لمتصفحك فقط بعد منح الموافقة الاختيارية. لا تُرفع تقارير الفحص أبداً إلى قواعد بيانات خارجية ولا تُربط بحسابات مستخدمين. يمكنك حذف أي سجل أو مسح كافة التقارير فوراً من لوحة السجل.'}
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#FF263F]" />
            <span>{lang === 'en' ? '3. Third-Party Threat Intelligence Providers' : '٣. مزودو استخبارات التهديدات الخارجية'}</span>
          </h2>
          <p>
            {lang === 'en'
              ? 'To deliver comprehensive threat intelligence, submitted URLs or hashes may be queried against authorized third-party security providers (such as VirusTotal API v3, URLhaus, OpenPhish, AlienVault OTX, and URLScan.io). Please note that external third-party providers operate under their own privacy policies and may log or retain queried URLs according to their respective service terms.'
              : 'لتقديم تحليلات استخباراتية دقيقة، قد يتم الاستعلام عن الروابط المفحوصة لدى مزودي أمان معتمدين (مثل VirusTotal وURLhaus وOpenPhish وAlienVault OTX وURLScan.io). يرجى ملاحظة أن هؤلاء المزودين يخضعون لسياسات الخصوصية الخاصة بهم.'}
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Cookie className="h-4 w-4 text-[#FF263F]" />
            <span>{lang === 'en' ? '4. Cookies & Intro Splash Expiration' : '٤. ملفات تعريف الارتباط وصلاحية الشاشة الترحيبية'}</span>
          </h2>
          <p>
            {lang === 'en'
              ? 'We use minimal first-party cookies and local storage items strictly for essential functionality: remembering your preferred theme (light/dark), language (English/Arabic), and managing the cinematic intro splash display cadence (using a 7-day maximum expiration with a 24-hour inactivity check). We do not employ third-party advertising cookies, tracking beacons, or cross-site user profiling.'
              : 'نستخدم أدوات تخزين محلي وملفات تعريف ارتباط أساسية فقط لتذكر تفضيلات المظهر (فاتح/داكن)، اللغة (إنجليزية/عربية)، وتنظيم ظهور الشاشة الترحيبية السينمائية (بحد أقصى ٧ أيام وفترة خمول ٢٤ ساعة). لا نستخدم أي ملفات إعلانية أو أدوات تتبع خارجية.'}
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D]">
          <h2 className="font-display text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-[#FF263F]" />
            <span>{lang === 'en' ? '5. User Data Deletion & Rights' : '٥. حقوق المستخدم وحذف البيانات'}</span>
          </h2>
          <p>
            {lang === 'en'
              ? 'Because scan history and preferences reside entirely in your browser storage, you have instant self-service deletion rights: clearing browser cache or clicking "Clear All" in the History and Privacy settings instantly eradicates all local records.'
              : 'نظراً لأن سجل الفحوصات والتفضيلات يُحفظ محلياً في متصفحك بالكامل، يمكنك حذف بياناتك فوراً عبر مسح التخزين المحلي للمتصفح أو النقر على "مسح الكل" في إعدادات الخصوصية والسجل.'}
          </p>
        </div>
      </div>
    </div>
  );
}
