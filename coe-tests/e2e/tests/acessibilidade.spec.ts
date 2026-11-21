// Acessibilidade (WCAG 2.2 AA) com axe-core em navegador real, em todas as páginas do índice + o que o axe não cobre.
import { test, expect } from '../support/coe';
import { ROTAS } from './_site';

test.describe('Acessibilidade — todas as páginas', () => {
  for (const rota of ROTAS) {
    test(`CEN-SITE-008 axe sem violações graves em ${rota}`, async ({ page, auditarA11y }) => {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await auditarA11y(rota);
    });
  }

  test('CEN-SITE-008 axe com menu aberto e no celular', async ({ page, auditarA11y }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Qualidade' }).click();
    await auditarA11y('menu Qualidade aberto');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/qualidade/templates');
    await page.getByRole('button', { name: 'Menu' }).click();
    await auditarA11y('menu do celular aberto');
  });
});

test.describe('Acessibilidade — além do axe', () => {
  test('CEN-SITE-009 reflow a 320 px sem rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    for (const rota of ['/', '/qualidade/coe-test-framework', '/qualidade/templates', '/indicadores/tecnologia', '/sobre/fale-com-o-coe', '/sobre/piloto']) {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(rola, `${rota} exige rolagem horizontal (WCAG 1.4.10)`).toBe(false);
    }
  });

  test('CEN-SITE-009 botões com área de toque mínima de 24x24 px (WCAG 2.5.8)', async ({ page }) => {
    await page.goto('/');
    const botoes = page.locator('button:visible');
    for (let i = 0; i < await botoes.count(); i++) {
      const caixa = await botoes.nth(i).boundingBox();
      if (!caixa) continue;
      expect(Math.min(caixa.width, caixa.height), `botão "${await botoes.nth(i).innerText()}" menor que 24px`).toBeGreaterThanOrEqual(24);
    }
  });
});
