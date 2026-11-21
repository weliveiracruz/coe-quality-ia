import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogosService, Mcp, filtrarPorTexto } from '../servicos/catalogos.service';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';

/** MCPs disponíveis e catalogados pelo COE: o que cada um faz, para que serve e como pedir acesso. */
@Component({
  selector: 'app-mcps',
  standalone: true,
  imports: [RouterLink, TrilhaComponent],
  styleUrl: './catalogo.css',
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Inteligência Artificial', rota: '/inteligencia-artificial' }, { rotulo: 'Catálogo de MCPs' }]" />
      <h1>Catálogo de MCPs</h1>
      <p class="resumo">MCPs (Model Context Protocol) conectam o assistente de IA às ferramentas do dia a dia: código, pipelines,
        histórias, design e qualidade. Estes são os MCPs catalogados pelo COE, com o que cada um faz e como obter acesso.</p>

      <form class="filtros" role="search" aria-label="Buscar MCPs" (submit)="$event.preventDefault()">
        <div class="campo">
          <label for="busca-mcp">Buscar por nome, uso ou categoria</label>
          <input id="busca-mcp" type="search" autocomplete="off" [value]="busca()" (input)="busca.set($any($event.target).value)">
        </div>
        <div class="campo">
          <label for="status-mcp">Situação</label>
          <select id="status-mcp" (change)="status.set($any($event.target).value)">
            <option value="">Todas</option>
            <option value="Disponível">Disponível</option>
            <option value="Em avaliação">Em avaliação</option>
          </select>
        </div>
      </form>

      @if (erro()) {
        <p class="aviso">O catálogo de MCPs não está disponível agora. Tente de novo mais tarde.</p>
      } @else {
        <p role="status" class="contagem">{{ resultados().length }} {{ resultados().length === 1 ? 'MCP encontrado' : 'MCPs encontrados' }}</p>
        <ul class="lista">
          @for (m of resultados(); track m.id) {
            <li class="cartao item">
              <div class="etiquetas">
                <span [class]="'etiqueta ' + (m.status === 'Disponível' ? 'etiqueta--disponivel' : 'etiqueta--avaliacao')">{{ m.status }}</span>
                <span [class]="'etiqueta ' + (m.origem === 'interno' ? 'etiqueta--coe' : 'etiqueta--externa')">{{ m.origem === 'interno' ? 'Interno' : 'Oficial do fornecedor' }}</span>
                <span class="etiqueta etiqueta--categoria">{{ m.categoria }}</span>
              </div>
              <h2>{{ m.nome }}</h2>
              <p>{{ m.descricao }}</p>
              <dl>
                <div><dt>Fornecedor</dt><dd>{{ m.fornecedor }}</dd></div>
                <div><dt>Para que usar</dt><dd>{{ m.uso }}</dd></div>
                <div><dt>Acesso</dt><dd>{{ m.acesso }}</dd></div>
              </dl>
              @if (m.documentacao) {
                <a [href]="m.documentacao">Documentação oficial<span class="sr-only"> do MCP {{ m.nome }}</span></a>
              }
            </li>
          } @empty {
            <li class="vazio">Nenhum MCP corresponde à busca. Tente outro termo ou escolha "Todas" em Situação.</li>
          }
        </ul>
      }

      <section class="pedido cartao" aria-labelledby="t-pedido-mcp">
        <h2 id="t-pedido-mcp">Precisa de um MCP que ainda não está aqui?</h2>
        <p>Peça a inclusão no catálogo. O COE avalia segurança, permissões e custo antes de liberar para todas as squads.</p>
        <a class="botao" routerLink="/sobre/fale-com-o-coe" [queryParams]="{ tipo: 'mcp' }">Pedir inclusão de MCP</a>
      </section>
    </div>
  `,
})
export class McpsComponent {
  private catalogos = inject(CatalogosService);
  readonly todos = signal<Mcp[]>([]);
  readonly erro = signal(false);
  readonly busca = signal('');
  readonly status = signal('');
  readonly resultados = computed(() =>
    filtrarPorTexto(this.todos(), this.busca(), (m) => [m.nome, m.descricao, m.categoria, m.uso, m.fornecedor])
      .filter((m) => !this.status() || m.status === this.status()));

  constructor() {
    const pagina = inject(PaginaService);
    this.catalogos.carregarMcps()
      .then((m) => this.todos.set(m))
      .catch(() => this.erro.set(true))
      .finally(() => pagina.pronta('Catálogo de MCPs'));
  }
}
