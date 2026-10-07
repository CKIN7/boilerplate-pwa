import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { negociosRouter } from './routes/negocios';
import { itemsRouter } from './routes/items';
import { categoriasRouter } from './routes/categorias';
import { reservasRouter } from './routes/reservas';
import { clientesRouter } from './routes/clientes';
import { whatsappRouter } from './routes/whatsapp';
import { webhooksRouter } from './routes/webhooks';
import { errorHandler } from './middleware/errorHandler';
import { tenantMiddleware } from './middleware/tenant';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
});
app.use(limiter);

app.use(tenantMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/negocios', negociosRouter);
app.use('/api/items', itemsRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/webhooks', webhooksRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

export { app };