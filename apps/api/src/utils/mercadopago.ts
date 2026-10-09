import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import { config } from '../config';

const MP_BASE_URL = 'https://api.mercadopago.com';

export async function createMercadoPagoPreference(preference: {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  notification_url: string;
  external_reference: string;
}) {
  const { accessToken } = config.mercadoPago;
  
  if (!accessToken) {
    throw new Error('MercadoPago access token no configurado');
  }

  const response = await axios.post(
    `${MP_BASE_URL}/checkout/preferences`,
    preference,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export async function getMercadoPagoPayment(paymentId: string) {
  const { accessToken } = config.mercadoPago;
  
  if (!accessToken) {
    throw new Error('MercadoPago access token no configurado');
  }

  const response = await axios.get(
    `${MP_BASE_URL}/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

export function verifyMercadoPagoWebhook(opts: {
  dataId: string;
  requestId?: string;
  signature: string;
}): boolean {
  const { webhookSecret } = config.mercadoPago;
  if (!webhookSecret) return false;

  const parts: Record<string, string> = {};
  for (const pair of opts.signature.split(',')) {
    const [key, value] = pair.split('=');
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${opts.dataId};request-id:${opts.requestId ?? ''};ts:${ts};`;
  const expected = createHmac('sha256', webhookSecret).update(manifest).digest('hex');

  const received = Buffer.from(v1);
  const expectedBuffer = Buffer.from(expected);
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}