import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { verifyToken, TokenPayload } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  negocioId?: string;
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token no proporcionado');
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError(401, 'Token inválido o expirado');
  }
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