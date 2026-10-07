import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';

const router = Router();

const createReservaSchema = z.object({
  clienteId: z.string().uuid(),
  itemId: z.string().uuid(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  notas: z.string().optional(),
  origen: z.enum(['web', 'whatsapp', 'admin']).default('web'),
});

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: 'Listar reservas - TODO: implementar con Drizzle', data: [] });
}));

router.get('/:id', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Obtener reserva ${req.params.id} - TODO` });
}));

router.post('/', requireTenant, asyncHandler(async (req, res) => {
  const data = createReservaSchema.parse(req.body);
  res.status(201).json({ message: 'Crear reserva - TODO: implementar con Drizzle', data });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Actualizar reserva ${req.params.id} - TODO` });
}));

router.patch('/:id/cancelar', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: `Cancelar reserva ${req.params.id} - TODO` }));
}));

export { router as reservasRouter };