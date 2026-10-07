import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireOwner } from '../middleware/auth';

const router = Router();

const createNegocioSchema = z.object({
  nombre: z.string().min(1).max(200),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  rubro: z.enum(['restaurante', 'clinica', 'barberia', 'gimnasio', 'tienda', 'otro']),
  configJson: z.object({
    branding: z.object({
      nombre: z.string(),
      logo: z.string().url().optional(),
      colorPrimario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      colorSecundario: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      fuente: z.string().default('Inter'),
    }),
    modulos: z.object({
      reservas: z.boolean().default(true),
      catalogo: z.boolean().default(true),
      carrito: z.boolean().default(false),
      puntos: z.boolean().default(false),
      recordatorios: z.boolean().default(true),
      resenas: z.boolean().default(true),
    }),
    textos: z.object({
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
    }),
    integraciones: z.object({
      whatsapp: z.string().optional(),
      googleMaps: z.string().url().optional(),
      calendario: z.enum(['google', 'outlook', 'none']).optional(),
    }),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().url().optional(),
    }),
  }),
});

router.get('/', asyncHandler(async (req, res) => {
  res.json({ message: 'Listar negocios - TODO: implementar con Drizzle', data: [] });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ message: `Obtener negocio ${req.params.id} - TODO` });
}));

router.post('/', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const data = createNegocioSchema.parse(req.body);
  res.status(201).json({ message: 'Crear negocio - TODO: implementar con Drizzle', data });
}));

router.patch('/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  res.json({ message: `Actualizar negocio ${req.params.id} - TODO` });
}));

router.delete('/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  res.json({ message: `Eliminar negocio ${req.params.id} - TODO` });
}));

export { router as negociosRouter };