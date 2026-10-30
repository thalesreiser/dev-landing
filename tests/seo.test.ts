import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { conteudoSchema, type Conteudo } from '../src/lib/schema.ts';
import { gerarJsonLd, localeOg, robotsTxt, serializarJsonLd, urlAbsoluta } from '../src/lib/seo.ts';

const ler = (): Record<string, any> => JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const parse = (dados: unknown): Conteudo => conteudoSchema.parse(dados);
const grafo = (c: Conteudo) => gerarJsonLd(c)['@graph'] as Record<string, any>[];
const tipo = (c: Conteudo, t: string) => grafo(c).find((item) => item['@type'] === t);

test('builds absolute URLs only when site.url is set', () => {
  assert.equal(urlAbsoluta('https://a.pages.dev', '/og.png'), 'https://a.pages.dev/og.png');
  assert.equal(urlAbsoluta('https://a.pages.dev/', '/politica-de-privacidade/'), 'https://a.pages.dev/politica-de-privacidade/');
  assert.equal(urlAbsoluta(undefined, '/'), undefined);
});

test('converts the language tag to an Open Graph locale', () => {
  assert.equal(localeOg('pt-BR'), 'pt_BR');
  assert.equal(localeOg('en'), 'en');
});

test('describes the person and the professional service', () => {
  const dados = ler();
  const conteudo = parse(dados);
  const pessoa = tipo(conteudo, 'Person')!;
  const servico = tipo(conteudo, 'ProfessionalService')!;
  assert.equal(gerarJsonLd(conteudo)['@context'], 'https://schema.org');
  assert.equal(pessoa.name, dados.autor.nome);
  assert.deepEqual(pessoa.sameAs, dados.autor.perfis);
  assert.equal(pessoa['@id'], `${dados.site.url}/#pessoa`);
  assert.equal(servico.name, dados.site.nome);
  assert.equal(servico.image, `${dados.site.url}/og.png`);
  assert.deepEqual(servico.founder, { '@id': `${dados.site.url}/#pessoa` });
  assert.equal(servico.address.addressLocality, dados.autor.cidade);
});

test('placeholder contacts stay out of the JSON-LD while em_construcao', () => {
  const dados = ler();
  dados.em_construcao = true;
  const servico = tipo(parse(dados), 'ProfessionalService')!;
  assert.equal('telephone' in servico, false);
  assert.equal('email' in servico, false);

  dados.em_construcao = false;
  dados.contato.whatsapp = '5551987654321';
  dados.contato.email = 'thales@dominio-real.com.br';
  dados.secoes.find((s: { tipo: string }) => s.tipo === 'formulario').chave = 'chave';
  const publicado = tipo(parse(dados), 'ProfessionalService')!;
  assert.equal(publicado.telephone, '+5551987654321');
  assert.equal(publicado.email, 'thales@dominio-real.com.br');
});

test('builds a FAQPage from the active FAQ sections', () => {
  const dados = ler();
  const faq = dados.secoes.find((s: { tipo: string }) => s.tipo === 'faq');
  const pagina = tipo(parse(dados), 'FAQPage')!;
  assert.equal(pagina.mainEntity.length, faq.itens.length);
  assert.deepEqual(pagina.mainEntity[0], {
    '@type': 'Question',
    name: faq.itens[0].pergunta,
    acceptedAnswer: { '@type': 'Answer', text: faq.itens[0].resposta },
  });
  faq.ativo = false;
  assert.equal(tipo(parse(dados), 'FAQPage'), undefined);
});

test('leaves out URLs when there is no site.url', () => {
  const dados = ler();
  delete dados.site.url;
  const ld = JSON.parse(serializarJsonLd(gerarJsonLd(parse(dados))));
  for (const item of ld['@graph'].slice(0, 2)) {
    for (const chave of ['url', '@id', 'image']) assert.equal(chave in item, false, chave);
  }
});

test('escapes the JSON so it cannot close the script tag', () => {
  const texto = serializarJsonLd({ a: '</script><script>alert(1)</script>', b: 'x & y' });
  assert.equal(/[<>&]/.test(texto), false);
  assert.deepEqual(JSON.parse(texto), { a: '</script><script>alert(1)</script>', b: 'x & y' });
});

test('robots.txt allows crawling and points to the sitemap', () => {
  assert.equal(robotsTxt('https://a.pages.dev/'), 'User-agent: *\nAllow: /\n\nSitemap: https://a.pages.dev/sitemap-index.xml\n');
  assert.equal(robotsTxt(undefined), 'User-agent: *\nAllow: /\n');
});
