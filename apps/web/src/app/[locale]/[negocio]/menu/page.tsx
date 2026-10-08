import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { getNegocioConfig } from '@/lib/config/loader';
import { cn, formatCurrency } from '@/lib/utils';

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
    title: `${config.branding.nombre} - MenÃº`,
    description: `CatÃ¡logo de ${config.branding.nombre}`,
  };
}

export default function MenuPage({ params }: PageProps) {
  const t = useTranslations('business');
  const config = getNegocioConfig(params.negocio)!;
  const { branding, modulos, textos } = config;
  const currentTextos = textos[params.locale as 'es' | 'en'] || textos.es;

  const sampleItems = [
    { id: 1, name: t('sample.item1'), desc: t('sample.item1Desc'), price: 2500, category: 'principales' },
    { id: 2, name: t('sample.item2'), desc: t('sample.item2Desc'), price: 1800, category: 'entradas' },
    { id: 3, name: t('sample.item3'), desc: t('sample.item3Desc'), price: 3200, category: 'postres' },
    { id: 4, name: t('sample.item1') + ' 2', desc: t('sample.item1Desc') + ' premium', price: 3500, category: 'principales' },
    { id: 5, name: t('sample.item2') + ' 2', desc: t('sample.item2Desc') + ' especial', price: 2200, category: 'entradas' },
    { id: 6, name: t('sample.item3') + ' 2', desc: t('sample.item3Desc') + ' deluxe', price: 4000, category: 'postres' },
  ];

  const categories = [...new Set(sampleItems.map(i => i.category))];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ '--primary': branding.colorPrimario, '--secondary': branding.colorSecundario }}>
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
            <nav className="hidden md:flex items-center gap-6">
              {modulos.catalogo && (
                <Link href={`/${params.locale}/${params.negocio}/menu`} className="text-primary-600 dark:text-primary-400 font-medium">
                  {t('nav.menu')}
                </Link>
              )}
              {modulos.reservas && (
                <Link href={`/${params.locale}/${params.negocio}/reservar`} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  {t('nav.book')}
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('sections.menu')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('sections.menuDesc')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" role="tablist">
          {categories.map((category, index) => (
            <button
              key={category}
              role="tab"
              aria-selected={index === 0}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                index === 0
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleItems.map((item) => (
            <article key={item.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 dark:from-primary-900/30 to-secondary-100 dark:to-secondary-900/30 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-50">
                    {item.category === 'principales' ? 'ðŸ½ï¸' : item.category === 'entradas' ? 'ðŸ¥—' : 'ðŸ°'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{item.desc}</p>
                {modulos.reservas && (
                  <button className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm">
                    {modulos.carrito ? t('menu.addToCart') : t('menu.reserve')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {sampleItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">{t('menu.empty')}</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} {branding.nombre}. {t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}