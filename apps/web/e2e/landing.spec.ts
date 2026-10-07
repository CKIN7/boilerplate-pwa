import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/es');
  });

  test('should load landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/Boilerplate PWA/);
    await expect(page.locator('h1')).toContainText('Una base de código');
  });

  test('should have demo section with business cards', async ({ page }) => {
    await expect(page.locator('#demo')).toBeVisible();
    await expect(page.locator('text=Restaurante El Sabor')).toBeVisible();
    await expect(page.locator('text=Clínica Dental Sonrisa')).toBeVisible();
    await expect(page.locator('text=Barbería Clásica')).toBeVisible();
    await expect(page.locator('text=Gym FitLife')).toBeVisible();
    await expect(page.locator('text=Tienda Moda Urbana')).toBeVisible();
  });

  test('should navigate to business demo', async ({ page }) => {
    await page.click('text=Restaurante El Sabor');
    await expect(page).toHaveURL(/\/es\/restaurante-el-sabor/);
    await expect(page.locator('h1')).toContainText('Reserva tu mesa');
  });
});

test.describe('Business Pages', () => {
  test('should load restaurante page with correct theme', async ({ page }) => {
    await page.goto('/es/restaurante-el-sabor');
    await expect(page.locator('header')).toContainText('Restaurante El Sabor');
    await expect(page.locator('text=Reserva tu mesa')).toBeVisible();
  });

  test('should load clinica page with correct theme', async ({ page }) => {
    await page.goto('/es/clinica-dental-sonrisa');
    await expect(page.locator('header')).toContainText('Clínica Dental Sonrisa');
    await expect(page.locator('text=Reserva tu cita')).toBeVisible();
  });

  test('should switch locale', async ({ page }) => {
    await page.goto('/en/restaurante-el-sabor');
    await expect(page.locator('h1')).toContainText('Book your table');
  });
});

test.describe('Menu Page', () => {
  test('should load menu page', async ({ page }) => {
    await page.goto('/es/restaurante-el-sabor/menu');
    await expect(page.locator('h1')).toContainText('Nuestro Menú');
  });
});

test.describe('Reservar Page', () => {
  test('should load reservar page', async ({ page }) => {
    await page.goto('/es/restaurante-el-sabor/reservar');
    await expect(page.locator('h1')).toContainText('Reservar');
  });
});