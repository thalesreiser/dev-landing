import assert from 'node:assert/strict';
import { test } from 'node:test';
import { linkWhatsApp } from '../src/lib/whatsapp.ts';

test('builds a wa.me link with the message URL-encoded', () => {
  assert.equal(
    linkWhatsApp('5511999990000', 'Olá! Quero agendar uma avaliação & saber valores?'),
    'https://wa.me/5511999990000?text=Ol%C3%A1!%20Quero%20agendar%20uma%20avalia%C3%A7%C3%A3o%20%26%20saber%20valores%3F',
  );
});

test('omits text when there is no message', () => {
  assert.equal(linkWhatsApp('5511999990000'), 'https://wa.me/5511999990000');
});

test('strips formatting from the number', () => {
  assert.equal(linkWhatsApp('+55 (11) 99999-0000'), 'https://wa.me/5511999990000');
});

test('encodes line breaks', () => {
  assert.equal(linkWhatsApp('551133330000', 'Linha 1\nLinha 2'), 'https://wa.me/551133330000?text=Linha%201%0ALinha%202');
});

test('rejects a number without country and area code', () => {
  assert.throws(() => linkWhatsApp('99999-0000'), /DDI \+ DDD/);
});
