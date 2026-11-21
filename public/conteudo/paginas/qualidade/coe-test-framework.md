---
titulo: CoE Test Framework
area: qualidade
resumo: Pacote do framework de testes do CoE, versão 1.0.1. O que vem dentro e como a squad começa a usar.
---
# CoE Test Framework

O CoE Test Framework é a entrega do COE para as squads testarem do mesmo jeito em todas as stacks. A squad declara stack, produto e camadas num único arquivo, o `coe-test.yml`. O framework entrega pipeline, quality gates, relatórios, catálogo de cenários e integração com o IU Click.

## Download
[Baixar o CoE Test Framework versão 1.0.1 (arquivo .zip, 248 KB)](/downloads/coe-test-framework-v1.0.1.zip)

- **Versão:** 1.0.1, de 20 de novembro de 2026
- **Requisito:** Node.js 20 ou mais novo para rodar o CLI

## Arquitetura coberta
- Canais: Android (Compose), iOS (SwiftUI), WebView (Angular e React) e web, como o Bankline
- BFF Kotlin, com token e camadas
- API de eventos em .NET
- SDK de Analytics (Firebase com FullStory encapsulado), com suíte própria para o bump do FullStory

## O que tem no pacote
| Pasta | Conteúdo |
| --- | --- |
| `core/` | CLI `coe-test`, padrões do CoE, schemas, massa de dados sintética, padrões de nomenclatura e quality gate do SonarQube |
| `stacks/` | Templates de teste por tecnologia: `android-compose`, `ios-swiftui`, `kotlin-bff`, `dotnet-api`, `angular`, `react` e `web-e2e` (Playwright, compartilhado por Angular e React) |
| `products/` | Um por produto (`modulo-pesquisa`, `bff-kotlin`, `api-eventos`), cada um com catálogo de cenários |
| `suites/analytics-bump/` | Regressão do bump do FullStory dentro do SDK de Analytics, em Android e iOS |
| `suites/transversais/` | Privacidade e LGPD, resiliência, rede instável, qualidade de dados, smoke em produção, performance e segurança |
| `platforms/web/perfis/` | Perfis das plataformas web: Bankline e um modelo em branco |
| `contracts/` | Contratos versionados (schemas e pacts) nas camadas canais → BFF e BFF → API |
| `.github/` | Workflows reutilizáveis (pipeline, stacks, release, bump e smoke) e actions compostas |
| `portal/` | Portal web do CoE, acessível (WCAG 2.2 AA): cadastro de squad, perfis web, painel e catálogo |
| `docs/` | Estratégia de testes, DoD, guias, playbooks e governança |
| `examples/` | Um `coe-test.yml` de exemplo para cada tipo de squad e métricas de exemplo |

## Como usar
Da primeira configuração ao primeiro pipeline verde leva menos de uma hora.

### 1. Gerar a estrutura na squad
Descompacte o pacote e instale as dependências do CLI uma vez, dentro da pasta do framework:
```bash
npm ci
```
Depois, na raiz do repositório da squad:
```bash
node <pasta-do-framework>/core/cli/bin/coe-test.js init --stack react --produto modulo-pesquisa --squad "Minha Squad" --canais web,webview --nivel bronze
node <pasta-do-framework>/core/cli/bin/coe-test.js validate
```
Valores aceitos em `--stack`: `android-compose`, `ios-swiftui`, `kotlin-bff`, `dotnet-api`, `angular` e `react`.

Quando o framework estiver publicado no GitHub interno, o mesmo comando roda sem baixar nada:
```bash
npx github:itau-coe/coe-test-framework#v1 init --stack react --produto modulo-pesquisa --squad "Minha Squad"
```
Quem prefere formulário pode usar o portal (`portal/index.html`, seção "Cadastrar squad"). Ele gera os mesmos arquivos e abre o pull request.

O `init` cria três coisas:
- `coe-test.yml`, o único arquivo que a squad edita
- `.github/workflows/coe-qualidade.yml`, com 5 linhas que chamam o pipeline do CoE
- `coe-tests/`, com exemplos de cada camada já passando contra uma implementação de referência

Squads web também ganham o próprio perfil de plataforma em `coe-tests/perfis/<produto>.yml`. Se o produto ainda não tem catálogo no framework, o `init` avisa e cria o catálogo em `coe-tests/catalogo/cenarios.yml`.

### 2. Ligar ao código real
1. Siga o `README.md` de dentro de `coe-tests/`. Ele muda conforme a stack.
2. Troque os imports da pasta `exemplo-referencia/` pelos do seu código e apague essa pasta.
3. Junte as dependências de `package.coe.json`, `build.gradle.coe.kts` ou `.csproj` às do projeto.

### 3. Configurar o repositório (uma vez)
- **Secrets:** SonarQube, IU Click, device farm (mobile), usuário de teste das plataformas web e tokens de homologação. A lista completa está em `docs/guia-adocao.md`.
- **Variáveis:** endereços do SonarQube, do BFF, da API de eventos e da web em homologação.
- **Proteção da branch `main`:** exigir os checks `Qualidade CoE` e `coe/ambiente`. O segundo segura o merge enquanto os testes de ambiente esperam a janela de execução.

### 4. Abrir o primeiro pull request
Coloque o ID da história do IU Click no título, por exemplo `PESQ-1234: adota CoE`. O pull request recebe um comentário com os gates, o link do relatório e a atualização da história no IU Click.

## Níveis de maturidade
| Nível | Camadas exigidas | Efeito |
| --- | --- | --- |
| Bronze | Lint, unitário, segurança estática e SonarQube | Entrada no framework |
| Prata | Bronze, mais contrato, integração, acessibilidade e privacidade | Padrão esperado em até 2 sprints |
| Ouro | Prata, mais mutação, E2E, performance, resiliência e qualidade de dados | A paridade entre canais passa a bloquear o merge |

O nível é calculado a cada execução e aparece no painel do portal.

## Quando os testes rodam
O ambiente de homologação fica ligado das 8h às 20h (FinOps).

| Momento | O que roda | Onde |
| --- | --- | --- |
| A cada pull request, a qualquer hora | Lint, unitário, contrato, mutação, segurança estática, privacidade e SonarQube | Runner do GitHub |
| Dentro da janela das 8h às 20h | Integração com ambiente, E2E e UI, acessibilidade e visual | Homologação. Fora do horário, fica pendente e dispara às 8h05 |
| Fechamento do pacote para produção | Performance (k6), OWASP ZAP, device farm, resiliência e qualidade de dados | Só começa se terminar antes das 20h |
| Contínuo | Smoke sintético em produção | A cada 15 minutos |

Aplicação que roda no próprio runner, como um site estático, não precisa esperar a janela. Marque `estagios.e2e.precisa_ambiente: false` no `coe-test.yml` e crie o ambiente `local` no perfil, com o comando que sobe a aplicação. O site do COE testa a si mesmo desse jeito.

## Comandos do CLI
| Comando | Para quê |
| --- | --- |
| `init` e `validate` | Criar e validar a configuração da squad |
| `plano` e `janela` | Ver o que roda agora e o que espera a janela |
| `catalogo` e `esqueleto` | Validar o catálogo de cenários, conferir a paridade entre canais e gerar o esqueleto de um teste |
| `gates`, `metricas` e `iuclick` | Consolidar os quality gates, gerar o JSON de métricas e atualizar a história |
| `contrato` e `payloads` | Resumir quebras de contrato e conferir se o payload é igual entre canais |
| `privacidade` | Procurar dados pessoais em eventos |
| `bump`, `devicefarm` e `portal` | Bump do FullStory, device farm e atualização dos dados do portal |

Rode `coe-test ajuda` para ver os parâmetros de cada comando.

## Documentação dentro do pacote
- `docs/guia-adocao.md`: passo a passo completo e checklist de onboarding
- `docs/estrategia-testes.md` e `docs/definition-of-done.md`
- `docs/janela-execucao.md`: regras da janela das 8h às 20h
- `docs/cenarios-e-iuclick.md` e `docs/modelo-historia-pm.md`: catálogo de cenários e modelo de história para PMs
- `docs/playbook-testes-instaveis.md` e `docs/playbook-bump-fullstory.md`
- `docs/portal.md`, `docs/governanca.md` e `docs/verificacao.md`

## Versões
### O que mudou na 1.0.1
Correções encontradas quando o próprio site do COE adotou o framework. A versão é compatível com a 1.0.0, e quem usa `@v1` recebe as correções sem mudar nada.
- Template Angular pronto para uso: `ts-node` incluído, cobertura medindo o código da aplicação e mutação (Stryker) funcionando.
- E2E sem ambiente roda no pipeline. Na 1.0.0 esses testes não rodavam em lugar nenhum.
- Os specs do Playwright são escolhidos pela camada, não pelos nomes de arquivo do template.
- `coe-test init` gera o perfil da própria squad (não mais o do Bankline) e cria o catálogo de produto novo.
- `coe-test gates` não duplica violações ao rodar de novo e ganhou o gate de cobertura mínima.
- O portal mostra o catálogo de produtos fora do framework e indica a cobertura abaixo do mínimo.

A lista completa está no `CHANGELOG.md` do pacote. A versão anterior continua disponível: [coe-test-framework-v1.0.0.zip](/downloads/coe-test-framework-v1.0.0.zip).

O framework segue versionamento semântico (SemVer). As squads fixam a versão no workflow (`@v1`), e mudanças que quebram compatibilidade vêm com guia de migração no `CHANGELOG.md`. Cada versão nova é publicada aqui com o número no nome do arquivo.

Precisa de ajuda para adotar? [Solicite uma missão com o COE](/sobre/missoes).
