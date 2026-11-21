// Pedido ao COE (missão, novo MCP, nova Skill ou dúvida). O site é estático: o pedido vira uma issue no
// repositório do COE (formulário do GitHub já preenchido), onde o time acompanha, responde e prioriza.

export type TipoPedido = 'missao' | 'mcp' | 'skill' | 'duvida';

export const TIPOS_PEDIDO: { id: TipoPedido; rotulo: string; ajuda: string; rotuloIssue: string }[] = [
  { id: 'missao', rotulo: 'Missão com a squad', ajuda: 'O COE entra junto com a squad por um período para resolver um problema de qualidade, IA ou indicadores.', rotuloIssue: 'missao' },
  { id: 'mcp', rotulo: 'Incluir um MCP no catálogo', ajuda: 'Um MCP que sua squad usa ou precisa e que deveria ficar disponível para todos os times.', rotuloIssue: 'catalogo-mcp' },
  { id: 'skill', rotulo: 'Incluir uma Skill no catálogo', ajuda: 'Uma skill criada pela sua squad ou por outro time que pode servir para todos.', rotuloIssue: 'catalogo-skill' },
  { id: 'duvida', rotulo: 'Dúvida ou sugestão', ajuda: 'Qualquer outro assunto com o COE.', rotuloIssue: 'duvida' },
];

export interface Pedido {
  tipo: TipoPedido | '';
  nome: string;
  squad: string;
  titulo: string;
  descricao: string;
  link: string;
  prazo: string; // AAAA-MM-DD ou vazio
}

export type CampoPedido = keyof Pedido;
export interface ErroPedido { campo: CampoPedido; mensagem: string; }

export function pedidoVazio(tipo: TipoPedido | '' = ''): Pedido {
  return { tipo, nome: '', squad: '', titulo: '', descricao: '', link: '', prazo: '' };
}

export function ehTipoPedido(t: unknown): t is TipoPedido {
  return TIPOS_PEDIDO.some((x) => x.id === t);
}

/** Erros na ordem dos campos do formulário (é a ordem do resumo de erros). */
export function validarPedido(p: Pedido, hoje = new Date()): ErroPedido[] {
  const erros: ErroPedido[] = [];
  if (!p.tipo) erros.push({ campo: 'tipo', mensagem: 'Escolha o tipo de pedido.' });
  if (!p.nome.trim()) erros.push({ campo: 'nome', mensagem: 'Informe seu nome.' });
  if (!p.squad.trim()) erros.push({ campo: 'squad', mensagem: 'Informe a squad ou o time.' });
  if (!p.titulo.trim()) erros.push({ campo: 'titulo', mensagem: 'Dê um título ao pedido.' });
  else if (p.titulo.trim().length > 120) erros.push({ campo: 'titulo', mensagem: 'Use um título com até 120 caracteres.' });
  if (p.descricao.trim().length < 20) erros.push({ campo: 'descricao', mensagem: 'Descreva o pedido com pelo menos 20 caracteres.' });
  if ((p.tipo === 'mcp' || p.tipo === 'skill') && !p.link.trim()) {
    erros.push({ campo: 'link', mensagem: `Informe o link do ${p.tipo === 'mcp' ? 'MCP' : 'repositório ou da documentação da Skill'}.` });
  }
  if (p.link.trim() && !/^https?:\/\/\S+$/.test(p.link.trim())) erros.push({ campo: 'link', mensagem: 'Informe um link que comece com https://.' });
  if (p.prazo) {
    const hojeIso = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (p.prazo < hojeIso) erros.push({ campo: 'prazo', mensagem: 'O prazo desejado não pode ser uma data passada.' });
  }
  return erros;
}

export function tituloDaIssue(p: Pedido): string {
  const prefixo = { missao: 'Missão', mcp: 'Novo MCP', skill: 'Nova Skill', duvida: 'Dúvida' }[p.tipo as TipoPedido] ?? 'Pedido';
  return `[${prefixo}] ${p.titulo.trim()}`;
}

export function textoDoPedido(p: Pedido): string {
  const tipo = TIPOS_PEDIDO.find((t) => t.id === p.tipo)?.rotulo ?? '';
  const linhas = [
    `**Tipo:** ${tipo}`,
    `**Solicitante:** ${p.nome.trim()}`,
    `**Squad ou time:** ${p.squad.trim()}`,
    ...(p.link.trim() ? [`**Link:** ${p.link.trim()}`] : []),
    ...(p.prazo ? [`**Prazo desejado:** ${p.prazo.split('-').reverse().join('/')}`] : []),
    '',
    '## Descrição',
    p.descricao.trim(),
    '',
    '_Enviado pelo site COE Quality IA (Fale com o COE)._',
  ];
  return linhas.join('\n');
}

/** Formulário de nova issue do GitHub já preenchido. Rótulos inexistentes no repositório são ignorados pelo GitHub. */
export function linkDaIssue(repoUrl: string, p: Pedido): string {
  const rotulo = TIPOS_PEDIDO.find((t) => t.id === p.tipo)?.rotuloIssue ?? 'pedido';
  const u = new URL(`${repoUrl.replace(/\/$/, '')}/issues/new`);
  u.searchParams.set('title', tituloDaIssue(p));
  u.searchParams.set('body', textoDoPedido(p));
  u.searchParams.set('labels', `fale-com-o-coe,${rotulo}`);
  return u.toString();
}
