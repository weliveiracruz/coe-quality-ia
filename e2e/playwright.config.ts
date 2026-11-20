import { defineConfig, devices } from '@playwright/test';

// Roda contra o build de produção servido localmente (npm run build && npm run e2e).
export default defineConfig({
  testDir: '.',
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['junit', { outputFile: '../resultados/e2e/junit.xml' }]],
  use: { baseURL: 'http://localhost:4300', locale: 'pt-BR', trace: 'retain-on-failure', video: 'off' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(process.env.COE_CHROME_CANAL ? { channel: process.env.COE_CHROME_CANAL } : {}) } },
  ],
  webServer: { command: 'npx http-server dist/coe-quality-ia/browser -p 4300 -s --proxy http://localhost:4300?', url: 'http://localhost:4300', reuseExistingServer: !process.env.CI, cwd: '..' },
});
