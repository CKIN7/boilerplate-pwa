import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, gte, lte, lt, gt, or, sql } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { reservas, clientes, items, negocios } from '@boilerplate/db/schema';

const router = Router();

const createReservaSchema = z.object({
  clienteId: z.string().uuid(),
  itemId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duracionMinutos: z.number().int().min(15).max(480),
  notas: z.string().max(1000).optional(),
  origen: z.enum(['web', 'whatsapp', 'admin']).default('web'),
});

const updateReservaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duracionMinutos: z.number().int().min(15).max(480).optional(),
  estado: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada', 'no_show']).optional(),
  notas: z.string().max(1000).optional(),
});

const availabilitySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  itemId: z.string().uuid(),
  excludeReservaId: z.string().uuid().optional(),
});

function parseDateTime(fecha: string, hora: string): Date {
  const [hours, minutes] = hora.split(':').map(Number);
  const date = new Date(fecha);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

router.get('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { estado, fechaDesde, fechaHasta, clienteId, page = '1', limit = '20' } = req.query;

  const conditions = [eq(reservas.negocioId, negocioId)];

  if (estado) conditions.push(eq(reservas.estado, estado as any));
  if (clienteId) conditions.push(eq(reservas.clienteId, clienteId as string));
  if (fechaDesde) conditions.push(gte(reservas.fechaInicio, new Date(fechaDesde as string)));
  if (fechaHasta) conditions.push(lte(reservas.fechaFin, new Date(fechaHasta as string)));

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
  const offset = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    db.select({
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
      .orderBy(desc(reservas.fechaInicio))
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` })
      .from(reservas)
      .where(and(...conditions)),
  ]);

  res.json({
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: total[0].count,
      totalPages: Math.ceil(total[0].count / limitNum),
    },
  });
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

router.post('/check-availability', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = availabilitySchema.parse(req.body);

  const [item] = await db.select()
    .from(items)
    .where(and(eq(items.id, data.itemId), eq(items.negocioId, negocioId)));
  if (!item) throw new AppError(404, 'Item no encontrado');

  const [negocio] = await db.select()
    .from(negocios)
    .where(eq(negocios.id, negocioId));
  const config = negocio?.configJson as any;

  const horaInicio = parseDateTime(data.fecha, data.horaInicio);
  const horaFin = parseDateTime(data.fecha, data.horaFin);

  const duracionConfig = item.duracion || config?.horario?.intervaloMinutos || 60;
  const expectedFin = addMinutes(horaInicio, duracionConfig);

  if (formatTime(expectedFin) !== data.horaFin) {
    return res.json({
      available: false,
      reason: `La duración no coincide. Se esperaban ${duracionConfig} minutos (hasta ${formatTime(expectedFin)})`,
    });
  }

  const horaApertura = config?.horario?.apertura || '09:00';
  const horaCierre = config?.horario?.cierre || '20:00';
  const [apHours, apMinutes] = horaApertura.split(':').map(Number);
  const [ciHours, ciMinutes] = horaCierre.split(':').map(Number);

  const apertura = new Date(data.fecha);
  apertura.setHours(apHours, apMinutes, 0, 0);
  const cierre = new Date(data.fecha);
  cierre.setHours(ciHours, ciMinutes, 0, 0);

  if (horaInicio < apertura || horaFin > cierre) {
    return res.json({
      available: false,
      reason: `Horario fuera de servicio (${horaApertura} - ${horaCierre})`,
    });
  }

  const conflictingReservas = await db.select()
    .from(reservas)
    .where(and(
      eq(reservas.negocioId, negocioId),
      eq(reservas.itemId, data.itemId),
      or(
        eq(reservas.estado, 'pendiente'),
        eq(reservas.estado, 'confirmada'),
      ),
      lt(reservas.fechaInicio, horaFin),
      gt(reservas.fechaFin, horaInicio),
      ...(data.excludeReservaId ? [sql`${reservas.id} != ${data.excludeReservaId}`] : []),
    ));

  const available = conflictingReservas.length === 0;

  return res.json({
    available,
    reason: available ? undefined : 'Horario no disponible',
    suggestedSlots: available ? [] : await getSuggestedSlots(negocioId, data.itemId, data.fecha, duracionConfig),
  });
}));

async function getSuggestedSlots(negocioId: string, itemId: string, fecha: string, duracion: number) {
  const [negocio] = await db.select().from(negocios).where(eq(negocios.id, negocioId));
  const config = negocio?.configJson as any;

  const horaApertura = config?.horario?.apertura || '09:00';
  const horaCierre = config?.horario?.cierre || '20:00';
  const [apHours, apMinutes] = horaApertura.split(':').map(Number);
  const [ciHours, ciMinutes] = horaCierre.split(':').map(Number);

  const apertura = new Date(fecha);
  apertura.setHours(apHours, apMinutes, 0, 0);
  const cierre = new Date(fecha);
  cierre.setHours(ciHours, ciMinutes, 0, 0);

  const existingReservas = await db.select()
    .from(reservas)
    .where(and(
      eq(reservas.negocioId, negocioId),
      eq(reservas.itemId, itemId),
      or(eq(reservas.estado, 'pendiente'), eq(reservas.estado, 'confirmada')),
      gte(reservas.fechaInicio, apertura),
      lte(reservas.fechaFin, cierre),
    ))
    .orderBy(reservas.fechaInicio);

  const slots: string[] = [];
  let current = new Date(apertura);

  while (addMinutes(current, duracion) <= cierre) {
    const slotEnd = addMinutes(current, duracion);
    const conflicts = existingReservas.filter(r => 
      r.fechaInicio < slotEnd && r.fechaFin > current
    );

    if (conflicts.length === 0) {
      slots.push(formatTime(current));
    }

    current = addMinutes(current, config?.horario?.intervaloMinutos || 30);
  }

  return slots.slice(0, 10);
}

router.post('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = createReservaSchema.parse(req.body);

  const [cliente] = await db.select().from(clientes).where(and(eq(clientes.id, data.clienteId), eq(clientes.negocioId, negocioId)));
  if (!cliente) throw new AppError(404, 'Cliente no encontrado');

  const [item] = await db.select().from(items).where(and(eq(items.id, data.itemId), eq(items.negocioId, negocioId)));
  if (!item) throw new AppError(404, 'Item no encontrado');

  const horaInicio = parseDateTime(data.fecha, data.horaInicio);
  const horaFin = addMinutes(horaInicio, data.duracionMinutos);

  const [negocio] = await db.select().from(negocios).where(eq(negocios.id, negocioId));
  const config = negocio?.configJson as any;

  const duracionConfig = item.duracion || config?.horario?.intervaloMinutos || 60;
  const expectedFin = addMinutes(horaInicio, duracionConfig);

  if (formatTime(expectedFin) !== formatTime(horaFin)) {
    throw new AppError(400, `Duración inválida. Se requieren ${duracionConfig} minutos.`);
  }

  const conflictingReservas = await db.select()
    .from(reservas)
    .where(and(
      eq(reservas.negocioId, negocioId),
      eq(reservas.itemId, data.itemId),
      or(eq(reservas.estado, 'pendiente'), eq(reservas.estado, 'confirmada')),
      lt(reservas.fechaInicio, horaFin),
      gt(reservas.fechaFin, horaInicio),
    ));

  if (conflictingReservas.length > 0) {
    throw new AppError(409, 'Horario no disponible');
  }

  const [reserva] = await db.insert(reservas).values({
    negocioId,
    clienteId: data.clienteId,
    itemId: data.itemId,
    fechaInicio: horaInicio,
    fechaFin: horaFin,
    estado: 'pendiente',
    notas: data.notas,
    origen: data.origen,
  }).returning();

  res.status(201).json({ data: reserva });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = updateReservaSchema.parse(req.body);

  const updateData: any = { ...data };
  if (data.fecha && data.horaInicio) {
    updateData.fechaInicio = parseDateTime(data.fecha, data.horaInicio);
    updateData.fechaFin = addMinutes(updateData.fechaInicio, data.duracionMinutos || 60);
  } else if (data.fecha) {
    const [existing] = await db.select().from(reservas).where(eq(reservas.id, req.params.id));
    if (existing) {
      updateData.fechaInicio = parseDateTime(data.fecha, formatTime(existing.fechaInicio));
      updateData.fechaFin = addMinutes(updateData.fechaInicio, data.duracionMinutos || 60);
    }
  } else if (data.horaInicio) {
    const [existing] = await db.select().from(reservas).where(eq(reservas.id, req.params.id));
    if (existing) {
      updateData.fechaInicio = parseDateTime(formatTime(existing.fechaInicio), data.horaInicio);
      updateData.fechaFin = addMinutes(updateData.fechaInicio, data.duracionMinutos || 60);
    }
  }

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

router.patch('/:id/confirmar', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [reserva] = await db.update(reservas)
    .set({ estado: 'confirmada', updatedAt: new Date() })
    .where(and(eq(reservas.id, req.params.id), eq(reservas.negocioId, negocioId)))
    .returning();

  if (!reserva) throw new AppError(404, 'Reserva no encontrada');
  res.json({ data: reserva });
}));

router.get('/:id/pdf', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [reserva] = await db.select({
    id: reservas.id,
    fechaInicio: reservas.fechaInicio,
    fechaFin: reservas.fechaFin,
    estado: reservas.estado,
    cliente: {
      id: clientes.id,
      nombre: clientes.nombre,
      telefono: clientes.telefono,
      email: clientes.email,
    },
    item: {
      id: items.id,
      nombre: items.nombre,
    },
  })
    .from(reservas)
    .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
    .leftJoin(items, eq(reservas.itemId, items.id))
    .where(and(eq(reservas.id, req.params.id), eq(reservas.negocioId, negocioId)));

  if (!reserva) throw new AppError(404, 'Reserva no encontrada');

  const [negocio] = await db.select().from(negocios).where(eq(negocios.id, negocioId));
  const config = negocio?.configJson as any;

  const { generateReservationPDF } = await import('../utils/pdf');

  const pdfBuffer = await generateReservationPDF({
    businessName: config?.branding?.nombre || negocio?.nombre || 'Negocio',
    businessLogo: config?.branding?.logo,
    reservation: {
      id: reserva.id,
      date: reserva.fechaInicio,
      time: reserva.fechaInicio.toTimeString().slice(0, 5),
      service: reserva.item?.nombre || 'Servicio',
      clientName: reserva.cliente?.nombre || 'Cliente',
      clientPhone: reserva.cliente?.telefono || '',
      clientEmail: reserva.cliente?.email,
      notes: reserva.notas,
      estado: reserva.estado,
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="reserva-${reserva.id}.pdf"`);
  res.send(pdfBuffer);
}));

export { router as reservasRouter };