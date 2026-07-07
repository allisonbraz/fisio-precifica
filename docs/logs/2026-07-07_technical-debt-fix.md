# FisioPrecifica — Correção de Débitos Técnicos

**Data:** 2026-07-07
**Projeto:** fisio-precifica
**Branch:** update/review_bug_07_26 → main
**Executor:** Claude Fable 5 — Synkra AIOX

---

## Contexto

A auditoria de 2026-03-15 identificou 26 débitos técnicos (score 6.0/10). Após re-exploração em 2026-07-07, verificou-se que vários já haviam sido corrigidos ao longo do desenvolvimento. Os débitos remanescentes foram corrigidos nesta sessão.

## Débitos Já Resolvidos (pré-sessão)

| ID | Débito | Quando Resolvido |
|----|--------|------------------|
| F1 | Imagem CDN hardcoded | Movida para `/logo-fisio.png` local |
| A1 | Entry points duplicados | `server/index.ts` removido |
| D3 | FK sem constraint | `.references(() => users.id)` adicionado |
| D7 | Email sem unique em leads | `uniqueIndex("idx_leads_email")` no schema |
| F7 | store.ts monolítico (660 LOC) | Refatorado em 5 módulos |
| F3/F4 | DashboardLayout/ManusDialog/AIChatBox | Removidos |
| A9 | Pacote `add` acidental | Removido |
| D1/A2 | Dados só em localStorage | `pricing_data` table + sync server-side implementados |
| F6 | Sem prefers-reduced-motion | `MotionConfig reducedMotion="user"` no App.tsx |

## Correções Aplicadas (2026-07-07)

### Commit 1: `fix: resolve critical technical debt (P0-P3)` — 0735826

| # | Correção | Arquivo(s) | Prioridade |
|---|----------|------------|:-----------:|
| 1 | Índice em `users.email` | `drizzle/schema.ts` | P1 |
| 2 | Retry DB com backoff 5s | `server/db.ts` | P1 |
| 3 | Validação startup env vars | `server/_core/env.ts` | P1 |
| 4 | Paginação SQL unified contacts | `server/db.ts` | P1 |
| 5 | Remover plugin Manus (jsxLocPlugin) | `vite.config.ts`, `package.json` | P2 |
| 6 | Remover patch wouter | `patches/wouter@3.7.1.patch`, `package.json` | P2 |
| 7 | Testes calculations.ts (32 novos) | `client/src/lib/calculations.test.ts` | P2 |
| 8 | Limpar CI workflow | `.github/workflows/ci.yml` | P1 |
| 9 | Pinar versões críticas | `package.json` | P3 |

### Commit 2: `chore: remove Manus platform dead code` — 7039337

| Arquivo Removido | Motivo |
|------------------|--------|
| `server/_core/dataApi.ts` | Forge API wrapper, sem uso |
| `server/_core/llm.ts` | LLM client Manus, sem uso |
| `server/_core/imageGeneration.ts` | Image gen Manus, sem uso |
| `server/_core/map.ts` | Maps Manus, sem uso |
| `server/_core/voiceTranscription.ts` | Voice Manus, sem uso |
| `shared/_core/errors.ts` | Error types legacy, sem uso |
| `server/auth.logout.test.ts` | Testava logout cookie (auth antiga) |

**Atualizações em testes existentes:**
- `leads.test.ts` / `contacts.test.ts`: mocks atualizados `openId` → `supabaseId`
- `store.test.ts`: campos obrigatórios adicionados, fórmula de preço corrigida

### Commit 3: `docs: add project documentation` — 6d13f78

- README.md, .env.example, ARCHITECTURE.md, PRD.md
- Docs de marketing e curso
- Asset de imagem hero

---

## Métricas Pós-Correção

| Métrica | Antes | Depois |
|---------|:-----:|:------:|
| Testes unitários | 39 | 71 (+32) |
| Código morto (LOC) | ~1.189 | 0 |
| Deps flutuantes críticas | 8 | 0 |
| Índices no banco | 2 | 3 |
| Pipeline CI | Funcional | Funcional (limpo) |
| Plugins dev desnecessários | 2 (jsx-loc + wouter patch) | 0 |

## Score Atualizado

| Fase | Score Anterior | Score Atual | Justificativa |
|------|:--------------:|:-----------:|---------------|
| Arquitetura | 5/10 | 7.5/10 | CI funcional, env validation, retry DB, sem código morto |
| Dados | 6/10 | 8/10 | Paginação SQL, índice email, dados sincronizados |
| Frontend/UX | 7/10 | 8/10 | Testes de lógica, reduced-motion, deps pinadas |

**Score Consolidado: 7.8/10** (era 6.0/10)

## Débitos Remanescentes (baixa prioridade)

| ID | Débito | Prioridade | Nota |
|----|--------|:-----------:|------|
| D5 | Sem RLS no banco | P3 | tRPC middleware já protege; RLS é defesa em profundidade |
| D8 | Sem soft delete | P3 | Baixo impacto para volume atual |
| F5 | Responsividade não testada formalmente | P3 | Classes responsive presentes, sem teste E2E |
| F8 | LeadGate UX mobile | P3 | Growth hack funcional, melhoria estética |

Nenhum destes é bloqueante para produção.

---

## Próximos Passos Recomendados

1. **Rodar `pnpm run db:push`** no ambiente de staging para aplicar o novo índice
2. **Testar manualmente** a página de admin/leads com paginação
3. **Configurar secrets** no GitHub para o CI (DATABASE_URL se quiser testes de integração futuramente)
4. **Considerar E2E tests** com Playwright para fluxos críticos (registro, precificação, login)
