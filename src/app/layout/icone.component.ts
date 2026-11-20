import { Component, Input } from '@angular/core';

/**
 * Ícones PROVISÓRIOS (traços genéricos). Serão trocados pela biblioteca oficial de ícones do IDS v3.
 * Sempre decorativos (aria-hidden): o rótulo vem do texto do botão ou link.
 */
@Component({
  selector: 'app-icone',
  standalone: true,
  template: `
    <svg [attr.width]="tamanho" [attr.height]="tamanho" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @switch (nome) {
        @case ('inicio') { <path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/> }
        @case ('seta-baixo') { <path d="M6 9l6 6 6-6"/> }
        @case ('menu') { <path d="M4 6h16M4 12h16M4 18h16"/> }
        @case ('fechar') { <path d="M6 6l12 12M18 6L6 18"/> }
        @case ('externo') { <path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/> }
        @case ('sair') { <path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/> }
        @case ('busca') { <circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/> }
        @case ('subiu') { <path d="M6 15l6-6 6 6"/> }
        @case ('desceu') { <path d="M6 9l6 6 6-6"/> }
        @case ('documento') { <path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/> }
      }
    </svg>
  `,
  styles: [':host { display: inline-flex; flex: none; }'],
})
export class IconeComponent {
  @Input({ required: true }) nome!: string;
  @Input() tamanho = 20;
}
