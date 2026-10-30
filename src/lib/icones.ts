// Stroke icons on a 24x24 grid, drawn with currentColor. Names are what content/site.json uses in `icone`.
export const ICONES = {
  janela: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M2 9h20', 'M6 6.5h.01', 'M9 6.5h.01'],
  dados: [
    'M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3Z',
    'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5',
    'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  ],
  grafico: ['M3 3v18h18', 'M7 15l4-4 3 3 5-6'],
  codigo: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  mensagem: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  check: ['M20 6 9 17l-5-5'],
  externo: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
} as const;

export type NomeIcone = keyof typeof ICONES;

export const NOMES_ICONES = Object.keys(ICONES) as [NomeIcone, ...NomeIcone[]];
