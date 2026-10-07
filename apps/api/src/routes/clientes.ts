import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';

const router = Router();

const createClienteSchema = z.object({
  nombre: z.string().min(1).max(200),
  telefono: z.string().max(50).optional(),
  email: z.string().email().optional(),
  notas: z.string().optional(),
});

router.get('/', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: 'Listar clientes - TODO: implementar con Drizzle', data: [] });
}));

router.get('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Obtener cliente ${req.params.id} - TODO` });
}));

router.post('/', requireTenant, asyncHandler(async (req, res) => {
  const data = createClienteSchema.parse(req.body);
  res.status(201).json({ message: 'Crear cliente - TODO: implementar con Drizzle', data });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Actualizar cliente ${req.params.id} - TODO` });
}));

router.delete('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Eliminar cliente ${req.params.id} - TODO` });
}));

export { router as clientesRouter };