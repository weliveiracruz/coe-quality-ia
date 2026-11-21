// Carrega o perfil da plataforma web (platforms/web/perfis/<id>.yml) escolhido por COE_PERFIL_WEB.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export type PerfilWeb = {
  id: string;
  nome: string;
  ambientes: Record<string, { url: string; rota_pesquisa: string; servidor?: string }>;
  autenticacao: { tipo: 'nenhuma' | 'token-servico' | 'usuario-teste'; pagina_login?: string; seletores?: Record<string, string> };
  navegadores: ('chromium' | 'firefox' | 'webkit')[];
  viewport_padrao: { width: number; height: number };
  viewports_extras?: { nome: string; width: number; height: number }[];
  analytics: { ga4: string[]; fullstory: string[]; bff: string[] };
  visual: { limiar_diferenca_pct: number; mascarar: string[] };
};

/** Raiz do projeto da squad: a primeira pasta acima com coe-test.yml. Sem ela (dentro do framework), a pasta atual. */
export function raizProjeto(): string {
  let dir = __dirname;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'coe-test.yml'))) return dir;
    const acima = path.dirname(dir);
    if (acima === dir) return process.cwd();
    dir = acima;
  }
}

// Ordem de busca: COE_DIR_PERFIS (definido pelo pipeline), perfis da própria squad (coe-tests/perfis),
// checkout do framework na squad (.coe-framework) e o próprio repositório do framework (quando roda aqui dentro).
const DIRS_PERFIS = [
  process.env.COE_DIR_PERFIS,
  path.resolve(__dirname, '../../perfis'),
  path.resolve(process.cwd(), '.coe-framework/platforms/web/perfis'),
  path.resolve(__dirname, '../../../../platforms/web/perfis'),
].filter(Boolean) as string[];

/** Perfil padrão: COE_PERFIL_WEB, senão o primeiro de perfis_web no coe-test.yml da squad, senão bankline (demo do framework). */
function perfilPadrao(): string {
  if (process.env.COE_PERFIL_WEB) return process.env.COE_PERFIL_WEB;
  const cfg = path.join(raizProjeto(), 'coe-test.yml');
  if (fs.existsSync(cfg)) {
    const perfis = YAML.parse(fs.readFileSync(cfg, 'utf8'))?.perfis_web;
    if (Array.isArray(perfis) && perfis.length) return perfis[0];
  }
  return 'bankline';
}

export function carregarPerfil(id = perfilPadrao()): PerfilWeb {
  const candidatos = DIRS_PERFIS.map((d) => path.join(d, `${id}.yml`));
  const arq = candidatos.find((c) => fs.existsSync(c));
  if (!arq) throw new Error(`Perfil web "${id}" não encontrado. Cadastre a partir de platforms/web/perfis/_modelo.yml.`);
  return YAML.parse(fs.readFileSync(arq, 'utf8'));
}

export const demo = process.env.COE_DEMO === '1';

export function urlBase(perfil: PerfilWeb) {
  if (process.env.COE_BASE_URL) return process.env.COE_BASE_URL;
  if (demo) return 'http://localhost:4173';
  return perfil.ambientes[process.env.COE_AMBIENTE ?? 'hml'].url;
}

/** Comando que sobe a aplicação no runner (ambiente "local" do perfil), se houver. */
export function servidorLocal(perfil: PerfilWeb): string | undefined {
  return demo ? undefined : perfil.ambientes[process.env.COE_AMBIENTE ?? 'hml']?.servidor;
}

export function rotaPesquisa(perfil: PerfilWeb) {
  return demo ? '/pesquisa/satisfacao' : perfil.ambientes[process.env.COE_AMBIENTE ?? 'hml'].rota_pesquisa;
}
