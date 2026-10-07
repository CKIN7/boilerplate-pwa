import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';

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

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: 'Listar items - TODO: implementar con Drizzle', data: [] });
}));

router.get('/:id', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Obtener item ${req.params.id} - TODO` });
}));

router.post('/', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const data = createItemSchema.parse(req.body);
  res.status(201).json({ message: 'Crear item - TODO: implementar con Drizzle', data });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Actualizar item ${req.params.id} - TODO` });
}));

router.delete('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Eliminar item ${req.params.id} - TODO` });
}));

export { router as itemsRouter };