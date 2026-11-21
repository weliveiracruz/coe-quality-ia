// Páginas de conteúdo em Markdown: metadados, tabelas e blocos de código.
import { test, expect } from '../support/coe';

test.describe('Conteúdo em Markdown', () => {
  test('CEN-SITE-010 página mostra título e resumo, sem o bloco de metadados', async ({ page }) => {
    // Simula o arquivo como o Git do Windows entrega (CRLF), o caso que quebrava as páginas.
    await page.route('**/conteudo/paginas/qualidade/quality-baseline.md', async (rota) => {
      const r = await rota.fetch();
      await rota.fulfill({ response: r, body: (await r.text()).replace(/\r?\n/g, '\r\n') });
    });
    await page.goto('/qualidade/quality-baseline');
    await expect(page.getByRole('heading', { level: 1, name: 'Quality Baseline' })).toBeVisible();
    const corpo = page.locator('.markdown');
    await expect(corpo).not.toContainText('titulo:');
    await expect(corpo).not.toContainText('resumo:');
    await expect(corpo.getByRole('heading', { level: 1 })).toHaveCount(0);
  });

  test('CEN-SITE-011 tabelas e blocos de código largos recebem foco e rolam', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/qualidade/coe-test-framework');
    await expect(page.locator('.markdown pre').first()).toBeVisible();
    const roláveis = page.locator('.markdown pre, .markdown [role=region]');
    expect(await roláveis.count()).toBeGreaterThan(3);
    for (let i = 0; i < await roláveis.count(); i++) {
      const el = roláveis.nth(i);
      const largo = await el.evaluate((e) => e.scrollWidth > e.clientWidth);
      if (!largo) continue;
      await expect(el, `elemento rolável ${i} precisa receber foco`).toHaveAttribute('tabindex', '0');
      await el.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => el.evaluate((e) => e.scrollLeft), `elemento ${i} rola pelo teclado`).toBeGreaterThan(0);
    }
  });
});
