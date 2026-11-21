import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfigService } from '../servicos/config.service';
import { PaginaService } from '../servicos/pagina.service';
import {
  CampoPedido, ErroPedido, Pedido, TIPOS_PEDIDO, ehTipoPedido, linkDaIssue, pedidoVazio, textoDoPedido, tituloDaIssue, validarPedido,
} from '../servicos/pedido-coe';
import { TrilhaComponent } from './trilha.component';
import { IconeComponent } from '../layout/icone.component';

/**
 * Fale com o COE: pedir missão, inclusão de MCP ou de Skill no catálogo, ou tirar dúvida.
 * Formulário acessível (WCAG 2.2 AA): rótulos visíveis, ajuda associada, resumo de erros com foco e links para os campos,
 * aria-invalid nos campos com erro, sem limite de tempo e sem pedir de novo o que já foi informado (3.3.7).
 */
@Component({
  selector: 'app-fale-com-o-coe',
  standalone: true,
  imports: [RouterLink, TrilhaComponent, IconeComponent],
  template: `
    <div class="conteiner">
      <app-trilha [passos]="[{ rotulo: 'Sobre o COE', rota: '/sobre' }, { rotulo: 'Fale com o COE' }]" />
      <h1>Fale com o COE</h1>
      <p class="resumo">Peça uma missão do COE com a sua squad, a inclusão de um MCP ou de uma Skill no catálogo para todos os times,
        ou mande sua dúvida. O pedido é registrado no repositório do COE, onde o time acompanha e responde.</p>

      @if (!pronto()) {
        @if (erros().length) {
          <div class="resumo-erros" role="alert" tabindex="-1" id="resumo-erros">
            <h2>{{ erros().length === 1 ? 'Corrija 1 campo' : 'Corrija ' + erros().length + ' campos' }} para continuar</h2>
            <ul>
              @for (e of erros(); track e.campo) {
                <li><a [href]="'#' + idDoCampo(e.campo)" (click)="focar($event, e.campo)">{{ e.mensagem }}</a></li>
              }
            </ul>
          </div>
        }

        <form novalidate (submit)="enviar($event)" class="formulario">
          <p class="obrigatorios">Todos os campos são obrigatórios, exceto os marcados como opcionais.</p>

          <fieldset [attr.aria-invalid]="erroDe('tipo') ? 'true' : null" [attr.aria-describedby]="erroDe('tipo') ? 'erro-tipo' : null" id="campo-tipo" tabindex="-1">
            <legend>Tipo de pedido</legend>
            @if (erroDe('tipo'); as e) { <p class="erro" id="erro-tipo"><span class="sr-only">Erro: </span>{{ e }}</p> }
            @for (t of tipos; track t.id) {
              <div class="opcao">
                <input type="radio" name="tipo" [id]="'tipo-' + t.id" [value]="t.id" [checked]="pedido().tipo === t.id"
                       (change)="alterar('tipo', t.id)" [attr.aria-describedby]="'ajuda-tipo-' + t.id">
                <label [for]="'tipo-' + t.id">{{ t.rotulo }}</label>
                <p class="ajuda" [id]="'ajuda-tipo-' + t.id">{{ t.ajuda }}</p>
              </div>
            }
          </fieldset>

          <div class="campo">
            <label for="campo-nome">Seu nome</label>
            @if (erroDe('nome'); as e) { <p class="erro" id="erro-nome"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <input id="campo-nome" autocomplete="name" [value]="pedido().nome" (input)="alterar('nome', valor($event))"
                   [attr.aria-invalid]="erroDe('nome') ? 'true' : null" [attr.aria-describedby]="erroDe('nome') ? 'erro-nome' : null">
          </div>

          <div class="campo">
            <label for="campo-squad">Squad ou time</label>
            @if (erroDe('squad'); as e) { <p class="erro" id="erro-squad"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <input id="campo-squad" autocomplete="organization" [value]="pedido().squad" (input)="alterar('squad', valor($event))"
                   [attr.aria-invalid]="erroDe('squad') ? 'true' : null" [attr.aria-describedby]="erroDe('squad') ? 'erro-squad' : null">
          </div>

          <div class="campo">
            <label for="campo-titulo">Título do pedido</label>
            <p class="ajuda" id="ajuda-titulo">Uma frase curta, por exemplo "Missão de testes de contrato no BFF".</p>
            @if (erroDe('titulo'); as e) { <p class="erro" id="erro-titulo"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <input id="campo-titulo" maxlength="160" [value]="pedido().titulo" (input)="alterar('titulo', valor($event))"
                   [attr.aria-invalid]="erroDe('titulo') ? 'true' : null" [attr.aria-describedby]="descricoes('titulo', 'ajuda-titulo')">
          </div>

          <div class="campo">
            <label for="campo-descricao">Descrição</label>
            <p class="ajuda" id="ajuda-descricao">{{ ajudaDescricao() }}</p>
            @if (erroDe('descricao'); as e) { <p class="erro" id="erro-descricao"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <textarea id="campo-descricao" rows="6" [value]="pedido().descricao" (input)="alterar('descricao', valor($event))"
                      [attr.aria-invalid]="erroDe('descricao') ? 'true' : null" [attr.aria-describedby]="descricoes('descricao', 'ajuda-descricao')"></textarea>
          </div>

          <div class="campo">
            <label for="campo-link">Link do MCP ou da Skill{{ linkObrigatorio() ? '' : ' (opcional)' }}</label>
            <p class="ajuda" id="ajuda-link">Repositório, documentação ou página de referência. Obrigatório para pedidos de MCP e de Skill.</p>
            @if (erroDe('link'); as e) { <p class="erro" id="erro-link"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <input id="campo-link" type="url" inputmode="url" autocomplete="url" [value]="pedido().link" (input)="alterar('link', valor($event))"
                   [attr.aria-invalid]="erroDe('link') ? 'true' : null" [attr.aria-describedby]="descricoes('link', 'ajuda-link')">
          </div>

          <div class="campo campo--curto">
            <label for="campo-prazo">Prazo desejado (opcional)</label>
            @if (erroDe('prazo'); as e) { <p class="erro" id="erro-prazo"><span class="sr-only">Erro: </span>{{ e }}</p> }
            <input id="campo-prazo" type="date" [value]="pedido().prazo" (input)="alterar('prazo', valor($event))"
                   [attr.aria-invalid]="erroDe('prazo') ? 'true' : null" [attr.aria-describedby]="erroDe('prazo') ? 'erro-prazo' : null">
          </div>

          <button type="submit" class="botao">Revisar pedido</button>
        </form>
      } @else {
        <section class="cartao pronto" aria-labelledby="t-pronto">
          <h2 id="t-pronto" tabindex="-1">Pedido pronto para envio</h2>
          <p>Confira o resumo e envie. O GitHub abre o formulário do pedido já preenchido no repositório do COE: é só confirmar.</p>
          <dl class="resumo-pedido">
            <div><dt>Título</dt><dd>{{ tituloIssue() }}</dd></div>
            <div><dt>Tipo</dt><dd>{{ rotuloTipo() }}</dd></div>
            <div><dt>Solicitante</dt><dd>{{ pedido().nome }} ({{ pedido().squad }})</dd></div>
            <div><dt>Descrição</dt><dd class="descricao">{{ pedido().descricao }}</dd></div>
          </dl>
          <div class="acoes">
            @if (linkIssue(); as l) {
              <a class="botao" [href]="l"><app-icone nome="externo" /> Enviar pelo GitHub</a>
            }
            <button type="button" class="botao botao--secundario" (click)="copiar()">Copiar o texto do pedido</button>
            @if (config.valor.contatoCoe.url) {
              <a class="botao botao--secundario" [href]="config.valor.contatoCoe.url">Enviar pelo {{ config.valor.contatoCoe.rotulo }}</a>
            }
            <button type="button" class="botao botao--secundario" (click)="editar()">Editar o pedido</button>
          </div>
          <p role="status" class="status">{{ statusCopia() }}</p>
        </section>
      }

      <section class="bloco" aria-labelledby="t-antes">
        <h2 id="t-antes">Antes de pedir</h2>
        <ul>
          <li>Veja o que já está disponível em <a routerLink="/inteligencia-artificial/skills">Skills para as squads</a> e no <a routerLink="/inteligencia-artificial/mcps">Catálogo de MCPs</a>.</li>
          <li>Entenda quando o COE entra junto com a squad em <a routerLink="/sobre/missoes">Missões com squads</a>.</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .resumo { font-size: var(--ids-font-size-lg); color: var(--ids-color-text-secondary); max-width: 60rem; }
    .formulario { max-width: 44rem; display: flex; flex-direction: column; gap: var(--ids-space-5); margin-top: var(--ids-space-5); }
    .obrigatorios { margin: 0; color: var(--ids-color-text-secondary); }
    fieldset { border: var(--ids-border-width) solid var(--ids-color-border-default); border-radius: var(--ids-radius-md); padding: var(--ids-space-4); margin: 0; background: var(--ids-color-surface-default); }
    fieldset[aria-invalid="true"] { border-color: var(--ids-color-feedback-error); border-width: 2px; }
    legend, label { font-weight: var(--ids-font-weight-bold); }
    legend { padding: 0 var(--ids-space-2); }
    .opcao { display: grid; grid-template-columns: auto 1fr; column-gap: var(--ids-space-3); align-items: center; padding: var(--ids-space-2) 0; }
    .opcao input { width: 24px; height: 24px; margin: 0; accent-color: var(--ids-color-brand-secondary); }
    .opcao .ajuda { grid-column: 2; }
    .campo { display: flex; flex-direction: column; gap: var(--ids-space-1); }
    .campo--curto { max-width: 16rem; }
    .ajuda { margin: 0; color: var(--ids-color-text-secondary); font-size: var(--ids-font-size-sm); font-weight: var(--ids-font-weight-regular); }
    .erro { margin: 0; color: var(--ids-color-feedback-error); font-weight: var(--ids-font-weight-bold); }
    input:not([type="radio"]), textarea {
      font: inherit; min-height: var(--ids-size-target); padding: var(--ids-space-2) var(--ids-space-3); color: var(--ids-color-text-primary);
      border: var(--ids-border-width) solid var(--ids-color-border-strong); border-radius: var(--ids-radius-md); background: var(--ids-color-surface-default);
    }
    [aria-invalid="true"]:not(fieldset) { border: 2px solid var(--ids-color-feedback-error); }
    .botao { align-self: flex-start; }
    .resumo-erros { border: 2px solid var(--ids-color-feedback-error); background: var(--ids-color-feedback-error-subtle); border-radius: var(--ids-radius-md); padding: var(--ids-space-4) var(--ids-space-5); margin-top: var(--ids-space-5); max-width: 44rem; }
    .resumo-erros h2 { margin-top: 0; font-size: var(--ids-font-size-lg); color: var(--ids-color-feedback-error); }
    .resumo-erros a { display: inline-flex; min-height: 24px; align-items: center; }
    .pronto { margin-top: var(--ids-space-5); max-width: 52rem; }
    .pronto h2 { margin-top: 0; }
    .resumo-pedido { display: grid; gap: var(--ids-space-3); }
    .resumo-pedido dt { font-weight: var(--ids-font-weight-bold); font-size: var(--ids-font-size-sm); color: var(--ids-color-text-secondary); }
    .resumo-pedido dd { margin: 0; }
    .descricao { white-space: pre-wrap; }
    .acoes { display: flex; flex-wrap: wrap; gap: var(--ids-space-3); margin-top: var(--ids-space-5); }
    .status { min-height: 1.5rem; color: var(--ids-color-feedback-success); font-weight: var(--ids-font-weight-bold); }
    .bloco { margin-top: var(--ids-space-7); }
    .bloco li { margin-bottom: var(--ids-space-2); }
  `],
})
export class FaleComOCoeComponent {
  readonly config = inject(ConfigService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly tipos = TIPOS_PEDIDO;
  readonly pedido = signal<Pedido>(pedidoVazio());
  readonly erros = signal<ErroPedido[]>([]);
  readonly pronto = signal(false);
  readonly statusCopia = signal('');
  private tentou = false;

  readonly linkObrigatorio = computed(() => ['mcp', 'skill'].includes(this.pedido().tipo));
  readonly tituloIssue = computed(() => tituloDaIssue(this.pedido()));
  readonly rotuloTipo = computed(() => TIPOS_PEDIDO.find((t) => t.id === this.pedido().tipo)?.rotulo ?? '');
  readonly linkIssue = computed(() => (this.config.valor.repositorio.url ? linkDaIssue(this.config.valor.repositorio.url, this.pedido()) : ''));
  readonly ajudaDescricao = computed(() => ({
    missao: 'Qual problema a squad quer resolver, onde ele aparece (produto, canal, indicador) e o que já foi tentado.',
    mcp: 'O que o MCP faz, quais squads usariam, que dados ele acessa e quem é o fornecedor.',
    skill: 'O que a skill faz, para quem serve, exemplos de uso e quem mantém.',
    duvida: 'Escreva sua dúvida ou sugestão.',
    '': 'Conte o que você precisa. Escolha o tipo de pedido para ver o que incluir.',
  })[this.pedido().tipo]);

  constructor() {
    const tipo = inject(ActivatedRoute).snapshot.queryParamMap.get('tipo');
    if (ehTipoPedido(tipo)) this.pedido.set(pedidoVazio(tipo));
    inject(PaginaService).pronta('Fale com o COE');
  }

  valor(ev: Event): string { return (ev.target as HTMLInputElement).value; }

  alterar(campo: CampoPedido, valor: string): void {
    this.pedido.update((p) => ({ ...p, [campo]: valor }));
    // Depois da primeira tentativa, o erro some assim que o campo é corrigido (sem novos erros enquanto a pessoa digita).
    if (this.tentou) {
      const atuais = new Set(validarPedido(this.pedido()).map((e) => e.campo));
      this.erros.update((es) => es.filter((e) => atuais.has(e.campo)));
    }
  }

  erroDe(campo: CampoPedido): string | undefined {
    return this.erros().find((e) => e.campo === campo)?.mensagem;
  }

  descricoes(campo: CampoPedido, ajuda: string): string {
    return this.erroDe(campo) ? `erro-${campo} ${ajuda}` : ajuda;
  }

  idDoCampo(campo: CampoPedido): string {
    return campo === 'tipo' ? `tipo-${this.tipos[0].id}` : `campo-${campo}`;
  }

  focar(ev: Event, campo: CampoPedido): void {
    ev.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>(`#${this.idDoCampo(campo)}`)?.focus();
  }

  enviar(ev: Event): void {
    ev.preventDefault();
    this.tentou = true;
    const erros = validarPedido(this.pedido());
    this.erros.set(erros);
    if (erros.length) {
      setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('#resumo-erros')?.focus());
      return;
    }
    this.pronto.set(true);
    this.statusCopia.set('');
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('#t-pronto')?.focus());
  }

  editar(): void {
    this.pronto.set(false);
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('#campo-titulo')?.focus());
  }

  async copiar(): Promise<void> {
    const texto = `${this.tituloIssue()}\n\n${textoDoPedido(this.pedido())}`;
    try {
      await navigator.clipboard.writeText(texto);
      this.statusCopia.set('Texto do pedido copiado.');
    } catch {
      this.statusCopia.set('Não foi possível copiar automaticamente. Selecione o resumo acima e copie.');
    }
  }
}
