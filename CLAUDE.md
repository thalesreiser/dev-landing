# dev-landing
Landing page pessoal de Thales Reiser Pedreira para vender serviços de desenvolvimento
(landing pages e pipelines de dados). Site único, derivado do `landing-servicos-template`.

## Regras
- Astro + Tailwind CSS. Nada de frameworks extras (React, Vue, bibliotecas de UI)
  sem perguntar. Formulário via Formspree ou Web3Forms, sem backend.
- Todo o conteúdo fica em `content/site.json` (validado por `src/lib/schema.ts`) e as
  imagens em `src/assets/site/`. Nenhum texto do site fixo em `src/`.
- Textos da interface em português do Brasil, sóbrios e concretos: sem "o melhor",
  promessas de resultado, preços, clientes, depoimentos ou números inventados.
  `revisao.termos_vetados` reprova os termos proibidos no `npm test`.
- Projetos citados precisam existir no GitHub, e a descrição só afirma o que o README
  do repositório sustenta (inclusive o status: em desenvolvimento, concluído).
- A seção de música (página de artista) é outro projeto; não entra aqui.
- `em_construcao: true` mostra o aviso e marca `noindex`. Só passe para `false` com
  WhatsApp e e-mail reais e o formulário com chave ou desligado (`ativo: false`); o schema
  reprova os provisórios. Hoje o contato é só WhatsApp e e-mail (formulário desligado).
- Acessível (rótulos, contraste AA em todos os pares do teste, foco visível, `alt`) e
  responsivo (legível a 360 px). Meta: 95+ no Lighthouse mobile.
- Rode `npm run check`, `npm test` e `npm run build` antes de dizer que terminou.
- Nunca commitar dados pessoais reais além do que já é público, `.env` ou credenciais.
  A chave pública do formulário fica no JSON.
- Deploy só pelo GitHub Actions (Cloudflare Pages, projeto `thales-dev`). O token existe
  apenas como secret do repositório (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`);
  nunca peça, imprima ou grave o valor.
- Mantenha o CI enxuto, em um job de build (mais o `ci-ok`), sem matrizes nem jobs extras.
  O check obrigatório é `ci-ok`.
- Commits, branches e PRs em inglês (Conventional Commits).

## Comandos
- `npm run dev`
- `npm run build`
- `npm run check`
- `npm test`
- `npx astro preview --port 4351` (parar com `npx astro preview stop`)
