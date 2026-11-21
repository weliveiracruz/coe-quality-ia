// Catálogos de Skills e de MCPs: dados publicados e busca.
import fs from 'node:fs';
import path from 'node:path';
import { Mcp, Skill, filtrarPorTexto, normalizar, origemDaSkill } from '../../src/app/servicos/catalogos.service';

const ler = <T>(arq: string): T => JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/dados', arq), 'utf8'));
const skills = ler<{ skills: Skill[] }>('skills.json').skills;
const mcps = ler<{ mcps: Mcp[] }>('mcps.json').mcps;

describe('Catálogos', () => {
  it('CEN-SITE-024 skills do COE e reutilizadas, com IDs únicos e origem informada', () => {
    expect(new Set(skills.map((s) => s.id)).size).toBe(skills.length);
    expect(skills.some((s) => s.origem === 'coe')).toBe(true);
    expect(skills.some((s) => s.origem === 'reutilizada')).toBe(true);
    for (const s of skills.filter((x) => x.origem === 'reutilizada')) expect(s.time_origem).toBeTruthy();
    expect(origemDaSkill(skills.find((s) => s.origem === 'coe')!)).toBe('Criada pelo COE');
  });

  it('CEN-SITE-025 MCPs com situação válida e documentação em https quando houver', () => {
    expect(new Set(mcps.map((m) => m.id)).size).toBe(mcps.length);
    for (const m of mcps) {
      expect(['Disponível', 'Em avaliação']).toContain(m.status);
      expect(m.acesso).toBeTruthy();
      if (m.documentacao) expect(m.documentacao).toMatch(/^https:\/\//);
    }
  });

  it('CEN-SITE-024 busca ignora maiúsculas e acentos', () => {
    expect(normalizar('  Revisão ACESSÍVEL ')).toBe('revisao acessivel');
    expect(filtrarPorTexto(skills, 'acessibilidade', (s) => [s.nome, s.categoria]).map((s) => s.id)).toContain('revisao-wcag');
    expect(filtrarPorTexto(mcps, 'SONAR', (m) => [m.nome])).toHaveLength(1);
    expect(filtrarPorTexto(mcps, '', (m) => [m.nome])).toHaveLength(mcps.length);
  });
});
