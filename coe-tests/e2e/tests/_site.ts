// Dados do site usados pelos testes: índice de conteúdo gerado em build e menus do topo.
import fs from 'node:fs';
import path from 'node:path';

export type Doc = { tipo: 'pagina' | 'novidade'; rota: string; titulo: string; caminho: string };
const RAIZ = path.resolve(__dirname, '../../..');
export const indice: { documentos: Doc[] } = JSON.parse(fs.readFileSync(path.join(RAIZ, 'public/conteudo/indice.json'), 'utf8'));
export const AREAS = ['/inteligencia-artificial', '/qualidade', '/indicadores', '/sobre'];
/** Todas as rotas navegáveis: início, visões de área, páginas de conteúdo e páginas por componente. */
/** Páginas feitas por componente, com dados em public/dados/ (src/app/navegacao.ts: ROTAS_DE_COMPONENTE). */
export const ROTAS_DE_COMPONENTE = ['/indicadores/tecnologia', '/inteligencia-artificial/skills', '/inteligencia-artificial/mcps', '/sobre/fale-com-o-coe'];
export const ROTAS = ['/', ...AREAS, ...indice.documentos.filter((d) => d.tipo !== 'novidade').map((d) => d.rota), ...ROTAS_DE_COMPONENTE];
export const MENUS = ['Inteligência Artificial', 'Qualidade', 'Indicadores', 'Sobre o COE'];
export const raizPublic = path.join(RAIZ, 'public');
export const indicadores = JSON.parse(fs.readFileSync(path.join(RAIZ, 'public/dados/indicadores-tecnologia.json'), 'utf8'));
