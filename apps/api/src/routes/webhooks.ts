import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/whatsapp', asyncHandler(async (req, res) => {
  console.log('WhatsApp webhook received:', req.body);
  res.json({ received: true });
}));

router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.send(challenge);
  }

  res.sendStatus(403);
});

router.post('/stripe', asyncHandler(async (req, res) => {
  console.log('Stripe webhook received:', req.body);
  res.json({ received: true });
}));

router.post('/mercadopago', asyncHandler(async (req, res) => {
  console.log('MercadoPago webhook received:', req.body);
  res.json({ received: true });
}));

export { router as webhooksRouter };