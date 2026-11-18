import type { MouseEvent } from 'react';
import { ExternalLink, Globe, Send } from 'lucide-react';
import type { AppPage, Language } from '../types/scan';
import { UI_COPY } from '../i18n/translations';
import { BrandMark } from './BrandMark';

interface FooterProps {
  lang: Language;
  onNavigate: (page: AppPage) => void;
  onOpenPrivacy: () => void;
}

export function Footer({ lang, onNavigate, onOpenPrivacy }: FooterProps) {
  const handleLink = (page: AppPage, e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <footer className="border-t border-[#E5E7EB] bg-white dark:border-[#202020] dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Official Theme-Matched Logo */}
          <div className="space-y-3">
            <div className="flex items-center">
              <BrandMark className="h-10 w-auto max-w-[210px]" />
            </div>

            <div className="space-y-1">
              <p className="font-display text-xs font-bold text-zinc-950 dark:text-white">
                {UI_COPY.footer.rights[lang]}
              </p>
              <p className="font-mono text-xs text-[#FF263F] font-semibold">
                {lang === 'en'
                  ? 'Created and developed by: AlQeyadah AlZaeem'
                  : 'تم التطوير والإنشاء بواسطة: القيادة الزعيم'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <span>{UI_COPY.footer.proprietaryTag[lang]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  {UI_COPY.footer.protectedSlot[lang]}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation + Legal + Developer Links */}
          <div className="flex flex-col gap-4 lg:items-end">
            <nav
              aria-label={lang === 'ar' ? 'روابط التذييل' : 'Footer navigation'}
              className="flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              <a href="/" onClick={(e) => handleLink('home', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.home[lang]}
              </a>
              <a href="/scanner" onClick={(e) => handleLink('scanner', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.scanner[lang]}
              </a>
              <a href="/providers" onClick={(e) => handleLink('providers', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.providers[lang]}
              </a>
              <a href="/history" onClick={(e) => handleLink('history', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.history[lang]}
              </a>
              <a href="/about" onClick={(e) => handleLink('about', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.about[lang]}
              </a>
              <a href="/privacy" onClick={(e) => handleLink('privacy', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.privacy[lang]}
              </a>
              <a href="/terms" onClick={(e) => handleLink('terms', e)} className="hover:text-[#FF263F]">
                {UI_COPY.nav.terms[lang]}
              </a>
              <button type="button" onClick={onOpenPrivacy} className="text-[#FF263F] hover:underline">
                {UI_COPY.consent.manageSettings[lang]}
              </button>
            </nav>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <a
                href="https://t.me/A_Y_TR"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] px-3 py-1.5 font-medium text-zinc-800 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-[#0D0D0D] dark:text-zinc-200 transition-colors"
              >
                <Send className="h-3.5 w-3.5 text-[#FF263F]" aria-hidden="true" />
                <span dir="ltr">@A_Y_TR</span>
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
              </a>
              <a
                href="https://mohamed-abualsaud.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] px-3 py-1.5 font-medium text-zinc-800 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-[#0D0D0D] dark:text-zinc-200 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-[#FF263F]" aria-hidden="true" />
                <span>{lang === 'en' ? 'mohamed-abualsaud.vercel.app' : 'موقع المطور'}</span>
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 border-t border-[#E5E7EB] pt-4 text-[11px] text-zinc-500 dark:border-[#202020] dark:text-zinc-500">
          {UI_COPY.footer.disclaimer[lang]}
        </p>
      </div>
    </footer>
  );
}
