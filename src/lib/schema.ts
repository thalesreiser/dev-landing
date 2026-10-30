import { z } from 'astro/zod';
import { separarPilha } from './fontes.ts';
import { NOMES_ICONES } from './icones.ts';
import { EXTENSOES_IMAGEM, PADRAO_SRC_IMAGEM } from './imagens.ts';
import { FUNDOS } from './tema.ts';

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'use uma cor hexadecimal, ex.: #1F6FEB');

// Google Fonts family self-hosted at build time (see src/lib/fontes.ts).
const fonte = z.object({
  familia: z.string().min(1),
  // Only the weights the page uses: each one is a file the visitor downloads.
  pesos: z.array(z.number().int().min(100).max(900).multipleOf(100)).min(1),
});

// File in src/assets/site/, optimized at build time; width and height come from the file.
const imagem = z.object({
  src: z.string().regex(PADRAO_SRC_IMAGEM, `caminho relativo a src/assets/site/, ex.: "thales.jpg" (${EXTENSOES_IMAGEM.join(', ')})`),
  alt: z.string(),
});

const link = z.object({ texto: z.string(), href: z.string() });

const acao = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('whatsapp'), texto: z.string(), mensagem: z.string().optional() }),
  z.object({ tipo: z.literal('link'), texto: z.string(), href: z.string() }),
]);

// Fields every section accepts: `id` is the anchor (defaults to the type),
// `menu` adds the section to the header nav, `ativo: false` hides it and `fundo`
// fixes its background (otherwise the light backgrounds alternate, see src/lib/tema.ts).
const comum = {
  id: z.string().regex(/^[a-z0-9-]+$/).optional(),
  menu: z.string().optional(),
  ativo: z.boolean().default(true),
  fundo: z.enum(FUNDOS).optional(),
};

const hero = z.object({
  ...comum,
  tipo: z.literal('hero'),
  titulo: z.string(),
  subtitulo: z.string(),
  selo: z.string().optional(),
  acao_principal: acao,
  acao_secundaria: acao.optional(),
  // Short facts shown in a side panel on desktop and as chips on phones.
  destaques: z.array(z.object({ rotulo: z.string(), valor: z.string() })).min(1).max(4).optional(),
});

const servicos = z.object({
  ...comum,
  tipo: z.literal('servicos'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  itens: z
    .array(
      z.object({
        icone: z.enum(NOMES_ICONES),
        titulo: z.string(),
        descricao: z.string(),
        // What the service includes, as a short checklist.
        inclui: z.array(z.string()).optional(),
      }),
    )
    .min(1),
});

const projetos = z.object({
  ...comum,
  tipo: z.literal('projetos'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  itens: z
    .array(
      z.object({
        titulo: z.string(),
        // Icon of the generated card header (used when there is no imagem).
        icone: z.enum(NOMES_ICONES).default('codigo'),
        descricao: z.string(),
        // Short status chip, e.g. "Concluído" or "Em desenvolvimento".
        status: z.string().optional(),
        tags: z.array(z.string()).min(1),
        links: z.array(z.object({ texto: z.string(), href: z.url({ protocol: /^https$/ }) })).min(1),
        // Screenshot in src/assets/site/; without it the card shows a neutral generated header.
        imagem: imagem.optional(),
      }),
    )
    .min(1),
});

const sobre = z.object({
  ...comum,
  tipo: z.literal('sobre'),
  titulo: z.string(),
  paragrafos: z.array(z.string()).min(1),
  // Portrait in src/assets/site/; without it the section shows a marked placeholder.
  foto: imagem.optional(),
  registros: z.array(z.object({ rotulo: z.string(), valor: z.string(), href: z.string().optional() })).optional(),
});

const comoFunciona = z.object({
  ...comum,
  tipo: z.literal('como_funciona'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  passos: z.array(z.object({ titulo: z.string(), descricao: z.string() })).min(1),
});

const faq = z.object({
  ...comum,
  tipo: z.literal('faq'),
  titulo: z.string(),
  itens: z.array(z.object({ pergunta: z.string(), resposta: z.string() })).min(1),
});

const campo = z.object({
  nome: z.string().regex(/^[a-z_]+$/),
  rotulo: z.string(),
  tipo: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  obrigatorio: z.boolean().default(true),
  autocomplete: z.string().optional(),
  opcoes: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  ajuda: z.string().optional(),
  erro: z.string().optional(),
});

const formulario = z.object({
  ...comum,
  tipo: z.literal('formulario'),
  titulo: z.string(),
  texto: z.string().optional(),
  alternativa_whatsapp: z.string().optional(),
  provedor: z.enum(['formspree', 'web3forms']),
  // Public form id (Formspree) or access key (Web3Forms). Empty = demo mode, nothing is sent.
  chave: z.string().default(''),
  campos: z
    .array(campo)
    .min(1)
    .refine((campos) => campos.every((c) => c.tipo !== 'select' || (c.opcoes?.length ?? 0) > 0), {
      message: 'campos do tipo select precisam de opcoes',
    }),
  consentimento: z.string(),
  botao: z.string(),
  mensagem_sucesso: z.string(),
});

const rodape = z.object({
  ...comum,
  tipo: z.literal('rodape'),
  texto: z.string().optional(),
  links: z.array(link).optional(),
});

const botaoWhatsApp = z.object({
  ...comum,
  tipo: z.literal('botao_whatsapp'),
  rotulo: z.string().default('Conversar pelo WhatsApp'),
  mensagem: z.string().optional(),
});

const secao = z.discriminatedUnion('tipo', [hero, servicos, projetos, sobre, comoFunciona, faq, formulario, rodape, botaoWhatsApp]);

// Placeholder contacts shipped in content/site.json until the real ones are filled in.
export const WHATSAPP_PROVISORIO = /^55\d{2}9?0{8}$/;
export const EMAIL_PROVISORIO = /@example\.(com|org|net)$/i;

export const conteudoSchema = z
  .object({
    // true: visible "em construção" notice and noindex on every page. Set to false only with real contacts.
    em_construcao: z.boolean(),
    site: z.object({
      nome: z.string(),
      titulo: z.string(),
      descricao: z.string().max(170, 'a descrição de SEO deve ter até 170 caracteres'),
      // Production address: canonical, Open Graph, sitemap and JSON-LD need it.
      url: z.url({ protocol: /^https?$/ }).optional(),
      idioma: z.string().default('pt-BR'),
    }),
    // The person behind the site, for the JSON-LD and the privacy policy.
    autor: z.object({
      nome: z.string(),
      cidade: z.string(),
      uf: z.string().length(2),
      perfis: z.array(z.url({ protocol: /^https$/ })).default([]),
    }),
    tema: z.object({
      cor_primaria: cor,
      cor_primaria_contraste: cor.default('#FFFFFF'),
      cor_destaque: cor,
      // Accent inside a primary band (fundo: "primaria"); defaults to cor_primaria_contraste.
      cor_destaque_faixa: cor.optional(),
      // Accent on dark surfaces (cor_texto as background): hero panel, project headers, footer.
      cor_destaque_escuro: cor,
      cor_fundo: cor,
      cor_superficie: cor,
      cor_texto: cor,
      cor_texto_suave: cor,
      fonte_titulo: z.string(),
      fonte_texto: z.string(),
      // Monospace stack for tags and labels; system fonts only, nothing is downloaded.
      fonte_mono: z.string().default('ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'),
      fontes: z.array(fonte).default([]),
    }),
    contato: z.object({
      whatsapp: z.string().regex(/^\d{12,13}$/, 'DDI + DDD + número, só dígitos, ex.: 5551999990000'),
      mensagem_whatsapp: z.string(),
      email: z.email(),
    }),
    rastreamento: z
      .object({
        google_analytics: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
        meta_pixel: z.string().regex(/^\d+$/).optional(),
        // Cookie consent banner, shown only when an id above is set.
        aviso_cookies: z
          .object({
            texto: z
              .string()
              .default(
                'Uso cookies de medição de audiência para entender como o site é usado. Eles só são ativados se você aceitar.',
              ),
            aceitar: z.string().default('Aceitar'),
            recusar: z.string().default('Recusar'),
          })
          .prefault({}),
      })
      .prefault({}),
    // Words the copy must never use (hype, promises); tests/conteudo.test.ts fails when any text contains one.
    revisao: z.object({ termos_vetados: z.array(z.string().min(2)).min(1) }),
    secoes: z.array(secao).min(1),
  })
  .superRefine((conteudo, ctx) => {
    const ids = conteudo.secoes.map(ancoraSecao);
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repetidos.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['secoes'], message: `ids de seção repetidos: ${[...new Set(repetidos)].join(', ')}` });
    }
    const pilhas = [conteudo.tema.fonte_titulo, conteudo.tema.fonte_texto].flatMap(separarPilha).map((nome) => nome.toLowerCase());
    conteudo.tema.fontes.forEach((f, i) => {
      if (!pilhas.includes(f.familia.toLowerCase())) {
        ctx.addIssue({ code: 'custom', path: ['tema', 'fontes', i, 'familia'], message: `"${f.familia}" não aparece em fonte_titulo nem em fonte_texto` });
      }
    });
    conteudo.secoes.forEach((s, i) => {
      if (s.tipo === 'formulario' && s.fundo === 'primaria') {
        ctx.addIssue({ code: 'custom', path: ['secoes', i, 'fundo'], message: 'o formulário não aceita fundo "primaria"; use "fundo" ou "superficie"' });
      }
    });
    // Leaving "em construção" requires real contacts and a working form.
    if (!conteudo.em_construcao) {
      if (WHATSAPP_PROVISORIO.test(conteudo.contato.whatsapp)) {
        ctx.addIssue({ code: 'custom', path: ['contato', 'whatsapp'], message: 'WhatsApp provisório: preencha o número real antes de tirar em_construcao' });
      }
      if (EMAIL_PROVISORIO.test(conteudo.contato.email)) {
        ctx.addIssue({ code: 'custom', path: ['contato', 'email'], message: 'e-mail provisório: preencha o e-mail real antes de tirar em_construcao' });
      }
      conteudo.secoes.forEach((s, i) => {
        if (s.tipo === 'formulario' && s.ativo && s.chave === '') {
          ctx.addIssue({ code: 'custom', path: ['secoes', i, 'chave'], message: 'formulário sem chave: preencha a chave do provedor ou use "ativo": false' });
        }
      });
    }
  });

export type Conteudo = z.output<typeof conteudoSchema>;
export type Secao = Conteudo['secoes'][number];
export type SecaoDo<T extends Secao['tipo']> = Extract<Secao, { tipo: T }>;
export type Acao = z.output<typeof acao>;
export type Imagem = z.output<typeof imagem>;

/** Anchor id of a section: its `id`, or its type in kebab-case. */
export function ancoraSecao(secao: { id?: string | undefined; tipo: string }): string {
  return secao.id ?? secao.tipo.replaceAll('_', '-');
}
