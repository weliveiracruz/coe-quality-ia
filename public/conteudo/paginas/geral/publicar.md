---
titulo: Como publicar uma especificação
area: geral
resumo: Especificações entram no site por pull request no Git. Sem editor no site e sem papéis especiais.
rota: /especificacoes/publicar
---
# Como publicar uma especificação

O site é de consulta. Toda especificação nova ou alterada entra por **pull request** no repositório do COE Quality IA.

## Passo a passo
1. Crie um arquivo em `public/conteudo/especificacoes/`, com nome em minúsculas e hífens. Exemplo: `quality-radar-2026-11.md`.
2. Copie o modelo (abaixo ou no botão "Criar especificação no repositório") e preencha os metadados e as seções.
3. Use `status: Em revisão` enquanto o PR estiver aberto.
4. Abra o pull request. O CI valida os metadados, gera o índice e roda os testes de acessibilidade do site.
5. Os revisores da área (definidos no arquivo `CODEOWNERS`) aprovam.
6. Antes do merge, troque para `status: Publicada`. Depois do merge, a especificação aparece no site e em **Novidades**.

## Metadados obrigatórios

| Campo | Exemplo | Regra |
| --- | --- | --- |
| titulo | Quality Radar de novembro | Texto livre |
| area | qualidade | ia, qualidade, indicadores ou geral |
| resumo | Principais riscos de qualidade de novembro | Uma frase |
| versao | 1.0 | Nova versão a cada mudança publicada |
| data | 2026-11-20 | AAAA-MM-DD |
| status | Publicada | Rascunho, Em revisão, Publicada ou Substituída |
| responsavel | Nome da pessoa ou do time | Quem responde pela especificação |

Especificações em **Rascunho** ou **Em revisão** não aparecem no site.

## Alterar uma especificação publicada
Abra a especificação no site e use **Propor alteração**. O botão abre o editor do Git com o arquivo. Suba a versão e registre a mudança na seção "Histórico".
