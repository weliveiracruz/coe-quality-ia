import { Routes } from '@angular/router';
import { InicioComponent } from './paginas/inicio.component';
import { AreaComponent } from './paginas/area.component';
import { PaginaConteudoComponent } from './paginas/pagina-conteudo.component';
import { NaoEncontradaComponent } from './paginas/nao-encontrada.component';
import { IndicadoresTecnologiaComponent } from './paginas/indicadores-tecnologia.component';
import { SkillsComponent } from './paginas/skills.component';
import { McpsComponent } from './paginas/mcps.component';
import { FaleComOCoeComponent } from './paginas/fale-com-o-coe.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'ajuda', component: PaginaConteudoComponent },
  { path: 'acessibilidade', component: PaginaConteudoComponent },
  { path: 'nao-encontrada', component: NaoEncontradaComponent },
  // páginas com dados (public/dados/) antes da rota genérica de conteúdo em Markdown
  { path: 'indicadores/tecnologia', component: IndicadoresTecnologiaComponent },
  { path: 'inteligencia-artificial/skills', component: SkillsComponent },
  { path: 'inteligencia-artificial/mcps', component: McpsComponent },
  { path: 'sobre/fale-com-o-coe', component: FaleComOCoeComponent },
  { path: ':area', component: AreaComponent },
  { path: ':area/:pagina', component: PaginaConteudoComponent },
  { path: '**', component: NaoEncontradaComponent },
];
