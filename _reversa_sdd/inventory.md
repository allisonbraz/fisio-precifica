# Inventário

> Scout. Confiança 🟢 salvo onde marcado. Data da leitura: 2026-11-12. Pacote npm: `fisio-pricing` 1.0.0. Gerenciador: pnpm 10.4.1.

## Linguagens e runtime

| Item | Valor | Evidência |
|------|--------|-----------|
| Linguagem | TypeScript 5.9, `"type": "module"` | `package.json`, `tsconfig.json` |
| UI | React 19, Vite 7 | `client/` |
| API | tRPC 11 sobre Express 4 | `server/routers.ts` |
| Banco | PostgreSQL via `postgres` + Drizzle 0.44 | `drizzle/schema.ts`, `server/db.ts` |
| Auth | Supabase JS 2.99, e-mail e senha | `client/src/pages/Login.tsx` |
| Testes | Vitest 2 | `*.test.ts` |
| Deploy | Vercel, SPA + função `api/trpc.js` | `vercel.json` |

Não há app mobile, fila, cache externo nem ORM no browser. 🟢

## Entry points

| Entrada | Arquivo | Papel |
|---------|---------|--------|
| Browser | `client/src/main.tsx` | Sentry, tRPC client, header `Authorization: Bearer` |
| Árvore React | `client/src/App.tsx` | Rotas Wouter |
| Dev server | `server/_core/index.ts` | Express + Vite middleware, porta `PORT` ou 3000, sobe até +20 |
| Produção Vercel | `server/vercel-entry.ts` | Mesmo tRPC, sem Vite; o build gera `api/trpc.js` |
| Schema | `drizzle/schema.ts` | Tabelas `users`, `leads`, `pricing_data` |

O README de produto diz para acessar `http://localhost:5000`. O servidor procura a partir da porta 3000. 🟡 Qual porta o ambiente local realmente usa depende de `PORT`; o README pode estar desatualizado.

## Árvore relevante

```
client/src
  pages/            telas (Landing, Login, Home, Custos, Precificacao, ...)
  components/       Layout, LeadGate, OnboardingWizard, ProgressGate, ui/
  contexts/         DataContext (estado + sync), ThemeContext
  lib/              calculations, types, store, sync, alerts, labels, formatters
  _core/hooks/      useAuth
server/
  routers.ts        contrato tRPC
  db.ts             Drizzle
  _core/            context JWT, env, supabase, trpc, systemRouter, notification
drizzle/            SQL gerado, RLS à parte, schema
shared/const.ts     mensagens UNAUTHED e NOT_ADMIN
docs/               PRD, arquitetura e stories já existentes (não são esta extração)
```

## Módulos de domínio (superfície)

| Módulo | Caminhos | Responsabilidade |
|--------|----------|------------------|
| Motor | `client/src/lib/calculations.ts`, `types.ts`, `alerts.ts`, `useMetrics.ts`, `labels.ts` | Regras de preço |
| Estado local | `client/src/lib/store.ts`, `formatters.ts` | Defaults, migração de localStorage, import/export |
| Sync | `client/src/lib/sync.ts`, `contexts/DataContext.tsx` | Espelho local e remoto |
| Auth | `client/src/lib/supabase.ts`, `pages/Login.tsx`, `server/_core/context.ts` | Sessão |
| API | `server/routers.ts`, `server/db.ts` | Persistência e admin |
| UI | `client/src/pages/*`, `components/Layout.tsx` | Fluxos |

## Sinais para organizar as specs

| Sinal | Evidência | Sugestão do Scout |
|-------|-----------|-------------------|
| Páginas por capacidade de produto | `pages/Custos.tsx`, `Precificacao.tsx`, `Servicos.tsx` | `feature` |
| Roteador único | `server/routers.ts` | `endpoint` |
| Biblioteca pura de domínio | `client/src/lib/calculations.ts` | `module` |

Há três sinais com peso parecido. A sugestão automática do Scout seria `hybrid`. 🟢 Esta extração gravou `feature` porque o pedido pede contratos que um agente consiga destacar (motor, auth, sync, API, telas, extração do pacote). A sugestão original fica registrada aqui e não é reescrita.

## O que não é o produto

| Caminho | Nota |
|---------|------|
| `server/storage.ts` | Cliente do storage da plataforma Manus. Não é chamado pelo fluxo de preço. 🟢 |
| `server/_core/notification.ts` | `notifyOwner` via `BUILT_IN_FORGE_API_URL`. Só `system.notifyOwner`. 🟢 |
| `docs/stories`, `docs/releases` | Histórico humano anterior. Útil como contexto, não como contrato. 🟡 |
| `api/` | Saída de build, ignorada pelo ESLint. Pode estar commitada (`70eb213`). 🟡 não reaberto o conteúdo gerado nesta extração |

## Testes que caracterizam o motor

| Arquivo | Cobre |
|---------|--------|
| `client/src/lib/calculations.test.ts` | Mensalização, depreciação com parcela, divisor de proteção, ordem piso < sustentável < estratégico, viabilidade da meta, intervalo de 10 min |
| `client/src/lib/store.test.ts` | Migração de localStorage e formatação |
| `client/src/lib/sync.test.ts` | Status de sync e preservação no logout |
| `server/leads.test.ts`, `server/contacts.test.ts` | Leads e contatos |

Não há teste de ponta a ponta de browser nem de contrato tRPC com banco real. 🟢 ausência no repositório.
