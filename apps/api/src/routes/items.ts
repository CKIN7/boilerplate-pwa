import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { items, categorias } from '@boilerplate/db/schema';

const router = Router();

const createItemSchema = z.object({
  nombre: z.string().min(1).max(200),
  descripcion: z.string().optional(),
  precio: z.number().int().positive(),
  duracion: z.number().int().positive().optional(),
  categoriaId: z.string().uuid().optional(),
  imagen: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateItemSchema = createItemSchema.partial();

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = await db.select()
    .from(items)
    .where(and(eq(items.negocioId, negocioId), eq(items.activo, true)))
    .orderBy(desc(items.orden), desc(items.createdAt));
  res.json({ data });
}));

router.get('/:id', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [item] = await db.select()
    .from(items)
    .where(and(eq(items.id, req.params.id), eq(items.negocioId, negocioId)));
  if (!item) throw new AppError(404, 'Item no encontrado');
  res.json({ data: item });
}));

router.post('/', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = createItemSchema.parse(req.body);
  const [item] = await db.insert(items).values({ ...data, negocioId }).returning();
  res.status(201).json({ data: item });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = updateItemSchema.parse(req.body);
  const [item] = await db.update(items)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(items.id, req.params.id), eq(items.negocioId, negocioId)))
    .returning();
  if (!item) throw new AppError(404, 'Item no encontrado');
  res.json({ data: item });
}));

router.delete('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [item] = await db.update(items)
    .set({ activo: false, updatedAt: new Date() })
    .where(and(eq(items.id, req.params.id), eq(items.negocioId, negocioId)))
    .returning();
  if (!item) throw new AppError(404, 'Item no encontrado');
  res.json({ message: 'Item eliminado' });
}));

export { router as itemsRouter };