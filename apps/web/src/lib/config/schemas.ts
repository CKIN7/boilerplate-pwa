import { z } from 'zod';

export const BrandingSchema = z.object({
  nombre: z.string().min(1),
  logo: z.string().url().optional(),
  colorPrimario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  colorSecundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fuente: z.string().default('Inter'),
});

export const ModulosSchema = z.object({
  reservas: z.boolean().default(true),
  catalogo: z.boolean().default(true),
  carrito: z.boolean().default(false),
  puntos: z.boolean().default(false),
  recordatorios: z.boolean().default(true),
  resenas: z.boolean().default(true),
});

export const TextosSchema = z.object({
  es: z.object({
    heroTitulo: z.string(),
    heroSubtitulo: z.string(),
    cta: z.string(),
  }),
  en: z.object({
    heroTitulo: z.string(),
    heroSubtitulo: z.string(),
    cta: z.string(),
  }),
});

export const IntegracionesSchema = z.object({
  whatsapp: z.string().optional(),
  googleMaps: z.string().url().optional(),
  calendario: z.enum(['google', 'outlook', 'none']).optional(),
});

export const SeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().url().optional(),
});

export const NegocioConfigSchema = z.object({
  negocioId: z.string(),
  slug: z.string(),
  rubro: z.enum(['restaurante', 'clinica', 'barberia', 'gimnasio', 'tienda', 'otro']),
  branding: BrandingSchema,
  modulos: ModulosSchema,
  textos: TextosSchema,
  integraciones: IntegracionesSchema,
  seo: SeoSchema,
});

export type Branding = z.infer<typeof BrandingSchema>;
export type Modulos = z.infer<typeof ModulosSchema>;
export type Textos = z.infer<typeof TextosSchema>;
export type Integraciones = z.infer<typeof IntegracionesSchema>;
export type Seo = z.infer<typeof SeoSchema>;
export type NegocioConfig = z.infer<typeof NegocioConfigSchema>;