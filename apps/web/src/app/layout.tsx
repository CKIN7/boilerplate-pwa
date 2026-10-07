import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Boilerplate PWA Multi-Rubro',
    template: '%s | Boilerplate PWA',
  },
  description: 'Plantilla base para PWAs multi-rubro',
  keywords: ['PWA', 'Next.js', 'React', 'TypeScript', 'Tailwind'],
  authors: [{ name: 'Boilerplate Team' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Boilerplate PWA',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}