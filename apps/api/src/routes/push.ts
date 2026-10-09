import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { db } from '@boilerplate/db';
import { pushSubscriptions, usuarios } from '@boilerplate/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendPushNotification, getVapidPublicKey, createBookingPayload, createReminderPayload, createCancellationPayload } from '../utils/webpush';

const router = Router();

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const sendSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().url().optional(),
  })).optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
});

const notifyReservationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
  reservaId: z.string().uuid(),
  type: z.enum(['booking', 'reminder', 'cancellation']),
  title: z.string().optional(),
  body: z.string().optional(),
});

router.get('/vapid-key', requireAuth, requireTenant, asyncHandler(async (_req, res) => {
  const publicKey = getVapidPublicKey();
  res.json({ publicKey });
}));

router.post('/subscribe', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const data = subscribeSchema.parse(req.body);
  const userId = req.user!.userId;
  const negocioId = req.negocioId!;

  await db.insert(pushSubscriptions).values({
    userId,
    negocioId,
    endpoint: data.endpoint,
    p256dh: data.keys.p256dh,
    auth: data.keys.auth,
  }).onConflictDoUpdate({
    target: [pushSubscriptions.endpoint],
    set: {
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      updatedAt: new Date(),
    },
  });

  res.json({ success: true, message: 'Suscripción guardada' });
}));

router.delete('/subscribe', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { endpoint } = req.body;

  if (!endpoint) throw new AppError(400, 'Endpoint requerido');

  await db.delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));

  res.json({ success: true, message: 'Suscripción eliminada' });
}));

router.get('/subscriptions', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  const subscriptions = await db.select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  res.json({ data: subscriptions });
}));

router.post('/send', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const data = sendSchema.parse(req.body);
  const { sendPushNotification } = await import('../utils/webpush');

  const subscriptions = await db.select()
    .from(pushSubscriptions)
    .where(sql`${pushSubscriptions.userId} IN (${data.userIds.map(() => '?').join(',')})`);

  const payload = {
    title: data.title,
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction,
    silent: data.silent,
  };

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }, payload))
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - success;

  res.json({ sent: success, failed });
}));

router.post('/notify-reservation', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const data = notifyReservationSchema.parse(req.body);
  const { sendPushNotification } = await import('../utils/webpush');

  const subscriptions = await db.select()
    .from(pushSubscriptions)
    .where(sql`${pushSubscriptions.userId} IN (${data.userIds.map(() => '?').join(',')})`);

  let payload: any;
  switch (data.type) {
    case 'booking':
      payload = createBookingPayload({
        title: data.title || 'Nueva reserva',
        body: data.body || 'Tienes una nueva reserva',
        reservaId: data.reservaId,
      });
      break;
    case 'reminder':
      payload = createReminderPayload({
        service: data.title || 'Servicio',
        time: data.body || '',
        reservaId: data.reservaId,
      });
      break;
    case 'cancellation':
      payload = createCancellationPayload({
        service: data.title || 'Servicio',
        time: data.body || '',
        reservaId: data.reservaId,
      });
      break;
  }

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification({
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }, payload))
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
  const failed = results.length - success;

  res.json({ sent: success, failed });
}));

export { router as pushRouter };