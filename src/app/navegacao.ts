// Estrutura do menu superior. Cada subpágina corresponde a um arquivo Markdown em
// public/conteudo/paginas/<area>/<pagina>.md (conteúdo versionado no Git, alterado por pull request).

export type IdArea = 'inteligencia-artificial' | 'qualidade' | 'indicadores' | 'sobre';

export interface ItemMenu {
  rotulo: string;
  rota: string;
  descricao?: string;
}

export interface Menu {
  id: IdArea;
  rotulo: string;
  resumo: string;
  tag: 'ia' | 'qualidade' | 'indicadores' | 'geral';
  itens: ItemMenu[];
}

export const MENUS: Menu[] = [
  {
    id: 'inteligencia-artificial',
    rotulo: 'Inteligência Artificial',
    tag: 'ia',
    resumo: 'Usar IA para reduzir esforço operacional, melhorar diagnóstico e ampliar a capacidade de qualidade da RT.',
    itens: [
      { rotulo: 'Skills para as squads', rota: '/inteligencia-artificial/skills', descricao: 'Skills do COE e reutilizadas de outros times' },
      { rotulo: 'Catálogo de MCPs', rota: '/inteligencia-artificial/mcps', descricao: 'MCPs disponíveis e catalogados para as squads' },
      { rotulo: 'AI Quality Lab', rota: '/inteligencia-artificial/ai-quality-lab', descricao: 'Experimentos reais com agentes especializados' },
      { rotulo: 'Avaliação de ferramentas de IA', rota: '/inteligencia-artificial/avaliacao-ferramentas', descricao: 'Critérios para escolher ferramenta, agente ou skill' },
      { rotulo: 'Observabilidade inteligente', rota: '/inteligencia-artificial/observabilidade-inteligente', descricao: 'Logs, métricas e traces com diagnóstico assistido' },
      { rotulo: 'Experimentação e POCs', rota: '/inteligencia-artificial/experimentacao', descricao: 'Os 10% dedicados a provas de conceito' },
      { rotulo: 'Knowledge Hub e RAG', rota: '/inteligencia-artificial/knowledge-hub', descricao: 'Documentação viva como base de conhecimento' },
    ],
  },
  {
    id: 'qualidade',
    rotulo: 'Qualidade',
    tag: 'qualidade',
    resumo: 'Estratégia, automação e critérios de qualidade para as squads não começarem do zero.',
    itens: [
      { rotulo: 'Quality Engineering Kit', rota: '/qualidade/quality-engineering-kit', descricao: 'Templates, pipelines e o CoE Test Framework' },
      { rotulo: 'CoE Test Framework', rota: '/qualidade/coe-test-framework', descricao: 'Pacote 1.0.0 para download e guia de uso' },
      { rotulo: 'Templates', rota: '/qualidade/templates', descricao: 'Kits iniciais por stack, configurações e modelos' },
      { rotulo: 'Quality Baseline', rota: '/qualidade/quality-baseline', descricao: 'Diagnóstico inicial e mapa de maturidade' },
      { rotulo: 'Quality Scorecard', rota: '/qualidade/quality-scorecard', descricao: 'Painel por produto e squad' },
      { rotulo: 'Critérios de qualidade e DoD', rota: '/qualidade/criterios-dod', descricao: 'Definition of Done e qualidade nos pipelines' },
      { rotulo: 'Testes não funcionais', rota: '/qualidade/testes-nao-funcionais', descricao: 'Performance, resiliência e acessibilidade' },
      { rotulo: 'Quality SRE', rota: '/qualidade/quality-sre', descricao: 'Health checks, observabilidade mínima e postmortems' },
      { rotulo: 'Quality Radar', rota: '/qualidade/quality-radar', descricao: 'Relatório periódico de riscos' },
    ],
  },
  {
    id: 'indicadores',
    rotulo: 'Indicadores',
    tag: 'indicadores',
    resumo: 'Conectar a qualidade técnica com a qualidade do que a RT entrega para o negócio.',
    itens: [
      { rotulo: 'Indicadores de tecnologia', rota: '/indicadores/tecnologia', descricao: 'Cyber, confiabilidade, resiliência, CMDB e dados por squad' },
      { rotulo: 'Metodologia dos indicadores', rota: '/indicadores/metodologia', descricao: 'Fórmula, elegibilidade, apuração e publicação' },
      { rotulo: 'Catálogo de métricas', rota: '/indicadores/catalogo-metricas', descricao: 'Definição e documentação das métricas' },
      { rotulo: 'Qualidade de dados e linhagem', rota: '/indicadores/qualidade-dados', descricao: 'Regras, consistência e anomalias' },
      { rotulo: 'SLIs, SLOs e error budget', rota: '/indicadores/slis-slos', descricao: 'Métricas de confiabilidade e baselines' },
      { rotulo: 'Regras e limiares de alerta', rota: '/indicadores/alertas', descricao: 'Critérios, regras e limiares' },
      { rotulo: 'Governança e rastreabilidade', rota: '/indicadores/governanca', descricao: 'Do sinal operacional ao impacto no indicador' },
    ],
  },
  {
    id: 'sobre',
    rotulo: 'Sobre o COE',
    tag: 'geral',
    resumo: 'Engenharia de qualidade, inteligência artificial e confiabilidade como capability compartilhada da RT.',
    itens: [
      { rotulo: 'Propósito e papéis do piloto', rota: '/sobre/proposito', descricao: 'Quality Engineer, SME de Indicadores e AI Engineer' },
      { rotulo: 'Modelo de atuação 60/30/10', rota: '/sobre/modelo-atuacao', descricao: 'Produtos, missões e experimentação' },
      { rotulo: 'Missões com squads', rota: '/sobre/missoes', descricao: 'Quando e como o COE entra junto' },
      { rotulo: 'Fases e resultados do piloto', rota: '/sobre/piloto', descricao: 'Descobrir, experimentar, provar e escalar' },
      { rotulo: 'Fale com o COE', rota: '/sobre/fale-com-o-coe', descricao: 'Pedir missão, novo MCP ou nova Skill' },
    ],
  },
];

/** Páginas feitas por componente (dados em public/dados/), e não por Markdown: também são rotas publicadas. */
export const ROTAS_DE_COMPONENTE = [
  '/indicadores/tecnologia',
  '/inteligencia-artificial/skills',
  '/inteligencia-artificial/mcps',
  '/sobre/fale-com-o-coe',
];

export function menuPorId(id: string): Menu | undefined {
  return MENUS.find((m) => m.id === id);
}
