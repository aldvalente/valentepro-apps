import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('privacy');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacy');

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
      <p className="text-sm text-gray-500">{t('lastUpdated')}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('controllerTitle')}</h2>
        <p className="text-gray-700">{t('controllerText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('dataTitle')}</h2>
        <p className="text-gray-700">{t('dataText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('purposesTitle')}</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>{t('purposesAccount')}</li>
          <li>{t('purposesBookings')}</li>
          <li>{t('purposesSecurity')}</li>
          <li>{t('purposesCommunication')}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('legalBasisTitle')}</h2>
        <p className="text-gray-700">{t('legalBasisText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('retentionTitle')}</h2>
        <p className="text-gray-700">{t('retentionText')}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('rightsTitle')}</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>{t('rightAccess')}</li>
          <li>{t('rightRectification')}</li>
          <li>{t('rightErasure')}</li>
          <li>{t('rightRestriction')}</li>
          <li>{t('rightPortability')}</li>
          <li>{t('rightObject')}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">{t('contactTitle')}</h2>
        <p className="text-gray-700">{t('contactText')}</p>
      </section>

      <p className="text-xs text-gray-500 pt-4">
        {t('disclaimer')}
      </p>
    </main>
  );
}
