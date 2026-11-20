import { Injectable } from '@angular/core';
import { Marked } from 'marked';

export interface Documento {
  tipo: 'pagina' | 'especificacao' | 'novidade';
  caminho: string;            // ex.: paginas/qualidade/quality-baseline.md
  rota: string;               // ex.: /qualidade/quality-baseline
  titulo: string;
  area: 'ia' | 'qualidade' | 'indicadores' | 'geral';
  resumo: string;
  data?: string;              // AAAA-MM-DD
  versao?: string;
  status?: string;
  responsavel?: string;
  texto?: string;             // texto puro para busca (especificações)
}

export interface Indice {
  gerado_em: string;
  documentos: Documento[];
}

export const ROTULO_AREA: Record<Documento['area'], string> = {
  ia: 'Inteligência Artificial',
  qualidade: 'Qualidade',
  indicadores: 'Indicadores',
  geral: 'COE',
};

/** Lê o índice gerado em build (scripts/gerar-indice.mjs) e os arquivos Markdown versionados no Git. */
@Injectable({ providedIn: 'root' })
export class ConteudoService {
  private indice?: Promise<Indice>;
  private marked = new Marked({ gfm: true, breaks: false });

  carregarIndice(): Promise<Indice> {
    this.indice ??= fetch('conteudo/indice.json').then((r) => {
      if (!r.ok) throw new Error('Índice de conteúdo indisponível');
      return r.json();
    });
    return this.indice;
  }

  async documentoPorRota(rota: string): Promise<Documento | undefined> {
    return (await this.carregarIndice()).documentos.find((d) => d.rota === rota);
  }

  async html(doc: Documento): Promise<string> {
    const r = await fetch(`conteudo/${doc.caminho}`);
    if (!r.ok) throw new Error(`Conteúdo não encontrado: ${doc.caminho}`);
    const bruto = await r.text();
    const corpo = bruto.replace(/^---\n[\s\S]*?\n---\n/, '');
    // O título já é o h1 da página: o primeiro "# " do arquivo é removido. Níveis de título descem a partir de h2.
    const semTitulo = corpo.replace(/^\s*# .+\n/, '');
    const html = this.marked.parse(semTitulo) as string;
    // Tabelas largas rolam dentro de uma região própria (reflow a 320 px, WCAG 1.4.10), acessível por teclado.
    let n = 0;
    return html.replace(/<table>/g, () => `<div class="rolavel" role="region" tabindex="0" aria-label="Tabela ${++n}, role para os lados se necessário"><table>`)
      .replace(/<\/table>/g, '</table></div>');
  }
}

export function formatarData(iso?: string): string {
  if (!iso) return '';
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
