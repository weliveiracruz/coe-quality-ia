# Definition of Done de qualidade

Uma história só está pronta quando cumpre todos os itens. O pipeline verifica a maior parte automaticamente; o que é humano está marcado.

## História
- [ ] Critérios de aceite escritos pelo PM como cenários "dado, quando, então", no modelo do CoE (`docs/modelo-historia-pm.md`). *(humano)*
- [ ] Cenários aprovados pelo PM e gravados no catálogo do produto, com o ID da história.
- [ ] Perguntas guiadas respondidas: offline, token expirado, leitor de tela, fonte ampliada, dado sensível, erro do BFF. *(humano)*

## Código e testes
- [ ] Cada cenário implementado nos canais marcados, com o ID `CEN-...` no nome do teste.
- [ ] Gate do SonarQube aprovado: cobertura do código novo ≥ 80%, nenhum bloqueante.
- [ ] Contratos sem quebra. Mudança de contrato vai no mesmo PR, revisada pelos consumidores.
- [ ] Zero violação grave de acessibilidade (axe, ATF, auditoria do XCUITest).
- [ ] Zero dado pessoal nos eventos de analytics. Campos de texto livre mascarados no FullStory.
- [ ] Nenhum teste novo instável (os que passaram só na nova tentativa aparecem no relatório).
- [ ] Revisão no PR: o Tech Lead aprova a parte técnica e o PM confere os cenários de negócio no comentário do CoE. *(humano)*

## Release (fechamento do pacote)
- [ ] Performance dentro do SLO do `coe-test.yml`.
- [ ] Nenhuma vulnerabilidade crítica (ZAP, Dependency-Check, MobSF).
- [ ] Matriz de aparelhos aprovada na device farm (mobile).
- [ ] Resiliência: canal nunca recebe 5xx bruto com a API de eventos degradada (BFF).
- [ ] Qualidade de dados: respostas de todos os canais chegam íntegras à API de eventos.
- [ ] Task movida automaticamente no IU Click para o status configurado de aprovação.
