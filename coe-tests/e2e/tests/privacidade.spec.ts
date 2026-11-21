// Privacidade: navegar pelo site não manda dado pessoal para analytics nem chama domínios de terceiros.
// Os eventos capturados vão para artefatos/eventos/ e passam pelo scanner "coe-test privacidade" do pipeline.
import { test, expect } from '../support/coe';

const ROTEIRO = ['/', '/qualidade', '/qualidade/coe-test-framework', '/qualidade/templates', '/indicadores/tecnologia', '/inteligencia-artificial/skills', '/inteligencia-artificial/mcps', '/sobre/fale-com-o-coe', '/sobre/missoes'];

test('CEN-SITE-018 navegação sem dado pessoal e sem chamadas a terceiros', async ({ page, eventos }) => {
  const externos: string[] = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http')) externos.push(req.url());
  });
  for (const rota of ROTEIRO) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Início' }).first().click();
  expect(externos, 'requisições para fora do site').toEqual([]);
  expect(eventos.filter((e) => e.destino !== 'bff'), 'o site não tem analytics: nenhum evento esperado').toEqual([]);
});
