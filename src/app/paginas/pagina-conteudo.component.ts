import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConteudoService, Documento, ROTULO_AREA, formatarData } from '../servicos/conteudo.service';
import { ConfigService } from '../servicos/config.service';
import { PaginaService } from '../servicos/pagina.service';
import { MENUS } from '../navegacao';
import { TrilhaComponent, PassoTrilha } from './trilha.component';
import { IconeComponent } from '../layout/icone.component';

/** Página genérica: renderiza o Markdown versionado no Git que corresponde à rota atual. */
@Component({
  selector: 'app-pagina-conteudo',
  standalone: true,
  imports: [RouterLink, TrilhaComponent, IconeComponent],
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
            @if (d.tipo === 'especificacao') {
              <dl class="metadados">
                <div><dt>Versão</dt><dd>{{ d.versao }}</dd></div>
                <div><dt>Publicada em</dt><dd>{{ data(d.data) }}</dd></div>
                <div><dt>Status</dt><dd>{{ d.status }}</dd></div>
                @if (d.responsavel) { <div><dt>Responsável</dt><dd>{{ d.responsavel }}</dd></div> }
              </dl>
            }
          </header>
          <div class="markdown" [innerHTML]="html()"></div>
          @if (repo && (d.tipo === 'especificacao' || ehPublicar())) {
            <div class="acoes">
              @if (d.tipo === 'especificacao') {
                <a class="botao botao--secundario" [href]="repo.url + '/blob/' + repo.ramo + '/public/conteudo/' + d.caminho">
                  <app-icone nome="externo" /> Ver no repositório
                </a>
                <a class="botao" [href]="repo.url + '/edit/' + repo.ramo + '/public/conteudo/' + d.caminho">
                  Propor alteração (pull request)
                </a>
              } @else {
                <a class="botao" [href]="linkNova()">
                  <app-icone nome="documento" /> Criar especificação no repositório
                </a>
              }
            </div>
          }
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
    .metadados { display: flex; flex-wrap: wrap; gap: var(--ids-space-3) var(--ids-space-6); margin: var(--ids-space-4) 0 0; padding: var(--ids-space-4); background: var(--ids-color-surface-default); border: var(--ids-border-width) solid var(--ids-color-border-default); border-radius: var(--ids-radius-md); }
    .metadados dt { font-size: var(--ids-font-size-sm); color: var(--ids-color-text-secondary); }
    .metadados dd { margin: 0; font-weight: var(--ids-font-weight-bold); }
    .acoes { display: flex; flex-wrap: wrap; gap: var(--ids-space-3); margin-top: var(--ids-space-6); }
  `],
})
export class PaginaConteudoComponent {
  private rotaAtiva = inject(ActivatedRoute);
  private conteudo = inject(ConteudoService);
  private pagina = inject(PaginaService);
  readonly repo = inject(ConfigService).valor.repositorio.url ? inject(ConfigService).valor.repositorio : null;
  readonly estado = signal<'carregando' | 'ok' | 'nao-encontrado'>('carregando');
  readonly doc = signal<Documento | null>(null);
  // Conteúdo confiável: vem só dos Markdown do próprio repositório, revisados em pull request.
  private sanitizer = inject(DomSanitizer);
  readonly html = signal<SafeHtml>('');
  readonly trilha = signal<PassoTrilha[]>([]);
  private modelo = '';

  constructor() {
    // route.url emite na entrada e quando o mesmo componente é reaproveitado para outra subpágina
    this.rotaAtiva.url.pipe(takeUntilDestroyed()).subscribe((segs) => this.carregar('/' + segs.map((s) => s.path).join('/')));
  }

  rotuloArea(a: Documento['area']) { return ROTULO_AREA[a]; }
  data(iso?: string) { return formatarData(iso); }
  ehPublicar() { return this.doc()?.rota === '/especificacoes/publicar'; }

  linkNova(): string {
    const r = this.repo!;
    return `${r.url}/new/${r.ramo}/${r.pastaEspecificacoes}?filename=nova-especificacao.md&value=${encodeURIComponent(this.modelo)}`;
  }

  private async carregar(rota: string) {
    this.estado.set('carregando');
    try {
      const d = await this.conteudo.documentoPorRota(rota);
      if (!d) { this.estado.set('nao-encontrado'); this.pagina.pronta('Página não encontrada'); return; }
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(await this.conteudo.html(d)));
      if (rota === '/especificacoes/publicar') {
        this.modelo = await fetch('conteudo/modelos/especificacao.md').then((r) => (r.ok ? r.text() : ''));
      }
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
    if (menu) passos.push({ rotulo: menu.rotulo, rota: menu.id === 'especificacoes' ? '/especificacoes' : `/${menu.id}` });
    passos.push({ rotulo: d.titulo });
    return passos;
  }
}
