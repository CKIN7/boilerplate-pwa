import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { auth } from '../lib/auth';
import { db } from '@boilerplate/db';
import { negocios } from '@boilerplate/db/schema';

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

function bearerHeaders(req: { headers: { authorization?: string } }): Headers {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }
  return new Headers({ authorization: authHeader });
}

router.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  let result;
  try {
    result = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
  } catch (err) {
    console.error('Login error:', err instanceof Error ? err.message : err);
    throw new AppError(401, 'Credenciales inválidas');
  }

  res.json({
    user: result.user,
    token: result.token,
  });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  if (!data.negocioSlug) {
    throw new AppError(400, 'negocioSlug es requerido para registro');
  }

  const negocio = await db.query.negocios.findFirst({
    where: eq(negocios.slug, data.negocioSlug),
  });
  if (!negocio) {
    throw new AppError(400, 'Negocio no encontrado');
  }

  let result;
  try {
    result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.nombre,
        negocioId: negocio.id,
        rol: 'owner',
      },
    });
  } catch (err) {
    console.error('Register error:', err instanceof Error ? err.message : err);
    throw new AppError(400, 'Error al registrar usuario');
  }

  res.status(201).json({
    user: result.user,
    token: result.token,
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const headers = bearerHeaders(req);

  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new AppError(401, 'Sesión inválida o expirada');
  }

  res.json({ user: session.user, session: session.session });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const headers = bearerHeaders(req);

  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new AppError(401, 'No se pudo refrescar la sesión');
  }

  res.json({ user: session.user, session: session.session });
}));

router.post('/logout', asyncHandler(async (req, res) => {
  const headers = bearerHeaders(req);

  await auth.api.signOut({ headers });

  res.json({ message: 'Sesión cerrada' });
}));

export { router as authRouter };
