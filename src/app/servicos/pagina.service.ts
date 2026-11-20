import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Cada página chama pronta(titulo) quando o conteúdo carregou:
 * define o <title> (WCAG 2.4.2) e, a partir da segunda página visitada, move o foco para o h1,
 * para o leitor de tela anunciar a nova página na navegação SPA.
 */
@Injectable({ providedIn: 'root' })
export class PaginaService {
  private title = inject(Title);
  private primeira = true;

  pronta(titulo: string): void {
    this.title.setTitle(titulo === 'Início' ? 'COE Quality IA' : `${titulo} — COE Quality IA`);
    if (this.primeira) { this.primeira = false; return; }
    setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('main h1');
      if (!h1) return;
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: false });
    });
  }
}
