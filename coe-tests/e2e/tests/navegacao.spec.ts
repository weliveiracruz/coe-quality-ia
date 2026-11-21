// Navegação, página inicial e downloads do site COE Quality IA (canal web).
import { test, expect } from '../support/coe';
import fs from 'node:fs';
import path from 'node:path';
import { indice, MENUS, raizPublic } from './_site';

test.describe('Página inicial', () => {
  test('CEN-SITE-001 apresenta o COE, as novidades e os atalhos por área', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'COE Quality IA' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Indicadores que precisam de atenção', 'Novidades', 'Por onde começar']);
    await expect(page.getByRole('region', { name: 'Uso da solução' })).toHaveCount(0);
    const atalhos = page.getByRole('region', { name: 'Por onde começar' });
    for (const [area, rota] of [['Inteligência Artificial', '/inteligencia-artificial'], ['Qualidade', '/qualidade'], ['Indicadores', '/indicadores']]) {
      await expect(atalhos.getByRole('link', { name: area, exact: true })).toHaveAttribute('href', rota);
    }
    await expect(atalhos.getByRole('link', { name: 'Solicitar missão com o COE' })).toHaveAttribute('href', '/sobre/fale-com-o-coe');
  });

  test('CEN-SITE-002 novidades levam a páginas que existem', async ({ page }) => {
    await page.goto('/');
    const links = page.getByRole('region', { name: 'Novidades' }).getByRole('link');
    await expect(links.first()).toBeVisible();
    const destinos = await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(destinos).toContain('/qualidade/coe-test-framework');
    expect(destinos).toContain('/qualidade/templates');
    for (const destino of destinos) {
      await page.goto(destino);
      await expect(page.getByRole('heading', { level: 1 }), destino).not.toHaveText('Página não encontrada');
    }
  });

  test('CEN-SITE-020 modo demonstração abre sem login e saúda Visitante', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Boas-vindas, Visitante.')).toBeVisible();
    await expect(page).toHaveURL(/localhost/);
  });
});

test.describe('Cabeçalho e menus', () => {
  for (const menu of MENUS) {
    test(`CEN-SITE-003 ${menu}: Enter abre, Esc fecha e devolve o foco`, async ({ page }) => {
      await page.goto('/');
      const botao = page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: menu });
      await botao.focus();
      await page.keyboard.press('Enter');
      await expect(botao).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(`#${await botao.getAttribute('aria-controls')}`).getByRole('link').first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(botao).toHaveAttribute('aria-expanded', 'false');
      await expect(botao).toBeFocused();
    });
  }

  test('CEN-SITE-004 item de menu abre a página e fica marcado como atual', async ({ page }) => {
    await page.goto('/');
    const qualidade = page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Qualidade' });
    const painel = page.locator(`#${await qualidade.getAttribute('aria-controls')}`);
    await qualidade.click();
    await painel.getByRole('link', { name: /^Templates/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Templates' })).toBeFocused();
    await qualidade.click();
    await expect(painel.getByRole('link', { name: /^Templates/ })).toHaveAttribute('aria-current', 'page');
  });

  test('CEN-SITE-005 botão Início e logo voltam para a página inicial', async ({ page }) => {
    await page.goto('/indicadores/slis-slos');
    await page.getByRole('banner').getByRole('link', { name: 'Início' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'COE Quality IA' })).toBeVisible();
    await page.goto('/sobre/piloto');
    await page.getByRole('banner').getByRole('link', { name: /página inicial/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('CEN-SITE-006 "Pular para o conteúdo" é o primeiro link e leva ao título', async ({ page }) => {
    await page.goto('/qualidade/coe-test-framework');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });

  test('CEN-SITE-007 título da aba identifica a página', async ({ page }) => {
    for (const [rota, titulo] of [['/qualidade/templates', 'Templates'], ['/qualidade/coe-test-framework', 'CoE Test Framework'], ['/inteligencia-artificial/mcps', 'Catálogo de MCPs']]) {
      await page.goto(rota);
      await expect(page).toHaveTitle(`${titulo} — COE Quality IA`);
    }
  });

  test('CEN-SITE-017 todos os itens de menu levam a uma página publicada', async ({ page }) => {
    test.slow(); // visita todas as páginas dos menus (perto de 30) numa sequência só
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const rotas = new Set<string>();
    for (const menu of MENUS) {
      const botao = nav.getByRole('button', { name: menu });
      await botao.click();
      for (const href of await page.locator(`#${await botao.getAttribute('aria-controls')}`).getByRole('link').evaluateAll((as) => as.map((a) => a.getAttribute('href')!))) rotas.add(href);
      await page.keyboard.press('Escape');
    }
    expect(rotas.size).toBeGreaterThan(20);
    for (const rota of rotas) {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 }), rota).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 }), rota).not.toHaveText('Página não encontrada');
    }
  });

  test('CEN-SITE-017 o menu Especificações e as páginas dele não existem mais', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Especificações' })).toHaveCount(0);
    for (const rota of ['/especificacoes', '/especificacoes/publicar', '/especificacoes/coe-test-framework']) {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 }), rota).toHaveText('Página não encontrada');
    }
  });

  test('CEN-SITE-014 endereço inexistente oferece voltar ao início', async ({ page }) => {
    await page.goto('/qualidade/nao-existe');
    await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'início', exact: true })).toHaveAttribute('href', '/');
  });
});

test.describe('Downloads', () => {
  test('CEN-SITE-015 download do CoE Test Framework na versão anunciada', async ({ page }) => {
    await page.goto('/qualidade/coe-test-framework');
    const link = page.getByRole('link', { name: /Baixar o CoE Test Framework versão 1\.0\.1/ });
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    expect(download.suggestedFilename()).toBe('coe-test-framework-v1.0.1.zip');
    const recebido = fs.statSync(await download.path()).size;
    expect(recebido).toBe(fs.statSync(path.join(raizPublic, 'downloads/coe-test-framework-v1.0.1.zip')).size);
  });

  test('CEN-SITE-016 todos os templates existem e baixam com a versão no nome', async ({ page, request }) => {
    await page.goto('/qualidade/templates');
    const links = page.getByRole('main').locator('a[href^="/downloads/templates/"]');
    await expect(links.first()).toBeVisible();
    const hrefs = await links.evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href')!, texto: a.textContent!.trim(), download: a.hasAttribute('download') })));
    const noDisco = fs.readdirSync(path.join(raizPublic, 'downloads/templates'));
    expect(hrefs.map((h) => path.basename(h.href)).sort(), 'todo arquivo da pasta aparece na página').toEqual([...noDisco].sort());
    for (const h of hrefs) {
      expect(h.download, h.href).toBe(true);
      expect(h.texto, 'o texto do link é o nome do arquivo').toBe(path.basename(h.href));
      expect(h.texto).toMatch(/-v\d+\.\d+\.\d+\.\w+$/);
      const r = await request.get(h.href);
      expect(r.status(), h.href).toBe(200);
      expect(r.headers()['content-type'], h.href).not.toContain('text/html');
    }
    const [download] = await Promise.all([page.waitForEvent('download'), links.first().click()]);
    expect(download.suggestedFilename()).toMatch(/^kit-inicial-.+-v\d+\.\d+\.\d+\.zip$/);
  });
});
