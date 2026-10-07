import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireAuth, requireTenant } from '../middleware/auth';
import { sendWhatsAppTemplate, getWhatsAppTemplates, createWhatsAppTemplate, verifyWebhookSignature, deleteWhatsAppTemplate } from '../utils/whatsapp';

const router = Router();

const sendMessageSchema = z.object({
  to: z.string().min(10),
  template: z.string(),
  language: z.string().default('es'),
  parameters: z.array(z.string()).optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(3).max(100).regex(/^[a-z0-9_]+$/),
  language: z.string().default('es'),
  category: z.enum(['UTILITY', 'MARKETING', 'AUTHENTICATION']),
  components: z.array(z.object({
    type: z.enum(['HEADER', 'BODY', 'FOOTER', 'BUTTONS']),
    format: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']).optional(),
    text: z.string().max(1024).optional(),
    example: z.object({
      header_handle: z.array(z.string()).optional(),
      body_text: z.array(z.array(z.string())).optional(),
    }).optional(),
    buttons: z.array(z.object({
      type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER']),
      text: z.string().max(20).optional(),
      url: z.string().url().optional(),
      phone_number: z.string().optional(),
    })).optional(),
  })),
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

router.post('/template', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const data = createTemplateSchema.parse(req.body);
  const result = await createWhatsAppTemplate(data);
  res.status(201).json({ success: true, data: result });
}));

router.get('/templates', requireTenant, asyncHandler(async (req, res) => {
  const result = await getWhatsAppTemplates();
  res.json({ success: true, data: result });
}));

router.delete('/template/:name', requireAuth, requireTenant, asyncHandler(async (req, res) => {
  const result = await deleteWhatsAppTemplate(req.params.name);
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