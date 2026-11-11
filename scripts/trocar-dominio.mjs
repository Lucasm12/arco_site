#!/usr/bin/env node
/* Troca o domínio do site em todos os arquivos publicados (canonical, Open Graph,
   JSON-LD, robots.txt e sitemap.xml).

   Uso:   node scripts/trocar-dominio.mjs https://arco.com.br
   Teste: node scripts/trocar-dominio.mjs https://arco.com.br --simular   (só mostra o que mudaria) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARQUIVOS = ['index.html', 'politica-de-privacidade.html', 'robots.txt', 'sitemap.xml'];
const [, , entrada, flag] = process.argv;
const simular = flag === '--simular';

if (!entrada || !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/i.test(entrada)) {
  console.error('Informe o novo domínio com https://, por exemplo: node scripts/trocar-dominio.mjs https://arco.com.br');
  process.exit(1);
}
const novo = entrada.replace(/\/$/, '');

// O domínio atual é lido do canonical do index.html (fonte da verdade)
const index = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const atual = (index.match(/<link rel="canonical" href="(https:\/\/[^/"]+)\/?"/) || [])[1];
if (!atual) { console.error('Não encontrei o <link rel="canonical"> no index.html.'); process.exit(1); }
if (atual === novo) { console.log(`O site já usa ${novo}.`); process.exit(0); }

// Troca a forma normal e a codificada em URL (links de compartilhamento: https%3A%2F%2F...)
const pares = [[atual, novo], [encodeURIComponent(atual), encodeURIComponent(novo)]];

let total = 0;
for (const nome of ARQUIVOS) {
  const arquivo = path.join(raiz, nome);
  if (!fs.existsSync(arquivo)) continue;
  let texto = fs.readFileSync(arquivo, 'utf8');
  let n = 0;
  for (const [de, para] of pares) {
    n += texto.split(de).length - 1;
    texto = texto.split(de).join(para);
  }
  if (!n) continue;
  total += n;
  console.log(`${nome}: ${n} ocorrência(s)`);
  if (!simular) fs.writeFileSync(arquivo, texto);
}
console.log(`${simular ? 'Simulação: ' : ''}${atual} → ${novo} (${total} trocas).`);
if (!simular) console.log('Confira também o domínio do analytics em assets/js/config.js, se houver.');
