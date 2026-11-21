import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogosService, Skill, filtrarPorTexto, origemDaSkill } from '../servicos/catalogos.service';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';

/** Skills que o COE disponibiliza para as squads: criadas pelo COE ou reutilizadas de outros times. */
@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RouterLink, TrilhaComponent],
  styleUrl: './catalogo.css',
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Inteligência Artificial', rota: '/inteligencia-artificial' }, { rotulo: 'Skills para as squads' }]" />
      <h1>Skills para as squads</h1>
      <p class="resumo">Skills são instruções empacotadas que ensinam o assistente de IA a fazer uma tarefa do jeito do COE.
        Aqui estão as skills criadas pelo COE e as reutilizadas de outros times, todas liberadas para as squads da RT.</p>

      <form class="filtros" role="search" aria-label="Buscar skills" (submit)="$event.preventDefault()">
        <div class="campo">
          <label for="busca-skill">Buscar por nome, uso ou categoria</label>
          <input id="busca-skill" type="search" autocomplete="off" [value]="busca()" (input)="busca.set($any($event.target).value)">
        </div>
        <div class="campo">
          <label for="origem-skill">Origem</label>
          <select id="origem-skill" (change)="origem.set($any($event.target).value)">
            <option value="">Todas</option>
            <option value="coe">Criadas pelo COE</option>
            <option value="reutilizada">Reutilizadas de outros times</option>
          </select>
        </div>
      </form>

      @if (erro()) {
        <p class="aviso">O catálogo de skills não está disponível agora. Tente de novo mais tarde.</p>
      } @else {
        <p role="status" class="contagem">{{ resultados().length }} {{ resultados().length === 1 ? 'skill encontrada' : 'skills encontradas' }}</p>
        <ul class="lista">
          @for (s of resultados(); track s.id) {
            <li class="cartao item">
              <div class="etiquetas">
                <span [class]="'etiqueta ' + (s.origem === 'coe' ? 'etiqueta--coe' : 'etiqueta--externa')">{{ origemTexto(s) }}</span>
                <span class="etiqueta etiqueta--categoria">{{ s.categoria }}</span>
              </div>
              <h2>{{ s.nome }}</h2>
              <p>{{ s.descricao }}</p>
              <dl>
                <div><dt>Quando usar</dt><dd>{{ s.quando_usar }}</dd></div>
                <div><dt>Como usar</dt><dd>{{ s.como_usar }}</dd></div>
                @if (s.referencia) {
                  <div><dt>Referência</dt><dd>
                    @if (ehLink(s.referencia)) { <a [href]="s.referencia">{{ s.referencia }}</a> } @else { {{ s.referencia }} }
                  </dd></div>
                }
              </dl>
            </li>
          } @empty {
            <li class="vazio">Nenhuma skill corresponde à busca. Tente outro termo ou escolha "Todas" em Origem.</li>
          }
        </ul>
      }

      <section class="pedido cartao" aria-labelledby="t-pedido-skill">
        <h2 id="t-pedido-skill">Sua squad tem uma skill que pode servir para outros times?</h2>
        <p>Peça a inclusão no catálogo. O COE revisa segurança, qualidade e acessibilidade antes de liberar para todas as squads.</p>
        <a class="botao" routerLink="/sobre/fale-com-o-coe" [queryParams]="{ tipo: 'skill' }">Pedir inclusão de skill</a>
      </section>
    </div>
  `,
})
export class SkillsComponent {
  private catalogos = inject(CatalogosService);
  readonly todas = signal<Skill[]>([]);
  readonly erro = signal(false);
  readonly busca = signal('');
  readonly origem = signal('');
  readonly resultados = computed(() =>
    filtrarPorTexto(this.todas(), this.busca(), (s) => [s.nome, s.descricao, s.categoria, s.quando_usar, s.time_origem])
      .filter((s) => !this.origem() || s.origem === this.origem()));

  constructor() {
    const pagina = inject(PaginaService);
    this.catalogos.carregarSkills()
      .then((s) => this.todas.set(s))
      .catch(() => this.erro.set(true))
      .finally(() => pagina.pronta('Skills para as squads'));
  }

  origemTexto = origemDaSkill;
  ehLink = (t: string) => /^https?:\/\//.test(t);
}
