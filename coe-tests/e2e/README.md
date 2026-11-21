# E2E web (Playwright), compartilhado por Angular e React

Copiado para `coe-tests/e2e/` quando a stack é `angular` ou `react`. Cobre o canal **web** (Bankline e qualquer plataforma cadastrada em `platforms/web/perfis/`) e o conteúdo que roda dentro da **WebView**, com a ponte nativa simulada.

| Arquivo | O que cobre |
|---|---|
| `tests/pesquisa.spec.ts` | CEN-PESQ-001 a 005 e 008, com validação do payload contra o contrato |
| `tests/acessibilidade.spec.ts` | axe (WCAG 2.2 AA), teclado, reflow a 200% e área de toque |
| `tests/visual.spec.ts` | Regressão visual com máscaras do perfil |
| `tests/webview/ponte.spec.ts` | Token pela ponte, fechar, fila offline (CEN-PESQ-006, 007 e CEN-TRV-004) |
| `tests/privacidade.spec.ts` | Nada de dado pessoal em GA4/FullStory (CEN-TRV-003) |

## Rodar
```
COE_DEMO=1 npx playwright test -c coe-tests/e2e/playwright.config.ts       # contra a demo local, sem ambiente
COE_PERFIL_WEB=bankline COE_AMBIENTE=hml npx playwright test -c ...          # contra homologação (janela 8h–20h)
```

A demo em `demo/` reproduz a pesquisa para os exemplos passarem desde o primeiro dia. Quando os testes apontarem para o ambiente real, a demo deixa de ser usada.

## Nova plataforma web
Copie `platforms/web/perfis/_modelo.yml` para `<id>.yml`, preencha e adicione o id em `perfis_web` no `coe-test.yml`. Nenhum teste muda.
