#!/usr/bin/env node
// Garante que componentes e páginas usem só tokens do design system: nenhuma cor (hex, rgb, hsl)
// nem fonte escrita à mão fora de src/styles/tokens.css. Roda antes do build e no CI.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PERMITIDO = new Set([path.join(RAIZ, 'src/styles/tokens.css')]);
const PADROES = [
  { nome: 'cor hexadecimal', re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/g },
  { nome: 'cor rgb/hsl', re: /\b(rgba?|hsla?)\(/g },
  { nome: 'família de fonte', re: /font-family:(?!\s*var\()/g },
];

function arquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? arquivos(p) : /\.(css|html|ts)$/.test(e.name) ? [p] : [];
  });
}

const achados = [];
for (const arq of arquivos(path.join(RAIZ, 'src'))) {
  if (PERMITIDO.has(arq)) continue;
  const linhas = fs.readFileSync(arq, 'utf8').split('\n');
  linhas.forEach((linha, i) => {
    if (/^\s*(\/\/|\*|<!--)/.test(linha)) return; // comentários
    for (const p of PADROES) {
      // em .ts/.html, "#" seguido de id de âncora (ex.: href="#conteudo") não é cor
      const ocorrencias = [...linha.matchAll(p.re)].filter((m) => !(p.nome === 'cor hexadecimal' && /href="#|'#|`#/.test(linha.slice(Math.max(0, m.index - 7), m.index + 1))));
      if (ocorrencias.length) achados.push(`${path.relative(RAIZ, arq)}:${i + 1} ${p.nome}: ${linha.trim().slice(0, 100)}`);
    }
  });
}

if (achados.length) {
  console.error(`Valores fora dos tokens do design system (${achados.length}). Use var(--ids-...):\n - ${achados.join('\n - ')}`);
  process.exit(1);
}
console.log('Tokens: nenhum valor de cor ou fonte fora de src/styles/tokens.css.');
