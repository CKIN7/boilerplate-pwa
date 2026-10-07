import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { verifyToken } from '../utils/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
  negocioSlug: z.string().optional(),
});

router.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  
  // TODO: Implementar login con Better Auth
  // const user = await authService.login(data.email, data.password);
  
  res.json({
    message: 'Login endpoint - TODO: implementar con Better Auth',
    user: { email: data.email },
  });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  
  // TODO: Implementar registro con Better Auth
  
  res.status(201).json({
    message: 'Registro endpoint - TODO: implementar con Better Auth',
    user: { email: data.email, nombre: data.nombre },
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }
  
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  res.json({ user: payload });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  // TODO: Implementar refresh token
  res.json({ message: 'Refresh endpoint - TODO' });
}));

export { router as authRouter };