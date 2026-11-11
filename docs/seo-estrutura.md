# SEO: estrutura de páginas e conteúdo

Escrito em 11/11/2026, junto com as mudanças de SEO da página inicial. Volumes de busca **não foram medidos**: antes de produzir as páginas, confira volume e dificuldade no Google Keyword Planner ou no Search Console (depois de algumas semanas de dados).

## O que mudou na página inicial

| Item | Antes | Depois | Por quê |
|---|---|---|---|
| `<title>` | Arco · Treino guiado por profissionais e IA (44) | **Software para personal trainer com IA · Arco** (44) | A busca principal no início do título; a marca no fim. "Treino guiado" quase não é buscado. |
| `meta description` | Arco é a plataforma de treino guiado que conecta… | **Monte treinos com apoio da IA, aprove cada ajuste e acompanhe seus alunos online, ao vivo. Para personal trainers e assessorias. Agende uma demonstração.** (153) | Benefício + público + chamada para ação, dentro dos ~155 caracteres que o Google mostra. |
| Sobretítulo do hero | Plataforma de treino guiado | **Software para personal trainers e assessorias** | Diz em 1 segundo o que é e para quem, e coloca o termo de busca no topo da página. O H1 continua sendo a assinatura da marca. |
| Funcionalidades (apoio) | …montar e acompanhar… | …montar treinos e **acompanhar alunos, na academia ou online**… | Cobre "acompanhamento de alunos online" com texto natural. |
| FAQ | 4 perguntas | 6 perguntas (+ "Dá para acompanhar alunos online, a distância?" e "Como funciona a demonstração?") | Responde a buscas e objeções reais. |
| JSON-LD | Organization, WebSite, SoftwareApplication (com espanhol) | + `FAQPage`; `SoftwareApplication` com `@id`, `url` e público; espanhol removido | Dados estruturados coerentes com a página. |
| `robots` | (padrão) | `index, follow, max-image-preview:large` | Permite imagem grande no Discover e nos resultados. |
| `og:image:type` | ausente | `image/png` | Pré-visualização mais confiável em redes sociais. |

Sobre o `FAQPage`: desde 2023 o Google mostra o resultado enriquecido de FAQ só para sites de governo e de saúde reconhecidos. A marcação continua válida e é usada por outros buscadores e por assistentes de IA, mas **não espere** o "acordeão" de perguntas no Google. O build confere se o JSON-LD bate com o texto visível (`node scripts/faq.mjs`).

## Três grupos de busca, três páginas

Uma página única não consegue ser a melhor resposta para três intenções diferentes. A recomendação é manter a home focada em "software para personal trainer" e criar duas páginas de aprofundamento, com links da home para elas.

### 1. "software para personal trainer" → página inicial (`/`)

Variações que a mesma página atende: *app para personal trainer*, *sistema para personal trainer*, *plataforma para personal trainer*, *programa para montar treino*.

- **Intenção:** comercial. O profissional está comparando ferramentas.
- **H1 (marca):** A IA propõe. Você decide. Seu aluno evolui. (o sobretítulo carrega a palavra-chave)
- **Seções que faltam para ranquear melhor:**
  - "Para quem é" (personal, assessoria de corrida e triatlo, estúdio), com uma linha de benefício para cada um.
  - "Do Excel e do WhatsApp para o Arco": como migrar planilhas e alunos (só se o produto tiver importação; ver `afirmacoes-para-validar.md`).
  - Preço ou "a partir de" (TODO comercial). Páginas de software sem preço perdem cliques para quem mostra.
  - Prova social (seção pronta em rascunho, `#resultados`).
- **Schema:** `SoftwareApplication` (com `offers` quando houver preço), `Organization`, `FAQPage`.

### 2. "app de treino com IA" → `/ia` (sugestão: `ia.html` ou `/app-de-treino-com-ia`)

- **Intenção mista.** Parte de quem busca é **aluno** querendo um app grátis que monte treino sozinho. A página precisa acolher os dois públicos:
  - Profissional: como a IA ajuda sem tirar a decisão dele.
  - Aluno: "No Arco, a IA trabalha com o seu treinador", com o link "Indique o Arco ao seu treinador" (o fluxo de indicação já existe na home).
- **H1:** "App de treino com IA que respeita o método do treinador"
- **H2 sugeridos:**
  1. O que a IA faz (e o que não faz)
  2. Em que dados ela se baseia (avaliação, histórico de cargas, PSE)
  3. Por que toda sugestão passa pelo profissional
  4. O que o aluno vê
  5. Segurança: dor, esforço e limites
  6. Perguntas frequentes sobre IA no treino
- **Conteúdo-âncora:** a demonstração interativa da home (`#ia`) pode ser reaproveitada aqui.
- **Schema:** `WebPage` + `FAQPage` + `BreadcrumbList`.

### 3. "acompanhamento de alunos online" → `/acompanhamento-online`

Variações: *consultoria online de treino*, *como acompanhar aluno a distância*, *personal online*.

- **Intenção:** informacional a comercial. Muitos são personal trainers montando uma consultoria online.
- **H1:** "Acompanhamento de alunos online, série a série"
- **H2 sugeridos:**
  1. O problema do acompanhamento por WhatsApp e planilha
  2. Sala ao vivo: quem está treinando agora
  3. Esforço (PSE) e relatos de dor em tempo real
  4. Relógios e cintas cardíacas (só os compatíveis confirmados)
  5. Relatórios de evolução para o aluno renovar
  6. Como montar sua consultoria online com o Arco (passo a passo)
- **Schema:** `WebPage` + `HowTo` (no passo a passo) + `FAQPage`.

## Conteúdo de apoio (blog ou guias)

Artigos que respondem a dúvidas do dia a dia do profissional e levam às três páginas acima:

| Artigo | Leva para |
|---|---|
| Como montar uma consultoria online de treino (guia completo) | `/acompanhamento-online` |
| PSE: o que é a escala de esforço e como usar no treino | `/ia` |
| Zonas de frequência cardíaca: guia para treinadores | `/acompanhamento-online` |
| Planilha de treino × app: quando migrar | `/` |
| IA na prescrição de treino: o que muda para o personal (e o que não muda) | `/ia` |
| Como reduzir a desistência de alunos com dados de evolução | `/` |

Atenção ao conteúdo de saúde: textos sobre esforço, dor e frequência cardíaca são YMYL ("your money or your life") para o Google. Assine os artigos com um profissional de educação física (nome + CREF) e cite as fontes.

## Técnico, para cada página nova

- Um `<h1>` por página; `<title>` e `description` únicos; `canonical` próprio.
- Incluir no `sitemap.xml` e linkar a partir da home (seção, menu ou rodapé) e entre as páginas.
- Imagem de compartilhamento (`og:image`) própria, 1200×630.
- O build (`npm run build`) já minifica e versiona CSS e JS de qualquer HTML que use os marcadores `<!-- build:css -->` e `<!-- build:js -->`. Copie o `<head>` da `politica-de-privacidade.html` como modelo.
- Depois de publicar: cadastrar o domínio definitivo no Google Search Console, enviar o sitemap e acompanhar as consultas reais por 4 a 8 semanas antes de criar mais páginas.
