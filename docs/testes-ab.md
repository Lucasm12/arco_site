# Testes A/B do hero: título e CTA

Três variações para testar contra o título atual. Cada uma testa **uma hipótese diferente**, então o resultado ensina algo mesmo quando a variação perde.

> Regra para todas as variações: nada de números ou promessas que o produto ainda não comprovou (ex.: "monte treinos em 5 minutos"). Se quiser testar uma promessa de tempo, meça antes com usuários reais.

## Controle (A), no ar hoje

| | |
|---|---|
| **Sobretítulo** | Software para personal trainers e assessorias |
| **Título** | A IA propõe. Você decide. Seu aluno evolui. |
| **Apoio** | O Arco conecta personal trainers e alunos: treinos com apoio da IA, acompanhamento ao vivo e evolução medida em números. |
| **CTA** | Agendar demonstração |

Ponto forte: memorável, resume a marca. Risco: é abstrato. Quem chega pela busca pode não entender em 5 segundos *o que* é e *para quem* é (o sobretítulo novo ajuda nisso).

## Variação B: clareza de categoria

| | |
|---|---|
| **Título** | O app de treino com IA feito para personal trainers. |
| **Apoio** | A IA monta a proposta, você revisa e publica, e acompanha cada aluno ao vivo. |
| **CTA** | Ver o Arco com um aluno meu |

**Hipótese:** dizer a categoria e o público no título reduz a dúvida "isso é para mim?" e aumenta o início do formulário, principalmente no tráfego de busca e de anúncio.
**Risco:** perde a assinatura da marca; pode atrair alunos que procuram "app de treino com IA" para uso próprio (acompanhe o volume de indicações de aluno).

## Variação C: dor operacional

| | |
|---|---|
| **Título** | Menos planilha. Mais tempo para cada aluno. |
| **Apoio** | A IA prepara a proposta de treino a partir do histórico. Você ajusta, aprova e acompanha ao vivo. |
| **CTA** | Quero ver na prática |

**Hipótese:** o personal compra tempo, não IA. Falar da dor (planilha, retrabalho) converte mais que falar da tecnologia.
**Risco:** soa genérico se a dor não for a principal do público. Confirme em entrevistas antes, se possível.

## Variação D: controle e autoria

| | |
|---|---|
| **Título** | A IA faz o rascunho. A assinatura é sua. |
| **Apoio** | Nada chega ao aluno sem a sua aprovação, e tudo leva o seu nome. |
| **CTA** | Montar um treino na demonstração |

**Hipótese:** a maior objeção do profissional é "a IA vai me substituir ou tirar meu valor". Responder a isso no título reduz a resistência.
**Risco:** ao responder a uma objeção que o visitante ainda não tinha, você pode criá-la.

## Como medir

- **Métrica principal:** pedidos completos por visitante (`form_submit` com `formulario = demonstracao`).
- **Secundárias:** início do formulário do hero (`form_start`, `formulario = hero`), pedidos rápidos (`form_submit`, `formulario = hero`), cliques em CTA (`cta_click`).
- **Proteção (guardrail):** qualidade do pedido. Compare a proporção de pedidos com "De 11 a 30" alunos ou mais entre as variações. Uma variação que traz mais pedidos, só que piores, não vence.
- Os eventos já existem (ver `docs/relatorio-melhorias.md`, tarefa 6). Para o teste, acrescente a propriedade `variante` aos eventos e um campo oculto `variante` nos dois formulários.

## Quanto tráfego é preciso

Visitantes **por variante**, com significância de 5% e poder de 80% (teste bicaudal de duas proporções):

| Conversão atual | Para detectar +20% | +30% | +50% |
|---|---|---|---|
| 1% | 42.693 | 19.827 | 7.750 |
| 2% | 21.109 | 9.798 | 3.826 |
| 3% | 13.914 | 6.455 | 2.518 |
| 5% | 8.158 | 3.780 | 1.471 |

Com 2% de conversão, testar as 4 versões ao mesmo tempo exige cerca de 40 mil visitantes para ver um efeito de +30%. Por isso:

1. **Com pouco tráfego (menos de ~10 mil visitas/mês):** teste uma variação por vez contra o controle, comece pela B (a mudança maior) e deixe rodar no mínimo 2 semanas inteiras (ciclo semanal completo). Antes disso, um teste de 5 segundos com 10 a 15 personal trainers ("o que é este produto? para quem?") já indica qual título comunica melhor.
2. **Não encerre o teste no primeiro dia em que a diferença parecer significativa.** Defina o tamanho da amostra antes e só olhe o resultado no fim.

## Como implementar sem "piscar" a página

O título é o maior texto da primeira tela. Trocá-lo por JavaScript depois do carregamento causa salto de layout e piora o LCP. Opções, da melhor para a pior:

1. **Vercel Edge Middleware:** sorteia a variante no primeiro acesso, grava um cookie e serve o HTML da variante já pronto (o build pode gerar `index-b.html`, `index-c.html`…).
2. **Ferramenta de experimentos com SDK no servidor/edge** (GrowthBook, PostHog, Statsig).
3. **Script no `<head>` antes da pintura**, com as variações no HTML e só uma visível via atributo no `<html>` (funciona, mas deixa o texto das variações no HTML que o Google lê).
