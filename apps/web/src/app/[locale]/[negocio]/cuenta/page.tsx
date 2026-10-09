import type { CSSProperties } from 'react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
    title: `Mi cuenta - ${config.branding.nombre}`,
    description: `Ãrea de cliente de ${config.branding.nombre}`,
  };
}

export default function CuentaPage({ params }: PageProps) {
  const t = useTranslations('account');
  const config = getNegocioConfig(params.negocio)!;
  const primaryColor = config.branding.colorPrimario;
  const { branding, modulos } = config;

  const mockUser = {
    nombre: 'Juan PÃ©rez',
    email: 'juan@email.com',
    telefono: '+58 424 123 4567',
    reservas: [
      { id: '1', servicio: 'Corte + barba', fecha: '2024-01-20', hora: '10:00', estado: 'confirmada' },
      { id: '2', servicio: 'Corte de cabello', fecha: '2024-01-15', hora: '14:30', estado: 'completada' },
      { id: '3', servicio: 'Arreglo de barba', fecha: '2024-01-10', hora: '11:00', estado: 'cancelada' },
    ],
  };

  const estadoStyles: Record<string, string> = {
    confirmada: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    completada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    cancelada: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    pendiente: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ '--primary': primaryColor } as CSSProperties}>
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href={`/${params.locale}/${params.negocio}`} className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              {branding.logo && (
                <img src={branding.logo} alt={branding.nombre} className="h-10 w-auto rounded-lg" />
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">{branding.nombre}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('subtitle', { nombre: mockUser.nombre })}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="text-center mb-6">
                <div className={cn('w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600 dark:text-primary-400')}>
                  {mockUser.nombre.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{mockUser.nombre}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{mockUser.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{mockUser.telefono}</p>
              </div>
              <Link
                href={`/${params.locale}/${params.negocio}/cuenta/editar`}
                className={cn('w-full py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors', 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400')}
              >
                {t('editProfile')}
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('myBookings')}</h2>
                <Link
                  href={`/${params.locale}/${params.negocio}/reservar`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('newBooking')}
                </Link>
              </div>
              <div className="space-y-3">
                {mockUser.reservas.map((reserva) => (
                  <div key={reserva.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{reserva.servicio}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(reserva.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las {reserva.hora}
                        </p>
                      </div>
                    </div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', estadoStyles[reserva.estado])}>
                      {t(`status.${reserva.estado}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {modulos.puntos && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('loyaltyPoints')}</h2>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1,250 {t('points')}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div className="bg-primary-600 h-4 rounded-full" style={{ width: '62%' }} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {t('nextReward', { points: 250 })}
                </p>
              </div>
            )}
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