// Indicadores de tecnologia, seção de atenção da página inicial, catálogos de Skills e MCPs e Fale com o COE.
import { test, expect } from '../support/coe';
import { indicadores } from './_site';

const FAIXA = (v: number) => (Math.round(v * 10) / 10 >= 90 ? 'Dentro da meta' : v >= 85 ? 'Atenção' : v >= 80 ? 'Alerta' : 'Crítico');
const pct = (v: number) => `${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

test.describe('Indicadores de tecnologia', () => {
  test('CEN-SITE-021 resultado de outubro por comunidade, RT e squad, com a faixa escrita', async ({ page }) => {
    await page.goto('/indicadores/tecnologia');
    await expect(page.getByRole('heading', { level: 1, name: 'Indicadores de tecnologia' })).toBeVisible();
    await expect(page.getByText('Mês de referência: outubro de 2026')).toBeVisible();
    const tabela = page.getByRole('region', { name: 'Resultado por comunidade, RT e squad' }).getByRole('table');
    await expect(tabela.getByRole('columnheader')).toHaveText(['Unidade', ...indicadores.scores.map((s: { nome: string }) => s.nome)]);
    for (const u of indicadores.unidades) {
      const linha = tabela.getByRole('row').filter({ has: page.getByRole('rowheader', { name: new RegExp(u.nome) }) });
      const celulas = linha.getByRole('cell');
      for (const [i, s] of indicadores.scores.entries()) {
        const [valor] = u.valores[s.id];
        await expect(celulas.nth(i), `${u.nome} · ${s.nome}`).toContainText(pct(valor));
        await expect(celulas.nth(i), `${u.nome} · ${s.nome}`).toContainText(FAIXA(valor));
      }
    }
  });

  test('CEN-SITE-021 cor da faixa segue o resultado', async ({ page }) => {
    await page.goto('/indicadores/tecnologia');
    const linha = page.getByRole('row').filter({ has: page.getByRole('rowheader', { name: /Squad CX RAIOS/ }) });
    await expect(linha.locator('.faixa--vermelha')).toHaveText('Crítico');   // CMDB 78,4%
    await expect(linha.locator('.faixa--laranja')).toHaveText('Alerta');     // Resiliência 82,6%
    await expect(linha.locator('.faixa--amarela')).toHaveText('Atenção');    // Confiabilidade 87,2%
    await expect(linha.locator('.faixa--verde')).toHaveCount(2);              // Cyber e Dados
  });

  test('CEN-SITE-022 resultado e cartão de cada score levam ao dashboard oficial', async ({ page }) => {
    await page.goto('/indicadores/tecnologia');
    for (const s of indicadores.scores) {
      await expect(page.getByRole('link', { name: `Dashboard oficial do ${s.nome}` })).toHaveAttribute('href', s.dashboard);
    }
    const link = page.getByRole('link', { name: /^78,4%\s*, analítico do Score CMDB da Squad CX RAIOS$/ });
    await expect(link).toHaveAttribute('href', 'https://indicadores-tecnologia.itau.corp/score-cmdb?unidade=squad-cx-raios&mes=2026-10');
  });

  test('CEN-SITE-021 menu Indicadores leva à página', async ({ page }) => {
    await page.goto('/');
    const botao = page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Indicadores' });
    await botao.click();
    await page.locator(`#${await botao.getAttribute('aria-controls')}`).getByRole('link', { name: /^Indicadores de tecnologia/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Indicadores de tecnologia' })).toBeFocused();
  });
});

test.describe('Página inicial — indicadores que precisam de atenção', () => {
  test('CEN-SITE-023 lista só o que está abaixo de 90%, do menor para o maior', async ({ page }) => {
    await page.goto('/');
    const secao = page.getByRole('region', { name: 'Indicadores que precisam de atenção' }).first();
    const esperados = indicadores.unidades
      .flatMap((u: any) => indicadores.scores.map((s: any) => ({ u: u.nome, s: s.nome, v: u.valores[s.id][0] })))
      .filter((x: any) => x.v < 90).sort((a: any, b: any) => a.v - b.v);
    const linhas = secao.getByRole('table').getByRole('row').filter({ has: page.getByRole('rowheader') });
    await expect(linhas).toHaveCount(esperados.length);
    await expect(linhas.first()).toContainText('Squad CX RAIOS');
    await expect(linhas.first()).toContainText('Score CMDB');
    await expect(linhas.first()).toContainText('78,4%');
    await expect(linhas.first()).toContainText('Crítico');
    await expect(secao.getByText('Dentro da meta')).toHaveCount(0);
    await expect(secao.getByRole('link', { name: 'Ver pendências do Score CMDB da Squad CX RAIOS' })).toHaveAttribute('href', /score-cmdb\?unidade=squad-cx-raios&mes=2026-10$/);
    await secao.getByRole('link', { name: 'Ver todos os indicadores de tecnologia' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Indicadores de tecnologia' })).toBeVisible();
  });
});

test.describe('Catálogos', () => {
  test('CEN-SITE-024 skills: filtro por origem e busca anunciam a quantidade', async ({ page }) => {
    await page.goto('/inteligencia-artificial/skills');
    const status = page.getByRole('status');
    await expect(status).toHaveText(/^\d+ skills encontradas$/);
    const total = Number((await status.innerText()).split(' ')[0]);
    await page.getByLabel('Origem').selectOption({ label: 'Criadas pelo COE' });
    const coe = Number((await status.innerText()).split(' ')[0]);
    await page.getByLabel('Origem').selectOption({ label: 'Reutilizadas de outros times' });
    const reutilizadas = Number((await status.innerText()).split(' ')[0]);
    expect(coe + reutilizadas).toBe(total);
    await expect(page.getByText('Reutilizada de Anthropic (skills públicas)').first()).toBeVisible();
    await page.getByLabel('Origem').selectOption({ label: 'Todas' });
    await page.getByLabel('Buscar por nome, uso ou categoria').fill('acessibilidade');
    await expect(page.getByRole('heading', { level: 2, name: 'Revisão de acessibilidade WCAG 2.2 AA' })).toBeVisible();
    await page.getByLabel('Buscar por nome, uso ou categoria').fill('nada-disso');
    await expect(status).toHaveText('0 skills encontradas');
    await page.getByRole('link', { name: 'Pedir inclusão de skill' }).click();
    await expect(page.getByRole('radio', { name: 'Incluir uma Skill no catálogo' })).toBeChecked();
  });

  test('CEN-SITE-025 MCPs: situação, busca, acesso e documentação', async ({ page }) => {
    await page.goto('/inteligencia-artificial/mcps');
    await page.getByLabel('Situação').selectOption({ label: 'Em avaliação' });
    await expect(page.getByRole('status')).toHaveText('2 MCPs encontrados');
    await page.getByLabel('Situação').selectOption({ label: 'Todas' });
    await page.getByLabel('Buscar por nome, uso ou categoria').fill('sonar');
    await expect(page.getByRole('status')).toHaveText('1 MCP encontrado');
    const item = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'SonarQube' }) });
    await expect(item.getByText('Acesso')).toBeVisible();
    await expect(item.getByRole('link', { name: 'Documentação oficial do MCP SonarQube' })).toHaveAttribute('href', 'https://github.com/SonarSource/sonarqube-mcp-server');
  });
});

test.describe('Fale com o COE', () => {
  test('CEN-SITE-026 erros com resumo focado, correção e pedido pronto para o GitHub', async ({ page }) => {
    await page.goto('/sobre/fale-com-o-coe');
    await page.getByRole('button', { name: 'Revisar pedido' }).click();
    const resumo = page.getByRole('alert');
    await expect(resumo).toBeFocused();
    await expect(resumo.getByRole('heading')).toHaveText('Corrija 5 campos para continuar');
    await resumo.getByRole('link', { name: 'Informe seu nome.' }).click();
    await expect(page.getByLabel('Seu nome')).toBeFocused();
    await expect(page.getByLabel('Seu nome')).toHaveAttribute('aria-invalid', 'true');

    await page.getByRole('radio', { name: 'Missão com a squad' }).check();
    await page.getByLabel('Seu nome').fill('Ana Souza');
    await page.getByLabel('Squad ou time').fill('Squad Pesquisa SDK');
    await page.getByLabel('Título do pedido').fill('Missão de testes de resiliência');
    await page.getByLabel('Descrição').fill('O score de resiliência caiu para 84,3% e queremos apoio para os testes de recuperação.');
    await expect(page.getByLabel('Seu nome')).not.toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Revisar pedido' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Pedido pronto para envio' })).toBeFocused();
    await expect(page.getByText('[Missão] Missão de testes de resiliência')).toBeVisible();
    const enviar = page.getByRole('link', { name: 'Enviar pelo GitHub' });
    const href = new URL((await enviar.getAttribute('href'))!);
    expect(`${href.origin}${href.pathname}`).toBe('https://github.com/weliveiracruz/coe-quality-ia/issues/new');
    expect(href.searchParams.get('labels')).toBe('fale-com-o-coe,missao');
    expect(href.searchParams.get('body')).toContain('Squad Pesquisa SDK');

    await page.getByRole('button', { name: 'Editar o pedido' }).click();
    await expect(page.getByLabel('Título do pedido')).toHaveValue('Missão de testes de resiliência');
  });

  test('CEN-SITE-026 home, rodapé e menu Sobre levam ao Fale com o COE', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Solicitar missão com o COE' })).toHaveAttribute('href', '/sobre/fale-com-o-coe');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Fale com o COE' })).toHaveAttribute('href', '/sobre/fale-com-o-coe');
  });
});
