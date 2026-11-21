# Modelo de história para o PM

Copie no IU Click. Não é preciso saber nada de teste técnico: basta descrever o comportamento em português.

```
Título: <PROJETO-123> <o que muda para o cliente>

Como <tipo de cliente>
Quero <ação>
Para <benefício>

Canais: [ ] Android  [ ] iOS  [ ] WebView  [ ] Web (Bankline / outra: ____)

Cenários (um por comportamento):

Cenário: <nome curto>
  Dado <situação inicial>
  Quando <ação do cliente>
  Então <resultado esperado que dá para verificar>
  E <outro resultado, se houver>
```

## Perguntas guiadas (o que um QA perguntaria)
Responda cada uma com um cenário ou com "não se aplica":
1. **Sem conexão:** e se o cliente estiver offline ou com rede ruim?
2. **Sessão:** e se o token expirar no meio do fluxo?
3. **Erro do serviço:** e se o BFF responder erro? O que o cliente vê? Ele pode tentar de novo?
4. **Leitor de tela:** como o TalkBack ou VoiceOver anuncia cada elemento e cada mudança de estado?
5. **Fonte ampliada:** a tela funciona com fonte no máximo e zoom de 200%?
6. **Dado sensível:** o cliente pode digitar CPF, e-mail ou telefone? Isso não pode ir para o analytics.
7. **Limites:** há tamanho máximo, valor mínimo ou máximo?
8. **Desistência:** e se o cliente fechar ou voltar no meio?
9. **Repetição:** e se o cliente tocar duas vezes ou reenviar? Pode duplicar?
10. **Paridade:** o comportamento é igual em todos os canais? Se não, qual é a diferença?

## Exemplo
```
Cenário: Falha no envio permite tentar de novo
  Dado que o cliente respondeu a pesquisa
  Quando o BFF responde com erro
  Então uma mensagem de erro é exibida e anunciada pelo leitor de tela
  E o botão "Tentar novamente" reenvia a mesma resposta
```

## Boas práticas
- Um comportamento por cenário.
- O "Então" precisa ser verificável: em vez de "funciona bem", escreva "a tela de agradecimento é exibida".
- Use os termos que o cliente vê na tela ("Enviar", "Tentar novamente").
