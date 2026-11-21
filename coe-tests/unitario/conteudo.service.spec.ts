// ConteudoService: leitura do índice e conversão do Markdown versionado no Git em HTML.
import { ConteudoService, Documento, ROTULO_AREA, formatarData } from '../../src/app/servicos/conteudo.service';

const DOC: Documento = { tipo: 'pagina', caminho: 'paginas/qualidade/x.md', rota: '/qualidade/x', titulo: 'X', area: 'qualidade', resumo: 'r' };

function responder(corpo: string, ok = true) {
  return jest.fn().mockResolvedValue({ ok, text: () => Promise.resolve(corpo), json: () => Promise.resolve(JSON.parse(corpo)) });
}

const MD = ['---', 'titulo: X', 'area: qualidade', 'resumo: Resumo', '---', '# X', '', 'Texto do corpo.', '', '| a | b |', '| --- | --- |', '| 1 | 2 |', '', '```bash', 'npm ci', '```', ''].join('\n');

describe('ConteudoService', () => {
  afterEach(() => { delete (globalThis as { fetch?: unknown }).fetch; });

  it('CEN-SITE-010 remove o bloco de metadados e o título repetido (LF)', async () => {
    globalThis.fetch = responder(MD);
    const html = await new ConteudoService().html(DOC);
    expect(html).toContain('<p>Texto do corpo.</p>');
    expect(html).not.toContain('titulo:');
    expect(html).not.toContain('<h1');
  });

  it('CEN-SITE-010 remove o bloco de metadados com fim de linha do Windows (CRLF) e BOM', async () => {
    globalThis.fetch = responder('﻿' + MD.replace(/\n/g, '\r\n'));
    const html = await new ConteudoService().html(DOC);
    expect(html).not.toContain('titulo:');
    expect(html).not.toContain('<hr');
    expect(html).not.toContain('<h1');
    expect(html).not.toContain('\uFEFF');
    expect(html.startsWith('<p>Texto do corpo.</p>')).toBe(true);
  });

  it('CEN-SITE-011 tabela vira região rolável com foco e nome; bloco de código recebe foco', async () => {
    globalThis.fetch = responder(MD);
    const html = await new ConteudoService().html(DOC);
    expect(html).toMatch(/<div class="rolavel" role="region" tabindex="0" aria-label="Tabela 1[^"]*"><table>/);
    expect(html).toContain('</table></div>');
    expect(html).toContain('<pre tabindex="0">');
  });

  it('CEN-SITE-010 arquivo ausente gera erro (a página mostra "não encontrada")', async () => {
    globalThis.fetch = responder('', false);
    await expect(new ConteudoService().html(DOC)).rejects.toThrow('Conteúdo não encontrado');
  });

  it('CEN-SITE-017 índice é buscado uma vez, sem cache velho, e encontra o documento pela rota', async () => {
    const fetch = responder(JSON.stringify({ gerado_em: '', documentos: [DOC] }));
    globalThis.fetch = fetch;
    const s = new ConteudoService();
    expect(await s.documentoPorRota('/qualidade/x')).toEqual(DOC);
    expect(await s.documentoPorRota('/nao-existe')).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('conteudo/indice.json', { cache: 'no-cache' });
  });

  it('CEN-SITE-017 índice indisponível gera erro', async () => {
    globalThis.fetch = responder('{}', false);
    await expect(new ConteudoService().carregarIndice()).rejects.toThrow('Índice de conteúdo indisponível');
  });

  it('CEN-SITE-002 data por extenso em português; sem data, texto vazio', () => {
    expect(formatarData('2026-11-20')).toBe('20 de novembro de 2026');
    expect(formatarData(undefined)).toBe('');
  });

  it('CEN-SITE-010 busca o arquivo do documento sem cache velho', async () => {
    const fetch = responder(MD);
    globalThis.fetch = fetch;
    await new ConteudoService().html(DOC);
    expect(fetch).toHaveBeenCalledWith('conteudo/paginas/qualidade/x.md', { cache: 'no-cache' });
  });

  it('CEN-SITE-010 só remove metadados e título do início do arquivo', async () => {
    const meio = ['Introdução.', '', '---', '', 'titulo: isto é conteúdo', '', '---', '', '# Seção que fica', ''].join('\n');
    globalThis.fetch = responder(meio);
    const html = await new ConteudoService().html(DOC);
    expect(html).toContain('titulo: isto é conteúdo');
    expect(html).toContain('<h1>Seção que fica</h1>');
    expect(html).toContain('Introdução.');
  });

  it('CEN-SITE-010 título com uma palavra só também é removido', async () => {
    globalThis.fetch = responder('---\ntitulo: X\n---\n# X\nCorpo');
    expect(await new ConteudoService().html(DOC)).not.toContain('<h1');
  });

  it('CEN-SITE-001 rótulos das áreas exibidos nas etiquetas', () => {
    expect(ROTULO_AREA).toEqual({ ia: 'Inteligência Artificial', qualidade: 'Qualidade', indicadores: 'Indicadores', geral: 'COE' });
  });
});
