// Section backgrounds and the colors of a primary band, emitted by Base.astro as CSS variables.

import { misturar } from './contraste.ts';

// The two light theme colors, or a contrast band in the primary color.
export const FUNDOS = ['fundo', 'superficie', 'primaria'] as const;
export type Fundo = (typeof FUNDOS)[number];

// Light text on the band is drawn at this opacity over the primary color.
export const OPACIDADE_TEXTO_FAIXA = 0.9;

/**
 * Background of each section, in order. An explicit `fundo` wins; the others alternate the two
 * light colors (starting with superficie), skipping over primary bands so light sections never repeat.
 */
export function fundosDasSecoes(secoes: { fundo?: Fundo | undefined }[]): Fundo[] {
  let ultimoClaro: Fundo = 'fundo';
  return secoes.map(({ fundo }) => {
    const escolhido = fundo ?? (ultimoClaro === 'fundo' ? 'superficie' : 'fundo');
    if (escolhido !== 'primaria') ultimoClaro = escolhido;
    return escolhido;
  });
}

/** Colors inside a primary band: what text, muted text and the accent turn into. */
export function coresFaixa(tema: {
  cor_primaria: string;
  cor_primaria_contraste: string;
  cor_destaque_faixa?: string | undefined;
}): { fundo: string; texto: string; texto_suave: string; destaque: string } {
  return {
    fundo: tema.cor_primaria,
    texto: tema.cor_primaria_contraste,
    texto_suave: misturar(tema.cor_primaria_contraste, tema.cor_primaria, OPACIDADE_TEXTO_FAIXA),
    destaque: tema.cor_destaque_faixa ?? tema.cor_primaria_contraste,
  };
}
