import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { misturar, razaoContraste } from '../src/lib/contraste.ts';
import { conteudoSchema } from '../src/lib/schema.ts';
import { coresFaixa } from '../src/lib/tema.ts';

const AA = 4.5;
// Footer text sits at 80% opacity over the text color (Rodape.astro).
const OPACIDADE_RODAPE = 0.8;
// Hero grid lines: the text color at 5% (fundo-grade in global.css).
const OPACIDADE_GRADE = 0.05;
const OPACIDADE_GRADE_ESCURA = 0.07;
// Fixed color of the floating WhatsApp button (BotaoWhatsApp.astro).
const VERDE_WHATSAPP = '#1D7D4A';
// Fixed color of form field errors (--color-erro in global.css).
const COR_ERRO = '#B42318';

test('contrast ratio matches the WCAG reference values', () => {
  assert.equal(razaoContraste('#000000', '#FFFFFF'), 21);
  assert.equal(razaoContraste('#777777', '#777777'), 1);
  assert.equal(Math.round(razaoContraste('#767676', '#FFFFFF') * 100) / 100, 4.54);
});

test('blends a color over a background', () => {
  assert.equal(misturar('#FFFFFF', '#000000', 0.5), '#808080');
  assert.equal(misturar('#FFFFFF', '#000000', 1), '#ffffff');
});

test('floating WhatsApp button text passes AA', () => {
  assert.ok(razaoContraste('#FFFFFF', VERDE_WHATSAPP) >= AA);
});

test('every color pair used by the components passes WCAG AA', () => {
  const { tema: t } = conteudoSchema.parse(JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')));
  // Any section can become a primary band (fundo: "primaria"), so its colors are always checked.
  const faixa = coresFaixa(t);
  const claros: [string, string][] = [
    ['fundo', t.cor_fundo],
    ['superfície', t.cor_superficie],
    // Darkest spot of the hero background: a grid line over either light color.
    ['grade do hero sobre fundo', misturar(t.cor_texto, t.cor_fundo, OPACIDADE_GRADE)],
    ['grade do hero sobre superfície', misturar(t.cor_texto, t.cor_superficie, OPACIDADE_GRADE)],
  ];
  const pares: [string, string, string][] = [
    // Text, muted text (paragraphs, placeholders, labels), primary (links, secondary buttons),
    // accent (kickers, step numbers, project status) and form errors on every light background.
    ...claros.flatMap(([nome, fundo]): [string, string, string][] => [
      [`texto sobre ${nome}`, t.cor_texto, fundo],
      [`texto suave sobre ${nome}`, t.cor_texto_suave, fundo],
      [`primária sobre ${nome}`, t.cor_primaria, fundo],
      [`destaque sobre ${nome}`, t.cor_destaque, fundo],
      [`erro de formulário sobre ${nome}`, COR_ERRO, fundo],
    ]),
    ['botão primário', t.cor_primaria_contraste, t.cor_primaria],
    ['faixa primária: texto e botão invertido', faixa.texto, faixa.fundo],
    ['faixa primária: texto suave', faixa.texto_suave, faixa.fundo],
    ['faixa primária: destaque', faixa.destaque, faixa.fundo],
    // Dark surfaces (cor_texto as background): notice bar, cookie banner, hero panel, project headers, footer.
    ['superfície escura: texto', t.cor_fundo, t.cor_texto],
    ['superfície escura: destaque', t.cor_destaque_escuro, t.cor_texto],
    ['rodapé a 80%', misturar(t.cor_fundo, t.cor_texto, OPACIDADE_RODAPE), t.cor_texto],
    // Grid lines of the generated project headers (fundo-grade-escura, light color at 7%).
    ['cabeçalho de projeto: destaque sobre a grade', t.cor_destaque_escuro, misturar(t.cor_fundo, t.cor_texto, OPACIDADE_GRADE_ESCURA)],
  ];
  const reprovados = pares
    .map(([nome, a, b]) => ({ nome, razao: razaoContraste(a, b) }))
    .filter(({ razao }) => razao < AA)
    .map(({ nome, razao }) => `${nome}: ${razao.toFixed(2)}`);
  assert.deepEqual(reprovados, [], `pares abaixo de ${AA}:1`);
});
