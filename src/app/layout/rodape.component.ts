import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../servicos/config.service';
import { AuthService } from '../servicos/auth.service';

/** Rodapé com a ajuda sempre no mesmo lugar (WCAG 3.2.6 Ajuda consistente). */
@Component({
  selector: 'app-rodape',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="rodape">
      <div class="conteiner grade">
        <div>
          <p class="nome">COE Quality IA</p>
          <p class="sobre">Engenharia de qualidade, inteligência artificial e confiabilidade como capability compartilhada da RT.</p>
        </div>
        <nav aria-label="Ajuda e informações">
          <ul>
            <li><a routerLink="/ajuda">Ajuda</a></li>
            @if (config.valor.contatoCoe.url) {
              <li><a [href]="config.valor.contatoCoe.url">Fale com o COE ({{ config.valor.contatoCoe.rotulo }})</a></li>
            } @else {
              <li><a routerLink="/sobre/missoes">Fale com o COE</a></li>
            }
            <li><a routerLink="/acessibilidade">Declaração de acessibilidade</a></li>
            <li><a routerLink="/especificacoes/publicar">Como publicar uma especificação</a></li>
          </ul>
        </nav>
      </div>
      @if (auth.modoDemonstracao()) {
        <p class="conteiner demo">Modo demonstração: login corporativo desativado (configure o Azure em config.json).</p>
      }
    </footer>
  `,
  styles: [`
    .rodape { margin-top: var(--ids-space-7); background: var(--ids-color-brand-secondary); color: var(--ids-color-text-inverse); padding: var(--ids-space-6) 0 var(--ids-space-5); border-top: var(--ids-brand-bar-height) solid var(--ids-color-brand-primary); }
    .grade { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: var(--ids-space-5); }
    .nome { font-family: var(--ids-font-family-display); font-weight: var(--ids-font-weight-bold); font-size: var(--ids-font-size-lg); margin: 0 0 var(--ids-space-2); }
    .sobre { margin: 0; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { margin: 0; }
    a { color: var(--ids-color-text-inverse); display: inline-flex; align-items: center; min-height: var(--ids-size-target); }
    a:focus-visible { outline-color: var(--ids-color-text-inverse); }
    .demo { font-size: var(--ids-font-size-sm); margin-top: var(--ids-space-4); }
    @media (max-width: 700px) { .grade { grid-template-columns: 1fr; } }
  `],
})
export class RodapeComponent {
  readonly config = inject(ConfigService);
  readonly auth = inject(AuthService);
}
