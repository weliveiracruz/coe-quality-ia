#!/usr/bin/env node
// Gera public/conteudo/indice.json a partir dos arquivos Markdown versionados no Git.
// Roda antes de todo build (npm run build) e no CI do pull request: arquivo com metadado inválido reprova o PR.
//
// Pastas:
//   public/conteudo/paginas/<area>/<pagina>.md  -> rota /<area>/<pagina>   (área "geral": rota no frontmatter)
//   public/conteudo/novidades/<arquivo>.md      -> rota no frontmatter (para onde a novidade leva)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(RAIZ, 'public/conteudo');
const AREAS = ['ia', 'qualidade', 'indicadores', 'geral'];
const erros = [];

function ler(caminhoRel) {
  const bruto = fs.readFileSync(path.join(BASE, caminhoRel), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = bruto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { erros.push(`${caminhoRel}: falta o bloco de metadados (--- ... ---) no início`); return null; }
  let meta;
  try { meta = YAML.parse(m[1]); } catch (e) { erros.push(`${caminhoRel}: metadados inválidos (${e.message})`); return null; }
  return { meta, corpo: m[2] };
}

function exigir(meta, campos, arq) {
  for (const c of campos) if (meta[c] === undefined || meta[c] === '') erros.push(`${arq}: campo obrigatório "${c}" ausente`);
  if (meta.area && !AREAS.includes(meta.area)) erros.push(`${arq}: area "${meta.area}" inválida (use ${AREAS.join(', ')})`);
  if (meta.data && !/^\d{4}-\d{2}-\d{2}$/.test(String(meta.data))) erros.push(`${arq}: data deve ser AAAA-MM-DD`);
}

function listar(dir) {
  const abs = path.join(BASE, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listar(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name).split(path.sep).join('/')] : []);
}

const documentos = [];

for (const arq of listar('paginas')) {
  const r = ler(arq); if (!r) continue;
  const [, area, nome] = arq.match(/^paginas\/([^/]+)\/(.+)\.md$/);
  exigir(r.meta, ['titulo', 'area', 'resumo'], arq);
  documentos.push({
    tipo: 'pagina', caminho: arq, rota: r.meta.rota ?? `/${area}/${nome}`,
    titulo: r.meta.titulo, area: r.meta.area, resumo: r.meta.resumo,
  });
}

for (const arq of listar('novidades')) {
  const r = ler(arq); if (!r) continue;
  exigir(r.meta, ['titulo', 'area', 'resumo', 'data', 'rota'], arq);
  documentos.push({ tipo: 'novidade', caminho: arq, rota: r.meta.rota, titulo: r.meta.titulo, area: r.meta.area, resumo: r.meta.resumo, data: String(r.meta.data) });
}

// rotas de páginas não podem se repetir
const vistas = new Map();
for (const d of documentos.filter((x) => x.tipo !== 'novidade')) {
  if (vistas.has(d.rota)) erros.push(`rota duplicada ${d.rota}: ${vistas.get(d.rota)} e ${d.caminho}`);
  vistas.set(d.rota, d.caminho);
}
// novidade precisa apontar para algo que existe
for (const n of documentos.filter((x) => x.tipo === 'novidade')) {
  const interna = !/^https?:/.test(n.rota);
  // páginas por componente (src/app/navegacao.ts: ROTAS_DE_COMPONENTE) também podem ser destino de novidade
  const existe = vistas.has(n.rota) || ['/', '/inteligencia-artificial', '/qualidade', '/indicadores', '/sobre',
    '/indicadores/tecnologia', '/inteligencia-artificial/skills', '/inteligencia-artificial/mcps', '/sobre/fale-com-o-coe'].includes(n.rota);
  if (interna && !existe) erros.push(`${n.caminho}: rota "${n.rota}" não existe no site`);
}

if (erros.length) {
  console.error(`Conteúdo inválido (${erros.length}):\n - ${erros.join('\n - ')}`);
  process.exit(1);
}
fs.writeFileSync(path.join(BASE, 'indice.json'), JSON.stringify({ gerado_em: new Date().toISOString(), documentos }, null, 2));
console.log(`indice.json: ${documentos.length} documento(s).`);
