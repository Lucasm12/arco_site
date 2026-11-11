# Afirmações do site que precisam de confirmação

Lista de tudo o que o site afirma sobre o produto, a empresa e o processo comercial, revisada frase por frase em 11/11/2026. Serve de checklist para produto, comercial e jurídico **antes de divulgar o site**.

Legenda:

- 🔴 **Confirmar antes de divulgar.** Funcionalidade concreta que um cliente vai testar na demonstração. Se não existir, tire do site ou reescreva como "em breve".
- 🟡 **Confirmar ou ajustar o tom.** Afirmação comparativa, de roteiro ou de processo.
- 🟢 **Ilustrativo.** Dados de exemplo nas telas (nomes, cargas, percentuais). Ficam cobertos pela nota "Telas, nomes e dados mostrados no site são ilustrativos", no rodapé.

No HTML, as afirmações 🔴 mais sensíveis têm um comentário `<!-- VALIDAR (...) -->` ao lado.

## 🔴 Funcionalidades

| # | O que o site diz | Onde | O que confirmar | Se não confirmar |
|---|---|---|---|---|
| 1 | "Funciona sem internet na academia? Sim. No modo execução, as séries ficam salvas no celular e são enviadas assim que a conexão volta." | FAQ | O app grava séries offline e sincroniza sozinho ao reconectar. | Remover a pergunta ou responder "Ainda não; está no roteiro". |
| 2 | "Integração com dispositivos: conecte relógios e cintas cardíacas e veja a intensidade de cada aluno por zona" + frequência cardíaca ao vivo (Z4 · 162 bpm, 83% da FC máx.) no hero, nos cartões e no painel | Funcionalidades, hero, painel | Quais marcas e modelos funcionam hoje (Apple Watch, Garmin, Polar, cintas Bluetooth?) e se a FC chega ao profissional **em tempo real**. | Citar só o que existe (ex.: "cintas Bluetooth") ou tirar a FC ao vivo das telas. |
| 3 | Vídeos com corrida, natação, ciclismo e treino funcional | Hero, cartões | O app atende essas modalidades (sessões de corrida, natação e ciclismo, não só musculação)? | Trocar os clipes por modalidades atendidas. O hero já tem as cenas separadas para isso. |
| 4 | "1,5 m": carga, série e descanso legíveis de longe | Faixa "Feito para ser usado no meio da série" | Medir no app real (o número vem do manual de marca, não de um teste). | Tirar o número e manter o benefício ("Números grandes, legíveis de longe"). |
| 5 | "1 toque" para concluir a série ou avisar dor | Mesma faixa + "Sentiu dor? Um toque e o profissional é avisado" | Contar os toques no fluxo real. | Trocar por "Poucos toques" ou tirar o número. |
| 6 | "AA": contraste alto (padrão WCAG) | Mesma faixa | Auditar o app (não o site) com uma ferramenta de contraste. | Tirar o item. |
| 7 | "Acompanhamento em tempo real", "sala ao vivo", "4 alunos treinando ao vivo" | Funcionalidades, hero, painel | A atualização é ao vivo (segundos) ou só depois que o aluno termina? | Trocar "ao vivo" por "assim que o aluno registra". |
| 8 | "Você é alertado na hora" quando o aluno relata dor | Funcionalidades, aba Alunos | Existe notificação push (ou outro canal) para o profissional? | Trocar por "o relato aparece no seu painel". |
| 9 | "A IA prepara treino, carga e volume a partir do histórico" e "Em que dados a IA se baseia: avaliação, objetivo, rotina, histórico de cargas e PSE de cada série. Cada sugestão mostra essa base em uma linha." | Funcionalidades, passo 2, FAQ | Quais dados a IA usa de fato e se toda sugestão mostra a justificativa. | Ajustar a lista de dados. |
| 10 | "A IA considera a sua decisão nas próximas propostas" (ao descartar) | Demonstração interativa | A IA aprende com descartes e edições? | Remover a frase. |
| 11 | "O aluno só recebe o que tem o seu aval, assinado por você, com a nota 'montado com apoio da IA'" e "Toda mudança vem explicada e assinada pelo profissional" | FAQ, aba Alunos, demonstração | Fluxo de aprovação obrigatório e o rótulo de autoria no app do aluno. | É a promessa central da marca: se não existir, revisar o posicionamento. |
| 12 | "Agenda, exercícios, mensagens e relatórios no mesmo lugar" | Funcionalidades | Cada um dos quatro existe (agenda e mensagens costumam ser os que faltam). | Citar só os que existem. |
| 13 | PSE (esforço) ao fim de cada série; evolução de carga, volume e frequência por semana; conquistas ("Bateu a meta") | Funcionalidades, aba Alunos | Registro de PSE por série e os três gráficos de evolução. | Ajustar a lista. |
| 14 | `"operatingSystem": "iOS, Android, Web"` | JSON-LD (invisível, mas lido pelo Google) | Há app publicado na App Store e na Google Play? | Deixar só o que existe (ex.: "Web, Android"). |

## 🟡 Comparações, roteiro e processo

| # | O que o site diz | Onde | O que confirmar |
|---|---|---|---|
| 15 | Apps de performance "prescrevem direto ao aluno" e acompanham "depois do treino"; sistemas de gestão têm IA "ausente ou genérica" e acompanham "por presença e mensalidade" | Diferenciais | É publicidade comparativa. Sem citar marcas, o risco é baixo, mas o Código do CONAR pede comparações objetivas e verificáveis: tenha 2 ou 3 exemplos reais anotados para cada coluna. |
| 16 | "Expansão prevista para a América Latina em espanhol" | FAQ | Está no plano? Se não estiver, responda só "Por enquanto, só em português". O JSON-LD já foi corrigido: antes declarava o site em espanhol (`"inLanguage": ["pt-BR", "es"]`). |
| 17 | "Respondemos por e-mail para combinar o dia e o horário da conversa" e "Vamos escrever para o e-mail informado" | Chamada final | Quem responde e em quanto tempo. Quando houver um prazo garantido, vale colocá-lo no passo 1 (há um TODO no HTML). |
| 18 | "Montamos um treino para o caso de um aluno seu… A IA faz a proposta ao vivo" | Chamada final, FAQ | A demonstração consegue mesmo montar uma proposta ao vivo com um caso trazido pelo profissional? |
| 19 | "Usamos seus dados só para combinar a demonstração. Sem spam." | Formulário | Tem de bater com a Política de Privacidade e com o que o comercial fizer (nada de colocar o contato em lista de newsletter sem pedido). |
| 20 | "Sem compromisso" | Hero, chamada final | A demonstração é gratuita e não exige cadastro de cartão. |

## 🟢 Dados ilustrativos (ok com a nota do rodapé)

Rafael Souza, Carla, Ana Lima, João Pedro; 62,5 kg, 4×8, PSE até 6; +6% de carga; 12 alunos ativos; 18 séries em 42 minutos; 45 minutos de treino; projeção de 67,5 kg na semana 11; "Dor no joelho · 4 de 10".

Ainda assim, evite que um número ilustrativo pareça um resultado: "+6% de carga" é um exemplo de tela, não uma promessa de ganho. Não use esses números em anúncios.

## Pontos de atenção que não são afirmações

- **Dados de saúde de terceiros na demonstração.** O texto pedia para o profissional "separar um aluno" para a demonstração. Usar avaliação, cargas e relatos de dor de um aluno identificado é tratar dado de saúde (dado sensível pela LGPD) de alguém que não consentiu. O passo 2 e a mensagem de sucesso agora dizem que não é preciso identificar o aluno. Oriente o comercial a usar casos anonimizados.
- **Nome e marca.** "Arco" é nome de trabalho: fazer a busca de anterioridade no INPI antes de investir em mídia (pendência do README).
- **Vídeos de banco (Mixkit).** Licença conferida, mas o manual pede fotografia documental. Com produção própria, as telas e os vídeos passam a provar algo, e não só a ilustrar.
