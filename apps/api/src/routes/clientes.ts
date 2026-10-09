import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { clientes, reservas, negocios } from '@boilerplate/db/schema';
import { sendEmail, getBookingConfirmationTemplate } from '../utils/email';

const router = Router();

const createClienteSchema = z.object({
  nombre: z.string().min(1).max(200),
  telefono: z.string().max(50).optional(),
  email: z.string().email().optional(),
  notas: z.string().optional(),
});

const updateClienteSchema = createClienteSchema.partial();

const notifySchema = z.object({
  clienteId: z.string().uuid(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
});

router.get('/', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const { search, limit = '50', offset = '0' } = req.query;

  const conditions = [eq(clientes.negocioId, negocioId)];

  if (search) {
    const searchCondition = or(
      ilike(clientes.nombre, `%${search}%`),
      ilike(clientes.email, `%${search}%`),
      ilike(clientes.telefono, `%${search}%`)
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const data = await db.select({
    id: clientes.id,
    nombre: clientes.nombre,
    telefono: clientes.telefono,
    email: clientes.email,
    notas: clientes.notas,
    createdAt: clientes.createdAt,
    _count: {
      reservas: reservas.id,
    },
  })
    .from(clientes)
    .leftJoin(reservas, eq(clientes.id, reservas.clienteId))
    .where(and(...conditions))
    .orderBy(desc(clientes.createdAt))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));

  res.json({ data });
}));

router.get('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [cliente] = await db.select()
    .from(clientes)
    .where(and(eq(clientes.id, req.params.id), eq(clientes.negocioId, negocioId)));

  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  res.json({ data: cliente });
}));

router.post('/', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = createClienteSchema.parse(req.body);

  if (data.email) {
    const [existing] = await db.select()
      .from(clientes)
      .where(and(eq(clientes.email, data.email), eq(clientes.negocioId, negocioId)));
    if (existing) throw new AppError(409, 'Email ya registrado');
  }

  const [cliente] = await db.insert(clientes).values({ ...data, negocioId }).returning();
  res.status(201).json({ data: cliente });
}));

router.patch('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = updateClienteSchema.parse(req.body);

  if (data.email) {
    const [existing] = await db.select()
      .from(clientes)
      .where(and(eq(clientes.email, data.email), eq(clientes.negocioId, negocioId)));
    if (existing && existing.id !== req.params.id) {
      throw new AppError(409, 'Email ya registrado');
    }
  }

  const [cliente] = await db.update(clientes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(clientes.id, req.params.id), eq(clientes.negocioId, negocioId)))
    .returning();

  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  res.json({ data: cliente });
}));

router.delete('/:id', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [cliente] = await db.delete(clientes)
    .where(and(eq(clientes.id, req.params.id), eq(clientes.negocioId, negocioId)))
    .returning();

  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  res.json({ message: 'Cliente eliminado' });
}));

router.post('/:id/notify', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const data = notifySchema.parse(req.body);

  const [cliente] = await db.select()
    .from(clientes)
    .where(and(eq(clientes.id, data.clienteId), eq(clientes.negocioId, negocioId)));

  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  if (!cliente.email) throw new AppError(400, 'Cliente no tiene email');

  const sent = await sendEmail({
    to: cliente.email,
    subject: data.subject,
    html: data.html,
    text: data.text,
  });

  if (!sent) throw new AppError(500, 'Error enviando email');

  res.json({ success: true, message: 'Email enviado' });
}));

router.post('/:id/booking-confirmation', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const schema = z.object({
    clienteId: z.string().uuid(),
    service: z.string().min(1),
    date: z.string().datetime(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    notes: z.string().optional(),
  });

  const data = schema.parse(req.body);

  const [cliente] = await db.select()
    .from(clientes)
    .where(and(eq(clientes.id, data.clienteId), eq(clientes.negocioId, negocioId)));

  if (!cliente) throw new AppError(404, 'Cliente no encontrado');
  if (!cliente.email) throw new AppError(400, 'Cliente no tiene email');

  const [negocio] = await db.select().from(negocios)
    .where(eq(negocios.id, negocioId));

  const config = negocio?.configJson as any;

  const template = getBookingConfirmationTemplate({
    businessName: config?.branding?.nombre || negocio?.nombre || 'Negocio',
    businessLogo: config?.branding?.logo,
    clientName: cliente.nombre,
    service: data.service,
    date: new Date(data.date),
    time: data.time,
    notes: data.notes,
    whatsappNumber: config?.integraciones?.whatsapp,
  });

  const sent = await sendEmail({
    to: cliente.email,
    subject: `Confirmación de reserva - ${config?.branding?.nombre || 'Negocio'}`,
    html: template.html,
    text: template.text,
  });

  if (!sent) throw new AppError(500, 'Error enviando email de confirmación');

  res.json({ success: true, message: 'Confirmación enviada' });
}));

export { router as clientesRouter };