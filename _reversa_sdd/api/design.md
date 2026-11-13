# API tRPC, Design Técnico

## Interface

O transporte é `httpBatchLink` para `/api/trpc` com transformer SuperJSON. Não há REST de recurso. A tabela de procedimentos está em `../openapi/trpc-procedures.yaml`.

| Procedimento | Middleware |
|--------------|------------|
| `system.health` | public |
| `system.notifyOwner` | admin |
| `auth.me` | public |
| `leads.register` | rate limit |
| `leads.list`, `leads.exportAll` | admin |
| `pricing.save`, `pricing.load` | protected |
| `contacts.list`, `contacts.exportAll`, `contacts.changeEmail` | admin |

Erro interno de tRPC é logado e enviado ao Sentry se `SENTRY_DSN` existe. 🟢

## Fluxo Principal

1. Express JSON.
2. Adapter tRPC cria contexto (JWT).
3. Middleware.
4. Zod.
5. `db.ts`.

## Fluxos Alternativos

- **Sem `DATABASE_URL`:** `getDb` devolve null por pelo menos 5s entre tentativas. Save responde success false. Lead register devolve null e o router ainda responde `{ success: true }` porque não checa o retorno de `createLead`. 🟢 `routers.ts` linhas 27–35 não testam o retorno. O cliente acredita que o lead existe. 🟢 isso é um furo.

## Dependências

- Postgres, Supabase Auth, opcionalmente service role e Forge.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Documento opaco para o servidor | save não chama o motor | 🟢 |
| IP do lead é o primeiro `x-forwarded-for` | `routers.ts` | 🟢 |
| Contatos em SQL cru | `db.ts` | 🟢 |

## Estado Interno

Mapa de rate limit no módulo. Singleton `_db`. 🟢

## Observabilidade

Prefixos `[tRPC Error]`, `[Database]`. 🟢

## Riscos e Lacunas

- 🟢 `createLead` null ainda vira `{ success: true }`.
- 🟡 Rate limit inútil com muitas instâncias.
- 🔴 Passthrough sem teto de chaves, combinado ao body de 50mb, permite gravar jsonb grande. O Zod não limita o comprimento dos arrays.
