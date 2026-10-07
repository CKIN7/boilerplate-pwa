import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(400, 'Datos de entrada inválidos', true, error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })));
      }
      next(error);
    }
  };

export const validateBody = (schema: AnyZodObject) => validate(schema);
export const validateQuery = (schema: AnyZodObject) => validate(schema);
export const validateParams = (schema: AnyZodObject) => validate(schema);

export const reservaAvailabilitySchema = {
  body: {
    fecha: { type: 'string', format: 'date' },
    horaInicio: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
    horaFin: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
    itemId: { type: 'string', format: 'uuid' },
    excludeReservaId: { type: 'string', format: 'uuid' },
  },
};

export const createReservaSchema = {
  body: {
    clienteId: { type: 'string', format: 'uuid' },
    itemId: { type: 'string', format: 'uuid' },
    fecha: { type: 'string', format: 'date' },
    horaInicio: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
    duracionMinutos: { type: 'number', minimum: 15, maximum: 480 },
    notas: { type: 'string', maxLength: 1000, optional: true },
    origen: { type: 'string', enum: ['web', 'whatsapp', 'admin'], default: 'web' },
  },
};

export const updateReservaSchema = {
  body: {
    fecha: { type: 'string', format: 'date', optional: true },
    horaInicio: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$', optional: true },
    duracionMinutos: { type: 'number', minimum: 15, maximum: 480, optional: true },
    estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_show'], optional: true },
    notas: { type: 'string', maxLength: 1000, optional: true },
  },
  params: {
    id: { type: 'string', format: 'uuid' },
  },
};