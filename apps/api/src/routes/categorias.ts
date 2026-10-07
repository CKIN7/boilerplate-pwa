import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { categorias } from '@boilerplate/db/schema';

const router = Router();

const createCategoriaSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  orden: z.number().int().default(0),
});

const updateCategoriaSchema = createCategoriaSchema.partial();

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = await db.select()
    .from(categorias)
    .where(and(eq(categorias.negocioId, negocioId), eq(categorias.activo, true)))
    .orderBy(categorias.orden, desc(categorias.createdAt));
  res.json({ data });
}));

router.get('/:id', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [categoria] = await db.select()
    .from(categorias)
    .where(and(eq(categorias.id, req.params.id), eq(categorias.negocioId, negocioId)));
  if (!categoria) throw new AppError(404, 'Categoría no encontrada');
  res.json({ data: categoria });
}));

router.post('/', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = createCategoriaSchema.parse(req.body);
  const [categoria] = await db.insert(categorias).values({ ...data, negocioId }).returning();
  res.status(201).json({ data: categoria });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = updateCategoriaSchema.parse(req.body);
  const [categoria] = await db.update(categorias)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(categorias.id, req.params.id), eq(categorias.negocioId, negocioId)))
    .returning();
  if (!categoria) throw new AppError(404, 'Categoría no encontrada');
  res.json({ data: categoria });
}));

router.delete('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [categoria] = await db.update(categorias)
    .set({ activo: false, updatedAt: new Date() })
    .where(and(eq(categorias.id, req.params.id), eq(categorias.negocioId, negocioId)))
    .returning();
  if (!categoria) throw new AppError(404, 'Categoría no encontrada');
  res.json({ message: 'Categoría eliminada' });
}));

export { router as categoriasRouter };