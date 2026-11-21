import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Menu, menuPorId } from '../navegacao';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';

/** Visão geral de uma área do menu: resumo e subpáginas. */
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
  `],
})
export class AreaComponent {
  private rota = inject(ActivatedRoute);
  private pagina = inject(PaginaService);
  readonly menu = signal<Menu | undefined>(undefined);

  constructor() {
    this.rota.paramMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const m = menuPorId(p.get('area') ?? '');
      this.menu.set(m);
      this.pagina.pronta(m ? m.rotulo : 'Página não encontrada');
    });
  }
}
