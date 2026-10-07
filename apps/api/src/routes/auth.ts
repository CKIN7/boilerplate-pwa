import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { auth } from '../lib/auth';

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
  
  const result = await auth.api.signInEmail({
    body: {
      email: data.email,
      password: data.password,
    },
    asResponse: true,
  });

  if (!result.ok) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  res.json({
    user: result.data.user,
    session: result.data.session,
  });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  
  let negocioId: string;
  
  if (data.negocioSlug) {
    const negocio = await import('@boilerplate/db').then(m => m.db.query.negocios.findFirst({
      where: (n, { eq }) => eq(n.slug, data.negocioSlug!),
    }));
    if (!negocio) {
      throw new AppError(400, 'Negocio no encontrado');
    }
    negocioId = negocio.id;
  } else {
    throw new AppError(400, 'negocioSlug es requerido para registro');
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.nombre,
      negocioId,
      rol: 'owner',
    },
    asResponse: true,
  });

  if (!result.ok) {
    throw new AppError(400, 'Error al registrar usuario');
  }

  res.status(201).json({
    user: result.data.user,
    session: result.data.session,
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }
  
  const token = authHeader.split(' ')[1];
  const session = await auth.api.getSession({
    headers: { authorization: `Bearer ${token}` },
  });

  if (!session) {
    throw new AppError(401, 'Sesión inválida o expirada');
  }

  res.json({ user: session.user, session: session.session });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }
  
  const token = authHeader.split(' ')[1];
  const session = await auth.api.refreshSession({
    headers: { authorization: `Bearer ${token}` },
  });

  if (!session) {
    throw new AppError(401, 'No se pudo refrescar la sesión');
  }

  res.json({ session });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }
  
  const token = authHeader.split(' ')[1];
  await auth.api.signOut({
    headers: { authorization: `Bearer ${token}` },
  });

  res.json({ message: 'Sesión cerrada' });
}));

export { router as authRouter };