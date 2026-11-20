import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Menu, menuPorId } from '../navegacao';
import { ConteudoService, Documento, formatarData } from '../servicos/conteudo.service';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';

/** Visão geral de uma área do menu: resumo, subpáginas e especificações da área. */
@Component({
  selector: 'app-area',
  standalone: true,
  imports: [RouterLink, TrilhaComponent],
  template: `
    <div class="conteiner">
      @if (menu(); as m) {
        <app-trilha [passos]="[{ rotulo: m.rotulo }]" />
        <h1>{{ m.rotulo }}</h1>
        <p class="resumo">{{ m.resumo }}</p>
        <h2 id="t-paginas">Nesta área</h2>
        <ul class="grade" aria-labelledby="t-paginas">
          @for (item of m.itens; track item.rota) {
            <li class="cartao item">
              <h3><a [routerLink]="item.rota">{{ item.rotulo }}</a></h3>
              @if (item.descricao) { <p>{{ item.descricao }}</p> }
            </li>
          }
        </ul>
        @if (especificacoes().length) {
          <h2>Especificações desta área</h2>
          <ul class="lista">
            @for (e of especificacoes(); track e.rota) {
              <li><a [routerLink]="e.rota">{{ e.titulo }}</a> <span class="meta">versão {{ e.versao }}, {{ data(e.data) }}</span></li>
            }
          </ul>
        }
      } @else {
        <app-trilha [passos]="[{ rotulo: 'Página não encontrada' }]" />
        <h1>Página não encontrada</h1>
        <p>Esta área não existe. Volte ao <a routerLink="/">início</a>.</p>
      }
    </div>
  `,
  styles: [`
    .resumo { font-size: var(--ids-font-size-lg); color: var(--ids-color-text-secondary); }
    .grade { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: var(--ids-space-4); }
    .item h3 { margin: 0 0 var(--ids-space-2); font-size: var(--ids-font-size-lg); }
    .item p { margin: 0; color: var(--ids-color-text-secondary); }
    .item a { display: inline-block; min-height: 24px; }
    .lista li { margin-bottom: var(--ids-space-2); }
    .meta { color: var(--ids-color-text-secondary); font-size: var(--ids-font-size-sm); }
  `],
})
export class AreaComponent {
  private rota = inject(ActivatedRoute);
  private conteudo = inject(ConteudoService);
  private pagina = inject(PaginaService);
  readonly menu = signal<Menu | undefined>(undefined);
  readonly especificacoes = signal<Documento[]>([]);
  data = formatarData;

  constructor() {
    this.rota.paramMap.pipe(takeUntilDestroyed()).subscribe(async (p) => {
      const m = menuPorId(p.get('area') ?? '');
      this.menu.set(m);
      this.especificacoes.set([]);
      if (!m) { this.pagina.pronta('Página não encontrada'); return; }
      const indice = await this.conteudo.carregarIndice();
      this.especificacoes.set(indice.documentos.filter((d) => d.tipo === 'especificacao' && d.area === m.tag));
      this.pagina.pronta(m.rotulo);
    });
  }
}
