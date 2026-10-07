import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, gte, lte, count, sql, sum } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { reservas, clientes, items, negocios, usuarios, notificaciones } from '@boilerplate/db/schema';
import { generatePDF } from '../utils/pdf';

const router = Router();

router.get('/stats', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const [reservasHoy, totalReservas, totalClientes, ingresos, reservasPorEstado] = await Promise.all([
    db.select({ count: count() })
      .from(reservas)
      .where(and(
        eq(reservas.negocioId, negocioId),
        gte(reservas.fechaInicio, hoy),
        lt(reservas.fechaInicio, manana),
      )),
    db.select({ count: count() })
      .from(reservas)
      .where(eq(reservas.negocioId, negocioId)),
    db.select({ count: count() })
      .from(clientes)
      .where(eq(clientes.negocioId, negocioId)),
    db.select({ total: sql<number>`COALESCE(SUM(${items.precio}), 0)` })
      .from(reservas)
      .leftJoin(items, eq(reservas.itemId, items.id))
      .where(and(
        eq(reservas.negocioId, negocioId),
        or(eq(reservas.estado, 'confirmada'), eq(reservas.estado, 'completada')),
      )),
    db.select({
      estado: reservas.estado,
      count: count(),
    })
      .from(reservas)
      .where(eq(reservas.negocioId, negocioId))
      .groupBy(reservas.estado),
  ]);

  res.json({
    data: {
      reservasHoy: reservasHoy[0].count,
      totalReservas: totalReservas[0].count,
      totalClientes: totalClientes[0].count,
      ingresos: ingresos[0].total || 0,
      reservasPorEstado: reservasPorEstado.reduce((acc, r) => ({ ...acc, [r.estado]: r.count }), {}),
    },
  });
}));

router.get('/reservas/export', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { fechaDesde, fechaHasta, estado } = req.query;

  const conditions = [eq(reservas.negocioId, negocioId)];
  if (fechaDesde) conditions.push(gte(reservas.fechaInicio, new Date(fechaDesde as string)));
  if (fechaHasta) conditions.push(lte(reservas.fechaFin, new Date(fechaHasta as string)));
  if (estado) conditions.push(eq(reservas.estado, estado as any));

  const data = await db.select({
    id: reservas.id,
    fecha: sql<string>`DATE(${reservas.fechaInicio})`,
    hora: sql<string>`TIME(${reservas.fechaInicio})`,
    duracion: sql<number>`EXTRACT(EPOCH FROM (${reservas.fechaFin} - ${reservas.fechaInicio}))/60`,
    estado: reservas.estado,
    cliente: clientes.nombre,
    telefono: clientes.telefono,
    email: clientes.email,
    servicio: items.nombre,
    precio: items.precio,
    notas: reservas.notas,
    origen: reservas.origen,
    creado: reservas.createdAt,
  })
    .from(reservas)
    .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
    .leftJoin(items, eq(reservas.itemId, items.id))
    .where(and(...conditions))
    .orderBy(desc(reservas.fechaInicio));

  const headers = [
    'ID', 'Fecha', 'Hora', 'Duración (min)', 'Estado',
    'Cliente', 'Teléfono', 'Email', 'Servicio', 'Precio',
    'Notas', 'Origen', 'Creado'
  ];

  const rows = data.map(r => [
    r.id,
    r.fecha,
    r.hora,
    r.duracion,
    r.estado,
    r.cliente || '',
    r.telefono || '',
    r.email || '',
    r.servicio || '',
    r.precio || 0,
    r.notas || '',
    r.origen || '',
    r.creado.toISOString(),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="reservas-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
}));

router.get('/clientes/export', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;

  const data = await db.select({
    id: clientes.id,
    nombre: clientes.nombre,
    telefono: clientes.telefono,
    email: clientes.email,
    notas: clientes.notas,
    totalReservas: sql<number>`(
      SELECT COUNT(*) FROM ${reservas} 
      WHERE ${reservas.clienteId} = ${clientes.id} 
      AND ${reservas.negocioId} = ${negocioId}
    )`,
    creado: clientes.createdAt,
  })
    .from(clientes)
    .where(eq(clientes.negocioId, negocioId))
    .orderBy(desc(clientes.createdAt));

  const headers = ['ID', 'Nombre', 'Teléfono', 'Email', 'Notas', 'Total Reservas', 'Creado'];
  const rows = data.map(r => [
    r.id,
    r.nombre,
    r.telefono || '',
    r.email || '',
    r.notas || '',
    r.totalReservas,
    r.creado.toISOString(),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="clientes-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send('\uFEFF' + csv);
}));

router.post('/reservas/bulk', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const schema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(100),
    action: z.enum(['confirmar', 'cancelar', 'completar', 'no_show']),
  });

  const negocioId = req.negocioId!;
  const { ids, action } = schema.parse(req.body);

  const estadoMap: Record<string, string> = {
    confirmar: 'confirmada',
    cancelar: 'cancelada',
    completar: 'completada',
    no_show: 'no_show',
  };

  const result = await db.update(reservas)
    .set({ estado: estadoMap[action] as any, updatedAt: new Date() })
    .where(and(eq(reservas.negocioId, negocioId), sql`${reservas.id} IN (${ids.map(() => '?').join(',')})`))
    .returning({ id: reservas.id });

  res.json({ updated: result.length, ids: result.map(r => r.id) });
}));

router.get('/notificaciones', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { estado, limit = '50', offset = '0' } = req.query;

  const conditions = [eq(notificaciones.negocioId, negocioId)];
  if (estado) conditions.push(eq(notificaciones.estado, estado as any));

  const data = await db.select()
    .from(notificaciones)
    .where(and(...conditions))
    .orderBy(desc(notificaciones.createdAt))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  const total = await db.select({ count: count() })
    .from(notificaciones)
    .where(and(...conditions));

  res.json({ data, total: total[0].count });
}));

router.post('/notificaciones/:id/reintentar', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [notificacion] = await db.select()
    .from(notificaciones)
    .where(and(eq(notificaciones.id, req.params.id), eq(notificaciones.negocioId, negocioId)));

  if (!notificacion) throw new AppError(404, 'Notificación no encontrada');

  await db.update(notificaciones)
    .set({ estado: 'pendiente', enviadoAt: null })
    .where(eq(notificaciones.id, req.params.id));

  res.json({ success: true, message: 'Notificación encolada para reintento' });
}));

router.get('/dashboard/pdf', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { fechaDesde, fechaHasta } = req.query;

  const conditions = [eq(reservas.negocioId, negocioId)];
  if (fechaDesde) conditions.push(gte(reservas.fechaInicio, new Date(fechaDesde as string)));
  if (fechaHasta) conditions.push(lte(reservas.fechaFin, new Date(fechaHasta as string)));

  const [negocio] = await db.select().from(negocios).where(eq(negocios.id, negocioId));
  const config = negocio?.configJson as any;

  const reservasData = await db.select({
    fecha: sql<string>`DATE(${reservas.fechaInicio})`,
    hora: sql<string>`TIME(${reservas.fechaInicio})`,
    cliente: clientes.nombre,
    servicio: items.nombre,
    estado: reservas.estado,
    precio: items.precio,
  })
    .from(reservas)
    .leftJoin(clientes, eq(reservas.clienteId, clientes.id))
    .leftJoin(items, eq(reservas.itemId, items.id))
    .where(and(...conditions))
    .orderBy(desc(reservas.fechaInicio))
    .limit(100);

  const pdfData = {
    businessName: config?.branding?.nombre || negocio?.nombre || 'Negocio',
    businessLogo: config?.branding?.logo,
    documentTitle: 'Reporte de Reservas',
    documentNumber: `RPT-${new Date().toISOString().split('T')[0]}`,
    date: new Date(),
    items: reservasData.map(r => ({
      name: r.servicio || 'Servicio',
      description: `${r.fecha} ${r.hora} - ${r.cliente}`,
      quantity: 1,
      unitPrice: r.precio || 0,
      total: r.precio || 0,
    })),
    subtotal: reservasData.reduce((sum, r) => sum + (r.precio || 0), 0),
    tax: 0,
    total: reservasData.reduce((sum, r) => sum + (r.precio || 0), 0),
    notes: `Periodo: ${fechaDesde || 'Inicio'} - ${fechaHasta || 'Hoy'}`,
    footerText: `${config?.branding?.nombre || 'Negocio'} - Reporte generado automáticamente`,
  };

  const pdfBuffer = await generatePDF(pdfData);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="reporte-${new Date().toISOString().split('T')[0]}.pdf"`);
  res.send(pdfBuffer);
}));

export { router as adminRouter };