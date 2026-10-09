export {};

declare global {
  namespace Express {
    interface Request {
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
  }
}
