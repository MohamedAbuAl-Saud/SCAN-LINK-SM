import { AlertOctagon, Home, Radar, RefreshCw, ShieldAlert } from 'lucide-react';
import type { Language } from '../types/scan';

interface ErrorViewProps {
  lang: Language;
  code?: '404' | '500';
  title?: string;
  description?: string;
  onGoHome: () => void;
  onGoScanner?: () => void;
  onRetry?: () => void;
}

export function ErrorView({
  lang,
  code = '404',
  title,
  description,
  onGoHome,
  onGoScanner,
  onRetry,
}: ErrorViewProps) {
  const isNotFound = code === '404';

  const resolvedTitle =
    title ||
    (isNotFound
      ? lang === 'ar'
        ? 'الصفحة غير موجودة (404)'
        : 'Page Not Found (404)'
      : lang === 'ar'
        ? 'حدث خطأ غير متوقع (500)'
        : 'Unexpected Application Error (500)');

  const resolvedDesc =
    description ||
    (isNotFound
      ? lang === 'ar'
        ? 'الرابط الذي طلبته غير متاح أو تم نقله. يمكنك العودة إلى الصفحة الرئيسية أو استخدام فاحص الروابط مباشرة.'
        : 'The requested page does not exist or may have been moved. Return to the homepage or launch the URL Scanner.'
      : lang === 'ar'
        ? 'تعذر عرض هذه الواجهة بسبب خطأ داخلي في العرض. يمكنك إعادة المحاولة أو العودة للرئيسية بأمان.'
        : 'We encountered an unexpected rendering error. You can safely retry or return to the homepage.');

  return (
    <section
      aria-labelledby="error-page-title"
      className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm dark:border-[#202020] dark:bg-[#0D0D0D] sm:p-12 sm-red-glow">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF263F]/35 bg-[#FF263F]/10 text-[#FF263F]">
          {isNotFound ? (
            <ShieldAlert className="h-8 w-8" aria-hidden="true" />
          ) : (
            <AlertOctagon className="h-8 w-8" aria-hidden="true" />
          )}
        </div>

        <p dir="ltr" className="mt-5 font-mono text-sm font-bold tracking-widest text-[#FF263F]">
          HTTP {code}
        </p>

        <h1
          id="error-page-title"
          className="font-display mt-2 text-2xl font-extrabold text-zinc-950 dark:text-white sm:text-3xl"
        >
          {resolvedTitle}
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {resolvedDesc}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF263F] px-5 text-xs font-bold text-white hover:bg-[#E01E35] transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>{lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </button>

          {onGoScanner && (
            <button
              type="button"
              onClick={onGoScanner}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F7F7F7] px-5 text-xs font-semibold text-zinc-900 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-black dark:text-zinc-200 transition-colors"
            >
              <Radar className="h-4 w-4 text-[#FF263F]" aria-hidden="true" />
              <span>{lang === 'ar' ? 'فاحص الروابط' : 'Open URL Scanner'}</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F7F7F7] px-5 text-xs font-semibold text-zinc-900 hover:border-[#FF263F] hover:text-[#FF263F] dark:border-[#202020] dark:bg-black dark:text-zinc-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-[#FF263F]" aria-hidden="true" />
              <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
