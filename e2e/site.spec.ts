// Testes do site COE Quality IA: navegação, menus expansíveis, conteúdo, especificações e WCAG 2.2 AA com axe.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const indice = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/conteudo/indice.json'), 'utf8'));
const ROTAS: string[] = ['/', '/inteligencia-artificial', '/qualidade', '/indicadores', '/sobre', '/especificacoes', ...indice.documentos.filter((d: any) => d.tipo !== 'novidade').map((d: any) => d.rota)];

async function semViolacoes(page: Page, rotulo: string) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  expect(r.violations.map((v) => `${rotulo} → ${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
}

test.describe('Acessibilidade WCAG 2.2 AA em todas as páginas', () => {
  for (const rota of ROTAS) {
    test(`axe ${rota}`, async ({ page }) => {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await semViolacoes(page, rota);
    });
  }
  test('axe com menu aberto', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Qualidade' }).click();
    await semViolacoes(page, 'menu Qualidade aberto');
  });
});

test.describe('Estrutura global', () => {
  test('logo do Itaú, nome do site e botão Início em todas as páginas', async ({ page }) => {
    for (const rota of ['/', '/qualidade/quality-baseline', '/especificacoes', '/sobre/piloto']) {
      await page.goto(rota);
      const banner = page.getByRole('banner');
      await expect(banner.getByRole('link', { name: /Itaú.*COE Quality IA.*página inicial/ })).toBeVisible();
      await expect(banner.getByRole('link', { name: 'Início' })).toBeVisible();
    }
  });

  test('botão Início volta para a página inicial', async ({ page }) => {
    await page.goto('/indicadores/slis-slos');
    await page.getByRole('banner').getByRole('link', { name: 'Início' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'COE Quality IA' })).toBeVisible();
  });

  test('link "Pular para o conteúdo" é o primeiro do teclado', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  });

  test('título da página muda a cada navegação', async ({ page }) => {
    await page.goto('/qualidade/quality-radar');
    await expect(page).toHaveTitle('Quality Radar — COE Quality IA');
  });
});

test.describe('Menus expansíveis', () => {
  for (const menu of ['Inteligência Artificial', 'Qualidade', 'Indicadores', 'Especificações', 'Sobre o COE']) {
    test(`${menu}: abre, mostra opções e fecha com Esc devolvendo o foco`, async ({ page }) => {
      await page.goto('/');
      const botao = page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: menu });
      await expect(botao).toHaveAttribute('aria-expanded', 'false');
      await botao.focus();
      await page.keyboard.press('Enter');
      await expect(botao).toHaveAttribute('aria-expanded', 'true');
      const painel = page.locator(`#${await botao.getAttribute('aria-controls')}`);
      await expect(painel.getByRole('link').first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(botao).toHaveAttribute('aria-expanded', 'false');
      await expect(botao).toBeFocused();
    });
  }

  test('navegar por um item do menu leva à página e marca a página atual', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Inteligência Artificial' }).click();
    await page.getByRole('link', { name: /^AI Quality Lab/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'AI Quality Lab' })).toBeFocused();
    await page.getByRole('button', { name: /Inteligência Artificial/ }).click();
    await expect(page.getByRole('link', { name: /^AI Quality Lab/ })).toHaveAttribute('aria-current', 'page');
  });

  test('apenas um menu aberto por vez e clique fora fecha', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Qualidade' }).click();
    await page.getByRole('button', { name: 'Indicadores' }).click();
    await expect(page.getByRole('button', { name: 'Qualidade' })).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('contentinfo').click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole('button', { name: 'Indicadores' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('no celular o menu fica atrás do botão Menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu' });
    await expect(page.getByRole('button', { name: 'Qualidade' })).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('button', { name: 'Qualidade' }).click();
    await page.getByRole('link', { name: /^Quality Scorecard/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Quality Scorecard' })).toBeVisible();
    await semViolacoes(page, 'celular');
  });
});

test.describe('Página inicial', () => {
  test('dashboard de uso com números, variação em texto e tabela do gráfico', async ({ page }) => {
    await page.goto('/');
    const uso = page.getByRole('region', { name: 'Uso da solução' });
    await expect(uso.getByText('Pessoas que acessaram')).toBeVisible();
    await expect(uso.getByText(/subiu \d+% em relação ao período anterior/).first()).toBeVisible();
    await expect(uso.getByRole('img', { name: /Acessos por semana/ })).toBeVisible();
    await uso.getByText('Ver os dados do gráfico em tabela').click();
    await expect(uso.getByRole('cell', { name: '251' })).toBeVisible();
    await expect(uso.getByRole('rowheader', { name: 'Squad Pesquisa Web' })).toBeVisible();
  });

  test('novidades listam as últimas publicações', async ({ page }) => {
    await page.goto('/');
    const novidades = page.getByRole('region', { name: 'Novidades' });
    await expect(novidades.getByRole('link', { name: 'CoE Test Framework' })).toBeVisible();
    await expect(novidades.getByRole('link', { name: 'COE Quality IA no ar' })).toBeVisible();
  });
});

test.describe('Especificações (publicadas via Git)', () => {
  test('busca filtra e anuncia a quantidade', async ({ page }) => {
    await page.goto('/especificacoes');
    await page.getByLabel('Buscar por título ou texto').fill('framework');
    await expect(page.getByRole('status')).toHaveText('1 especificação encontrada');
    await page.getByLabel('Buscar por título ou texto').fill('nada-disso-existe');
    await expect(page.getByText(/Nenhuma especificação corresponde/)).toBeVisible();
  });

  test('detalhe mostra metadados e o caminho de alteração por pull request', async ({ page }) => {
    await page.goto('/especificacoes/coe-test-framework');
    await expect(page.getByRole('heading', { level: 1, name: 'CoE Test Framework' })).toBeVisible();
    await expect(page.locator('dt', { hasText: 'Versão' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Propor alteração/ })).toHaveAttribute('href', /github\.com\/weliveiracruz\/coe-quality-ia\/edit\/main\/public\/conteudo\/especificacoes\/coe-test-framework\.md/);
  });

  test('como publicar oferece criar o arquivo no repositório', async ({ page }) => {
    await page.goto('/especificacoes/publicar');
    await expect(page.getByRole('link', { name: /Criar especificação no repositório/ })).toHaveAttribute('href', /\/new\/main\/public\/conteudo\/especificacoes\?filename=nova-especificacao\.md/);
  });
});

test('página inexistente oferece voltar ao início', async ({ page }) => {
  await page.goto('/qualidade/nao-existe');
  await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
  await semViolacoes(page, '404');
});

test('reflow a 320 px sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const rota of ['/', '/sobre/piloto', '/especificacoes']) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const rola = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(rola, rota).toBe(false);
  }
});
