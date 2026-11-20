import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CabecalhoComponent } from './layout/cabecalho.component';
import { RodapeComponent } from './layout/rodape.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CabecalhoComponent, RodapeComponent],
  template: `
    <a class="pular" href="#conteudo" (click)="irParaConteudo($event)">Pular para o conteúdo</a>
    <app-cabecalho />
    <main id="conteudo" tabindex="-1">
      <router-outlet />
    </main>
    <app-rodape />
  `,
  styles: [`
    .pular { position: absolute; left: var(--ids-space-2); top: -100px; z-index: 100; background: var(--ids-color-brand-secondary); color: var(--ids-color-text-inverse); padding: var(--ids-space-3) var(--ids-space-4); border-radius: var(--ids-radius-sm); font-weight: var(--ids-font-weight-bold); }
    .pular:focus { top: var(--ids-space-2); }
    main { display: block; min-height: 60vh; padding-top: var(--ids-space-6); }
    main:focus { outline: none; }
  `],
})
export class AppComponent {
  irParaConteudo(ev: Event): void {
    ev.preventDefault();
    this.focarTitulo();
  }

  focarTitulo(): void {
    const h1 = document.querySelector<HTMLElement>('main h1');
    const alvo = h1 ?? document.getElementById('conteudo');
    if (!alvo) return;
    if (h1 && !h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
    alvo.focus();
  }
}
