import Stripe from 'stripe';
import { config } from '../config';

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const webhookSecret = config.stripe.webhookSecret;
  
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret no configurado');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}