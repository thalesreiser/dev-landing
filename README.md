# dev-landing

Landing page de **Thales Reiser Pedreira**, desenvolvedor em Porto Alegre/RS: landing pages
para profissionais e pequenos negócios, e dashboards e pipelines de dados.

Feita em **Astro + Tailwind CSS** a partir do
[`landing-servicos-template`](https://github.com/thalesreiser/landing-servicos-template),
simplificada para um site só: todo o conteúdo fica em um arquivo JSON.

## Antes de publicar de verdade

O site sai com dados provisórios e com o aviso "Site em construção" (mais `noindex`). Preencha:

| O quê | Onde | Valor atual (provisório) |
| --- | --- | --- |
| WhatsApp (DDI + DDD + número, só dígitos) | `content/site.json` › `contato.whatsapp` | `5551900000000` |
| E-mail de contato | `content/site.json` › `contato.email` | `contato@example.com` |
| Chave do formulário (Web3Forms ou Formspree) | `secoes` › `formulario` › `chave` | vazia (modo de demonstração, nada é enviado) |
| Foto de retrato | `src/assets/site/` + `secoes` › `sobre` › `foto` | espaço reservado "foto em breve" |
| Imagens dos projetos (opcional) | `src/assets/site/` + `imagem` de cada projeto | cabeçalho gerado (fundo escuro com o nome do repositório) |
| Endereço final, se usar domínio próprio | `site.url` | `https://thales-dev.pages.dev` |

Depois, troque `"em_construcao": true` por `false`. O schema **reprova o build** se o
WhatsApp ou o e-mail ainda forem os provisórios, ou se o formulário estiver ativo sem
chave (ou preencha a chave, ou desligue a seção com `"ativo": false`).

## Como rodar

Requer Node.js 24 (veja `.nvmrc`).

```bash
npm install
npm run dev       # servidor local em http://localhost:4321
npm run build     # site estático em dist/
npm run check     # tipos e templates
npm test          # schema, contraste, termos vetados, SEO, imagens
npx astro preview --port 4351   # serve dist/; pare com: npx astro preview stop
```

## Estrutura

```
content/
├── site.json                  # todo o conteúdo do site
└── politica-de-privacidade.md # texto da página /politica-de-privacidade
src/
├── components/   # Hero, Servicos, Projetos, Sobre, ComoFunciona, FAQ, Formulario,
│                 # Rodape, BotaoWhatsApp, AvisoCookies, TituloSecao, Imagem, Icone
├── layouts/Base.astro  # head, tema, aviso "em construção", cabeçalho, aviso de cookies
├── lib/          # schema (Zod), SEO e JSON-LD, imagem de compartilhamento, contraste, cookies
├── assets/site/  # fotos (otimizadas no build)
└── pages/        # index, política de privacidade, 404, og.png e robots.txt
tests/            # node --test
```

## Editar o conteúdo

Tudo fica em `content/site.json`, validado por `src/lib/schema.ts`: um erro de digitação
falha o build com o caminho do campo.

| Chave | Conteúdo |
| --- | --- |
| `em_construcao` | `true` mostra o aviso "Site em construção" e marca as páginas `noindex` |
| `site` | nome, título e descrição (SEO, até 170 caracteres), `url` de produção |
| `autor` | nome completo, cidade, UF e perfis públicos (JSON-LD e política de privacidade) |
| `tema` | cores, fontes de título e texto (Google Fonts, servidas pelo próprio site) e pilha monoespaçada (só fontes do sistema) |
| `contato` | WhatsApp, mensagem pronta do WhatsApp e e-mail |
| `rastreamento` | `google_analytics` e `meta_pixel`, opcionais; com um deles, aparece o aviso de cookies (LGPD) e nada carrega antes de "Aceitar" |
| `revisao.termos_vetados` | palavras que os textos nunca podem usar (exageros, promessas, preços); o `npm test` reprova se alguma aparecer |
| `secoes` | lista ordenada das seções; a ordem do JSON é a ordem da página |

Tipos de seção: `hero`, `servicos`, `projetos`, `sobre`, `como_funciona`, `faq`,
`formulario`, `rodape` e `botao_whatsapp`. Todas aceitam `id` (âncora), `menu` (link no
cabeçalho), `ativo: false` (esconde sem apagar) e `fundo` (`fundo`, `superficie` ou
`primaria`; sem ele, os fundos claros se alternam). "Como funciona" usa a faixa `primaria`.

### Projetos

Cada item de `projetos.itens` tem `titulo` (o nome do repositório), `descricao`, `tags`
(tecnologias), `links` (só `https`), `status` opcional ("Concluído", "Em desenvolvimento")
e `icone` (`codigo`, `dados`, `grafico`, `janela`) do cabeçalho gerado. Escreva só o que o
README do repositório sustenta.

### Fotos

As imagens ficam em `src/assets/site/` (não em `public/`), para o build gerar AVIF e WebP em
vários tamanhos. No JSON, `src` é o caminho relativo a essa pasta:

```json
{ "tipo": "sobre", "foto": { "src": "thales.jpg", "alt": "Retrato de Thales Reiser Pedreira" } }
```

- **Retrato:** `src/assets/site/thales.jpg` (ou `.webp`), vertical 4:5, com pelo menos
  640 px de largura. Sem `foto`, a seção mostra o espaço reservado "foto em breve".
- **Projetos (opcional):** por exemplo `src/assets/site/projetos/dbt-dw-api.webp`, horizontal
  16:7, com pelo menos 1080 px de largura, em `"imagem": { "src": "projetos/dbt-dw-api.webp", "alt": "..." }`.
- Formatos: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. Um arquivo que não existe falha o
  `npm test` e o build com o caminho esperado.

### Identidade visual

Fundo branco e cinza-azulado, texto quase preto (`#0F172A`), índigo (`#4338CA`) para botões e
links, verde-azulado (`#0F766E`, e `#5EEAD4` sobre fundo escuro) como destaque. Títulos em
Space Grotesk, texto em IBM Plex Sans, rótulos em fonte monoespaçada do sistema. O teste
`tests/contraste.test.ts` confere 4,5:1 (WCAG AA) em todos os pares usados pelos componentes,
inclusive a faixa índigo, as superfícies escuras e as grades decorativas.

### Formulário

[Web3Forms](https://web3forms.com) (padrão) ou [Formspree](https://formspree.io), sem backend.
Em `chave`, use a access key (Web3Forms) ou o id do formulário (Formspree); as duas são
públicas por natureza. Com `chave` vazia, o formulário não envia nada e avisa o visitante.

## SEO

Gerado no build: título, descrição, `canonical`, Open Graph, `twitter:card`, imagem de
compartilhamento `/og.png` (1200×630), JSON-LD (`Person`, `ProfessionalService` e `FAQPage`),
`sitemap-index.xml` e `robots.txt`. Enquanto `em_construcao` for `true`, as páginas têm
`noindex` e o JSON-LD fica sem telefone e e-mail.

## Publicação (Cloudflare Pages)

O GitHub Actions (`.github/workflows/ci.yml`) roda em um único job: `check`, `test`, `build` e,
se os secrets existirem, o deploy no projeto **`thales-dev`** da Cloudflare Pages:

- **push na `main`:** produção em `https://thales-dev.pages.dev`
- **pull request:** prévia por branch, com o link no resumo da execução
- o projeto é criado pela API no primeiro deploy, se ainda não existir
- sem os secrets, o deploy só emite um aviso e o CI continua verde
- `ci-ok` é o check único para usar como obrigatório na `main`

### Configuração (uma vez)

1. Na Cloudflare, em **My Profile › API Tokens › Create Token › Custom token**, crie um token
   com uma única permissão: **Account › Cloudflare Pages › Edit**, restrito à sua conta.
2. Copie o **Account ID** da página inicial do painel da Cloudflare.
3. Grave os dois como secrets do repositório (o `gh` pede o valor sem exibi-lo):

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --repo thalesreiser/dev-landing
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo thalesreiser/dev-landing
   ```

4. Opcional: domínio próprio em **Workers & Pages › thales-dev › Custom domains**, e então
   atualize `site.url`.

O repositório é privado e os minutos do Actions são limitados: o CI usa um job de build e o
`ci-ok`, com cache do npm, e o Dependabot roda uma vez por mês.

## Licença

[MIT](LICENSE)
