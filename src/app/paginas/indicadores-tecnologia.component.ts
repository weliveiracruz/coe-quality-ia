import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IndicadoresTecnologia, IndicadoresTecnologiaService, ScoreTecnologia, UnidadeTecnologia,
  ROTULO_TIPO, faixaDoScore, formatarPercentual, indicadoresEmAtencao, linkAnalitico, nomeDoMes, textoVariacao,
} from '../servicos/indicadores-tecnologia.service';
import { formatarData } from '../servicos/conteudo.service';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';
import { IconeComponent } from '../layout/icone.component';

/** Último score mensal de tecnologia da comunidade, da RT e das squads, com o link do dashboard oficial de cada score. */
@Component({
  selector: 'app-indicadores-tecnologia',
  standalone: true,
  imports: [RouterLink, TrilhaComponent, IconeComponent],
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Indicadores', rota: '/indicadores' }, { rotulo: 'Indicadores de tecnologia' }]" />
      <h1>Indicadores de tecnologia</h1>
      <p class="resumo">Último score mensal de Cyber, Confiabilidade, Resiliência, CMDB e Dados da Comunidade Experiência e Design,
        da RT Indicadores de Experiência e das squads da RT. Cada resultado abre o dashboard oficial do score, filtrado pela unidade,
        com o analítico de pendências e inconsistências.</p>

      @if (dados(); as d) {
        <p class="referencia"><strong>Mês de referência: {{ mes(d.mes_referencia) }}</strong> (último mês fechado).
          Atualizado em {{ data(d.atualizado_em) }}. A variação compara com {{ mes(d.mes_anterior) }}.</p>

        <section aria-labelledby="t-faixas" class="bloco">
          <h2 id="t-faixas">Como ler as faixas</h2>
          <ul class="legenda">
            <li><span class="faixa faixa--verde">Dentro da meta</span> 90% ou mais</li>
            <li><span class="faixa faixa--amarela">Atenção</span> de 85% a 89,9%</li>
            <li><span class="faixa faixa--laranja">Alerta</span> de 80% a 84,9%</li>
            <li><span class="faixa faixa--vermelha">Crítico</span> abaixo de 80%</li>
          </ul>
          <p class="nota">{{ emAtencao() }} {{ emAtencao() === 1 ? 'resultado está abaixo' : 'resultados estão abaixo' }} de 90% neste mês e
            {{ emAtencao() === 1 ? 'aparece' : 'aparecem' }} também na <a routerLink="/">página inicial</a>.</p>
        </section>

        <section aria-labelledby="t-scores" class="bloco">
          <h2 id="t-scores">Scores e dashboards oficiais</h2>
          <ul class="scores">
            @for (s of d.scores; track s.id) {
              <li class="cartao score">
                <h3>{{ s.nome }}</h3>
                <p>{{ s.descricao }}</p>
                @if (valorDe(comunidade(), s); as v) {
                  <p class="comunidade">Comunidade: <strong>{{ pct(v[0]) }}</strong>
                    <span [class]="'faixa faixa--' + faixa(v[0]).id">{{ faixa(v[0]).rotulo }}</span></p>
                }
                <a class="botao botao--secundario" [href]="s.dashboard">
                  <app-icone nome="externo" /> Dashboard oficial<span class="sr-only"> do {{ s.nome }}</span>
                </a>
              </li>
            }
          </ul>
        </section>

        <section aria-labelledby="t-resultado" class="bloco">
          <h2 id="t-resultado">Resultado por comunidade, RT e squad</h2>
          <p class="nota">Escolha um resultado para abrir o analítico de pendências e inconsistências daquela unidade no dashboard oficial.</p>
          <div class="rolavel" role="region" aria-labelledby="t-resultado" tabindex="0">
            <table>
              <caption class="sr-only">Score de {{ mes(d.mes_referencia) }} por unidade, com a faixa e a variação em relação a {{ mes(d.mes_anterior) }}</caption>
              <thead>
                <tr>
                  <th scope="col">Unidade</th>
                  @for (s of d.scores; track s.id) { <th scope="col">{{ s.nome }}</th> }
                </tr>
              </thead>
              <tbody>
                @for (u of d.unidades; track u.id) {
                  <tr [class]="'nivel--' + u.tipo">
                    <th scope="row">
                      <span class="tipo">{{ tipo(u) }}</span>
                      <span class="nome">{{ u.nome }}</span>
                    </th>
                    @for (s of d.scores; track s.id) {
                      <td>
                        @if (valorDe(u, s); as v) {
                          <a class="resultado" [href]="analitico(s, u, d.mes_referencia)">
                            <span class="valor">{{ pct(v[0]) }}</span>
                            <span class="sr-only">, analítico do {{ s.nome }} da {{ u.nome }}</span>
                          </a>
                          <span [class]="'faixa faixa--' + faixa(v[0]).id">{{ faixa(v[0]).rotulo }}</span>
                          <span class="variacao">{{ variacao(v[0], v[1]) }}</span>
                        } @else {
                          <span class="sem-dado">sem dado</span>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      } @else if (erro()) {
        <p class="aviso">Os indicadores de tecnologia não estão disponíveis agora. Tente de novo mais tarde.</p>
      } @else {
        <p role="status">Carregando indicadores…</p>
      }
    </div>
  `,
  styles: [`
    .resumo { font-size: var(--ids-font-size-lg); color: var(--ids-color-text-secondary); max-width: 60rem; }
    .referencia { margin-top: var(--ids-space-4); }
    .bloco { margin-top: var(--ids-space-6); }
    .nota { color: var(--ids-color-text-secondary); }
    .legenda { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: var(--ids-space-3) var(--ids-space-5); }
    .legenda li { display: inline-flex; align-items: center; gap: var(--ids-space-2); }
    .scores { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: var(--ids-space-4); }
    .score { display: flex; flex-direction: column; gap: var(--ids-space-2); }
    .score h3 { margin: 0; font-size: var(--ids-font-size-lg); }
    .score p { margin: 0; }
    .score .botao { margin-top: auto; align-self: flex-start; }
    .comunidade { display: flex; flex-wrap: wrap; align-items: center; gap: var(--ids-space-2); }
    .rolavel { background: var(--ids-color-surface-default); border: var(--ids-border-width) solid var(--ids-color-border-default); border-radius: var(--ids-radius-lg); }
    table { min-width: 64rem; }
    th[scope="col"] { white-space: nowrap; }
    th[scope="row"] { color: var(--ids-color-text-primary); font-size: var(--ids-font-size-md); min-width: 15rem; }
    .tipo { display: block; font-size: var(--ids-font-size-xs); color: var(--ids-color-text-secondary); font-weight: var(--ids-font-weight-regular); }
    .nome { font-weight: var(--ids-font-weight-bold); }
    .nivel--rt th[scope="row"] { padding-left: var(--ids-space-5); }
    .nivel--squad th[scope="row"] { padding-left: var(--ids-space-7); }
    .nivel--comunidade { background: var(--ids-color-surface-muted); }
    td { white-space: nowrap; }
    .resultado { display: inline-flex; align-items: center; min-height: 24px; min-width: 24px; margin-right: var(--ids-space-2); }
    .valor { font-size: var(--ids-font-size-lg); font-weight: var(--ids-font-weight-bold); font-variant-numeric: tabular-nums; }
    .variacao { display: block; font-size: var(--ids-font-size-xs); color: var(--ids-color-text-secondary); margin-top: var(--ids-space-1); }
    .sem-dado { color: var(--ids-color-text-secondary); }
  `],
})
export class IndicadoresTecnologiaComponent {
  private servico = inject(IndicadoresTecnologiaService);
  readonly dados = signal<IndicadoresTecnologia | null>(null);
  readonly erro = signal(false);
  readonly comunidade = computed(() => this.dados()?.unidades.find((u) => u.tipo === 'comunidade'));
  readonly emAtencao = computed(() => { const d = this.dados(); return d ? indicadoresEmAtencao(d).length : 0; });

  constructor() {
    const pagina = inject(PaginaService);
    this.servico.carregar()
      .then((d) => this.dados.set(d))
      .catch(() => this.erro.set(true))
      .finally(() => pagina.pronta('Indicadores de tecnologia'));
  }

  valorDe(u: UnidadeTecnologia | undefined, s: ScoreTecnologia) { return u?.valores[s.id]; }
  faixa = faixaDoScore;
  pct = formatarPercentual;
  variacao = textoVariacao;
  mes = nomeDoMes;
  data = formatarData;
  tipo = (u: UnidadeTecnologia) => ROTULO_TIPO[u.tipo];
  analitico = linkAnalitico;
}
