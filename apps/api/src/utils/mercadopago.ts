import axios from 'axios';
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

export function verifyMercadoPagoWebhook(payload: string, signature: string): boolean {
  const { webhookSecret } = config.mercadoPago;
  if (!webhookSecret) return false;
  
  const crypto = await import('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}