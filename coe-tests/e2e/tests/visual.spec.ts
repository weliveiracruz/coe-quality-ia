// Regressão visual das páginas principais. As imagens de referência ficam em tests/__snapshots__/.
// Primeira execução (ou mudança visual aprovada): npx playwright test -c coe-tests/e2e/playwright.config.ts --update-snapshots
import path from 'node:path';
import { test, expect } from '../support/coe';

const PAGINAS: [string, string][] = [['inicio', '/'], ['framework', '/qualidade/coe-test-framework'], ['templates', '/qualidade/templates'], ['tecnologia', '/indicadores/tecnologia']];

for (const [nome, rota] of PAGINAS) {
  test(`CEN-SITE-019 ${nome} sem regressão visual`, async ({ page, perfil }) => {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${nome}.png`, {
      fullPage: true,
      mask: perfil.visual.mascarar.map((s) => page.locator(s)),
      stylePath: path.join(__dirname, 'visual.css'),
    });
  });
}
