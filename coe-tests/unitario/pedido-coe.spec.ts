// Pedido ao COE: validação, texto e link da issue no repositório do COE.
import { linkDaIssue, pedidoVazio, textoDoPedido, tituloDaIssue, validarPedido, ehTipoPedido } from '../../src/app/servicos/pedido-coe';

const HOJE = new Date('2026-11-20T12:00:00-03:00');
const valido = { ...pedidoVazio('mcp'), nome: 'Ana', squad: 'Squad CX RAIOS', titulo: 'MCP do Datadog', descricao: 'Precisamos consultar monitores e SLOs pelo assistente.', link: 'https://exemplo.com/mcp' };

describe('Pedido ao COE', () => {
  it('CEN-SITE-026 formulário vazio aponta todos os campos obrigatórios, na ordem do formulário', () => {
    expect(validarPedido(pedidoVazio(), HOJE).map((e) => e.campo)).toEqual(['tipo', 'nome', 'squad', 'titulo', 'descricao']);
  });

  it('CEN-SITE-026 pedido de MCP ou Skill exige o link; missão não', () => {
    expect(validarPedido({ ...valido, link: '' }, HOJE).map((e) => e.campo)).toEqual(['link']);
    expect(validarPedido({ ...valido, tipo: 'skill', link: '' }, HOJE)[0].mensagem).toMatch(/Skill/);
    expect(validarPedido({ ...valido, tipo: 'missao', link: '' }, HOJE)).toEqual([]);
  });

  it('CEN-SITE-026 link inválido, título longo, descrição curta e prazo passado', () => {
    expect(validarPedido({ ...valido, link: 'exemplo.com' }, HOJE)[0].mensagem).toMatch(/https:\/\//);
    expect(validarPedido({ ...valido, titulo: 'x'.repeat(121) }, HOJE)[0].campo).toBe('titulo');
    expect(validarPedido({ ...valido, descricao: 'curta' }, HOJE)[0].campo).toBe('descricao');
    expect(validarPedido({ ...valido, prazo: '2026-11-19' }, HOJE)[0].campo).toBe('prazo');
    expect(validarPedido({ ...valido, prazo: '2026-11-20' }, HOJE)).toEqual([]);
  });

  it('CEN-SITE-026 título, texto e link da issue', () => {
    expect(tituloDaIssue(valido)).toBe('[Novo MCP] MCP do Datadog');
    const texto = textoDoPedido({ ...valido, prazo: '2026-12-15' });
    expect(texto).toContain('**Tipo:** Incluir um MCP no catálogo');
    expect(texto).toContain('**Squad ou time:** Squad CX RAIOS');
    expect(texto).toContain('**Prazo desejado:** 15/12/2026');
    const u = new URL(linkDaIssue('https://github.com/weliveiracruz/coe-quality-ia/', valido));
    expect(`${u.origin}${u.pathname}`).toBe('https://github.com/weliveiracruz/coe-quality-ia/issues/new');
    expect(u.searchParams.get('title')).toBe('[Novo MCP] MCP do Datadog');
    expect(u.searchParams.get('labels')).toBe('fale-com-o-coe,catalogo-mcp');
    expect(u.searchParams.get('body')).toContain('Precisamos consultar monitores');
  });

  it('CEN-SITE-026 tipo vindo do endereço só é aceito se existir', () => {
    expect(ehTipoPedido('skill')).toBe(true);
    expect(ehTipoPedido('outro')).toBe(false);
    expect(ehTipoPedido(null)).toBe(false);
  });
});
