---
titulo: Templates
area: qualidade
resumo: Todos os modelos prontos para a squad adotar o CoE Test Framework, configurar o pipeline e escrever histórias e cenários.
---
# Templates

Todos os templates vêm do [CoE Test Framework](/qualidade/coe-test-framework) versão 1.0.1, com a versão no nome do arquivo. Baixe só o que a sua squad precisa. Quem baixa o pacote completo já tem tudo isso dentro dele.

## Kits iniciais por stack
Cada kit é o resultado do comando `coe-test init` para a stack, já validado com `coe-test validate`. O kit traz três coisas:
- `coe-test.yml`, a configuração da squad, no nível bronze
- `.github/workflows/coe-qualidade.yml`, o workflow que chama o pipeline do CoE
- `coe-tests/`, com exemplos de cada camada passando contra uma implementação de referência
- nos kits web (Android, iOS, Angular e React, por causa da WebView), o perfil de plataforma da squad em `coe-tests/perfis/`

| Stack | Produto de exemplo e canais | Download |
| --- | --- | --- |
| Android (Jetpack Compose) | Módulo de pesquisa: Android e WebView | <a href="/downloads/templates/kit-inicial-android-compose-v1.0.1.zip" download>kit-inicial-android-compose-v1.0.1.zip</a> (18 KB) |
| iOS (SwiftUI) | Módulo de pesquisa: iOS e WebView | <a href="/downloads/templates/kit-inicial-ios-swiftui-v1.0.1.zip" download>kit-inicial-ios-swiftui-v1.0.1.zip</a> (12 KB) |
| Angular | Módulo de pesquisa: web e WebView, com E2E em Playwright | <a href="/downloads/templates/kit-inicial-angular-v1.0.1.zip" download>kit-inicial-angular-v1.0.1.zip</a> (30 KB) |
| React | Módulo de pesquisa: web e WebView, com E2E em Playwright | <a href="/downloads/templates/kit-inicial-react-v1.0.1.zip" download>kit-inicial-react-v1.0.1.zip</a> (29 KB) |
| BFF Kotlin | BFF da pesquisa: contrato, resiliência e integração | <a href="/downloads/templates/kit-inicial-kotlin-bff-v1.0.1.zip" download>kit-inicial-kotlin-bff-v1.0.1.zip</a> (18 KB) |
| API .NET | API de eventos: contrato e integração | <a href="/downloads/templates/kit-inicial-dotnet-api-v1.0.1.zip" download>kit-inicial-dotnet-api-v1.0.1.zip</a> (10 KB) |

### Como usar um kit
1. Descompacte o conteúdo da pasta do kit na raiz do repositório da squad.
2. No `coe-test.yml`, troque "Minha Squad" pelo nome da squad e confira o produto e os canais.
3. Siga o `README.md` de `coe-tests/` para trocar a implementação de referência pelo seu código.
4. Abra o primeiro pull request com o ID da história do IU Click no título.

Para outro produto ou outra combinação de canais, gere o kit com o CLI. O passo a passo está na [página do CoE Test Framework](/qualidade/coe-test-framework).

## Configuração da squad (coe-test.yml)
Exemplos completos de `coe-test.yml` para cada tipo de squad. Servem de referência para níveis mais altos que o bronze.

| Exemplo | O que mostra | Download |
| --- | --- | --- |
| Módulo de pesquisa no Android | Squad mobile no nível prata | <a href="/downloads/templates/coe-test-exemplo-modulo-pesquisa-android-v1.0.1.yml" download>coe-test-exemplo-modulo-pesquisa-android-v1.0.1.yml</a> |
| Bankline em React | Squad web e WebView mirando o nível ouro, com perfil de plataforma web | <a href="/downloads/templates/coe-test-exemplo-bankline-react-v1.0.1.yml" download>coe-test-exemplo-bankline-react-v1.0.1.yml</a> |
| BFF Kotlin | Integração só com Testcontainers e WireMock, que roda fora da janela | <a href="/downloads/templates/coe-test-exemplo-bff-kotlin-v1.0.1.yml" download>coe-test-exemplo-bff-kotlin-v1.0.1.yml</a> |
| API de eventos em .NET | Serviço com performance, DAST e qualidade de dados | <a href="/downloads/templates/coe-test-exemplo-api-eventos-v1.0.1.yml" download>coe-test-exemplo-api-eventos-v1.0.1.yml</a> |
| SDK de Analytics no iOS | Só a suíte de bump do FullStory, disparada pelo Dependabot | <a href="/downloads/templates/coe-test-exemplo-analytics-sdk-ios-v1.0.1.yml" download>coe-test-exemplo-analytics-sdk-ios-v1.0.1.yml</a> |

## Cenários e histórias
| Template | Para quem e para quê | Download |
| --- | --- | --- |
| Modelo de história | PM: escrever a história no IU Click com cenários "dado, quando, então" e as perguntas guiadas | <a href="/downloads/templates/modelo-historia-pm-v1.0.1.md" download>modelo-historia-pm-v1.0.1.md</a> |
| Catálogo de cenários | PM e Tech Lead: catálogo de um produto novo, com IDs que o pipeline usa para medir a paridade entre canais | <a href="/downloads/templates/catalogo-cenarios-modelo-v1.0.1.yml" download>catalogo-cenarios-modelo-v1.0.1.yml</a> |
| Prompt do agente de cenários | PM: assistente de IA que lê a história no IU Click e propõe cenários para aprovação | <a href="/downloads/templates/prompt-agente-cenarios-v1.0.1.md" download>prompt-agente-cenarios-v1.0.1.md</a> |
| Definition of Done | Squad: checklist da história, do código e do fechamento do pacote | <a href="/downloads/templates/definition-of-done-v1.0.1.md" download>definition-of-done-v1.0.1.md</a> |

## Plataformas web
| Template | Para quê | Download |
| --- | --- | --- |
| Perfil de plataforma web | Cadastrar uma plataforma nova (URL, login de teste, navegadores, analytics) sem mudar o framework | <a href="/downloads/templates/perfil-plataforma-web-v1.0.1.yml" download>perfil-plataforma-web-v1.0.1.yml</a> |

## Suítes
| Template | O que tem | Download |
| --- | --- | --- |
| Suítes transversais | Privacidade e LGPD, resiliência (Toxiproxy e k6), qualidade de dados, smoke em produção, performance e segurança | <a href="/downloads/templates/suite-transversais-v1.0.1.zip" download>suite-transversais-v1.0.1.zip</a> (16 KB) |
| Suíte de bump do FullStory | Testes do wrapper no Android e no iOS, baseline e script de comparação | <a href="/downloads/templates/suite-analytics-bump-v1.0.1.zip" download>suite-analytics-bump-v1.0.1.zip</a> (7 KB) |
| Dependabot para o bump | Agrupa FullStory e BoM do Firebase no mesmo pull request de bump | <a href="/downloads/templates/dependabot-bump-fullstory-v1.0.1.yml" download>dependabot-bump-fullstory-v1.0.1.yml</a> |

Sentiu falta de algum template? [Solicite uma missão com o COE](/sobre/missoes).
