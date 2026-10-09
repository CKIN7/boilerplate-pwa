'use client';

import { useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BusinessConfig {
  slug: string;
  rubro: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  colorPrimario: string;
  colorSecundario: string;
  textos: {
    es: { heroTitulo: string; heroSubtitulo: string; cta: string };
    en: { heroTitulo: string; heroSubtitulo: string; cta: string };
  };
  modulos: {
    reservas: boolean;
    catalogo: boolean;
    carrito: boolean;
    puntos: boolean;
    recordatorios: boolean;
    resenas: boolean;
  };
}

const demoBusinesses: BusinessConfig[] = [
  {
    slug: 'restaurante-el-sabor',
    rubro: 'restaurante',
    name: 'Restaurante El Sabor',
    description: 'Comida casera y ambiente familiar',
    icon: '🍽️',
    color: 'bg-amber-500',
    colorPrimario: '#F59E0B',
    colorSecundario: '#FEF3C7',
    textos: {
      es: { heroTitulo: 'Reserva tu mesa en 2 clics', heroSubtitulo: 'Sin llamadas, sin esperas. Disfruta de la mejor comida casera.', cta: 'Reservar Mesa' },
      en: { heroTitulo: 'Book your table in 2 clicks', heroSubtitulo: 'No calls, no waiting. Enjoy the best homemade food.', cta: 'Book Table' },
    },
    modulos: { reservas: true, catalogo: true, carrito: true, puntos: true, recordatorios: true, resenas: true },
  },
  {
    slug: 'clinica-dental-sonrisa',
    rubro: 'clinica',
    name: 'Clínica Dental Sonrisa',
    description: 'Odontología integral y estética',
    icon: '🦷',
    color: 'bg-sky-500',
    colorPrimario: '#0EA5E9',
    colorSecundario: '#F0F9FF',
    textos: {
      es: { heroTitulo: 'Reserva tu cita en 2 clics', heroSubtitulo: 'Sin llamadas, sin esperas. Odontología integral y estética.', cta: 'Reservar Cita' },
      en: { heroTitulo: 'Book your appointment in 2 clicks', heroSubtitulo: 'No calls, no waiting. Comprehensive and aesthetic dentistry.', cta: 'Book Appointment' },
    },
    modulos: { reservas: true, catalogo: true, carrito: false, puntos: false, recordatorios: true, resenas: true },
  },
  {
    slug: 'barberia-clasica',
    rubro: 'barberia',
    name: 'Barbería Clásica',
    description: 'Cortes tradicionales y arreglo de barba',
    icon: '✂️',
    color: 'bg-stone-600',
    colorPrimario: '#44403C',
    colorSecundario: '#F5F5F4',
    textos: {
      es: { heroTitulo: 'Reserva tu corte en 2 clics', heroSubtitulo: 'Cortes tradicionales, arreglo de barba, experiencia premium.', cta: 'Reservar Corte' },
      en: { heroTitulo: 'Book your cut in 2 clicks', heroSubtitulo: 'Traditional cuts, beard trimming, premium experience.', cta: 'Book Cut' },
    },
    modulos: { reservas: true, catalogo: true, carrito: false, puntos: true, recordatorios: true, resenas: true },
  },
  {
    slug: 'gym-fitlife',
    rubro: 'gimnasio',
    name: 'Gym FitLife',
    description: 'Entrenamiento personalizado y clases',
    icon: '💪',
    color: 'bg-rose-500',
    colorPrimario: '#E11D48',
    colorSecundario: '#FFF1F2',
    textos: {
      es: { heroTitulo: 'Reserva tu clase en 2 clics', heroSubtitulo: 'Entrenamiento personalizado, clases grupales, nutrición.', cta: 'Reservar Clase' },
      en: { heroTitulo: 'Book your class in 2 clicks', heroSubtitulo: 'Personal training, group classes, nutrition.', cta: 'Book Class' },
    },
    modulos: { reservas: true, catalogo: true, carrito: false, puntos: true, recordatorios: true, resenas: true },
  },
  {
    slug: 'tienda-moda-urbana',
    rubro: 'tienda',
    name: 'Tienda Moda Urbana',
    description: 'Ropa y accesorios tendencia',
    icon: '🛍️',
    color: 'bg-violet-500',
    colorPrimario: '#7C3AED',
    colorSecundario: '#F5F3FF',
    textos: {
      es: { heroTitulo: 'Compra en 2 clics', heroSubtitulo: 'Ropa y accesorios tendencia. Envío gratis desde $50.', cta: 'Ver Catálogo' },
      en: { heroTitulo: 'Shop in 2 clicks', heroSubtitulo: 'Trendy clothes and accessories. Free shipping over $50.', cta: 'View Catalog' },
    },
    modulos: { reservas: false, catalogo: true, carrito: true, puntos: true, recordatorios: false, resenas: true },
  },
];

export function DemoSelector({ locale }: { locale: string }) {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessConfig>(demoBusinesses[0]);
  const t = useTranslations('landing');

  const currentTextos = selectedBusiness.textos[locale as 'es' | 'en'] || selectedBusiness.textos.es;

  return (
    <section id="demo" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('demo.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('demo.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('demo.selectBusiness')}
            </p>
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Selección de negocio demo">
              {demoBusinesses.map((business) => (
                <button
                  key={business.slug}
                  role="tab"
                  aria-selected={selectedBusiness.slug === business.slug}
                  onClick={() => setSelectedBusiness(business)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    selectedBusiness.slug === business.slug
                      ? `${business.color} text-white shadow-md shadow-${business.color.replace('bg-', '')}/30`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{business.icon}</span>
                    <span>{business.name}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('demo.activeModules')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(selectedBusiness.modulos).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={cn(
                      'w-4 h-4 rounded',
                      value ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    )} />
                    <span className={value ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative" style={{ '--primary': selectedBusiness.colorPrimario, '--secondary': selectedBusiness.colorSecundario } as CSSProperties}>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 dark:from-primary-900/30 to-secondary-100 dark:to-secondary-900/30 border border-gray-200 dark:border-gray-800">
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-4xl mb-6">
                  {selectedBusiness.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedBusiness.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedBusiness.description}
                </p>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentTextos.heroTitulo}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {currentTextos.heroSubtitulo}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-600/25">
                      {currentTextos.cta}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}