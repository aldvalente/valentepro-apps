'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    if (locale === newLocale) return;

    // Handle root path and paths without explicit locale prefix
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      router.push(newLocale === 'en' ? '/' : `/${newLocale}`);
      return;
    }

    // If first segment is a known locale, swap it, otherwise prefix
    const supportedLocales = ['en', 'it'];
    if (supportedLocales.includes(segments[0])) {
      segments[0] = newLocale === 'en' ? '' : newLocale;
    } else {
      if (newLocale !== 'en') {
        segments.unshift(newLocale);
      }
    }

    const newPathname = '/' + segments.filter(Boolean).join('/');
    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1">
      <button
        onClick={() => switchLanguage('en')}
        className={`text-sm font-medium ${
          locale === 'en'
            ? 'text-primary-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchLanguage('it')}
        className={`text-sm font-medium ${
          locale === 'it'
            ? 'text-primary-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        IT
      </button>
    </div>
  );
}
