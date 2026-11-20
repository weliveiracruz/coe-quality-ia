import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { MENUS } from '../navegacao';
import { AuthService } from '../servicos/auth.service';
import { IconeComponent } from './icone.component';

/**
 * Cabeçalho global: logo do Itaú (leva ao início), nome do site, botão Início, menus expansíveis e usuário.
 * Menus no padrão "disclosure navigation" (botão com aria-expanded + lista de links), não o papel ARIA de menu:
 * Tab percorre os links, Enter/Espaço abre e fecha, Esc fecha e devolve o foco ao botão.
 */
@Component({
  selector: 'app-cabecalho',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconeComponent],
  templateUrl: './cabecalho.component.html',
  styleUrl: './cabecalho.component.css',
})
export class CabecalhoComponent {
  readonly menus = MENUS;
  readonly aberto = signal<string | null>(null);
  readonly menuMovelAberto = signal(false);
  readonly logoFalhou = signal(false);
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  urlAtual = '';

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.urlAtual = (e as NavigationEnd).urlAfterRedirects;
      this.aberto.set(null);
      this.menuMovelAberto.set(false);
    });
  }

  secaoAtual(id: string): boolean {
    return this.urlAtual === `/${id}` || this.urlAtual.startsWith(`/${id}/`);
  }

  alternar(id: string): void {
    this.aberto.set(this.aberto() === id ? null : id);
  }

  alternarMovel(): void {
    this.menuMovelAberto.update((v) => !v);
    if (!this.menuMovelAberto()) this.aberto.set(null);
  }

  @HostListener('document:keydown.escape')
  aoEsc(): void {
    const id = this.aberto();
    if (id) {
      this.aberto.set(null);
      this.host.nativeElement.querySelector<HTMLButtonElement>(`#botao-${id}`)?.focus();
    } else if (this.menuMovelAberto()) {
      this.menuMovelAberto.set(false);
      this.host.nativeElement.querySelector<HTMLButtonElement>('#botao-menu-movel')?.focus();
    }
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(ev: MouseEvent): void {
    const nav = this.host.nativeElement.querySelector('nav');
    if (this.aberto() && nav && !nav.contains(ev.target as Node)) this.aberto.set(null);
  }

  aoSairDoMenu(ev: FocusEvent, id: string): void {
    const grupo = (ev.currentTarget as HTMLElement);
    const destino = ev.relatedTarget as Node | null;
    if (this.aberto() === id && destino && !grupo.contains(destino)) this.aberto.set(null);
  }
}
