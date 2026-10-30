import type { Acao, Conteudo } from './schema.ts';
import { linkWhatsApp } from './whatsapp.ts';

/** href and target attributes for a call-to-action button. */
export function atributosAcao(acao: Acao, contato: Conteudo['contato']) {
  if (acao.tipo === 'whatsapp') {
    return {
      href: linkWhatsApp(contato.whatsapp, acao.mensagem ?? contato.mensagem_whatsapp),
      target: '_blank',
      rel: 'noopener',
    };
  }
  return { href: acao.href };
}
