// Regras dos indicadores de tecnologia: faixas de cor, lista de atenção da página inicial e links do analítico.
import fs from 'node:fs';
import path from 'node:path';
import {
  IndicadoresTecnologia, faixaDoScore, formatarPercentual, indicadoresEmAtencao, linkAnalitico, nomeDoMes, textoVariacao,
} from '../../src/app/servicos/indicadores-tecnologia.service';

const dados: IndicadoresTecnologia = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/dados/indicadores-tecnologia.json'), 'utf8'));

describe('Faixas dos scores', () => {
  it.each([
    [100, 'verde', 'Dentro da meta'], [90, 'verde', 'Dentro da meta'], [89.96, 'verde', 'Dentro da meta'],
    [89.9, 'amarela', 'Atenção'], [85, 'amarela', 'Atenção'],
    [84.9, 'laranja', 'Alerta'], [80, 'laranja', 'Alerta'],
    [79.9, 'vermelha', 'Crítico'], [0, 'vermelha', 'Crítico'],
  ])('CEN-SITE-021 %p%% fica na faixa %s (%s)', (valor, id, rotulo) => {
    expect(faixaDoScore(valor as number)).toEqual({ id, rotulo });
  });

  it('CEN-SITE-021 percentual, variação e mês em português', () => {
    expect(formatarPercentual(78.4)).toBe('78,4%');
    expect(formatarPercentual(90)).toBe('90,0%');
    expect(textoVariacao(91.6, 90.2)).toBe('subiu 1,4 p.p.');
    expect(textoVariacao(87.2, 89.4)).toBe('caiu 2,2 p.p.');
    expect(textoVariacao(90, 90)).toBe('estável');
    expect(nomeDoMes('2026-10')).toBe('outubro de 2026');
  });
});

describe('Dados publicados', () => {
  it('CEN-SITE-021 comunidade, RT e as cinco squads da RT, com os cinco scores', () => {
    expect(dados.scores.map((s) => s.id)).toEqual(['cyber', 'confiabilidade', 'resiliencia', 'cmdb', 'dados']);
    expect(dados.unidades.map((u) => u.nome)).toEqual([
      'Comunidade Experiência e Design', 'RT Indicadores de Experiência',
      'Squad Pesquisa SDK', 'Squad Pesquisa Core', 'Squad CX RAIOS', 'Squad CX Analytics', 'Squad Medição e Apuração',
    ]);
    const rt = dados.unidades.find((u) => u.tipo === 'rt')!;
    expect(rt.pai).toBe(dados.unidades.find((u) => u.tipo === 'comunidade')!.id);
    for (const s of dados.unidades.filter((u) => u.tipo === 'squad')) expect(s.pai).toBe(rt.id);
    for (const u of dados.unidades) for (const sc of dados.scores) {
      const [atual, anterior] = u.valores[sc.id];
      expect(atual).toBeGreaterThanOrEqual(0); expect(atual).toBeLessThanOrEqual(100);
      expect(anterior).toBeGreaterThanOrEqual(0); expect(anterior).toBeLessThanOrEqual(100);
    }
  });

  it('CEN-SITE-021 o mês de referência é um mês fechado, e o anterior vem logo antes', () => {
    const [a, m] = dados.mes_referencia.split('-').map(Number);
    expect(new Date(Date.UTC(a, m, 1)).getTime()).toBeLessThanOrEqual(new Date(`${dados.atualizado_em}T00:00:00Z`).getTime());
    const anterior = new Date(Date.UTC(a, m - 2, 1)).toISOString().slice(0, 7);
    expect(dados.mes_anterior).toBe(anterior);
  });

  it('CEN-SITE-022 todo score tem dashboard oficial em https', () => {
    for (const s of dados.scores) expect(s.dashboard).toMatch(/^https:\/\//);
  });
});

describe('Indicadores que precisam de atenção', () => {
  const itens = indicadoresEmAtencao(dados);

  it('CEN-SITE-023 só entra o que está abaixo de 90%, do menor para o maior', () => {
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((i) => i.valor < 90)).toBe(true);
    expect(itens.map((i) => i.valor)).toEqual([...itens.map((i) => i.valor)].sort((a, b) => a - b));
    const total = dados.unidades.flatMap((u) => dados.scores.map((s) => u.valores[s.id][0])).filter((v) => v < 90).length;
    expect(itens).toHaveLength(total);
  });

  it('CEN-SITE-023 cada item leva a faixa certa e o link do analítico', () => {
    for (const i of itens) {
      expect(i.faixa).toEqual(faixaDoScore(i.valor));
      expect(i.link).toBe(linkAnalitico(i.score, i.unidade, dados.mes_referencia));
    }
  });

  it('CEN-SITE-023 sem nada abaixo de 90%, a lista fica vazia', () => {
    const tudoVerde = { ...dados, unidades: dados.unidades.map((u) => ({ ...u, valores: Object.fromEntries(Object.keys(u.valores).map((k) => [k, [95, 94] as [number, number]])) })) };
    expect(indicadoresEmAtencao(tudoVerde)).toEqual([]);
  });

  it('CEN-SITE-022 link do analítico filtra pela unidade e pelo mês', () => {
    const u = new URL(linkAnalitico(dados.scores[3], dados.unidades[4], '2026-10'));
    expect(`${u.origin}${u.pathname}`).toBe(dados.scores[3].dashboard);
    expect(u.searchParams.get('unidade')).toBe('squad-cx-raios');
    expect(u.searchParams.get('mes')).toBe('2026-10');
  });
});
