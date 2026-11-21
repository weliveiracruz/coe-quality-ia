import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService, Documento, ROTULO_AREA, formatarData } from '../servicos/conteudo.service';
import { AuthService } from '../servicos/auth.service';
import { PaginaService } from '../servicos/pagina.service';
import {
  IndicadoresTecnologia, IndicadoresTecnologiaService, ItemAtencao, formatarPercentual, indicadoresEmAtencao, nomeDoMes,
} from '../servicos/indicadores-tecnologia.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {
  private conteudo = inject(ConteudoService);
  readonly auth = inject(AuthService);
  readonly novidades = signal<Documento[]>([]);
  readonly tecnologia = signal<IndicadoresTecnologia | null>(null);
  readonly atencao = signal<ItemAtencao[]>([]);
  readonly erroTecnologia = signal(false);

  constructor() {
    const pagina = inject(PaginaService);
    this.conteudo.carregarIndice().then((i) => {
      this.novidades.set(
        i.documentos
          .filter((d) => d.tipo === 'novidade')
          .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''))
          .slice(0, 5),
      );
    });
    inject(IndicadoresTecnologiaService).carregar()
      .then((d) => { this.tecnologia.set(d); this.atencao.set(indicadoresEmAtencao(d)); })
      .catch(() => this.erroTecnologia.set(true));
    pagina.pronta('Início');
  }

  data = formatarData;
  mes = nomeDoMes;
  pct = formatarPercentual;
  rotuloArea = (a: Documento['area']) => ROTULO_AREA[a];
}
