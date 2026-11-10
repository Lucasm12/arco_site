# Arco · site institucional

Landing page da plataforma Arco, construída sobre o manual de marca ([../Identidade Visual/manual-arco.html](../Identidade%20Visual/manual-arco.html)) e os design tokens ([../Identidade Visual/arco-tokens.css](../Identidade%20Visual/arco-tokens.css)).

HTML, CSS e JavaScript puros: sem build, sem dependências e sem framework.

> **Versão 2 (nov/2026).** Reformulação com menos texto (texto de marketing de 1.511 para 720 palavras, −52%), vídeos de atividades físicas e mais telas do produto. A versão anterior está no commit `1ff37a2` deste repositório (e, na máquina de desenvolvimento, em `../Site-v1-backup-2026-11-10/`).

## Rodar localmente

```bash
cd Site
python -m http.server 8080
# abra http://localhost:8080
```

Abrir o `index.html` direto também funciona; só o `site.webmanifest` exige HTTP.

## Estrutura

```
Site/
├── index.html              Página única, com o sprite SVG (símbolo e ícones do manual)
├── assets/
│   ├── css/
│   │   ├── tokens.css      Cópia de Identidade Visual/arco-tokens.css (não editar aqui)
│   │   ├── base.css        Reset, tokens --site-*, escopos .surface-dark e .surface-light, tipografia
│   │   ├── components.css  Botões, chips, mídia (vídeo + pausa), celular, cartão da IA, gráficos, formulário, abas, acordeão
│   │   └── sections.css    Layout de cada seção, na ordem da página
│   ├── js/main.js          Interações, um módulo init* por recurso
│   ├── video/              Vídeos (WebM VP9 + MP4 H.264) e posters WebP
│   └── img/                favicon.svg, ícones PNG e og-image.png
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

## Seções

| # | Âncora | Conteúdo | Recurso visual |
|---|--------|----------|----------------|
| 01 | topo | Hero: "A IA propõe. Você decide. Seu aluno evolui." | Montagem em vídeo (corrida, natação, orientação, ciclismo, funcional) + celular no modo execução |
| 02 | `#plataforma` | O que é: IA → Profissional → Aluno | Vídeo de um profissional corrigindo o agachamento + trilha tracejada/sólida |
| 03 | `#funcionalidades` | Seis funcionalidades em cartões | 4 vídeos curtos com a interface por cima + 2 interfaces animadas |
| 04 | `#como-funciona` (passo 2 = `#ia`) | Três passos com trilha de progresso | Ficha do aluno, demonstração interativa da IA, vídeo + notificação de evolução |
| 05 | `#beneficios` | Acompanhamento: abas "Para profissionais" e "Para alunos" | Painel do profissional e app do aluno, com contadores e gráficos animados |
| 06 | `#diferenciais` (também `#problema`) | Comparativo e números do produto | Arco ao centro, entre "apps de performance" e "sistemas de gestão" |
| 07 | `#demonstracao` | Chamada final com formulário | Raia olímpica (moodboard do manual) sob véu petróleo |
| 08 | `#perguntas` | Perguntas frequentes (4) | — |

O que mudou em relação à versão 1 (sem perda de informação):

- **Problema** foi absorvido: cada dor virou uma funcionalidade, um benefício ou uma linha do comparativo.
- **IA com autoria** virou o passo 2 de "Como funciona", com a mesma demonstração interativa (âncora `#ia` mantida).
- **Benefícios** viraram a faixa "Acompanhamento", com as mesmas abas, agora ao lado das telas do produto.
- **Pilares**, **manifesto** e repetições de "a IA sugere, o profissional aprova" foram removidos; a ideia aparece no título, no "O que é", no passo 2 e no FAQ.

## Vídeos

Todos os vídeos são decorativos, mudos, em loop e sem áudio. O comportamento fica em `initMedia` (`main.js`):

- O **poster** é uma `<img>` comum: aparece sem JS, com "reduzir movimento" e com economia de dados ativa.
- As fontes só são inseridas quando o vídeo chega perto da tela (400 px); ele toca quando ao menos 20% está visível e pausa fora da tela ou com a aba em segundo plano.
- Cada vídeo tem um botão **Pausar/Reproduzir** (WCAG 2.2.2). Com "reduzir movimento", nada toca sozinho; o botão oferece "Reproduzir".
- O hero usa uma versão vertical (`hero-mobile`, 9:16) abaixo de 768 px.
- O navegador escolhe WebM (VP9) e recorre ao MP4 (H.264, `faststart`) quando não suporta WebM. Na calibração, o VP9 ficou ~15% menor que o H.264 com qualidade superior (SSIM 0,974 × 0,964).

Tratamento de cor aplicado a todos os clipes, conforme o manual (§6.5): sombras puxadas para petróleo, realces levemente quentes, saturação −10% e contraste médio. Isso unifica os clipes e os afasta da aparência de banco de imagem. Os loops terminam com um *crossfade* para o primeiro quadro, então a emenda não aparece.

| Arquivo | Uso | Peso (WebM) |
|---|---|---|
| `hero` / `hero-mobile` | Montagem do hero, 15,5 s | 1,6 MB / 0,9 MB |
| `relacao` | O que é o Arco | 0,4 MB |
| `ao-vivo`, `evolucao`, `esforco`, `dispositivos` | Cartões de funcionalidades | 0,15–0,28 MB cada |
| `execucao` | Como funciona, passo 3 | 0,16 MB |
| `raia.webp` | Fundo da chamada final (imagem estática) | 22 KB |

### Origem e licença

Clipes do [Mixkit](https://mixkit.co), todos sob a **Mixkit Stock Video Free License**: uso comercial permitido, sem atribuição obrigatória. Cada licença foi conferida na página do vídeo. O Mixkit também tem uma licença *Restricted* (só uso pessoal); antes de trocar um clipe, confirme que o novo é "Free".

| Arquivo | Clipe(s) Mixkit |
|---|---|
| `hero` | 609 Runner on a track in slow motion · 33192 Swimmer practicing in the pool · 47462 Personal trainer working with client · 40864 A woman on a bicycle starts on a cycling track · 52104 A young woman … launching a black ball towards the wall |
| `relacao` | 23914 A trainer helps a woman with the squats training |
| `ao-vivo` | 8889 Trainer motivates athlete on running track |
| `evolucao` | 32813 Pair of man and woman athletes running on a track |
| `esforco` | 100525 Woman exercising on a treadmill in a gym |
| `dispositivos` | 47881 Young fit man checking his smart watch as he runs on the treadmill |
| `execucao` | 52106 A young woman … performs squats holding a russian dumbbell |
| `raia.webp` | 38813 Girl skillfully swimming in an olympic pool |

### Trocar por vídeos próprios

O manual pede fotografia documental: treino real, correção de postura, conversa entre séries, diversidade de corpos e idades. Quando houver produção própria, substitua os arquivos mantendo os mesmos nomes. Sugestão de exportação com ffmpeg:

```bash
# loop de 6–8 s, sem áudio, 24 fps
ffmpeg -i bruto.mp4 -an -vf "scale=720:-2,fps=24" -c:v libvpx-vp9 -crf 45 -b:v 0 -row-mt 1 nome.webm
ffmpeg -i bruto.mp4 -an -vf "scale=720:-2,fps=24" -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p -movflags +faststart nome.mp4
ffmpeg -i nome.webm -frames:v 1 -c:v libwebp -quality 72 nome.webp   # poster = primeiro quadro
```

## Convenções

- **Tokens.** Componentes usam só tokens semânticos (`--arco-color-text-primary`), nunca HEX. Para mudar cor, tipo ou espaço, altere `Identidade Visual/arco-tokens.css` e copie para `assets/css/tokens.css`.
- **Tokens de site.** O que é específico do site (faixas escuras, molduras, véu sobre vídeo, cores de gráfico) está em `--site-*`, em `base.css`.
- **Escopos.** `.surface-dark` reaplica os semânticos do tema escuro (hero, faixas, rodapé, tela do modo execução). `.surface-light` faz o inverso: as telas do produto dentro da faixa escura ficam claras em qualquer tema, como capturas.
- **Gráficos.** Realizado em Petróleo 500 e projeção da IA em Lume 500 tracejado, nos dois temas: o par passou no validador de paleta (separação para daltonismo ΔE 12,3; contraste ≥ 3:1). Linhas de 2 px, marcador sólido com anel na cor da superfície, grade em linha fina sólida (só a projeção é tracejada).
- **Nomes de classe.** `.bloco__elemento--variante`, estados em `.is-*`, comportamento em `data-*`.
- **JavaScript.** Cada módulo procura o próprio `data-*` e não faz nada se ele não existir. Sem JS, todo o conteúdo continua visível; as animações de entrada só são ativadas pela classe `.js`.

Regras do manual aplicadas:

- No máximo uma ação em Brasa por tela; Lume só em conteúdo da IA.
- Bricolage só em títulos de 20 px ou mais; Barlow com algarismos tabulares nos números; caixa alta só no estilo overline.
- Só o ponto ao vivo pulsa. A IA usa borda tracejada (6/4, 2 px), que vira linha sólida ao ser aprovada.
- Alvos de toque de 48 px e contraste AA. Com "reduzir movimento" ativo, as animações são desligadas e nenhum vídeo toca sozinho.

## Antes de publicar

- [ ] Trocar `arco.example` pelo domínio definitivo em `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` e `sitemap.xml`.
- [ ] Conectar o formulário: preencher `data-endpoint` no `<form data-lead-form>`. Sem endpoint, o envio é **simulado**.
- [ ] Adicionar e-mail, telefone e redes oficiais no rodapé (há um `TODO` no HTML; nenhum contato provisório foi publicado).
- [ ] Criar a política de privacidade (LGPD) e linkar no formulário e no rodapé.
- [ ] Validar com produto as afirmações vindas do manual (modo offline, integração com wearables, espanhol, "legível a 1,5 m") e as modalidades mostradas nos vídeos (corrida, natação, ciclismo).
- [ ] Substituir os vídeos de banco por produção própria quando possível (ver "Trocar por vídeos próprios").
- [ ] "Arco" é nome de trabalho: fazer a busca de anterioridade no INPI e conferir o domínio (manual, seção 00).
- [ ] Opcional: hospedar as fontes localmente (desempenho e LGPD) e minificar CSS e JS no deploy.

## Verificação feita (v2)

Chrome 156 headless, controlado pelo DevTools Protocol, com cache desativado:

- Layout em 390, 640, 820, 1024, 1280 e 1440 px: sem rolagem horizontal e sem erros de console. Revisão visual nos temas claro e escuro.
- axe-core 4.10 (WCAG 2.0–2.2 A/AA), com as abas "Para profissionais" e "Para alunos" abertas: nenhuma violação em 390 (escuro), 640 e 820 (claro), 1280 (escuro, com "reduzir movimento") e 1440 (claro).
- Interações: abas por clique e teclado; demonstração da IA (editar, ajustar carga, publicar, recomeçar); validação do formulário (três erros e foco no primeiro campo) e envio com sucesso; botão de pausa dos vídeos.
- Com "reduzir movimento", nenhum vídeo é baixado, todo o conteúdo fica visível e os gráficos aparecem já desenhados.
- Paleta dos gráficos aprovada no validador de cores (claro sobre branco; escuro sobre Grafite 900 e Petróleo 900).
