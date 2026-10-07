import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireOwner } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { negocios, usuarios } from '@boilerplate/db/schema';

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

const updateNegocioSchema = createNegocioSchema.partial();

router.get('/', asyncHandler(async (req, res) => {
  const data = await db.select()
    .from(negocios)
    .where(eq(negocios.activo, true))
    .orderBy(desc(negocios.createdAt));
  res.json({ data });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [negocio] = await db.select()
    .from(negocios)
    .where(eq(negocios.id, req.params.id));
  if (!negocio) throw new AppError(404, 'Negocio no encontrado');
  res.json({ data: negocio });
}));

router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const [negocio] = await db.select()
    .from(negocios)
    .where(and(eq(negocios.slug, req.params.slug), eq(negocios.activo, true)));
  if (!negocio) throw new AppError(404, 'Negocio no encontrado');
  res.json({ data: negocio });
}));

router.post('/', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const data = createNegocioSchema.parse(req.body);

  const [existing] = await db.select().from(negocios).where(eq(negocios.slug, data.slug));
  if (existing) throw new AppError(409, 'Slug ya existe');

  const [negocio] = await db.insert(negocios).values(data).returning();

  const ownerData = {
    email: req.user!.email,
    nombre: req.user!.nombre,
    rol: 'owner' as const,
    negocioId: negocio.id,
  };
  await db.insert(usuarios).values(ownerData);

  res.status(201).json({ data: negocio });
}));

router.patch('/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const data = updateNegocioSchema.parse(req.body);
  const [negocio] = await db.update(negocios)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(negocios.id, req.params.id))
    .returning();
  if (!negocio) throw new AppError(404, 'Negocio no encontrado');
  res.json({ data: negocio });
}));

router.delete('/:id', requireAuth, requireOwner, asyncHandler(async (req, res) => {
  const [negocio] = await db.update(negocios)
    .set({ activo: false, updatedAt: new Date() })
    .where(eq(negocios.id, req.params.id))
    .returning();
  if (!negocio) throw new AppError(404, 'Negocio no encontrado');
  res.json({ message: 'Negocio desactivado' });
}));

export { router as negociosRouter };