import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { conteudoSchema } from '../src/lib/schema.ts';
import { termosEncontrados } from '../src/lib/termos.ts';

type Dados = Record<string, any> & { secoes: Record<string, any>[] };
const original = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')) as Dados;
const copia = (): Dados => structuredClone(original);
const secao = (dados: Dados, tipo: string) => dados.secoes.find((s) => s.tipo === tipo)!;
const valido = (dados: unknown) => conteudoSchema.safeParse(dados).success;

test('content/site.json matches the schema', () => {
  const resultado = conteudoSchema.safeParse(original);
  assert.ok(resultado.success, resultado.error?.message);
});

test('content/site.json uses none of its vetoed terms', () => {
  assert.deepEqual(termosEncontrados(original, original.revisao.termos_vetados), []);
});

test('the site has a projects section with repository links', () => {
  const projetos = secao(original, 'projetos');
  assert.ok(projetos.itens.length > 0);
  for (const projeto of projetos.itens) assert.ok(projeto.links.some((l: { href: string }) => l.href.startsWith('https://github.com/')));
});

test('em_construcao is required, so the notice is never dropped by accident', () => {
  const dados = copia();
  delete dados.em_construcao;
  assert.equal(valido(dados), false);
});

test('leaving em_construcao requires real contacts and a form key', () => {
  const dados = copia();
  dados.em_construcao = false;
  const resultado = conteudoSchema.safeParse(dados);
  assert.equal(resultado.success, false);
  const caminhos = resultado.error!.issues.map((i) => i.path.join('.'));
  assert.ok(caminhos.includes('contato.whatsapp'), caminhos.join(', '));
  assert.ok(caminhos.includes('contato.email'), caminhos.join(', '));
  assert.ok(caminhos.some((c) => /^secoes\.\d+\.chave$/.test(c)), caminhos.join(', '));

  dados.contato.whatsapp = '5551987654321';
  dados.contato.email = 'thales@dominio-real.com.br';
  secao(dados, 'formulario').chave = 'chave-publica';
  assert.equal(valido(dados), true);
  // Turning the form off is the other way out.
  secao(dados, 'formulario').chave = '';
  secao(dados, 'formulario').ativo = false;
  assert.equal(valido(dados), true);
});

test('placeholder contacts are accepted while em_construcao is true', () => {
  const dados = copia();
  dados.em_construcao = true;
  assert.equal(valido(dados), true);
});

test('rejects an unknown icon', () => {
  const dados = copia();
  secao(dados, 'servicos').itens[0].icone = 'nao-existe';
  assert.equal(valido(dados), false);
});

test('rejects duplicated section ids', () => {
  const dados = copia();
  dados.secoes.push({ tipo: 'faq', id: 'duvidas', titulo: 'De novo', itens: [{ pergunta: 'P', resposta: 'R' }] });
  const resultado = conteudoSchema.safeParse(dados);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.message, /ids de seção repetidos: duvidas/);
});

test('requires options on select fields', () => {
  const dados = copia();
  delete secao(dados, 'formulario').campos.find((c: { tipo: string }) => c.tipo === 'select').opcoes;
  assert.equal(valido(dados), false);
});

test('a form section cannot use the primary band', () => {
  const dados = copia();
  secao(dados, 'formulario').fundo = 'primaria';
  assert.equal(valido(dados), false);
});

test('rejects a WhatsApp number without country code', () => {
  const dados = copia();
  dados.contato.whatsapp = '51999990000';
  assert.equal(valido(dados), false);
});

test('rejects a self-hosted font that no font stack uses', () => {
  const dados = copia();
  dados.tema.fontes.push({ familia: 'Inter', pesos: [400] });
  const resultado = conteudoSchema.safeParse(dados);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.issues[0]!.message, /"Inter" não aparece/);
});

test('image src must be a path inside src/assets/site', () => {
  const dados = copia();
  secao(dados, 'sobre').foto = { src: '/img/thales.jpg', alt: 'Retrato' };
  assert.equal(valido(dados), false);
  secao(dados, 'sobre').foto = { src: 'thales.jpg', alt: 'Retrato' };
  assert.equal(valido(dados), true);
});

test('project links must use https and every project needs a tag', () => {
  const dados = copia();
  const projeto = secao(dados, 'projetos').itens[0];
  projeto.links[0].href = 'http://github.com/thalesreiser';
  assert.equal(valido(dados), false);
  projeto.links[0].href = 'https://github.com/thalesreiser';
  projeto.tags = [];
  assert.equal(valido(dados), false);
});

test('hero accepts up to four highlights', () => {
  const dados = copia();
  const hero = secao(dados, 'hero');
  hero.destaques = Array.from({ length: 4 }, (_, i) => ({ rotulo: `r${i}`, valor: 'v' }));
  assert.equal(valido(dados), true);
  hero.destaques.push({ rotulo: 'quinto', valor: 'v' });
  assert.equal(valido(dados), false);
});
