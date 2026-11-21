// Fixtures do CoE para Playwright: captura de eventos (GA4, FullStory, BFF), auditoria axe e login por perfil.
import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { carregarPerfil, rotaPesquisa, demo, raizProjeto, type PerfilWeb } from './perfil';

export type EventoCapturado = { destino: 'ga4' | 'fullstory' | 'bff'; url: string; headers: Record<string, string>; corpo: unknown };

// Mesma pasta do pipeline (raiz do projeto), também quando roda localmente sem COE_ARTEFATOS.
const ARTEFATOS = process.env.COE_ARTEFATOS ?? path.join(raizProjeto(), 'artefatos');
const TAGS_WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function corpoDe(req: { postData(): string | null; url(): string }) {
  const bruto = req.postData();
  if (bruto) { try { return JSON.parse(bruto); } catch { return bruto; } }
  return Object.fromEntries(new URL(req.url()).searchParams);
}

type Fixtures = {
  perfil: PerfilWeb;
  eventos: EventoCapturado[];
  abrirPesquisa: (opcoes?: { canal?: 'web' | 'webview' }) => Promise<void>;
  auditarA11y: (rotulo: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  perfil: async ({}, use) => use(carregarPerfil()),

  eventos: async ({ page, perfil }, use, info) => {
    const capturados: EventoCapturado[] = [];
    const casa = (url: string, padroes: string[]) => padroes.some((p) => url.includes(p));
    // GA4 e FullStory: interceptados e respondidos localmente (não poluem o analytics real)
    await page.route((u) => casa(u.toString(), [...perfil.analytics.ga4, ...perfil.analytics.fullstory]), async (rota) => {
      const req = rota.request();
      capturados.push({ destino: casa(req.url(), perfil.analytics.ga4) ? 'ga4' : 'fullstory', url: req.url(), headers: req.headers(), corpo: corpoDe(req) });
      await rota.fulfill({ status: 204 });
    });
    // BFF: apenas observado (a chamada segue para o ambiente ou para a demo)
    page.on('request', (req) => {
      if (casa(req.url(), perfil.analytics.bff) && req.method() === 'POST') {
        capturados.push({ destino: 'bff', url: req.url(), headers: req.headers(), corpo: corpoDe(req) });
      }
    });
    await use(capturados);
    // Eventos de analytics vão para o scanner de privacidade do pipeline
    const analytics = capturados.filter((e) => e.destino !== 'bff').map((e) => ({ destino: e.destino, corpo: e.corpo }));
    const dir = path.join(ARTEFATOS, 'eventos');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `web-${info.project.name}-${info.titlePath.join('-').replace(/[^\w-]+/g, '_').slice(0, 120)}.json`), JSON.stringify(analytics, null, 2));
  },

  abrirPesquisa: async ({ page, perfil }, use) => {
    await use(async ({ canal = 'web' } = {}) => {
      if (!demo && perfil.autenticacao.tipo === 'usuario-teste' && canal === 'web') await login(page, perfil);
      await page.goto(`${rotaPesquisa(perfil)}${canal === 'webview' ? '?canal=webview' : ''}`);
      await expect(page.getByRole('heading', { name: 'Pesquisa de satisfação' })).toBeVisible();
    });
  },

  auditarA11y: async ({ page }, use, info) => {
    const todas: unknown[] = [];
    await use(async (rotulo) => {
      const r = await new AxeBuilder({ page }).withTags(TAGS_WCAG).analyze();
      for (const v of r.violations) todas.push({ ...v, estado: rotulo, teste: info.title, projeto: info.project.name });
      const graves = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      expect(graves.map((v) => `${v.id}: ${v.help} (${v.nodes.length} elemento(s))`), `Violações graves de acessibilidade em "${rotulo}"`).toEqual([]);
    });
    // Um arquivo por teste (workers paralelos não disputam o mesmo arquivo). Vazio = auditado sem violações.
    const dir = path.join(ARTEFATOS, 'a11y');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${info.project.name}-${info.testId}.json`), JSON.stringify(todas, null, 2));
  },
});

async function login(page: Page, perfil: PerfilWeb) {
  const s = perfil.autenticacao.seletores!;
  await page.goto(perfil.autenticacao.pagina_login!);
  await page.locator(s.usuario).fill(process.env.COE_WEB_USUARIO ?? '');
  await page.locator(s.senha).fill(process.env.COE_WEB_SENHA ?? '');
  await page.locator(s.entrar).click();
}

export { expect };
