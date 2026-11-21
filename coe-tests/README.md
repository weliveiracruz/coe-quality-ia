# Testes do site com o CoE Test Framework

Criado por `coe-test init --stack angular` (CoE Test Framework v1.0.1) e ligado ao código do site. A configuração está em `coe-test.yml`, na raiz do projeto. Os cenários estão em `catalogo/cenarios.yml`, e cada ID (`CEN-SITE-000`) aparece no nome do teste que o implementa.

| Pasta | Camada | Ferramentas | Onde roda |
| --- | --- | --- | --- |
| `unitario/` | Serviço de conteúdo, menus x conteúdo publicado, cabeçalho com axe | Jest, jest-preset-angular, Angular Testing Library, jest-axe | Runner, a qualquer hora |
| `e2e/` | Navegação, conteúdo, downloads, acessibilidade em todas as páginas, privacidade e visual | Playwright, axe-core | Runner, contra o build local: o perfil sobe o servidor (ambiente `local`) |
| `stryker.conf.json` | Mutação | Stryker | Runner |
| `perfis/coe-quality-ia.yml` | Perfil da plataforma web do site | | |

## Rodar
```bash
npm run test:coe                 # unitário + cobertura (artefatos/cobertura-angular) + JUnit (resultados/unitario)
npm run build && npm run e2e:coe # E2E do framework: o perfil sobe o build em http://localhost:4300
npm run test:mutacao             # mutação
```
Resultados e artefatos vão para `resultados/` e `artefatos/` na raiz do projeto, como no pipeline. Variáveis opcionais: `COE_VIDEO=retain-on-failure` (vídeo das falhas) e `COE_CHROME_CANAL=chrome` (usa o Chrome instalado).

Depois dos testes, o CLI do framework fecha a execução:
```bash
coe-test catalogo paridade --resultados resultados --saida artefatos/paridade.json
coe-test privacidade --entrada artefatos/eventos --saida artefatos/privacidade.json
coe-test gates --artefatos artefatos --saida artefatos/gates.json
coe-test metricas --junit resultados --gates artefatos/gates.json --momento pr --paridade artefatos/paridade.json --saida artefatos/coe-metricas.json
```

## Regressão visual
As imagens de referência ficam em `e2e/tests/__snapshots__/` e são geradas no CI, com o mesmo navegador e as mesmas fontes de todas as execuções. Quando não há referências na branch, o workflow **Qualidade CoE** gera as imagens e grava na própria branch com um commit do GitHub Actions. Para aprovar uma mudança visual, rode o workflow manualmente com "Regerar as imagens de referência". Não gere as referências na sua máquina: elas não batem com as do CI.
