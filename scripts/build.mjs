#!/usr/bin/env node
/* ==========================================================================
   Arco · Build de produção (npm run build → dist/)
   O código-fonte continua rodando sem build. No deploy, este script:
   1. junta e minifica o CSS e o JS de cada página (blocos <!-- build:css/js -->)
      em arquivos com hash no nome: site.<hash>.css / site.<hash>.js;
   2. acrescenta ?v=<hash> a imagens, vídeos e fontes, para o cache de 1 ano
      (vercel.json) nunca servir um arquivo velho depois de uma troca;
   3. remove os comentários do HTML (notas internas e TODOs não vão ao ar);
   4. confere FAQ × JSON-LD, domínio provisório e configurações vazias.
   ========================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { conferirFaq } from './faq.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
const PAGINAS = ['index.html', 'politica-de-privacidade.html'];
const RAIZ_ARQUIVOS = ['robots.txt', 'sitemap.xml', 'site.webmanifest'];
const PASTAS = ['assets/img', 'assets/video', 'assets/fonts'];

const ler = (rel) => fs.readFileSync(path.join(raiz, rel));
const hash = (dados) => crypto.createHash('sha256').update(dados).digest('hex').slice(0, 10);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const erros = [];
const avisos = [];

/* ---- 0. dist/ limpo (só dentro do projeto) ---- */
if (path.dirname(dist) !== raiz) throw new Error('Pasta de saída inesperada: ' + dist);
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'assets/css'), { recursive: true });
fs.mkdirSync(path.join(dist, 'assets/js'), { recursive: true });

/* ---- 1. arquivos estáticos ---- */
for (const pasta of PASTAS) fs.cpSync(path.join(raiz, pasta), path.join(dist, pasta), { recursive: true });
for (const arquivo of RAIZ_ARQUIVOS) fs.copyFileSync(path.join(raiz, arquivo), path.join(dist, arquivo));

const versoes = new Map();
function versao(rel) {
  if (!versoes.has(rel)) versoes.set(rel, fs.existsSync(path.join(raiz, rel)) ? hash(ler(rel)) : null);
  return versoes.get(rel);
}

/** assets/x/arquivo.ext → assets/x/arquivo.ext?v=hash (se o arquivo existir) */
function versionar(rel) {
  const v = versao(rel);
  if (!v) { erros.push(`Arquivo referenciado não existe: ${rel}`); return rel; }
  return `${rel}?v=${v}`;
}

/* ---- 2. pacotes de CSS e JS ---- */
const pacotes = new Map();
const tamanhos = [];

async function pacote(tipo, arquivos) {
  const chave = `${tipo}:${arquivos.join('|')}`;
  if (pacotes.has(chave)) return pacotes.get(chave);
  let codigo = arquivos.map((a) => ler(a).toString('utf8')).join('\n');
  // Fontes dentro do CSS: url("../fonts/x.woff2") → ?v=hash (mesma URL do preload no HTML)
  if (tipo === 'css') codigo = codigo.replace(/url\("\.\.\/fonts\/([^"?]+)"\)/g, (_, nome) => `url("../fonts/${nome}?v=${versao(`assets/fonts/${nome}`)}")`);
  const { code } = await transform(codigo, { loader: tipo, minify: true, legalComments: 'none', charset: 'utf8', ...(tipo === 'js' ? { target: 'es2017' } : {}) });
  const nome = `assets/${tipo}/site.${hash(code)}.${tipo}`;
  fs.writeFileSync(path.join(dist, nome), code);
  const original = codigo.length;
  tamanhos.push({ nome, original, min: Buffer.byteLength(code), br: zlib.brotliCompressSync(code).length });
  pacotes.set(chave, nome);
  return nome;
}

async function processarBlocos(html, pagina) {
  for (const tipo of ['css', 'js']) {
    const re = new RegExp(`<!-- build:${tipo} -->([\\s\\S]*?)<!-- /build:${tipo} -->`);
    const bloco = html.match(re);
    if (!bloco) { erros.push(`${pagina}: bloco <!-- build:${tipo} --> não encontrado`); continue; }
    const arquivos = [...bloco[1].matchAll(tipo === 'css' ? /href="([^"]+\.css)"/g : /src="([^"]+\.js)"/g)].map((m) => m[1]);
    const nome = await pacote(tipo, arquivos);
    const tag = tipo === 'css' ? `<link rel="stylesheet" href="${nome}">` : `<script src="${nome}" defer></script>`;
    html = html.replace(re, tag);
  }
  return html;
}

/* ---- 3. páginas ---- */
for (const pagina of PAGINAS) {
  let html = ler(pagina).toString('utf8');

  if (pagina === 'index.html') conferirFaq(html).forEach((e) => erros.push(`FAQ × JSON-LD: ${e}`));
  if (html.includes('arco.example')) erros.push(`${pagina}: ainda usa o domínio provisório arco.example`);

  html = await processarBlocos(html, pagina);

  // Imagens, vídeos e fontes referenciados em src, href e srcset
  html = html.replace(/(\s(?:src|href|srcset)=")(assets\/(?:img|video|fonts)\/[^"?#\s]+)"/g, (_, attr, rel) => `${attr}${versionar(rel)}"`);

  // Vídeos montados pelo JS (data-src = nome sem extensão): uma versão para todas as variantes
  html = html.replace(/<video\b[^>]*>/g, (tag) => {
    const bases = [...tag.matchAll(/data-src(?:-mobile)?="([^"]+)"/g)].map((m) => m[1]);
    if (!bases.length) return tag;
    const arquivos = bases.flatMap((b) => [`${b}.webm`, `${b}.mp4`]).filter((a) => fs.existsSync(path.join(raiz, a)));
    if (arquivos.length !== bases.length * 2) erros.push(`${pagina}: falta .webm ou .mp4 para ${bases.join(', ')}`);
    return tag.replace(/>$/, ` data-v="${hash(arquivos.map((a) => versao(a)).join(''))}">`);
  });

  // Comentários (notas internas e TODOs) não vão para produção
  html = html.replace(/[ \t]*<!--[\s\S]*?-->[ \t]*\r?\n?/g, '').replace(/\n{3,}/g, '\n\n');

  const todos = (html.match(/\bTODO\b|class="todo"/g) || []).length;
  if (todos) avisos.push(`${pagina}: ${todos} marca(s) TODO/"a definir" no HTML publicado (em rascunho oculto ou destacadas na página).`);

  fs.writeFileSync(path.join(dist, pagina), html);
}

/* ---- 4. manifesto: ícones versionados ---- */
const manifesto = JSON.parse(ler('site.webmanifest').toString('utf8'));
manifesto.icons = manifesto.icons.map((icone) => ({ ...icone, src: versionar(icone.src) }));
fs.writeFileSync(path.join(dist, 'site.webmanifest'), JSON.stringify(manifesto, null, 2));

/* ---- 5. configurações que ainda faltam ---- */
const config = ler('assets/js/config.js').toString('utf8');
if (/formEndpoint:\s*''/.test(config)) avisos.push('config.js: formEndpoint vazio. No ar, os formulários mostram erro em vez de enviar.');
if (/provedor:\s*''/.test(config)) avisos.push('config.js: analytics sem provedor. Nenhum evento será medido.');

/* ---- Relatório ---- */
console.log('\nArco · build de produção → dist/');
for (const t of tamanhos) console.log(`  ${t.nome}  ${kb(t.original)} → ${kb(t.min)} minificado · ${kb(t.br)} com brotli`);
for (const a of avisos) console.warn(`  aviso: ${a}`);
if (erros.length) {
  for (const e of erros) console.error(`  ERRO: ${e}`);
  process.exit(1);
}
console.log('  ok\n');
