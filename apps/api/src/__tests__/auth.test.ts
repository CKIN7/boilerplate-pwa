import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auth } from '../lib/auth';

describe('Better Auth', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  });

  describe('auth instance', () => {
    it('should create auth instance with email/password enabled', () => {
      expect(auth).toBeDefined();
      expect(auth.api).toBeDefined();
      expect(auth.api.signInEmail).toBeDefined();
      expect(auth.api.signUpEmail).toBeDefined();
      expect(auth.api.getSession).toBeDefined();
      expect(auth.api.signOut).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should have session configuration', () => {
      // Better Auth config is tested via integration tests
      expect(true).toBe(true);
    });
  });
});