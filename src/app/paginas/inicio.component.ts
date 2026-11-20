import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConteudoService, Documento, ROTULO_AREA, formatarData } from '../servicos/conteudo.service';
import { AuthService } from '../servicos/auth.service';
import { PaginaService } from '../servicos/pagina.service';
import { IconeComponent } from '../layout/icone.component';

interface Indicador { id: string; rotulo: string; valor: number; anterior: number; }
interface Semana { semana: string; acessos: number; }
interface UsoSquad { squad: string; area: string; acessos: number; aceleradores: string[]; nivel: string; }
interface DadosUso {
  exemplo: boolean; atualizado_em: string; periodo_dias: number;
  indicadores: Indicador[]; acessos_semana: Semana[]; squads: UsoSquad[];
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, IconeComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {
  private conteudo = inject(ConteudoService);
  readonly auth = inject(AuthService);
  readonly uso = signal<DadosUso | null>(null);
  readonly erroUso = signal(false);
  readonly novidades = signal<Documento[]>([]);
  readonly maxAcessos = computed(() => Math.max(1, ...(this.uso()?.acessos_semana.map((s) => s.acessos) ?? [1])));
  readonly resumoGrafico = computed(() => {
    const s = this.uso()?.acessos_semana ?? [];
    if (s.length < 2) return '';
    const pico = s.reduce((a, b) => (b.acessos > a.acessos ? b : a));
    return `Acessos por semana nas últimas ${s.length} semanas: de ${this.num(s[0].acessos)} na semana de ${this.dia(s[0].semana)} para ${this.num(s.at(-1)!.acessos)} na semana de ${this.dia(s.at(-1)!.semana)}. Pico de ${this.num(pico.acessos)} na semana de ${this.dia(pico.semana)}.`;
  });

  constructor() {
    const pagina = inject(PaginaService);
    fetch('dados/uso.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: DadosUso) => this.uso.set(d))
      .catch(() => this.erroUso.set(true));
    this.conteudo.carregarIndice().then((i) => {
      this.novidades.set(
        i.documentos
          .filter((d) => d.tipo === 'novidade' || d.tipo === 'especificacao')
          .sort((a, b) => (b.data ?? '').localeCompare(a.data ?? ''))
          .slice(0, 5),
      );
    });
    pagina.pronta('Início');
  }

  num(n: number): string { return n.toLocaleString('pt-BR'); }
  dia(iso: string): string { const [, m, d] = iso.split('-'); return `${d}/${m}`; }
  data = formatarData;
  rotuloArea = (a: Documento['area']) => ROTULO_AREA[a];

  variacao(i: Indicador): { texto: string; sentido: 'subiu' | 'desceu' | 'igual' } {
    if (!i.anterior) return { texto: 'sem período anterior para comparar', sentido: 'igual' };
    const pct = Math.round(((i.valor - i.anterior) / i.anterior) * 100);
    if (pct === 0) return { texto: 'estável em relação ao período anterior', sentido: 'igual' };
    return { texto: `${pct > 0 ? 'subiu' : 'caiu'} ${Math.abs(pct)}% em relação ao período anterior`, sentido: pct > 0 ? 'subiu' : 'desceu' };
  }

  alturaBarra(v: number): number { return Math.round((v / this.maxAcessos()) * 160); }
}
