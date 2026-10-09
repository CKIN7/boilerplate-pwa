import { useTranslations } from 'next-intl';

export default function NegocioPage({ params }: { params: { locale: string; negocio: string } }) {
  const t = useTranslations('landing');

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            {params.negocio}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>
    </main>
  );
}
