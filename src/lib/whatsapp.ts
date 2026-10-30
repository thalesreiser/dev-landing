/** Builds a wa.me link; `numero` must carry country and area code (e.g. 5511999990000). */
export function linkWhatsApp(numero: string, mensagem?: string): string {
  const digitos = numero.replace(/\D/g, '');
  if (!/^\d{12,13}$/.test(digitos)) {
    throw new Error(`Número de WhatsApp inválido: "${numero}". Use DDI + DDD + número, ex.: 5511999990000.`);
  }
  const base = `https://wa.me/${digitos}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
