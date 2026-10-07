import webpush from 'web-push';
import { config } from '../config';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

let vapidKeysGenerated = false;

export function initializeWebPush() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@boilerplate.com';

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    vapidKeysGenerated = true;
  } else {
    const keys = webpush.generateVAPIDKeys();
    process.env.VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;
    webpush.setVapidDetails(vapidSubject, keys.publicKey, keys.privateKey);
    vapidKeysGenerated = true;
    console.warn('⚠️ VAPID keys generated at runtime. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env for production.');
  }
}

export function getVapidPublicKey(): string {
  if (!vapidKeysGenerated) {
    initializeWebPush();
  }
  return process.env.VAPID_PUBLIC_KEY || '';
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  if (!vapidKeysGenerated) {
    initializeWebPush();
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.warn('Push subscription expired or invalid:', error.message);
    } else {
      console.error('Push notification error:', error);
    }
    return false;
  }
}

export async function sendPushToMultiple(
  subscriptions: PushSubscription[],
  payload: PushPayload
): Promise<{ success: number; failed: number }> {
  if (!vapidKeysGenerated) {
    initializeWebPush();
  }

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, JSON.stringify(payload)))
  );

  const success = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { success, failed };
}

export function createBookingPayload(data: {
  title: string;
  body: string;
  reservaId: string;
  actionUrl?: string;
}): PushPayload {
  return {
    title: data.title,
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    data: {
      reservaId: data.reservaId,
      url: data.actionUrl || `/reserva/${data.reservaId}`,
    },
    actions: [
      { action: 'view', title: 'Ver reserva' },
      { action: 'cancel', title: 'Cancelar' },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };
}

export function createReminderPayload(data: {
  service: string;
  time: string;
  reservaId: string;
}): PushPayload {
  return createBookingPayload({
    title: 'Recordatorio de reserva',
    body: `Tu reserva de ${data.service} es a las ${data.time}`,
    reservaId: data.reservaId,
    actionUrl: `/reserva/${data.reservaId}`,
  });
}

export function createCancellationPayload(data: {
  service: string;
  time: string;
  reservaId: string;
  reason?: string;
}): PushPayload {
  return createBookingPayload({
    title: 'Reserva cancelada',
    body: `Tu reserva de ${data.service} a las ${data.time} fue cancelada${data.reason ? ': ' + data.reason : ''}`,
    reservaId: data.reservaId,
  });
}