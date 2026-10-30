import assert from 'node:assert/strict';
import { test } from 'node:test';
import { coresFaixa, fundosDasSecoes } from '../src/lib/tema.ts';

test('sections alternate the light backgrounds, starting with superficie', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, {}, {}]), ['superficie', 'fundo', 'superficie', 'fundo']);
});

test('an explicit background wins and auto sections continue from it', () => {
  assert.deepEqual(fundosDasSecoes([{}, { fundo: 'superficie' }, {}]), ['superficie', 'superficie', 'fundo']);
});

test('a primary band does not break the light alternation', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, { fundo: 'primaria' }, {}, {}]), ['superficie', 'fundo', 'primaria', 'superficie', 'fundo']);
});

test('band colors: contrast text, muted text blended at 90%, accent defaults to the text', () => {
  const faixa = coresFaixa({ cor_primaria: '#000000', cor_primaria_contraste: '#FFFFFF' });
  assert.deepEqual(faixa, { fundo: '#000000', texto: '#FFFFFF', texto_suave: '#e6e6e6', destaque: '#FFFFFF' });
  assert.equal(coresFaixa({ cor_primaria: '#000000', cor_primaria_contraste: '#FFFFFF', cor_destaque_faixa: '#99F6E4' }).destaque, '#99F6E4');
});
