import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService, Documento, ROTULO_AREA, formatarData } from '../servicos/conteudo.service';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';
import { IconeComponent } from '../layout/icone.component';

/** Lista e busca das especificações publicadas (arquivos Markdown no Git). */
@Component({
  selector: 'app-especificacoes',
  standalone: true,
  imports: [RouterLink, TrilhaComponent, IconeComponent],
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Especificações' }]" />
      <h1>Especificações</h1>
      <p class="resumo">Especificações publicadas pelo COE. Novas especificações e alterações entram por pull request no Git.
        <a routerLink="/especificacoes/publicar">Veja como publicar</a>.</p>

      <form class="filtros" role="search" aria-label="Buscar especificações" (submit)="$event.preventDefault()">
        <div class="campo">
          <label for="busca">Buscar por título ou texto</label>
          <div class="entrada">
            <app-icone nome="busca" />
            <input id="busca" type="search" [value]="busca()" (input)="busca.set($any($event.target).value)" autocomplete="off">
          </div>
        </div>
        <div class="campo">
          <label for="area">Área</label>
          <select id="area" (change)="area.set($any($event.target).value)">
            <option value="">Todas</option>
            <option value="ia">Inteligência Artificial</option>
            <option value="qualidade">Qualidade</option>
            <option value="indicadores">Indicadores</option>
            <option value="geral">COE</option>
          </select>
        </div>
      </form>

      <p role="status" class="contagem">{{ resultados().length }} {{ resultados().length === 1 ? 'especificação encontrada' : 'especificações encontradas' }}</p>

      <ul class="lista">
        @for (e of resultados(); track e.rota) {
          <li class="cartao">
            <span [class]="'tag tag--' + e.area">{{ rotulo(e.area) }}</span>
            <h2><a [routerLink]="e.rota">{{ e.titulo }}</a></h2>
            <p>{{ e.resumo }}</p>
            <p class="meta">Versão {{ e.versao }} · publicada em {{ data(e.data) }} · {{ e.status }}</p>
          </li>
        } @empty {
          <li class="vazio">Nenhuma especificação corresponde à busca. Tente outro termo ou escolha "Todas" em Área.</li>
        }
      </ul>
    </div>
  `,
  styles: [`
    .resumo { color: var(--ids-color-text-secondary); }
    .filtros { display: flex; flex-wrap: wrap; gap: var(--ids-space-4); margin: var(--ids-space-5) 0 var(--ids-space-3); }
    .campo { display: flex; flex-direction: column; gap: var(--ids-space-1); flex: 1 1 16rem; }
    label { font-weight: var(--ids-font-weight-bold); }
    .entrada { display: flex; align-items: center; gap: var(--ids-space-2); border: var(--ids-border-width) solid var(--ids-color-border-strong); border-radius: var(--ids-radius-md); background: var(--ids-color-surface-default); padding: 0 var(--ids-space-3); }
    .entrada:focus-within { outline: var(--ids-focus-width) solid var(--ids-focus-color); outline-offset: var(--ids-focus-offset); }
    input, select { font: inherit; min-height: var(--ids-size-target); border: 0; background: transparent; width: 100%; color: var(--ids-color-text-primary); }
    input:focus { outline: none; }
    select { border: var(--ids-border-width) solid var(--ids-color-border-strong); border-radius: var(--ids-radius-md); padding: 0 var(--ids-space-3); background: var(--ids-color-surface-default); }
    .contagem { color: var(--ids-color-text-secondary); }
    .lista { list-style: none; padding: 0; display: grid; gap: var(--ids-space-4); }
    .lista h2 { font-size: var(--ids-font-size-lg); margin: var(--ids-space-3) 0 var(--ids-space-2); }
    .lista a { display: inline-block; min-height: 24px; }
    .meta { color: var(--ids-color-text-secondary); font-size: var(--ids-font-size-sm); margin-bottom: 0; }
    .vazio { padding: var(--ids-space-5); background: var(--ids-color-surface-default); border-radius: var(--ids-radius-md); }
  `],
})
export class EspecificacoesComponent {
  private conteudo = inject(ConteudoService);
  readonly todas = signal<Documento[]>([]);
  readonly busca = signal('');
  readonly area = signal('');
  readonly resultados = computed(() => {
    const termo = normalizar(this.busca());
    return this.todas().filter((d) =>
      (!this.area() || d.area === this.area()) &&
      (!termo || normalizar(`${d.titulo} ${d.resumo} ${d.texto ?? ''}`).includes(termo)));
  });
  rotulo = (a: Documento['area']) => ROTULO_AREA[a];
  data = formatarData;

  constructor() {
    const pagina = inject(PaginaService);
    this.conteudo.carregarIndice().then((i) => {
      this.todas.set(i.documentos.filter((d) => d.tipo === 'especificacao').sort((a, b) => (b.data ?? '').localeCompare(a.data ?? '')));
      pagina.pronta('Especificações');
    });
  }
}

function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
