import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useNegocio } from './NegocioProvider';
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
    title: `Admin - ${config.branding.nombre}`,
    description: `Panel de administración de ${config.branding.nombre}`,
  };
}

export default function AdminPage({ params }: PageProps) {
  const t = useTranslations('admin');
  const { config, primaryColor } = useNegocio();
  const { branding, modulos } = config;

  const stats = [
    { label: t('stats.bookingsToday'), value: '12', icon: '📅', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: t('stats.totalBookings'), value: '1,234', icon: '📊', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { label: t('stats.totalClients'), value: '567', icon: '👥', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { label: t('stats.revenue'), value: '$45,670', icon: '💰', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
  ];

  const recentBookings = [
    { id: '1', cliente: 'Juan Pérez', servicio: 'Corte + barba', fecha: '2024-01-20 10:00', estado: 'confirmada' },
    { id: '2', cliente: 'María García', servicio: 'Corte de cabello', fecha: '2024-01-20 11:00', estado: 'pendiente' },
    { id: '3', cliente: 'Carlos López', servicio: 'Arreglo de barba', fecha: '2024-01-20 14:00', estado: 'confirmada' },
    { id: '4', cliente: 'Ana Martínez', servicio: 'Corte de cabello', fecha: '2024-01-19 16:00', estado: 'completada' },
    { id: '5', cliente: 'Pedro Ruiz', servicio: 'Corte + barba', fecha: '2024-01-19 10:00', estado: 'cancelada' },
  ];

  const estadoStyles: Record<string, string> = {
    confirmada: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    completada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    cancelada: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    pendiente: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50" style={{ '--primary': primaryColor }}>
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
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                {t('adminBadge')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dashboardTitle')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('dashboardSubtitle', { nombre: branding.nombre })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', stat.color)}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('recentBookings')}</h2>
                <Link href={`/${params.locale}/${params.negocio}/admin/reservas`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  {t('viewAll')}
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="pb-3 px-6 font-medium">{t('table.client')}</th>
                      <th className="pb-3 px-6 font-medium">{t('table.service')}</th>
                      <th className="pb-3 px-6 font-medium">{t('table.dateTime')}</th>
                      <th className="pb-3 px-6 font-medium">{t('table.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{booking.cliente}</td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{booking.servicio}</td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{booking.fecha}</td>
                        <td className="py-4 px-6">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-medium', estadoStyles[booking.estado])}>
                            {t(`status.${booking.estado}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href={`/${params.locale}/${params.negocio}/admin/reservas/nueva`}
                  className={cn('p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all')}
                >
                  <div className="w-10 h-10 mx-auto mb-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('actions.newBooking')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('actions.newBookingDesc')}</p>
                </Link>
                <Link
                  href={`/${params.locale}/${params.negocio}/admin/items`}
                  className={cn('p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all')}
                >
                  <div className="w-10 h-10 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0h14" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('actions.manageItems')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('actions.manageItemsDesc')}</p>
                </Link>
                <Link
                  href={`/${params.locale}/${params.negocio}/admin/clientes`}
                  className={cn('p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all')}
                >
                  <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('actions.manageClients')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('actions.manageClientsDesc')}</p>
                </Link>
                <Link
                  href={`/${params.locale}/${params.negocio}/admin/configuracion`}
                  className={cn('p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all')}
                >
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('actions.settings')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('actions.settingsDesc')}</p>
                </Link>
              </div>
            </div>
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

const estadoStyles: Record<string, string> = {
  confirmada: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  completada: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  cancelada: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  pendiente: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
};