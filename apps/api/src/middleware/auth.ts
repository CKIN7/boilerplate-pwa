import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { auth } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombre: string | null;
    rol: string;
    negocioId: string;
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
  negocioId?: string;
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
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

  req.user = {
    id: session.user.id,
    email: session.user.email,
    nombre: session.user.name,
    rol: (session.user as any).rol || 'staff',
    negocioId: (session.user as any).negocioId || '',
  };
  req.session = {
    id: session.session.id,
    expiresAt: session.session.expiresAt,
  };
  next();
}

export function requireTenant(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const negocioId = req.headers['x-negocio-id'] as string;
  if (!negocioId) {
    throw new AppError(400, 'Negocio no identificado (header x-negocio-id requerido)');
  }
  req.negocioId = negocioId;
  next();
}

export function requireOwner(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (req.user?.rol !== 'owner') {
    throw new AppError(403, 'Se requieren permisos de propietario');
  }
  next();
}

export function requireStaff(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  if (!['owner', 'staff'].includes(req.user?.rol || '')) {
    throw new AppError(403, 'Se requieren permisos de staff');
  }
  next();
}