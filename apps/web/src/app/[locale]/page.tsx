import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DemoSelector } from '@/components/DemoSelector';

export default function HomePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('landing');

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Boilerplate PWA</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#demo" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('nav.demo')}
              </Link>
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('nav.features')}
              </Link>
              <Link href="#stack" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t('nav.stack')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t('hero.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      <DemoSelector locale={params.locale} />

      <section id="features" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🎨', title: t('features.theming.title'), desc: t('features.theming.desc') },
              { icon: '📱', title: t('features.pwa.title'), desc: t('features.pwa.desc') },
              { icon: '🌐', title: t('features.i18n.title'), desc: t('features.i18n.desc') },
              { icon: '⚡', title: t('features.performance.title'), desc: t('features.performance.desc') },
              { icon: '🔐', title: t('features.auth.title'), desc: t('features.auth.desc') },
              { icon: '📊', title: t('features.analytics.title'), desc: t('features.analytics.desc') },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="py-20 lg:py-32 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('stack.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('stack.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { name: 'Next.js 14', logo: '⚛️', color: 'bg-gray-100 dark:bg-gray-800' },
              { name: 'React 18', logo: '⚛️', color: 'bg-sky-100 dark:bg-sky-900/30' },
              { name: 'TypeScript', logo: '📘', color: 'bg-blue-100 dark:bg-blue-900/30' },
              { name: 'Tailwind CSS', logo: '🎨', color: 'bg-sky-100 dark:bg-sky-900/30' },
              { name: 'Express', logo: '🚂', color: 'bg-gray-100 dark:bg-gray-800' },
              { name: 'Drizzle ORM', logo: '🗄️', color: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { name: 'PostgreSQL', logo: '🐘', color: 'bg-blue-100 dark:bg-blue-900/30' },
              { name: 'Better Auth', logo: '🔐', color: 'bg-purple-100 dark:bg-purple-900/30' },
            ].map((tech, index) => (
              <div key={index} className={`rounded-xl ${tech.color} p-4 text-center hover:shadow-lg transition-shadow`}>
                <div className="text-3xl mb-2">{tech.logo}</div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">
            {t('footer.description')}
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Documentación</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </div>
          <p className="mt-6 text-xs text-gray-500">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </main>
  );
}