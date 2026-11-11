# Relatório das melhorias (v2.1, 11/11/2026)

Objetivo da página: **pedidos de demonstração qualificados** de personal trainers, treinadores e assessorias. Cada tarefa abaixo traz o que mudou, por que e o impacto esperado. Nada foi inventado: números, depoimentos, contatos e dados da empresa que o time ainda não definiu ficaram como TODO explícito, ocultos para o visitante ou marcados como "a definir".

Documentos de apoio:

- [afirmacoes-para-validar.md](afirmacoes-para-validar.md): tudo o que o site afirma sobre o produto, com o que confirmar.
- [testes-ab.md](testes-ab.md): 3 variações de título e CTA, métricas e tamanho de amostra.
- [seo-estrutura.md](seo-estrutura.md): mudanças de SEO e estrutura de páginas para as três buscas.

---

## 1. Bloqueadores de lançamento

### 1a. Domínio

- **O que mudou:** `arco.example` (domínio que não existe) deu lugar a `https://arcosite.vercel.app`, o endereço publicado hoje, no canonical, no Open Graph, no JSON-LD, no `robots.txt` e no `sitemap.xml`. O script `scripts/trocar-dominio.mjs` troca para o domínio definitivo em todos os arquivos com um comando (também na forma codificada usada no link de indicação).
- **Por quê:** um canonical apontando para um domínio inexistente diz ao Google que a página verdadeira está em outro lugar, e pode tirar a página do índice. Previews no WhatsApp e no LinkedIn também quebravam (`og:image` em `arco.example`).
- **Impacto:** a página pode ser indexada e compartilhada desde já; a troca futura leva segundos.

### 1b. Formulário conectado

- **O que mudou:**
  - Um único arquivo de configuração, `assets/js/config.js`. O `formEndpoint` aceita Formspree, Basin ou endpoint próprio (POST com `FormData` e `Accept: application/json`).
  - **Estado de envio:** o botão mostra "Enviando…" com um anel girando e usa `aria-disabled`, para o foco continuar nele. Um segundo clique não reenvia, e a região de status anuncia o envio ao leitor de tela.
  - **Erros por tipo:** rede, tempo esgotado (15 s), excesso de tentativas (429) e servidor, cada um com uma mensagem própria e com o contato alternativo (WhatsApp ou e-mail, se configurados).
  - **Antispam:** honeypot `_gotcha` (nome que o Formspree reconhece), fora da tela e fora da ordem de tabulação. Quando o campo vem preenchido, o envio é bloqueado no navegador e o robô vê um falso sucesso.
  - **Atribuição:** cada envio leva `origem` (hero ou chamada final), a página e as UTMs da visita, guardadas na sessão.
  - **Sem endpoint**, o envio é simulado só em `localhost`. No ar, o visitante vê o erro, em vez de um "Pedido recebido" falso.
- **Por quê:** antes, o formulário sempre simulava o sucesso. Todo pedido feito no site publicado era perdido sem que ninguém soubesse.
- **Impacto:** nenhum lead perdido em silêncio, menos spam, e a origem de cada pedido fica conhecida (por campanha).

### 1c. Política de Privacidade (LGPD)

- **O que mudou:**
  - Nova página `politica-de-privacidade.html`, com resumo em 4 pontos, controlador, dados coletados, finalidade × base legal (art. 7º), operadores, transferência internacional, retenção (inclui os 6 meses do Marco Civil), direitos (art. 18), encarregado, cookies e itens guardados no navegador, segurança, menores e mudanças.
  - Os campos que só a empresa pode preencher aparecem como **[a definir]**, destacados em amarelo.
  - A página fica com `noindex` até a revisão jurídica.
  - O formulário completo ganhou a caixa obrigatória "Li a Política de Privacidade e concordo…", e a data e hora do aceite são registradas no envio. O pedido rápido traz o aviso com link.
  - Link para a política no rodapé.
- **Por quê:** coletar nome, e-mail e telefone sem política publicada descumpre a LGPD (art. 9º, transparência). A caixa foi pedida no briefing. A base legal principal para responder ao pedido é o art. 7º, V, por isso o pedido rápido não precisa da caixa.
- **Impacto:** remove um risco jurídico do lançamento e dá confiança a quem hesita em deixar o contato.

### 1d. Contatos e redes no rodapé

- **O que mudou:** e-mail, WhatsApp, Instagram, LinkedIn e YouTube no rodapé, preenchidos pelo `config.js`. Cada item só aparece quando tem valor. O mesmo WhatsApp alimenta o CTA do hero e as mensagens de erro e de sucesso.
- **Por quê:** nenhum contato foi informado no briefing, e publicar contato provisório é pior que não ter nenhum.
- **Impacto:** quando preenchidos, os contatos dão credibilidade (empresa com canais reais) e um caminho para quem não quer preencher formulário.

---

## 2. Conversão

- **Pedido rápido no hero:** o botão do hero virou um formulário de um campo (e-mail + "Agendar demonstração"). O sucesso convida a "Completar meu pedido", leva o cursor ao campo Nome do formulário completo e chega com o e-mail já preenchido.
  - *Por quê:* o pedido de demonstração era o único caminho e ficava no fim da página. Quem decide logo no topo não precisa rolar, e um e-mail já é um lead que o comercial pode retomar.
  - *Impacto esperado:* mais pedidos iniciados na primeira tela. A qualificação continua garantida pelo formulário completo, e os dois envios chegam com `origem` diferente.
- **CTA secundário de baixa fricção:** "Prefere conversar? Chame no WhatsApp", no hero e nas mensagens de sucesso e de erro. Aparece quando o número for configurado. "Ver como funciona" virou um link.
- **Prova social (`#resultados`):** seção pronta com espaços para 3 números, 3 depoimentos e 5 logos, todos como TODO, **oculta** para o visitante. Veja com `?rascunho` na URL: ela aparece com uma moldura "Rascunho · fora do ar". Nenhum dado foi inventado.
- **Formulário qualificado:**
  - Saiu "Aluno" do seletor de perfil.
  - Entrou "Quantos alunos você atende hoje?" (obrigatório, em faixas) e "WhatsApp ou telefone" (opcional, com validação de DDD).
  - O aluno ganhou um caminho próprio: "É aluno? Indique o Arco para ele", com compartilhamento nativo no celular e WhatsApp no computador, e com UTM `utm_source=indicacao` para medir as indicações. O mesmo convite aparece na aba "Para alunos".
- **"O que acontece depois de enviar":** três passos numerados ao lado do formulário (respondemos por e-mail; montamos um treino para o caso de um aluno seu; você decide, sem compromisso). O prazo de resposta e o formato da conversa ficaram como TODO, porque não foram informados.
  - *Por quê:* incerteza sobre o que vem depois é uma das principais causas de abandono em formulários de demonstração.
- **Testes A/B:** 3 variações de título e CTA (clareza de categoria, dor operacional, controle e autoria), cada uma com hipótese, risco, métricas e tamanho de amostra: [testes-ab.md](testes-ab.md).

---

## 3. Conteúdo e credibilidade

- **Afirmações verificáveis:** 20 itens listados e classificados (🔴 confirmar antes de divulgar, 🟡 confirmar ou ajustar o tom, 🟢 ilustrativo), em [afirmacoes-para-validar.md](afirmacoes-para-validar.md). As mais sensíveis têm um comentário `<!-- VALIDAR -->` no HTML.
- **Correção já aplicada:** o JSON-LD dizia que o site estava em espanhol (`"inLanguage": ["pt-BR", "es"]`), contradizendo o FAQ ("expansão prevista").
- **De especificação para benefício:**
  - "1,5 m · distância de leitura dos números no modo execução" → "Carga, série e descanso legíveis de longe, com o celular apoiado no banco."
  - "64 px · botões pensados para a mão suada" → "1 toque · para concluir a série ou avisar que sentiu dor, mesmo com a mão suada."
  - "AA · contraste mínimo" → "Contraste alto (padrão WCAG) para ler sob o sol da pista ou na luz baixa da academia."
  - Funcionalidades: "zonas de Z1 a Z5 nas cores que os wearables já usam" → "veja a intensidade de cada aluno por zona, sem pedir print da tela"; "conquistas sem exagero" → "o aluno vê o progresso e ganha motivo para continuar"; e assim por diante nos seis cartões.
- **Texto alternativo:** posters com informação ganharam descrição: personal orientando o agachamento, treinador acompanhando a corrida, relógio no pulso e aluna com kettlebell. O fundo do hero, a corrida em dupla e a esteira continuam com `alt=""`, porque são ambientais e o texto ao lado já diz tudo. A legenda oculta duplicada do vídeo "relação" saiu.
- **Honestidade sobre as telas:** nota no rodapé, "Telas, nomes e dados mostrados no site são ilustrativos".
- **LGPD na demonstração:** o texto pedia para o profissional "separar um aluno". Agora deixa claro que não é preciso identificá-lo, o que evita tratar dado de saúde de terceiros sem consentimento.

---

## 4. SEO

Detalhes em [seo-estrutura.md](seo-estrutura.md).

- `<title>`: **Software para personal trainer com IA · Arco**. `description` com benefício, público e CTA (153 caracteres).
- Sobretítulo do hero com a palavra-chave ("Software para personal trainers e assessorias"); o apoio das funcionalidades agora cita acompanhamento online.
- 2 perguntas novas no FAQ, que respondem a buscas reais sem inventar nada.
- JSON-LD `FAQPage` gerado a partir do texto visível (`npm run faq`). O build falha se os dois divergirem.
- `SoftwareApplication` com `@id`, `url` e público; `robots` com `max-image-preview:large`; `og:image:type`.
- Estrutura proposta: home para "software para personal trainer", `/ia` para "app de treino com IA" (intenção mista, com acolhimento do aluno) e `/acompanhamento-online`, mais 6 pautas de conteúdo de apoio.

---

## 5. Desempenho

**Medição.** Lighthouse 12.6, mediana de 3 execuções, perfil mobile (4G lento simulado, CPU 4×) e desktop. "Antes" é o commit `0d38790`, "depois" é o `dist/` desta versão, os dois servidos pela mesma máquina com brotli, para comparar nas mesmas condições.

| | Antes (mobile) | Depois (mobile) | Antes (desktop) | Depois (desktop) |
|---|---|---|---|---|
| Desempenho | 61 | **77** | 86 | **94–99** |
| First Contentful Paint | 3,31 s | **1,41 s** (−57%) | 1,37 s | **0,52 s** |
| Largest Contentful Paint | 3,39 s | **2,74 s** (−19%) | 1,37 s | **0,78 s** (−43%) |
| Speed Index | 4,78 s | **2,95 s** | 2,32 s | **1,45 s** |
| Cumulative Layout Shift | 0,008 | **0** | 0,083 | **0** |
| Peso total transferido | 1.327 KB | **849 KB** (−36%) | 2.455 KB | **1.741 KB** (−29%) |
| Acessibilidade · Boas práticas · SEO | 100 · 100 · 100 | 100 · 100 · 100 | 100 · 100 · 100 | 100 · 100 · 100 |

No site publicado (Vercel, antes das mudanças), a linha de base no mobile era desempenho 80, FCP 3,6 s e LCP 3,76 s. O Lighthouse apontava o CSS do Google Fonts como o maior bloqueio da renderização (cerca de 2 s de economia estimada). Em Chrome real, com CPU 4× mais lenta e mediana de 9 carregamentos, o FCP foi de 824 para 404 ms e o LCP de 1.496 para 1.128 ms.

> O TBT (tempo de bloqueio) local variou muito entre execuções, nas duas versões (de 50 a 1.400 ms), e não foi usado na comparação. Confira no PageSpeed Insights depois do deploy.

**O que ainda limita o LCP no celular.** Depois de tirar o bloqueio de rede, sobrou trabalho de *layout* na primeira pintura: cerca de 1 s com CPU 4× no "antes", **443 ms** no "depois". O poster já chega em ~170 ms. Próximos passos, se for preciso ir além: reduzir o número de tokens CSS aplicados no `:root` (835 propriedades herdadas por todos os elementos) e trocar `text-wrap: pretty` por `balance` só nos títulos.

- **Seções fora da tela sob demanda:** `content-visibility: auto` em todas as seções abaixo do hero e no rodapé. O navegador só calcula estilo e layout delas quando se aproximam da tela. No mobile, o LCP caiu de 2,94 para 2,74 s, e o layout antes da primeira pintura caiu 57%. As âncoras do menu continuam parando no lugar certo (16 px abaixo do cabeçalho em todas as seções, testado em 390 e 1440 px).

- **Fontes no próprio site:** saem o Google Fonts (CSS de terceiro que bloqueava a primeira pintura) e as conexões extras. Entram woff2 locais (latin + latin-ext, versão sem *hinting*, a mesma que o Google serve para Android e Mac), com `font-display: swap`, *preload* das duas fontes do topo e licenças OFL junto dos arquivos. Bônus de LGPD: o IP do visitante deixa de ir para o Google.
- **Hero mais leve:** o loop foi de 15,5 s para 9,5 s, com as **mesmas 5 cenas** (corrida, natação, personal, ciclismo, funcional), fusões de 0,4 s e fusão final para o primeiro quadro, como antes, então o poster continua igual. Recodificado em VP9 em 2 passadas (SSIM ≈ 0,95 em relação ao original):

  | | antes | depois |
  |---|---|---|
  | hero.webm (desktop) | 1,71 MB | 0,99 MB (−42%) |
  | hero-mobile.webm | 0,99 MB | 0,56 MB (−43%) |
  | hero.mp4 (Safari antigo) | 2,10 MB | 1,06 MB (−50%) |
  | hero-mobile.mp4 | 1,11 MB | 0,64 MB (−43%) |

  O vídeo não é o elemento de LCP (o poster é), mas era 75% do peso da página no celular.
- **Conexão lenta:** em 2G/3G ou com economia de dados, nenhum vídeo toca sozinho; fica o poster, e o botão oferece "Reproduzir".
- **Build (`npm run build`) e `vercel.json`:**
  - CSS e JS juntados e minificados em um arquivo cada (de 5 CSS + 2 JS para 1 + 1), com hash no nome.
  - Imagens, vídeos e fontes com `?v=hash`.
  - Cache de 1 ano (`immutable`) em `/assets/*`, que é seguro porque toda URL muda quando o arquivo muda.
  - Cabeçalhos de segurança (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
  - Os comentários internos do HTML não vão ao ar.

---

## 6. Medição

- **Consentimento:** aviso não bloqueante, com "Aceitar" e "Recusar" do mesmo tamanho e cor (a ANPD desaconselha destacar só o aceite).
  - Nenhum script de terceiros carrega antes do aceite.
  - A escolha vale 12 meses e pode ser revista em "Preferências de privacidade" (rodapé e política).
  - Recusar depois de aceitar apaga os cookies `_ga*`.
  - O sinal Global Privacy Control é respeitado: com ele ligado, não há medição nem pergunta.
  - O aviso fixo reserva espaço de rolagem para não cobrir o campo em foco (WCAG 2.4.11).
- **Provedor:** Plausible (sem cookies) ou GA4, escolhido em `config.js`. Sem provedor, não há aviso nem medição.
- **Eventos:**

  | Evento | Quando | Propriedades |
  |---|---|---|
  | `cta_click` | clique em qualquer "Agendar demonstração" | `local` (cabecalho, menu, perguntas, rodape, hero-sucesso…), `texto` |
  | `form_start` | primeira interação com um formulário | `formulario` (hero, demonstracao) |
  | `form_submit` | envio aceito pelo servidor | `formulario`, `perfil`, `alunos` |
  | `form_error` | erro de validação ou de envio | `formulario`, `motivo` (validacao, rede, tempo, limite, servidor) |
  | `tab_open` | troca de aba em "Acompanhamento" | `aba` (pro, aluno) |
  | `faq_open` | abertura de uma pergunta | `pergunta` |
  | `whatsapp_click`, `contact_click` | clique em WhatsApp, e-mail ou rede | `local`, `canal` |
  | `share_click` | aluno indica o Arco ao treinador | `local`, `metodo` |

  Nenhum evento leva nome, e-mail ou telefone. Em `localhost` ou com `?debug-analytics`, cada evento aparece no console.
- **Funil sugerido:** visita → `form_start` (hero) → `form_submit` (hero) → `form_submit` (demonstracao). Marque `form_submit` como conversão no GA4 ou como meta no Plausible.

---

## Checklist de QA

Para repetir a cada deploy (na URL de preview da Vercel ou em `npm run preview`). Na v2.1, os itens marcados foram verificados de forma automatizada (Chrome headless, puppeteer e axe-core 4.10). Resultado na seção seguinte.

### Lighthouse (aba anônima, modo mobile e desktop)

- [x] Desempenho: comparar com a linha de base (tabela da tarefa 5). Atenção ao LCP no mobile (elemento: poster do hero).
- [x] Acessibilidade, Boas práticas e SEO = 100.
- [ ] Repetir 3 vezes e usar a mediana; a variação entre execuções é grande.
- [ ] Depois de publicar: PageSpeed Insights na URL real (dados de campo do Chrome UX Report aparecem com tráfego).

### axe (extensão axe DevTools ou `axe-core`)

- [x] Home em 390 px (escuro) e 1440 px (claro), com as duas abas de "Acompanhamento".
- [x] Formulários com erros de validação visíveis + aviso de privacidade aberto + prova social em rascunho.
- [x] Política de Privacidade em 390 e 820 px.
- [ ] Teste manual com leitor de tela (NVDA no Windows ou VoiceOver no iPhone): enviar os dois formulários com erro e com sucesso e ouvir os anúncios.

### Larguras 390 / 820 / 1440 px (temas claro e escuro)

- [x] Sem rolagem horizontal; sem erros no console.
- [ ] Hero: e-mail e botão na mesma linha a partir de 480 px; empilhados abaixo disso. O sucesso cabe sem cortar o texto.
- [ ] "O que acontece depois de enviar": números e linha alinhados; o formulário não fica mais alto que a coluna de texto em 1440 px.
- [ ] Rodapé: com contatos configurados, e-mail longo quebra sem estourar a coluna.
- [ ] Aviso de privacidade: não cobre o botão do formulário no celular; ao navegar com Tab, o campo em foco fica visível acima do aviso.

### Comportamento

- [x] Pedido rápido: vazio, e-mail inválido, sucesso, foco no sucesso, e-mail levado ao formulário completo, "Completar meu pedido" leva ao campo Nome.
- [x] Formulário completo: erros nos 4 obrigatórios, telefone curto recusado, "Enviando…", clique duplo não duplica, 429, falha de rede, sucesso com foco.
- [x] O POST leva origem, página, UTMs, consentimento com data e honeypot vazio; com o honeypot preenchido, nada é enviado.
- [x] Consentimento: nada carrega antes; recusar fecha e é lembrado; "Preferências de privacidade" reabre; aceitar carrega o provedor e os eventos chegam.
- [x] Contatos aparecem só quando configurados; prova social só com `?rascunho`.
- [x] "Reduzir movimento": nenhum vídeo baixado; vídeos com `?v=` no build; nada do Google Fonts.
- [ ] Com o endpoint real: enviar um pedido de teste e conferir se chega ao e-mail ou painel do provedor, com o assunto "Pedido de demonstração · Arco".
- [ ] Com o provedor de medição real: aceitar e ver os eventos no painel em tempo real (GA4: DebugView; Plausible: Realtime).
- [ ] Celular real (Android e iPhone): o compartilhamento nativo do "Indique o Arco para ele" abre e leva o link com UTM.

### Resultado da verificação automatizada (11/11/2026)

**64 de 64 verificações passaram** (Chrome 157 headless, puppeteer-core 24, axe-core 4.10, regras WCAG 2.0–2.2 A/AA):

- **Layout** em 390 (claro e escuro), 820 e 1440 px (claro e escuro): sem rolagem horizontal e sem erro no console.
- **axe sem nenhuma violação:**
  - home em 390 px (escuro) e 1440 px (claro), com as duas abas;
  - política em 390 e 820 px;
  - home com erros de validação visíveis, aviso de privacidade aberto e prova social em rascunho.
- **Formulários:** 20 verificações, incluindo honeypot, 429, falha de rede, clique duplo e o conteúdo exato do POST.
- **Consentimento e eventos:** 11 verificações, incluindo nada carregado antes do aceite e eventos com o `local` certo.
- **Contatos, rascunho, indicação, vídeos, fontes e página da política:** 14 verificações.
- **Âncoras do menu** com `content-visibility`: todas as 7 seções alinhadas em 390 e 1440 px.
- **Build × código-fonte:** capturas de 8 seções em 390 (escuro) e 1440 px (claro) com SSIM 1,0000. A minificação não muda nada na tela.

Não verificado (depende de configuração real ou de aparelho): envio real ao provedor de formulário, eventos chegando a um painel de analytics, compartilhamento nativo em celular, leitores de tela reais e o deploy na Vercel (o build e o `vercel.json` foram testados só localmente).
