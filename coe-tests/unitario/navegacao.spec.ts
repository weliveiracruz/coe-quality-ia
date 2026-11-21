// Menus do topo x conteúdo publicado: nenhum item de menu pode apontar para uma página que não existe.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { MENUS, ROTAS_DE_COMPONENTE, menuPorId } from '../../src/app/navegacao';

// O índice é gerado no build (fora do Git). Num checkout limpo, como no CI e no sandbox do Stryker, ele é gerado aqui.
const ARQ_INDICE = path.resolve(__dirname, '../../public/conteudo/indice.json');
if (!fs.existsSync(ARQ_INDICE)) execFileSync(process.execPath, [path.resolve(__dirname, '../../scripts/gerar-indice.mjs')], { stdio: 'ignore' });
const indice = JSON.parse(fs.readFileSync(ARQ_INDICE, 'utf8'));
const rotas = new Set<string>(indice.documentos.filter((d: { tipo: string }) => d.tipo !== 'novidade').map((d: { rota: string }) => d.rota));
for (const r of ROTAS_DE_COMPONENTE) rotas.add(r);

describe('Menus do topo', () => {
  it.each(MENUS.flatMap((m) => m.itens.map((i) => [m.rotulo, i.rotulo, i.rota])))('CEN-SITE-017 %s › %s aponta para %s publicada', (_m, _i, rota) => {
    expect(rotas.has(rota)).toBe(true);
  });

  it('CEN-SITE-017 toda página publicada de área aparece em algum menu', () => {
    const noMenu = new Set(MENUS.flatMap((m) => m.itens.map((i) => i.rota)));
    const fora = [...rotas].filter((r) => /^\/(qualidade|indicadores|inteligencia-artificial|sobre)\//.test(r) && !noMenu.has(r));
    expect(fora).toEqual([]);
  });

  it('CEN-SITE-021 menu Indicadores traz os indicadores de tecnologia; IA traz Skills e MCPs; Sobre traz o contato', () => {
    expect(menuPorId('indicadores')!.itens.map((i) => i.rota)).toContain('/indicadores/tecnologia');
    expect(menuPorId('inteligencia-artificial')!.itens.map((i) => i.rota)).toEqual(expect.arrayContaining(['/inteligencia-artificial/skills', '/inteligencia-artificial/mcps']));
    expect(menuPorId('sobre')!.itens.map((i) => i.rota)).toContain('/sobre/fale-com-o-coe');
  });

  it('CEN-SITE-004 menu Qualidade traz o CoE Test Framework e os Templates', () => {
    const rotasQualidade = menuPorId('qualidade')!.itens.map((i) => i.rota);
    expect(rotasQualidade).toEqual(expect.arrayContaining(['/qualidade/coe-test-framework', '/qualidade/templates']));
    expect(menuPorId('nao-existe')).toBeUndefined();
  });

  it('CEN-SITE-016 todo download citado nas páginas existe em public/downloads', () => {
    const base = path.resolve(__dirname, '../../public');
    const faltando: string[] = [];
    for (const d of indice.documentos) {
      const md = fs.readFileSync(path.join(base, 'conteudo', d.caminho), 'utf8');
      for (const m of md.matchAll(/["(](\/downloads\/[^")]+)[")]/g)) if (!fs.existsSync(path.join(base, m[1]))) faltando.push(`${d.caminho} → ${m[1]}`);
    }
    expect(faltando).toEqual([]);
  });
});
