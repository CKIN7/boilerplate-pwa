import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, generateSlug, truncate, getInitials } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
    });

    it('should handle tailwind merge', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in USD', () => {
      expect(formatCurrency(2500, 'USD', 'es-ES')).toBe('25,00\u00A0$');
    });

    it('should format currency in EUR', () => {
      expect(formatCurrency(1800, 'EUR', 'es-ES')).toBe('18,00\u00A0€');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDate(date, 'es-ES');
      expect(formatted).toContain('15');
      expect(formatted).toContain('ene');
      expect(formatted).toContain('2024');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Restaurante El Sabor')).toBe('restaurante-el-sabor');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Clínica Dental Sonríá')).toBe('clinica-dental-sonria');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Barbería   Clásica')).toBe('barberia-clasica');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello world', 8)).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });

  describe('getInitials', () => {
    it('should get initials from name', () => {
      expect(getInitials('Juan Pérez')).toBe('JP');
    });

    it('should handle single name', () => {
      expect(getInitials('Juan')).toBe('J');
    });

    it('should handle three names', () => {
      expect(getInitials('Juan Carlos Pérez')).toBe('JC');
    });
  });
});