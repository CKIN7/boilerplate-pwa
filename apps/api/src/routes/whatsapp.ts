import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { requireTenant } from '../middleware/auth';

const router = Router();

const sendMessageSchema = z.object({
  to: z.string().min(10),
  template: z.string(),
  parameters: z.array(z.string()).optional(),
});

router.post('/send', requireTenant, asyncHandler(async (req, res) => {
  const data = sendMessageSchema.parse(req.body);
  res.json({ message: 'Enviar WhatsApp - TODO: implementar Meta Business API', data });
}));

router.post('/template', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: 'Gestionar templates - TODO' });
}));

router.get('/templates', requireTenant, asyncHandler(async (req, res) => {
  res.json({ message: 'Listar templates - TODO', data: [] });
}));

export { router as whatsappRouter };