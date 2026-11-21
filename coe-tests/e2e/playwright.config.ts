// Playwright do CoE: um único config para todas as plataformas web (Bankline e demais) e para o conteúdo da WebView.
// Variáveis: COE_PERFIL_WEB (bankline), COE_AMBIENTE (hml), COE_DEMO=1 (roda contra a demo local),
// COE_NAVEGADORES (chromium,firefox,webkit), COE_CHROME_CANAL=chrome (usa o Chrome instalado no runner).
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { carregarPerfil, urlBase, demo, raizProjeto, servidorLocal } from './support/perfil';

const perfil = carregarPerfil();
const navegadores = (process.env.COE_NAVEGADORES?.split(',') ?? perfil.navegadores) as ('chromium' | 'firefox' | 'webkit')[];
const DISPOSITIVO = { chromium: devices['Desktop Chrome'], firefox: devices['Desktop Firefox'], webkit: devices['Desktop Safari'] };
// Resultados e artefatos na raiz do projeto (as mesmas pastas do pipeline), também sem COE_RESULTADOS/COE_ARTEFATOS.
const resultados = process.env.COE_RESULTADOS ?? path.join(raizProjeto(), 'resultados');
const artefatos = process.env.COE_ARTEFATOS ?? path.join(raizProjeto(), 'artefatos');
const servidor = servidorLocal(perfil);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 1 nova tentativa: o teste que só passa na segunda vez é marcado como instável no relatório do CoE
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: perfil.visual.limiar_diferenca_pct / 100, animations: 'disabled' },
  },
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',
  reporter: [
    ['list'],
    ['junit', { outputFile: path.join(resultados, 'e2e', `playwright-${perfil.id}.xml`) }],
    ['html', { outputFolder: path.join(artefatos, 'playwright-html'), open: 'never' }],
    ...(process.env.COE_ALLURE === '1' ? [['allure-playwright', { resultsDir: path.resolve(__dirname, '../allure-results') }] as const] : []),
  ],
  use: {
    baseURL: urlBase(perfil),
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    viewport: perfil.viewport_padrao,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Vídeo exige o ffmpeg do Playwright: ligado no CI (playwright install --with-deps), desligado localmente. COE_VIDEO sobrescreve.
    video: (process.env.COE_VIDEO ?? (process.env.CI ? 'retain-on-failure' : 'off')) as 'off' | 'on' | 'retain-on-failure',
  },
  projects: navegadores.map((n) => ({
    name: `${perfil.id}-${n}`,
    use: { ...DISPOSITIVO[n], viewport: perfil.viewport_padrao, ...(n === 'chromium' && process.env.COE_CHROME_CANAL ? { channel: process.env.COE_CHROME_CANAL } : {}) },
  })),
  // Demo do framework, ou a aplicação da squad no runner (ambiente "local" do perfil, com "servidor").
  webServer: demo
    ? { command: 'node demo/servidor.mjs', url: 'http://localhost:4173/__coe/requisicoes', reuseExistingServer: !process.env.CI }
    : servidor
      ? { command: servidor, url: urlBase(perfil), reuseExistingServer: !process.env.CI, cwd: raizProjeto(), timeout: 120_000 }
      : undefined,
});
