# Matriz código → spec

| Arquivo do legado | Unit | Cobertura |
|-------------------|------|-----------|
| `client/src/lib/calculations.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/calculations.test.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/types.ts` | `motor-de-precos/` e `database/` | 🟢 |
| `client/src/lib/alerts.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/labels.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/useMetrics.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/formatters.ts` | `motor-de-precos/` | 🟢 |
| `client/src/lib/store.ts` | `sincronizacao/` e `extracao-pricing-engine/` | 🟢 |
| `client/src/lib/sync.ts` | `sincronizacao/` | 🟢 |
| `client/src/lib/sync.test.ts` | `sincronizacao/` | 🟢 |
| `client/src/contexts/DataContext.tsx` | `sincronizacao/` | 🟢 |
| `client/src/lib/supabase.ts` | `autenticacao/` | 🟢 |
| `client/src/_core/hooks/useAuth.ts` | `autenticacao/` | 🟢 |
| `client/src/pages/Login.tsx` | `autenticacao/` | 🟢 |
| `client/src/main.tsx` | `autenticacao/` e `api/` | 🟢 |
| `server/_core/context.ts` | `autenticacao/` | 🟢 |
| `server/_core/supabase.ts` | `autenticacao/` | 🟢 |
| `server/_core/trpc.ts` | `api/` | 🟢 |
| `server/_core/env.ts` | `api/` | 🟢 |
| `server/routers.ts` | `api/` | 🟢 |
| `server/db.ts` | `api/` e `contatos/` | 🟢 |
| `server/vercel-entry.ts` | `api/` | 🟢 |
| `server/_core/index.ts` | `api/` | 🟢 |
| `server/_core/systemRouter.ts` | `api/` | 🟢 |
| `server/_core/notification.ts` | `api/` | 🟡 legado |
| `server/storage.ts` | `api/` | 🟡 legado, sem caller de produto |
| `drizzle/schema.ts` | `database/` | 🟢 |
| `drizzle/rls-policies.sql` | `autenticacao/` | 🟢 |
| `client/src/App.tsx` | `interface/` | 🟢 |
| `client/src/components/Layout.tsx` | `interface/` | 🟢 |
| `client/src/components/LeadGate.tsx` | `interface/` | 🟢 |
| `client/src/components/OnboardingWizard.tsx` | `interface/` | 🟢 |
| `client/src/components/ProgressGate.tsx` | `interface/` | 🟢 |
| `client/src/pages/Landing.tsx` | `interface/` | 🟢 |
| `client/src/pages/Custos.tsx` | `interface/` | 🟢 |
| `client/src/pages/Reservas.tsx` | `interface/` | 🟢 |
| `client/src/pages/Precificacao.tsx` | `interface/` | 🟢 |
| `client/src/pages/Servicos.tsx` | `interface/` | 🟢 |
| `client/src/pages/Simulacao.tsx` | `interface/` | 🟢 |
| `client/src/pages/Indicadores.tsx` | `interface/` | 🟡 gráficos não decompostos |
| `client/src/pages/Relatorios.tsx` | `interface/` | 🟢 |
| `client/src/pages/Perfil.tsx` | `interface/` | 🟡 |
| `client/src/pages/Configuracoes.tsx` | `sincronizacao/` | 🟢 |
| `client/src/pages/Leads.tsx` | `contatos/` | 🟢 |
| `client/src/pages/Legal.tsx` | `interface/` | 🟡 texto jurídico não transcrito |
| `client/src/index.css` | `design-system/tokens.md` | 🟢 |
| `.github/workflows/ci.yml` | `gaps.md` | 🟢 |
| `components/ui/*` | `design-system/tokens.md` | n/a visual primitivo |

Arquivos de UI shadcn sem regra de negócio ficam n/a de propósito. Não são candidatos a reanálise de domínio.
