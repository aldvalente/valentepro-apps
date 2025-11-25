import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('cookies');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function CookiesPage() {
  const t = await getTranslations('cookies');

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('pageTitle')}</h1>
      <p className="text-sm text-gray-500">{t('lastUpdated')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('whatAreCookiesTitle')}</h2>
        <p className="text-gray-700">{t('whatAreCookiesText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('typesTitle')}</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>{t('necessary')}</li>
          <li>{t('functional')}</li>
          <li>{t('analytics')}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('managementTitle')}</h2>
        <p className="text-gray-700">{t('managementText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('changesTitle')}</h2>
        <p className="text-gray-700">{t('changesText')}</p>
      </section>

      <p className="text-xs text-gray-500 pt-4">{t('disclaimer')}</p>
    </main>
  );
}
