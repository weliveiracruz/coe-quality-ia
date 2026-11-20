import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaService } from '../servicos/pagina.service';
import { TrilhaComponent } from './trilha.component';

@Component({
  selector: 'app-nao-encontrada',
  standalone: true,
  imports: [RouterLink, TrilhaComponent],
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Página não encontrada' }]" />
      <h1>Página não encontrada</h1>
      <p>O endereço não corresponde a nenhuma página. Use o menu acima ou volte ao início.</p>
      <a routerLink="/" class="botao">Voltar ao início</a>
    </div>
  `,
})
export class NaoEncontradaComponent {
  constructor() { inject(PaginaService).pronta('Página não encontrada'); }
}
