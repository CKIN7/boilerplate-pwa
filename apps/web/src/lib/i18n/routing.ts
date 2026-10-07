export const routing = {
  locales: ['es', 'en'] as const,
  defaultLocale: 'es' as const,
  localePrefix: 'always',
} as const;

export type Locale = (typeof routing.locales)[number];