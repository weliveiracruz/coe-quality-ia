import { Injectable } from '@angular/core';

/** Scores de tecnologia (Cyber, Confiabilidade, Resiliência, CMDB e Dados) do último mês fechado. */
export interface ScoreTecnologia { id: string; nome: string; descricao: string; dashboard: string; }
export interface UnidadeTecnologia {
  id: string;
  nome: string;
  tipo: 'comunidade' | 'rt' | 'squad';
  pai?: string;
  /** [mês de referência, mês anterior], em % */
  valores: Record<string, [number, number]>;
}
export interface IndicadoresTecnologia {
  mes_referencia: string;   // AAAA-MM, último mês fechado
  mes_anterior: string;
  atualizado_em: string;    // AAAA-MM-DD
  scores: ScoreTecnologia[];
  unidades: UnidadeTecnologia[];
}

export type IdFaixa = 'verde' | 'amarela' | 'laranja' | 'vermelha';
export interface Faixa { id: IdFaixa; rotulo: string; }

/** Meta: abaixo dela o indicador aparece em "Indicadores que precisam de atenção" na página inicial. */
export const META_SCORE = 90;

/**
 * Faixas: 90% ou mais = verde; de 85% a 89,9% = amarela; de 80% a 84,9% = laranja; abaixo de 80% = vermelha.
 * A comparação usa o valor com uma casa decimal, o mesmo que aparece na tela.
 */
export function faixaDoScore(valor: number): Faixa {
  const v = Math.round(valor * 10) / 10;
  if (v >= META_SCORE) return { id: 'verde', rotulo: 'Dentro da meta' };
  if (v >= 85) return { id: 'amarela', rotulo: 'Atenção' };
  if (v >= 80) return { id: 'laranja', rotulo: 'Alerta' };
  return { id: 'vermelha', rotulo: 'Crítico' };
}

export function formatarPercentual(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Variação em pontos percentuais, em texto (a seta sozinha não basta para leitor de tela). */
export function textoVariacao(atual: number, anterior: number): string {
  const d = Math.round((atual - anterior) * 10) / 10;
  if (d === 0) return 'estável';
  const pp = Math.abs(d).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${d > 0 ? 'subiu' : 'caiu'} ${pp} p.p.`;
}

/** "2026-10" -> "outubro de 2026" */
export function nomeDoMes(aaaamm: string): string {
  const [a, m] = aaaamm.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Link do dashboard oficial já filtrado pela unidade e pelo mês: é onde a squad vê o analítico de pendências. */
export function linkAnalitico(score: ScoreTecnologia, unidade: UnidadeTecnologia, mes: string): string {
  const u = new URL(score.dashboard);
  u.searchParams.set('unidade', unidade.id);
  u.searchParams.set('mes', mes);
  return u.toString();
}

export interface ItemAtencao {
  unidade: UnidadeTecnologia;
  score: ScoreTecnologia;
  valor: number;
  anterior: number;
  faixa: Faixa;
  link: string;
}

/** Indicadores abaixo da meta no último mês fechado, do menor para o maior. */
export function indicadoresEmAtencao(d: IndicadoresTecnologia): ItemAtencao[] {
  const itens: ItemAtencao[] = [];
  for (const unidade of d.unidades) {
    for (const score of d.scores) {
      const par = unidade.valores[score.id];
      if (!par) continue;
      const [valor, anterior] = par;
      const faixa = faixaDoScore(valor);
      if (faixa.id === 'verde') continue;
      itens.push({ unidade, score, valor, anterior, faixa, link: linkAnalitico(score, unidade, d.mes_referencia) });
    }
  }
  return itens.sort((a, b) => a.valor - b.valor || a.unidade.nome.localeCompare(b.unidade.nome, 'pt-BR'));
}

export const ROTULO_TIPO: Record<UnidadeTecnologia['tipo'], string> = {
  comunidade: 'Comunidade',
  rt: 'RT',
  squad: 'Squad da RT',
};

@Injectable({ providedIn: 'root' })
export class IndicadoresTecnologiaService {
  private dados?: Promise<IndicadoresTecnologia>;

  carregar(): Promise<IndicadoresTecnologia> {
    this.dados ??= fetch('dados/indicadores-tecnologia.json', { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error('Indicadores de tecnologia indisponíveis');
      return r.json();
    });
    return this.dados;
  }
}
