import { test } from '@playwright/test';
test.skip(!process.env.COE_CAPTURAS, 'só quando COE_CAPTURAS=1');
test('capturas', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/'); await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/capturas/inicio.png', fullPage: true });
  await page.getByRole('button', { name: 'Inteligência Artificial' }).click();
  await page.screenshot({ path: 'docs/capturas/menu-ia.png' });
  await page.goto('/sobre/modelo-atuacao'); await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/capturas/pagina.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/capturas/celular.png' });
});
