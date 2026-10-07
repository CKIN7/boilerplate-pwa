import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireTenant } from '../middleware/auth';
import { sendWhatsAppTemplate, getWhatsAppTemplates, createWhatsAppTemplate, verifyWebhookSignature } from '../utils/whatsapp';

const router = Router();

const sendMessageSchema = z.object({
  to: z.string().min(10),
  template: z.string(),
  language: z.string().default('es'),
  parameters: z.array(z.string()).optional(),
});

router.post('/send', requireTenant, asyncHandler(async (req, res) => {
  const data = sendMessageSchema.parse(req.body);
  
  const result = await sendWhatsAppTemplate({
    to: data.to,
    templateName: data.template,
    languageCode: data.language,
    parameters: data.parameters?.map(text => ({ type: 'text', text })),
  });

  res.json({ success: true, data: result });
}));

router.post('/template', requireTenant, asyncHandler(async (req, res) => {
  const result = await createWhatsAppTemplate(req.body);
  res.status(201).json({ success: true, data: result });
}));

router.get('/templates', requireTenant, asyncHandler(async (req, res) => {
  const result = await getWhatsAppTemplates();
  res.json({ success: true, data: result });
}));

router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);
  
  if (signature && !verifyWebhookSignature(payload, signature)) {
    return res.sendStatus(403);
  }
  
  console.log('WhatsApp webhook received:', JSON.stringify(req.body, null, 2));
  res.json({ received: true });
}));

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.send(challenge);
  }

  res.sendStatus(403);
});

export { router as whatsappRouter };