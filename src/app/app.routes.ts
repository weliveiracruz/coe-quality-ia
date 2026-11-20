import { Routes } from '@angular/router';
import { InicioComponent } from './paginas/inicio.component';
import { AreaComponent } from './paginas/area.component';
import { PaginaConteudoComponent } from './paginas/pagina-conteudo.component';
import { EspecificacoesComponent } from './paginas/especificacoes.component';
import { NaoEncontradaComponent } from './paginas/nao-encontrada.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'especificacoes', component: EspecificacoesComponent },
  { path: 'especificacoes/publicar', component: PaginaConteudoComponent },
  { path: 'especificacoes/:slug', component: PaginaConteudoComponent },
  { path: 'ajuda', component: PaginaConteudoComponent },
  { path: 'acessibilidade', component: PaginaConteudoComponent },
  { path: 'nao-encontrada', component: NaoEncontradaComponent },
  { path: ':area', component: AreaComponent },
  { path: ':area/:pagina', component: PaginaConteudoComponent },
  { path: '**', component: NaoEncontradaComponent },
];
