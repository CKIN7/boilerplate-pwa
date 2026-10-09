import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getNegocioConfig } from '@/lib/config/loader';
import { cn } from '@/lib/utils';

interface PageProps {
  params: { locale: string; negocio: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { getNegocioConfig } = await import('@/lib/config/loader');
  const config = getNegocioConfig(params.negocio);
  
  if (!config) {
    return { title: 'Negocio no encontrado' };
  }

  return {
    title: `Reservar - ${config.branding.nombre}`,
    description: `Reserva tu cita en ${config.branding.nombre}`,
  };
}

export default function ReservarPage({ params }: PageProps) {
  const t = useTranslations('booking');
  const config = getNegocioConfig(params.negocio)!;
  const primaryColor = config.branding.colorPrimario;
  const { branding, modulos, textos } = config;
  const currentTextos = textos[params.locale as 'es' | 'en'] || textos.es;

  if (!modulos.reservas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('notAvailable')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('notAvailableDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ '--primary': primaryColor } as CSSProperties}>
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a href={`/${params.locale}/${params.negocio}`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              {branding.logo && (
                <img src={branding.logo} alt={branding.nombre} className="h-10 w-auto rounded-lg" />
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">{branding.nombre}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {currentTextos.cta}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <form className="space-y-6" id="booking-form">
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('serviceLabel')}
              </label>
              <select
                id="service"
                name="service"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-colors'
                )}
                required
              >
                <option value="">{t('selectService')}</option>
                <option value="1">{t('service1')}</option>
                <option value="2">{t('service2')}</option>
                <option value="3">{t('service3')}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('dateLabel')}
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-colors'
                  )}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('timeLabel')}
                </label>
                <select
                  id="time"
                  name="time"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-colors'
                  )}
                  required
                >
                  <option value="">{t('selectTime')}</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('nameLabel')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-colors'
                  )}
                  required
                  placeholder={t('namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('phoneLabel')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'transition-colors'
                  )}
                  required
                  placeholder={t('phonePlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-colors'
                )}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('notesLabel')}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600',
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-colors resize-none'
                )}
                placeholder={t('notesPlaceholder')}
              />
            </div>

            <button
              type="submit"
              className={cn(
                'w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all',
                'bg-primary-600 text-white hover:bg-primary-700',
                'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {t('submitBtn')}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {t('confirmationNote')}
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} {branding.nombre}. {t('footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}