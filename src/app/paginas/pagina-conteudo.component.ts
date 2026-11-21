import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConteudoService, Documento, ROTULO_AREA } from '../servicos/conteudo.service';
import { PaginaService } from '../servicos/pagina.service';
import { MENUS } from '../navegacao';
import { TrilhaComponent, PassoTrilha } from './trilha.component';

/** Página genérica: renderiza o Markdown versionado no Git que corresponde à rota atual. */
@Component({
  selector: 'app-pagina-conteudo',
  standalone: true,
  imports: [RouterLink, TrilhaComponent],
  template: `
    <div class="conteiner">
      @if (estado() === 'carregando') {
        <p role="status">Carregando conteúdo…</p>
      } @else if (estado() === 'nao-encontrado') {
        <app-trilha [passos]="[{ rotulo: 'Página não encontrada' }]" />
        <h1>Página não encontrada</h1>
        <p>O endereço não corresponde a nenhum conteúdo publicado. Use o menu ou volte ao <a routerLink="/">início</a>.</p>
      } @else {
      @if (doc(); as d) {
        <app-trilha [passos]="trilha()" />
        <article class="artigo">
          <header class="topo">
            <span class="tag" [class]="'tag tag--' + d.area">{{ rotuloArea(d.area) }}</span>
            <h1>{{ d.titulo }}</h1>
            <p class="resumo">{{ d.resumo }}</p>
          </header>
          <div class="markdown" [innerHTML]="html()"></div>
        </article>
      }
      }
    </div>
  `,
  styles: [`
    .artigo { max-width: 52rem; }
    .topo { margin-bottom: var(--ids-space-5); }
    .topo h1 { margin-top: var(--ids-space-3); }
    .resumo { font-size: var(--ids-font-size-lg); color: var(--ids-color-text-secondary); }
  `],
})
export class PaginaConteudoComponent {
  private rotaAtiva = inject(ActivatedRoute);
  private conteudo = inject(ConteudoService);
  private pagina = inject(PaginaService);
  readonly estado = signal<'carregando' | 'ok' | 'nao-encontrado'>('carregando');
  readonly doc = signal<Documento | null>(null);
  // Conteúdo confiável: vem só dos Markdown do próprio repositório, revisados em pull request.
  private sanitizer = inject(DomSanitizer);
  readonly html = signal<SafeHtml>('');
  readonly trilha = signal<PassoTrilha[]>([]);

  constructor() {
    // route.url emite na entrada e quando o mesmo componente é reaproveitado para outra subpágina
    this.rotaAtiva.url.pipe(takeUntilDestroyed()).subscribe((segs) => this.carregar('/' + segs.map((s) => s.path).join('/')));
  }

  rotuloArea(a: Documento['area']) { return ROTULO_AREA[a]; }

  private async carregar(rota: string) {
    this.estado.set('carregando');
    try {
      const d = await this.conteudo.documentoPorRota(rota);
      if (!d) { this.estado.set('nao-encontrado'); this.pagina.pronta('Página não encontrada'); return; }
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(await this.conteudo.html(d)));
      this.doc.set(d);
      this.trilha.set(this.montarTrilha(d));
      this.estado.set('ok');
      this.pagina.pronta(d.titulo);
    } catch {
      this.estado.set('nao-encontrado');
      this.pagina.pronta('Página não encontrada');
    }
  }

  private montarTrilha(d: Documento): PassoTrilha[] {
    const idArea = d.rota.split('/')[1];
    const menu = MENUS.find((m) => m.id === idArea);
    const passos: PassoTrilha[] = [];
    if (menu) passos.push({ rotulo: menu.rotulo, rota: `/${menu.id}` });
    passos.push({ rotulo: d.titulo });
    return passos;
  }
}
