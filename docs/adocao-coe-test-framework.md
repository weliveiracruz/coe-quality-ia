# Adoção do CoE Test Framework no site (20/11/2026)

O site COE Quality IA adotou o CoE Test Framework como uma squad faria: `coe-test init --stack angular`, catálogo de 20 cenários, testes ligados ao código real e o CLI fechando a execução. A adoção da v1.0.0 revelou defeitos no framework, que foram corrigidos na **v1.0.1**. O site usa a v1.0.1, sem contornos.

## Resultado com a v1.0.1
| Etapa | Resultado |
| --- | --- |
| `coe-test init`, `validate` e `plano` | Funcionaram. E2E, acessibilidade e visual rodam no runner (`precisa_ambiente: false`) |
| Unitário (`npm run test:coe`) | 45 de 45. Cobertura de `src/app`: 26% (o restante do site é exercido pelo E2E) |
| E2E (`npm run e2e:coe`) | 63 de 63. O perfil sobe o build local sozinho, e os resultados vão para `resultados/` e `artefatos/` |
| Mutação (`npm run test:mutacao`) | 65,9% (limite 60%): serviço de conteúdo 92%, menus 68%, cabeçalho 31% |
| Paridade | 20 de 20 cenários implementados e aprovados |
| Privacidade e gates | Nenhum dado pessoal. Acessibilidade, privacidade e paridade aprovadas, e o resultado não muda ao rodar `gates` de novo |
| Métricas e portal | Painel mostra o site no nível prata, com a cobertura abaixo do mínimo indicada. O catálogo do site aparece no portal |
| Não executado localmente | SonarQube, segurança estática, Lighthouse e IU Click (dependem do pipeline) |

## Bugs do site encontrados pelos testes (corrigidos)
1. Metadados aparecendo como texto nas páginas quando o Git do Windows grava CRLF (CEN-SITE-010).
2. Bloco de código largo sem foco de teclado, violação grave de acessibilidade (CEN-SITE-011).

## Defeitos do framework v1.0.0, corrigidos na v1.0.1
1. `ts-node` faltando no `package.coe.json` do Angular.
2. Cobertura do Angular vazia (`rootDir` em `coe-tests/`).
3. Stryker no Angular: `tsconfig` errado, checker que recusava arquivos e queda com zone.js no Node 22.
4. `coe-test gates` duplicava violações de acessibilidade a cada execução.
5. `coe-test init` aceitava produto sem catálogo sem avisar, e o `catalogo validar` caía com `ENOENT`.
6. `coe-test init` colocava `perfis_web: [bankline]` em toda squad web.
7. O template E2E não subia a aplicação da squad (só a demo).
8. Pastas de artefatos e resultados diferentes do pipeline quando o E2E rodava localmente.
9. Catálogo do repositório da squad fora do portal.
10. Cobertura abaixo do mínimo sem sinalização quando não há SonarQube.
11. Vídeo ligado por padrão, exigindo o ffmpeg do Playwright localmente.
12. **E2E sem ambiente não rodava no pipeline:** com `precisa_ambiente: false`, os testes iam para o job do runner, que não tinha passo de Playwright.
13. **Specs escolhidos pelos nomes do template:** testes da squad com outros nomes (`navegacao.spec.ts`) nunca rodavam no pipeline.
14. **CI do próprio framework quebrado:** os jobs `web-template` e `portal` falhavam com `__dirname` em ES module. O mesmo atingiria squads React/Vite (`"type": "module"`).

A v1.0.1 tem 60 testes no CLI (8 novos, um por correção), o template web passa contra a demo (17 de 17), o portal passa no axe (6 de 6) e o actionlint não aponta problemas. Uma squad nova, criada do zero com a v1.0.1, roda unitário, cobertura, mutação e E2E sem nenhum ajuste.

## Para melhorar
- Cabeçalho com 31% de mutação: faltam testes dos menus no celular e do clique fora.
- Os scripts `e2e:coe:demo` usam `VAR=valor comando`, que não funciona no Prompt de Comando do Windows.
- O workflow chama `itau-coe/coe-test-framework@v1`. Ele só roda depois que o framework estiver publicado nesse repositório.
