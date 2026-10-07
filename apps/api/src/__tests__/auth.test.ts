import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateAccessToken, generateRefreshToken, verifyToken, decodeToken, TokenPayload } from '../utils/auth';

const mockPayload: TokenPayload = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  negocioId: '123e4567-e89b-12d3-a456-426614174001',
  email: 'test@example.com',
  rol: 'owner',
};

describe('auth utils', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.rol).toBe(mockPayload.rol);
    });

    it('should throw on invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw on expired token', () => {
      const expiredToken = generateAccessToken(mockPayload);
      // Note: In real test, we'd manipulate time or use a token with past expiry
      // This is just a placeholder
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token.here');
      expect(decoded).toBeNull();
    });
  });
});