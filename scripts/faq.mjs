#!/usr/bin/env node
/* FAQ estruturado (schema.org/FAQPage) a partir das perguntas visíveis do index.html.
   O Google exige que o JSON-LD repita exatamente o texto visível.

   node scripts/faq.mjs              confere se o JSON-LD bate com a página (sai com erro se não bater)
   node scripts/faq.mjs --atualizar  reescreve o nó FAQPage do JSON-LD a partir da página */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const decode = (t) => t
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const texto = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** Perguntas e respostas visíveis (<details class="accordion__item">) */
export function extrairFaq(html) {
  return [...html.matchAll(/<details class="accordion__item">([\s\S]*?)<\/details>/g)].map(([, bloco]) => ({
    pergunta: texto(bloco.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)[1]),
    resposta: texto(bloco.match(/<div class="accordion__body">([\s\S]*?)<\/div>/)[1])
  }));
}

export function noFaq(faq, url) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#perguntas`,
    mainEntity: faq.map(({ pergunta, resposta }) => ({
      '@type': 'Question',
      name: pergunta,
      acceptedAnswer: { '@type': 'Answer', text: resposta }
    }))
  };
}

const LD = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;

/** Lista de diferenças entre o FAQ visível e o JSON-LD (vazia = tudo certo) */
export function conferirFaq(html) {
  const visivel = extrairFaq(html);
  const ld = JSON.parse(html.match(LD)[2]);
  const no = (ld['@graph'] || []).find((n) => n['@type'] === 'FAQPage');
  if (!no) return ['O JSON-LD não tem um nó FAQPage.'];
  const erros = [];
  if (no.mainEntity.length !== visivel.length) erros.push(`JSON-LD tem ${no.mainEntity.length} perguntas; a página tem ${visivel.length}.`);
  visivel.forEach((item, i) => {
    const q = no.mainEntity[i];
    if (!q) return;
    if (q.name !== item.pergunta) erros.push(`Pergunta ${i + 1} diferente: "${q.name}" ≠ "${item.pergunta}"`);
    if (q.acceptedAnswer.text !== item.resposta) erros.push(`Resposta ${i + 1} diferente ("${item.pergunta}")`);
  });
  return erros;
}

export function atualizarFaq(html) {
  const [, abre, json, fecha] = html.match(LD);
  const ld = JSON.parse(json);
  const url = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  const grafo = (ld['@graph'] || []).filter((n) => n['@type'] !== 'FAQPage');
  ld['@graph'] = [...grafo, noFaq(extrairFaq(html), url)];
  const corpo = JSON.stringify(ld, null, 2).replace(/^/gm, '  ');
  return html.replace(LD, `${abre}\n${corpo}\n  ${fecha}`);
}

// Uso pela linha de comando
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arquivo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
  const html = fs.readFileSync(arquivo, 'utf8');
  if (process.argv.includes('--atualizar')) {
    fs.writeFileSync(arquivo, atualizarFaq(html));
    console.log(`FAQPage atualizado com ${extrairFaq(html).length} perguntas.`);
  } else {
    const erros = conferirFaq(html);
    if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
    console.log(`FAQ ok: ${extrairFaq(html).length} perguntas, JSON-LD igual ao texto da página.`);
  }
}
