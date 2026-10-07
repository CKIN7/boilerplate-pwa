import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, gte, lte, or } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { reservas, clientes, items } from '@boilerplate/db/schema';

const router = Router();

const createReservaSchema = z.object({
  clienteId: z.string().uuid(),
  itemId: z.string().uuid(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  notas: z.string().optional(),
  origen: z.enum(['web', 'whatsapp', 'admin']).default('web'),
});

const updateReservaSchema = createReservaSchema.partial().extend({
  estado: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada', 'no_show']).optional(),
});

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { estado, fechaDesde, fechaHasta, clienteId } = req.query;

  const conditions = [eq(reservas.negocioId, negocioId)];

  if (estado) conditions.push(eq(reservas.estado, estado as any));
  if (clienteId) conditions.push(eq(reservas.clienteId, clienteId as string));
  if (fechaDesde) conditions.push(gte(reservas.fechaInicio, new Date(fechaDesde as string)));
  if (fechaHasta) conditions.push(lte(reservas.fechaFin, new Date(fechaHasta as string)));

  const data = await db.select({
    id: reservas.id,
    fechaInicio: reservas.fechaInicio,
    fechaFin: reservas.fechaFin,
    estado: reservas.estado,
    notas: reservas.notas,
    origen: reservas.origen,
    createdAt: reservas.createdAt,
    cliente: {
      id: clientes.id,
      nombre: clientes.nombre,
      telefono: clientes.telefono,
      email: clientes.email,
    },
    item: {
      id: items.id,
      nombre: items.nombre,
      duracion: items.duracion,
      precio: items.precio,
    },
  })
    .from(reservas)
    .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
    .leftJoin(items, eq(reservas.itemId, items.id))
    .where(and(...conditions))
    .orderBy(desc(reservas.fechaInicio));

  res.json({ data });
}));

router.get('/:id', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [reserva] = await db.select({
    id: reservas.id,
    fechaInicio: reservas.fechaInicio,
    fechaFin: reservas.fechaFin,
    estado: reservas.estado,
    notas: reservas.notas,
    origen: reservas.origen,
    metadata: reservas.metadata,
    createdAt: reservas.createdAt,
    updatedAt: reservas.updatedAt,
    cliente: {
      id: clientes.id,
      nombre: clientes.nombre,
      telefono: clientes.telefono,
      email: clientes.email,
      notas: clientes.notas,
    },
    item: {
      id: items.id,
      nombre: items.nombre,
      descripcion: items.descripcion,
      duracion: items.duracion,
      precio: items.precio,
    },
  })
    .from(reservas)
    .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
    .leftJoin(items, eq(reservas.itemId, items.id))
    .where(and(eq(reservas.id, req.params.id), eq(reservas.negocioId, negocioId)));

  if (!reserva) throw new AppError(404, 'Reserva no encontrada');
  res.json({ data: reserva });
}));

router.post('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = createReservaSchema.parse(req.body);

  const [cliente] = await db.select().from(clientes).where(and(eq(clientes.id, data.clienteId), eq(clientes.negocioId, negocioId)));
  if (!cliente) throw new AppError(404, 'Cliente no encontrado');

  const [item] = await db.select().from(items).where(and(eq(items.id, data.itemId), eq(items.negocioId, negocioId)));
  if (!item) throw new AppError(404, 'Item no encontrado');

  const [reserva] = await db.insert(reservas).values({
    ...data,
    negocioId,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),
  }).returning();

  res.status(201).json({ data: reserva });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = updateReservaSchema.parse(req.body);

  const updateData = { ...data };
  if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
  if (data.fechaFin) updateData.fechaFin = new Date(data.fechaFin);

  const [reserva] = await db.update(reservas)
    .set({ ...updateData, updatedAt: new Date() })
    .where(and(eq(reservas.id, req.params.id), eq(reservas.negocioId, negocioId)))
    .returning();

  if (!reserva) throw new AppError(404, 'Reserva no encontrada');
  res.json({ data: reserva });
}));

router.patch('/:id/cancelar', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [reserva] = await db.update(reservas)
    .set({ estado: 'cancelada', updatedAt: new Date() })
    .where(and(eq(reservas.id, req.params.id), eq(reservas.negocioId, negocioId)))
    .returning();

  if (!reserva) throw new AppError(404, 'Reserva no encontrada');
  res.json({ data: reserva });
}));

export { router as reservasRouter };