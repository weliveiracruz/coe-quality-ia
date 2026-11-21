import { Injectable } from '@angular/core';

/** Catálogos de Skills e de MCPs que o COE disponibiliza para as squads (public/dados/*.json, alterados por pull request). */
export interface Skill {
  id: string;
  nome: string;
  origem: 'coe' | 'reutilizada';
  time_origem?: string;
  categoria: string;
  descricao: string;
  quando_usar: string;
  como_usar: string;
  referencia?: string;
}
export interface Mcp {
  id: string;
  nome: string;
  origem: 'interno' | 'oficial';
  fornecedor: string;
  status: 'Disponível' | 'Em avaliação';
  categoria: string;
  descricao: string;
  uso: string;
  acesso: string;
  documentacao?: string;
}

/** Busca sem diferenciar maiúsculas nem acentos. */
export function normalizar(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function filtrarPorTexto<T>(itens: T[], termo: string, campos: (i: T) => (string | undefined)[]): T[] {
  const t = normalizar(termo);
  if (!t) return itens;
  return itens.filter((i) => campos(i).some((c) => c && normalizar(c).includes(t)));
}

export function origemDaSkill(s: Skill): string {
  return s.origem === 'coe' ? 'Criada pelo COE' : `Reutilizada de ${s.time_origem ?? 'outro time'}`;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private skills?: Promise<Skill[]>;
  private mcps?: Promise<Mcp[]>;

  carregarSkills(): Promise<Skill[]> {
    this.skills ??= ler<{ skills: Skill[] }>('dados/skills.json').then((d) => d.skills);
    return this.skills;
  }

  carregarMcps(): Promise<Mcp[]> {
    this.mcps ??= ler<{ mcps: Mcp[] }>('dados/mcps.json').then((d) => d.mcps);
    return this.mcps;
  }
}

async function ler<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Catálogo indisponível: ${url}`);
  return r.json();
}
