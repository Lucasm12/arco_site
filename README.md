# Arco · site institucional

Landing page da plataforma Arco, construída sobre o manual de marca ([../identidade/manual-arco.html](../identidade/manual-arco.html)) e os design tokens ([../identidade/arco-tokens.css](../identidade/arco-tokens.css)).

HTML, CSS e JavaScript puros: sem build, sem dependências e sem framework.

## Rodar localmente

```bash
cd site
python -m http.server 8080
# abra http://localhost:8080
```

Abrir o `index.html` direto também funciona; só o `site.webmanifest` exige HTTP.

## Estrutura

```
site/
├── index.html              Página única, com o sprite SVG (símbolo e ícones do manual)
├── assets/
│   ├── css/
│   │   ├── tokens.css      Cópia de identidade/arco-tokens.css (não editar aqui)
│   │   ├── base.css        Reset, tokens --site-*, escopo .surface-dark, tipografia, utilitários
│   │   ├── components.css  Componentes reutilizáveis (botão, chip, cartão, celular, cartão da IA, formulário, abas, acordeão, anel)
│   │   └── sections.css    Layout de cada seção, na ordem da página
│   ├── js/main.js          Interações, um módulo init* por recurso
│   └── img/                favicon.svg, ícones PNG e og-image.png
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

## Seções

| # | Âncora | Conteúdo |
|---|--------|----------|
| — | topo | Hero: posicionamento ("A IA propõe. Você decide. Seu aluno evolui.") |
| 01 | `#problema` | O problema que a plataforma resolve |
| 02 | `#plataforma` | O que é: os três arcos (repetição, evolução, relação) |
| 03 | `#funcionalidades` | Funcionalidades principais |
| 04 | `#como-funciona` | Quatro passos, com o anel de séries acompanhando a rolagem |
| 05 | `#ia` | IA com autoria, com demonstração interativa (sugestão → revisão → aprovado) |
| 06 | `#beneficios` | Benefícios para profissionais e para alunos (abas) |
| 07 | `#diferenciais` | Comparativo, proposta de valor e números do produto |
| 08 | `#perguntas` | Perguntas frequentes |
| — | `#demonstracao` | Chamada final com formulário |

## Convenções

- **Tokens.** Componentes usam só tokens semânticos (`--arco-color-text-primary`), nunca HEX. Para mudar cor, tipo ou espaço, altere `identidade/arco-tokens.css` e copie para `assets/css/tokens.css`.
- **Tokens de site.** O que é específico do site (faixas escuras, cabeçalho translúcido, avatares) está em `--site-*`, em `base.css`, com variante clara e escura.
- **Escopo escuro.** `.surface-dark` reaplica os semânticos do tema escuro do manual em qualquer bloco (faixa da IA, CTA, rodapé, tela do celular). Componentes dentro dele não precisam de variante.
- **Nomes de classe.** `.bloco__elemento--variante`, estados em `.is-*`, comportamento em `data-*`.
- **JavaScript.** Cada módulo procura o próprio `data-*` e não faz nada se ele não existir. Sem JS, todo o conteúdo continua visível; as animações de entrada só são ativadas pela classe `.js`.

Regras do manual aplicadas:

- No máximo uma ação em Brasa por tela; Lume só em conteúdo da IA.
- Bricolage só em títulos de 20 px ou mais; Barlow com algarismos tabulares nos números; caixa alta só no estilo overline.
- Só o ponto ao vivo pulsa. A IA usa borda tracejada (6/4, 2 px), que vira linha sólida ao ser aprovada.
- Alvos de toque de 48 px e contraste AA. Com "reduzir movimento" ativo, as animações são desligadas.

## Antes de publicar

- [ ] Trocar `arco.example` pelo domínio definitivo em `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` e `sitemap.xml`.
- [ ] Conectar o formulário: preencher `data-endpoint` no `<form data-lead-form>`. Sem endpoint, o envio é **simulado**.
- [ ] Criar a política de privacidade (LGPD) e linkar no formulário e no rodapé.
- [ ] Validar com produto as afirmações vindas do manual (modo offline, integração com wearables, espanhol, "legível a 1,5 m").
- [ ] "Arco" é nome de trabalho: fazer a busca de anterioridade no INPI e conferir o domínio (manual, seção 00).
- [ ] Opcional: hospedar as fontes localmente (desempenho e LGPD) e minificar CSS e JS no deploy.

## Verificação feita

- Chrome headless em 390, 820, 1024, 1280 e 1440 px, nos temas claro e escuro, sem rolagem horizontal.
- axe-core 4.10: nenhuma violação no tema claro e nenhuma falha de contraste no escuro.
- Interações testadas: menu móvel (inclusive Esc), abas por teclado, demonstração da IA nos quatro estados, validação e envio do formulário, troca de tema.
- Com "reduzir movimento": todo o conteúdo visível, animações em loop desligadas.
