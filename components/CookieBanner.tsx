'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const CONSENT_COOKIE = 'gearbnb_cookie_consent';

export default function CookieBanner() {
  const t = useTranslations('cookies');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(CONSENT_COOKIE);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONSENT_COOKIE, 'accepted');
    }
    setVisible(false);
  };

  const reject = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CONSENT_COOKIE, 'rejected');
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="max-w-3xl w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-medium text-gray-900 mb-1">{t('title')}</p>
          <p>{t('text')}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={reject}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {t('reject')}
          </button>
          <button
            type="button"
            onClick={accept}
            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
