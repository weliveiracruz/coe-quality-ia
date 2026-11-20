import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface PassoTrilha { rotulo: string; rota?: string; }

/** Trilha de navegação (breadcrumb): onde estou e caminho de volta ao início. */
@Component({
  selector: 'app-trilha',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav aria-label="Você está em" class="trilha">
      <ol>
        <li><a routerLink="/">Início</a></li>
        @for (p of passos; track p.rotulo; let ultimo = $last) {
          <li>
            @if (p.rota && !ultimo) { <a [routerLink]="p.rota">{{ p.rotulo }}</a> }
            @else { <span [attr.aria-current]="ultimo ? 'page' : null">{{ p.rotulo }}</span> }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .trilha ol { list-style: none; display: flex; flex-wrap: wrap; gap: var(--ids-space-1); margin: 0 0 var(--ids-space-4); padding: 0; font-size: var(--ids-font-size-sm); color: var(--ids-color-text-secondary); }
    .trilha li { display: inline-flex; align-items: center; }
    .trilha li + li::before { content: "›"; margin-right: var(--ids-space-1); color: var(--ids-color-text-secondary); }
    .trilha a { display: inline-flex; align-items: center; min-height: 24px; }
  `],
})
export class TrilhaComponent {
  @Input() passos: PassoTrilha[] = [];
}
