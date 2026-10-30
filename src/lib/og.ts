import type { Conteudo } from './schema.ts';
import { ALTURA_OG, chamadaPrincipal, LARGURA_OG } from './seo.ts';

const MARGEM = 80;
const TAMANHO_CHAMADA = 64;
const ALTURA_LINHA = 80;
const MAX_LINHAS = 3;
// Average bold glyph width relative to the font size, measured on the widest fallback
// (DejaVu); conservative so lines stay inside the margins.
const LARGURA_MEDIA = { serif: 0.68, 'sans-serif': 0.6 } as const;
// Fonts installed on Windows and on the Ubuntu CI runner; a bare generic family
// resolves to a serif font on some systems.
const PILHAS = {
  serif: "Georgia, 'DejaVu Serif', 'Liberation Serif', 'Times New Roman', serif",
  'sans-serif': "Arial, Helvetica, 'Liberation Sans', 'DejaVu Sans', sans-serif",
} as const;

export function escaparXml(texto: string): string {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * Generic family of a CSS font stack ("serif" or "sans-serif"). The web fonts are not
 * available when sharp renders the SVG.
 */
export function familiaGenerica(pilha: string): 'serif' | 'sans-serif' {
  const familias = pilha.split(',').map((familia) => familia.trim().replace(/^["']|["']$/g, '').toLowerCase());
  return familias.includes('serif') ? 'serif' : 'sans-serif';
}

/** Greedy word wrap by character count; the last line ends in "…" when text is cut. */
export function quebrarLinhas(texto: string, maxCaracteres: number, maxLinhas: number): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of texto.trim().split(/\s+/)) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (tentativa.length <= maxCaracteres || !atual) {
      atual = tentativa;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  if (linhas.length <= maxLinhas) return linhas;
  const cortadas = linhas.slice(0, maxLinhas);
  let ultima = cortadas[maxLinhas - 1]!;
  while (ultima.length > maxCaracteres - 1) ultima = ultima.replace(/\s*\S+$/, '');
  cortadas[maxLinhas - 1] = `${ultima.replace(/[\s,.;:–-]+$/, '')}…`;
  return cortadas;
}

/** 1200x630 share card (SVG) drawn from the site name, hero title and theme. */
export function svgCompartilhamento(conteudo: Conteudo): string {
  const { tema, site } = conteudo;
  const familiaTitulo = familiaGenerica(tema.fonte_titulo);
  const maxCaracteres = Math.floor((LARGURA_OG - 2 * MARGEM) / (TAMANHO_CHAMADA * LARGURA_MEDIA[familiaTitulo]));
  const linhas = quebrarLinhas(chamadaPrincipal(conteudo), maxCaracteres, MAX_LINHAS);
  const dominio = site.url ? new URL(site.url).host : '';
  const titulo = PILHAS[familiaTitulo];
  const texto = PILHAS[familiaGenerica(tema.fonte_texto)];
  const cor = tema.cor_primaria_contraste;

  const chamada = linhas
    .map((linha, i) => `<tspan x="${MARGEM}" y="${300 + i * ALTURA_LINHA}">${escaparXml(linha)}</tspan>`)
    .join('');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA_OG}" height="${ALTURA_OG}" viewBox="0 0 ${LARGURA_OG} ${ALTURA_OG}">`,
    `<rect width="100%" height="100%" fill="${tema.cor_primaria}"/>`,
    `<rect x="0" y="${ALTURA_OG - 16}" width="${LARGURA_OG}" height="16" fill="${tema.cor_destaque}"/>`,
    `<rect x="${MARGEM}" y="${MARGEM}" width="96" height="8" rx="4" fill="${cor}"/>`,
    `<text x="${MARGEM}" y="172" fill="${cor}" font-family="${titulo}" font-size="40" font-weight="600">${escaparXml(site.nome)}</text>`,
    `<text fill="${cor}" font-family="${titulo}" font-size="${TAMANHO_CHAMADA}" font-weight="700">${chamada}</text>`,
    dominio
      ? `<text x="${MARGEM}" y="${ALTURA_OG - MARGEM}" fill="${cor}" font-family="${texto}" font-size="28">${escaparXml(dominio)}</text>`
      : '',
    '</svg>',
  ].join('');
}
