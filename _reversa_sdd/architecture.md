# Arquitetura

> Architect. Nível completo. O FisioPrecifica é um monolito modular pequeno: SPA, uma API tRPC e um Postgres com três tabelas. O cálculo não é um serviço.

## Estilo

Cliente rico. O servidor é autenticação, autorização e persistência de documento. Não há camada de domínio no servidor. 🟢

Isso é bom para extrair `pricing-engine` e ruim para garantir que todo cliente (CRM futuro, app de fono, planilha) use a mesma fórmula: a fórmula viaja dentro do bundle. 🟡 recomendação de empacotar o TS puro e versioná-lo; o código ainda não faz isso.

## Integrações

| Sistema | Direção | Protocolo | Para quê |
|---------|---------|-----------|----------|
| Supabase Auth | ambos | HTTPS, JWT | Conta e sessão |
| Postgres | saída | SQL | users, leads, pricing_data |
| Sentry | saída | HTTPS | Erros, sample 0,2 de trace |
| WhatsApp | saída, link | `https://wa.me` | Compartilhar estimativa e abrir conversa do contato |
| Manus Forge | saída | HTTP JSON | notifyOwner e storage, fora do fluxo de preço |
| Vercel | hospeda | HTTPS | SPA + função |

Não há webhook de entrada. Não há e-mail transacional no código além do reset hospedado pelo Supabase. 🟢

## Deploy

`vercel.json`: build `pnpm run build`, output `dist/public`, função `api/trpc.js` com 256 MB e 30 s. Rewrite `/api/trpc/:path*` → `/api/trpc`. O resto que não é `api`, `assets` nem arquivo com ponto vai para `index.html`. 🟢

O script de build faz três coisas: Vite, esbuild de `server/_core/index.ts` para `dist/`, esbuild de `server/vercel-entry.ts` para `api/trpc.js`. 🟢 `package.json`.

CI (`.github/workflows/ci.yml`) em push e PR para `main`: pnpm frozen, `check`, `lint`, `test`, `build`. Ver `gaps.md` para a falha de lint.

## Dívida técnica que muda desenho

| Dívida | Evidência | Efeito |
|--------|-----------|--------|
| JSON sem versão | ausência de `schemaVersion` | Perfis novos não sabem se podem ler o documento |
| Chave de posse é e-mail | `ownerEmail` | Troca de e-mail é transação em três tabelas, e a comparação não é a mesma da listagem |
| Migração 0001 não aplicada | cabeçalho do SQL | Schema Drizzle (`supabaseId` uuid) pode divergir do banco nascido em `openId` varchar |
| RLS possivelmente inerte no caminho Node | `db.ts` usa `DATABASE_URL` | Segurança depende só do tRPC |
| Landing com outra fórmula | `Landing.tsx` | O número público não é o piso do produto |
| `useMetrics` ignora `precoDefinido` | `useMetrics.ts` | Painel mostra o cenário estratégico, não o preço praticado |
| Duas escalas de margem | `calcularMargemDoPreco` vs `simularPreco.margem` | Agente que "ligar" os dois sem ler a unidade erra por 100x |
| Catálogo fisio dentro do store | defaults | Impede compartilhar o arquivo cru com fono e TO |
| Rate limit e conexão em memória | `trpc.ts`, `db.ts` | Frágeis na Vercel |
| ESLint quebrado desde os runs observáveis | Actions | Ver gaps |
| `storage.ts` / Forge | arquivos vivos | Superfície que o CRM não precisa herdar |
| Admin indelével | `upsertUser` | Operação |
| Consentimento de marketing não persistido | Zod vs schema | LGPD: o aceite não tem coluna |

## O que o CRM futuro deve consumir

O remix de clínica (React + Supabase) deve tratar este app como **módulo de precificação**, não como sistema de pacientes.

Contrato estável a preservar:

1. Entrada do motor: um `DadosPrecificacao` (ou o subconjunto que as funções leem).
2. Saída: piso, sustentável, estratégico, preço de serviço, preço de plano, simulação e ponto de equilíbrio.
3. Persistência atual: um jsonb por profissional. O CRM pode continuar com essa forma no primeiro corte e normalizar depois, desde que o adapter entregue o mesmo objeto ao motor.
4. Auth: o CRM já terá Supabase. O módulo não cria outro provedor. O procedimento `pricing.*` ou a tabela equivalente continua escopada ao profissional logado.
5. O módulo **não** recebe prontuário, agenda de pacientes nem financeiro de convênio. Sessões aqui são meta de volume, não eventos clínicos.

O que mudar está em `extracao-pricing-engine/`.

## Observabilidade

- `console.warn` / `console.error` com prefixos `[Database]`, `[Sync]`, `[tRPC Error]`, `[Supabase]`, `[ENV]`.
- Sentry no client (erro de window e rejection) e no servidor só para `INTERNAL_SERVER_ERROR` do tRPC e unhandled se o DSN existir.
- Não há métrica de negócio (preço médio, conversão de lead) no código. 🟢 ausência.
