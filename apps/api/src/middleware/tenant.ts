import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  negocioId?: string;
  negocioSlug?: string;
}

export function tenantMiddleware(req: TenantRequest, _res: Response, next: NextFunction) {
  const slug = req.headers['x-negocio-slug'] as string;
  const negocioId = req.headers['x-negocio-id'] as string;

  if (slug) {
    req.negocioSlug = slug;
  }
  if (negocioId) {
    req.negocioId = negocioId;
  }

  next();
}