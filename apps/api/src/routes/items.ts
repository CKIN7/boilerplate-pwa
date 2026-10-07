import { Router } from 'express';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { items, categorias, negocios } from '@boilerplate/db/schema';
import { generatePDF, PDFData } from '../utils/pdf';

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

router.get('/:id/pdf', requireTenant, asyncHandler(async (req, res) => {
  const negocioId = req.negocioId!;
  const [item] = await db.select()
    .from(items)
    .where(and(eq(items.id, req.params.id), eq(items.negocioId, negocioId)));
  if (!item) throw new AppError(404, 'Item no encontrado');

  const [negocio] = await db.select()
    .from(negocios)
    .where(eq(negocios.id, negocioId));
  if (!negocio) throw new AppError(404, 'Negocio no encontrado');

  const config = negocio.configJson as any;

  const pdfData: PDFData = {
    businessName: config.branding?.nombre || negocio.nombre,
    businessLogo: config.branding?.logo,
    businessAddress: config.integraciones?.direccion,
    businessPhone: config.integraciones?.telefono,
    businessEmail: config.integraciones?.email,
    documentTitle: 'Detalle de Producto/Servicio',
    documentNumber: `ITEM-${item.id.slice(0, 8).toUpperCase()}`,
    date: new Date(),
    items: [
      {
        name: item.nombre,
        description: item.descripcion,
        quantity: 1,
        unitPrice: item.precio,
        total: item.precio,
      },
    ],
    subtotal: item.precio,
    tax: 0,
    total: item.precio,
    notes: item.descripcion,
    footerText: `${config.branding?.nombre || negocio.nombre} - Generado automáticamente`,
  };

  const pdfBuffer = await generatePDF(pdfData);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="item-${item.id}.pdf"`);
  res.send(pdfBuffer);
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