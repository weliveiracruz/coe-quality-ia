---
titulo: CoE Test Framework
area: qualidade
resumo: "Framework único de testes do CoE para as squads, com pipelines, quality gates, catálogo de cenários e portal."
versao: "1.0"
data: 2026-11-20
status: Publicada
responsavel: Wellington Cruz
---
# CoE Test Framework

## Problema
Cada squad testa de um jeito, sem padrão de qualidade, sem visibilidade de cobertura e sem QA dedicado.

## Proposta
Um framework único, modular e adaptável. A squad declara stack, produto e camadas de teste num arquivo `coe-test.yml` e recebe pipeline, quality gates e relatórios prontos.

## Escopo
- Stacks: Android (Compose), iOS (SwiftUI), BFF Kotlin, API .NET, Angular e React.
- Produtos: módulo de pesquisa (nativo, WebView e web), BFF e API de eventos.
- Suíte de bump do FullStory no SDK de Analytics.
- Suítes transversais: LGPD, resiliência, rede instável, qualidade de dados, smoke em produção, performance e segurança.
- Janela de execução das 8h às 20h (FinOps), com as suítes pesadas no fechamento do pacote.
- Integração com o IU Click via MCP, com status parametrizáveis.
- Portal web WCAG 2.2 AA.

## Critérios de aceite
- Squad nova com pipeline verde em menos de uma hora.
- Quality gate do CoE no SonarQube interno.
- Paridade entre canais visível; bloqueante no nível ouro.

## Histórico
| Versão | Data | Mudança |
| --- | --- | --- |
| 1.0 | 2026-11-20 | Primeira versão |
