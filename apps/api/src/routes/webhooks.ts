import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { handleStripeWebhook } from '../utils/stripe';
import { getMercadoPagoPayment, verifyMercadoPagoWebhook } from '../utils/mercadopago';

const router = Router();

router.post('/stripe', asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    const event = await handleStripeWebhook(req.body, signature);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
}));

router.post('/mercadopago', asyncHandler(async (req, res) => {
  const signature = req.headers['x-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (signature && !verifyMercadoPagoWebhook(payload, signature)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { type, data } = req.body;
  
  if (type === 'payment') {
    try {
      const payment = await getMercadoPagoPayment(data.id);
      console.log('MercadoPago payment:', payment.status, payment.id);
    } catch (err) {
      console.error('Error fetching MercadoPago payment:', err);
    }
  }
  
  res.json({ received: true });
}));

export { router as webhooksRouter };