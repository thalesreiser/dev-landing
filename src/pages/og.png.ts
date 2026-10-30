import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { carregarConteudo } from '../lib/conteudo.ts';
import { svgCompartilhamento } from '../lib/og.ts';

// Share image for Open Graph/Twitter, rendered once at build time.
export const GET: APIRoute = async () => {
  const png = await sharp(Buffer.from(svgCompartilhamento(carregarConteudo())))
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
